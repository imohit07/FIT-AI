import { FormEvent, useEffect, useState } from "react";
import api from "../services/api";
import SimpleLineChart from "../charts/SimpleLineChart";

interface Progress {
  date: string;
  weight: number;
}

export default function ProgressPage() {
  const [history, setHistory] = useState<Progress[]>([]);
  const [weight, setWeight] = useState<number>(0);
  const [bodyFat, setBodyFat] = useState<number | undefined>();

  async function load() {
    const res = await api.get("/progress/history");
    const items = (res.data as any[]).map((p) => {
      // Handle both string dates and Firestore Timestamp objects
      let dateStr: string;
      if (typeof p.date === 'string') {
        dateStr = p.date.slice(0, 10);
      } else if (p.date && p.date.toDate) {
        // Firestore Timestamp
        dateStr = p.date.toDate().toISOString().slice(0, 10);
      } else {
        dateStr = String(p.date).slice(0, 10);
      }
      return {
        date: dateStr,
        weight: p.weight
      };
    });
    setHistory(items);
  }

  useEffect(() => {
    load();
  }, []);

  const onSubmit = async (e: FormEvent) => {
    e.preventDefault();
    await api.post("/progress/update", { weight, bodyFat });
    setWeight(0);
    setBodyFat(undefined);
    await load();
  };

  const labels = history.map((h) => h.date);
  const data = history.map((h) => h.weight);

  return (
    <div className="space-y-4">
      <h2 className="text-2xl font-semibold mb-2">Progress</h2>
      <div className="grid gap-4 md:grid-cols-2">
        <div className="card">
          <h3 className="text-sm font-medium mb-3">Update Weight</h3>
          <form onSubmit={onSubmit} className="grid gap-3 text-xs">
            <div>
              <label className="block text-slate-400 mb-1">Weight (kg)</label>
              <input
                type="number"
                className="w-full rounded-lg bg-white border border-black px-3 py-2"
                value={weight}
                onChange={(e) => setWeight(Number(e.target.value))}
              />
            </div>
            <div>
              <label className="block text-slate-400 mb-1">Body fat % (optional)</label>
              <input
                type="number"
                className="w-full rounded-lg bg-white border border-black px-3 py-2"
                value={bodyFat ?? ""}
                onChange={(e) =>
                  setBodyFat(e.target.value ? Number(e.target.value) : undefined)
                }
              />
            </div>
            <button
              type="submit"
              className="rounded-lg bg-primary text-slate-950 font-medium py-2"
            >
              Save
            </button>
          </form>
        </div>
        <div className="card">
          <h3 className="text-sm font-medium mb-3">Weight History</h3>
          {history.length ? (
            <SimpleLineChart labels={labels} data={data} label="Weight (kg)" />
          ) : (
            <p className="text-xs text-slate-500">No progress logged yet.</p>
          )}
        </div>
      </div>
    </div>
  );
}

