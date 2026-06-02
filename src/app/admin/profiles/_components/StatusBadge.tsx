export function StatusBadge({ status }: { status: string }) {
  const cls =
    status === "verified"
      ? "bg-primary/20 text-primary border-primary/30"
      : status === "rejected"
        ? "bg-primary/10 text-primary/60 border-primary/20"
        : "bg-primary/5 text-primary/80 border-primary/15";
  return (
    <span className={`text-[10px] font-black uppercase px-2.5 py-0.5 rounded-full border ${cls}`}>
      {status}
    </span>
  );
}
