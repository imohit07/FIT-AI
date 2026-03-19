import { FormEvent, useState } from "react";
import api from "../services/api";

interface MealPlan {
  meals: Array<{
    name: string;
    mealType: string;
    description: string;
    calories: number;
    protein: number;
  }>;
  notes?: string;
}

interface WorkoutPlan {
  days: Array<{
    day: string;
    focus: string;
    exercises: Array<{
      name: string;
      muscleGroup: string;
      sets: number;
      reps: number;
    }>;
  }>;
  notes?: string;
}

export default function RecommendationsPage() {
  const [goal, setGoal] = useState<string>("maintain");
  const [foodRec, setFoodRec] = useState<MealPlan | null>(null);
  const [foodRecError, setFoodRecError] = useState<string>("");
  const [workoutRec, setWorkoutRec] = useState<WorkoutPlan | null>(null);
  const [workoutRecError, setWorkoutRecError] = useState<string>("");
  const [workoutRaw, setWorkoutRaw] = useState<string>("");
  const [chatInput, setChatInput] = useState<string>("");
  const [chatReply, setChatReply] = useState<string>("");

  const parseAIResponse = (text: string): any => {
    try {
      // Try to extract JSON from markdown code blocks
      const jsonMatch = text.match(/```json\n?([\s\S]*?)```/) || text.match(/```\n?([\s\S]*?)```/);
      if (jsonMatch) {
        return JSON.parse(jsonMatch[1]);
      }
      // Try to find JSON object directly
      const objMatch = text.match(/\{[\s\S]*\}/);
      if (objMatch) {
        return JSON.parse(objMatch[0]);
      }
      return null;
    } catch (e) {
      console.error("Failed to parse JSON:", e);
      return null;
    }
  };

  const [foodRaw, setFoodRaw] = useState<string>("");

  const fetchFood = async (e: FormEvent) => {
    e.preventDefault();
    setFoodRecError("");
    setFoodRaw("");
    try {
      const res = await api.post("/ai/food-recommendation", { goal });
      // Check if response has meals (parsed JSON) or raw text
      if (res.data.meals) {
        setFoodRec(res.data);
      } else if (res.data.raw) {
        // Try parsing raw text
        const parsed = parseAIResponse(res.data.raw);
        if (parsed && parsed.meals) {
          setFoodRec(parsed);
        } else {
          // Show raw text as fallback
          setFoodRaw(res.data.raw);
        }
      } else {
        setFoodRecError("Could not parse meal plan. Please try again.");
      }
    } catch (err: any) {
      setFoodRecError(err.response?.data?.message || "Failed to get recommendation");
    }
  };

  const fetchWorkout = async (e: FormEvent) => {
    e.preventDefault();
    setWorkoutRecError("");
    setWorkoutRaw("");
    try {
      const res = await api.post("/ai/workout-recommendation", { goal });
      // Check if response has days (parsed JSON) or raw text
      if (res.data.days) {
        setWorkoutRec(res.data);
      } else if (res.data.raw) {
        // Try parsing raw text
        const parsed = parseAIResponse(res.data.raw);
        if (parsed && parsed.days) {
          setWorkoutRec(parsed);
        } else {
          // Show raw text as fallback
          setWorkoutRaw(res.data.raw);
        }
      } else {
        setWorkoutRecError("Could not parse workout plan. Please try again.");
      }
    } catch (err: any) {
      setWorkoutRecError(err.response?.data?.message || "Failed to get recommendation");
    }
  };

  const sendChat = async (e: FormEvent) => {
    e.preventDefault();
    const res = await api.post("/ai/chat", { message: chatInput });
    setChatReply(res.data.reply);
  };

  return (
    <div className="space-y-4">
      <h2 className="text-2xl font-semibold mb-2">AI Recommendations</h2>
      <div className="card">
        <h3 className="text-sm font-medium mb-3">Your goal</h3>
        <select
          className="rounded-lg bg-white border border-black px-3 py-2 text-sm"
          value={goal}
          onChange={(e) => setGoal(e.target.value)}
        >
          <option value="fat_loss">Fat loss</option>
          <option value="muscle_gain">Muscle gain</option>
          <option value="maintain">Maintain</option>
        </select>
      </div>

      <div className="grid gap-4 md:grid-cols-2">
        <div className="card">
          <div className="flex items-center justify-between mb-2">
            <h3 className="text-sm font-medium">Meal plan suggestion</h3>
            <button
              onClick={fetchFood}
              className="text-xs rounded-lg bg-primary text-slate-950 px-3 py-1"
            >
              Generate
            </button>
          </div>
          {foodRecError && (
            <div className="text-xs text-red-400 mb-2">{foodRecError}</div>
          )}
          {foodRec ? (
            <div className="space-y-3 max-h-72 overflow-y-auto">
              {foodRec.meals.map((meal, idx) => (
                <div key={idx} className="bg-slate-800 rounded-lg p-3">
                  <div className="flex justify-between items-start">
                    <span className="font-medium text-white">{meal.name}</span>
                    <span className="text-xs bg-primary text-slate-900 px-2 py-0.5 rounded">
                      {meal.mealType}
                    </span>
                  </div>
                  <p className="text-xs text-slate-400 mt-1">{meal.description}</p>
                  <div className="flex gap-3 mt-2 text-xs">
                    <span className="text-orange-400">🔥 {meal.calories} cal</span>
                    <span className="text-blue-400">🥩 {meal.protein}g protein</span>
                  </div>
                </div>
              ))}
              {foodRec.notes && (
                <p className="text-xs text-slate-400 italic">{foodRec.notes}</p>
              )}
            </div>
          ) : foodRaw ? (
            <div className="text-xs text-white whitespace-pre-wrap bg-slate-800 p-3 rounded-lg max-h-72 overflow-y-auto">
              {foodRaw}
            </div>
          ) : (
            <div className="text-xs text-slate-400">
              Request a recommendation to see AI meal suggestions here.
            </div>
          )}
        </div>

        <div className="card">
          <div className="flex items-center justify-between mb-2">
            <h3 className="text-sm font-medium">Workout split suggestion</h3>
            <button
              onClick={fetchWorkout}
              className="text-xs rounded-lg bg-primary text-slate-950 px-3 py-1"
            >
              Generate
            </button>
          </div>
          {workoutRecError && (
            <div className="text-xs text-red-400 mb-2">{workoutRecError}</div>
          )}
          {workoutRec ? (
            <div className="space-y-3 max-h-72 overflow-y-auto">
              {workoutRec.days.map((day, idx) => (
                <div key={idx} className="bg-slate-800 rounded-lg p-3">
                  <div className="font-medium text-white">{day.day} - {day.focus}</div>
                  <div className="mt-2 space-y-1">
                    {day.exercises.map((ex, exIdx) => (
                      <div key={exIdx} className="text-xs text-slate-300 flex justify-between">
                        <span>{ex.name}</span>
                        <span className="text-slate-500">{ex.sets}x{ex.reps}</span>
                      </div>
                    ))}
                  </div>
                </div>
              ))}
              {workoutRec.notes && (
                <p className="text-xs text-slate-400 italic">{workoutRec.notes}</p>
              )}
            </div>
          ) : workoutRaw ? (
            <div className="text-xs text-white whitespace-pre-wrap bg-slate-800 p-3 rounded-lg max-h-72 overflow-y-auto">
              {workoutRaw}
            </div>
          ) : (
            <div className="text-xs text-slate-400">
              Request a recommendation to see AI workout splits here.
            </div>
          )}
        </div>
      </div>

      <div className="card">
        <h3 className="text-sm font-medium mb-3">AI Chat Assistant</h3>
        <form onSubmit={sendChat} className="flex flex-col gap-2 text-sm">
          <textarea
            className="rounded-lg bg-white border border-black px-3 py-2 min-h-[80px]"
            placeholder="Ask anything about training, nutrition, or recovery..."
            value={chatInput}
            onChange={(e) => setChatInput(e.target.value)}
          />
          <button
            type="submit"
            className="self-start rounded-lg bg-primary text-slate-950 px-4 py-1 text-xs"
          >
            Ask
          </button>
        </form>
        {chatReply && (
          <div className="mt-3 text-sm text-white whitespace-pre-wrap bg-slate-800 p-3 rounded-lg">
            {chatReply}
          </div>
        )}
      </div>
    </div>
  );
}
