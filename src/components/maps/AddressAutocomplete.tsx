"use client";

import { useEffect, useRef, useState } from "react";

interface Props {
  value: string;
  onChange: (value: string) => void;
  onSelect: (data: {
    address: string;
    lat: number;
    lng: number;
  }) => void;
}

interface NominatimResult {
  place_id: number;
  display_name: string;
  lat: string;
  lon: string;
}

// Nominatim free tier is India-only here, but Kanpur Nagar / Kanpur Dehat
// addresses sometimes don't surface with a plain query — biasing the
// viewbox around Kanpur and using bounded=0 (bias, not hard filter) helps
// recall without excluding results outside the box.
const KANPUR_VIEWBOX = "79.6,26.7,80.6,26.2"; // left,top,right,bottom
const MIN_QUERY_LENGTH = 3;
const DEBOUNCE_MS = 400;

export default function AddressAutocomplete({ value, onChange, onSelect }: Props) {
  const [results, setResults] = useState<NominatimResult[]>([]);
  const [loading, setLoading] = useState(false);
  const [searchFailed, setSearchFailed] = useState(false);
  const [isOpen, setIsOpen] = useState(false);
  const [highlightedIndex, setHighlightedIndex] = useState(-1);

  const containerRef = useRef<HTMLDivElement>(null);
  const abortControllerRef = useRef<AbortController | null>(null);
  const debounceTimerRef = useRef<ReturnType<typeof setTimeout> | null>(null);

  // Close the dropdown when clicking anywhere outside the component.
  useEffect(() => {
    function handleClickOutside(e: MouseEvent) {
      if (containerRef.current && !containerRef.current.contains(e.target as Node)) {
        setIsOpen(false);
      }
    }
    document.addEventListener("mousedown", handleClickOutside);
    return () => document.removeEventListener("mousedown", handleClickOutside);
  }, []);

  // Clean up any in-flight request / pending debounce on unmount.
  useEffect(() => {
    return () => {
      abortControllerRef.current?.abort();
      if (debounceTimerRef.current) clearTimeout(debounceTimerRef.current);
    };
  }, []);

  async function searchAddress(query: string) {
    // Cancel whatever was in flight before starting a new request.
    abortControllerRef.current?.abort();
    const controller = new AbortController();
    abortControllerRef.current = controller;

    setLoading(true);
    setSearchFailed(false);

    try {
      const res = await fetch(
        `https://nominatim.openstreetmap.org/search?format=json&q=${encodeURIComponent(
          query
        )}&countrycodes=in&limit=5&addressdetails=1&viewbox=${KANPUR_VIEWBOX}&bounded=0`,
        { signal: controller.signal }
      );

      if (!res.ok) throw new Error(`Nominatim responded with ${res.status}`);

      const data: NominatimResult[] = await res.json();
      setResults(data);
      setIsOpen(true);
      setHighlightedIndex(-1);
    } catch (error) {
      // Aborted requests are expected (debounce/unmount) — not a real failure.
      if (error instanceof DOMException && error.name === "AbortError") return;
      console.error(error);
      setResults([]);
      setSearchFailed(true);
      setIsOpen(true);
    } finally {
      // Only clear loading if this request wasn't superseded by a newer one.
      if (abortControllerRef.current === controller) {
        setLoading(false);
      }
    }
  }

  function handleInputChange(val: string) {
    onChange(val);
    setSearchFailed(false);

    if (debounceTimerRef.current) clearTimeout(debounceTimerRef.current);

    const trimmed = val.trim();
    if (trimmed.length < MIN_QUERY_LENGTH) {
      abortControllerRef.current?.abort();
      setResults([]);
      setIsOpen(false);
      setLoading(false);
      return;
    }

    debounceTimerRef.current = setTimeout(() => {
      searchAddress(trimmed);
    }, DEBOUNCE_MS);
  }

  function selectResult(item: NominatimResult) {
    onChange(item.display_name);
    setResults([]);
    setIsOpen(false);
    setHighlightedIndex(-1);

    (document.activeElement as HTMLElement)?.blur();

    onSelect({
      address: item.display_name,
      lat: parseFloat(item.lat),
      lng: parseFloat(item.lon),
    });
  }

  function handleKeyDown(e: React.KeyboardEvent<HTMLInputElement>) {
    if (!isOpen || results.length === 0) return;

    if (e.key === "ArrowDown") {
      e.preventDefault();
      setHighlightedIndex((prev) => (prev + 1) % results.length);
    } else if (e.key === "ArrowUp") {
      e.preventDefault();
      setHighlightedIndex((prev) => (prev - 1 + results.length) % results.length);
    } else if (e.key === "Enter") {
      if (highlightedIndex >= 0 && highlightedIndex < results.length) {
        e.preventDefault();
        selectResult(results[highlightedIndex]);
      }
    } else if (e.key === "Escape") {
      setIsOpen(false);
      setHighlightedIndex(-1);
    }
  }

  const trimmedValue = value.trim();
  const showEmptyState =
    !loading && !searchFailed && isOpen && trimmedValue.length >= MIN_QUERY_LENGTH && results.length === 0;
  const showErrorState = !loading && searchFailed && isOpen;
  const showResults = !loading && isOpen && results.length > 0;

  return (
    <div className="relative w-full" ref={containerRef}>

      <input
        type="text"
        value={value}
        placeholder="Search your delivery address..."
        onChange={(e) => handleInputChange(e.target.value)}
        onFocus={() => results.length > 0 && setIsOpen(true)}
        onKeyDown={handleKeyDown}
        role="combobox"
        aria-expanded={isOpen}
        aria-autocomplete="list"
        aria-controls="address-suggestions"
        className="w-full rounded-xl border border-white/10 bg-[#1B1B1B] px-4 py-3 text-white placeholder:text-gray-500 outline-none transition-all focus:border-[#F6C453] focus:ring-1 focus:ring-[#F6C453]"
      />

      {loading && (
        <div className="mt-2 text-xs text-gray-400">
          Searching address...
        </div>
      )}

      {showResults && (
        <div
          id="address-suggestions"
          role="listbox"
          className="absolute left-0 right-0 z-50 mt-2 max-h-72 overflow-y-auto rounded-xl border border-white/10 bg-[#1B1B1B] shadow-2xl"
        >

          {results.map((item, index) => (
            <button
              key={item.place_id}
              type="button"
              role="option"
              aria-selected={index === highlightedIndex}
              onMouseEnter={() => setHighlightedIndex(index)}
              onClick={() => selectResult(item)}
              className={`w-full border-b border-white/5 px-4 py-3 text-left text-sm text-white transition last:border-none ${
                index === highlightedIndex ? "bg-white/5" : "hover:bg-white/5"
              }`}
            >
              {item.display_name}
            </button>
          ))}

        </div>
      )}

      {showErrorState && (
        <div className="absolute left-0 right-0 z-50 mt-2 rounded-xl border border-white/10 bg-[#1B1B1B] p-4 text-center text-sm text-gray-400">
          Couldn&apos;t search right now. Please check your connection and try again.
        </div>
      )}

      {showEmptyState && (
        <div className="absolute left-0 right-0 z-50 mt-2 rounded-xl border border-white/10 bg-[#1B1B1B] p-4 text-center text-sm text-gray-400">
          No address found. Try adding your area or landmark.
        </div>
      )}

    </div>
  );
}