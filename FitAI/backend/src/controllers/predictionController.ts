import { Response } from "express";
import { AuthRequest } from "../middleware/authMiddleware";
import { getTodayFood } from "../services/foodService";
import { getTodayWorkout } from "../services/workoutService";
import { predictWeeklyWeightChange } from "../services/predictionService";

export async function predictWeightHandler(req: AuthRequest, res: Response) {
  try {
    if (!req.userId) return res.status(401).json({ message: "Unauthorized" });

    const { caloriesIn, caloriesOut } = req.body;

    let dailyCaloriesIn = caloriesIn != null ? Number(caloriesIn) : undefined;
    let dailyCaloriesOut = caloriesOut != null ? Number(caloriesOut) : undefined;

    if (dailyCaloriesIn == null || dailyCaloriesOut == null) {
      const [todayFood, todayWorkout] = await Promise.all([
        getTodayFood(req.userId),
        getTodayWorkout(req.userId)
      ]);
      dailyCaloriesIn = dailyCaloriesIn ?? todayFood?.totalCalories ?? 0;
      dailyCaloriesOut = dailyCaloriesOut ?? todayWorkout?.totalCaloriesBurned ?? 0;
    }

    const result = await predictWeeklyWeightChange({
      dailyCaloriesIn,
      dailyCaloriesOut
    });

    return res.json({
      dailyCaloriesIn,
      dailyCaloriesOut,
      weeklyChangeKg: result.weeklyChangeKg
    });
  } catch (err) {
    // eslint-disable-next-line no-console
    console.error(err);
    return res.status(500).json({ message: "Failed to predict weight change" });
  }
}
