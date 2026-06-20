import { useState } from 'react';
import { Check, ChevronDown, ChevronUp, Dumbbell, Gauge, Activity, AlertTriangle } from 'lucide-react';
import type { Exercise, ExerciseCheckin } from '@/types';
import { RPE_LABELS, QUALITY_LABELS, PAIN_LABELS } from '@/types';

interface Props {
  exercise: Exercise;
  checkin?: ExerciseCheckin;
  onChange: (data: Partial<ExerciseCheckin>) => void;
}

function RatingSlider({
  value,
  onChange,
  max,
  labels,
  label,
  icon: Icon,
  color,
}: {
  value: number;
  onChange: (v: number) => void;
  max: number;
  labels: Record<number, string>;
  label: string;
  icon: React.ElementType;
  color: string;
}) {
  return (
    <div>
      <div className="flex items-center justify-between mb-2">
        <div className="flex items-center gap-2">
          <Icon className={`w-4 h-4 ${color}`} />
          <label className="label mb-0">{label}</label>
        </div>
        <span className={`text-sm font-medium ${color}`}>
          {value > 0 ? `${value} - ${labels[value]}` : '未记录'}
        </span>
      </div>
      <div className="flex gap-1">
        {Array.from({ length: max }, (_, i) => i + 1).map((num) => (
          <button
            key={num}
            onClick={() => onChange(value === num ? 0 : num)}
            className={`flex-1 h-8 rounded-lg transition-all duration-200 text-xs font-medium ${
              value >= num
                ? color === 'text-accent'
                  ? 'bg-accent text-white'
                  : color === 'text-gold'
                  ? 'bg-gold text-bg'
                  : 'bg-red-500 text-white'
                : 'bg-bg-tertiary text-text-muted hover:bg-bg-tertiary/80'
            }`}
            title={labels[num]}
          >
            {num}
          </button>
        ))}
      </div>
    </div>
  );
}

export function ExerciseCheckinCard({ exercise, checkin, onChange }: Props) {
  const [expanded, setExpanded] = useState(false);

  const completed = checkin?.completed || false;
  const actualWeight = checkin?.actualWeight ?? exercise.targetWeight;
  const completedSets = checkin?.completedSets ?? exercise.sets;
  const completedReps = checkin?.completedReps ?? exercise.maxReps;
  const notes = checkin?.notes ?? '';
  const rpe = checkin?.rpe ?? 0;
  const quality = checkin?.quality ?? 0;
  const pain = checkin?.pain ?? 0;
  const painLocation = checkin?.painLocation ?? '';

  const toggleComplete = () => {
    onChange({
      completed: !completed,
      actualWeight,
      completedSets,
      completedReps,
      notes,
      rpe,
      quality,
      pain,
      painLocation,
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
          {(rpe > 0 || quality > 0 || pain > 0) && (
            <div className="flex items-center gap-3 mt-1">
              {rpe > 0 && (
                <span className="badge bg-accent/10 text-accent text-xs">
                  RPE {rpe}
                </span>
              )}
              {quality > 0 && (
                <span className="badge bg-gold/10 text-gold text-xs">
                  质量 {quality}
                </span>
              )}
              {pain > 0 && (
                <span className="badge bg-red-500/10 text-red-400 text-xs">
                  疼痛 {pain}
                </span>
              )}
            </div>
          )}
        </div>

        <button
          onClick={() => setExpanded(!expanded)}
          className="p-2 rounded-lg text-text-muted hover:text-text hover:bg-bg-tertiary transition-all duration-200 shrink-0"
        >
          {expanded ? <ChevronUp className="w-4 h-4" /> : <ChevronDown className="w-4 h-4" />}
        </button>
      </div>

      {expanded && (
        <div className="mt-4 pt-4 border-t border-bg-tertiary space-y-5 animate-slide-up">
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
                    rpe,
                    quality,
                    pain,
                    painLocation,
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
                    rpe,
                    quality,
                    pain,
                    painLocation,
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
                    rpe,
                    quality,
                    pain,
                    painLocation,
                  })
                }
                className="input-field"
              />
            </div>
          </div>

          <div className="space-y-4">
            <RatingSlider
              value={rpe}
              onChange={(v) => onChange({ completed, actualWeight, completedSets, completedReps, notes, rpe: v, quality, pain, painLocation })}
              max={10}
              labels={RPE_LABELS}
              label="主观强度 (RPE)"
              icon={Gauge}
              color="text-accent"
            />

            <RatingSlider
              value={quality}
              onChange={(v) => onChange({ completed, actualWeight, completedSets, completedReps, notes, rpe, quality: v, pain, painLocation })}
              max={5}
              labels={QUALITY_LABELS}
              label="完成质量"
              icon={Activity}
              color="text-gold"
            />

            <RatingSlider
              value={pain}
              onChange={(v) => onChange({ completed, actualWeight, completedSets, completedReps, notes, rpe, quality, pain: v, painLocation })}
              max={5}
              labels={PAIN_LABELS}
              label="疼痛/不适"
              icon={AlertTriangle}
              color="text-red-400"
            />

            {pain > 0 && (
              <div>
                <label className="label">疼痛部位</label>
                <input
                  type="text"
                  value={painLocation}
                  onChange={(e) =>
                    onChange({
                      completed,
                      actualWeight,
                      completedSets,
                      completedReps,
                      notes,
                      rpe,
                      quality,
                      pain,
                      painLocation: e.target.value,
                    })
                  }
                  placeholder="例如：左肩、右膝盖..."
                  className="input-field"
                />
              </div>
            )}
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
                  rpe,
                  quality,
                  pain,
                  painLocation,
                })
              }
              placeholder="记录感受、失败组、调整等..."
              rows={2}
              className="input-field resize-none"
            />
          </div>
        </div>
      )}
    </div>
  );
}
