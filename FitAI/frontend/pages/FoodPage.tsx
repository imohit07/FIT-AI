import { FormEvent, useEffect, useState } from "react";
import api from "../services/api";
import { Sparkles, Trash2 } from "lucide-react";

interface FoodItem {
  name: string;
  calories: number;
  protein: number;
  carbs: number;
  fats: number;
  mealType: string;
}

interface FoodLog {
  foodItems: FoodItem[];
  totalCalories: number;
  totalProtein: number;
  totalCarbs: number;
  totalFats: number;
}

export default function FoodPage() {
  const [today, setToday] = useState<FoodLog | null>(null);
  const [form, setForm] = useState<FoodItem>({
    name: "",
    calories: 0,
    protein: 0,
    carbs: 0,
    fats: 0,
    mealType: "breakfast"
  });
  const [error, setError] = useState<string | null>(null);
  const [chatText, setChatText] = useState("");
  const [aiStatus, setAiStatus] = useState<string | null>(null);

  async function load() {
    const res = await api.get("/food/today");
    setToday(res.data);
  }

  useEffect(() => {
    load();
  }, []);

  const onSubmit = async (e: FormEvent) => {
    e.preventDefault();
    try {
      setError(null);
      await api.post("/food/add", form);
      setForm({ ...form, name: "", calories: 0, protein: 0, carbs: 0, fats: 0 });
      await load();
    } catch (err: any) {
      setError(err.response?.data?.message || "Failed to add food");
    }
  };

  const deleteFood = async (idx: number) => {
    try {
      await api.delete(`/food/delete/${idx}`);
      await load();
    } catch (err: any) {
      setError(err.response?.data?.message || "Failed to delete food");
    }
  };

  const totalCalories = today?.totalCalories ?? 0;

  return (
    <div className="space-y-6">
      <div>
        <h2 className="text-2xl font-semibold text-textDark">Food Tracker</h2>
        <p className="text-sm text-slate-500">Log meals manually or paste a message and let AI estimate macros.</p>
      </div>

      <div className="grid gap-4 lg:grid-cols-2">
        <div className="card">
          <h3 className="text-sm font-semibold text-textDark mb-3">Add food (manual)</h3>
          {error && <p className="text-xs text-accentRed mb-2">{error}</p>}
          <form onSubmit={onSubmit} className="grid grid-cols-2 gap-3 text-xs">
            <div className="col-span-2">
              <label className="block text-slate-500 mb-1">Food name</label>
              <input
                className="w-full rounded-xl bg-white border border-borderGray px-3 py-2 focus:outline-none focus:ring-2 focus:ring-primary/30"
                value={form.name}
                onChange={(e) => setForm({ ...form, name: e.target.value })}
              />
            </div>
            <div>
              <label className="block text-slate-500 mb-1">Calories</label>
              <input
                type="number"
                className="w-full rounded-xl bg-white border border-borderGray px-3 py-2 focus:outline-none focus:ring-2 focus:ring-primary/30"
                value={form.calories}
                onChange={(e) => setForm({ ...form, calories: Number(e.target.value) })}
              />
            </div>
            <div>
              <label className="block text-slate-500 mb-1">Protein (g)</label>
              <input
                type="number"
                className="w-full rounded-xl bg-white border border-borderGray px-3 py-2 focus:outline-none focus:ring-2 focus:ring-primary/30"
                value={form.protein}
                onChange={(e) => setForm({ ...form, protein: Number(e.target.value) })}
              />
            </div>
            <div>
              <label className="block text-slate-500 mb-1">Carbs (g)</label>
              <input
                type="number"
                className="w-full rounded-xl bg-white border border-borderGray px-3 py-2 focus:outline-none focus:ring-2 focus:ring-primary/30"
                value={form.carbs}
                onChange={(e) => setForm({ ...form, carbs: Number(e.target.value) })}
              />
            </div>
            <div>
              <label className="block text-slate-500 mb-1">Fats (g)</label>
              <input
                type="number"
                className="w-full rounded-xl bg-white border border-borderGray px-3 py-2 focus:outline-none focus:ring-2 focus:ring-primary/30"
                value={form.fats}
                onChange={(e) => setForm({ ...form, fats: Number(e.target.value) })}
              />
            </div>
            <div className="col-span-2">
              <label className="block text-slate-500 mb-1">Meal type</label>
              <select
                className="w-full rounded-xl bg-white border border-borderGray px-3 py-2 focus:outline-none focus:ring-2 focus:ring-primary/30"
                value={form.mealType}
                onChange={(e) => setForm({ ...form, mealType: e.target.value })}
              >
                <option value="breakfast">Breakfast</option>
                <option value="lunch">Lunch</option>
                <option value="dinner">Dinner</option>
                <option value="snack">Snack</option>
              </select>
            </div>
            <button
              type="submit"
              className="col-span-2 mt-1 rounded-xl bg-primary text-white font-medium py-2 shadow-md shadow-blue-200 hover:opacity-95 transition"
            >
              Add Food
            </button>
          </form>
        </div>

        <div className="space-y-4">
          <div className="card border-primary/20 bg-primary/5">
            <div className="flex items-start justify-between gap-3">
              <div>
                <h3 className="text-sm font-semibold text-textDark">Add food from chat (AI)</h3>
                <p className="mt-1 text-xs text-slate-600">
                  Example: <span className="font-medium">“2 eggs + 1 bowl oats + 1 banana”</span>
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
                  setAiStatus(null);
                  setError(null);
                  if (!chatText.trim()) return;
                  setAiStatus("Estimating calories and macros...");
                  await api.post("/food/ai-add", { text: chatText, mealType: form.mealType });
                  setChatText("");
                  setAiStatus("Added to today's log.");
                  await load();
                } catch (err: any) {
                  setAiStatus(null);
                  setError(err.response?.data?.message || "AI add failed (check GEMINI_API_KEY on backend)");
                }
              }}
              className="mt-3 space-y-2"
            >
              <textarea
                className="w-full rounded-xl bg-white border border-borderGray px-3 py-2 text-sm min-h-[90px] focus:outline-none focus:ring-2 focus:ring-primary/30"
                placeholder="Type what you ate..."
                value={chatText}
                onChange={(e) => setChatText(e.target.value)}
              />
              <div className="flex items-center justify-between gap-2">
                <p className="text-xs text-slate-600">{aiStatus || "AI will estimate macros and log items."}</p>
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
            <h3 className="text-sm font-semibold text-textDark mb-1">Today&apos;s Meals</h3>
            <div className="flex items-center justify-between text-xs text-slate-600 mb-3">
              <span>Total calories</span>
              <span className="font-semibold text-primary">{totalCalories.toFixed(0)} kcal</span>
            </div>

            <div className="grid grid-cols-2 gap-3 text-xs mb-3">
              <div className="rounded-xl border border-borderGray p-3 bg-slate-50">
                <div className="text-slate-500">Protein</div>
                <div className="text-base font-semibold text-textDark">{(today?.totalProtein ?? 0).toFixed(0)} g</div>
              </div>
              <div className="rounded-xl border border-borderGray p-3 bg-slate-50">
                <div className="text-slate-500">Carbs / Fats</div>
                <div className="text-base font-semibold text-textDark">
                  {(today?.totalCarbs ?? 0).toFixed(0)}g / {(today?.totalFats ?? 0).toFixed(0)}g
                </div>
              </div>
            </div>

            <div className="max-h-72 overflow-y-auto text-xs">
              <table className="w-full text-left text-xs">
                <thead className="text-slate-500">
                  <tr>
                    <th className="py-2">Meal</th>
                    <th className="py-2">Food</th>
                    <th className="py-2 text-right">Kcal</th>
                    <th className="py-2 text-right">P</th>
                    <th className="py-2 text-center">Action</th>
                  </tr>
                </thead>
                <tbody>
                  {today?.foodItems?.map((f, idx) => (
                    <tr key={idx} className="border-t border-borderGray">
                      <td className="py-2 capitalize text-slate-500">{f.mealType}</td>
                      <td className="py-2">{f.name}</td>
                      <td className="py-2 text-right">{f.calories}</td>
                      <td className="py-2 text-right">{f.protein}</td>
                      <td className="py-2 text-center">
                        <button
                          onClick={() => deleteFood(idx)}
                          className="text-accentRed hover:bg-red-50 rounded p-1 transition"
                          title="Delete"
                        >
                          <Trash2 size={16} />
                        </button>
                      </td>
                    </tr>
                  ))}
                  {!today?.foodItems?.length && (
                    <tr>
                      <td className="py-6 text-center text-slate-400" colSpan={5}>
                        No food logged yet today.
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

