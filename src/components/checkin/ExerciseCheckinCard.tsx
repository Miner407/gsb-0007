import { useState } from 'react';
import { Check, ChevronDown, ChevronUp, Dumbbell } from 'lucide-react';
import type { Exercise, ExerciseCheckin } from '@/types';

interface Props {
  exercise: Exercise;
  checkin?: ExerciseCheckin;
  onChange: (data: Partial<ExerciseCheckin>) => void;
}

export function ExerciseCheckinCard({ exercise, checkin, onChange }: Props) {
  const [expanded, setExpanded] = useState(false);

  const completed = checkin?.completed || false;
  const actualWeight = checkin?.actualWeight ?? exercise.targetWeight;
  const completedSets = checkin?.completedSets ?? exercise.sets;
  const completedReps = checkin?.completedReps ?? exercise.maxReps;
  const notes = checkin?.notes ?? '';

  const toggleComplete = () => {
    onChange({
      completed: !completed,
      actualWeight,
      completedSets,
      completedReps,
      notes,
    });
  };

  return (
    <div
      className={`card p-4 transition-all duration-300 ${
        completed ? 'border-accent/50 shadow-glow' : ''
      }`}
    >
      <div className="flex items-center gap-4">
        <button
          onClick={toggleComplete}
          className={`w-10 h-10 rounded-xl flex items-center justify-center transition-all duration-200 shrink-0 ${
            completed
              ? 'bg-accent text-white shadow-glow scale-105'
              : 'bg-bg-tertiary text-text-muted hover:border-accent/50 border border-transparent'
          }`}
        >
          <Check className={`w-5 h-5 ${completed ? 'animate-scale-in' : ''}`} />
        </button>

        <div className="flex-1 min-w-0">
          <div className="flex items-center gap-2">
            <Dumbbell className={`w-4 h-4 ${completed ? 'text-accent' : 'text-text-muted'}`} />
            <h4
              className={`font-semibold truncate ${
                completed ? 'text-accent line-through opacity-70' : 'text-text'
              }`}
            >
              {exercise.name}
            </h4>
          </div>
          <p className="text-sm text-text-muted mt-0.5">
            {exercise.sets}组 × {exercise.minReps}-{exercise.maxReps}次
            {exercise.targetWeight > 0 && ` · 目标 ${exercise.targetWeight}kg`}
          </p>
        </div>

        <button
          onClick={() => setExpanded(!expanded)}
          className="p-2 rounded-lg text-text-muted hover:text-text hover:bg-bg-tertiary transition-all duration-200 shrink-0"
        >
          {expanded ? <ChevronUp className="w-4 h-4" /> : <ChevronDown className="w-4 h-4" />}
        </button>
      </div>

      {expanded && (
        <div className="mt-4 pt-4 border-t border-bg-tertiary space-y-4 animate-slide-up">
          <div className="grid grid-cols-2 md:grid-cols-3 gap-4">
            <div>
              <label className="label">实际重量 (kg)</label>
              <input
                type="number"
                min="0"
                step="0.5"
                value={actualWeight}
                onChange={(e) =>
                  onChange({
                    completed,
                    actualWeight: Number(e.target.value) || 0,
                    completedSets,
                    completedReps,
                    notes,
                  })
                }
                className="input-field"
              />
            </div>
            <div>
              <label className="label">完成组数</label>
              <input
                type="number"
                min="0"
                value={completedSets}
                onChange={(e) =>
                  onChange({
                    completed,
                    actualWeight,
                    completedSets: Number(e.target.value) || 0,
                    completedReps,
                    notes,
                  })
                }
                className="input-field"
              />
            </div>
            <div>
              <label className="label">完成次数</label>
              <input
                type="number"
                min="0"
                value={completedReps}
                onChange={(e) =>
                  onChange({
                    completed,
                    actualWeight,
                    completedSets,
                    completedReps: Number(e.target.value) || 0,
                    notes,
                  })
                }
                className="input-field"
              />
            </div>
          </div>
          <div>
            <label className="label">训练备注</label>
            <textarea
              value={notes}
              onChange={(e) =>
                onChange({
                  completed,
                  actualWeight,
                  completedSets,
                  completedReps,
                  notes: e.target.value,
                })
              }
              placeholder="记录感受、RPE、失败组等..."
              rows={2}
              className="input-field resize-none"
            />
          </div>
        </div>
      )}
    </div>
  );
}
