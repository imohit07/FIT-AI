import { Request, Response } from "express";
import { registerUser, loginUser } from "../services/authService";

export async function register(req: Request, res: Response) {
  try {
    const { name, email, password } = req.body;
    if (!name || !email || !password) {
      return res.status(400).json({ message: "Name, email and password are required" });
    }
    const { user, token } = await registerUser({ name, email, password });
    return res.status(201).json({
      token,
      user: {
        id: user.id,
        name: user.name,
        email: user.email,
        goal: user.goal,
        activityLevel: user.activityLevel,
        targetCalories: user.targetCalories
      }
    });
  } catch (err: any) {
    return res.status(400).json({ message: err.message || "Registration failed" });
  }
}

export async function login(req: Request, res: Response) {
  try {
    const { email, password } = req.body;
    if (!email || !password) {
      return res.status(400).json({ message: "Email and password are required" });
    }
    const { user, token } = await loginUser({ email, password });
    return res.json({
      token,
      user: {
        id: user.id,
        name: user.name,
        email: user.email,
        goal: user.goal,
        activityLevel: user.activityLevel,
        targetCalories: user.targetCalories
      }
    });
  } catch (err: any) {
    return res.status(401).json({ message: err.message || "Login failed" });
  }
}
