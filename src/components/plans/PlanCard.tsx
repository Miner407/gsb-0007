import { Link } from 'react-router-dom';
import { Pencil, Trash2, Dumbbell, Calendar } from 'lucide-react';
import type { WorkoutPlan } from '@/types';
import { WEEKDAY_NAMES } from '@/types';

interface Props {
  plan: WorkoutPlan;
  onDelete: () => void;
}

export function PlanCard({ plan, onDelete }: Props) {
  return (
    <div className="card card-hover p-5 animate-slide-up">
      <div className="flex items-start justify-between mb-4">
        <div className="flex items-center gap-3">
          <div className="w-11 h-11 rounded-xl bg-gradient-to-br from-accent/20 to-gold/10 flex items-center justify-center border border-accent/20">
            <Dumbbell className="w-5 h-5 text-accent" />
          </div>
          <div>
            <h3 className="font-semibold text-text text-lg">{plan.name}</h3>
            <p className="text-sm text-text-muted">{plan.exercises.length} 个动作</p>
          </div>
        </div>
        <div className="flex items-center gap-1">
          <Link
            to={`/plans/${plan.id}`}
            className="p-2 rounded-lg text-text-muted hover:text-accent hover:bg-accent/10 transition-all duration-200"
          >
            <Pencil className="w-4 h-4" />
          </Link>
          <button
            onClick={onDelete}
            className="p-2 rounded-lg text-text-muted hover:text-red-400 hover:bg-red-500/10 transition-all duration-200"
          >
            <Trash2 className="w-4 h-4" />
          </button>
        </div>
      </div>

      <div className="flex items-center gap-2 mb-4 flex-wrap">
        <Calendar className="w-4 h-4 text-text-muted" />
        <div className="flex flex-wrap gap-1.5">
          {plan.trainingDays.length > 0 ? (
            plan.trainingDays.map((day) => (
              <span
                key={day}
                className="badge bg-accent/10 text-accent border border-accent/20"
              >
                {WEEKDAY_NAMES[day]}
              </span>
            ))
          ) : (
            <span className="text-sm text-text-dim">未设置训练日</span>
          )}
        </div>
      </div>

      <div className="space-y-2">
        {plan.exercises.slice(0, 3).map((ex) => (
          <div
            key={ex.id}
            className="flex items-center justify-between text-sm py-1.5 px-3 rounded-lg bg-bg-tertiary/50"
          >
            <span className="text-text">{ex.name}</span>
            <span className="text-text-muted">
              {ex.sets}组 × {ex.minReps}-{ex.maxReps}次
              {ex.targetWeight > 0 && ` @ ${ex.targetWeight}kg`}
            </span>
          </div>
        ))}
        {plan.exercises.length > 3 && (
          <p className="text-xs text-text-muted text-center pt-1">
            还有 {plan.exercises.length - 3} 个动作...
          </p>
        )}
      </div>
    </div>
  );
}
