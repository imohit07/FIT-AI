import { FormEvent, useEffect, useState } from "react";
import api from "../services/api";
import { Sparkles, Trash2 } from "lucide-react";
import { useTopbar } from "../App";

interface Exercise {
  name: string;
  sets: number;
  reps: number;
  weight: number;
  muscleGroup: string;
  caloriesBurned: number;
  duration?: number;
}

interface WorkoutLog {
  exercises: Exercise[];
  totalCaloriesBurned: number;
}

export default function WorkoutPage() {
  const [today, setToday] = useState<WorkoutLog | null>(null);
  const [form, setForm] = useState<Exercise>({
    name: "",
    sets: 3,
    reps: 10,
    weight: 0,
    muscleGroup: "",
    caloriesBurned: 100
  });
  const [error, setError] = useState<string | null>(null);
  const [chatText, setChatText] = useState("");
  const [aiStatus, setAiStatus] = useState<string | null>(null);
  const { refreshTopbar } = useTopbar();

  async function load() {
    const res = await api.get("/workout/today");
    setToday(res.data);
  }

  useEffect(() => {
    load();
  }, []);

  const onSubmit = async (e: FormEvent) => {
    e.preventDefault();
    try {
      setError(null);
      await api.post("/workout/add", form);
      setForm({ ...form, name: "", muscleGroup: "" });
      await load();
      refreshTopbar();
    } catch (err: any) {
      setError(err.response?.data?.message || "Failed to add workout");
    }
  };

  const deleteWorkout = async (idx: number) => {
    try {
      await api.delete(`/workout/delete/${idx}`);
      await load();
      refreshTopbar();
    } catch (err: any) {
      setError(err.response?.data?.message || "Failed to delete workout");
    }
  };

  const totalCalories = today?.totalCaloriesBurned ?? 0;

  return (
    <div className="space-y-6">
      <div>
        <h2 className="text-2xl font-semibold text-textDark">Workout Tracker</h2>
        <p className="text-sm text-slate-500">Log exercises manually or paste a workout and let AI estimate burn.</p>
      </div>

      <div className="grid gap-4 lg:grid-cols-2">
        <div className="card">
          <h3 className="text-sm font-semibold text-textDark mb-3">Log exercise (manual)</h3>
          {error && <p className="text-xs text-accentRed mb-2">{error}</p>}
          <form onSubmit={onSubmit} className="grid grid-cols-2 gap-3 text-xs">
            <div className="col-span-2">
              <label className="block text-slate-500 mb-1">Exercise name</label>
              <input
                className="w-full rounded-xl bg-white border border-borderGray px-3 py-2 focus:outline-none focus:ring-2 focus:ring-primary/30"
                value={form.name}
                onChange={(e) => setForm({ ...form, name: e.target.value })}
              />
            </div>
            <div>
              <label className="block text-slate-500 mb-1">Sets</label>
              <input
                type="number"
                className="w-full rounded-xl bg-white border border-borderGray px-3 py-2 focus:outline-none focus:ring-2 focus:ring-primary/30"
                value={form.sets}
                onChange={(e) => setForm({ ...form, sets: Number(e.target.value) })}
              />
            </div>
            <div>
              <label className="block text-slate-500 mb-1">Reps</label>
              <input
                type="number"
                className="w-full rounded-xl bg-white border border-borderGray px-3 py-2 focus:outline-none focus:ring-2 focus:ring-primary/30"
                value={form.reps}
                onChange={(e) => setForm({ ...form, reps: Number(e.target.value) })}
              />
            </div>
            <div>
              <label className="block text-slate-500 mb-1">Weight (kg)</label>
              <input
                type="number"
                className="w-full rounded-xl bg-white border border-borderGray px-3 py-2 focus:outline-none focus:ring-2 focus:ring-primary/30"
                value={form.weight}
                onChange={(e) => setForm({ ...form, weight: Number(e.target.value) })}
              />
            </div>
            <div>
              <label className="block text-slate-500 mb-1">Muscle group</label>
              <input
                className="w-full rounded-xl bg-white border border-borderGray px-3 py-2 focus:outline-none focus:ring-2 focus:ring-primary/30"
                value={form.muscleGroup}
                onChange={(e) => setForm({ ...form, muscleGroup: e.target.value })}
              />
            </div>
            <div>
              <label className="block text-slate-500 mb-1">Calories burned</label>
              <input
                type="number"
                className="w-full rounded-xl bg-white border border-borderGray px-3 py-2 focus:outline-none focus:ring-2 focus:ring-primary/30"
                value={form.caloriesBurned}
                onChange={(e) =>
                  setForm({ ...form, caloriesBurned: Number(e.target.value) })
                }
              />
            </div>
            <div>
              <label className="block text-slate-500 mb-1">Duration (min)</label>
              <input
                type="number"
                className="w-full rounded-xl bg-white border border-borderGray px-3 py-2 focus:outline-none focus:ring-2 focus:ring-primary/30"
                value={form.duration ?? 0}
                onChange={(e) =>
                  setForm({ ...form, duration: Number(e.target.value) || undefined })
                }
              />
            </div>
            <button
              type="submit"
              className="col-span-2 mt-1 rounded-xl bg-primary text-white font-medium py-2 shadow-md shadow-blue-200 hover:opacity-95 transition"
            >
              Add Exercise
            </button>
          </form>
        </div>
        <div className="space-y-4">
          <div className="card border-primary/20 bg-primary/5">
            <div className="flex items-start justify-between gap-3">
              <div>
                <h3 className="text-sm font-semibold text-textDark">Calories burned calculator (bot)</h3>
                <p className="mt-1 text-xs text-slate-600">
                  Example: <span className="font-medium">“30 min brisk walk + 20 min cycling”</span>
                </p>
              </div>
              <div className="rounded-xl bg-white p-2 text-primary border border-borderGray">
                <Sparkles size={18} />
              </div>
            </div>
            <form
              onSubmit={async (e) => {
                e.preventDefault();
                try {
                  setError(null);
                  setAiStatus(null);
                  if (!chatText.trim()) return;
                  setAiStatus("Estimating calories burned...");
                  await api.post("/workout/ai-add", { text: chatText });
                  setChatText("");
                  setAiStatus("Added to today's workout.");
                  await load();
                  refreshTopbar();
                } catch (err: any) {
                  setAiStatus(null);
                  setError(err.response?.data?.message || "AI workout add failed (check GEMINI_API_KEY)");
                }
              }}
              className="mt-3 space-y-2"
            >
              <textarea
                className="w-full rounded-xl bg-white border border-borderGray px-3 py-2 text-sm min-h-[90px] focus:outline-none focus:ring-2 focus:ring-primary/30"
                placeholder="Describe your workout..."
                value={chatText}
                onChange={(e) => setChatText(e.target.value)}
              />
              <div className="flex items-center justify-between gap-2">
                <p className="text-xs text-slate-600">{aiStatus || "AI will estimate burn and log exercises."}</p>
                <button
                  type="submit"
                  className="rounded-xl bg-primary text-white px-4 py-2 text-sm font-medium shadow-md shadow-blue-200 hover:opacity-95 transition"
                >
                  Add from chat
                </button>
              </div>
            </form>
          </div>

          <div className="card">
            <h3 className="text-sm font-semibold text-textDark mb-1">Today&apos;s Workout</h3>
            <div className="flex items-center justify-between text-xs text-slate-600 mb-3">
              <span>Calories burned</span>
              <span className="font-semibold text-primary">{totalCalories.toFixed(0)} kcal</span>
            </div>

            <div className="max-h-72 overflow-y-auto text-xs">
              <table className="w-full text-left text-xs">
                <thead className="text-slate-500">
                  <tr>
                    <th className="py-2">Exercise</th>
                    <th className="py-2 text-right">Sets x Reps</th>
                    <th className="py-2 text-right">Kcal</th>
                    <th className="py-2 text-center">Action</th>
                  </tr>
                </thead>
                <tbody>
                  {today?.exercises?.map((ex, idx) => (
                    <tr key={idx} className="border-t border-borderGray">
                      <td className="py-2">{ex.name}</td>
                      <td className="py-2 text-right">
                        {ex.sets} x {ex.reps}
                      </td>
                      <td className="py-2 text-right">{ex.caloriesBurned}</td>
                      <td className="py-2 text-center">
                        <button
                          onClick={() => deleteWorkout(idx)}
                          className="text-accentRed hover:bg-red-50 rounded p-1 transition"
                          title="Delete"
                        >
                          <Trash2 size={16} />
                        </button>
                      </td>
                    </tr>
                  ))}
                  {!today?.exercises?.length && (
                    <tr>
                      <td className="py-6 text-center text-slate-400" colSpan={4}>
                        No workout logged yet today.
                      </td>
                    </tr>
                  )}
                </tbody>
              </table>
            </div>
          </div>
        </div>
      </div>
    </div>
  );
}

