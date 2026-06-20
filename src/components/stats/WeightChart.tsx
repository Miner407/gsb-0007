import { useState, useMemo } from 'react';
import {
  LineChart,
  Line,
  XAxis,
  YAxis,
  CartesianGrid,
  Tooltip,
  ResponsiveContainer,
} from 'recharts';
import { TrendingUp } from 'lucide-react';
import { useStore } from '@/store/useStore';
import type { Exercise, CheckinRecord } from '@/types';
import { formatDateDisplay } from '@/utils/date';

interface Props {
  checkins: CheckinRecord[];
}

export function WeightChart({ checkins }: Props) {
  const plans = useStore((s) => s.plans);

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

  const [selectedExerciseId, setSelectedExerciseId] = useState<string | null>(
    allExercises[0]?.id || null
  );

  const history = useMemo(() => {
    if (!selectedExerciseId) return [];
    const result: { date: string; weight: number }[] = [];
    for (const checkin of checkins) {
      const ex = checkin.exercises.find(
        (e) => e.exerciseId === selectedExerciseId && e.completed
      );
      if (ex) {
        result.push({ date: checkin.date, weight: ex.actualWeight || 0 });
      }
    }
    return result.sort((a, b) => a.date.localeCompare(b.date));
  }, [selectedExerciseId, checkins]);

  const chartData = history.map((h) => ({
    date: formatDateDisplay(h.date),
    weight: h.weight,
  }));

  const maxWeight = history.length > 0 ? Math.max(...history.map((h) => h.weight)) : 0;

  return (
    <div className="card p-6">
      <div className="flex flex-col md:flex-row md:items-center md:justify-between gap-4 mb-6">
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
        {allExercises.length > 0 && (
          <select
            value={selectedExerciseId || ''}
            onChange={(e) => setSelectedExerciseId(e.target.value)}
            className="input-field max-w-xs"
          >
            {allExercises.map((ex) => (
              <option key={ex.id} value={ex.id}>
                {ex.name}
              </option>
            ))}
          </select>
        )}
      </div>

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
                formatter={(value: number) => [`${value}kg`, '实际重量']}
              />
              <Line
                type="monotone"
                dataKey="weight"
                stroke="#ff6b35"
                strokeWidth={3}
                dot={{ fill: '#ff6b35', r: 4, strokeWidth: 2, stroke: '#1a1a1a' }}
                activeDot={{ r: 6, fill: '#ff6b35', stroke: '#fff', strokeWidth: 2 }}
              />
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
