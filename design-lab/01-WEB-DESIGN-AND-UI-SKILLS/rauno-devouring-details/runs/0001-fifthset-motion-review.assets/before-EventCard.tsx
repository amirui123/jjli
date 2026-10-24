import Link from 'next/link';
import { Calendar, Clock, MapPin, ExternalLink } from 'lucide-react';
import { Event } from '@/lib/types';
import { formatTime, formatDateShort, cn } from '@/lib/utils';
import { getCityBySlug } from '@/lib/cities';
import LiveBadge from '@/components/LiveBadge';
import StarButton from '@/components/StarButton';

interface EventCardProps {
  event: Event;
  citySlug: string;
  starred?: boolean;
}

export default function EventCard({ event, citySlug, starred }: EventCardProps) {
  const city = getCityBySlug(citySlug);
  const isFeatured =
    event.venue.sponsor_tier === 'marquee' ||
    event.venue.sponsor_tier === 'spotlight';
  const isBoosted = event.is_boosted;

  return (
    <div
      className={cn(
        'group relative flex flex-col bg-surface rounded-lg p-5 card-glow card-enter transition-all',
        (isFeatured || isBoosted) && 'featured-border',
      )}
    >
      <LiveBadge
        event={event}
        timezone={city?.timezone ?? 'America/New_York'}
        isFeatured={isFeatured}
      />

      {/* Top: Artist + Venue (grows to push meta down) */}
      <div className="grow">
        <Link
          href={`/${citySlug}/artists/${event.artist.slug}`}
          className="font-serif text-xl text-text hover:text-accent transition-colors pr-20 block text-pretty"
        >
          {event.artist.name}
        </Link>

        <Link
          href={`/${citySlug}/venues/${event.venue.slug}`}
          className="inline-block mt-1 text-sm text-text-muted hover:text-accent transition-colors"
        >
          {event.venue.name}
        </Link>

        {event.venue.address && (
          <p className="mt-1 text-xs text-text-subtle truncate">
            {event.venue.address}
          </p>
        )}
      </div>

      {/* Bottom: Meta + Star */}
      <div className="flex items-end justify-between gap-4 mt-3">
        <div className="flex flex-col gap-1.5 text-sm text-text-muted">
          <span className="flex items-center gap-1.5">
            <Calendar className="w-3.5 h-3.5 shrink-0" aria-hidden="true" />
            {formatDateShort(event.date)}
          </span>
          <span className="flex items-center gap-1.5">
            <Clock className="w-3.5 h-3.5 shrink-0" aria-hidden="true" />
            <span className="font-mono">
              {formatTime(event.start_time)}
              {event.end_time && ` – ${formatTime(event.end_time)}`}
            </span>
          </span>
          <span className="flex items-center gap-1.5">
            <MapPin className="w-3.5 h-3.5 shrink-0" aria-hidden="true" />
            {event.venue.neighborhood}
          </span>
        </div>
        <div className="flex items-center gap-2">
          {event.venue.website && (
            <a
              href={`${event.venue.website}${event.venue.website.includes('?') ? '&' : '?'}utm_source=fifthset&utm_medium=listing`}
              target="_blank"
              rel="noopener noreferrer"
              className="text-text-muted hover:text-accent transition-colors"
              aria-label="Tickets"
            >
              <ExternalLink className="w-4 h-4" aria-hidden="true" />
            </a>
          )}
          <StarButton type="event" id={event.id} initialStarred={starred} />
        </div>
      </div>
    </div>
  );
}
