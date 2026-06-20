import { useState, useEffect, useMemo } from 'react';
import { useParams, useNavigate, Link } from 'react-router-dom';
import {
  Calendar,
  Save,
  ArrowLeft,
  Target,
  Dumbbell,
  X,
} from 'lucide-react';
import { useStore } from '@/store/useStore';
import { WEEKDAY_NAMES, MUSCLE_GROUPS } from '@/types';
import type { TrainingCycle } from '@/types';
import { getStartOfWeek, getEndOfWeek, getToday, formatDateDisplay } from '@/utils/date';

export function CycleEditor() {
  const { id } = useParams<{ id: string }>();
  const navigate = useNavigate();
  const isNew = id === 'new';

  const addCycle = useStore((s) => s.addTrainingCycle);
  const updateCycle = useStore((s) => s.updateTrainingCycle);
  const getCycleById = useStore((s) => s.getTrainingCycleById);
  const plans = useStore((s) => s.plans);

  const existingCycle = !isNew ? getCycleById(id || '') : undefined;

  const today = getToday();
  const defaultWeekStart = getStartOfWeek(today);
  const defaultWeekEnd = getEndOfWeek(today);

  const [formData, setFormData] = useState<{
    name: string;
    weekStartDate: string;
    weekEndDate: string;
    weeklyGoal: string;
    trainingDays: number[];
    focusMuscles: string[];
    notes: string;
    planIds: string[];
  }>({
    name: existingCycle?.name || `${formatDateDisplay(defaultWeekStart)} 训练周`,
    weekStartDate: existingCycle?.weekStartDate || defaultWeekStart,
    weekEndDate: existingCycle?.weekEndDate || defaultWeekEnd,
    weeklyGoal: existingCycle?.weeklyGoal || '',
    trainingDays: existingCycle?.trainingDays || [],
    focusMuscles: existingCycle?.focusMuscles || [],
    notes: existingCycle?.notes || '',
    planIds: existingCycle?.planIds || [],
  });

  const [errors, setErrors] = useState<Record<string, string>>({});

  const updateField = <K extends keyof typeof formData>(
    field: K,
    value: (typeof formData)[K]
  ) => {
    setFormData((prev) => ({ ...prev, [field]: value }));
    if (errors[field]) {
      setErrors((prev) => {
        const next = { ...prev };
        delete next[field];
        return next;
      });
    }
  };

  const toggleTrainingDay = (day: number) => {
    updateField(
      'trainingDays',
      formData.trainingDays.includes(day)
        ? formData.trainingDays.filter((d) => d !== day)
        : [...formData.trainingDays, day].sort()
    );
  };

  const toggleMuscle = (muscle: string) => {
    updateField(
      'focusMuscles',
      formData.focusMuscles.includes(muscle)
        ? formData.focusMuscles.filter((m) => m !== muscle)
        : [...formData.focusMuscles, muscle]
    );
  };

  const togglePlan = (planId: string) => {
    updateField(
      'planIds',
      formData.planIds.includes(planId)
        ? formData.planIds.filter((p) => p !== planId)
        : [...formData.planIds, planId]
    );
  };

  const validate = (): boolean => {
    const newErrors: Record<string, string> = {};

    if (!formData.name.trim()) {
      newErrors.name = '请输入周期名称';
    }
    if (!formData.weekStartDate) {
      newErrors.weekStartDate = '请选择开始日期';
    }
    if (!formData.weekEndDate) {
      newErrors.weekEndDate = '请选择结束日期';
    }
    if (formData.weekStartDate > formData.weekEndDate) {
      newErrors.weekEndDate = '结束日期不能早于开始日期';
    }

    setErrors(newErrors);
    return Object.keys(newErrors).length === 0;
  };

  const handleSubmit = (e: React.FormEvent) => {
    e.preventDefault();

    if (!validate()) return;

    const cycleData = {
      name: formData.name.trim(),
      weekStartDate: formData.weekStartDate,
      weekEndDate: formData.weekEndDate,
      weeklyGoal: formData.weeklyGoal.trim(),
      trainingDays: formData.trainingDays,
      focusMuscles: formData.focusMuscles,
      notes: formData.notes.trim(),
      planIds: formData.planIds,
    };

    if (isNew) {
      addCycle(cycleData);
    } else if (id) {
      updateCycle(id, cycleData);
    }

    navigate('/cycles');
  };

  return (
    <div className="space-y-6 animate-fade-in">
      <div className="flex items-center gap-4">
        <Link
          to="/cycles"
          className="p-2 rounded-lg bg-bg-tertiary text-text-muted hover:text-text hover:bg-bg-tertiary/80 transition-all duration-200"
        >
          <ArrowLeft className="w-5 h-5" />
        </Link>
        <div>
          <div className="flex items-center gap-2 text-text-muted mb-1">
            <Calendar className="w-4 h-4" />
            <span className="text-sm">{isNew ? '创建训练周期' : '编辑训练周期'}</span>
          </div>
          <h1 className="text-2xl md:text-3xl font-display tracking-wide text-text">
            {isNew ? '新建训练周期' : '编辑训练周期'}
          </h1>
        </div>
      </div>

      <form onSubmit={handleSubmit} className="space-y-6">
        <div className="card p-6 space-y-6">
          <div>
            <label className="label">周期名称 *</label>
            <input
              type="text"
              value={formData.name}
              onChange={(e) => updateField('name', e.target.value)}
              placeholder="例如：增肌第一周、减脂冲刺周"
              className={`input-field ${errors.name ? 'border-red-500' : ''}`}
            />
            {errors.name && <p className="text-red-400 text-sm mt-1">{errors.name}</p>}
          </div>

          <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
            <div>
              <label className="label">周开始日期 *</label>
              <input
                type="date"
                value={formData.weekStartDate}
                onChange={(e) => updateField('weekStartDate', e.target.value)}
                className={`input-field ${errors.weekStartDate ? 'border-red-500' : ''}`}
              />
              {errors.weekStartDate && (
                <p className="text-red-400 text-sm mt-1">{errors.weekStartDate}</p>
              )}
            </div>
            <div>
              <label className="label">周结束日期 *</label>
              <input
                type="date"
                value={formData.weekEndDate}
                onChange={(e) => updateField('weekEndDate', e.target.value)}
                className={`input-field ${errors.weekEndDate ? 'border-red-500' : ''}`}
              />
              {errors.weekEndDate && (
                <p className="text-red-400 text-sm mt-1">{errors.weekEndDate}</p>
              )}
            </div>
          </div>

          <div>
            <label className="label flex items-center gap-2">
              <Target className="w-4 h-4" />
              本周训练目标
            </label>
            <textarea
              value={formData.weeklyGoal}
              onChange={(e) => updateField('weeklyGoal', e.target.value)}
              placeholder="例如：完成全部4次训练、深蹲重量突破85kg、控制饮食保持热量缺口..."
              rows={2}
              className="input-field resize-none"
            />
          </div>

          <div>
            <label className="label flex items-center gap-2">
              <Dumbbell className="w-4 h-4" />
              训练日
            </label>
            <div className="grid grid-cols-7 gap-2">
              {WEEKDAY_NAMES.map((name, index) => (
                <button
                  key={name}
                  type="button"
                  onClick={() => toggleTrainingDay(index)}
                  className={`p-3 rounded-lg text-sm font-medium transition-all duration-200 ${
                    formData.trainingDays.includes(index)
                      ? 'bg-accent text-white shadow-glow'
                      : 'bg-bg-tertiary text-text-muted hover:bg-bg-tertiary/80'
                  }`}
                >
                  {name}
                </button>
              ))}
            </div>
          </div>

          <div>
            <label className="label">重点肌群</label>
            <div className="flex flex-wrap gap-2">
              {MUSCLE_GROUPS.map((muscle) => (
                <button
                  key={muscle}
                  type="button"
                  onClick={() => toggleMuscle(muscle)}
                  className={`px-4 py-2 rounded-lg text-sm font-medium transition-all duration-200 flex items-center gap-2 ${
                    formData.focusMuscles.includes(muscle)
                      ? 'bg-gold/20 text-gold border border-gold/30'
                      : 'bg-bg-tertiary text-text-muted hover:bg-bg-tertiary/80 border border-transparent'
                  }`}
                >
                  {formData.focusMuscles.includes(muscle) && (
                    <X className="w-3 h-3" />
                  )}
                  {muscle}
                </button>
              ))}
            </div>
          </div>

          <div>
            <label className="label">关联训练计划 (可选)</label>
            <div className="space-y-2">
              {plans.length === 0 ? (
                <p className="text-text-muted text-sm">暂无训练计划，可先创建训练计划</p>
              ) : (
                plans.map((plan) => (
                  <button
                    key={plan.id}
                    type="button"
                    onClick={() => togglePlan(plan.id)}
                    className={`w-full p-4 rounded-lg text-left transition-all duration-200 flex items-center justify-between ${
                      formData.planIds.includes(plan.id)
                        ? 'bg-accent/10 border border-accent/30'
                        : 'bg-bg-tertiary/50 border border-transparent hover:bg-bg-tertiary'
                    }`}
                  >
                    <div>
                      <p className="font-medium text-text">{plan.name}</p>
                      <p className="text-sm text-text-muted">
                        {plan.exercises.length} 个动作 · 训练日：
                        {plan.trainingDays.map((d) => WEEKDAY_NAMES[d]).join('、')}
                      </p>
                    </div>
                    <div
                      className={`w-6 h-6 rounded-full border-2 flex items-center justify-center transition-all ${
                        formData.planIds.includes(plan.id)
                          ? 'bg-accent border-accent'
                          : 'border-text-muted'
                      }`}
                    >
                      {formData.planIds.includes(plan.id) && (
                        <X className="w-4 h-4 text-white" />
                      )}
                    </div>
                  </button>
                ))
              )}
            </div>
          </div>

          <div>
            <label className="label">周期备注</label>
            <textarea
              value={formData.notes}
              onChange={(e) => updateField('notes', e.target.value)}
              placeholder="记录本周的注意事项、身体状态、饮食计划等..."
              rows={2}
              className="input-field resize-none"
            />
          </div>
        </div>

        <div className="flex justify-end gap-3">
          <Link to="/cycles" className="btn-secondary">
            取消
          </Link>
          <button type="submit" className="btn-primary inline-flex items-center gap-2">
            <Save className="w-4 h-4" />
            {isNew ? '创建周期' : '保存修改'}
          </button>
        </div>
      </form>
    </div>
  );
}
