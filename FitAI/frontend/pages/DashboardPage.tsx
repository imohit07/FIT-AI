import { useEffect, useState } from "react";
import api from "../services/api";
import SimpleLineChart from "../charts/SimpleLineChart";
import KPICard from "../components/KPICard";
import ChartCard from "../components/ChartCard";
import { Activity, Dumbbell, Flame, Zap } from "lucide-react";
import RingKPI from "../charts/RingKPI";

interface TodayFood {
  totalCalories: number;
  totalProtein: number;
}

interface TodayWorkout {
  totalCaloriesBurned: number;
}

interface FoodLog {
  date: string;
  dateString?: string;
  totalCalories: number;
}

interface WorkoutLog {
  date: string;
  dateString?: string;
  totalCaloriesBurned: number;
}

interface UserProfile {
  targetCalories?: number;
  age?: number;
  height?: number;
  weight?: number;
  goal?: "fat_loss" | "muscle_gain" | "maintain";
  activityLevel?: "sedentary" | "light" | "moderate" | "active" | "very_active";
}

export default function DashboardPage() {
  const [todayFood, setTodayFood] = useState<TodayFood | null>(null);
  const [todayWorkout, setTodayWorkout] = useState<TodayWorkout | null>(null);
  const [profile, setProfile] = useState<UserProfile | null>(null);
  const [foodHistory, setFoodHistory] = useState<FoodLog[]>([]);
  const [workoutHistory, setWorkoutHistory] = useState<WorkoutLog[]>([]);

  useEffect(() => {
    async function load() {
      try {
        const [foodRes, workoutRes, profileRes, foodHistRes, workoutHistRes] = await Promise.all([
          api.get("/food/today"),
          api.get("/workout/today"),
          api.get("/profile"),
          api.get("/food/history"),
          api.get("/workout/history")
        ]);
        setTodayFood(foodRes.data);
        setTodayWorkout(workoutRes.data);
        setProfile(profileRes.data);
        setFoodHistory(foodHistRes.data);
        setWorkoutHistory(workoutHistRes.data);
      } catch {
        // ignore for dashboard
      }
    }
    load();
  }, []);

  const caloriesIn = todayFood?.totalCalories ?? 0;
  const caloriesOut = todayWorkout?.totalCaloriesBurned ?? 0;
  // Default to 2000 calories if no target is set
  const target = profile?.targetCalories ?? 2000;

  // Calculate daily net distance from target for the last 7 days
  const getDailyProgressData = () => {
    const days = ['Sun', 'Mon', 'Tue', 'Wed', 'Thu', 'Fri', 'Sat'];
    const today = new Date();
    const data = [];

    for (let i = 6; i >= 0; i--) {
      const date = new Date(today);
      date.setDate(today.getDate() - i);
      const dateStr = date.toISOString().split('T')[0];

      // Find food and workout for this date
      const foodLog = foodHistory.find(f => {
        const logDate = f.dateString || f.date.split('T')[0];
        return logDate === dateStr;
      });
      const workoutLog = workoutHistory.find(w => {
        const logDate = w.dateString || w.date.split('T')[0];
        return logDate === dateStr;
      });

      const caloriesConsumed = foodLog?.totalCalories ?? 0;
      const caloriesBurned = workoutLog?.totalCaloriesBurned ?? 0;
      const netCalories = caloriesConsumed - caloriesBurned;
      const distanceFromTarget = target - netCalories; // Positive = deficit (good), Negative = surplus
      const percentageFromTarget = target > 0 ? (distanceFromTarget / target) * 100 : 0;

      data.push(percentageFromTarget);
    }

    return { labels: days, data };
  };

  const progressData = getDailyProgressData();

  // Calculate calories to burn based on user profile and goals
  const calculateCaloriesToBurn = () => {
    if (!profile || !profile.age || !profile.height || !profile.weight || !profile.goal || !profile.activityLevel) {
      return null;
    }

    const { age, height, weight, goal, activityLevel } = profile;

    // Calculate BMR using Mifflin-St Jeor Equation
    // For men: BMR = 10 * weight(kg) + 6.25 * height(cm) - 5 * age + 5
    // For women: BMR = 10 * weight(kg) + 6.25 * height(cm) - 5 * age - 161
    // Using average formula (closer to male)
    const bmr = 10 * weight + 6.25 * height - 5 * age + 5;

    // Activity multipliers
    const activityMultipliers = {
      sedentary: 1.2,
      light: 1.375,
      moderate: 1.55,
      active: 1.725,
      very_active: 1.9
    };

    const tdee = bmr * activityMultipliers[activityLevel as keyof typeof activityMultipliers];

    // Calculate target based on goal
    let targetCalories;
    switch (goal) {
      case "fat_loss":
        targetCalories = tdee - 500; // 500 calorie deficit for 1lb/week loss
        break;
      case "muscle_gain":
        targetCalories = tdee + 300; // 300 calorie surplus for muscle gain
        break;
      case "maintain":
      default:
        targetCalories = tdee;
        break;
    }

    // Current net calories (consumed - burned)
    const netCalories = caloriesIn - caloriesOut;

    // Calories to burn through exercise to reach target
    const caloriesToBurn = Math.max(0, netCalories - targetCalories);

    return {
      bmr: Math.round(bmr),
      tdee: Math.round(tdee),
      targetCalories: Math.round(targetCalories),
      currentNet: Math.round(netCalories),
      caloriesToBurn: Math.round(caloriesToBurn),
      deficit: Math.round(targetCalories - netCalories)
    };
  };

  const calorieCalculation = calculateCaloriesToBurn();

  return (
    <div className="space-y-6">
      <div className="flex items-end justify-between gap-3">
        <div>
          <h2 className="text-2xl font-semibold text-textDark">Dashboard</h2>
          <p className="text-sm text-slate-500">Today&apos;s KPIs, trends, and actionable insights.</p>
        </div>
      </div>

      <div className="grid gap-4 sm:grid-cols-2 lg:grid-cols-4">
        <KPICard
          title="Calories Consumed Today"
          value={`${caloriesIn.toFixed(0)} kcal`}
          subtext={target ? `Target ${target} kcal` : "Set target calories in Profile"}
          right={<RingKPI value={caloriesIn} max={target || 2300} labelTop="Calories" labelBottom="target" color="#2563EB" />}
          icon={<Flame size={18} />}
        />
        <KPICard
          title="Calories Burned"
          value={`${caloriesOut.toFixed(0)} kcal`}
          right={<RingKPI value={caloriesOut} max={600} labelTop="Burned" labelBottom="today" color="#3B82F6" />}
          icon={<Activity size={18} />}
        />
        <KPICard
          title="Protein Intake"
          value={`${(todayFood?.totalProtein ?? 0).toFixed(0)} g`}
          right={<RingKPI value={todayFood?.totalProtein ?? 0} max={140} labelTop="Protein" labelBottom="goal" color="#10B981" />}
          icon={<Dumbbell size={18} />}
        />
        <KPICard
          title="Calories to Burn"
          value={calorieCalculation ? `${calorieCalculation.caloriesToBurn} kcal` : "Complete profile"}
          subtext={calorieCalculation ? `To reach ${calorieCalculation.targetCalories} kcal goal` : "Add age, height, weight"}
          tone={calorieCalculation && calorieCalculation.caloriesToBurn > 0 ? "blue" : "default"}
          right={calorieCalculation ? <RingKPI value={Math.min(calorieCalculation.caloriesToBurn, 500)} max={500} labelTop="To Burn" labelBottom="today" color="#EF4444" /> : undefined}
          icon={<Zap size={18} />}
        />
      </div>

      <div className="grid gap-4 lg:grid-cols-2">
        <ChartCard title="Weight Progress Chart">
          <SimpleLineChart labels={["Mon", "Tue", "Wed", "Thu", "Fri", "Sat", "Sun"]} data={[78, 77.8, 77.6, 77.5, 77.3, 77.2, 77.1]} label="Weight (kg)" />
        </ChartCard>
        <ChartCard title="Daily Calorie Goal Progress">
          <SimpleLineChart 
            labels={progressData.labels} 
            data={progressData.data} 
            label="Distance from Target (%)" 
          />
        </ChartCard>
      </div>
    </div>
  );
}

