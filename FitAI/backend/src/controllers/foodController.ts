import { Response } from "express";
import { AuthRequest } from "../middleware/authMiddleware";
import { addFoodEntry, getFoodHistory, getTodayFood, deleteFoodEntry } from "../services/foodService";
import { parseFoodFromText } from "../services/aiService";

export async function addFood(req: AuthRequest, res: Response) {
  try {
    if (!req.userId) return res.status(401).json({ message: "Unauthorized" });
    const { name, calories, protein, carbs, fats, mealType } = req.body;
    if (!name || calories == null || protein == null || carbs == null || fats == null || !mealType) {
      return res.status(400).json({ message: "Missing required food fields" });
    }
    const log = await addFoodEntry(req.userId, {
      name,
      calories: Number(calories),
      protein: Number(protein),
      carbs: Number(carbs),
      fats: Number(fats),
      mealType
    });
    return res.status(201).json(log);
  } catch (err) {
    // eslint-disable-next-line no-console
    console.error(err);
    return res.status(500).json({ message: "Failed to add food" });
  }
}

export async function addFoodFromChat(req: AuthRequest, res: Response) {
  try {
    if (!req.userId) return res.status(401).json({ message: "Unauthorized" });
    const { text, mealType } = req.body as { text?: string; mealType?: string };
    if (!text || !text.trim()) {
      return res.status(400).json({ message: "Text is required" });
    }

    const defaultMealType =
      mealType === "breakfast" || mealType === "lunch" || mealType === "dinner" || mealType === "snack"
        ? mealType
        : "snack";

    const parsed = await parseFoodFromText({ text, defaultMealType });
    if (!parsed.items.length) {
      return res.status(400).json({ message: "Could not parse food from message", parsed });
    }

    let log = await getTodayFood(req.userId);
    for (const item of parsed.items) {
      log = await addFoodEntry(req.userId, item);
    }

    return res.status(201).json({
      parsed,
      today: log
    });
  } catch (err: any) {
    // eslint-disable-next-line no-console
    console.error(err);
    return res.status(500).json({ message: err.message || "Failed to add food from chat" });
  }
}

export async function getTodayFoodHandler(req: AuthRequest, res: Response) {
  try {
    if (!req.userId) return res.status(401).json({ message: "Unauthorized" });
    const log = await getTodayFood(req.userId);
    return res.json(log || null);
  } catch (err) {
    // eslint-disable-next-line no-console
    console.error(err);
    return res.status(500).json({ message: "Failed to load today's food" });
  }
}

export async function getFoodHistoryHandler(req: AuthRequest, res: Response) {
  try {
    if (!req.userId) return res.status(401).json({ message: "Unauthorized" });
    const history = await getFoodHistory(req.userId);
    return res.json(history);
  } catch (err) {
    // eslint-disable-next-line no-console
    console.error(err);
    return res.status(500).json({ message: "Failed to load food history" });
  }
}

export async function deleteFood(req: AuthRequest, res: Response) {
  try {
    if (!req.userId) return res.status(401).json({ message: "Unauthorized" });
    const { index } = req.params;
    const idx = Number(index);
    if (isNaN(idx)) {
      return res.status(400).json({ message: "Invalid index" });
    }
    const log = await deleteFoodEntry(req.userId, idx);
    return res.json(log);
  } catch (err: any) {
    // eslint-disable-next-line no-console
    console.error(err);
    return res.status(500).json({ message: err.message || "Failed to delete food" });
  }
}
