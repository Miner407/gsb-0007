import { useMemo, useState } from 'react';
import {
  LineChart,
  Line,
  XAxis,
  YAxis,
  CartesianGrid,
  Tooltip,
  ResponsiveContainer,
  Legend,
} from 'recharts';
import { TrendingUp, Filter, Target } from 'lucide-react';
import { useStore } from '@/store/useStore';
import type { Exercise, CheckinRecord } from '@/types';
import { formatDateDisplay, getToday, addDays } from '@/utils/date';

interface Props {
  checkins: CheckinRecord[];
}

const TIME_RANGE_OPTIONS = [
  { value: '7d', label: '最近7天', days: 7 },
  { value: '30d', label: '最近30天', days: 30 },
  { value: '90d', label: '最近90天', days: 90 },
  { value: 'all', label: '全部', days: -1 },
];

export function WeightChart({ checkins }: Props) {
  const plans = useStore((s) => s.plans);
  const weightChartFilter = useStore((s) => s.weightChartFilter);
  const setWeightChartFilter = useStore((s) => s.setWeightChartFilter);

  const allExercises = useMemo(() => {
    const exercises: Exercise[] = [];
    const seen = new Set<string>();
    for (const plan of plans) {
      for (const ex of plan.exercises) {
        if (!seen.has(ex.id)) {
          seen.add(ex.id);
          exercises.push(ex);
        }
      }
    }
    return exercises;
  }, [plans]);

  const selectedExerciseId = weightChartFilter.exerciseId || allExercises[0]?.id || null;
  const timeRange = weightChartFilter.timeRange;
  const showTarget = weightChartFilter.showTarget;

  const history = useMemo(() => {
    if (!selectedExerciseId) return [];

    let startDate: string | null = null;
    const timeOption = TIME_RANGE_OPTIONS.find((o) => o.value === timeRange);
    if (timeOption && timeOption.days > 0) {
      startDate = addDays(getToday(), -timeOption.days + 1);
    }

    const result: { date: string; weight: number; targetWeight: number }[] = [];
    const plans = useStore.getState().plans;
    let targetWeight = 0;

    for (const plan of plans) {
      const ex = plan.exercises.find((e) => e.id === selectedExerciseId);
      if (ex) {
        targetWeight = ex.targetWeight;
        break;
      }
    }

    for (const checkin of checkins) {
      if (startDate && checkin.date < startDate) continue;
      const ex = checkin.exercises.find(
        (e) => e.exerciseId === selectedExerciseId && e.completed
      );
      if (ex) {
        result.push({
          date: checkin.date,
          weight: ex.actualWeight || 0,
          targetWeight,
        });
      }
    }
    return result.sort((a, b) => a.date.localeCompare(b.date));
  }, [selectedExerciseId, checkins, timeRange]);

  const chartData = history.map((h) => ({
    date: formatDateDisplay(h.date),
    actualWeight: h.weight,
    targetWeight: showTarget ? h.targetWeight : null,
  }));

  const maxWeight = history.length > 0 ? Math.max(...history.map((h) => h.weight)) : 0;
  const selectedExercise = allExercises.find((e) => e.id === selectedExerciseId);

  return (
    <div className="card p-6">
      <div className="flex flex-col lg:flex-row lg:items-start lg:justify-between gap-4 mb-6">
        <div className="flex items-center gap-3">
          <div className="w-12 h-12 rounded-xl bg-gradient-to-br from-gold/20 to-accent/10 flex items-center justify-center">
            <TrendingUp className="w-6 h-6 text-gold" />
          </div>
          <div>
            <p className="text-text-muted text-sm">力量增长趋势</p>
            <h3 className="text-xl font-semibold text-text">
              {history.length > 0 ? `最高 ${maxWeight}kg` : '暂无数据'}
            </h3>
          </div>
        </div>

        <div className="flex flex-col sm:flex-row gap-3">
          {allExercises.length > 0 && (
            <select
              value={selectedExerciseId || ''}
              onChange={(e) => setWeightChartFilter({ exerciseId: e.target.value || null })}
              className="input-field max-w-xs"
            >
              {allExercises.map((ex) => (
                <option key={ex.id} value={ex.id}>
                  {ex.name}
                </option>
              ))}
            </select>
          )}

          <select
            value={timeRange}
            onChange={(e) => setWeightChartFilter({ timeRange: e.target.value as any })}
            className="input-field max-w-xs"
          >
            {TIME_RANGE_OPTIONS.map((option) => (
              <option key={option.value} value={option.value}>
                {option.label}
              </option>
            ))}
          </select>

          <label className="flex items-center gap-2 px-4 py-2.5 rounded-lg bg-bg-tertiary cursor-pointer hover:bg-bg-tertiary/80 transition-all">
            <input
              type="checkbox"
              checked={showTarget}
              onChange={(e) => setWeightChartFilter({ showTarget: e.target.checked })}
              className="w-4 h-4 accent-accent"
            />
            <Target className="w-4 h-4 text-gold" />
            <span className="text-sm text-text">显示目标重量</span>
          </label>
        </div>
      </div>

      {selectedExercise && (
        <div className="mb-4 p-3 rounded-lg bg-bg-tertiary/50">
          <p className="text-sm text-text-muted">
            <span className="text-text font-medium">{selectedExercise.name}</span>
            {selectedExercise.targetWeight > 0 && (
              <span className="ml-3">
                目标重量：<span className="text-gold font-medium">{selectedExercise.targetWeight}kg</span>
              </span>
            )}
            {selectedExercise.muscleGroup && (
              <span className="ml-3">
                肌群：<span className="text-text">{selectedExercise.muscleGroup}</span>
              </span>
            )}
          </p>
        </div>
      )}

      {chartData.length > 0 ? (
        <div className="h-64 md:h-80">
          <ResponsiveContainer width="100%" height="100%">
            <LineChart data={chartData} margin={{ top: 5, right: 20, left: 0, bottom: 5 }}>
              <defs>
                <linearGradient id="weightGradient" x1="0" y1="0" x2="0" y2="1">
                  <stop offset="5%" stopColor="#ff6b35" stopOpacity={0.3} />
                  <stop offset="95%" stopColor="#ff6b35" stopOpacity={0} />
                </linearGradient>
              </defs>
              <CartesianGrid strokeDasharray="3 3" stroke="#2d2d2d" vertical={false} />
              <XAxis
                dataKey="date"
                stroke="#555555"
                fontSize={12}
                tickLine={false}
                axisLine={false}
              />
              <YAxis
                stroke="#555555"
                fontSize={12}
                tickLine={false}
                axisLine={false}
                tickFormatter={(v) => `${v}kg`}
              />
              <Tooltip
                contentStyle={{
                  backgroundColor: '#1a1a1a',
                  border: '1px solid #2d2d2d',
                  borderRadius: '8px',
                  color: '#e0e0e0',
                }}
                labelStyle={{ color: '#888888' }}
                formatter={(value: number | null, name: string) => {
                  if (value === null) return null;
                  return [
                    `${value}kg`,
                    name === 'actualWeight' ? '实际重量' : '目标重量'
                  ];
                }}
              />
              <Legend
                formatter={(value) => value === 'actualWeight' ? '实际重量' : '目标重量'}
                iconType="line"
              />
              <Line
                type="monotone"
                dataKey="actualWeight"
                name="actualWeight"
                stroke="#ff6b35"
                strokeWidth={3}
                dot={{ fill: '#ff6b35', r: 4, strokeWidth: 2, stroke: '#1a1a1a' }}
                activeDot={{ r: 6, fill: '#ff6b35', stroke: '#fff', strokeWidth: 2 }}
              />
              {showTarget && (
                <Line
                  type="monotone"
                  dataKey="targetWeight"
                  name="targetWeight"
                  stroke="#f7c59f"
                  strokeWidth={2}
                  strokeDasharray="5 5"
                  dot={false}
                />
              )}
            </LineChart>
          </ResponsiveContainer>
        </div>
      ) : (
        <div className="h-64 md:h-80 flex items-center justify-center">
          <div className="text-center">
            <TrendingUp className="w-12 h-12 mx-auto text-text-dim mb-3" />
            <p className="text-text-muted">
              {allExercises.length === 0
                ? '先创建训练计划添加动作'
                : '完成打卡后查看力量增长趋势'}
            </p>
          </div>
        </div>
      )}
    </div>
  );
}
