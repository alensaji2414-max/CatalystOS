
import { useStudyStore } from "@/lib/study-store";
import { cn } from "@/lib/utils";
import { motion, AnimatePresence } from "framer-motion";
import {
  LayoutDashboard,
  Timer,
  BookOpen,
  Target,
  FileText,
  BarChart3,
  Trophy,
  FlaskConical,
  Settings,
  Sparkles,
  Atom,
  User,
  X,
} from "lucide-react";
import { Button } from "@/components/ui/button";
import { Progress } from "@/components/ui/progress";

type View = 
  | "dashboard"
  | "pomodoro"
  | "subjects"
  | "quests"
  | "notes"
  | "analytics"
  | "achievements"
  | "chemistry"
  | "settings"
  | "character";

interface NavigationProps {
  currentView: View;
  onViewChange: (view: View) => void;
  mobileOpen?: boolean;
  onMobileToggle?: () => void;
}

const navItems: { id: View; label: string; icon: React.ElementType; color: string; shortcut?: string }[] = [
  { id: "dashboard", label: "Dashboard", icon: LayoutDashboard, color: "text-cyan-400", shortcut: "1" },
  { id: "pomodoro", label: "Focus Lab", icon: Timer, color: "text-primary", shortcut: "2" },
  { id: "subjects", label: "Subjects", icon: BookOpen, color: "text-blue-400", shortcut: "3" },
  { id: "quests", label: "Quests", icon: Target, color: "text-yellow-400", shortcut: "4" },
  { id: "notes", label: "Notes", icon: FileText, color: "text-emerald-400", shortcut: "5" },
  { id: "analytics", label: "Analytics", icon: BarChart3, color: "text-purple-400", shortcut: "6" },
  { id: "achievements", label: "Achievements", icon: Trophy, color: "text-orange-400", shortcut: "7" },
  { id: "character", label: "Character", icon: User, color: "text-pink-400", shortcut: "8" },
  { id: "chemistry", label: "Chem Tools", icon: FlaskConical, color: "text-rose-400" },
  { id: "settings", label: "Settings", icon: Settings, color: "text-muted-foreground" },
];

const LEVEL_THRESHOLDS = [
  0, 100, 250, 450, 700, 1000, 1400, 1900, 2500, 3200,
  4000, 5000, 6200, 7600, 9200, 11000, 13000, 15500, 18500, 22000,
];

export function Navigation({ currentView, onViewChange, mobileOpen, onMobileToggle }: NavigationProps) {
  const { stats, character, achievements, creatorProfile } = useStudyStore();
  
  const currentLevelThreshold = LEVEL_THRESHOLDS[stats.level - 1] || 0;
  const nextLevelThreshold = LEVEL_THRESHOLDS[stats.level] || LEVEL_THRESHOLDS[LEVEL_THRESHOLDS.length - 1] + 10000;
  const xpInCurrentLevel = stats.totalXp - currentLevelThreshold;
  const xpNeededForLevel = nextLevelThreshold - currentLevelThreshold;
  const xpProgress = (xpInCurrentLevel / xpNeededForLevel) * 100;
  const totalStudyHours = Math.floor(stats.totalStudyMinutes / 60);
  const unlockedAchievements = achievements.filter(a => a.unlockedAt).length;

  const NavContent = () => (
    <>
      {/* Animated gradient border */}
      <motion.div 
        className="absolute right-0 top-0 h-full w-[1px] overflow-hidden"
        initial={{ opacity: 0 }}
        animate={{ opacity: 1 }}
        transition={{ delay: 0.5 }}
      >
        <motion.div
          className="h-full w-full bg-gradient-to-b from-primary/0 via-primary to-primary/0"
          animate={{ y: ["-100%", "100%"] }}
          transition={{ duration: 3, repeat: Infinity, ease: "linear" }}
        />
      </motion.div>
      
      {/* Logo */}
      <motion.div 
        initial={{ opacity: 0, y: -20 }}
        animate={{ opacity: 1, y: 0 }}
        transition={{ delay: 0.2, duration: 0.4 }}
        className="flex h-16 items-center justify-between border-b border-primary/20 px-4"
      >
        <div className="flex items-center gap-3">
          <div className="relative">
            <motion.div
              animate={{ rotate: [0, 5, -5, 0], scale: [1, 1.05, 1] }}
              transition={{ duration: 4, repeat: Infinity, ease: "easeInOut" }}
            >
              <FlaskConical className="h-8 w-8 text-primary" />
            </motion.div>
            <motion.div
              animate={{ scale: [1, 1.3, 1], opacity: [1, 0.7, 1] }}
              transition={{ duration: 2, repeat: Infinity, ease: "easeInOut" }}
            >
              <Sparkles className="absolute -right-1 -top-1 h-4 w-4 text-yellow-400" />
            </motion.div>
          </div>
          <div>
            <h1 className="font-bold text-foreground neon-text-cyan">CatalystOS</h1>
            <p className="text-xs text-muted-foreground">Research Laboratory</p>
          </div>
        </div>
        
        {/* Mobile close button */}
        {onMobileToggle && (
          <button 
            onClick={onMobileToggle}
            className="lg:hidden p-2 hover:bg-accent rounded-lg transition-colors"
          >
            <X className="h-5 w-5" />
          </button>
        )}
      </motion.div>

      {/* Character Summary */}
      <motion.div 
        initial={{ opacity: 0, scale: 0.95 }}
        animate={{ opacity: 1, scale: 1 }}
        transition={{ delay: 0.3, duration: 0.4 }}
        className="border-b border-primary/20 p-4"
      >
        <div className="flex items-center gap-3">
          <div className="relative h-12 w-12">
            {/* Orbital rings */}
            <motion.div
              className="absolute inset-0"
              animate={{ rotate: 360 }}
              transition={{ duration: 8, repeat: Infinity, ease: "linear" }}
            >
              <div className="absolute top-0 left-1/2 -translate-x-1/2 w-2 h-2 rounded-full bg-primary/60" />
            </motion.div>
            <motion.div
              className="absolute inset-0"
              animate={{ rotate: -360 }}
              transition={{ duration: 6, repeat: Infinity, ease: "linear" }}
            >
              <div className="absolute bottom-0 left-1/2 -translate-x-1/2 w-1.5 h-1.5 rounded-full bg-cyan-400/60" />
            </motion.div>
            
            <div className="relative h-12 w-12 rounded-full bg-gradient-to-br from-primary/30 to-cyan-500/30 p-0.5">
              <div className="flex h-full w-full items-center justify-center rounded-full bg-card">
                <motion.div
                  animate={{ scale: [1, 1.1, 1] }}
                  transition={{ duration: 3, repeat: Infinity, ease: "easeInOut" }}
                >
                  <Atom className="h-6 w-6 text-primary" />
                </motion.div>
              </div>
            </div>
            <motion.div 
              className="absolute -bottom-1 -right-1 flex h-5 w-5 items-center justify-center rounded-full bg-primary text-[10px] font-bold text-primary-foreground"
              animate={{ 
                boxShadow: ["0 0 0 0 rgba(0, 220, 190, 0.4)", "0 0 0 8px rgba(0, 220, 190, 0)", "0 0 0 0 rgba(0, 220, 190, 0)"]
              }}
              transition={{ duration: 2, repeat: Infinity, ease: "easeOut" }}
            >
              {stats.level}
            </motion.div>
          </div>
          <div className="flex-1 min-w-0">
            <p className="font-medium text-foreground truncate">{character.title}</p>
            <p className="text-xs text-muted-foreground font-mono">
              {xpInCurrentLevel.toLocaleString()} / {xpNeededForLevel.toLocaleString()} XP
            </p>
          </div>
        </div>
        <div className="mt-3 relative">
          <Progress value={xpProgress} className="h-2 progress-glow" />
          <motion.div
            className="absolute top-0 left-0 h-full rounded-full bg-gradient-to-r from-primary/50 to-transparent"
            style={{ width: `${xpProgress}%` }}
            animate={{ opacity: [0.3, 0.6, 0.3] }}
            transition={{ duration: 2, repeat: Infinity, ease: "easeInOut" }}
          />
        </div>
      </motion.div>

      {/* Navigation */}
      <nav className="flex-1 space-y-1 p-3 overflow-y-auto h-[calc(100vh-340px)]">
        <AnimatePresence>
          {navItems.map((item, index) => {
            const Icon = item.icon;
            const isActive = currentView === item.id;
            return (
              <motion.div
                key={item.id}
                initial={{ opacity: 0, x: -20 }}
                animate={{ opacity: 1, x: 0 }}
                transition={{ delay: 0.1 + index * 0.04, duration: 0.3 }}
              >
                <Button
                  variant={isActive ? "secondary" : "ghost"}
                  className={cn(
                    "w-full justify-start gap-3 transition-all duration-300 relative overflow-hidden group h-10",
                    isActive && "bg-primary/20 border border-primary/30 shadow-[0_0_15px_-3px] shadow-primary/30",
                    !isActive && "hover:bg-primary/10"
                  )}
                  onClick={() => onViewChange(item.id)}
                >
                  {/* Hover shimmer effect */}
                  <motion.div
                    className="absolute inset-0 bg-gradient-to-r from-transparent via-primary/10 to-transparent -translate-x-full group-hover:translate-x-full"
                    transition={{ duration: 0.5 }}
                  />
                  
                  <motion.div
                    animate={isActive ? { scale: [1, 1.15, 1] } : {}}
                    transition={{ duration: 0.3 }}
                    className="relative z-10"
                  >
                    <Icon className={cn("h-5 w-5", isActive ? item.color : "text-muted-foreground group-hover:" + item.color.replace("text-", "text-"))} />
                  </motion.div>
                  <span className={cn("relative z-10 flex-1 text-left", isActive && "text-foreground font-medium")}>{item.label}</span>
                  
                  {/* Keyboard shortcut */}
                  {item.shortcut && (
                    <span className="relative z-10 text-[10px] text-muted-foreground/50 font-mono hidden sm:block">
                      {item.shortcut}
                    </span>
                  )}
                  
                  {isActive && (
                    <motion.div 
                      layoutId="nav-indicator"
                      className="absolute left-0 top-0 bottom-0 w-1 bg-primary rounded-full"
                      initial={false}
                      transition={{ type: "spring", stiffness: 500, damping: 30 }}
                    />
                  )}
                </Button>
              </motion.div>
            );
          })}
        </AnimatePresence>
      </nav>

      {/* Footer: Stats + Creator Profile */}
      <motion.div 
        initial={{ opacity: 0, y: 20 }}
        animate={{ opacity: 1, y: 0 }}
        transition={{ delay: 0.6, duration: 0.4 }}
        className="absolute bottom-0 left-0 right-0 border-t border-primary/20 bg-card/90 backdrop-blur-sm"
      >
        {/* Stats row */}
        <div className="grid grid-cols-3 gap-2 text-center px-3 pt-3 pb-2">
          {[
            { value: totalStudyHours, label: "Hours", color: "text-primary", icon: "⏱️" },
            { value: stats.currentStreak, label: "Streak", color: "text-orange-400", icon: "🔥" },
            { value: unlockedAchievements, label: "Badges", color: "text-yellow-400", icon: "🏆" },
          ].map((stat, index) => (
            <motion.div
              key={stat.label}
              initial={{ opacity: 0, scale: 0.8 }}
              animate={{ opacity: 1, scale: 1 }}
              transition={{ delay: 0.7 + index * 0.1, duration: 0.3 }}
              whileHover={{ scale: 1.05, y: -2 }}
              className="cursor-default"
            >
              <motion.p className={cn("text-base font-bold font-mono flex items-center justify-center gap-1", stat.color)}>
                <span className="text-xs">{stat.icon}</span>
                {stat.value}
              </motion.p>
              <p className="text-[10px] text-muted-foreground">{stat.label}</p>
            </motion.div>
          ))}
        </div>

        {/* Creator attribution */}
        <div className="flex items-center gap-2.5 px-3 py-2 border-t border-primary/10">
          <div className="relative h-8 w-8 flex-shrink-0">
            {creatorProfile.profileImage ? (
              <img
                src={creatorProfile.profileImage}
                alt={creatorProfile.name}
                className="h-8 w-8 rounded-full object-cover ring-1 ring-primary/40"
              />
            ) : (
              <div className="h-8 w-8 rounded-full bg-gradient-to-br from-primary/20 to-cyan-500/10 flex items-center justify-center ring-1 ring-primary/25">
                <User className="h-3.5 w-3.5 text-primary/60" />
              </div>
            )}
            <div className="absolute -bottom-0.5 -right-0.5 h-2.5 w-2.5 rounded-full bg-emerald-500 ring-1 ring-card" />
          </div>
          <div className="flex-1 min-w-0">
            <p className="text-xs font-medium text-foreground truncate">{creatorProfile.name}</p>
            <p className="text-[10px] text-muted-foreground font-mono truncate">
              {creatorProfile.researchId} · {creatorProfile.role}
            </p>
          </div>
        </div>
      </motion.div>
    </>
  );

  return (
    <>
      {/* Desktop Navigation */}
      <motion.aside 
        initial={{ x: -280, opacity: 0 }}
        animate={{ x: 0, opacity: 1 }}
        transition={{ duration: 0.5, ease: [0.34, 1.56, 0.64, 1] }}
        className="fixed left-0 top-0 z-40 h-screen w-64 border-r border-primary/20 bg-card/80 backdrop-blur-xl hidden lg:block"
      >
        <NavContent />
      </motion.aside>

      {/* Mobile Navigation */}
      <AnimatePresence>
        {mobileOpen && (
          <motion.aside 
            initial={{ x: -280, opacity: 0 }}
            animate={{ x: 0, opacity: 1 }}
            exit={{ x: -280, opacity: 0 }}
            transition={{ duration: 0.3, ease: "easeOut" }}
            className="fixed left-0 top-0 z-50 h-screen w-64 border-r border-primary/20 bg-card/95 backdrop-blur-xl lg:hidden"
          >
            <NavContent />
          </motion.aside>
        )}
      </AnimatePresence>
    </>
  );
}
