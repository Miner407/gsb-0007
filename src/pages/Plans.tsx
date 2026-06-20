import { Link } from 'react-router-dom';
import { Plus, ClipboardList } from 'lucide-react';
import { useStore } from '@/store/useStore';
import { PlanCard } from '@/components/plans/PlanCard';

export function Plans() {
  const plans = useStore((s) => s.plans);
  const deletePlan = useStore((s) => s.deletePlan);

  const handleDelete = (id: string, name: string) => {
    if (window.confirm(`确定要删除训练计划"${name}"吗？`)) {
      deletePlan(id);
    }
  };

  return (
    <div className="space-y-6 animate-fade-in">
      <div className="flex flex-col sm:flex-row sm:items-center sm:justify-between gap-4">
        <div>
          <h1 className="text-2xl md:text-3xl font-display tracking-wide text-text">
            训练计划
          </h1>
          <p className="text-text-muted mt-1">
            管理你的所有训练计划，共 {plans.length} 个
          </p>
        </div>
        <Link to="/plans/new" className="btn-primary flex items-center gap-2 justify-center">
          <Plus className="w-4 h-4" />
          新建计划
        </Link>
      </div>

      {plans.length === 0 ? (
        <div className="card p-12 text-center">
          <div className="w-16 h-16 mx-auto rounded-2xl bg-accent/10 flex items-center justify-center mb-4">
            <ClipboardList className="w-8 h-8 text-accent" />
          </div>
          <h3 className="text-xl font-semibold text-text mb-2">还没有训练计划</h3>
          <p className="text-text-muted mb-6">
            创建你的第一个训练计划，开始系统化训练
          </p>
          <Link to="/plans/new" className="btn-primary inline-flex items-center gap-2">
            <Plus className="w-4 h-4" />
            创建训练计划
          </Link>
        </div>
      ) : (
        <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
          {plans.map((plan) => (
            <PlanCard
              key={plan.id}
              plan={plan}
              onDelete={() => handleDelete(plan.id, plan.name)}
            />
          ))}
        </div>
      )}
    </div>
  );
}
