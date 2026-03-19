export interface WeightPredictionInput {
  dailyCaloriesIn: number;
  dailyCaloriesOut: number;
}

export interface WeightPredictionResult {
  weeklyChangeKg: number;
}

/**
 * Simple deterministic model using 7700 kcal ≈ 1kg fat.
 * We compute daily net calories and convert to daily weight change.
 * This replaces the need for a separate ML service.
 */
export function predictWeeklyWeightChange(
  input: WeightPredictionInput
): WeightPredictionResult {
  const { dailyCaloriesIn, dailyCaloriesOut } = input;

  // Calculate net calories (calories in - calories out)
  const net = dailyCaloriesIn - dailyCaloriesOut;
  
  // 7700 kcal ≈ 1kg of body weight
  // Calculate daily weight change in kg
  const dailyChangeKg = net / 7700.0;
  
  // Calculate weekly change
  const weeklyChangeKg = dailyChangeKg * 7;

  return { weeklyChangeKg };
}
