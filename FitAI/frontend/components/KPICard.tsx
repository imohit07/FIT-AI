import { ReactNode } from "react";

export default function KPICard(props: {
  title: string;
  value: string;
  subtext?: string;
  icon?: ReactNode;
  right?: ReactNode;
  tone?: "default" | "green" | "red" | "blue";
}) {
  const tone =
    props.tone === "green"
      ? "text-accentGreen"
      : props.tone === "red"
        ? "text-accentRed"
        : props.tone === "blue"
          ? "text-primary"
          : "text-textDark";

  return (
    <div className="card transition-transform hover:scale-[1.02]">
      <div className="flex flex-col gap-1">
        <p className="text-xs text-slate-500 line-clamp-2">{props.title}</p>
        <p className={`text-xl font-semibold ${tone}`}>{props.value}</p>
        {props.subtext && <p className="text-xs text-slate-500 line-clamp-1">{props.subtext}</p>}
        <div className="flex items-end justify-between gap-2 pt-1">
          {props.right && <div className="shrink-0">{props.right}</div>}
          {props.icon && (
            <div className="shrink-0 rounded-xl bg-slate-100 p-2 text-primary">{props.icon}</div>
          )}
        </div>
      </div>
    </div>
  );
}

