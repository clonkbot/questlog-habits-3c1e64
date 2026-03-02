interface StatsCardProps {
  icon: string;
  label: string;
  value: number;
  suffix?: string;
  color: "amber" | "violet" | "emerald" | "rose";
}

const colorStyles = {
  amber: {
    bg: "from-amber-500/10 to-orange-500/10",
    border: "border-amber-500/20",
    text: "text-amber-400",
    glow: "shadow-amber-500/10",
  },
  violet: {
    bg: "from-violet-500/10 to-purple-500/10",
    border: "border-violet-500/20",
    text: "text-violet-400",
    glow: "shadow-violet-500/10",
  },
  emerald: {
    bg: "from-emerald-500/10 to-teal-500/10",
    border: "border-emerald-500/20",
    text: "text-emerald-400",
    glow: "shadow-emerald-500/10",
  },
  rose: {
    bg: "from-rose-500/10 to-pink-500/10",
    border: "border-rose-500/20",
    text: "text-rose-400",
    glow: "shadow-rose-500/10",
  },
};

export default function StatsCard({ icon, label, value, suffix, color }: StatsCardProps) {
  const styles = colorStyles[color];

  return (
    <div className={`
      p-3 md:p-4 rounded-xl md:rounded-2xl bg-gradient-to-br ${styles.bg}
      border ${styles.border} shadow-lg ${styles.glow}
      transition-all duration-300 hover:scale-[1.02]
    `}>
      <div className="flex items-center gap-2 md:gap-3">
        <span className="text-xl md:text-2xl">{icon}</span>
        <div className="min-w-0">
          <p className="text-gray-400 text-xs uppercase tracking-wide truncate">{label}</p>
          <p className={`text-lg md:text-2xl font-bold ${styles.text}`}>
            {value.toLocaleString()}{suffix}
          </p>
        </div>
      </div>
    </div>
  );
}
