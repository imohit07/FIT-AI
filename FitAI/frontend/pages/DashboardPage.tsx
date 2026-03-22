import { useEffect, useState } from "react";
import api from "../services/api";
import SimpleLineChart from "../charts/SimpleLineChart";
import KPICard from "../components/KPICard";
import ChartCard from "../components/ChartCard";
import { Activity, Dumbbell, Flame, TrendingDown, TrendingUp } from "lucide-react";
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
  const [weeklyChange, setWeeklyChange] = useState<number | null>(null);
  const [profile, setProfile] = useState<UserProfile | null>(null);
  const [foodHistory, setFoodHistory] = useState<FoodLog[]>([]);
  const [workoutHistory, setWorkoutHistory] = useState<WorkoutLog[]>([]);

  useEffect(() => {
    async function load() {
      try {
        const [foodRes, workoutRes, predictRes, profileRes, foodHistRes, workoutHistRes] = await Promise.all([
          api.get("/food/today"),
          api.get("/workout/today"),
          api.post("/predict-weight", {}),
          api.get("/profile"),
          api.get("/food/history"),
          api.get("/workout/history")
        ]);
        setTodayFood(foodRes.data);
        setTodayWorkout(workoutRes.data);
        setWeeklyChange(predictRes.data.weeklyChangeKg);
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
  const weekly = weeklyChange ?? 0;
  
  // Determine color based on user's goal
  const getWeeklyTone = () => {
    if (!profile?.goal) return "default";
    
    const goal = profile.goal;
    if (goal === "fat_loss") {
      return weekly > 0 ? "red" : "green"; // Red if gaining weight when trying to lose
    } else if (goal === "muscle_gain") {
      return weekly < 0 ? "red" : "blue"; // Red if losing weight when trying to gain
    } else {
      return weekly < 0 ? "green" : weekly > 0 ? "blue" : "default"; // Default logic for maintain
    }
  };
  
  const weeklyTone = getWeeklyTone();
  const weeklyIcon = weekly < 0 ? <TrendingDown size={18} /> : <TrendingUp size={18} />;

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
          title="Predicted Weekly Weight Change"
          value={weeklyChange != null ? `${weekly.toFixed(2)} kg` : "-"}
          tone={weeklyTone as any}
          right={<RingKPI value={Math.min(1, Math.abs(weekly))} max={1} labelTop="Trend" labelBottom="weekly" color={weekly < 0 ? "#10B981" : "#2563EB"} />}
          icon={weeklyIcon}
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

