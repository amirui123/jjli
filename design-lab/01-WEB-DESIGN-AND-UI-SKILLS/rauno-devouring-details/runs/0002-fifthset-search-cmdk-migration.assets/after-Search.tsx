"use client";

import { useState, useEffect, useMemo } from "react";
import { useParams, useRouter } from "next/navigation";
import { Search as SearchIcon } from "lucide-react";
import { createClient } from "@/lib/supabase/client";
import {
  Command,
  CommandDialog,
  CommandEmpty,
  CommandGroup,
  CommandInput,
  CommandItem,
  CommandList,
} from "@/components/ui/command";

export default function Search() {
  const [open, setOpen] = useState(false);
  const [query, setQuery] = useState("");
  const [results, setResults] = useState<{
    venues: { name: string; slug: string; neighborhood: string }[];
    artists: { name: string; slug: string }[];
  }>({ venues: [], artists: [] });
  const params = useParams();
  const router = useRouter();
  const citySlug = (params.city as string) || "nyc";
  const supabase = useMemo(() => createClient(), []);

  useEffect(() => {
    const handler = (e: KeyboardEvent) => {
      if ((e.metaKey || e.ctrlKey) && e.key === "k") {
        e.preventDefault();
        setOpen(true);
      }
    };
    window.addEventListener("keydown", handler);
    return () => window.removeEventListener("keydown", handler);
  }, []);

  useEffect(() => {
    if (!open) {
      setQuery("");
      setResults({ venues: [], artists: [] });
    }
  }, [open]);

  useEffect(() => {
    if (query.length < 2) {
      setResults({ venues: [], artists: [] });
      return;
    }
    const timeout = setTimeout(async () => {
      const escaped = query.replace(/[%_\\]/g, (c) => `\\${c}`);
      const [venueRes, artistRes] = await Promise.all([
        supabase
          .from("venues")
          .select("name, slug, neighborhood, cities!inner(slug)")
          .eq("cities.slug", citySlug)
          .ilike("name", `%${escaped}%`)
          .limit(5),
        supabase
          .from("artists")
          .select("name, slug")
          .ilike("name", `%${escaped}%`)
          .limit(5),
      ]);
      setResults({
        venues: (venueRes.data || []).map((v: Record<string, unknown>) => ({
          name: v.name as string,
          slug: v.slug as string,
          neighborhood: (v.neighborhood as string) || "",
        })),
        artists: (artistRes.data || []).map((a: Record<string, unknown>) => ({
          name: a.name as string,
          slug: a.slug as string,
        })),
      });
    }, 200);
    return () => clearTimeout(timeout);
  }, [query, citySlug, supabase]);

  return (
    <>
      <button
        onClick={() => setOpen(true)}
        aria-label="Search"
        className="flex items-center gap-2 px-3 py-3 sm:py-1.5 text-sm text-text-muted hover:text-text bg-surface rounded-lg transition-colors"
      >
        <SearchIcon className="w-4 h-4" aria-hidden="true" />
        <span>Search</span>
        <kbd className="hidden sm:inline text-xs text-text-muted/60 ml-1">⌘K</kbd>
      </button>

      <CommandDialog
        open={open}
        onOpenChange={setOpen}
        title="Search"
        description="Search venues and artists"
        className="top-[20%]"
      >
        <Command shouldFilter={false}>
          <CommandInput
            placeholder="Search venues and artists..."
            value={query}
            onValueChange={setQuery}
          />
          <CommandList>
            <CommandEmpty className="text-text-muted">
              {query.length < 2
                ? "Type to search venues and artists"
                : `No results for "${query}"`}
            </CommandEmpty>
            {results.venues.length > 0 && (
              <CommandGroup heading="Venues">
                {results.venues.map((v) => (
                  <CommandItem
                    key={v.slug}
                    value={v.slug}
                    onSelect={() => {
                      setOpen(false);
                      router.push(`/${citySlug}/venues/${v.slug}`);
                    }}
                    className="min-h-11"
                  >
                    <span className="text-text">{v.name}</span>
                    {v.neighborhood && (
                      <span className="text-text-muted ml-2 text-xs">
                        {v.neighborhood}
                      </span>
                    )}
                  </CommandItem>
                ))}
              </CommandGroup>
            )}
            {results.artists.length > 0 && (
              <CommandGroup heading="Artists">
                {results.artists.map((a) => (
                  <CommandItem
                    key={a.slug}
                    value={a.slug}
                    onSelect={() => {
                      setOpen(false);
                      router.push(`/${citySlug}/artists/${a.slug}`);
                    }}
                    className="min-h-11"
                  >
                    <span className="text-text">{a.name}</span>
                  </CommandItem>
                ))}
              </CommandGroup>
            )}
          </CommandList>
        </Command>
      </CommandDialog>
    </>
  );
}
