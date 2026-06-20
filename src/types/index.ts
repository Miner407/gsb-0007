export interface Exercise {
  id: string;
  name: string;
  sets: number;
  minReps: number;
  maxReps: number;
  targetWeight: number;
  muscleGroup?: string;
}

export interface WorkoutPlan {
  id: string;
  name: string;
  trainingDays: number[];
  exercises: Exercise[];
  createdAt: string;
  updatedAt: string;
}

export interface ExerciseCheckin {
  exerciseId: string;
  exerciseName: string;
  completed: boolean;
  actualWeight: number;
  notes: string;
  completedSets: number;
  completedReps: number;
  rpe?: number;
  quality?: number;
  pain?: number;
  painLocation?: string;
}

export interface CheckinRecord {
  id: string;
  date: string;
  planId: string;
  planName: string;
  exercises: ExerciseCheckin[];
  createdAt: string;
}

export interface TrainingCycle {
  id: string;
  name: string;
  weekStartDate: string;
  weekEndDate: string;
  weeklyGoal: string;
  trainingDays: number[];
  focusMuscles: string[];
  notes: string;
  planIds: string[];
  createdAt: string;
  updatedAt: string;
}

export interface RecoveryRecord {
  id: string;
  date: string;
  sleepHours: number;
  fatigueLevel: number;
  sorenessLevel: number;
  stressLevel: number;
  notes: string;
  createdAt: string;
}

export interface TrainingInsights {
  last7DaysWorkouts: number;
  last7DaysVolume: number;
  averageRPE: number;
  streakDays: number;
  recoveryTrend: { date: string; score: number }[];
  highRiskAlerts: string[];
}

export interface WeightChartFilter {
  exerciseId: string | null;
  timeRange: '7d' | '30d' | '90d' | 'all';
  showTarget: boolean;
}

export type TrainingDay = 0 | 1 | 2 | 3 | 4 | 5 | 6;

export const MUSCLE_GROUPS = [
  '胸部', '背部', '肩部', '肱二头肌', '肱三头肌',
  '股四头肌', '腘绳肌', '臀部', '核心', '小腿', '全身'
];

export const WEEKDAY_NAMES = ['周日', '周一', '周二', '周三', '周四', '周五', '周六'];

export const RPE_LABELS: Record<number, string> = {
  1: '非常轻松', 2: '很轻松', 3: '轻松', 4: '较为轻松',
  5: '中等强度', 6: '有挑战性', 7: '较难', 8: '困难',
  9: '接近极限', 10: '极限'
};

export const QUALITY_LABELS: Record<number, string> = {
  1: '动作变形严重', 2: '动作质量较差', 3: '动作质量一般',
  4: '动作质量良好', 5: '动作质量优秀'
};

export const PAIN_LABELS: Record<number, string> = {
  0: '无疼痛', 1: '轻微不适', 2: '轻度疼痛',
  3: '中度疼痛', 4: '较重疼痛', 5: '剧烈疼痛'
};
