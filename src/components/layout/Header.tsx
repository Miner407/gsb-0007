import { Dumbbell } from 'lucide-react';
import { formatDateDisplay, getWeekdayName, getToday } from '@/utils/date';

export function Header() {
  const today = getToday();
  return (
    <header className="md:hidden sticky top-0 z-40 bg-bg-secondary/95 backdrop-blur-xl border-b border-bg-tertiary">
      <div className="flex items-center justify-between px-4 py-3">
        <div className="flex items-center gap-2">
          <div className="w-8 h-8 rounded-lg bg-gradient-to-br from-accent to-accent-hover flex items-center justify-center">
            <Dumbbell className="w-5 h-5 text-white" />
          </div>
          <h1 className="font-display text-xl tracking-wide gradient-text">FIT TRACK</h1>
        </div>
        <div className="text-right">
          <p className="text-sm font-medium text-text">{formatDateDisplay(today)}</p>
          <p className="text-xs text-text-muted">{getWeekdayName(today)}</p>
        </div>
      </div>
    </header>
  );
}
