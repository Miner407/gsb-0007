import { useMemo } from 'react';
import { Target } from 'lucide-react';
import { WEEKDAY_NAMES } from '@/types';
import { getToday, getStartOfWeek, getDayOfWeek, addDays } from '@/utils/date';

interface Props {
  count: number;
  target?: number;
  checkins: { date: string }[];
}

export function WeeklyStats({ count, target = 4, checkins }: Props) {
  const today = getToday();
  const startOfWeek = getStartOfWeek(today);
  const todayIndex = getDayOfWeek(today);

  const weekDays = useMemo(() => {
    return Array.from({ length: 7 }, (_, i) => {
      const date = addDays(startOfWeek, i);
      const hasCheckin = checkins.some((c) => c.date === date);
      const isToday = i === todayIndex;
      const isPast = i <= todayIndex;
      return {
        name: WEEKDAY_NAMES[i],
        date,
        hasCheckin,
        isToday,
        isPast,
      };
    });
  }, [startOfWeek, checkins, todayIndex]);

  const progress = Math.min((count / target) * 100, 100);

  return (
    <div className="card p-6">
      <div className="flex items-start justify-between mb-5">
        <div>
          <p className="text-text-muted text-sm mb-1">本周训练</p>
          <div className="flex items-baseline gap-2">
            <span className="text-5xl font-display text-text">{count}</span>
            <span className="text-xl text-text-muted">/ {target} 次</span>
          </div>
        </div>
        <div className="w-14 h-14 rounded-2xl bg-gold/10 flex items-center justify-center">
          <Target className="w-7 h-7 text-gold" />
        </div>
      </div>

      <div className="progress-bar mb-5">
        <div className="progress-bar-fill" style={{ width: `${progress}%` }} />
      </div>

      <div className="grid grid-cols-7 gap-1.5">
        {weekDays.map((day) => (
          <div key={day.date} className="flex flex-col items-center gap-1.5">
            <div
              className={`w-full aspect-square rounded-lg flex items-center justify-center transition-all duration-200 ${
                day.hasCheckin
                  ? 'bg-accent text-white shadow-glow'
                  : day.isToday
                  ? 'bg-bg-tertiary border-2 border-accent/50 text-accent'
                  : day.isPast
                  ? 'bg-bg-tertiary/50 text-text-dim'
                  : 'bg-bg-tertiary/30 text-text-dim'
              }`}
            >
              <span className="text-xs font-semibold">{day.name.slice(-1)}</span>
            </div>
          </div>
        ))}
      </div>
    </div>
  );
}
