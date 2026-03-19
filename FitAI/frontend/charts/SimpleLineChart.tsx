import {
  Chart as ChartJS,
  CategoryScale,
  LinearScale,
  PointElement,
  LineElement,
  Tooltip,
  Legend
} from "chart.js";
import { Line } from "react-chartjs-2";

ChartJS.register(CategoryScale, LinearScale, PointElement, LineElement, Tooltip, Legend);

interface Props {
  labels: string[];
  data: number[];
  label: string;
}

export default function SimpleLineChart({ labels, data, label }: Props) {
  return (
    <Line
      data={{
        labels,
        datasets: [
          {
            label,
            data,
            borderColor: "#2563EB",
            backgroundColor: "rgba(37,99,235,0.12)",
            tension: 0.3
          }
        ]
      }}
      options={{
        plugins: { legend: { labels: { color: "#0F172A" } } },
        scales: {
          x: { ticks: { color: "#64748b" }, grid: { color: "#E2E8F0" } },
          y: { ticks: { color: "#64748b" }, grid: { color: "#E2E8F0" } }
        }
      }}
    />
  );
}

