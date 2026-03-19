import { Response } from "express";
import { AuthRequest } from "../middleware/authMiddleware";
import { User } from "../models/User";
import { getTodayFood } from "../services/foodService";
import { getWorkoutHistory } from "../services/workoutService";
import {
  getChatAdvice,
  getFoodRecommendation,
  getWorkoutRecommendation,
  extractFirstJsonObject
} from "../services/aiService";

function extractJson(text: string): any {
  try {
    return extractFirstJsonObject(text);
  } catch (e) {
    // If parsing fails, return the raw text wrapped in an object
    return { raw: text, parseError: true };
  }
}

export async function foodRecommendationHandler(req: AuthRequest, res: Response) {
  try {
    if (!req.userId) return res.status(401).json({ message: "Unauthorized" });
    const user = await User.findById(req.userId);
    if (!user) return res.status(404).json({ message: "User not found" });
    const { goal } = req.body;
    const todayFood = await getTodayFood(req.userId);
    const text = await getFoodRecommendation({ user, goal: goal || user.goal || "maintain", todayFood });
    
    // Try to parse JSON, otherwise return raw text
    const parsed = extractJson(text);
    return res.json(parsed);
  } catch (err: any) {
    // eslint-disable-next-line no-console
    console.error(err);
    return res.status(500).json({ message: err.message || "Failed to get food recommendation" });
  }
}

export async function workoutRecommendationHandler(req: AuthRequest, res: Response) {
  try {
    if (!req.userId) return res.status(401).json({ message: "Unauthorized" });
    const user = await User.findById(req.userId);
    if (!user) return res.status(404).json({ message: "User not found" });
    const { goal } = req.body;
    const workouts = await getWorkoutHistory(req.userId);
    const text = await getWorkoutRecommendation({
      user,
      goal: goal || user.goal || "maintain",
      recentWorkouts: workouts
    });
    
    // Try to parse JSON, otherwise return raw text
    const parsed = extractJson(text);
    return res.json(parsed);
  } catch (err: any) {
    // eslint-disable-next-line no-console
    console.error(err);
    return res.status(500).json({ message: err.message || "Failed to get workout recommendation" });
  }
}

export async function chatAdviceHandler(req: AuthRequest, res: Response) {
  try {
    if (!req.userId) return res.status(401).json({ message: "Unauthorized" });
    const { message } = req.body;
    if (!message) return res.status(400).json({ message: "Message is required" });
    const reply = await getChatAdvice(message);
    return res.json({ reply });
  } catch (err: any) {
    // eslint-disable-next-line no-console
    console.error(err);
    return res.status(500).json({ message: err.message || "Failed to get chat advice" });
  }
}
