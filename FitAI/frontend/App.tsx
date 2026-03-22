import { Route, Routes } from "react-router-dom";
import { useAuth } from "./services/AuthContext";
import { useEffect, useState, createContext, useContext } from "react";
import api from "./services/api";
import DashboardPage from "./pages/DashboardPage";
import FoodPage from "./pages/FoodPage";
import WorkoutPage from "./pages/WorkoutPage";
import ProgressPage from "./pages/ProgressPage";
import RecommendationsPage from "./pages/RecommendationsPage";
import ProfilePage from "./pages/ProfilePage";
import SettingsPage from "./pages/SettingsPage";
import LoginPage from "./pages/LoginPage";
import RegisterPage from "./pages/RegisterPage";
import Layout from "./components/Layout";

interface TopbarData {
  caloriesIn: number;
  targetCalories: number;
  currentStreak?: number;
  caloriesToBurn?: number;
}

const TopbarContext = createContext<{ refreshTopbar: () => void } | null>(null);

export const useTopbar = () => {
  const context = useContext(TopbarContext);
  if (!context) {
    throw new Error('useTopbar must be used within TopbarProvider');
  }
  return context;
};

function PrivateRoutes() {
  const { token } = useAuth();
  const [topbarData, setTopbarData] = useState<TopbarData>({ caloriesIn: 0, targetCalories: 2000 });
  const [refreshTrigger, setRefreshTrigger] = useState(0);

  const loadTopbarData = async () => {
      if (!token) return;
      try {
        const [foodRes, profileRes, foodHistRes, workoutHistRes] = await Promise.all([
          api.get("/food/today"),
          api.get("/profile"),
          api.get("/food/history"),
          api.get("/workout/history")
        ]);
        const caloriesIn = foodRes.data?.totalCalories ?? 0;
        const targetCalories = profileRes.data?.targetCalories ?? 2000;
        const foodHistory = foodHistRes.data || [];
        const workoutHistory = workoutHistRes.data || [];
        const profile = profileRes.data;

        // Calculate current streak
        let streak = 0;
        const today = new Date();
        
        for (let i = 0; i < 30; i++) {
          const date = new Date(today);
          date.setDate(today.getDate() - i);
          const dateStr = date.toISOString().split('T')[0];

          const foodLog = foodHistory.find((f: any) => {
            const logDate = f.dateString || f.date.split('T')[0];
            return logDate === dateStr;
          });
          const workoutLog = workoutHistory.find((w: any) => {
            const logDate = w.dateString || w.date.split('T')[0];
            return logDate === dateStr;
          });

          const caloriesConsumed = foodLog?.totalCalories ?? 0;
          const caloriesBurned = workoutLog?.totalCaloriesBurned ?? 0;
          const netCalories = caloriesConsumed - caloriesBurned;
          const distanceFromTarget = targetCalories - netCalories;

          const tolerance = targetCalories * 0.1;
          if (Math.abs(distanceFromTarget) <= tolerance) {
            streak++;
          } else {
            break;
          }
        }

        // Calculate calories to burn for weight loss goal
        let caloriesToBurn: number | undefined;
        if (profile?.age && profile?.height && profile?.weight && profile?.activityLevel) {
          const { age, height, weight, activityLevel } = profile;
          const bmr = 10 * weight + 6.25 * height - 5 * age + 5;
          const activityMultipliers = {
            sedentary: 1.2,
            light: 1.375,
            moderate: 1.55,
            active: 1.725,
            very_active: 1.9
          };
          const tdee = bmr * activityMultipliers[activityLevel as keyof typeof activityMultipliers];
          const weightLossDeficit = 687.5; // for 2.75kg/month loss
          const targetCaloriesForLoss = tdee - weightLossDeficit;
          
          const todayWorkout = workoutHistRes.data?.find((w: any) => {
            const logDate = w.dateString || w.date.split('T')[0];
            return logDate === today.toISOString().split('T')[0];
          });
          const caloriesBurnedToday = todayWorkout?.totalCaloriesBurned ?? 0;
          const netCalories = caloriesIn - caloriesBurnedToday;
          
          caloriesToBurn = Math.max(0, netCalories - targetCaloriesForLoss);
        }

        setTopbarData({ caloriesIn, targetCalories, currentStreak: streak, caloriesToBurn });
      } catch (e) {
        setTopbarData({ caloriesIn: 0, targetCalories: 2000, currentStreak: 0 });
      }
    }
  useEffect(() => {
    loadTopbarData();
  }, [token, refreshTrigger]);

  const refreshTopbar = () => {
    setRefreshTrigger(prev => prev + 1);
  };
  return (
    <TopbarContext.Provider value={{ refreshTopbar }}>
      <Layout topbar={{...topbarData, onRefresh: refreshTopbar}}>
        <Routes>
          <Route path="/" element={<DashboardPage />} />
          <Route path="/food" element={<FoodPage />} />
          <Route path="/workout" element={<WorkoutPage />} />
          <Route path="/progress" element={<ProgressPage />} />
          <Route path="/recommendations" element={<RecommendationsPage />} />
          <Route path="/profile" element={<ProfilePage />} />
          <Route path="/settings" element={<SettingsPage />} />
        </Routes>
      </Layout>
    </TopbarContext.Provider>
  );
}

export default function App() {
  return (
    <Routes>
      <Route path="/login" element={<LoginPage />} />
      <Route path="/register" element={<RegisterPage />} />
      <Route path="/*" element={<PrivateRoutes />} />
    </Routes>
  );
}
