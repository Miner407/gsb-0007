import { useMemo } from 'react';
import { Link } from 'react-router-dom';
import {
  Calendar,
  Plus,
  Target,
  Dumbbell,
  ChevronRight,
  Trash2,
  Edit3,
  CheckCircle2,
  XCircle,
} from 'lucide-react';
import { useStore } from '@/store/useStore';
import { WEEKDAY_NAMES, MUSCLE_GROUPS } from '@/types';
import { formatDateDisplay, getToday } from '@/utils/date';

export function Cycles() {
  const trainingCycles = useStore((s) => s.trainingCycles);
  const deleteCycle = useStore((s) => s.deleteTrainingCycle);
  const checkins = useStore((s) => s.checkins);
  const today = getToday();

  const cycles = useMemo(() => {
    return [...trainingCycles].sort((a, b) => b.weekStartDate.localeCompare(a.weekStartDate));
  }, [trainingCycles]);

  const currentCycle = useMemo(() => {
    return trainingCycles.find(
      (c) => c.weekStartDate <= today && c.weekEndDate >= today
    );
  }, [trainingCycles, today]);

  const cyclesWithProgress = useMemo(() => {
    return cycles.map((cycle) => {
      const cycleCheckins = checkins.filter(
        (c) => c.date >= cycle.weekStartDate && c.date <= cycle.weekEndDate
      );
      const completedDays = cycleCheckins.length;
      const totalDays = cycle.trainingDays.length;
      const progress = totalDays > 0 ? (completedDays / totalDays) * 100 : 0;
      const isActive = cycle.weekStartDate <= today && cycle.weekEndDate >= today;
      const isPast = cycle.weekEndDate < today;

      return {
        ...cycle,
        completedDays,
        totalDays,
        progress,
        isActive,
        isPast,
      };
    });
  }, [cycles, checkins, today]);

  return (
    <div className="space-y-6 animate-fade-in">
      <div className="flex flex-col md:flex-row md:items-center md:justify-between gap-4">
        <div>
          <div className="flex items-center gap-2 text-text-muted mb-1">
            <Calendar className="w-4 h-4" />
            <span className="text-sm">训练周期管理</span>
          </div>
          <h1 className="text-2xl md:text-3xl font-display tracking-wide text-text">
            训练周期
          </h1>
          <p className="text-text-muted mt-1">按周规划你的训练，设定目标和重点肌群</p>
        </div>
        <Link to="/cycles/new" className="btn-primary inline-flex items-center gap-2">
          <Plus className="w-4 h-4" />
          创建训练周期
        </Link>
      </div>

      {currentCycle && (
        <div className="card p-6 bg-gradient-to-br from-accent/10 to-gold/5 border-accent/30">
          <div className="flex items-center gap-2 mb-3">
            <CheckCircle2 className="w-5 h-5 text-accent" />
            <span className="font-semibold text-accent">当前训练周期</span>
          </div>
          <h2 className="text-xl font-semibold text-text mb-2">{currentCycle.name}</h2>
          <p className="text-text-muted mb-4">
            {formatDateDisplay(currentCycle.weekStartDate)} - {formatDateDisplay(currentCycle.weekEndDate)}
          </p>
          {currentCycle.weeklyGoal && (
            <p className="text-sm text-text mb-3">
              <span className="text-text-muted">本周目标：</span>
              {currentCycle.weeklyGoal}
            </p>
          )}
          {currentCycle.focusMuscles.length > 0 && (
            <div className="flex flex-wrap gap-2 mb-4">
              {currentCycle.focusMuscles.map((muscle) => (
                <span key={muscle} className="badge bg-accent/10 text-accent">
                  {muscle}
                </span>
              ))}
            </div>
          )}
          <Link to="/cycles/new" className="btn-secondary inline-flex items-center gap-2 text-sm">
            <Edit3 className="w-4 h-4" />
            编辑当前周期
          </Link>
        </div>
      )}

      {cyclesWithProgress.length === 0 ? (
        <div className="card p-12 text-center">
          <div className="w-16 h-16 mx-auto rounded-2xl bg-bg-tertiary flex items-center justify-center mb-4">
            <Calendar className="w-8 h-8 text-text-muted" />
          </div>
          <h3 className="text-xl font-semibold text-text mb-2">暂无训练周期</h3>
          <p className="text-text-muted mb-6">
            创建你的第一个训练周期，按周规划训练目标
          </p>
          <Link to="/cycles/new" className="btn-primary inline-flex items-center gap-2">
            <Plus className="w-4 h-4" />
            创建训练周期
          </Link>
        </div>
      ) : (
        <div className="space-y-4">
          {cyclesWithProgress.map((cycle) => (
            <div
              key={cycle.id}
              className={`card p-5 ${
                cycle.isActive ? 'border-accent/30' : cycle.isPast ? 'opacity-70' : ''
              }`}
            >
              <div className="flex flex-col md:flex-row md:items-start md:justify-between gap-4">
                <div className="flex-1">
                  <div className="flex items-center gap-2 mb-2">
                    <h3 className="text-lg font-semibold text-text">{cycle.name}</h3>
                    {cycle.isActive && (
                      <span className="badge bg-accent/10 text-accent">进行中</span>
                    )}
                    {cycle.isPast && (
                      <span className="badge bg-text-muted/10 text-text-muted">已结束</span>
                    )}
                  </div>
                  <p className="text-sm text-text-muted mb-3">
                    {formatDateDisplay(cycle.weekStartDate)} - {formatDateDisplay(cycle.weekEndDate)}
                  </p>

                  {cycle.weeklyGoal && (
                    <p className="text-sm text-text mb-2">
                      <span className="text-text-muted">目标：</span>
                      {cycle.weeklyGoal}
                    </p>
                  )}

                  {cycle.focusMuscles.length > 0 && (
                    <div className="flex flex-wrap gap-1.5 mb-3">
                      {cycle.focusMuscles.map((muscle) => (
                        <span key={muscle} className="badge bg-bg-tertiary text-text-muted text-xs">
                          {muscle}
                        </span>
                      ))}
                    </div>
                  )}

                  <div className="flex items-center gap-4 text-sm">
                    <div className="flex items-center gap-1.5 text-text-muted">
                      <Target className="w-4 h-4" />
                      <span>训练日：</span>
                      <span className="text-text">
                        {cycle.trainingDays.map((d) => WEEKDAY_NAMES[d]).join('、')}
                      </span>
                    </div>
                    <div className="flex items-center gap-1.5 text-text-muted">
                      <Dumbbell className="w-4 h-4" />
                      <span>进度：</span>
                      <span className="text-text">
                        {cycle.completedDays}/{cycle.totalDays} 次
                      </span>
                    </div>
                  </div>

                  {cycle.totalDays > 0 && (
                    <div className="mt-3">
                      <div className="progress-bar">
                        <div
                          className="progress-bar-fill"
                          style={{ width: `${cycle.progress}%` }}
                        />
                      </div>
                    </div>
                  )}

                  {cycle.notes && (
                    <p className="text-sm text-text-muted mt-3 italic">
                      备注：{cycle.notes}
                    </p>
                  )}
                </div>

                <div className="flex items-center gap-2 shrink-0">
                  <Link
                    to={`/cycles/${cycle.id}`}
                    className="p-2.5 rounded-lg bg-bg-tertiary text-text-muted hover:text-text hover:bg-bg-tertiary/80 transition-all duration-200"
                    title="编辑"
                  >
                    <Edit3 className="w-4 h-4" />
                  </Link>
                  <button
                    onClick={() => {
                      if (confirm('确定要删除这个训练周期吗？')) {
                        deleteCycle(cycle.id);
                      }
                    }}
                    className="p-2.5 rounded-lg bg-red-500/10 text-red-400 hover:bg-red-500/20 transition-all duration-200"
                    title="删除"
                  >
                    <Trash2 className="w-4 h-4" />
                  </button>
                </div>
              </div>
            </div>
          ))}
        </div>
      )}
    </div>
  );
}
