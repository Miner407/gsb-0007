import { create } from 'zustand';
import { persist } from 'zustand/middleware';
import type { WorkoutPlan, Exercise, CheckinRecord, ExerciseCheckin } from '@/types';
import {
  getToday,
  getDayOfWeek,
  addDays,
  getStartOfWeek,
  getEndOfWeek,
  getDatesBetween,
} from '@/utils/date';

function generateId(): string {
  return Date.now().toString(36) + Math.random().toString(36).substr(2);
}

interface AppState {
  plans: WorkoutPlan[];
  checkins: CheckinRecord[];

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
  getExerciseWeightHistory: (exerciseId: string) => { date: string; weight: number }[];
  getTotalWorkoutDays: () => number;
  getAllExercises: () => Exercise[];
}

const samplePlans: WorkoutPlan[] = [
  {
    id: 'sample-push',
    name: '胸部三头训练日',
    trainingDays: [1, 4],
    createdAt: new Date().toISOString(),
    updatedAt: new Date().toISOString(),
    exercises: [
      { id: 'ex-1', name: '杠铃卧推', sets: 4, minReps: 6, maxReps: 10, targetWeight: 60 },
      { id: 'ex-2', name: '哑铃飞鸟', sets: 3, minReps: 10, maxReps: 15, targetWeight: 15 },
      { id: 'ex-3', name: '绳索下压', sets: 3, minReps: 12, maxReps: 15, targetWeight: 30 },
    ],
  },
  {
    id: 'sample-pull',
    name: '背部二头训练日',
    trainingDays: [2, 5],
    createdAt: new Date().toISOString(),
    updatedAt: new Date().toISOString(),
    exercises: [
      { id: 'ex-4', name: '引体向上', sets: 4, minReps: 6, maxReps: 10, targetWeight: 0 },
      { id: 'ex-5', name: '杠铃划船', sets: 4, minReps: 8, maxReps: 12, targetWeight: 50 },
      { id: 'ex-6', name: '哑铃弯举', sets: 3, minReps: 10, maxReps: 15, targetWeight: 12 },
    ],
  },
  {
    id: 'sample-legs',
    name: '腿部训练日',
    trainingDays: [3, 6],
    createdAt: new Date().toISOString(),
    updatedAt: new Date().toISOString(),
    exercises: [
      { id: 'ex-7', name: '杠铃深蹲', sets: 4, minReps: 6, maxReps: 10, targetWeight: 80 },
      { id: 'ex-8', name: '罗马尼亚硬拉', sets: 3, minReps: 8, maxReps: 12, targetWeight: 60 },
      { id: 'ex-9', name: '腿举', sets: 3, minReps: 10, maxReps: 15, targetWeight: 120 },
    ],
  },
];

export const useStore = create<AppState>()(
  persist(
    (set, get) => ({
      plans: samplePlans,
      checkins: [],

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
        return checkins.map((c) => ({
          date: c.date,
          weight: c.checkin.actualWeight || 0,
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
    }),
    {
      name: 'fitness-tracker',
      version: 1,
    }
  )
);
