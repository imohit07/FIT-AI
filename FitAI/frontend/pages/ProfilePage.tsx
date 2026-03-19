import { FormEvent, useEffect, useState } from "react";
import api from "../services/api";

interface Profile {
  name: string;
  age?: number;
  height?: number;
  weight?: number;
  goal?: string;
  activityLevel?: string;
  targetCalories?: number;
}

export default function ProfilePage() {
  const [profile, setProfile] = useState<Profile | null>(null);

  async function load() {
    const res = await api.get("/profile");
    setProfile(res.data);
  }

  useEffect(() => {
    load();
  }, []);

  const onSubmit = async (e: FormEvent) => {
    e.preventDefault();
    await api.put("/profile", profile);
    await load();
  };

  if (!profile) {
    return <p className="text-sm text-slate-400">Loading profile...</p>;
  }

  return (
    <div className="space-y-4">
      <h2 className="text-2xl font-semibold mb-2">Profile</h2>
      <div className="card max-w-xl">
        <form onSubmit={onSubmit} className="grid gap-3 text-xs md:grid-cols-2">
          <div className="md:col-span-2">
            <label className="block text-slate-400 mb-1">Name</label>
            <input
              className="w-full rounded-lg bg-white border border-black px-3 py-2"
              value={profile.name}
              onChange={(e) => setProfile({ ...profile, name: e.target.value })}
            />
          </div>
          <div>
            <label className="block text-slate-400 mb-1">Age</label>
            <input
              type="number"
              className="w-full rounded-lg bg-white border border-black px-3 py-2"
              value={profile.age ?? ""}
              onChange={(e) =>
                setProfile({
                  ...profile,
                  age: e.target.value ? Number(e.target.value) : undefined
                })
              }
            />
          </div>
          <div>
            <label className="block text-slate-400 mb-1">Height (cm)</label>
            <input
              type="number"
              className="w-full rounded-lg bg-white border border-black px-3 py-2"
              value={profile.height ?? ""}
              onChange={(e) =>
                setProfile({
                  ...profile,
                  height: e.target.value ? Number(e.target.value) : undefined
                })
              }
            />
          </div>
          <div>
            <label className="block text-slate-400 mb-1">Weight (kg)</label>
            <input
              type="number"
              className="w-full rounded-lg bg-white border border-black px-3 py-2"
              value={profile.weight ?? ""}
              onChange={(e) =>
                setProfile({
                  ...profile,
                  weight: e.target.value ? Number(e.target.value) : undefined
                })
              }
            />
          </div>
          <div>
            <label className="block text-slate-400 mb-1">Goal</label>
            <select
              className="w-full rounded-lg bg-white border border-black px-3 py-2"
              value={profile.goal ?? "maintain"}
              onChange={(e) => setProfile({ ...profile, goal: e.target.value })}
            >
              <option value="fat_loss">Fat loss</option>
              <option value="muscle_gain">Muscle gain</option>
              <option value="maintain">Maintain</option>
            </select>
          </div>
          <div>
            <label className="block text-slate-400 mb-1">Activity level</label>
            <select
              className="w-full rounded-lg bg-white border border-black px-3 py-2"
              value={profile.activityLevel ?? "moderate"}
              onChange={(e) => setProfile({ ...profile, activityLevel: e.target.value })}
            >
              <option value="sedentary">Sedentary</option>
              <option value="light">Light</option>
              <option value="moderate">Moderate</option>
              <option value="active">Active</option>
              <option value="very_active">Very active</option>
            </select>
          </div>
          <div>
            <label className="block text-slate-400 mb-1">Target calories</label>
            <input
              type="number"
              className="w-full rounded-lg bg-white border border-black px-3 py-2"
              value={profile.targetCalories ?? ""}
              onChange={(e) =>
                setProfile({
                  ...profile,
                  targetCalories: e.target.value ? Number(e.target.value) : undefined
                })
              }
            />
          </div>
          <div className="md:col-span-2 mt-2">
            <button
              type="submit"
              className="rounded-lg bg-primary text-slate-950 font-medium px-4 py-2"
            >
              Save profile
            </button>
          </div>
        </form>
      </div>
    </div>
  );
}

