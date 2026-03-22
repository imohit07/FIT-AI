import Sidebar from "../layout/Sidebar";
import Topbar from "../layout/Topbar";

export default function Layout({
  children,
  topbar
}: {
  children: React.ReactNode;
  topbar?: { caloriesIn?: number; targetCalories?: number; onQuickAdd?: () => void; currentStreak?: number };
}) {
  return (
    <div className="min-h-screen bg-dashboardBg text-textDark">
      <div className="flex min-h-screen">
        <Sidebar />
        <div className="flex-1 min-w-0">
          <Topbar
            caloriesIn={topbar?.caloriesIn}
            targetCalories={topbar?.targetCalories}
            onQuickAdd={topbar?.onQuickAdd}
            currentStreak={topbar?.currentStreak}
          />
          <main className="mx-auto max-w-[1200px] px-4 py-6">{children}</main>
        </div>
      </div>
    </div>
  );
}

