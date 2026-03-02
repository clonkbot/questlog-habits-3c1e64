import { useMutation } from "convex/react";
import { api } from "../../convex/_generated/api";
import { useState } from "react";

interface AddTaskModalProps {
  type: "main" | "bonus";
  onClose: () => void;
}

const ICONS = ["💪", "📚", "🏃", "💧", "🧘", "✍️", "🎯", "💤", "🥗", "🧠", "🎨", "💼", "🏋️", "📱", "🌅", "🚶", "🍎", "🧹", "💰", "🎵"];

export default function AddTaskModal({ type, onClose }: AddTaskModalProps) {
  const [title, setTitle] = useState("");
  const [description, setDescription] = useState("");
  const [xpReward, setXpReward] = useState(type === "main" ? 50 : 25);
  const [icon, setIcon] = useState("🎯");
  const [isSubmitting, setIsSubmitting] = useState(false);

  const createMainTask = useMutation(api.tasks.createMainTask);
  const createBonusTask = useMutation(api.tasks.createBonusTask);

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    if (!title.trim()) return;

    setIsSubmitting(true);
    try {
      if (type === "main") {
        await createMainTask({ title, description: description || undefined, xpReward, icon });
      } else {
        await createBonusTask({ title, description: description || undefined, xpReward, icon });
      }
      onClose();
    } finally {
      setIsSubmitting(false);
    }
  };

  const gradientColors = type === "main"
    ? "from-amber-500 to-orange-500"
    : "from-violet-500 to-purple-500";

  const accentColor = type === "main" ? "amber" : "violet";

  return (
    <div className="fixed inset-0 z-50 flex items-center justify-center p-4 bg-black/60 backdrop-blur-sm animate-fade-in">
      <div
        className="w-full max-w-md bg-gradient-to-b from-gray-900 to-gray-950 rounded-3xl border border-gray-800/50 shadow-2xl animate-scale-in overflow-hidden max-h-[90vh] flex flex-col"
        onClick={(e) => e.stopPropagation()}
      >
        {/* Header */}
        <div className={`bg-gradient-to-r ${gradientColors} p-5 md:p-6`}>
          <div className="flex items-center justify-between">
            <div className="flex items-center gap-3">
              <span className="text-3xl">{type === "main" ? "🎯" : "⭐"}</span>
              <div>
                <h2 className="text-xl font-bold text-white">
                  {type === "main" ? "New Main Quest" : "New Bonus Quest"}
                </h2>
                <p className="text-white/80 text-sm">
                  {type === "main" ? "Core daily habit" : "Extra challenge"}
                </p>
              </div>
            </div>
            <button
              onClick={onClose}
              className="w-8 h-8 rounded-full bg-white/20 hover:bg-white/30 flex items-center justify-center transition-colors"
            >
              <span className="text-white text-xl leading-none">×</span>
            </button>
          </div>
        </div>

        {/* Form */}
        <form onSubmit={handleSubmit} className="p-5 md:p-6 space-y-5 overflow-y-auto flex-1">
          {/* Icon Selector */}
          <div>
            <label className="block text-gray-400 text-sm font-medium mb-2">Choose Icon</label>
            <div className="grid grid-cols-10 gap-1.5 md:gap-2 p-3 rounded-xl bg-gray-800/30 border border-gray-700/50 max-h-28 overflow-y-auto">
              {ICONS.map((emoji) => (
                <button
                  key={emoji}
                  type="button"
                  onClick={() => setIcon(emoji)}
                  className={`
                    w-8 h-8 md:w-9 md:h-9 rounded-lg flex items-center justify-center text-lg md:text-xl
                    transition-all duration-200
                    ${icon === emoji
                      ? `bg-${accentColor}-500/30 border-2 border-${accentColor}-400 scale-110`
                      : "hover:bg-gray-700/50"
                    }
                  `}
                  style={icon === emoji ? {
                    backgroundColor: type === "main" ? "rgba(245, 158, 11, 0.3)" : "rgba(139, 92, 246, 0.3)",
                    borderColor: type === "main" ? "rgb(251, 191, 36)" : "rgb(167, 139, 250)"
                  } : {}}
                >
                  {emoji}
                </button>
              ))}
            </div>
          </div>

          {/* Title */}
          <div>
            <label className="block text-gray-400 text-sm font-medium mb-2">Quest Title</label>
            <input
              type="text"
              value={title}
              onChange={(e) => setTitle(e.target.value)}
              placeholder="e.g., Morning meditation"
              required
              className={`
                w-full px-4 py-3 rounded-xl bg-gray-800/50 border border-gray-700/50
                text-white placeholder-gray-500 text-base
                focus:outline-none focus:border-${accentColor}-500/50 focus:ring-2 focus:ring-${accentColor}-500/20
                transition-all
              `}
              style={{
                borderColor: 'rgba(55, 65, 81, 0.5)',
              }}
              onFocus={(e) => {
                e.target.style.borderColor = type === "main" ? "rgba(245, 158, 11, 0.5)" : "rgba(139, 92, 246, 0.5)";
              }}
              onBlur={(e) => {
                e.target.style.borderColor = "rgba(55, 65, 81, 0.5)";
              }}
            />
          </div>

          {/* Description */}
          <div>
            <label className="block text-gray-400 text-sm font-medium mb-2">Description (optional)</label>
            <input
              type="text"
              value={description}
              onChange={(e) => setDescription(e.target.value)}
              placeholder="Brief description..."
              className="w-full px-4 py-3 rounded-xl bg-gray-800/50 border border-gray-700/50 text-white placeholder-gray-500 focus:outline-none transition-all text-base"
            />
          </div>

          {/* XP Reward */}
          <div>
            <label className="block text-gray-400 text-sm font-medium mb-2">XP Reward</label>
            <div className="flex items-center gap-3 flex-wrap">
              {[25, 50, 75, 100].map((xp) => (
                <button
                  key={xp}
                  type="button"
                  onClick={() => setXpReward(xp)}
                  className={`
                    px-4 py-2 rounded-xl font-bold text-sm transition-all
                    ${xpReward === xp
                      ? `bg-gradient-to-r ${gradientColors} text-white shadow-lg`
                      : "bg-gray-800/50 border border-gray-700/50 text-gray-400 hover:text-white"
                    }
                  `}
                >
                  {xp} XP
                </button>
              ))}
            </div>
          </div>

          {/* Submit */}
          <button
            type="submit"
            disabled={isSubmitting || !title.trim()}
            className={`
              w-full py-3.5 md:py-4 rounded-xl bg-gradient-to-r ${gradientColors}
              text-white font-bold text-lg shadow-lg
              hover:shadow-xl transform hover:scale-[1.02] active:scale-[0.98]
              transition-all disabled:opacity-50 disabled:cursor-not-allowed
            `}
          >
            {isSubmitting ? (
              <span className="flex items-center justify-center gap-2">
                <svg className="animate-spin h-5 w-5" viewBox="0 0 24 24">
                  <circle className="opacity-25" cx="12" cy="12" r="10" stroke="currentColor" strokeWidth="4" fill="none" />
                  <path className="opacity-75" fill="currentColor" d="M4 12a8 8 0 018-8V0C5.373 0 0 5.373 0 12h4z" />
                </svg>
                Creating...
              </span>
            ) : (
              <>Create Quest</>
            )}
          </button>
        </form>
      </div>

      <style>{`
        @keyframes fade-in {
          from { opacity: 0; }
          to { opacity: 1; }
        }
        @keyframes scale-in {
          from { transform: scale(0.9) translateY(20px); opacity: 0; }
          to { transform: scale(1) translateY(0); opacity: 1; }
        }
        .animate-fade-in {
          animation: fade-in 0.2s ease-out;
        }
        .animate-scale-in {
          animation: scale-in 0.3s cubic-bezier(0.34, 1.56, 0.64, 1);
        }
      `}</style>
    </div>
  );
}
