import { useMemo } from 'react';
import { Link } from 'react-router-dom';
import {
  Dumbbell,
  CheckSquare,
  ClipboardList,
  BarChart3,
  Flame,
  Target,
  ChevronRight,
  Calendar,
  TrendingUp,
  Activity,
  AlertTriangle,
  Zap,
  Gauge,
  Moon,
} from 'lucide-react';
import {
  LineChart,
  Line,
  XAxis,
  YAxis,
  CartesianGrid,
  Tooltip,
  ResponsiveContainer,
  Area,
  AreaChart,
} from 'recharts';
import { useStore } from '@/store/useStore';
import type { WorkoutPlan, CheckinRecord, TrainingInsights } from '@/types';
import {
  formatDateDisplay,
  getWeekdayName,
  getToday,
  getDayOfWeek,
  addDays,
  getStartOfWeek,
  getEndOfWeek,
  getDatesBetween,
} from '@/utils/date';

function getStreakDays(checkins: CheckinRecord[]) {
  if (checkins.length === 0) return 0;
  const checkinDates = new Set(checkins.map((c) => c.date));
  let streak = 0;
  let currentDate = getToday();
  if (!checkinDates.has(currentDate)) {
    currentDate = addDays(currentDate, -1);
    if (!checkinDates.has(currentDate)) return 0;
  }
  while (checkinDates.has(currentDate)) {
    streak++;
    currentDate = addDays(currentDate, -1);
  }
  return streak;
}

function getWeeklyWorkoutCount(checkins: CheckinRecord[]) {
  const today = getToday();
  const startOfWeek = getStartOfWeek(today);
  const endOfWeek = getEndOfWeek(today);
  const weekDates = getDatesBetween(startOfWeek, endOfWeek);
  const checkinDates = new Set(checkins.map((c) => c.date));
  return weekDates.filter((d) => checkinDates.has(d)).length;
}

function getPlansForToday(plans: WorkoutPlan[]) {
  const today = getToday();
  const dayOfWeek = getDayOfWeek(today);
  return plans.filter((p) => p.trainingDays.includes(dayOfWeek));
}

function formatVolume(volume: number): string {
  if (volume >= 10000) {
    return (volume / 1000).toFixed(1) + 'k';
  }
  return volume.toLocaleString();
}

function RiskAlert({ message, type }: { message: string; type?: 'warning' | 'danger' | 'info' }) {
  const colorMap = {
    warning: 'bg-yellow-500/10 border-yellow-500/30 text-yellow-500',
    danger: 'bg-red-500/10 border-red-500/30 text-red-400',
    info: 'bg-accent/10 border-accent/30 text-accent',
  };
  const iconColor = type === 'warning' ? 'text-yellow-500' : type === 'danger' ? 'text-red-400' : 'text-accent';

  return (
    <div className={`flex items-start gap-3 p-3 rounded-lg border ${colorMap[type || 'info']}`}>
      <AlertTriangle className={`w-5 h-5 shrink-0 mt-0.5 ${iconColor}`} />
      <p className="text-sm">{message}</p>
    </div>
  );
}

function InsightsPanel({ insights }: { insights: TrainingInsights }) {
  const recoveryChartData = insights.recoveryTrend.map((r) => ({
    date: formatDateDisplay(r.date),
    score: r.score,
  }));

  const insightCards = [
    {
      icon: Activity,
      label: '近7天训练',
      value: insights.last7DaysWorkouts,
      unit: '次',
      gradient: 'from-accent/20 to-accent/5',
      iconColor: 'text-accent',
    },
    {
      icon: TrendingUp,
      label: '近7天训练量',
      value: formatVolume(insights.last7DaysVolume),
      unit: 'kg',
      gradient: 'from-gold/20 to-gold/5',
      iconColor: 'text-gold',
    },
    {
      icon: Gauge,
      label: '平均 RPE',
      value: insights.averageRPE || '-',
      unit: '',
      gradient: 'from-purple-500/20 to-purple-500/5',
      iconColor: 'text-purple-400',
    },
    {
      icon: Flame,
      label: '连续打卡',
      value: insights.streakDays,
      unit: '天',
      gradient: 'from-orange-500/20 to-orange-500/5',
      iconColor: 'text-orange-400',
    },
  ];

  return (
    <div className="space-y-4">
      <div className="flex items-center justify-between">
        <div className="flex items-center gap-2">
          <Zap className="w-5 h-5 text-gold" />
          <h2 className="text-xl font-display tracking-wide text-text">训练洞察</h2>
        </div>
        <Link to="/recovery" className="text-sm text-accent hover:text-accent-hover flex items-center gap-1">
          记录恢复 <ChevronRight className="w-4 h-4" />
        </Link>
      </div>

      <div className="grid grid-cols-2 md:grid-cols-4 gap-3">
        {insightCards.map(({ icon: Icon, label, value, unit, gradient, iconColor }) => (
          <div key={label} className="card p-4">
            <div className={`w-10 h-10 rounded-xl bg-gradient-to-br ${gradient} flex items-center justify-center mb-3`}>
              <Icon className={`w-5 h-5 ${iconColor}`} />
            </div>
            <div className="flex items-baseline gap-1">
              <span className="text-2xl font-display text-text">{value}</span>
              {unit && <span className="text-sm text-text-muted">{unit}</span>}
            </div>
            <p className="text-xs text-text-muted mt-0.5">{label}</p>
          </div>
        ))}
      </div>

      <div className="grid grid-cols-1 lg:grid-cols-2 gap-4">
        <div className="card p-5">
          <div className="flex items-center gap-2 mb-4">
            <Moon className="w-4 h-4 text-accent" />
            <h3 className="font-semibold text-text">恢复评分趋势</h3>
          </div>
          {recoveryChartData.some((d) => d.score > 0) ? (
            <div className="h-48">
              <ResponsiveContainer width="100%" height="100%">
                <AreaChart data={recoveryChartData} margin={{ top: 5, right: 10, left: 0, bottom: 5 }}>
                  <defs>
                    <linearGradient id="recoveryGradient" x1="0" y1="0" x2="0" y2="1">
                      <stop offset="5%" stopColor="#ff6b35" stopOpacity={0.3} />
                      <stop offset="95%" stopColor="#ff6b35" stopOpacity={0} />
                    </linearGradient>
                  </defs>
                  <CartesianGrid strokeDasharray="3 3" stroke="#2d2d2d" vertical={false} />
                  <XAxis
                    dataKey="date"
                    stroke="#555555"
                    fontSize={11}
                    tickLine={false}
                    axisLine={false}
                  />
                  <YAxis
                    stroke="#555555"
                    fontSize={11}
                    tickLine={false}
                    axisLine={false}
                    domain={[0, 100]}
                  />
                  <Tooltip
                    contentStyle={{
                      backgroundColor: '#1a1a1a',
                      border: '1px solid #2d2d2d',
                      borderRadius: '8px',
                      color: '#e0e0e0',
                    }}
                    labelStyle={{ color: '#888888' }}
                    formatter={(value: number) => [`${value} 分`, '恢复评分']}
                  />
                  <Area
                    type="monotone"
                    dataKey="score"
                    stroke="#ff6b35"
                    strokeWidth={2}
                    fill="url(#recoveryGradient)"
                    dot={{ fill: '#ff6b35', r: 3, strokeWidth: 2, stroke: '#1a1a1a' }}
                    activeDot={{ r: 5, fill: '#ff6b35' }}
                  />
                </AreaChart>
              </ResponsiveContainer>
            </div>
          ) : (
            <div className="h-48 flex items-center justify-center">
              <div className="text-center">
                <Moon className="w-10 h-10 mx-auto text-text-dim mb-2" />
                <p className="text-text-muted text-sm">记录恢复状态后查看趋势</p>
                <Link to="/recovery" className="text-accent text-sm hover:underline mt-2 inline-block">
                  去记录
                </Link>
              </div>
            </div>
          )}
        </div>

        <div className="card p-5">
          <div className="flex items-center gap-2 mb-4">
            <AlertTriangle className="w-4 h-4 text-yellow-500" />
            <h3 className="font-semibold text-text">高风险训练提示</h3>
          </div>
          {insights.highRiskAlerts.length > 0 ? (
            <div className="space-y-2 max-h-48 overflow-y-auto">
              {insights.highRiskAlerts.map((alert, index) => (
                <RiskAlert
                  key={index}
                  message={alert}
                  type={
                    alert.includes('疼痛') || alert.includes('高强度')
                      ? 'danger'
                      : alert.includes('较低')
                      ? 'warning'
                      : 'info'
                  }
                />
              ))}
            </div>
          ) : (
            <div className="h-48 flex items-center justify-center">
              <div className="text-center">
                <CheckSquare className="w-10 h-10 mx-auto text-green-400 mb-2" />
                <p className="text-green-400 text-sm font-medium">训练状态良好</p>
                <p className="text-text-muted text-sm mt-1">继续保持科学训练</p>
              </div>
            </div>
          )}
        </div>
      </div>
    </div>
  );
}

export function Dashboard() {
  const today = getToday();
  const plans = useStore((s) => s.plans);
  const checkins = useStore((s) => s.checkins);
  const getTrainingInsights = useStore((s) => s.getTrainingInsights);
  const getCurrentTrainingCycle = useStore((s) => s.getCurrentTrainingCycle);

  const insights = useMemo(() => getTrainingInsights(), [getTrainingInsights]);
  const currentCycle = useMemo(() => getCurrentTrainingCycle(), [getCurrentTrainingCycle]);
  const plansForToday = useMemo(() => getPlansForToday(plans), [plans]);
  const streakDays = useMemo(() => getStreakDays(checkins), [checkins]);
  const weeklyCount = useMemo(() => getWeeklyWorkoutCount(checkins), [checkins]);
  const totalDays = checkins.length;
  const plansCount = plans.length;

  const todayPlan = plansForToday[0];
  const todayCheckin = useMemo(
    () => checkins.find((c) => c.date === today),
    [checkins, today]
  );

  const completedCount = useMemo(() => {
    if (!todayCheckin) return 0;
    return todayCheckin.exercises.filter((e) => e.completed).length;
  }, [todayCheckin]);

  const totalExercises = todayPlan?.exercises.length || 0;
  const progress = totalExercises > 0 ? (completedCount / totalExercises) * 100 : 0;

  const quickActions = [
    {
      to: '/checkin',
      icon: CheckSquare,
      label: '今日打卡',
      desc: todayPlan ? todayPlan.name : '今天是休息日',
      accent: true,
    },
    {
      to: '/cycles',
      icon: Calendar,
      label: '训练周期',
      desc: currentCycle ? '当前周期进行中' : '创建训练周期',
    },
    {
      to: '/recovery',
      icon: Moon,
      label: '恢复记录',
      desc: '记录睡眠与疲劳',
    },
    {
      to: '/plans',
      icon: ClipboardList,
      label: '训练计划',
      desc: `${plansCount} 个训练计划`,
    },
    {
      to: '/stats',
      icon: BarChart3,
      label: '数据统计',
      desc: '查看训练进度',
    },
  ];

  const stats = [
    {
      icon: Flame,
      value: streakDays,
      label: '连续打卡',
      unit: '天',
      gradient: 'from-accent/20 to-accent/5',
      iconColor: 'text-accent',
    },
    {
      icon: Target,
      value: weeklyCount,
      label: '本周训练',
      unit: '次',
      gradient: 'from-gold/20 to-gold/5',
      iconColor: 'text-gold',
    },
    {
      icon: Calendar,
      value: totalDays,
      label: '累计训练',
      unit: '天',
      gradient: 'from-text-muted/20 to-text-muted/5',
      iconColor: 'text-text-muted',
    },
  ];

  return (
    <div className="space-y-6 animate-fade-in">
      <div className="card p-6 md:p-8 bg-gradient-to-br from-accent/10 via-bg-secondary to-gold/5 relative overflow-hidden">
        <div className="absolute -top-20 -right-20 w-60 h-60 bg-accent/10 rounded-full blur-3xl" />
        <div className="absolute -bottom-20 -left-20 w-60 h-60 bg-gold/10 rounded-full blur-3xl" />
        <div className="relative">
          <div className="flex items-center gap-2 text-text-muted mb-2">
            <Calendar className="w-4 h-4" />
            <span className="text-sm">{formatDateDisplay(today)} · {getWeekdayName(today)}</span>
          </div>
          <h1 className="text-3xl md:text-4xl font-display tracking-wide gradient-text mb-2">
            准备好训练了吗？
          </h1>
          <p className="text-text-muted max-w-lg">
            {todayPlan
              ? `今日安排：${todayPlan.name}，共 ${totalExercises} 个动作`
              : '今天没有安排训练，好好休息或查看你的训练计划'}
          </p>

          {todayPlan && (
            <div className="mt-6">
              <div className="flex items-center justify-between mb-2">
                <span className="text-sm text-text-muted">今日进度</span>
                <span className="text-sm font-medium gradient-text">
                  {completedCount}/{totalExercises}
                </span>
              </div>
              <div className="progress-bar">
                <div
                  className="progress-bar-fill"
                  style={{ width: `${progress}%` }}
                />
              </div>
            </div>
          )}
        </div>
      </div>

      <div className="grid grid-cols-1 md:grid-cols-3 lg:grid-cols-5 gap-4">
        {quickActions.map(({ to, icon: Icon, label, desc, accent }) => (
          <Link
            key={to}
            to={to}
            className={`card card-hover p-5 flex flex-col gap-3 ${
              accent ? 'border-accent/30' : ''
            }`}
          >
            <div
              className={`w-12 h-12 rounded-xl flex items-center justify-center shrink-0 ${
                accent
                  ? 'bg-gradient-to-br from-accent to-accent-hover shadow-glow'
                  : 'bg-bg-tertiary'
              }`}
            >
              <Icon className={`w-6 h-6 ${accent ? 'text-white' : 'text-text'}`} />
            </div>
            <div>
              <p className="font-semibold text-text">{label}</p>
              <p className="text-sm text-text-muted line-clamp-2">{desc}</p>
            </div>
          </Link>
        ))}
      </div>

      <div className="grid grid-cols-3 gap-3 md:gap-4">
        {stats.map(({ icon: Icon, value, label, unit, gradient, iconColor }) => (
          <div key={label} className="card p-4 md:p-5">
            <div className={`w-10 h-10 rounded-xl bg-gradient-to-br ${gradient} flex items-center justify-center mb-3`}>
              <Icon className={`w-5 h-5 ${iconColor}`} />
            </div>
            <div className="flex items-baseline gap-1">
              <span className="text-2xl md:text-3xl font-display text-text">{value}</span>
              <span className="text-sm text-text-muted">{unit}</span>
            </div>
            <p className="text-xs md:text-sm text-text-muted mt-0.5">{label}</p>
          </div>
        ))}
      </div>

      <InsightsPanel insights={insights} />

      {todayPlan && (
        <div className="card p-5">
          <div className="flex items-center justify-between mb-4">
            <div className="flex items-center gap-2">
              <Dumbbell className="w-5 h-5 text-accent" />
              <h3 className="font-semibold text-text">今日动作</h3>
            </div>
            <Link to="/checkin" className="text-sm text-accent hover:text-accent-hover flex items-center gap-1">
              去打卡 <ChevronRight className="w-4 h-4" />
            </Link>
          </div>
          <div className="space-y-2">
            {todayPlan.exercises.slice(0, 4).map((ex) => {
              const checkedIn = todayCheckin?.exercises.find(
                (c) => c.exerciseId === ex.id
              )?.completed;
              return (
                <div
                  key={ex.id}
                  className={`flex items-center justify-between py-2.5 px-4 rounded-lg ${
                    checkedIn ? 'bg-accent/10' : 'bg-bg-tertiary/50'
                  }`}
                >
                  <span className={`font-medium ${checkedIn ? 'text-accent line-through' : 'text-text'}`}>
                    {ex.name}
                  </span>
                  <span className="text-sm text-text-muted">
                    {ex.sets}组 × {ex.minReps}-{ex.maxReps}次
                  </span>
                </div>
              );
            })}
            {todayPlan.exercises.length > 4 && (
              <p className="text-xs text-text-muted text-center pt-1">
                还有 {todayPlan.exercises.length - 4} 个动作...
              </p>
            )}
          </div>
        </div>
      )}
    </div>
  );
}
