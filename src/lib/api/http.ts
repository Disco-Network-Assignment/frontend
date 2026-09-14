/** Minimal typed fetch wrapper shared by every API client. */

export class ApiError extends Error {
  constructor(
    readonly status: number,
    readonly body: string,
  ) {
    super(`${status} ${body}`.trim());
    this.name = "ApiError";
  }
}

export async function request<T>(
  baseUrl: string,
  path: string,
  init?: RequestInit,
): Promise<T> {
  const res = await fetch(baseUrl + path, {
    ...init,
    headers: { "content-type": "application/json", ...init?.headers },
  });
  if (!res.ok) throw new ApiError(res.status, (await res.text()).slice(0, 300));
  return (await res.json()) as T;
}

/**
 * POST and read an `application/x-ndjson` response line by line, calling `onLine` with each
 * parsed object as soon as it arrives. Resolves when the stream ends; rejects on a non-2xx
 * status or when `signal` aborts.
 */
export async function requestNdjson<T>(
  baseUrl: string,
  path: string,
  body: unknown,
  onLine: (line: T) => void,
  signal?: AbortSignal,
): Promise<void> {
  const res = await fetch(baseUrl + path, {
    method: "POST",
    headers: { "content-type": "application/json" },
    body: JSON.stringify(body),
    signal,
  });
  if (!res.ok || !res.body)
    throw new ApiError(res.status, (await res.text()).slice(0, 300));
  const parser = new NdjsonParser<T>(onLine);
  const reader = res.body.getReader();
  const decoder = new TextDecoder();
  for (;;) {
    const { value, done } = await reader.read();
    if (done) break;
    parser.push(decoder.decode(value, { stream: true }));
  }
  parser.flush();
}

/** Splits an arbitrary chunk stream into JSON lines. Pure, so it is unit-tested on its own. */
export class NdjsonParser<T> {
  private buffer = "";

  constructor(private readonly onLine: (line: T) => void) {}

  push(chunk: string): void {
    this.buffer += chunk;
    let newline = this.buffer.indexOf("\n");
    while (newline >= 0) {
      this.emit(this.buffer.slice(0, newline));
      this.buffer = this.buffer.slice(newline + 1);
      newline = this.buffer.indexOf("\n");
    }
  }

  flush(): void {
    this.emit(this.buffer);
    this.buffer = "";
  }

  private emit(raw: string): void {
    const line = raw.trim();
    if (line) this.onLine(JSON.parse(line) as T);
  }
}
