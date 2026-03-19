import { startOfDay, endOfDay } from "date-fns";
import { FoodLog, IFoodItem, IFoodLog } from "../models/FoodLog";

export async function addFoodEntry(userId: string, item: IFoodItem, date = new Date()): Promise<IFoodLog> {
  let log = await FoodLog.findByUserAndDate(userId, date);
  
  if (!log) {
    // Create new food log for the day
    log = await FoodLog.create({
      userId,
      date,
      foodItems: [],
      totalCalories: 0,
      totalProtein: 0,
      totalCarbs: 0,
      totalFats: 0
    });
  }

  // Add the new item
  const newFoodItems = [...log.foodItems, item];
  const newTotalCalories = log.totalCalories + item.calories;
  const newTotalProtein = log.totalProtein + item.protein;
  const newTotalCarbs = log.totalCarbs + item.carbs;
  const newTotalFats = log.totalFats + item.fats;

  await FoodLog.update(log.id, {
    foodItems: newFoodItems,
    totalCalories: newTotalCalories,
    totalProtein: newTotalProtein,
    totalCarbs: newTotalCarbs,
    totalFats: newTotalFats
  });

  return { ...log, foodItems: newFoodItems, totalCalories: newTotalCalories, totalProtein: newTotalProtein, totalCarbs: newTotalCarbs, totalFats: newTotalFats };
}

export async function getTodayFood(userId: string, date = new Date()): Promise<IFoodLog | null> {
  return FoodLog.findByUserAndDate(userId, date);
}

export async function getFoodHistory(userId: string): Promise<IFoodLog[]> {
  return FoodLog.findByUser(userId);
}

export async function deleteFoodEntry(userId: string, itemIndex: number, date = new Date()): Promise<IFoodLog | null> {
  const log = await FoodLog.findByUserAndDate(userId, date);
  
  if (!log || !log.foodItems[itemIndex]) {
    throw new Error("Food item not found");
  }

  const item = log.foodItems[itemIndex];
  const newFoodItems = log.foodItems.filter((_, i) => i !== itemIndex);
  
  await FoodLog.update(log.id, {
    foodItems: newFoodItems,
    totalCalories: log.totalCalories - item.calories,
    totalProtein: log.totalProtein - item.protein,
    totalCarbs: log.totalCarbs - item.carbs,
    totalFats: log.totalFats - item.fats
  });

  return { ...log, foodItems: newFoodItems };
}
