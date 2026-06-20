import { useState, useEffect } from 'react';
import { useNavigate, useParams, Link } from 'react-router-dom';
import { ArrowLeft, Plus, Save } from 'lucide-react';
import { useStore } from '@/store/useStore';
import { TrainingDaySelector } from '@/components/plans/TrainingDaySelector';
import { ExerciseForm } from '@/components/plans/ExerciseForm';
import type { Exercise } from '@/types';

function generateId(): string {
  return Date.now().toString(36) + Math.random().toString(36).substr(2);
}

function emptyExercise(): Omit<Exercise, 'id'> {
  return {
    name: '',
    sets: 3,
    minReps: 8,
    maxReps: 12,
    targetWeight: 0,
  };
}

export function PlanEditor() {
  const navigate = useNavigate();
  const { id } = useParams<{ id: string }>();
  const isEditing = id && id !== 'new';

  const getPlanById = useStore((s) => s.getPlanById);
  const addPlan = useStore((s) => s.addPlan);
  const updatePlan = useStore((s) => s.updatePlan);

  const [name, setName] = useState('');
  const [trainingDays, setTrainingDays] = useState<number[]>([]);
  const [exercises, setExercises] = useState<(Omit<Exercise, 'id'> & { _key?: string })[]>([
    { ...emptyExercise(), _key: generateId() },
  ]);

  useEffect(() => {
    if (isEditing && id) {
      const plan = getPlanById(id);
      if (plan) {
        setName(plan.name);
        setTrainingDays(plan.trainingDays);
        setExercises(plan.exercises.map((e) => ({ ...e, _key: generateId() })));
      }
    }
  }, [isEditing, id, getPlanById]);

  const addExercise = () => {
    setExercises([...exercises, { ...emptyExercise(), _key: generateId() }]);
  };

  const updateExercise = (index: number, data: Omit<Exercise, 'id'>) => {
    const updated = [...exercises];
    updated[index] = { ...data, _key: updated[index]._key };
    setExercises(updated);
  };

  const removeExercise = (index: number) => {
    setExercises(exercises.filter((_, i) => i !== index));
  };

  const handleSubmit = (e: React.FormEvent) => {
    e.preventDefault();
    if (!name.trim()) {
      alert('请输入训练计划名称');
      return;
    }
    const validExercises = exercises.filter((ex) => ex.name.trim());
    if (validExercises.length === 0) {
      alert('请至少添加一个动作');
      return;
    }

    const exerciseData: Exercise[] = validExercises.map((ex) => ({
      id: (ex as Exercise).id || generateId(),
      name: ex.name,
      sets: ex.sets,
      minReps: ex.minReps,
      maxReps: ex.maxReps,
      targetWeight: ex.targetWeight,
    }));

    if (isEditing && id) {
      updatePlan(id, {
        name: name.trim(),
        trainingDays,
        exercises: exerciseData,
      });
    } else {
      addPlan({
        name: name.trim(),
        trainingDays,
        exercises: exerciseData,
      });
    }
    navigate('/plans');
  };

  return (
    <div className="space-y-6 animate-fade-in">
      <div className="flex items-center gap-4">
        <Link
          to="/plans"
          className="p-2 rounded-lg text-text-muted hover:text-text hover:bg-bg-tertiary transition-all duration-200"
        >
          <ArrowLeft className="w-5 h-5" />
        </Link>
        <div>
          <h1 className="text-2xl md:text-3xl font-display tracking-wide text-text">
            {isEditing ? '编辑训练计划' : '创建训练计划'}
          </h1>
          <p className="text-text-muted mt-1">
            {isEditing ? '修改你的训练计划配置' : '设置训练日和动作，开始你的健身之旅'}
          </p>
        </div>
      </div>

      <form onSubmit={handleSubmit} className="space-y-6">
        <div className="card p-6 space-y-6">
          <div>
            <label className="label">训练计划名称</label>
            <input
              type="text"
              value={name}
              onChange={(e) => setName(e.target.value)}
              placeholder="例如：胸部训练日、全身训练"
              className="input-field text-lg"
            />
          </div>

          <div>
            <label className="label">训练日</label>
            <TrainingDaySelector selectedDays={trainingDays} onChange={setTrainingDays} />
          </div>
        </div>

        <div className="space-y-4">
          <div className="flex items-center justify-between">
            <h2 className="text-lg font-semibold text-text">训练动作</h2>
            <button
              type="button"
              onClick={addExercise}
              className="btn-secondary flex items-center gap-2"
            >
              <Plus className="w-4 h-4" />
              添加动作
            </button>
          </div>

          <div className="space-y-4">
            {exercises.map((ex, index) => (
              <ExerciseForm
                key={ex._key || index}
                index={index}
                exercise={ex}
                onChange={(data) => updateExercise(index, data)}
                onRemove={() => removeExercise(index)}
                canRemove={exercises.length > 1}
              />
            ))}
          </div>
        </div>

        <div className="flex items-center justify-end gap-3 pt-4">
          <Link to="/plans" className="btn-secondary">
            取消
          </Link>
          <button type="submit" className="btn-primary flex items-center gap-2">
            <Save className="w-4 h-4" />
            {isEditing ? '保存修改' : '创建计划'}
          </button>
        </div>
      </form>
    </div>
  );
}
