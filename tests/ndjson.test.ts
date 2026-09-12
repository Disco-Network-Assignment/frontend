import { describe, expect, it } from "vitest";
import { NdjsonParser } from "@/lib/api/http";

describe("NdjsonParser", () => {
  it("emits one object per line regardless of chunk boundaries", () => {
    const seen: unknown[] = [];
    const parser = new NdjsonParser<{ n: number }>((line) => seen.push(line));
    parser.push('{"n":1}\n{"n":');
    parser.push('2}\n{"n":3}');
    expect(seen).toEqual([{ n: 1 }, { n: 2 }]);
    parser.flush();
    expect(seen).toEqual([{ n: 1 }, { n: 2 }, { n: 3 }]);
  });

  it("ignores blank lines", () => {
    const seen: unknown[] = [];
    const parser = new NdjsonParser<{ n: number }>((line) => seen.push(line));
    parser.push('\n\n{"n":1}\n\n');
    parser.flush();
    expect(seen).toEqual([{ n: 1 }]);
  });

  it("surfaces malformed JSON instead of swallowing it", () => {
    const parser = new NdjsonParser(() => undefined);
    expect(() => parser.push("not json\n")).toThrow();
  });
});
