import { useQuery, useMutation } from "convex/react";
import { useAuthActions } from "@convex-dev/auth/react";
import { api } from "../../convex/_generated/api";
import { useEffect, useState } from "react";
import { Id } from "../../convex/_generated/dataModel";
import TaskCard from "./TaskCard";
import AddTaskModal from "./AddTaskModal";
import StatsCard from "./StatsCard";

interface Completion {
  _id: Id<"completions">;
  taskId: Id<"mainTasks"> | Id<"bonusTasks">;
  taskType: "main" | "bonus";
  date: string;
  xpEarned: number;
  completedAt: number;
}

interface MainTask {
  _id: Id<"mainTasks">;
  title: string;
  description?: string;
  xpReward: number;
  icon: string;
}

interface BonusTask {
  _id: Id<"bonusTasks">;
  title: string;
  description?: string;
  xpReward: number;
  icon: string;
}

export default function Dashboard() {
  const { signOut } = useAuthActions();
  const profile = useQuery(api.profiles.get);
  const mainTasks = useQuery(api.tasks.listMainTasks);
  const bonusTasks = useQuery(api.tasks.listBonusTasks);
  const todayCompletions = useQuery(api.completions.getTodayCompletions);
  const recentCompletions = useQuery(api.completions.getRecentCompletions, { days: 7 });

  const createProfile = useMutation(api.profiles.createOrUpdate);
  const addXp = useMutation(api.profiles.addXp);
  const completeTask = useMutation(api.completions.completeTask);
  const uncompleteTask = useMutation(api.completions.uncompleteTask);

  const [showAddModal, setShowAddModal] = useState(false);
  const [addTaskType, setAddTaskType] = useState<"main" | "bonus">("main");
  const [levelUpAnimation, setLevelUpAnimation] = useState(false);
  const [showMobileMenu, setShowMobileMenu] = useState(false);

  useEffect(() => {
    if (profile === null) {
      createProfile({});
    }
  }, [profile, createProfile]);

  const completedMainIds = new Set(
    todayCompletions?.filter((c: Completion) => c.taskType === "main").map((c: Completion) => c.taskId) || []
  );
  const completedBonusIds = new Set(
    todayCompletions?.filter((c: Completion) => c.taskType === "bonus").map((c: Completion) => c.taskId) || []
  );

  const allMainCompleted = mainTasks && mainTasks.length > 0 && mainTasks.every((t: MainTask) => completedMainIds.has(t._id));
  const todayXp = todayCompletions?.reduce((sum: number, c: Completion) => sum + c.xpEarned, 0) || 0;

  const handleComplete = async (
    taskId: Id<"mainTasks"> | Id<"bonusTasks">,
    taskType: "main" | "bonus",
    xpReward: number,
    isCompleted: boolean
  ) => {
    if (isCompleted) {
      const xpLost = await uncompleteTask({ taskId });
      if (xpLost > 0) {
        await addXp({ amount: -xpLost });
      }
    } else {
      await completeTask({ taskId, taskType, xpReward });
      const result = await addXp({ amount: xpReward });
      if (result.levelUp) {
        setLevelUpAnimation(true);
        setTimeout(() => setLevelUpAnimation(false), 2000);
      }
    }
  };

  const openAddModal = (type: "main" | "bonus") => {
    setAddTaskType(type);
    setShowAddModal(true);
  };

  const xpForNextLevel = profile ? (profile.level * 500) : 500;
  const currentLevelXp = profile ? (profile.totalXp % 500) : 0;
  const xpProgress = (currentLevelXp / 500) * 100;

  // Calculate weekly stats
  const weeklyXp = recentCompletions?.reduce((sum: number, c: Completion) => sum + c.xpEarned, 0) || 0;
  const uniqueDays = new Set(recentCompletions?.map((c: Completion) => c.date) || []).size;

  if (!profile || !mainTasks || !bonusTasks || !todayCompletions) {
    return (
      <div className="min-h-screen bg-[#0a0a0f] flex items-center justify-center">
        <div className="flex items-center gap-2">
          <div className="w-3 h-3 rounded-full bg-amber-400 animate-bounce" style={{ animationDelay: "0ms" }} />
          <div className="w-3 h-3 rounded-full bg-orange-400 animate-bounce" style={{ animationDelay: "150ms" }} />
          <div className="w-3 h-3 rounded-full bg-red-400 animate-bounce" style={{ animationDelay: "300ms" }} />
        </div>
      </div>
    );
  }

  return (
    <div className="min-h-screen bg-[#0a0a0f] text-white relative">
      {/* Level Up Animation Overlay */}
      {levelUpAnimation && (
        <div className="fixed inset-0 z-50 flex items-center justify-center bg-black/60 backdrop-blur-sm animate-fade-in">
          <div className="text-center animate-scale-in">
            <div className="text-7xl md:text-8xl mb-4 animate-bounce">🎉</div>
            <h2 className="text-4xl md:text-5xl font-display font-bold text-transparent bg-clip-text bg-gradient-to-r from-amber-400 via-orange-400 to-red-400 mb-2">
              LEVEL UP!
            </h2>
            <p className="text-xl md:text-2xl text-gray-300">You reached Level {profile.level}</p>
          </div>
        </div>
      )}

      {/* Background */}
      <div className="fixed inset-0 overflow-hidden pointer-events-none">
        <div className="absolute top-0 right-0 w-[500px] h-[500px] bg-gradient-to-br from-amber-500/10 to-transparent rounded-full blur-3xl" />
        <div className="absolute bottom-0 left-0 w-[400px] h-[400px] bg-gradient-to-tr from-violet-500/10 to-transparent rounded-full blur-3xl" />
        <div
          className="absolute inset-0 opacity-[0.02]"
          style={{
            backgroundImage: `linear-gradient(rgba(255,255,255,0.1) 1px, transparent 1px), linear-gradient(90deg, rgba(255,255,255,0.1) 1px, transparent 1px)`,
            backgroundSize: '40px 40px'
          }}
        />
      </div>

      {/* Header */}
      <header className="sticky top-0 z-40 bg-[#0a0a0f]/80 backdrop-blur-xl border-b border-gray-800/50">
        <div className="max-w-7xl mx-auto px-4 md:px-6 py-3 md:py-4">
          <div className="flex items-center justify-between">
            <div className="flex items-center gap-3 md:gap-4">
              <div className="w-10 h-10 md:w-12 md:h-12 rounded-xl bg-gradient-to-br from-amber-400 via-orange-500 to-red-500 flex items-center justify-center shadow-lg shadow-orange-500/20">
                <span className="text-xl md:text-2xl">⚔️</span>
              </div>
              <div className="hidden sm:block">
                <h1 className="font-display text-xl font-bold tracking-tight">
                  QUEST<span className="text-amber-400">LOG</span>
                </h1>
              </div>
            </div>

            {/* Desktop Profile */}
            <div className="hidden md:flex items-center gap-6">
              <div className="flex items-center gap-4">
                <div className="text-right">
                  <p className="text-sm text-gray-400">Level {profile.level}</p>
                  <p className="font-bold text-amber-400">{profile.totalXp.toLocaleString()} XP</p>
                </div>
                <div className="w-32 h-3 bg-gray-800 rounded-full overflow-hidden">
                  <div
                    className="h-full bg-gradient-to-r from-amber-400 to-orange-500 rounded-full transition-all duration-500"
                    style={{ width: `${xpProgress}%` }}
                  />
                </div>
              </div>

              <div className="flex items-center gap-3 px-4 py-2 rounded-xl bg-gray-800/50 border border-gray-700/50">
                <span className="text-2xl">🔥</span>
                <div>
                  <p className="text-xs text-gray-400">Streak</p>
                  <p className="font-bold">{profile.streak} days</p>
                </div>
              </div>

              <button
                onClick={() => signOut()}
                className="px-4 py-2 rounded-xl bg-gray-800/50 border border-gray-700/50 text-gray-400 hover:text-white hover:bg-gray-700/50 transition-all text-sm font-medium"
              >
                Sign Out
              </button>
            </div>

            {/* Mobile Menu Button */}
            <button
              onClick={() => setShowMobileMenu(!showMobileMenu)}
              className="md:hidden p-2 rounded-xl bg-gray-800/50 border border-gray-700/50"
            >
              <svg className="w-6 h-6" fill="none" viewBox="0 0 24 24" stroke="currentColor">
                <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M4 6h16M4 12h16M4 18h16" />
              </svg>
            </button>
          </div>

          {/* Mobile Menu */}
          {showMobileMenu && (
            <div className="md:hidden mt-4 p-4 rounded-xl bg-gray-800/50 border border-gray-700/50 animate-fade-in">
              <div className="flex items-center justify-between mb-4">
                <div>
                  <p className="text-sm text-gray-400">Level {profile.level}</p>
                  <p className="font-bold text-amber-400">{profile.totalXp.toLocaleString()} XP</p>
                </div>
                <div className="flex items-center gap-2">
                  <span className="text-xl">🔥</span>
                  <span className="font-bold">{profile.streak} days</span>
                </div>
              </div>
              <div className="w-full h-2 bg-gray-800 rounded-full overflow-hidden mb-4">
                <div
                  className="h-full bg-gradient-to-r from-amber-400 to-orange-500 rounded-full transition-all duration-500"
                  style={{ width: `${xpProgress}%` }}
                />
              </div>
              <button
                onClick={() => signOut()}
                className="w-full py-2 rounded-xl bg-gray-700/50 text-gray-300 font-medium"
              >
                Sign Out
              </button>
            </div>
          )}
        </div>
      </header>

      <main className="relative z-10 max-w-7xl mx-auto px-4 md:px-6 py-6 md:py-8 pb-24 md:pb-8">
        {/* Today's Progress */}
        <div className="mb-6 md:mb-8">
          <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-4 mb-4 md:mb-6">
            <div>
              <h2 className="text-2xl md:text-3xl font-display font-bold mb-1">Today's Quests</h2>
              <p className="text-gray-400 text-sm md:text-base">
                {new Date().toLocaleDateString("en-US", { weekday: "long", month: "long", day: "numeric" })}
              </p>
            </div>
            <div className="flex items-center gap-2 px-4 py-2 rounded-xl bg-gradient-to-r from-amber-500/10 to-orange-500/10 border border-amber-500/20">
              <span className="text-xl md:text-2xl">✨</span>
              <span className="font-bold text-amber-400 text-lg md:text-xl">{todayXp} XP</span>
              <span className="text-gray-400 text-sm">earned today</span>
            </div>
          </div>

          {/* Stats Grid */}
          <div className="grid grid-cols-2 lg:grid-cols-4 gap-3 md:gap-4 mb-6 md:mb-8">
            <StatsCard
              icon="⚡"
              label="Today's XP"
              value={todayXp}
              color="amber"
            />
            <StatsCard
              icon="📅"
              label="Weekly XP"
              value={weeklyXp}
              color="violet"
            />
            <StatsCard
              icon="🎯"
              label="Active Days"
              value={uniqueDays}
              suffix="/7"
              color="emerald"
            />
            <StatsCard
              icon="🏆"
              label="Total Level"
              value={profile.level}
              color="rose"
            />
          </div>
        </div>

        {/* Main Tasks Section */}
        <section className="mb-8 md:mb-10">
          <div className="flex items-center justify-between mb-4 md:mb-5">
            <div className="flex items-center gap-3">
              <div className="w-10 h-10 rounded-xl bg-gradient-to-br from-amber-500/20 to-orange-500/20 flex items-center justify-center">
                <span className="text-xl">🎯</span>
              </div>
              <div>
                <h3 className="text-lg md:text-xl font-bold">Main Quests</h3>
                <p className="text-xs md:text-sm text-gray-400">Complete all to unlock bonus quests</p>
              </div>
            </div>
            <button
              onClick={() => openAddModal("main")}
              className="px-3 md:px-4 py-2 rounded-xl bg-amber-500/10 border border-amber-500/30 text-amber-400 hover:bg-amber-500/20 transition-all text-sm font-medium flex items-center gap-2"
            >
              <span className="text-lg">+</span>
              <span className="hidden sm:inline">Add Quest</span>
            </button>
          </div>

          {mainTasks.length === 0 ? (
            <div className="text-center py-10 md:py-12 rounded-2xl bg-gray-900/30 border border-gray-800/50 border-dashed">
              <span className="text-4xl md:text-5xl mb-4 block">🗺️</span>
              <p className="text-gray-400 mb-4 text-sm md:text-base">No main quests yet. Start your adventure!</p>
              <button
                onClick={() => openAddModal("main")}
                className="px-5 py-2.5 rounded-xl bg-gradient-to-r from-amber-500 to-orange-500 text-white font-medium hover:shadow-lg hover:shadow-orange-500/30 transition-all"
              >
                Create First Quest
              </button>
            </div>
          ) : (
            <div className="grid gap-3 md:gap-4">
              {mainTasks.map((task: MainTask) => (
                <TaskCard
                  key={task._id}
                  task={task}
                  taskType="main"
                  isCompleted={completedMainIds.has(task._id)}
                  onComplete={handleComplete}
                  isLocked={false}
                />
              ))}
            </div>
          )}

          {mainTasks.length > 0 && (
            <div className="mt-4 flex items-center gap-3">
              <div className="flex-1 h-2 bg-gray-800 rounded-full overflow-hidden">
                <div
                  className="h-full bg-gradient-to-r from-amber-400 to-orange-500 rounded-full transition-all duration-500"
                  style={{ width: `${(completedMainIds.size / mainTasks.length) * 100}%` }}
                />
              </div>
              <span className="text-sm text-gray-400 whitespace-nowrap">
                {completedMainIds.size}/{mainTasks.length} complete
              </span>
            </div>
          )}
        </section>

        {/* Bonus Tasks Section */}
        <section>
          <div className="flex items-center justify-between mb-4 md:mb-5">
            <div className="flex items-center gap-3">
              <div className={`w-10 h-10 rounded-xl flex items-center justify-center ${
                allMainCompleted
                  ? "bg-gradient-to-br from-violet-500/20 to-purple-500/20"
                  : "bg-gray-800/50"
              }`}>
                <span className="text-xl">{allMainCompleted ? "⭐" : "🔒"}</span>
              </div>
              <div>
                <h3 className="text-lg md:text-xl font-bold">Bonus Quests</h3>
                <p className="text-xs md:text-sm text-gray-400">
                  {allMainCompleted ? "Extra challenges for bonus XP!" : "Complete all main quests to unlock"}
                </p>
              </div>
            </div>
            {allMainCompleted && (
              <button
                onClick={() => openAddModal("bonus")}
                className="px-3 md:px-4 py-2 rounded-xl bg-violet-500/10 border border-violet-500/30 text-violet-400 hover:bg-violet-500/20 transition-all text-sm font-medium flex items-center gap-2"
              >
                <span className="text-lg">+</span>
                <span className="hidden sm:inline">Add Bonus</span>
              </button>
            )}
          </div>

          {!allMainCompleted ? (
            <div className="text-center py-10 md:py-12 rounded-2xl bg-gray-900/30 border border-gray-800/50 opacity-60">
              <span className="text-4xl md:text-5xl mb-4 block grayscale">🔐</span>
              <p className="text-gray-500 text-sm md:text-base">Complete all main quests to unlock bonus rewards</p>
            </div>
          ) : bonusTasks.length === 0 ? (
            <div className="text-center py-10 md:py-12 rounded-2xl bg-gradient-to-br from-violet-900/20 to-purple-900/20 border border-violet-500/20 border-dashed">
              <span className="text-4xl md:text-5xl mb-4 block">🌟</span>
              <p className="text-gray-400 mb-4 text-sm md:text-base">Add bonus quests for extra XP!</p>
              <button
                onClick={() => openAddModal("bonus")}
                className="px-5 py-2.5 rounded-xl bg-gradient-to-r from-violet-500 to-purple-500 text-white font-medium hover:shadow-lg hover:shadow-violet-500/30 transition-all"
              >
                Add Bonus Quest
              </button>
            </div>
          ) : (
            <div className="grid gap-3 md:gap-4">
              {bonusTasks.map((task: BonusTask) => (
                <TaskCard
                  key={task._id}
                  task={task}
                  taskType="bonus"
                  isCompleted={completedBonusIds.has(task._id)}
                  onComplete={handleComplete}
                  isLocked={false}
                />
              ))}
            </div>
          )}
        </section>
      </main>

      {/* Footer */}
      <footer className="relative z-10 border-t border-gray-800/50 py-4 md:py-6 mt-8 md:mt-12">
        <div className="max-w-7xl mx-auto px-4 md:px-6 text-center">
          <p className="text-gray-600 text-xs md:text-sm">
            Requested by <span className="text-gray-500">@michaelonsol</span> · Built by <span className="text-gray-500">@clonkbot</span>
          </p>
        </div>
      </footer>

      {/* Add Task Modal */}
      {showAddModal && (
        <AddTaskModal
          type={addTaskType}
          onClose={() => setShowAddModal(false)}
        />
      )}

      <style>{`
        @keyframes fade-in {
          from { opacity: 0; }
          to { opacity: 1; }
        }
        @keyframes scale-in {
          from { transform: scale(0.8); opacity: 0; }
          to { transform: scale(1); opacity: 1; }
        }
        .animate-fade-in {
          animation: fade-in 0.3s ease-out;
        }
        .animate-scale-in {
          animation: scale-in 0.5s cubic-bezier(0.34, 1.56, 0.64, 1);
        }
      `}</style>
    </div>
  );
}
