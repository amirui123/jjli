import Link from "next/link";
import { Event } from "@/lib/types";
import { getTimeOfDay } from "@/lib/utils";
import EventCard from "./EventCard";

interface EventListProps {
  events: Event[];
  citySlug: string;
}

export default function EventList({ events, citySlug }: EventListProps) {
  const afternoon = events.filter((e) => getTimeOfDay(e.start_time) === "afternoon");
  const evening = events.filter((e) => getTimeOfDay(e.start_time) === "evening");
  const lateNight = events.filter((e) => getTimeOfDay(e.start_time) === "late-night");

  const sections = [
    { label: "Afternoon", events: afternoon },
    { label: "Evening", events: evening },
    { label: "Late Night", events: lateNight },
  ].filter((s) => s.events.length > 0);

  if (events.length === 0) {
    return (
      <div className="text-center py-16">
        <p className="text-text-muted text-lg">No shows found</p>
        <p className="text-text-subtle text-sm mt-2">
          Try adjusting your filters or{" "}
          <Link href={`/${citySlug}/map`} className="text-accent hover:text-accent-hover transition-colors underline underline-offset-2">
            browse the map
          </Link>
        </p>
      </div>
    );
  }

  return (
    <div className="space-y-10">
      {sections.map((section) => (
        <div key={section.label}>
          <h2 className="text-sm uppercase tracking-wider text-text-muted mb-4">
            {section.label}
          </h2>
          <div className="grid gap-3 sm:grid-cols-2 lg:grid-cols-3">
            {section.events
              .sort((a, b) => a.start_time.localeCompare(b.start_time))
              .map((event) => (
                <EventCard key={event.id} event={event} citySlug={citySlug} />
              ))}
          </div>
        </div>
      ))}
    </div>
  );
}
