'use client';

import { useMemo } from 'react';
import { Music } from 'lucide-react';
import { City, Event } from '@/lib/types';
import { getTimeOfDay, getDateLabel, formatDateFull } from '@/lib/utils';
import { useFilterParams } from '@/lib/useFilterParams';
import FilterBar from '@/components/FilterBar';
import EventCard from '@/components/EventCard';
import FeaturedVenues from '@/components/FeaturedVenues';

interface GroupedListingsViewProps {
  city: City;
  events: Event[];
  title: string;
  dateRange: string;
  showLabel: string;
}

export default function GroupedListingsView({
  city,
  events,
  title,
  dateRange,
  showLabel,
}: GroupedListingsViewProps) {
  const {
    activeRegions,
    activeTimes,
    toggleRegion,
    toggleTime,
    clearRegions,
    clearTimes,
  } = useFilterParams();

  const featuredVenues = useMemo(() => {
    const seen = new Set<string>();
    return events
      .filter((e) => {
        if (e.venue.sponsor_tier === 'free') return false;
        if (seen.has(e.venue.id)) return false;
        seen.add(e.venue.id);
        return true;
      })
      .map((e) => e.venue);
  }, [events]);

  const filteredEvents = useMemo(() => {
    return events
      .filter((e) => activeRegions.size === 0 || activeRegions.has(e.venue.region))
      .filter((e) => activeTimes.size === 0 || activeTimes.has(getTimeOfDay(e.start_time)));
  }, [events, activeRegions, activeTimes]);

  const eventsByDate = useMemo(() => {
    return filteredEvents.reduce<Record<string, Event[]>>((acc, event) => {
      if (!acc[event.date]) acc[event.date] = [];
      acc[event.date].push(event);
      return acc;
    }, {});
  }, [filteredEvents]);

  return (
    <div className="max-w-7xl mx-auto px-4 sm:px-6 py-8">
      <div className="flex flex-col sm:flex-row sm:items-end sm:justify-between gap-6 mb-8">
        <div>
          <h1 className="font-serif text-3xl sm:text-4xl text-text text-balance">
            {title} in <span className="text-accent">{city.name}</span>
          </h1>
          <p className="text-text-muted mt-2">
            <span className="font-mono text-sm">{dateRange}</span>
          </p>
        </div>
        {featuredVenues.length > 0 && (
          <FeaturedVenues venues={featuredVenues} citySlug={city.slug} />
        )}
      </div>

      <div className="mb-8">
        <FilterBar
          city={city}
          activeRegions={activeRegions}
          activeTimes={activeTimes}
          onRegionToggle={toggleRegion}
          onTimeToggle={toggleTime}
          onClearRegions={clearRegions}
          onClearTimes={clearTimes}
        />
      </div>

      <div className="flex items-center gap-2 mb-6 text-sm text-text-muted">
        <Music className="w-4 h-4" aria-hidden="true" />
        <span>
          {filteredEvents.length}{' '}
          {filteredEvents.length === 1 ? 'show' : 'shows'} {showLabel}
        </span>
      </div>

      {Object.keys(eventsByDate).length === 0 ? (
        <div className="text-center py-16">
          <p className="text-text-muted text-lg">No shows found {showLabel}</p>
          <p className="text-text-subtle text-sm mt-2">
            Try adjusting your filters
          </p>
        </div>
      ) : (
        <div className="space-y-10">
          {Object.entries(eventsByDate)
            .sort(([a], [b]) => a.localeCompare(b))
            .map(([date, dateEvents]) => (
              <div key={date}>
                <h2 className="text-sm text-text-muted mb-4">
                  <span className="uppercase tracking-wider">
                    {getDateLabel(date)}
                  </span>
                  <span className="text-text-subtle mx-1.5">/</span>
                  <span className="font-mono">{formatDateFull(date)}</span>
                </h2>
                <div className="grid gap-3 sm:grid-cols-2 lg:grid-cols-3">
                  {dateEvents
                    .sort((a, b) => a.start_time.localeCompare(b.start_time))
                    .map((event) => (
                      <EventCard
                        key={event.id}
                        event={event}
                        citySlug={city.slug}
                      />
                    ))}
                </div>
              </div>
            ))}
        </div>
      )}
    </div>
  );
}
