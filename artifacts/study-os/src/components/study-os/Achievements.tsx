
import { useStudyStore } from "@/lib/study-store";
import { Card, CardContent, CardHeader, CardTitle, CardDescription } from "@/components/ui/card";
import { Badge } from "@/components/ui/badge";
import { Progress } from "@/components/ui/progress";
import { motion, AnimatePresence } from "framer-motion";
import {
  Trophy,
  Lock,
  Star,
  Flame,
  Target,
  Clock,
  BookOpen,
  Zap,
  Award,
  Sparkles,
  Crown,
  Medal,
} from "lucide-react";
import { format } from "date-fns";

const categoryIcons: Record<string, typeof Trophy> = {
  streak: Flame,
  time: Clock,
  sessions: Target,
  subjects: BookOpen,
  xp: Zap,
  special: Star,
};

const categoryColors: Record<string, string> = {
  streak: "from-orange-500/20 to-orange-600/10 border-orange-500/30",
  time: "from-blue-500/20 to-blue-600/10 border-blue-500/30",
  sessions: "from-green-500/20 to-green-600/10 border-green-500/30",
  subjects: "from-purple-500/20 to-purple-600/10 border-purple-500/30",
  xp: "from-yellow-500/20 to-yellow-600/10 border-yellow-500/30",
  special: "from-primary/20 to-primary/10 border-primary/30",
};

const rarityColors: Record<string, string> = {
  common: "bg-slate-500/20 text-slate-400 border-slate-500/30",
  rare: "bg-blue-500/20 text-blue-400 border-blue-500/30",
  epic: "bg-purple-500/20 text-purple-400 border-purple-500/30",
  legendary: "bg-yellow-500/20 text-yellow-400 border-yellow-500/30",
};

const rarityGlow: Record<string, string> = {
  common: "",
  rare: "shadow-blue-500/20",
  epic: "shadow-purple-500/30",
  legendary: "shadow-yellow-500/40",
};

const containerVariants = {
  hidden: { opacity: 0 },
  visible: {
    opacity: 1,
    transition: { staggerChildren: 0.05, delayChildren: 0.1 }
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

export function Achievements() {
  const { achievements, stats } = useStudyStore();
  
  const unlockedCount = achievements.filter(a => a.unlockedAt).length;
  const totalCount = achievements.length;
  const completionPercentage = (unlockedCount / totalCount) * 100;

  // Group by category
  const groupedAchievements = achievements.reduce((acc, achievement) => {
    if (!acc[achievement.category]) {
      acc[achievement.category] = [];
    }
    acc[achievement.category].push(achievement);
    return acc;
  }, {} as Record<string, typeof achievements>);

  // Sort each category: unlocked first, then by rarity
  const rarityOrder = { legendary: 0, epic: 1, rare: 2, common: 3 };
  Object.keys(groupedAchievements).forEach((category) => {
    groupedAchievements[category].sort((a, b) => {
      if (a.unlockedAt && !b.unlockedAt) return -1;
      if (!a.unlockedAt && b.unlockedAt) return 1;
      return rarityOrder[a.rarity] - rarityOrder[b.rarity];
    });
  });

  return (
    <motion.div 
      className="space-y-6"
      variants={containerVariants}
      initial="hidden"
      animate="visible"
    >
      {/* Header Stats */}
      <motion.div variants={itemVariants}>
        <Card className="border-primary/20 bg-card/50 backdrop-blur overflow-hidden relative">
          <div className="absolute inset-0 bg-gradient-to-r from-yellow-500/5 via-primary/5 to-purple-500/5" />
          
          {/* Floating particles */}
          <div className="absolute inset-0 overflow-hidden pointer-events-none">
            {[...Array(8)].map((_, i) => (
              <motion.div
                key={i}
                className="absolute"
                initial={{ 
                  x: Math.random() * 100 + "%", 
                  y: Math.random() * 100 + "%",
                  opacity: 0 
                }}
                animate={{ 
                  y: [null, Math.random() * 100 + "%"],
                  opacity: [0, 0.6, 0],
                  scale: [0.5, 1, 0.5]
                }}
                transition={{ 
                  duration: 4 + Math.random() * 3,
                  repeat: Infinity,
                  delay: i * 0.5,
                  ease: "easeInOut"
                }}
              >
                <Star className="w-3 h-3 text-yellow-400/40" />
              </motion.div>
            ))}
          </div>

          <CardHeader className="relative">
            <div className="flex items-center justify-between">
              <div className="flex items-center gap-4">
                <motion.div 
                  className="h-16 w-16 rounded-full bg-gradient-to-br from-yellow-500 to-orange-500 p-0.5"
                  animate={{ 
                    boxShadow: [
                      "0 0 20px rgba(234, 179, 8, 0.3)",
                      "0 0 40px rgba(234, 179, 8, 0.5)",
                      "0 0 20px rgba(234, 179, 8, 0.3)"
                    ]
                  }}
                  transition={{ duration: 2, repeat: Infinity }}
                >
                  <div className="flex h-full w-full items-center justify-center rounded-full bg-card">
                    <motion.div
                      animate={{ rotate: [0, 10, -10, 0], scale: [1, 1.1, 1] }}
                      transition={{ duration: 2, repeat: Infinity, repeatDelay: 3 }}
                    >
                      <Trophy className="h-8 w-8 text-yellow-500" />
                    </motion.div>
                  </div>
                </motion.div>
                <div>
                  <CardTitle className="text-2xl">Achievement Vault</CardTitle>
                  <CardDescription>Your collection of accomplishments</CardDescription>
                </div>
              </div>
              <div className="text-right">
                <motion.div
                  initial={{ scale: 0 }}
                  animate={{ scale: 1 }}
                  transition={{ type: "spring", delay: 0.3 }}
                >
                  <Badge variant="outline" className="text-lg px-4 py-1 border-yellow-500/50 bg-yellow-500/10">
                    <Star className="w-4 h-4 mr-2 text-yellow-500" />
                    <span className="font-mono">{unlockedCount}</span>
                    <span className="text-muted-foreground mx-1">/</span>
                    <span className="font-mono">{totalCount}</span>
                  </Badge>
                </motion.div>
              </div>
            </div>
          </CardHeader>
          <CardContent className="relative">
            <div className="space-y-2">
              <div className="flex justify-between text-sm">
                <span className="text-muted-foreground">Collection Progress</span>
                <motion.span 
                  className="text-primary font-medium font-mono"
                  key={completionPercentage}
                  initial={{ scale: 1.2 }}
                  animate={{ scale: 1 }}
                >
                  {completionPercentage.toFixed(1)}%
                </motion.span>
              </div>
              <div className="relative">
                <Progress value={completionPercentage} className="h-3 progress-glow" />
              </div>
            </div>

            {/* Stats Row */}
            <motion.div 
              className="grid grid-cols-4 gap-4 mt-6"
              variants={containerVariants}
            >
              {[
                { icon: Crown, label: "Legendary", value: achievements.filter(a => a.unlockedAt && a.rarity === "legendary").length, total: achievements.filter(a => a.rarity === "legendary").length, color: "text-yellow-400" },
                { icon: Award, label: "Epic", value: achievements.filter(a => a.unlockedAt && a.rarity === "epic").length, total: achievements.filter(a => a.rarity === "epic").length, color: "text-purple-400" },
                { icon: Medal, label: "Rare", value: achievements.filter(a => a.unlockedAt && a.rarity === "rare").length, total: achievements.filter(a => a.rarity === "rare").length, color: "text-blue-400" },
                { icon: Star, label: "Common", value: achievements.filter(a => a.unlockedAt && a.rarity === "common").length, total: achievements.filter(a => a.rarity === "common").length, color: "text-slate-400" },
              ].map((stat, index) => (
                <motion.div
                  key={stat.label}
                  variants={itemVariants}
                  whileHover={{ scale: 1.05, y: -2 }}
                  className="text-center p-3 rounded-lg bg-muted/30 border border-primary/10"
                >
                  <stat.icon className={`w-5 h-5 mx-auto mb-1 ${stat.color}`} />
                  <p className={`text-lg font-bold font-mono ${stat.color}`}>
                    {stat.value}/{stat.total}
                  </p>
                  <p className="text-xs text-muted-foreground">{stat.label}</p>
                </motion.div>
              ))}
            </motion.div>
          </CardContent>
        </Card>
      </motion.div>

      {/* Achievement Categories */}
      <AnimatePresence>
        {Object.entries(groupedAchievements).map(([category, categoryAchievements], categoryIndex) => {
          const CategoryIcon = categoryIcons[category] || Trophy;
          const unlockedInCategory = categoryAchievements.filter(a => a.unlockedAt).length;
          
          return (
            <motion.div
              key={category}
              variants={itemVariants}
              initial="hidden"
              animate="visible"
              transition={{ delay: categoryIndex * 0.1 }}
            >
              <Card className={`border bg-gradient-to-br ${categoryColors[category]} backdrop-blur overflow-hidden`}>
                <CardHeader>
                  <div className="flex items-center justify-between">
                    <CardTitle className="flex items-center gap-2 capitalize">
                      <motion.div
                        animate={{ rotate: [0, 10, -10, 0] }}
                        transition={{ duration: 2, repeat: Infinity, repeatDelay: 5 }}
                      >
                        <CategoryIcon className="h-5 w-5" />
                      </motion.div>
                      {category} Achievements
                    </CardTitle>
                    <Badge variant="outline" className="font-mono">
                      {unlockedInCategory}/{categoryAchievements.length}
                    </Badge>
                  </div>
                </CardHeader>
                <CardContent>
                  <motion.div 
                    className="grid gap-4 sm:grid-cols-2 lg:grid-cols-3"
                    variants={containerVariants}
                  >
                    {categoryAchievements.map((achievement, index) => {
                      const isUnlocked = !!achievement.unlockedAt;
                      
                      return (
                        <motion.div
                          key={achievement.id}
                          variants={itemVariants}
                          whileHover={{ scale: 1.02, y: -4 }}
                          className={`relative rounded-lg border p-4 transition-all ${
                            isUnlocked
                              ? `bg-card/80 ${rarityGlow[achievement.rarity]} shadow-lg`
                              : "bg-muted/20 opacity-60"
                          }`}
                        >
                          {/* Rarity glow effect for unlocked */}
                          {isUnlocked && achievement.rarity === "legendary" && (
                            <motion.div
                              className="absolute inset-0 rounded-lg"
                              animate={{
                                boxShadow: [
                                  "0 0 20px rgba(234, 179, 8, 0.2)",
                                  "0 0 40px rgba(234, 179, 8, 0.4)",
                                  "0 0 20px rgba(234, 179, 8, 0.2)"
                                ]
                              }}
                              transition={{ duration: 2, repeat: Infinity }}
                            />
                          )}
                          
                          <div className="relative flex items-start gap-3">
                            <motion.div 
                              className={`flex h-12 w-12 items-center justify-center rounded-full text-2xl ${
                                isUnlocked ? "bg-card" : "bg-muted/30"
                              }`}
                              animate={isUnlocked ? { 
                                scale: [1, 1.1, 1],
                              } : {}}
                              transition={{ duration: 3, repeat: Infinity, repeatDelay: 2 }}
                            >
                              {isUnlocked ? (
                                achievement.icon
                              ) : (
                                <Lock className="h-5 w-5 text-muted-foreground" />
                              )}
                            </motion.div>
                            <div className="flex-1 min-w-0">
                              <div className="flex items-center gap-2 flex-wrap">
                                <p className={`font-medium ${isUnlocked ? "text-foreground" : "text-muted-foreground"}`}>
                                  {achievement.name}
                                </p>
                                <Badge
                                  variant="outline"
                                  className={`text-xs ${rarityColors[achievement.rarity]}`}
                                >
                                  {achievement.rarity}
                                </Badge>
                              </div>
                              <p className="text-xs text-muted-foreground mt-1">
                                {achievement.description}
                              </p>
                              {isUnlocked ? (
                                <motion.p 
                                  className="text-xs text-primary mt-2 flex items-center gap-1"
                                  initial={{ opacity: 0 }}
                                  animate={{ opacity: 1 }}
                                >
                                  <Sparkles className="w-3 h-3" />
                                  Unlocked {format(new Date(achievement.unlockedAt!), "MMM d, yyyy")}
                                </motion.p>
                              ) : (
                                <div className="mt-2">
                                  <Progress
                                    value={(achievement.currentProgress / achievement.requirement) * 100}
                                    className="h-1.5"
                                  />
                                  <p className="text-xs text-muted-foreground mt-1 font-mono">
                                    {achievement.currentProgress} / {achievement.requirement}
                                  </p>
                                </div>
                              )}
                              <Badge variant="secondary" className="mt-2 text-xs">
                                <Zap className="w-3 h-3 mr-1" />
                                +{achievement.xpReward} XP
                              </Badge>
                            </div>
                          </div>
                        </motion.div>
                      );
                    })}
                  </motion.div>
                </CardContent>
              </Card>
            </motion.div>
          );
        })}
      </AnimatePresence>
    </motion.div>
  );
}
