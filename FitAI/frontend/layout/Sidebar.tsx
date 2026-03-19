import { Link, useLocation } from "react-router-dom";
import {
  LayoutDashboard,
  Utensils,
  Dumbbell,
  LineChart,
  Sparkles,
  User,
  Settings
} from "lucide-react";

const items = [
  { to: "/", label: "Dashboard", icon: LayoutDashboard },
  { to: "/food", label: "Food Tracker", icon: Utensils },
  { to: "/workout", label: "Workout Tracker", icon: Dumbbell },
  { to: "/progress", label: "Progress", icon: LineChart },
  { to: "/recommendations", label: "Recommendations", icon: Sparkles },
  { to: "/profile", label: "Profile", icon: User },
  { to: "/settings", label: "Settings", icon: Settings }
];

export default function Sidebar() {
  const location = useLocation();

  return (
    <aside className="hidden lg:flex w-72 flex-col border-r border-borderGray bg-gradient-to-b from-blueDark to-blueLight">
      <div className="px-6 py-5 border-b border-white/20">
        <div className="flex items-center gap-2">
          <div className="h-9 w-9 rounded-xl bg-white/20 text-white flex items-center justify-center font-semibold border border-white/20">
            F
          </div>
          <div>
            <div className="text-sm font-semibold text-white">FitAI Tracker</div>
            <div className="text-xs text-white/70">Fitness analytics dashboard</div>
          </div>
        </div>
      </div>
      <nav className="p-4 space-y-1">
        {items.map((it) => {
          const active = location.pathname === it.to;
          const Icon = it.icon;
          return (
            <Link
              key={it.to}
              to={it.to}
              className={`flex items-center gap-3 rounded-xl px-3 py-2 text-sm transition ${
                active
                  ? "bg-white/20 text-white border border-white/20"
                  : "text-white/80 hover:bg-white/10"
              }`}
            >
              <Icon size={18} className={active ? "text-white" : "text-white/60"} />
              <span className="font-medium">{it.label}</span>
            </Link>
          );
        })}
      </nav>
      <div className="mt-auto p-4 text-xs text-white/60">© {new Date().getFullYear()} FitAI</div>
    </aside>
  );
}

