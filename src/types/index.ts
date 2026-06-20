export interface Exercise {
  id: string;
  name: string;
  sets: number;
  minReps: number;
  maxReps: number;
  targetWeight: number;
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
}

export interface CheckinRecord {
  id: string;
  date: string;
  planId: string;
  planName: string;
  exercises: ExerciseCheckin[];
  createdAt: string;
}

export type TrainingDay = 0 | 1 | 2 | 3 | 4 | 5 | 6;

export const WEEKDAY_NAMES = ['周日', '周一', '周二', '周三', '周四', '周五', '周六'];
