import { Calendar } from 'lucide-react';

interface Props {
  totalDays: number;
}

export function TotalCard({ totalDays }: Props) {
  return (
    <div className="card p-6">
      <div className="flex items-start justify-between mb-4">
        <div>
          <p className="text-text-muted text-sm mb-1">累计训练</p>
          <div className="flex items-baseline gap-2">
            <span className="text-5xl font-display text-text">{totalDays}</span>
            <span className="text-xl text-text-muted">天</span>
          </div>
        </div>
        <div className="w-14 h-14 rounded-2xl bg-text-muted/10 flex items-center justify-center">
          <Calendar className="w-7 h-7 text-text-muted" />
        </div>
      </div>
      <p className="text-sm text-text-muted">
        {totalDays === 0
          ? '开始记录你的训练旅程'
          : `已经坚持了 ${totalDays} 天，继续加油！`}
      </p>
    </div>
  );
}
