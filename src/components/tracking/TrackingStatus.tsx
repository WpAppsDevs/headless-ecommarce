import { cn } from '@/lib/utils';

interface TrackingStatusProps {
  status: string;
  date?: string;
  isCompleted: boolean;
  isLast?: boolean;
}

export function TrackingStatus({ status, date, isCompleted, isLast }: TrackingStatusProps) {
  return (
    <div className={cn('flex gap-4', !isLast && 'pb-0')}>
      {/* Timeline Line */}
      <div className="flex flex-col items-center">
        <div
          className={cn(
            'flex h-8 w-8 shrink-0 items-center justify-center rounded-full border-2',
            isCompleted
              ? 'bg-green-500 border-green-500'
              : 'bg-white border-zinc-300',
          )}
        >
          {isCompleted && (
            <svg className="h-4 w-4 text-white" fill="none" viewBox="0 0 24 24" stroke="currentColor" strokeWidth={3}>
              <path strokeLinecap="round" strokeLinejoin="round" d="M5 13l4 4L19 7" />
            </svg>
          )}
        </div>
        {!isLast && (
          <div
            className={cn(
              'w-0.5 flex-1 min-h-[40px]',
              isCompleted ? 'bg-green-300' : 'bg-zinc-200',
            )}
          />
        )}
      </div>

      {/* Status Content */}
      <div className="flex-1 pb-6">
        <p className={cn(
          'text-sm font-semibold',
          isCompleted ? 'text-zinc-900' : 'text-zinc-500',
        )}>
          {status}
        </p>
        {date && (
          <p className="text-xs text-zinc-400 mt-1">
            {new Date(date).toLocaleDateString('en-US', {
              year: 'numeric',
              month: 'short',
              day: 'numeric',
              hour: '2-digit',
              minute: '2-digit',
            })}
          </p>
        )}
      </div>
    </div>
  );
}
