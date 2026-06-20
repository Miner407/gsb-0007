import { create } from 'zustand';
import { persist } from 'zustand/middleware';
import type {
  WorkoutPlan,
  Exercise,
  CheckinRecord,
  ExerciseCheckin,
  TrainingCycle,
  RecoveryRecord,
  TrainingInsights,
  WeightChartFilter,
} from '@/types';
import {
  getToday,
  getDayOfWeek,
  addDays,
  getStartOfWeek,
  getEndOfWeek,
  getDatesBetween,
  isSameDay,
} from '@/utils/date';

function generateId(): string {
  return Date.now().toString(36) + Math.random().toString(36).substr(2);
}

function calculateVolume(exercise: ExerciseCheckin): number {
  return (exercise.actualWeight || 0) * (exercise.completedSets || 0) * (exercise.completedReps || 0);
}

function calculateRecoveryScore(record: RecoveryRecord): number {
  const sleepScore = Math.min((record.sleepHours / 9) * 30, 30);
  const fatigueScore = (5 - record.fatigueLevel) * 20;
  const sorenessScore = (5 - record.sorenessLevel) * 25;
  const stressScore = (5 - record.stressLevel) * 25;
  return Math.round(sleepScore + fatigueScore + sorenessScore + stressScore);
}

interface AppState {
  plans: WorkoutPlan[];
  checkins: CheckinRecord[];
  trainingCycles: TrainingCycle[];
  recoveryRecords: RecoveryRecord[];
  weightChartFilter: WeightChartFilter;

  addPlan: (plan: Omit<WorkoutPlan, 'id' | 'createdAt' | 'updatedAt'>) => void;
  updatePlan: (id: string, plan: Partial<Omit<WorkoutPlan, 'id' | 'createdAt'>>) => void;
  deletePlan: (id: string) => void;
  getPlanById: (id: string) => WorkoutPlan | undefined;

  addCheckin: (checkin: Omit<CheckinRecord, 'id' | 'createdAt'>) => void;
  updateExerciseCheckin: (
    date: string,
    exerciseId: string,
    data: Partial<ExerciseCheckin>
  ) => void;
  getCheckinByDate: (date: string) => CheckinRecord | undefined;
  getCheckinsByExercise: (exerciseId: string) => { date: string; checkin: ExerciseCheckin }[];

  getPlansForToday: () => WorkoutPlan[];
  getPlansForDate: (dateStr: string) => WorkoutPlan[];

  getStreakDays: () => number;
  getWeeklyWorkoutCount: () => number;
  getExerciseWeightHistory: (exerciseId: string) => { date: string; weight: number; targetWeight: number }[];
  getTotalWorkoutDays: () => number;
  getAllExercises: () => Exercise[];

  addTrainingCycle: (cycle: Omit<TrainingCycle, 'id' | 'createdAt' | 'updatedAt'>) => void;
  updateTrainingCycle: (id: string, cycle: Partial<Omit<TrainingCycle, 'id' | 'createdAt'>>) => void;
  deleteTrainingCycle: (id: string) => void;
  getTrainingCycleById: (id: string) => TrainingCycle | undefined;
  getCurrentTrainingCycle: () => TrainingCycle | undefined;
  getTrainingCycles: () => TrainingCycle[];

  addRecoveryRecord: (record: Omit<RecoveryRecord, 'id' | 'createdAt'>) => void;
  updateRecoveryRecord: (id: string, record: Partial<Omit<RecoveryRecord, 'id' | 'date' | 'createdAt'>>) => void;
  getRecoveryRecordByDate: (date: string) => RecoveryRecord | undefined;
  getRecoveryRecords: () => RecoveryRecord[];

  getTrainingInsights: () => TrainingInsights;

  setWeightChartFilter: (filter: Partial<WeightChartFilter>) => void;
}

const samplePlans: WorkoutPlan[] = [
  {
    id: 'sample-push',
    name: '胸部三头训练日',
    trainingDays: [1, 4],
    createdAt: new Date().toISOString(),
    updatedAt: new Date().toISOString(),
    exercises: [
      { id: 'ex-1', name: '杠铃卧推', sets: 4, minReps: 6, maxReps: 10, targetWeight: 60, muscleGroup: '胸部' },
      { id: 'ex-2', name: '哑铃飞鸟', sets: 3, minReps: 10, maxReps: 15, targetWeight: 15, muscleGroup: '胸部' },
      { id: 'ex-3', name: '绳索下压', sets: 3, minReps: 12, maxReps: 15, targetWeight: 30, muscleGroup: '肱三头肌' },
    ],
  },
  {
    id: 'sample-pull',
    name: '背部二头训练日',
    trainingDays: [2, 5],
    createdAt: new Date().toISOString(),
    updatedAt: new Date().toISOString(),
    exercises: [
      { id: 'ex-4', name: '引体向上', sets: 4, minReps: 6, maxReps: 10, targetWeight: 0, muscleGroup: '背部' },
      { id: 'ex-5', name: '杠铃划船', sets: 4, minReps: 8, maxReps: 12, targetWeight: 50, muscleGroup: '背部' },
      { id: 'ex-6', name: '哑铃弯举', sets: 3, minReps: 10, maxReps: 15, targetWeight: 12, muscleGroup: '肱二头肌' },
    ],
  },
  {
    id: 'sample-legs',
    name: '腿部训练日',
    trainingDays: [3, 6],
    createdAt: new Date().toISOString(),
    updatedAt: new Date().toISOString(),
    exercises: [
      { id: 'ex-7', name: '杠铃深蹲', sets: 4, minReps: 6, maxReps: 10, targetWeight: 80, muscleGroup: '股四头肌' },
      { id: 'ex-8', name: '罗马尼亚硬拉', sets: 3, minReps: 8, maxReps: 12, targetWeight: 60, muscleGroup: '腘绳肌' },
      { id: 'ex-9', name: '腿举', sets: 3, minReps: 10, maxReps: 15, targetWeight: 120, muscleGroup: '股四头肌' },
    ],
  },
];

const defaultWeightChartFilter: WeightChartFilter = {
  exerciseId: null,
  timeRange: '30d',
  showTarget: true,
};

export const useStore = create<AppState>()(
  persist(
    (set, get) => ({
      plans: samplePlans,
      checkins: [],
      trainingCycles: [],
      recoveryRecords: [],
      weightChartFilter: defaultWeightChartFilter,

      addPlan: (plan) => {
        const now = new Date().toISOString();
        const newPlan: WorkoutPlan = {
          ...plan,
          id: generateId(),
          createdAt: now,
          updatedAt: now,
        };
        set((state) => ({ plans: [...state.plans, newPlan] }));
      },

      updatePlan: (id, plan) => {
        set((state) => ({
          plans: state.plans.map((p) =>
            p.id === id ? { ...p, ...plan, updatedAt: new Date().toISOString() } : p
          ),
        }));
      },

      deletePlan: (id) => {
        set((state) => ({
          plans: state.plans.filter((p) => p.id !== id),
        }));
      },

      getPlanById: (id) => {
        return get().plans.find((p) => p.id === id);
      },

      addCheckin: (checkin) => {
        const existing = get().checkins.find((c) => c.date === checkin.date);
        if (existing) {
          set((state) => ({
            checkins: state.checkins.map((c) =>
              c.date === checkin.date
                ? { ...c, exercises: checkin.exercises, planId: checkin.planId, planName: checkin.planName }
                : c
            ),
          }));
        } else {
          const newCheckin: CheckinRecord = {
            ...checkin,
            id: generateId(),
            createdAt: new Date().toISOString(),
          };
          set((state) => ({ checkins: [...state.checkins, newCheckin] }));
        }
      },

      updateExerciseCheckin: (date, exerciseId, data) => {
        const state = get();
        const checkin = state.checkins.find((c) => c.date === date);
        if (!checkin) return;

        set({
          checkins: state.checkins.map((c) =>
            c.date === date
              ? {
                  ...c,
                  exercises: c.exercises.map((e) =>
                    e.exerciseId === exerciseId ? { ...e, ...data } : e
                  ),
                }
              : c
          ),
        });
      },

      getCheckinByDate: (date) => {
        return get().checkins.find((c) => c.date === date);
      },

      getCheckinsByExercise: (exerciseId) => {
        const result: { date: string; checkin: ExerciseCheckin }[] = [];
        for (const checkin of get().checkins) {
          const ex = checkin.exercises.find((e) => e.exerciseId === exerciseId);
          if (ex && ex.completed) {
            result.push({ date: checkin.date, checkin: ex });
          }
        }
        return result.sort((a, b) => a.date.localeCompare(b.date));
      },

      getPlansForToday: () => {
        return get().getPlansForDate(getToday());
      },

      getPlansForDate: (dateStr) => {
        const dayOfWeek = getDayOfWeek(dateStr);
        return get().plans.filter((p) => p.trainingDays.includes(dayOfWeek));
      },

      getStreakDays: () => {
        const checkins = get().checkins;
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
      },

      getWeeklyWorkoutCount: () => {
        const today = getToday();
        const startOfWeek = getStartOfWeek(today);
        const endOfWeek = getEndOfWeek(today);
        const weekDates = getDatesBetween(startOfWeek, endOfWeek);
        const checkinDates = new Set(get().checkins.map((c) => c.date));
        return weekDates.filter((d) => checkinDates.has(d)).length;
      },

      getExerciseWeightHistory: (exerciseId) => {
        const checkins = get().getCheckinsByExercise(exerciseId);
        const plans = get().plans;
        let targetWeight = 0;

        for (const plan of plans) {
          const ex = plan.exercises.find((e) => e.id === exerciseId);
          if (ex) {
            targetWeight = ex.targetWeight;
            break;
          }
        }

        return checkins.map((c) => ({
          date: c.date,
          weight: c.checkin.actualWeight || 0,
          targetWeight,
        }));
      },

      getTotalWorkoutDays: () => {
        return get().checkins.length;
      },

      getAllExercises: () => {
        const exercises: Exercise[] = [];
        const seen = new Set<string>();
        for (const plan of get().plans) {
          for (const ex of plan.exercises) {
            if (!seen.has(ex.id)) {
              seen.add(ex.id);
              exercises.push(ex);
            }
          }
        }
        return exercises;
      },

      addTrainingCycle: (cycle) => {
        const now = new Date().toISOString();
        const newCycle: TrainingCycle = {
          ...cycle,
          id: generateId(),
          createdAt: now,
          updatedAt: now,
        };
        set((state) => ({ trainingCycles: [...state.trainingCycles, newCycle] }));
      },

      updateTrainingCycle: (id, cycle) => {
        set((state) => ({
          trainingCycles: state.trainingCycles.map((c) =>
            c.id === id ? { ...c, ...cycle, updatedAt: new Date().toISOString() } : c
          ),
        }));
      },

      deleteTrainingCycle: (id) => {
        set((state) => ({
          trainingCycles: state.trainingCycles.filter((c) => c.id !== id),
        }));
      },

      getTrainingCycleById: (id) => {
        return get().trainingCycles.find((c) => c.id === id);
      },

      getCurrentTrainingCycle: () => {
        const today = getToday();
        return get().trainingCycles.find(
          (c) => c.weekStartDate <= today && c.weekEndDate >= today
        );
      },

      getTrainingCycles: () => {
        return [...get().trainingCycles].sort((a, b) => b.weekStartDate.localeCompare(a.weekStartDate));
      },

      addRecoveryRecord: (record) => {
        const existing = get().recoveryRecords.find((r) => r.date === record.date);
        if (existing) {
          get().updateRecoveryRecord(existing.id, record);
        } else {
          const newRecord: RecoveryRecord = {
            ...record,
            id: generateId(),
            createdAt: new Date().toISOString(),
          };
          set((state) => ({ recoveryRecords: [...state.recoveryRecords, newRecord] }));
        }
      },

      updateRecoveryRecord: (id, record) => {
        set((state) => ({
          recoveryRecords: state.recoveryRecords.map((r) =>
            r.id === id ? { ...r, ...record } : r
          ),
        }));
      },

      getRecoveryRecordByDate: (date) => {
        return get().recoveryRecords.find((r) => r.date === date);
      },

      getRecoveryRecords: () => {
        return [...get().recoveryRecords].sort((a, b) => b.date.localeCompare(a.date));
      },

      getTrainingInsights: () => {
        const state = get();
        const today = getToday();
        const last7Days = getDatesBetween(addDays(today, -6), today);

        const recentCheckins = state.checkins.filter((c) => last7Days.includes(c.date));
        const last7DaysWorkouts = recentCheckins.length;

        let last7DaysVolume = 0;
        let totalRPE = 0;
        let rpeCount = 0;

        for (const checkin of recentCheckins) {
          for (const ex of checkin.exercises) {
            if (ex.completed) {
              last7DaysVolume += calculateVolume(ex);
              if (ex.rpe !== undefined && ex.rpe > 0) {
                totalRPE += ex.rpe;
                rpeCount++;
              }
            }
          }
        }

        const averageRPE = rpeCount > 0 ? Math.round((totalRPE / rpeCount) * 10) / 10 : 0;
        const streakDays = state.getStreakDays();

        const recoveryTrend = last7Days.map((date) => {
          const record = state.getRecoveryRecordByDate(date);
          const score = record ? calculateRecoveryScore(record) : 0;
          return { date, score };
        });

        const highRiskAlerts: string[] = [];

        if (averageRPE >= 8 && last7DaysWorkouts >= 5) {
          highRiskAlerts.push('连续高强度训练，建议安排休息日');
        }

        const recentRecovery = recoveryTrend.slice(-3);
        const lowRecoveryCount = recentRecovery.filter((r) => r.score > 0 && r.score < 50).length;
        if (lowRecoveryCount >= 2) {
          highRiskAlerts.push('连续多日恢复评分较低，注意疲劳管理');
        }

        for (const checkin of recentCheckins) {
          for (const ex of checkin.exercises) {
            if (ex.pain !== undefined && ex.pain >= 3) {
              highRiskAlerts.push(`${ex.exerciseName} 记录到中度以上疼痛，建议咨询专业人士`);
            }
          }
        }

        const lastRecovery = recoveryTrend[recoveryTrend.length - 1];
        if (lastRecovery?.score === 0 && last7DaysWorkouts >= 3) {
          highRiskAlerts.push('建议记录恢复状态以更好地管理训练负荷');
        }

        return {
          last7DaysWorkouts,
          last7DaysVolume,
          averageRPE,
          streakDays,
          recoveryTrend,
          highRiskAlerts: [...new Set(highRiskAlerts)].slice(0, 5),
        };
      },

      setWeightChartFilter: (filter) => {
        set((state) => ({
          weightChartFilter: { ...state.weightChartFilter, ...filter },
        }));
      },
    }),
    {
      name: 'fitness-tracker',
      version: 2,
      migrate: (persistedState: unknown, version) => {
        const state = persistedState as Record<string, unknown>;
        if (version === 1) {
          return {
            ...state,
            trainingCycles: [],
            recoveryRecords: [],
            weightChartFilter: defaultWeightChartFilter,
          };
        }
        return state;
      },
    }
  )
);
