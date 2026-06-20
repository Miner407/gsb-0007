import { Flame } from 'lucide-react';

interface Props {
  days: number;
}

export function StreakCard({ days }: Props) {
  return (
    <div className="card p-6 bg-gradient-to-br from-accent/10 via-bg-secondary to-gold/5 relative overflow-hidden">
      <div className="absolute top-0 right-0 w-32 h-32 bg-accent/10 rounded-full blur-3xl -translate-y-1/2 translate-x-1/2" />
      <div className="relative">
        <div className="flex items-start justify-between mb-4">
          <div>
            <p className="text-text-muted text-sm mb-1">连续打卡</p>
            <div className="flex items-baseline gap-2">
              <span className="text-5xl md:text-6xl font-display gradient-text text-shadow-glow animate-count">
                {days}
              </span>
              <span className="text-xl text-text-muted">天</span>
            </div>
          </div>
          <div className={`w-14 h-14 rounded-2xl bg-accent/20 flex items-center justify-center ${days > 0 ? 'animate-flame' : ''}`}>
            <Flame className={`w-7 h-7 ${days > 0 ? 'text-accent' : 'text-text-dim'}`} />
          </div>
        </div>
        <p className="text-sm text-text-muted">
          {days === 0
            ? '开始你的第一次训练吧！'
            : days >= 30
            ? '🔥 太厉害了！坚持一个月以上！'
            : days >= 7
            ? '💪 一周以上了，继续保持！'
            : '不错的开始，坚持下去！'}
        </p>
      </div>
    </div>
  );
}
