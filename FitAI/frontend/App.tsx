import { Navigate, Route, Routes } from "react-router-dom";
import { useAuth } from "./services/AuthContext";
import { useEffect, useState } from "react";
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
}

function PrivateRoutes() {
  const { token } = useAuth();
  const [topbarData, setTopbarData] = useState<TopbarData>({ caloriesIn: 0, targetCalories: 2000 });

  useEffect(() => {
    async function loadTopbarData() {
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

        setTopbarData({ caloriesIn, targetCalories, currentStreak: streak });
      } catch (e) {
        setTopbarData({ caloriesIn: 0, targetCalories: 2000, currentStreak: 0 });
      }
    }
    loadTopbarData();
  }, [token]);

  if (!token) return <Navigate to="/login" replace />;
  return (
    <Layout topbar={topbarData}>
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
