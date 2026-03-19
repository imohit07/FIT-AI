export default function ChartCard(props: { title: string; children: React.ReactNode; right?: React.ReactNode }) {
  return (
    <div className="card">
      <div className="mb-3 flex items-center justify-between gap-2">
        <h3 className="text-sm font-semibold text-textDark">{props.title}</h3>
        {props.right}
      </div>
      <div className="h-[280px]">{props.children}</div>
    </div>
  );
}

