import { useMemo } from 'react';
import { Link } from 'react-router-dom';
import { Calendar, ClipboardList, CheckCircle, Clock } from 'lucide-react';
import { useStore } from '@/store/useStore';
import { ExerciseCheckinCard } from '@/components/checkin/ExerciseCheckinCard';
import {
  formatDateDisplay,
  getWeekdayName,
  getToday,
  getDayOfWeek,
} from '@/utils/date';
import type { ExerciseCheckin } from '@/types';

export function Checkin() {
  const today = getToday();
  const plans = useStore((s) => s.plans);
  const checkins = useStore((s) => s.checkins);
  const addCheckin = useStore((s) => s.addCheckin);
  const updateExerciseCheckin = useStore((s) => s.updateExerciseCheckin);

  const plansForToday = useMemo(() => {
    const dayOfWeek = getDayOfWeek(today);
    return plans.filter((p) => p.trainingDays.includes(dayOfWeek));
  }, [plans, today]);

  const existingCheckin = useMemo(
    () => checkins.find((c) => c.date === today),
    [checkins, today]
  );

  const activePlan = plansForToday[0];

  const totalExercises = activePlan?.exercises.length || 0;
  const completedExercises = useMemo(() => {
    if (!existingCheckin) return 0;
    return existingCheckin.exercises.filter((e) => e.completed).length;
  }, [existingCheckin]);

  const progress = totalExercises > 0 ? (completedExercises / totalExercises) * 100 : 0;

  const handleExerciseChange = (exerciseId: string, data: Partial<ExerciseCheckin>) => {
    if (!activePlan) return;

    const exercise = activePlan.exercises.find((e) => e.id === exerciseId);
    if (!exercise) return;

    if (!existingCheckin) {
      const exercises: ExerciseCheckin[] = activePlan.exercises.map((e) => {
        if (e.id === exerciseId) {
          return {
            exerciseId: e.id,
            exerciseName: e.name,
            completed: data.completed || false,
            actualWeight: data.actualWeight ?? e.targetWeight,
            completedSets: data.completedSets ?? e.sets,
            completedReps: data.completedReps ?? e.maxReps,
            notes: data.notes ?? '',
          };
        }
        return {
          exerciseId: e.id,
          exerciseName: e.name,
          completed: false,
          actualWeight: e.targetWeight,
          completedSets: e.sets,
          completedReps: e.maxReps,
          notes: '',
        };
      });
      addCheckin({
        date: today,
        planId: activePlan.id,
        planName: activePlan.name,
        exercises,
      });
    } else {
      updateExerciseCheckin(today, exerciseId, {
        exerciseName: exercise.name,
        ...data,
      } as Partial<ExerciseCheckin>);
    }
  };

  const recentCheckins = useMemo(() => {
    return [...checkins]
      .sort((a, b) => b.date.localeCompare(a.date))
      .slice(0, 5);
  }, [checkins]);

  return (
    <div className="space-y-6 animate-fade-in">
      <div className="flex flex-col md:flex-row md:items-center md:justify-between gap-4">
        <div>
          <div className="flex items-center gap-2 text-text-muted mb-1">
            <Calendar className="w-4 h-4" />
            <span className="text-sm">{formatDateDisplay(today)} · {getWeekdayName(today)}</span>
          </div>
          <h1 className="text-2xl md:text-3xl font-display tracking-wide text-text">
            今日打卡
          </h1>
        </div>
        {completedExercises > 0 && completedExercises === totalExercises && (
          <div className="flex items-center gap-2 px-4 py-2 rounded-xl bg-accent/10 border border-accent/20">
            <CheckCircle className="w-5 h-5 text-accent" />
            <span className="font-medium text-accent">今日训练已完成！</span>
          </div>
        )}
      </div>

      {activePlan ? (
        <>
          <div className="card p-5 bg-gradient-to-br from-accent/5 to-gold/5">
            <div className="flex items-center justify-between mb-3">
              <div>
                <p className="text-sm text-text-muted">今日训练计划</p>
                <h2 className="text-xl font-semibold text-text">{activePlan.name}</h2>
              </div>
              <div className="text-right">
                <p className="text-2xl font-display gradient-text">
                  {completedExercises}/{totalExercises}
                </p>
                <p className="text-xs text-text-muted">已完成动作</p>
              </div>
            </div>
            <div className="progress-bar">
              <div
                className="progress-bar-fill"
                style={{ width: `${progress}%` }}
              />
            </div>
          </div>

          <div className="space-y-3">
            {activePlan.exercises.map((exercise) => {
              const existing = existingCheckin?.exercises.find(
                (e) => e.exerciseId === exercise.id
              );
              return (
                <ExerciseCheckinCard
                  key={exercise.id}
                  exercise={exercise}
                  checkin={existing}
                  onChange={(data) => handleExerciseChange(exercise.id, data)}
                />
              );
            })}
          </div>
        </>
      ) : (
        <div className="card p-12 text-center">
          <div className="w-16 h-16 mx-auto rounded-2xl bg-bg-tertiary flex items-center justify-center mb-4">
            <Clock className="w-8 h-8 text-text-muted" />
          </div>
          <h3 className="text-xl font-semibold text-text mb-2">今天是休息日</h3>
          <p className="text-text-muted mb-6">
            今天没有安排训练计划，好好休息恢复
          </p>
          <Link to="/plans" className="btn-primary inline-flex items-center gap-2">
            <ClipboardList className="w-4 h-4" />
            查看训练计划
          </Link>
        </div>
      )}

      {recentCheckins.length > 0 && (
        <div className="card p-5">
          <h3 className="font-semibold text-text mb-4 flex items-center gap-2">
            <Clock className="w-4 h-4 text-text-muted" />
            最近打卡记录
          </h3>
          <div className="space-y-2">
            {recentCheckins.map((record) => {
              const completedCount = record.exercises.filter((e) => e.completed).length;
              return (
                <div
                  key={record.id}
                  className="flex items-center justify-between py-3 px-4 rounded-lg bg-bg-tertiary/50"
                >
                  <div>
                    <p className="font-medium text-text">{record.planName}</p>
                    <p className="text-sm text-text-muted">
                      {formatDateDisplay(record.date)} · {getWeekdayName(record.date)}
                    </p>
                  </div>
                  <div className="flex items-center gap-2">
                    <span className="badge bg-accent/10 text-accent">
                      {completedCount}/{record.exercises.length} 完成
                    </span>
                  </div>
                </div>
              );
            })}
          </div>
        </div>
      )}
    </div>
  );
}
