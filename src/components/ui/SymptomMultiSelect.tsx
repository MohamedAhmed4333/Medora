import { useState, useRef, useEffect } from "react";
import { X, Search, ChevronDown } from "lucide-react";

interface SymptomMultiSelectProps {
  symptoms: string[];
  selectedSymptoms: string[];
  onChange: (symptoms: string[]) => void;
}

export function SymptomMultiSelect({ symptoms, selectedSymptoms, onChange }: SymptomMultiSelectProps) {
  const [query, setQuery] = useState("");
  const [isOpen, setIsOpen] = useState(false);
  const [highlightedIndex, setHighlightedIndex] = useState(0);
  const wrapperRef = useRef<HTMLDivElement>(null);
  const inputRef = useRef<HTMLInputElement>(null);

  const filteredSymptoms = symptoms.filter(
    (s) =>
      !selectedSymptoms.includes(s) &&
      s.toLowerCase().includes(query.toLowerCase())
  );

  useEffect(() => {
    function handleClickOutside(e: MouseEvent) {
      if (wrapperRef.current && !wrapperRef.current.contains(e.target as Node)) {
        setIsOpen(false);
      }
    }
    document.addEventListener("mousedown", handleClickOutside);
    return () => document.removeEventListener("mousedown", handleClickOutside);
  }, []);

  const addSymptom = (s: string) => {
    onChange([...selectedSymptoms, s]);
    setQuery("");
    setHighlightedIndex(0);
    inputRef.current?.focus();
  };

  const removeSymptom = (s: string) => {
    onChange(selectedSymptoms.filter((item) => item !== s));
  };

  const handleKeyDown = (e: React.KeyboardEvent<HTMLInputElement>) => {
    if (e.key === "ArrowDown") {
      e.preventDefault();
      setHighlightedIndex((prev) => Math.min(prev + 1, filteredSymptoms.length - 1));
    } else if (e.key === "ArrowUp") {
      e.preventDefault();
      setHighlightedIndex((prev) => Math.max(prev - 1, 0));
    } else if (e.key === "Enter") {
      e.preventDefault();
      if (filteredSymptoms[highlightedIndex]) {
        addSymptom(filteredSymptoms[highlightedIndex]);
      }
    } else if (e.key === "Backspace" && query === "" && selectedSymptoms.length > 0) {
      removeSymptom(selectedSymptoms[selectedSymptoms.length - 1]);
    } else if (e.key === "Escape") {
      setIsOpen(false);
    }
  };

  return (
    <div ref={wrapperRef} className="relative mb-6">
      <div
        className="flex flex-wrap items-center gap-2 w-full min-h-[46px] rounded-xl bg-muted/50 border border-border px-3 py-2 focus-within:border-medical-teal transition-colors cursor-text"
        onClick={() => {
          setIsOpen(true);
          inputRef.current?.focus();
        }}
      >
        <Search className="h-4 w-4 text-muted-foreground shrink-0" />

        {selectedSymptoms.map((s) => (
          <span
            key={s}
            className="flex items-center gap-1 pl-3 pr-1.5 py-1 rounded-full text-sm font-medium bg-primary text-primary-foreground"
          >
            {s}
            <button
              type="button"
              onClick={(e) => {
                e.stopPropagation();
                removeSymptom(s);
              }}
              className="rounded-full hover:bg-primary-foreground/20 p-0.5 transition-colors"
            >
              <X className="h-3 w-3" />
            </button>
          </span>
        ))}

        <input
          ref={inputRef}
          value={query}
          onChange={(e) => {
            setQuery(e.target.value);
            setHighlightedIndex(0);
            setIsOpen(true);
          }}
          onFocus={() => setIsOpen(true)}
          onKeyDown={handleKeyDown}
          placeholder={selectedSymptoms.length === 0 ? "Select Your Symptoms...." : ""}
          className="flex-1 min-w-[120px] bg-transparent text-sm text-foreground placeholder:text-muted-foreground focus:outline-none"
        />

        <ChevronDown
          className={`h-4 w-4 text-muted-foreground shrink-0 transition-transform ${isOpen ? "rotate-180" : ""}`}
        />
      </div>

      {isOpen && filteredSymptoms.length > 0 && (
        <div className="absolute z-10 mt-2 w-full max-h-56 overflow-y-auto rounded-xl bg-card border border-border shadow-card p-1.5">
          {filteredSymptoms.map((s, idx) => (
            <button
              key={s}
              type="button"
              onClick={() => addSymptom(s)}
              onMouseEnter={() => setHighlightedIndex(idx)}
              className={`w-full text-right px-3 py-2 rounded-lg text-sm transition-colors ${
                idx === highlightedIndex
                  ? "bg-primary/10 text-primary"
                  : "text-foreground hover:bg-muted"
              }`}
            >
              {s}
            </button>
          ))}
        </div>
      )}

      {isOpen && query && filteredSymptoms.length === 0 && (
        <div className="absolute z-10 mt-2 w-full rounded-xl bg-card border border-border shadow-card p-3 text-sm text-muted-foreground text-center">
          مفيش نتائج مطابقة
        </div>
      )}
    </div>
  );
}