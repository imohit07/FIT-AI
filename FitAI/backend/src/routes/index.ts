import express from "express";
import { register, login } from "../controllers/authController";
import { authMiddleware } from "../middleware/authMiddleware";
import {
  addFood,
  addFoodFromChat,
  getFoodHistoryHandler,
  getTodayFoodHandler,
  deleteFood
} from "../controllers/foodController";
import {
  addWorkout,
  addWorkoutFromChat,
  getTodayWorkoutHandler,
  getWorkoutHistoryHandler,
  deleteWorkout
} from "../controllers/workoutController";
import {
  getProgressHistoryHandler,
  updateProgressHandler
} from "../controllers/progressController";
import { predictWeightHandler } from "../controllers/predictionController";
import {
  foodRecommendationHandler,
  workoutRecommendationHandler,
  chatAdviceHandler
} from "../controllers/aiController";
import { getProfile, updateProfile } from "../controllers/profileController";

const router = express.Router();

// Auth
router.post("/auth/register", register);
router.post("/auth/login", login);

// Profile
router.get("/profile", authMiddleware, getProfile);
router.put("/profile", authMiddleware, updateProfile);

// Food
router.post("/food/add", authMiddleware, addFood);
router.post("/food/ai-add", authMiddleware, addFoodFromChat);
router.get("/food/today", authMiddleware, getTodayFoodHandler);
router.get("/food/history", authMiddleware, getFoodHistoryHandler);
router.delete("/food/delete/:index", authMiddleware, deleteFood);

// Workout
router.post("/workout/add", authMiddleware, addWorkout);
router.post("/workout/ai-add", authMiddleware, addWorkoutFromChat);
router.get("/workout/today", authMiddleware, getTodayWorkoutHandler);
router.get("/workout/history", authMiddleware, getWorkoutHistoryHandler);
router.delete("/workout/delete/:index", authMiddleware, deleteWorkout);

// Progress
router.post("/progress/update", authMiddleware, updateProgressHandler);
router.get("/progress/history", authMiddleware, getProgressHistoryHandler);

// Prediction
router.post("/predict-weight", authMiddleware, predictWeightHandler);

// AI
router.post("/ai/food-recommendation", authMiddleware, foodRecommendationHandler);
router.post("/ai/workout-recommendation", authMiddleware, workoutRecommendationHandler);
router.post("/ai/chat", authMiddleware, chatAdviceHandler);

export default router;
