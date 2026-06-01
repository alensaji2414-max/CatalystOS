"use client";

import { useStudyStore } from "@/lib/study-store";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { Progress } from "@/components/ui/progress";
import { Button } from "@/components/ui/button";
import { Badge } from "@/components/ui/badge";
import { motion, AnimatePresence } from "framer-motion";
import {
  Timer,
  Target,
  Flame,
  Trophy,
  BookOpen,
  TrendingUp,
  Zap,
  Calendar,
  ChevronRight,
  Sparkles,
  Clock,
  CheckCircle2,
  Atom,
} from "lucide-react";
import { format, isToday, startOfWeek, addDays, isSameDay } from "date-fns";

interface DashboardProps {
  onNavigate: (view: string) => void;
}

const LEVEL_THRESHOLDS = [
  0, 100, 250, 450, 700, 1000, 1400, 1900, 2500, 3200,
  4000, 5000, 6200, 7600, 9200, 11000, 13000, 15500, 18500, 22000,
];

const containerVariants = {
  hidden: { opacity: 0 },
  visible: {
    opacity: 1,
    transition: { staggerChildren: 0.08, delayChildren: 0.1 }
  }
};

const itemVariants = {
  hidden: { opacity: 0, y: 20, scale: 0.95 },
  visible: { 
    opacity: 1, 
    y: 0, 
    scale: 1,
    transition: { type: "spring", stiffness: 300, damping: 24 }
  }
};

export function Dashboard({ onNavigate }: DashboardProps) {
  const { stats, character, subjects, quests, sessions, achievements } = useStudyStore();

  const todaySessions = sessions.filter((s) => isToday(new Date(s.startTime)));
  const todayMinutes = todaySessions.reduce((acc, s) => acc + s.duration, 0);
  const todayHours = Math.floor(todayMinutes / 60);
  const todayMins = todayMinutes % 60;

  const weekStart = startOfWeek(new Date());
  const weekDays = Array.from({ length: 7 }, (_, i) => {
    const day = addDays(weekStart, i);
    const daySessions = sessions.filter((s) => isSameDay(new Date(s.startTime), day));
    const minutes = daySessions.reduce((acc, s) => acc + s.duration, 0);
    return { day, minutes, isToday: isToday(day) };
  });

  const activeQuests = quests.filter((q) => !q.completed).slice(0, 3);
  
  const currentLevelThreshold = LEVEL_THRESHOLDS[stats.level - 1] || 0;
  const nextLevelThreshold = LEVEL_THRESHOLDS[stats.level] || LEVEL_THRESHOLDS[LEVEL_THRESHOLDS.length - 1] + 10000;
  const xpInCurrentLevel = stats.totalXp - currentLevelThreshold;
  const xpNeededForLevel = nextLevelThreshold - currentLevelThreshold;
  const xpProgress = (xpInCurrentLevel / xpNeededForLevel) * 100;

  const dailyGoal = 60;
  const dailyProgress = Math.min((todayMinutes / dailyGoal) * 100, 100);
  const unlockedAchievements = achievements.filter(a => a.unlockedAt).length;

  return (
    <motion.div 
      className="space-y-6"
      variants={containerVariants}
      initial="hidden"
      animate="visible"
    >
      {/* Header Stats */}
      <motion.div 
        className="grid gap-4 sm:grid-cols-2 lg:grid-cols-4"
        variants={containerVariants}
      >
        {[
          { icon: Timer, value: `${todayHours}h ${todayMins}m`, label: "Today's Focus", gradient: "from-primary/20 to-primary/5", iconBg: "bg-primary/20", iconColor: "text-primary", borderColor: "border-primary/30" },
          { icon: Flame, value: stats.currentStreak, label: "Day Streak", gradient: "from-orange-500/20 to-orange-500/5", iconBg: "bg-orange-500/20", iconColor: "text-orange-400", borderColor: "border-orange-500/30", animate: stats.currentStreak > 0 },
          { icon: Zap, value: stats.totalXp.toLocaleString(), label: "Total XP", gradient: "from-yellow-500/20 to-yellow-500/5", iconBg: "bg-yellow-500/20", iconColor: "text-yellow-400", borderColor: "border-yellow-500/30" },
          { icon: Trophy, value: unlockedAchievements, label: "Achievements", gradient: "from-purple-500/20 to-purple-500/5", iconBg: "bg-purple-500/20", iconColor: "text-purple-400", borderColor: "border-purple-500/30" },
        ].map((stat, index) => (
          <motion.div key={stat.label} variants={itemVariants}>
            <Card className={`${stat.borderColor} bg-gradient-to-br ${stat.gradient} backdrop-blur card-hover border`}>
              <CardContent className="flex items-center gap-4 p-4">
                <motion.div 
                  className={`rounded-xl ${stat.iconBg} p-3`}
                  animate={stat.animate ? { 
                    scale: [1, 1.1, 1],
                    rotate: [0, -5, 5, 0]
                  } : {}}
                  transition={{ duration: 0.6, repeat: stat.animate ? Infinity : 0, repeatDelay: 2 }}
                >
                  <stat.icon className={`h-6 w-6 ${stat.iconColor}`} />
                </motion.div>
                <div>
                  <motion.p 
                    className="text-2xl font-bold text-foreground font-mono"
                    initial={{ opacity: 0, scale: 0.5 }}
                    animate={{ opacity: 1, scale: 1 }}
                    transition={{ delay: 0.2 + index * 0.1, type: "spring" }}
                  >
                    {stat.value}
                  </motion.p>
                  <p className="text-sm text-muted-foreground">{stat.label}</p>
                </div>
              </CardContent>
            </Card>
          </motion.div>
        ))}
      </motion.div>

      <div className="grid gap-6 lg:grid-cols-3">
        {/* Left Column */}
        <div className="space-y-6 lg:col-span-2">
          {/* Character Progress */}
          <motion.div variants={itemVariants}>
            <Card className="border-primary/20 bg-card/50 backdrop-blur overflow-hidden relative gradient-border">
              <div className="absolute inset-0 bg-gradient-to-r from-primary/5 via-transparent to-cyan-500/5" />
              
              {/* Floating particles */}
              <div className="absolute inset-0 overflow-hidden pointer-events-none">
                {[...Array(5)].map((_, i) => (
                  <motion.div
                    key={i}
                    className="absolute w-1 h-1 rounded-full bg-primary/40"
                    initial={{ x: Math.random() * 100 + "%", y: "100%" }}
                    animate={{ 
                      y: "-20%",
                      x: `${Math.random() * 100}%`,
                      opacity: [0, 1, 0]
                    }}
                    transition={{ 
                      duration: 4 + Math.random() * 2,
                      repeat: Infinity,
                      delay: i * 0.8,
                      ease: "easeOut"
                    }}
                  />
                ))}
              </div>

              <CardHeader className="relative">
                <div className="flex items-center justify-between">
                  <div className="flex items-center gap-4">
                    <div className="relative">
                      <motion.div 
                        className="h-18 w-18 rounded-full bg-gradient-to-br from-primary to-cyan-500 p-0.5"
                        animate={{ 
                          boxShadow: [
                            "0 0 20px rgba(0, 220, 190, 0.3)",
                            "0 0 40px rgba(0, 220, 190, 0.5)",
                            "0 0 20px rgba(0, 220, 190, 0.3)"
                          ]
                        }}
                        transition={{ duration: 2, repeat: Infinity }}
                      >
                        <div className="flex h-16 w-16 items-center justify-center rounded-full bg-card">
                          <motion.div
                            animate={{ rotate: 360 }}
                            transition={{ duration: 20, repeat: Infinity, ease: "linear" }}
                          >
                            <Atom className="h-8 w-8 text-primary" />
                          </motion.div>
                        </div>
                      </motion.div>
                      <motion.div 
                        className="absolute -bottom-1 -right-1 flex h-7 w-7 items-center justify-center rounded-full bg-primary text-sm font-bold text-primary-foreground"
                        animate={{ scale: [1, 1.1, 1] }}
                        transition={{ duration: 2, repeat: Infinity }}
                      >
                        {stats.level}
                      </motion.div>
                    </div>
                    <div>
                      <h3 className="text-xl font-bold text-foreground neon-text-cyan">{character.title}</h3>
                      <p className="text-muted-foreground">Level {stats.level} Researcher</p>
                    </div>
                  </div>
                  <Badge variant="outline" className="border-primary/50 text-primary">
                    <TrendingUp className="mr-1 h-3 w-3" />
                    +{todaySessions.reduce((acc, s) => acc + s.xpEarned, 0)} XP today
                  </Badge>
                </div>
              </CardHeader>
              <CardContent className="relative">
                <div className="space-y-2">
                  <div className="flex justify-between text-sm">
                    <span className="text-muted-foreground">Progress to Level {stats.level + 1}</span>
                    <span className="text-primary font-medium font-mono">
                      {xpInCurrentLevel.toLocaleString()} / {xpNeededForLevel.toLocaleString()} XP
                    </span>
                  </div>
                  <div className="relative">
                    <Progress value={xpProgress} className="h-3 progress-glow" />
                  </div>
                </div>
              </CardContent>
            </Card>
          </motion.div>

          {/* Weekly Activity */}
          <motion.div variants={itemVariants}>
            <Card className="border-primary/20 bg-card/50 backdrop-blur">
              <CardHeader>
                <CardTitle className="flex items-center gap-2">
                  <Calendar className="h-5 w-5 text-cyan-400" />
                  Weekly Activity
                </CardTitle>
              </CardHeader>
              <CardContent>
                <div className="grid grid-cols-7 gap-2">
                  {weekDays.map(({ day, minutes, isToday: today }, i) => (
                    <motion.div 
                      key={i} 
                      className="text-center"
                      initial={{ opacity: 0, y: 20 }}
                      animate={{ opacity: 1, y: 0 }}
                      transition={{ delay: 0.1 + i * 0.05 }}
                    >
                      <p className="text-xs text-muted-foreground mb-2">
                        {format(day, "EEE")}
                      </p>
                      <motion.div
                        className={`mx-auto h-20 w-full rounded-lg transition-all overflow-hidden relative ${
                          today ? "ring-2 ring-primary ring-offset-2 ring-offset-background" : ""
                        }`}
                        whileHover={{ scale: 1.05 }}
                        style={{
                          background: `linear-gradient(to top, 
                            hsl(var(--primary) / ${Math.min(minutes / 60, 1)}) ${Math.min((minutes / 120) * 100, 100)}%, 
                            hsl(var(--muted)) ${Math.min((minutes / 120) * 100, 100)}%)`,
                        }}
                      >
                        {today && (
                          <motion.div
                            className="absolute inset-0 bg-primary/20"
                            animate={{ opacity: [0.2, 0.4, 0.2] }}
                            transition={{ duration: 2, repeat: Infinity }}
                          />
                        )}
                      </motion.div>
                      <p className="text-xs font-medium text-muted-foreground mt-2 font-mono">
                        {minutes}m
                      </p>
                    </motion.div>
                  ))}
                </div>
              </CardContent>
            </Card>
          </motion.div>

          {/* Active Subjects */}
          <motion.div variants={itemVariants}>
            <Card className="border-primary/20 bg-card/50 backdrop-blur">
              <CardHeader className="flex flex-row items-center justify-between">
                <CardTitle className="flex items-center gap-2">
                  <BookOpen className="h-5 w-5 text-blue-400" />
                  Active Subjects
                </CardTitle>
                <Button
                  variant="ghost"
                  size="sm"
                  onClick={() => onNavigate("subjects")}
                  className="gap-1 group"
                >
                  View All 
                  <motion.div
                    animate={{ x: [0, 4, 0] }}
                    transition={{ duration: 1.5, repeat: Infinity }}
                  >
                    <ChevronRight className="h-4 w-4" />
                  </motion.div>
                </Button>
              </CardHeader>
              <CardContent>
                {subjects.length === 0 ? (
                  <motion.div 
                    className="text-center py-8 text-muted-foreground"
                    initial={{ opacity: 0 }}
                    animate={{ opacity: 1 }}
                  >
                    <BookOpen className="h-12 w-12 mx-auto mb-2 opacity-50" />
                    <p>No subjects yet. Add your first subject to get started!</p>
                    <Button variant="outline" className="mt-4" onClick={() => onNavigate("subjects")}>
                      Add Subject
                    </Button>
                  </motion.div>
                ) : (
                  <div className="grid gap-3 sm:grid-cols-2">
                    <AnimatePresence>
                      {subjects.slice(0, 4).map((subject, index) => (
                        <motion.div
                          key={subject.id}
                          initial={{ opacity: 0, x: -20 }}
                          animate={{ opacity: 1, x: 0 }}
                          transition={{ delay: index * 0.1 }}
                          whileHover={{ scale: 1.02, y: -2 }}
                          className="flex items-center gap-3 rounded-lg border border-primary/10 bg-muted/30 p-3 cursor-pointer"
                        >
                          <motion.div
                            className="h-10 w-10 rounded-lg flex items-center justify-center text-lg"
                            style={{ backgroundColor: `${subject.color}20` }}
                            whileHover={{ rotate: [0, -10, 10, 0] }}
                            transition={{ duration: 0.5 }}
                          >
                            {subject.icon}
                          </motion.div>
                          <div className="flex-1 min-w-0">
                            <p className="font-medium text-foreground truncate">{subject.name}</p>
                            <p className="text-xs text-muted-foreground font-mono">
                              {Math.floor(subject.totalMinutes / 60)}h {subject.totalMinutes % 60}m studied
                            </p>
                          </div>
                        </motion.div>
                      ))}
                    </AnimatePresence>
                  </div>
                )}
              </CardContent>
            </Card>
          </motion.div>
        </div>

        {/* Right Column */}
        <div className="space-y-6">
          {/* Daily Goal */}
          <motion.div variants={itemVariants}>
            <Card className="border-primary/20 bg-card/50 backdrop-blur">
              <CardHeader>
                <CardTitle className="flex items-center gap-2">
                  <Target className="h-5 w-5 text-green-400" />
                  Daily Goal
                </CardTitle>
              </CardHeader>
              <CardContent>
                <div className="relative">
                  <div className="flex items-center justify-center">
                    <svg className="h-32 w-32 -rotate-90">
                      <circle
                        cx="64"
                        cy="64"
                        r="56"
                        fill="none"
                        stroke="hsl(var(--muted))"
                        strokeWidth="10"
                      />
                      <motion.circle
                        cx="64"
                        cy="64"
                        r="56"
                        fill="none"
                        stroke="url(#goalGradient)"
                        strokeWidth="10"
                        strokeLinecap="round"
                        initial={{ strokeDasharray: "0 352" }}
                        animate={{ strokeDasharray: `${dailyProgress * 3.52} 352` }}
                        transition={{ duration: 1.5, ease: "easeOut" }}
                        className="drop-shadow-[0_0_8px_rgba(0,220,190,0.5)]"
                      />
                      <defs>
                        <linearGradient id="goalGradient" x1="0%" y1="0%" x2="100%" y2="0%">
                          <stop offset="0%" stopColor="#00dcbe" />
                          <stop offset="100%" stopColor="#a855f7" />
                        </linearGradient>
                      </defs>
                    </svg>
                    <div className="absolute text-center">
                      <motion.p 
                        className="text-2xl font-bold text-foreground font-mono"
                        key={dailyProgress}
                        initial={{ scale: 0.5 }}
                        animate={{ scale: 1 }}
                        transition={{ type: "spring" }}
                      >
                        {Math.round(dailyProgress)}%
                      </motion.p>
                      <p className="text-xs text-muted-foreground">
                        {todayMinutes}/{dailyGoal}m
                      </p>
                    </div>
                  </div>
                </div>
                <motion.div whileHover={{ scale: 1.02 }} whileTap={{ scale: 0.98 }}>
                  <Button
                    className="w-full mt-4 gap-2 neon-glow-cyan"
                    onClick={() => onNavigate("pomodoro")}
                  >
                    <Timer className="h-4 w-4" />
                    Start Focusing
                  </Button>
                </motion.div>
              </CardContent>
            </Card>
          </motion.div>

          {/* Active Quests */}
          <motion.div variants={itemVariants}>
            <Card className="border-primary/20 bg-card/50 backdrop-blur">
              <CardHeader className="flex flex-row items-center justify-between">
                <CardTitle className="flex items-center gap-2">
                  <Target className="h-5 w-5 text-yellow-400" />
                  Active Quests
                </CardTitle>
                <Button
                  variant="ghost"
                  size="sm"
                  onClick={() => onNavigate("quests")}
                  className="gap-1"
                >
                  View All <ChevronRight className="h-4 w-4" />
                </Button>
              </CardHeader>
              <CardContent className="space-y-3">
                {activeQuests.length === 0 ? (
                  <div className="text-center py-4 text-muted-foreground">
                    <Target className="h-8 w-8 mx-auto mb-2 opacity-50" />
                    <p className="text-sm">No active quests</p>
                  </div>
                ) : (
                  <AnimatePresence>
                    {activeQuests.map((quest, index) => (
                      <motion.div
                        key={quest.id}
                        initial={{ opacity: 0, y: 10 }}
                        animate={{ opacity: 1, y: 0 }}
                        transition={{ delay: index * 0.1 }}
                        whileHover={{ scale: 1.02 }}
                        className="rounded-lg border border-primary/10 bg-muted/30 p-3"
                      >
                        <div className="flex items-start justify-between gap-2">
                          <div className="flex-1 min-w-0">
                            <p className="font-medium text-foreground text-sm truncate">
                              {quest.title}
                            </p>
                            <p className="text-xs text-muted-foreground">
                              +{quest.xpReward} XP
                            </p>
                          </div>
                          <Badge
                            variant="outline"
                            className={
                              quest.type === "daily"
                                ? "border-green-500/50 text-green-400"
                                : quest.type === "weekly"
                                ? "border-blue-500/50 text-blue-400"
                                : "border-purple-500/50 text-purple-400"
                            }
                          >
                            {quest.type}
                          </Badge>
                        </div>
                        <div className="mt-2">
                          <Progress
                            value={(quest.currentProgress / quest.requiredProgress) * 100}
                            className="h-1.5"
                          />
                        </div>
                        <p className="text-xs text-muted-foreground mt-1 font-mono">
                          {quest.currentProgress} / {quest.requiredProgress}
                        </p>
                      </motion.div>
                    ))}
                  </AnimatePresence>
                )}
              </CardContent>
            </Card>
          </motion.div>

          {/* Recent Sessions */}
          <motion.div variants={itemVariants}>
            <Card className="border-primary/20 bg-card/50 backdrop-blur">
              <CardHeader>
                <CardTitle className="flex items-center gap-2">
                  <Clock className="h-5 w-5 text-purple-400" />
                  Recent Sessions
                </CardTitle>
              </CardHeader>
              <CardContent className="space-y-3">
                {sessions.length === 0 ? (
                  <div className="text-center py-4 text-muted-foreground">
                    <Clock className="h-8 w-8 mx-auto mb-2 opacity-50" />
                    <p className="text-sm">No sessions yet</p>
                  </div>
                ) : (
                  <AnimatePresence>
                    {sessions.slice(0, 5).map((session, index) => {
                      const subject = subjects.find((s) => s.id === session.subjectId);
                      return (
                        <motion.div
                          key={session.id}
                          initial={{ opacity: 0, x: -10 }}
                          animate={{ opacity: 1, x: 0 }}
                          transition={{ delay: index * 0.05 }}
                          className="flex items-center gap-3 text-sm"
                        >
                          <motion.div
                            whileHover={{ scale: 1.2, rotate: 360 }}
                            transition={{ duration: 0.3 }}
                          >
                            <CheckCircle2 className="h-4 w-4 text-green-400" />
                          </motion.div>
                          <div className="flex-1 min-w-0">
                            <p className="truncate text-foreground">
                              {subject?.name || "General Study"}
                            </p>
                            <p className="text-xs text-muted-foreground">
                              {format(new Date(session.startTime), "MMM d, h:mm a")}
                            </p>
                          </div>
                          <Badge variant="secondary" className="font-mono">{session.duration}m</Badge>
                        </motion.div>
                      );
                    })}
                  </AnimatePresence>
                )}
              </CardContent>
            </Card>
          </motion.div>
        </div>
      </div>
    </motion.div>
  );
}
