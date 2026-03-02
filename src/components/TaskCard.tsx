import { useMutation } from "convex/react";
import { api } from "../../convex/_generated/api";
import { Id } from "../../convex/_generated/dataModel";
import { useState } from "react";

interface Task {
  _id: Id<"mainTasks"> | Id<"bonusTasks">;
  title: string;
  description?: string;
  xpReward: number;
  icon: string;
}

interface TaskCardProps {
  task: Task;
  taskType: "main" | "bonus";
  isCompleted: boolean;
  onComplete: (
    taskId: Id<"mainTasks"> | Id<"bonusTasks">,
    taskType: "main" | "bonus",
    xpReward: number,
    isCompleted: boolean
  ) => void;
  isLocked: boolean;
}

export default function TaskCard({ task, taskType, isCompleted, onComplete, isLocked }: TaskCardProps) {
  const [isAnimating, setIsAnimating] = useState(false);
  const [showDelete, setShowDelete] = useState(false);

  const deleteMainTask = useMutation(api.tasks.deleteMainTask);
  const deleteBonusTask = useMutation(api.tasks.deleteBonusTask);

  const handleClick = () => {
    if (isLocked) return;
    setIsAnimating(true);
    onComplete(task._id, taskType, task.xpReward, isCompleted);
    setTimeout(() => setIsAnimating(false), 300);
  };

  const handleDelete = async (e: React.MouseEvent) => {
    e.stopPropagation();
    if (taskType === "main") {
      await deleteMainTask({ id: task._id as Id<"mainTasks"> });
    } else {
      await deleteBonusTask({ id: task._id as Id<"bonusTasks"> });
    }
  };

  const gradientColors = taskType === "main"
    ? isCompleted
      ? "from-amber-500/20 to-orange-500/20 border-amber-500/40"
      : "from-gray-800/50 to-gray-900/50 border-gray-700/50 hover:border-amber-500/30"
    : isCompleted
      ? "from-violet-500/20 to-purple-500/20 border-violet-500/40"
      : "from-gray-800/50 to-gray-900/50 border-gray-700/50 hover:border-violet-500/30";

  return (
    <div
      className={`
        relative group rounded-2xl bg-gradient-to-r ${gradientColors} border p-4 md:p-5
        transition-all duration-300 cursor-pointer
        ${isAnimating ? "scale-[0.98]" : ""}
        ${isLocked ? "opacity-50 cursor-not-allowed" : ""}
        ${isCompleted ? "shadow-lg" : "hover:shadow-md"}
      `}
      onClick={handleClick}
      onMouseEnter={() => setShowDelete(true)}
      onMouseLeave={() => setShowDelete(false)}
    >
      <div className="flex items-center gap-3 md:gap-4">
        {/* Checkbox */}
        <div className={`
          relative w-7 h-7 md:w-8 md:h-8 rounded-xl border-2 flex items-center justify-center
          transition-all duration-300 flex-shrink-0
          ${isCompleted
            ? taskType === "main"
              ? "bg-gradient-to-br from-amber-400 to-orange-500 border-transparent"
              : "bg-gradient-to-br from-violet-400 to-purple-500 border-transparent"
            : taskType === "main"
              ? "border-amber-500/50 group-hover:border-amber-400"
              : "border-violet-500/50 group-hover:border-violet-400"
          }
        `}>
          {isCompleted && (
            <svg className="w-4 h-4 md:w-5 md:h-5 text-white" fill="none" viewBox="0 0 24 24" stroke="currentColor" strokeWidth={3}>
              <path strokeLinecap="round" strokeLinejoin="round" d="M5 13l4 4L19 7" />
            </svg>
          )}
        </div>

        {/* Icon */}
        <div className={`
          w-10 h-10 md:w-12 md:h-12 rounded-xl flex items-center justify-center text-xl md:text-2xl
          transition-all duration-300 flex-shrink-0
          ${isCompleted
            ? "bg-white/10"
            : "bg-gray-800/50 group-hover:bg-gray-700/50"
          }
        `}>
          {task.icon}
        </div>

        {/* Content */}
        <div className="flex-1 min-w-0">
          <h4 className={`
            font-bold text-base md:text-lg transition-all truncate
            ${isCompleted ? "text-gray-300 line-through decoration-2" : "text-white"}
          `}>
            {task.title}
          </h4>
          {task.description && (
            <p className="text-gray-400 text-xs md:text-sm mt-0.5 truncate">{task.description}</p>
          )}
        </div>

        {/* XP Badge */}
        <div className={`
          px-3 py-1.5 rounded-xl font-bold text-sm flex-shrink-0
          transition-all duration-300
          ${isCompleted
            ? taskType === "main"
              ? "bg-amber-500/20 text-amber-300"
              : "bg-violet-500/20 text-violet-300"
            : "bg-gray-800/50 text-gray-400"
          }
        `}>
          +{task.xpReward} XP
        </div>

        {/* Delete Button */}
        <button
          onClick={handleDelete}
          className={`
            absolute -top-2 -right-2 w-6 h-6 rounded-full bg-red-500/80 text-white
            flex items-center justify-center text-xs font-bold
            transition-all duration-200 hover:bg-red-500 hover:scale-110
            ${showDelete ? "opacity-100 scale-100" : "opacity-0 scale-75 pointer-events-none"}
            md:opacity-0 md:group-hover:opacity-100 md:group-hover:scale-100
          `}
        >
          ×
        </button>
      </div>

      {/* Completion sparkle effect */}
      {isAnimating && !isCompleted && (
        <div className="absolute inset-0 rounded-2xl overflow-hidden pointer-events-none">
          <div className="absolute inset-0 bg-gradient-to-r from-amber-400/30 to-orange-400/30 animate-pulse" />
        </div>
      )}
    </div>
  );
}
