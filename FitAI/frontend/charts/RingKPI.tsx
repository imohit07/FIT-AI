import {
  Chart as ChartJS,
  ArcElement,
  Tooltip
} from "chart.js";
import { Doughnut } from "react-chartjs-2";

ChartJS.register(ArcElement, Tooltip);

export default function RingKPI(props: {
  value: number;
  max: number;
  labelTop: string;
  labelBottom: string;
  color?: string;
}) {
  const pct = props.max > 0 ? Math.max(0, Math.min(1, props.value / props.max)) : 0;
  const color = props.color ?? "#2563EB";

  return (
    <div className="relative h-[160px] w-[160px]">
      <Doughnut
        data={{
          labels: ["Progress", "Remaining"],
          datasets: [
            {
              data: [Math.round(pct * 100), 100 - Math.round(pct * 100)],
              backgroundColor: [color, "#E2E8F0"],
              borderWidth: 0
            }
          ]
        }}
        options={{
          cutout: "74%",
          plugins: { tooltip: { enabled: false } }
        }}
      />
    <div className="absolute inset-0 flex flex-col items-center justify-center text-center space-y-0.5 pt-10">
        <div className="text-[10px] text-slate-500">{props.labelTop}</div>
        <div className="text-base font-bold text-textDark">{Math.round(pct * 100)}%</div>
        <div className="text-[10px] text-slate-500">{props.labelBottom}</div>
      </div>
    </div>
  );
}

