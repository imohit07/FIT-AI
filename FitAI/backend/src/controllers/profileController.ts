import { Response } from "express";
import { AuthRequest } from "../middleware/authMiddleware";
import { User } from "../models/User";

export async function getProfile(req: AuthRequest, res: Response) {
  try {
    if (!req.userId) return res.status(401).json({ message: "Unauthorized" });
    const user = await User.findById(req.userId);
    if (!user) return res.status(404).json({ message: "User not found" });
    
    // Remove password from response
    const { password, ...safeUser } = user;
    return res.json(safeUser);
  } catch (err) {
    // eslint-disable-next-line no-console
    console.error(err);
    return res.status(500).json({ message: "Failed to load profile" });
  }
}

export async function updateProfile(req: AuthRequest, res: Response) {
  try {
    if (!req.userId) return res.status(401).json({ message: "Unauthorized" });
    const { name, age, height, weight, goal, activityLevel, targetCalories } = req.body;
    
    const updateData: any = {};
    if (name) updateData.name = name;
    if (age != null) updateData.age = Number(age);
    if (height != null) updateData.height = Number(height);
    if (weight != null) updateData.weight = Number(weight);
    if (goal) updateData.goal = goal;
    if (activityLevel) updateData.activityLevel = activityLevel;
    if (targetCalories != null) updateData.targetCalories = Number(targetCalories);

    const user = await User.update(req.userId, updateData);
    if (!user) return res.status(404).json({ message: "User not found" });

    // Remove password from response
    const { password, ...safeUser } = user;
    return res.json(safeUser);
  } catch (err) {
    // eslint-disable-next-line no-console
    console.error(err);
    return res.status(500).json({ message: "Failed to update profile" });
  }
}
