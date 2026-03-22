import { Response } from "express";
import { AuthRequest } from "../middleware/authMiddleware";
import { User } from "../models/User";

function calculateTargetCalories(age: number, height: number, weight: number, activityLevel: string, goal: string): number {
  // Mifflin-St Jeor Equation for BMR
  const bmr = 10 * weight + 6.25 * height - 5 * age + 5; // For men, adjust for women if needed
  
  // Activity multipliers
  const activityMultipliers = {
    sedentary: 1.2,
    light: 1.375,
    moderate: 1.55,
    active: 1.725,
    very_active: 1.9
  };
  
  const tdee = bmr * activityMultipliers[activityLevel as keyof typeof activityMultipliers];
  
  // Adjust based on goal
  switch (goal) {
    case 'fat_loss':
      return Math.round(tdee - 500); // 500 calorie deficit for ~1kg/week loss
    case 'muscle_gain':
      return Math.round(tdee + 300); // 300 calorie surplus for muscle gain
    case 'maintain':
    default:
      return Math.round(tdee);
  }
}

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
    
    // Calculate targetCalories automatically if not explicitly provided and we have all required data
    if (targetCalories != null) {
      updateData.targetCalories = Number(targetCalories);
    } else if (age != null && height != null && weight != null && activityLevel && goal) {
      updateData.targetCalories = calculateTargetCalories(
        Number(age), 
        Number(height), 
        Number(weight), 
        activityLevel, 
        goal
      );
    }

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
