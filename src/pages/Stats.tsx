import { useMemo } from 'react';
import { BarChart3 } from 'lucide-react';
import { useStore } from '@/store/useStore';
import { StreakCard } from '@/components/stats/StreakCard';
import { WeeklyStats } from '@/components/stats/WeeklyStats';
import { WeightChart } from '@/components/stats/WeightChart';
import { TotalCard } from '@/components/stats/TotalCard';
import {
  getToday,
  addDays,
  getStartOfWeek,
  getEndOfWeek,
  getDatesBetween,
} from '@/utils/date';

function getStreakDays(checkins: { date: string }[]) {
  if (checkins.length === 0) return 0;
  const checkinDates = new Set(checkins.map((c) => c.date));
  let streak = 0;
  let currentDate = getToday();
  if (!checkinDates.has(currentDate)) {
    currentDate = addDays(currentDate, -1);
    if (!checkinDates.has(currentDate)) return 0;
  }
  while (checkinDates.has(currentDate)) {
    streak++;
    currentDate = addDays(currentDate, -1);
  }
  return streak;
}

function getWeeklyWorkoutCount(checkins: { date: string }[]) {
  const today = getToday();
  const startOfWeek = getStartOfWeek(today);
  const endOfWeek = getEndOfWeek(today);
  const weekDates = getDatesBetween(startOfWeek, endOfWeek);
  const checkinDates = new Set(checkins.map((c) => c.date));
  return weekDates.filter((d) => checkinDates.has(d)).length;
}

export function Stats() {
  const checkins = useStore((s) => s.checkins);

  const streakDays = useMemo(() => getStreakDays(checkins), [checkins]);
  const weeklyCount = useMemo(() => getWeeklyWorkoutCount(checkins), [checkins]);
  const totalDays = checkins.length;

  return (
    <div className="space-y-6 animate-fade-in">
      <div>
        <div className="flex items-center gap-2 text-text-muted mb-1">
          <BarChart3 className="w-4 h-4" />
          <span className="text-sm">训练数据分析</span>
        </div>
        <h1 className="text-2xl md:text-3xl font-display tracking-wide text-text">
          数据统计
        </h1>
        <p className="text-text-muted mt-1">追踪你的训练进度和力量增长</p>
      </div>

      <div className="grid grid-cols-1 md:grid-cols-3 gap-4">
        <StreakCard days={streakDays} />
        <WeeklyStats count={weeklyCount} checkins={checkins} />
        <TotalCard totalDays={totalDays} />
      </div>

      <WeightChart checkins={checkins} />
    </div>
  );
}
