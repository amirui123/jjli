"use client";

import { useState, useEffect } from "react";
import { useRouter } from "next/navigation";
import { Star } from "lucide-react";
import { createClient } from "@/lib/supabase/client";
import { toggleFavorite } from "@/lib/supabase/queries";
import { cn } from "@/lib/utils";

interface StarButtonProps {
  type: "venue" | "event";
  id: string;
  initialStarred?: boolean;
}

export default function StarButton({ type, id, initialStarred = false }: StarButtonProps) {
  const [starred, setStarred] = useState(initialStarred);
  const [loading, setLoading] = useState(false);
  const router = useRouter();

  useEffect(() => {
    setStarred(initialStarred);
  }, [initialStarred]);

  async function handleToggle(e: React.MouseEvent) {
    e.preventDefault();
    e.stopPropagation();

    const supabase = createClient();
    const { data: { user } } = await supabase.auth.getUser();

    if (!user) {
      router.push("/login");
      return;
    }

    setLoading(true);
    try {
      const result = await toggleFavorite(supabase, user.id, {
        venueId: type === "venue" ? id : undefined,
        eventId: type === "event" ? id : undefined,
      });
      setStarred(result);
    } finally {
      setLoading(false);
    }
  }

  return (
    <button
      onClick={handleToggle}
      disabled={loading}
      aria-label={starred ? "Remove from saved" : "Save"}
      aria-pressed={starred}
      className={cn(
        "p-2.5 rounded-full transition-all min-w-[44px] min-h-[44px] flex items-center justify-center",
        starred
          ? "text-accent"
          : "text-text-muted/40 hover:text-text-muted",
        loading && "opacity-50 pointer-events-none",
      )}
    >
      <Star
        aria-hidden="true"
        className={cn(
          "w-4 h-4 transition-all",
          starred && "fill-accent",
        )}
      />
    </button>
  );
}
