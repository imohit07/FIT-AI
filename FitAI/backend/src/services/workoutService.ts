import { IExercise, IWorkoutLog, WorkoutLog } from "../models/WorkoutLog";

export async function addWorkoutEntry(
  userId: string,
  exercise: IExercise,
  date = new Date()
): Promise<IWorkoutLog> {
  let log = await WorkoutLog.findByUserAndDate(userId, date);
  
  if (!log) {
    // Create new workout log for the day
    log = await WorkoutLog.create({
      userId,
      date,
      exercises: [],
      totalCaloriesBurned: 0,
      totalDuration: 0
    });
  }

  // Add the new exercise
  const newExercises = [...log.exercises, exercise];
  const newTotalCalories = log.totalCaloriesBurned + exercise.caloriesBurned;
  const newTotalDuration = (log.totalDuration || 0) + (exercise.duration || 0);

  await WorkoutLog.update(log.id, {
    exercises: newExercises,
    totalCaloriesBurned: newTotalCalories,
    totalDuration: newTotalDuration
  });

  return { ...log, exercises: newExercises, totalCaloriesBurned: newTotalCalories, totalDuration: newTotalDuration };
}

export async function getTodayWorkout(userId: string, date = new Date()): Promise<IWorkoutLog | null> {
  return WorkoutLog.findByUserAndDate(userId, date);
}

export async function getWorkoutHistory(userId: string): Promise<IWorkoutLog[]> {
  return WorkoutLog.findByUser(userId);
}

export async function deleteWorkoutEntry(userId: string, exerciseIndex: number, date = new Date()): Promise<IWorkoutLog | null> {
  const log = await WorkoutLog.findByUserAndDate(userId, date);

  if (!log || !log.exercises[exerciseIndex]) {
    throw new Error("Exercise not found");
  }

  const exercise = log.exercises[exerciseIndex];
  const newExercises = log.exercises.filter((_, i) => i !== exerciseIndex);

  await WorkoutLog.update(log.id, {
    exercises: newExercises,
    totalCaloriesBurned: log.totalCaloriesBurned - exercise.caloriesBurned,
    totalDuration: (log.totalDuration || 0) - (exercise.duration || 0)
  });

  return { ...log, exercises: newExercises };
}
