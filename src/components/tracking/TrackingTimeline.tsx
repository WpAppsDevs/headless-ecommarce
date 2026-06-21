import { TrackingStatus } from './TrackingStatus';
import type { TrackingEvent } from '@/lib/api/tracking';

interface TrackingTimelineProps {
  events: TrackingEvent[];
  currentStatus: string;
}

export function TrackingTimeline({ events, currentStatus }: TrackingTimelineProps) {
  if (events.length === 0) return null;

  // Determine which events are completed based on timeline
  const completedStatuses = events.map(e => e.status.toLowerCase());

  return (
    <div className="rounded-2xl border border-zinc-200 bg-white p-6 shadow-sm">
      <div className="flex items-center gap-2 mb-6">
        <svg className="h-5 w-5 text-zinc-600" fill="none" viewBox="0 0 24 24" stroke="currentColor" strokeWidth={2}>
          <path strokeLinecap="round" strokeLinejoin="round" d="M9 5H7a2 2 0 00-2 2v12a2 2 0 002 2h10a2 2 0 002-2V7a2 2 0 00-2-2h-2M9 5a2 2 0 002 2h2a2 2 0 002-2M9 5a2 2 0 012-2h2a2 2 0 012 2" />
        </svg>
        <h3 className="text-lg font-semibold text-zinc-900">Order Timeline</h3>
      </div>

      <div className="relative">
        {events.map((event, index) => {
          const isCompleted = index === events.length - 1 || completedStatuses.includes(event.status.toLowerCase());
          return (
            <TrackingStatus
              key={`${event.status}-${index}`}
              status={event.status}
              date={event.date}
              isCompleted={isCompleted}
              isLast={index === events.length - 1}
            />
          );
        })}
      </div>

      {/* Current Status Banner */}
      <div className="mt-4 pt-4 border-t border-zinc-100">
        <p className="text-sm text-zinc-600">
          Current Status:{' '}
          <span className="font-semibold text-zinc-900 capitalize">{currentStatus}</span>
        </p>
      </div>
    </div>
  );
}
