import { Trash2 } from 'lucide-react';
import type { Exercise } from '@/types';

interface Props {
  index: number;
  exercise: Omit<Exercise, 'id'>;
  onChange: (data: Omit<Exercise, 'id'>) => void;
  onRemove: () => void;
  canRemove: boolean;
}

export function ExerciseForm({ index, exercise, onChange, onRemove, canRemove }: Props) {
  const update = (field: keyof Omit<Exercise, 'id'>, value: string | number) => {
    onChange({
      ...exercise,
      [field]: typeof value === 'string' ? (field === 'name' ? value : Number(value) || 0) : value,
    });
  };

  return (
    <div className="card p-4 animate-slide-up">
      <div className="flex items-center justify-between mb-4">
        <h4 className="font-medium text-text">动作 #{index + 1}</h4>
        {canRemove && (
          <button
            type="button"
            onClick={onRemove}
            className="p-2 rounded-lg text-text-muted hover:text-red-400 hover:bg-red-500/10 transition-all duration-200"
          >
            <Trash2 className="w-4 h-4" />
          </button>
        )}
      </div>

      <div className="space-y-4">
        <div>
          <label className="label">动作名称</label>
          <input
            type="text"
            value={exercise.name}
            onChange={(e) => update('name', e.target.value)}
            placeholder="例如：杠铃卧推"
            className="input-field"
          />
        </div>

        <div className="grid grid-cols-2 md:grid-cols-4 gap-4">
          <div>
            <label className="label">组数</label>
            <input
              type="number"
              min="1"
              value={exercise.sets}
              onChange={(e) => update('sets', e.target.value)}
              className="input-field"
            />
          </div>
          <div>
            <label className="label">最多次数</label>
            <input
              type="number"
              min="1"
              value={exercise.minReps}
              onChange={(e) => update('minReps', e.target.value)}
              className="input-field"
            />
          </div>
          <div>
            <label className="label">最少次数</label>
            <input
              type="number"
              min="1"
              value={exercise.maxReps}
              onChange={(e) => update('maxReps', e.target.value)}
              className="input-field"
            />
          </div>
          <div>
            <label className="label">目标重量 (kg)</label>
            <input
              type="number"
              min="0"
              step="0.5"
              value={exercise.targetWeight}
              onChange={(e) => update('targetWeight', e.target.value)}
              className="input-field"
            />
          </div>
        </div>
      </div>
    </div>
  );
}
