"use client";

import { createContext, useContext, useState } from "react";

type SearchState = { query: string; setQuery: (query: string) => void };

const SearchContext = createContext<SearchState>({
  query: "",
  setQuery: () => {},
});

/** The top-bar search box and the publisher table share one query through this context. */
export function SearchProvider({ children }: { children: React.ReactNode }) {
  const [query, setQuery] = useState("");
  return (
    <SearchContext.Provider value={{ query, setQuery }}>
      {children}
    </SearchContext.Provider>
  );
}

export function useSearch(): SearchState {
  return useContext(SearchContext);
}
