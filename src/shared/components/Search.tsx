import { useState, useRef, useEffect } from "react";
import { Icons } from "../icons/Icons";

// ── Types ──────────────────────────────────────────────
export type SearchResult = {
  id: string | number;
  label: string;
  sublabel?: string;
  category?: string;
  badge?: string;       // e.g. blood type badge
  badgeColor?: string;  // tailwind bg class e.g. "bg-primary"
};

interface UniversalSearchProps {
  /** Placeholder text */
  placeholder?: string;
  /** All searchable items */
  items: SearchResult[];
  /** Fires when user picks a result */
  onSelect?: (item: SearchResult) => void;
  /** Fires on every keystroke */
  onChange?: (query: string) => void;
  /** Fires on Enter or search button click */
  onSearch?: (query: string) => void;
  /** Show the search button */
  showButton?: boolean;
  /** Debounce delay in ms */
  debounce?: number;
  /** Max dropdown results to show */
  maxResults?: number;
  /** Disable dropdown, just a plain input */
  dropdownDisabled?: boolean;
  /** Extra className on the root wrapper */
  className?: string;
  /** Size variant */
  size?: "sm" | "md" | "lg";
}

// ── Sizes ──────────────────────────────────────────────
const sizeMap = {
  sm: { input: "text-xs px-3 py-2",    icon: "w-3.5 h-3.5", btn: "px-3 py-2 text-xs" },
  md: { input: "text-sm px-4 py-3",    icon: "w-4 h-4",     btn: "px-4 py-3 text-sm" },
  lg: { input: "text-base px-5 py-3.5",icon: "w-5 h-5",     btn: "px-5 py-3.5 text-sm" },
};

// ── Highlight matching text ────────────────────────────
const Highlight = ({ text, query }: { text: string; query: string }) => {
  if (!query.trim()) return <>{text}</>;
  const parts = text.split(new RegExp(`(${query})`, "gi"));
  return (
    <>
      {parts.map((part, i) =>
        part.toLowerCase() === query.toLowerCase() ? (
          <mark key={i} className="bg-primary/20 text-primary font-semibold rounded-sm px-0.5">
            {part}
          </mark>
        ) : (
          <span key={i}>{part}</span>
        )
      )}
    </>
  );
};

// ── Component ──────────────────────────────────────────
const Search = ({
  placeholder = "Search...",
  items = [],
  onSelect,
  onChange,
  onSearch,
  showButton = true,
  debounce = 200,
  maxResults = 8,
  dropdownDisabled = false,
  className = "",
  size = "md",
}: UniversalSearchProps) => {
  const [query,       setQuery]       = useState("");
  const [open,        setOpen]        = useState(false);
  const [highlighted, setHighlighted] = useState(-1);
  const inputRef  = useRef<HTMLInputElement>(null);
  const wrapRef   = useRef<HTMLDivElement>(null);
  const debounceRef = useRef<ReturnType<typeof setTimeout> | null>(null);

  const sz = sizeMap[size];

  // ── Filtered results ──────────────────────────────────
  const results: SearchResult[] = query.trim()
    ? items
        .filter(
          (item) =>
            item.label.toLowerCase().includes(query.toLowerCase()) ||
            item.sublabel?.toLowerCase().includes(query.toLowerCase()) ||
            item.category?.toLowerCase().includes(query.toLowerCase())
        )
        .slice(0, maxResults)
    : [];

  // Group by category
  const grouped = results.reduce<Record<string, SearchResult[]>>((acc, item) => {
    const cat = item.category ?? "Results";
    if (!acc[cat]) acc[cat] = [];
    acc[cat].push(item);
    return acc;
  }, {});

  // ── Handlers ──────────────────────────────────────────
  const handleChange = (e: React.ChangeEvent<HTMLInputElement>) => {
    const val = e.target.value;
    setQuery(val);
    setHighlighted(-1);
    if (!dropdownDisabled) setOpen(true);

    if (debounceRef.current) clearTimeout(debounceRef.current);
    debounceRef.current = setTimeout(() => onChange?.(val), debounce);
  };

  const handleSelect = (item: SearchResult) => {
    setQuery(item.label);
    setOpen(false);
    onSelect?.(item);
    inputRef.current?.blur();
  };

  const handleSearch = () => {
    setOpen(false);
    onSearch?.(query);
  };

  const handleKeyDown = (e: React.KeyboardEvent) => {
    if (!open || results.length === 0) {
      if (e.key === "Enter") handleSearch();
      return;
    }
    if (e.key === "ArrowDown") {
      e.preventDefault();
      setHighlighted((h) => Math.min(h + 1, results.length - 1));
    } else if (e.key === "ArrowUp") {
      e.preventDefault();
      setHighlighted((h) => Math.max(h - 1, 0));
    } else if (e.key === "Enter") {
      e.preventDefault();
      if (highlighted >= 0) handleSelect(results[highlighted]);
      else handleSearch();
    } else if (e.key === "Escape") {
      setOpen(false);
      setHighlighted(-1);
    }
  };

  const handleClear = () => {
    setQuery("");
    setOpen(false);
    setHighlighted(-1);
    onChange?.("");
    inputRef.current?.focus();
  };

  // Close on outside click
  useEffect(() => {
    const handler = (e: MouseEvent) => {
      if (wrapRef.current && !wrapRef.current.contains(e.target as Node)) {
        setOpen(false);
      }
    };
    document.addEventListener("mousedown", handler);
    return () => document.removeEventListener("mousedown", handler);
  }, []);

  // ── Render ────────────────────────────────────────────
  return (
    <div ref={wrapRef} className={`relative w-full ${className}`}>

      {/* Input row */}
      <div className={`flex items-center bg-white rounded-xs shadow-md
        ring-2 transition-all duration-200
        ${open ? "ring-primary/40" : "ring-transparent"}`}>

        {/* Search icon */}
        <span className="pl-3 sm:pl-4 shrink-0 text-gray-400">
          <Icons.Search className={sz.icon} />
        </span>

        {/* Input */}
        <input
          ref={inputRef}
          type="text"
          value={query}
          onChange={handleChange}
          onFocus={() => { if (!dropdownDisabled && query) setOpen(true); }}
          onKeyDown={handleKeyDown}
          placeholder={placeholder}
          className={`flex-1 outline-none bg-transparent ${sz.input}
            text-dark placeholder-gray-400 min-w-0`}
          autoComplete="off"
        />

        {/* Clear button */}
        {query && (
          <button
            onClick={handleClear}
            className="shrink-0 px-2 text-gray-300 hover:text-gray-500 transition-colors"
          >
            <Icons.Close className="w-3.5 h-3.5" />
          </button>
        )}

        {/* Search button */}
        {showButton && (
          <button
            onClick={handleSearch}
            className={`shrink-0 bg-primary text-white font-semibold
              rounded-r-xs hover:bg-red-700 active:scale-95
              transition-all duration-200 ${sz.btn}`}
          >
            Search
          </button>
        )}
      </div>

      {/* ── Dropdown ── */}
      {open && !dropdownDisabled && results.length > 0 && (
        <div className="absolute top-full left-0 right-0 mt-1.5
          bg-white rounded-xs shadow-xl z-50 overflow-hidden
          border border-gray-100 animate-in fade-in slide-in-from-top-1 duration-150">

          {Object.entries(grouped).map(([category, categoryItems]) => (
            <div key={category}>
              {/* Category label */}
              {Object.keys(grouped).length > 1 && (
                <div className="px-4 py-2 bg-gray-50 border-b border-gray-100">
                  <span className="text-xxs font-bold uppercase tracking-widest text-gray-400">
                    {category}
                  </span>
                </div>
              )}

              {categoryItems.map((item, globalIndex) => {
                const flatIndex = results.indexOf(item);
                const isActive  = flatIndex === highlighted;
                return (
                  <button
                    key={item.id}
                    onMouseDown={() => handleSelect(item)}
                    onMouseEnter={() => setHighlighted(flatIndex)}
                    className={`w-full flex items-center justify-between gap-3
                      px-4 py-3 text-left transition-colors duration-100
                      ${isActive ? "bg-red-50" : "hover:bg-gray-50"}
                      ${globalIndex < categoryItems.length - 1 ? "border-b border-gray-50" : ""}`}
                  >
                    <div className="flex items-center gap-3 min-w-0">
                      {/* Search icon per row */}
                      <Icons.Search className="w-3.5 h-3.5 text-gray-300 shrink-0" />

                      <div className="min-w-0">
                        <p className={`text-sm font-medium truncate
                          ${isActive ? "text-primary" : "text-dark"}`}>
                          <Highlight text={item.label} query={query} />
                        </p>
                        {item.sublabel && (
                          <p className="text-xs text-gray-400 truncate mt-0.5">
                            <Highlight text={item.sublabel} query={query} />
                          </p>
                        )}
                      </div>
                    </div>

                    {/* Badge */}
                    {item.badge && (
                      <span className={`shrink-0 text-xxs font-bold px-2 py-0.5
                        rounded-full text-white
                        ${item.badgeColor ?? "bg-primary"}`}>
                        {item.badge}
                      </span>
                    )}
                  </button>
                );
              })}
            </div>
          ))}

          {/* Footer hint */}
          <div className="px-4 py-2 bg-gray-50 border-t border-gray-100
            flex items-center justify-between">
            <span className="text-xxs text-gray-400">
              {results.length} result{results.length !== 1 ? "s" : ""}
            </span>
            <span className="text-xxs text-gray-300 hidden sm:block">
              ↑↓ navigate · Enter select · Esc close
            </span>
          </div>
        </div>
      )}

      {/* No results dropdown */}
      {open && !dropdownDisabled && query.trim() !== "" && results.length === 0 && (
        <div className="absolute top-full left-0 right-0 mt-1.5
          bg-white rounded-xs shadow-xl z-50 overflow-hidden border border-gray-100">
          <div className="px-4 py-5 text-center">
            <p className="text-sm text-gray-500">
              No results for <span className="font-semibold text-dark">"{query}"</span>
            </p>
            <p className="text-xs text-gray-400 mt-1">
              Try a different name, location, or blood type
            </p>
          </div>
        </div>
      )}
    </div>
  );
};

export default Search;