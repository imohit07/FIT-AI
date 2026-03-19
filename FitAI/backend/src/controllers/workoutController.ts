import { Response } from "express";
import { AuthRequest } from "../middleware/authMiddleware";
import { addWorkoutEntry, getTodayWorkout, getWorkoutHistory, deleteWorkoutEntry } from "../services/workoutService";
import { parseWorkoutFromText } from "../services/workoutAiService";

export async function addWorkout(req: AuthRequest, res: Response) {
  try {
    if (!req.userId) return res.status(401).json({ message: "Unauthorized" });
    const { name, sets, reps, weight, muscleGroup, caloriesBurned, duration } = req.body;
    if (!name || sets == null || reps == null || weight == null || !muscleGroup || caloriesBurned == null) {
      return res.status(400).json({ message: "Missing required exercise fields" });
    }
    const log = await addWorkoutEntry(req.userId, {
      name,
      sets: Number(sets),
      reps: Number(reps),
      weight: Number(weight),
      muscleGroup,
      caloriesBurned: Number(caloriesBurned),
      duration: duration != null ? Number(duration) : undefined
    });
    return res.status(201).json(log);
  } catch (err) {
    // eslint-disable-next-line no-console
    console.error(err);
    return res.status(500).json({ message: "Failed to add workout" });
  }
}

export async function addWorkoutFromChat(req: AuthRequest, res: Response) {
  try {
    if (!req.userId) return res.status(401).json({ message: "Unauthorized" });
    const { text } = req.body as { text?: string };
    if (!text || !text.trim()) {
      return res.status(400).json({ message: "Text is required" });
    }

    const parsed = await parseWorkoutFromText({ text });
    if (!parsed.items.length) {
      return res.status(400).json({ message: "Could not parse workout from message", parsed });
    }

    let log = await getTodayWorkout(req.userId);
    for (const item of parsed.items) {
      log = await addWorkoutEntry(req.userId, item);
    }

    return res.status(201).json({ parsed, today: log });
  } catch (err: any) {
    // eslint-disable-next-line no-console
    console.error(err);
    return res.status(500).json({ message: err.message || "Failed to add workout from chat" });
  }
}

export async function getTodayWorkoutHandler(req: AuthRequest, res: Response) {
  try {
    if (!req.userId) return res.status(401).json({ message: "Unauthorized" });
    const log = await getTodayWorkout(req.userId);
    return res.json(log || null);
  } catch (err) {
    // eslint-disable-next-line no-console
    console.error(err);
    return res.status(500).json({ message: "Failed to load today's workout" });
  }
}

export async function getWorkoutHistoryHandler(req: AuthRequest, res: Response) {
  try {
    if (!req.userId) return res.status(401).json({ message: "Unauthorized" });
    const history = await getWorkoutHistory(req.userId);
    return res.json(history);
  } catch (err) {
    // eslint-disable-next-line no-console
    console.error(err);
    return res.status(500).json({ message: "Failed to load workout history" });
  }
}

export async function deleteWorkout(req: AuthRequest, res: Response) {
  try {
    if (!req.userId) return res.status(401).json({ message: "Unauthorized" });
    const { index } = req.params;
    const idx = Number(index);
    if (isNaN(idx)) {
      return res.status(400).json({ message: "Invalid index" });
    }
    const log = await deleteWorkoutEntry(req.userId, idx);
    return res.json(log);
  } catch (err: any) {
    // eslint-disable-next-line no-console
    console.error(err);
    return res.status(500).json({ message: err.message || "Failed to delete workout" });
  }
}
