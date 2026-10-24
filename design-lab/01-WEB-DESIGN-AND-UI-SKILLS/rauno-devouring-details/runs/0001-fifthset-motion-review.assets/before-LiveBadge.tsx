'use client';

import { useState, useEffect } from 'react';
import { Event } from '@/lib/types';
import { isLiveNow } from '@/lib/utils';

export default function LiveBadge({
  event,
  timezone,
  isFeatured,
}: {
  event: Event;
  timezone: string;
  isFeatured: boolean;
}) {
  const [live, setLive] = useState(false);

  useEffect(() => {
    setLive(isLiveNow(event, timezone));
    const interval = setInterval(() => {
      setLive(isLiveNow(event, timezone));
    }, 60_000);
    return () => clearInterval(interval);
  }, [event, timezone]);

  if (!live && !isFeatured) return null;

  if (live) {
    return (
      <div role="status" aria-live="polite" className="absolute top-6.5 right-4 flex items-center gap-1.5">
        <span className="w-2 h-2 rounded-full bg-live animate-pulse-live" aria-hidden="true" />
        <span className="text-xs font-medium text-live uppercase tracking-wider">
          Live Now
        </span>
      </div>
    );
  }

  return (
    <div className="absolute top-6.5 right-4 flex items-center gap-1.5">
      <span className="w-2 h-2 rounded-full bg-accent animate-pulse-live" aria-hidden="true" />
      <span className="text-xs font-medium text-accent/70 uppercase tracking-wider">
        Featured
      </span>
    </div>
  );
}
