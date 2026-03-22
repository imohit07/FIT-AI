import { Flame, Plus } from "lucide-react";
import { useAuth } from "../services/AuthContext";
import { useState } from "react";

export default function Topbar(props: { 
  caloriesIn?: number; 
  targetCalories?: number; 
  onQuickAdd?: () => void;
  currentStreak?: number;
}) {
  const { user, logout } = useAuth();
  const [showMessage, setShowMessage] = useState(false);
  const [showStreakModal, setShowStreakModal] = useState(false);
  const pct =
    props.targetCalories && props.targetCalories > 0
      ? Math.min(100, Math.round(((props.caloriesIn ?? 0) / props.targetCalories) * 100))
      : 0;

  const handleQuickAdd = () => {
    setShowMessage(true);
    setTimeout(() => setShowMessage(false), 3000);
  };

  const handleStreakClick = () => {
    setShowStreakModal(true);
  };

  return (
    <>
      {/* Streak Modal */}
      {showStreakModal && (
        <div className="fixed inset-0 bg-black bg-opacity-50 flex items-center justify-center z-50" onClick={() => setShowStreakModal(false)}>
          <div className="bg-white rounded-xl p-6 max-w-sm mx-4" onClick={(e) => e.stopPropagation()}>
            <div className="flex items-center gap-3 mb-4">
              <Flame size={24} className="text-orange-500" />
              <h3 className="text-lg font-semibold text-gray-900">Your Streak</h3>
            </div>
            <div className="text-center">
              <div className="text-4xl font-bold text-orange-500 mb-2">
                {props.currentStreak || 0}
              </div>
              <div className="text-gray-600 mb-4">
                {props.currentStreak === 1 ? 'day' : 'days'} hitting your calorie targets
              </div>
              <div className="text-sm text-gray-500">
                Keep it up! Consistency is key to reaching your fitness goals.
              </div>
            </div>
            <button 
              onClick={() => setShowStreakModal(false)}
              className="w-full mt-4 bg-orange-500 text-white py-2 rounded-lg hover:bg-orange-600 transition"
            >
              Close
            </button>
          </div>
        </div>
      )}

      <header className="sticky top-0 z-10 border-b border-borderGray bg-white">
        <div className="mx-auto max-w-[1200px] px-4 py-3 flex items-center justify-between gap-3">
          <div className="lg:hidden flex items-center gap-2">
            <div className="h-9 w-9 rounded-xl bg-primary text-white flex items-center justify-center font-semibold">
              F
            </div>
            <div className="text-sm font-semibold text-textDark">FitAI Tracker</div>
          </div>

          <div className="hidden md:flex items-center gap-3 min-w-[280px]">
            <div className="w-full">
              <div className="flex items-center justify-between text-xs text-slate-500">
                <span>Daily calories</span>
                <span>
                  {props.caloriesIn ?? 0} / {props.targetCalories ?? 0}
                </span>
              </div>
              <div className="mt-1 h-2 w-full rounded-full bg-slate-100 overflow-hidden">
                <div className="h-full bg-gradient-to-r from-blueDark to-secondaryBlue" style={{ width: `${pct}%` }} />
              </div>
            </div>
          </div>

          <div className="flex items-center gap-2">
            <button 
              onClick={handleStreakClick}
              className="h-10 w-10 rounded-xl border border-borderGray bg-white hover:bg-slate-50 flex items-center justify-center relative"
            >
              <Flame size={18} className="text-orange-500" />
              {(props.currentStreak ?? 0) > 0 && (
                <span className="absolute -top-1 -right-1 bg-orange-500 text-white text-xs rounded-full h-5 w-5 flex items-center justify-center font-semibold">
                  {props.currentStreak}
                </span>
              )}
            </button>
            <button
              onClick={handleQuickAdd}
              className="h-10 rounded-xl bg-primary text-white px-3 flex items-center gap-2 shadow-md shadow-blue-200 hover:opacity-95 transition"
            >
              <Plus size={18} />
              <span className="hidden sm:inline text-sm font-medium">Quick add</span>
            </button>
            <div className="ml-1 flex items-center gap-2 pl-2 border-l border-borderGray">
              <div className="h-9 w-9 rounded-full bg-slate-200 flex items-center justify-center text-slate-700 text-sm font-semibold">
                {(user?.name?.[0] || "U").toUpperCase()}
              </div>
              <div className="hidden sm:block">
                <div className="text-xs font-semibold text-textDark">{user?.name || "User"}</div>
                <button onClick={logout} className="text-[11px] text-slate-500 hover:text-slate-700">
                  Logout
                </button>
              </div>
            </div>
          </div>
        </div>
      </header>
      {showMessage && (
        <div className="fixed top-20 left-1/2 transform -translate-x-1/2 bg-slate-800 text-white px-4 py-2 rounded-lg shadow-lg text-sm z-50">
          More to come
        </div>
      )}
    </>
  );
}

