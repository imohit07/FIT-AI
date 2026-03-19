import { Response } from "express";
import { AuthRequest } from "../middleware/authMiddleware";
import { updateProgress, getProgressHistory } from "../services/progressService";

export async function updateProgressHandler(req: AuthRequest, res: Response) {
  try {
    if (!req.userId) return res.status(401).json({ message: "Unauthorized" });
    const { weight, bodyFat } = req.body;
    if (weight == null) {
      return res.status(400).json({ message: "Weight is required" });
    }
    const progress = await updateProgress(req.userId, {
      weight: Number(weight),
      bodyFat: bodyFat != null ? Number(bodyFat) : undefined
    });
    return res.status(201).json(progress);
  } catch (err) {
    // eslint-disable-next-line no-console
    console.error(err);
    return res.status(500).json({ message: "Failed to update progress" });
  }
}

export async function getProgressHistoryHandler(req: AuthRequest, res: Response) {
  try {
    if (!req.userId) return res.status(401).json({ message: "Unauthorized" });
    const history = await getProgressHistory(req.userId);
    return res.json(history);
  } catch (err) {
    // eslint-disable-next-line no-console
    console.error(err);
    return res.status(500).json({ message: "Failed to load progress history" });
  }
}
