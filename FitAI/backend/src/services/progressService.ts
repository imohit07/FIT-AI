import { IProgress, Progress } from "../models/Progress";

export async function updateProgress(
  userId: string,
  data: { weight: number; bodyFat?: number; date?: Date }
): Promise<IProgress> {
  const date = data.date ?? new Date();
  
  let progress = await Progress.findByUserAndDate(userId, date);

  if (!progress) {
    // Create new progress entry
    progress = await Progress.create({
      userId,
      date,
      weight: data.weight,
      bodyFat: data.bodyFat
    });
  } else {
    // Update existing progress
    await Progress.update(progress.id, {
      weight: data.weight,
      bodyFat: data.bodyFat
    });
    progress = { ...progress, weight: data.weight, bodyFat: data.bodyFat };
  }

  return progress;
}

export async function getProgressHistory(userId: string): Promise<IProgress[]> {
  return Progress.findByUser(userId);
}
