'use client';

import { useState, useEffect } from 'react';
import { motion, AnimatePresence } from 'framer-motion';
import { useStudyStore, Quest } from '@/lib/study-store';
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card';
import { Button } from '@/components/ui/button';
import { Progress } from '@/components/ui/progress';
import { Badge } from '@/components/ui/badge';
import { Tabs, TabsContent, TabsList, TabsTrigger } from '@/components/ui/tabs';
import { 
  Scroll, 
  Clock, 
  Coins, 
  Zap, 
  Star, 
  Trophy,
  Target,
  Flame,
  Swords,
  RefreshCw,
  CheckCircle2,
  Gift,
  TrendingUp,
  Sparkles
} from 'lucide-react';

const RARITY_STYLES: Record<Quest['rarity'], { bg: string; border: string; text: string; glow: string }> = {
  common: { bg: 'bg-slate-500/10', border: 'border-slate-500/30', text: 'text-slate-400', glow: '' },
  uncommon: { bg: 'bg-green-500/10', border: 'border-green-500/30', text: 'text-green-400', glow: 'shadow-[0_0_15px_-3px_rgba(34,197,94,0.4)]' },
  rare: { bg: 'bg-blue-500/10', border: 'border-blue-500/30', text: 'text-blue-400', glow: 'shadow-[0_0_15px_-3px_rgba(59,130,246,0.4)]' },
  epic: { bg: 'bg-purple-500/10', border: 'border-purple-500/30', text: 'text-purple-400', glow: 'shadow-[0_0_20px_-3px_rgba(168,85,247,0.5)]' },
  legendary: { bg: 'bg-orange-500/10', border: 'border-orange-500/30', text: 'text-orange-400', glow: 'shadow-[0_0_25px_-3px_rgba(249,115,22,0.6)]' },
};

const TYPE_ICONS: Record<Quest['type'], React.ReactNode> = {
  daily: <Clock className="w-4 h-4" />,
  weekly: <Star className="w-4 h-4" />,
  'long-term': <Target className="w-4 h-4" />,
  boss: <Swords className="w-4 h-4" />,
  random: <Zap className="w-4 h-4" />,
};

const containerVariants = {
  hidden: { opacity: 0 },
  show: {
    opacity: 1,
    transition: { staggerChildren: 0.08, delayChildren: 0.1 }
  }
};

const itemVariants = {
  hidden: { opacity: 0, y: 20, scale: 0.95 },
  show: { 
    opacity: 1, 
    y: 0, 
    scale: 1,
    transition: { type: "spring", stiffness: 300, damping: 24 }
  }
};

export function QuestSystem() {
  const { 
    quests, 
    subjects,
    generateDailyQuests, 
    generateWeeklyQuests,
    generateBossQuest,
    completeQuest,
    checkAndAutoCompleteQuests,
    getStreakMultiplier,
    getActiveBoosts,
    stats,
    triggerCelebration
  } = useStudyStore();
  
  const [selectedType, setSelectedType] = useState<'all' | Quest['type']>('all');
  const [showCompleted, setShowCompleted] = useState(false);
  const [claimingId, setClaimingId] = useState<string | null>(null);

  const streakMultiplier = getStreakMultiplier();
  const boosts = getActiveBoosts();

  useEffect(() => {
    generateDailyQuests();
    generateWeeklyQuests();
    if (stats.level >= 5) {
      generateBossQuest();
    }
    checkAndAutoCompleteQuests();
  }, [generateDailyQuests, generateWeeklyQuests, generateBossQuest, checkAndAutoCompleteQuests, stats.level]);

  const filteredQuests = quests.filter((quest) => {
    if (!showCompleted && quest.completed) return false;
    if (selectedType !== 'all' && quest.type !== selectedType) return false;
    if (quest.expiresAt && quest.expiresAt < Date.now() && !quest.completed) return false;
    return true;
  });

  const activeQuests = quests.filter((q) => !q.completed && (!q.expiresAt || q.expiresAt > Date.now()));
  const bossQuests = quests.filter((q) => q.type === 'boss' && !q.completed);
  const readyToClaim = activeQuests.filter((q) => q.currentProgress >= q.requiredProgress);

  const getTimeRemaining = (expiresAt?: number) => {
    if (!expiresAt) return null;
    const diff = expiresAt - Date.now();
    if (diff <= 0) return 'Expired';
    
    const hours = Math.floor(diff / (1000 * 60 * 60));
    const minutes = Math.floor((diff % (1000 * 60 * 60)) / (1000 * 60));
    
    if (hours > 24) {
      const days = Math.floor(hours / 24);
      return `${days}d ${hours % 24}h`;
    }
    return `${hours}h ${minutes}m`;
  };

  const handleClaimReward = async (quest: Quest) => {
    setClaimingId(quest.id);
    
    // Small delay for animation
    await new Promise(resolve => setTimeout(resolve, 300));
    
    completeQuest(quest.id);
    
    // Trigger celebration for epic+ quests
    if (quest.rarity === 'epic' || quest.rarity === 'legendary') {
      triggerCelebration({
        type: "quest_complete",
        title: "Quest Complete!",
        subtitle: quest.title,
        icon: quest.type === 'boss' ? "⚔️" : "📜",
        xpGained: quest.xpReward,
        coinsGained: quest.coinReward,
      });
    }
    
    setClaimingId(null);
  };

  const QuestCard = ({ quest, index }: { quest: Quest; index: number }) => {
    const style = RARITY_STYLES[quest.rarity];
    const progress = (quest.currentProgress / quest.requiredProgress) * 100;
    const isComplete = quest.currentProgress >= quest.requiredProgress && !quest.completed;
    const isClaiming = claimingId === quest.id;
    const subject = quest.subjectId ? subjects.find((s) => s.id === quest.subjectId) : null;
    
    const boostedXp = Math.round(quest.xpReward * boosts.xpMultiplier);
    const boostedCoins = Math.round(quest.coinReward * boosts.coinMultiplier);
    
    return (
      <motion.div
        variants={itemVariants}
        layout
        layoutId={quest.id}
      >
        <Card 
          className={`${style.bg} border ${style.border} ${isComplete ? style.glow : ''} transition-all duration-300 overflow-hidden relative group`}
        >
          {/* Shimmer effect on hover */}
          <motion.div
            className="absolute inset-0 bg-gradient-to-r from-transparent via-white/5 to-transparent -translate-x-full group-hover:translate-x-full transition-transform duration-700"
          />
          
          {/* Boss quest animated border */}
          {quest.type === 'boss' && (
            <motion.div
              className="absolute inset-0 border-2 border-orange-500/50 rounded-xl"
              animate={{ 
                boxShadow: ["0 0 0 0 rgba(249,115,22,0)", "0 0 20px 5px rgba(249,115,22,0.3)", "0 0 0 0 rgba(249,115,22,0)"]
              }}
              transition={{ duration: 2, repeat: Infinity }}
            />
          )}
          
          <CardContent className="p-4 relative">
            <div className="flex items-start justify-between mb-3">
              <div className="flex items-start gap-3">
                <motion.div 
                  className={`p-2 rounded-lg ${style.bg} ${quest.type === 'boss' ? '' : ''}`}
                  animate={quest.type === 'boss' ? { scale: [1, 1.1, 1] } : {}}
                  transition={{ duration: 1.5, repeat: Infinity }}
                >
                  {TYPE_ICONS[quest.type]}
                </motion.div>
                <div>
                  <div className="flex items-center gap-2 mb-1 flex-wrap">
                    <h3 className="font-semibold">{quest.title}</h3>
                    <Badge variant="outline" className={`text-xs ${style.text}`}>
                      {quest.rarity}
                    </Badge>
                    {quest.type === 'boss' && (
                      <Badge variant="outline" className="text-xs text-orange-400 border-orange-400/30 bg-orange-400/10">
                        BOSS
                      </Badge>
                    )}
                  </div>
                  <p className="text-sm text-muted-foreground">{quest.description}</p>
                  {subject && (
                    <div className="flex items-center gap-1 mt-1 text-xs text-muted-foreground">
                      <span>{subject.icon}</span>
                      <span>{subject.name}</span>
                    </div>
                  )}
                </div>
              </div>
              {quest.expiresAt && (
                <motion.div 
                  className="flex items-center gap-1 text-xs text-muted-foreground"
                  animate={getTimeRemaining(quest.expiresAt) === 'Expired' ? { opacity: [1, 0.5, 1] } : {}}
                  transition={{ duration: 1, repeat: Infinity }}
                >
                  <Clock className="w-3 h-3" />
                  {getTimeRemaining(quest.expiresAt)}
                </motion.div>
              )}
            </div>

            {/* Progress */}
            <div className="space-y-2 mb-3">
              <div className="flex justify-between text-sm">
                <span className="text-muted-foreground">Progress</span>
                <span className="font-mono">
                  {quest.currentProgress} / {quest.requiredProgress}
                  {quest.targetMinutes ? ' min' : quest.targetSessions ? ' sessions' : ''}
                </span>
              </div>
              <div className="relative">
                <Progress value={progress} className={`h-2 ${isComplete ? 'progress-glow' : ''}`} />
                {isComplete && (
                  <motion.div
                    className="absolute inset-0 bg-gradient-to-r from-primary/30 to-transparent rounded-full"
                    animate={{ opacity: [0.5, 1, 0.5] }}
                    transition={{ duration: 1.5, repeat: Infinity }}
                  />
                )}
              </div>
            </div>

            {/* Rewards */}
            <div className="flex items-center justify-between flex-wrap gap-2">
              <div className="flex items-center gap-3 sm:gap-4 text-sm flex-wrap">
                <motion.div 
                  className="flex items-center gap-1"
                  whileHover={{ scale: 1.05 }}
                >
                  <Zap className="w-4 h-4 text-yellow-500" />
                  <span>{boostedXp} XP</span>
                  {boosts.xpMultiplier > 1 && (
                    <span className="text-xs text-green-400">+{((boosts.xpMultiplier - 1) * 100).toFixed(0)}%</span>
                  )}
                </motion.div>
                <motion.div 
                  className="flex items-center gap-1"
                  whileHover={{ scale: 1.05 }}
                >
                  <Coins className="w-4 h-4 text-yellow-500" />
                  <span>{boostedCoins}</span>
                </motion.div>
                {quest.researchPointReward > 0 && (
                  <motion.div 
                    className="flex items-center gap-1"
                    whileHover={{ scale: 1.05 }}
                  >
                    <Star className="w-4 h-4 text-purple-500" />
                    <span>{quest.researchPointReward} RP</span>
                  </motion.div>
                )}
              </div>
              
              {quest.completed ? (
                <Badge variant="outline" className="bg-green-500/20 text-green-400 border-green-500/30">
                  <CheckCircle2 className="w-3 h-3 mr-1" />
                  Completed
                </Badge>
              ) : isComplete ? (
                <motion.div
                  initial={{ scale: 0 }}
                  animate={{ scale: 1 }}
                  transition={{ type: "spring", stiffness: 400, damping: 15 }}
                >
                  <Button
                    size="sm"
                    className="relative overflow-hidden group"
                    onClick={() => handleClaimReward(quest)}
                    disabled={isClaiming}
                  >
                    <motion.div
                      className="absolute inset-0 bg-gradient-to-r from-primary via-cyan-400 to-primary bg-[length:200%_100%]"
                      animate={{ backgroundPosition: ["0% 0%", "200% 0%"] }}
                      transition={{ duration: 2, repeat: Infinity }}
                    />
                    <span className="relative flex items-center gap-1">
                      {isClaiming ? (
                        <motion.div
                          animate={{ rotate: 360 }}
                          transition={{ duration: 1, repeat: Infinity, ease: "linear" }}
                        >
                          <Sparkles className="w-4 h-4" />
                        </motion.div>
                      ) : (
                        <Gift className="w-4 h-4" />
                      )}
                      {isClaiming ? 'Claiming...' : 'Claim Reward'}
                    </span>
                  </Button>
                </motion.div>
              ) : null}
            </div>
          </CardContent>
        </Card>
      </motion.div>
    );
  };

  return (
    <motion.div 
      className="space-y-6"
      initial={{ opacity: 0 }}
      animate={{ opacity: 1 }}
      transition={{ duration: 0.5 }}
    >
      {/* Header */}
      <motion.div 
        className="flex flex-col sm:flex-row sm:items-center justify-between gap-4"
        initial={{ opacity: 0, y: -20 }}
        animate={{ opacity: 1, y: 0 }}
        transition={{ delay: 0.1 }}
      >
        <div>
          <h2 className="text-2xl font-bold flex items-center gap-2">
            <motion.div
              animate={{ rotate: [0, -10, 10, 0] }}
              transition={{ duration: 2, repeat: Infinity, repeatDelay: 3 }}
            >
              <Scroll className="w-6 h-6" />
            </motion.div>
            Quest Board
          </h2>
          <p className="text-muted-foreground">
            Complete quests to earn rewards and level up
          </p>
        </div>
        <div className="flex gap-2">
          <Button 
            variant="outline" 
            size="sm"
            onClick={() => setShowCompleted(!showCompleted)}
          >
            {showCompleted ? 'Hide Completed' : 'Show Completed'}
          </Button>
          <Button 
            variant="outline" 
            size="sm"
            onClick={() => {
              generateDailyQuests();
              generateWeeklyQuests();
              if (stats.level >= 5) generateBossQuest();
            }}
          >
            <motion.div
              whileHover={{ rotate: 180 }}
              transition={{ duration: 0.3 }}
            >
              <RefreshCw className="w-4 h-4 mr-2" />
            </motion.div>
            Refresh
          </Button>
        </div>
      </motion.div>

      {/* Stats Overview */}
      <motion.div 
        className="grid grid-cols-2 sm:grid-cols-3 lg:grid-cols-5 gap-3 sm:gap-4"
        variants={containerVariants}
        initial="hidden"
        animate="show"
      >
        {[
          { value: activeQuests.length, label: "Active Quests", color: "text-cyan-400", icon: <Target className="w-5 h-5" /> },
          { value: stats.totalQuestsCompleted, label: "Total Completed", color: "text-green-400", icon: <CheckCircle2 className="w-5 h-5" /> },
          { value: stats.currentStreak, label: "Day Streak", color: "text-orange-400", icon: <Flame className="w-5 h-5" /> },
          { value: `${streakMultiplier.toFixed(2)}x`, label: "Streak Bonus", color: "text-green-400", icon: <TrendingUp className="w-5 h-5" /> },
          { value: readyToClaim.length, label: "Ready to Claim", color: "text-yellow-400", icon: <Gift className="w-5 h-5" /> },
        ].map((stat, index) => (
          <motion.div key={stat.label} variants={itemVariants}>
            <Card className="hover:border-primary/30 transition-colors">
              <CardContent className="p-3 sm:p-4 text-center">
                <motion.div 
                  className={`flex items-center justify-center gap-1 ${stat.color}`}
                  whileHover={{ scale: 1.1 }}
                >
                  {stat.icon}
                  <span className="text-xl sm:text-2xl font-bold">{stat.value}</span>
                </motion.div>
                <p className="text-[10px] sm:text-xs text-muted-foreground mt-1">{stat.label}</p>
              </CardContent>
            </Card>
          </motion.div>
        ))}
      </motion.div>

      {/* Streak Bonus Card */}
      <AnimatePresence>
        {stats.currentStreak > 0 && (
          <motion.div
            initial={{ opacity: 0, height: 0 }}
            animate={{ opacity: 1, height: "auto" }}
            exit={{ opacity: 0, height: 0 }}
          >
            <Card className="bg-gradient-to-r from-orange-500/10 to-yellow-500/10 border-orange-500/30 overflow-hidden">
              <CardContent className="p-4">
                <div className="flex flex-col sm:flex-row items-start sm:items-center justify-between gap-3">
                  <div className="flex items-center gap-3">
                    <motion.div 
                      className="p-2 bg-orange-500/20 rounded-lg"
                      animate={{ scale: [1, 1.1, 1] }}
                      transition={{ duration: 1.5, repeat: Infinity }}
                    >
                      <Flame className="w-6 h-6 text-orange-400" />
                    </motion.div>
                    <div>
                      <h3 className="font-semibold text-orange-300">Streak Bonus Active!</h3>
                      <p className="text-sm text-muted-foreground">
                        {stats.currentStreak} day streak = {((streakMultiplier - 1) * 100).toFixed(0)}% bonus XP
                      </p>
                    </div>
                  </div>
                  <div className="text-right">
                    <motion.div 
                      className="text-2xl font-bold text-orange-400"
                      animate={{ scale: [1, 1.05, 1] }}
                      transition={{ duration: 2, repeat: Infinity }}
                    >
                      {streakMultiplier.toFixed(2)}x
                    </motion.div>
                    <p className="text-xs text-muted-foreground">
                      Next: {stats.currentStreak < 7 ? '7' : stats.currentStreak < 14 ? '14' : stats.currentStreak < 30 ? '30' : '100'} days
                    </p>
                  </div>
                </div>
              </CardContent>
            </Card>
          </motion.div>
        )}
      </AnimatePresence>

      {/* Quest Type Tabs */}
      <Tabs value={selectedType} onValueChange={(v) => setSelectedType(v as typeof selectedType)}>
        <TabsList className="grid grid-cols-3 sm:grid-cols-6 w-full h-auto">
          <TabsTrigger value="all" className="text-xs sm:text-sm">All</TabsTrigger>
          <TabsTrigger value="daily" className="flex items-center gap-1 text-xs sm:text-sm">
            <Clock className="w-3 h-3" />
            <span className="hidden sm:inline">Daily</span>
          </TabsTrigger>
          <TabsTrigger value="weekly" className="flex items-center gap-1 text-xs sm:text-sm">
            <Star className="w-3 h-3" />
            <span className="hidden sm:inline">Weekly</span>
          </TabsTrigger>
          <TabsTrigger value="long-term" className="flex items-center gap-1 text-xs sm:text-sm">
            <Target className="w-3 h-3" />
            <span className="hidden sm:inline">Long</span>
          </TabsTrigger>
          <TabsTrigger value="boss" className="flex items-center gap-1 text-xs sm:text-sm">
            <Swords className="w-3 h-3" />
            <span className="hidden sm:inline">Boss</span>
            {bossQuests.length > 0 && (
              <Badge variant="outline" className="ml-1 text-xs px-1 hidden sm:inline-flex">{bossQuests.length}</Badge>
            )}
          </TabsTrigger>
          <TabsTrigger value="random" className="flex items-center gap-1 text-xs sm:text-sm">
            <Zap className="w-3 h-3" />
            <span className="hidden sm:inline">Random</span>
          </TabsTrigger>
        </TabsList>

        <TabsContent value={selectedType} className="mt-6">
          {filteredQuests.length > 0 ? (
            <motion.div 
              className="grid grid-cols-1 lg:grid-cols-2 gap-4"
              variants={containerVariants}
              initial="hidden"
              animate="show"
              key={selectedType + showCompleted}
            >
              {filteredQuests.map((quest, index) => (
                <QuestCard key={quest.id} quest={quest} index={index} />
              ))}
            </motion.div>
          ) : (
            <motion.div
              initial={{ opacity: 0, scale: 0.95 }}
              animate={{ opacity: 1, scale: 1 }}
            >
              <Card className="border-dashed">
                <CardContent className="flex flex-col items-center justify-center py-12">
                  <motion.div
                    animate={{ y: [0, -10, 0] }}
                    transition={{ duration: 2, repeat: Infinity }}
                  >
                    <Scroll className="w-12 h-12 text-muted-foreground mb-4" />
                  </motion.div>
                  <h3 className="text-lg font-semibold mb-2">No quests available</h3>
                  <p className="text-muted-foreground text-center">
                    {selectedType === 'boss' && stats.level < 5
                      ? 'Reach level 5 to unlock Boss Quests!'
                      : showCompleted 
                        ? 'No completed quests in this category'
                        : 'Complete some study sessions to progress your quests!'}
                  </p>
                </CardContent>
              </Card>
            </motion.div>
          )}
        </TabsContent>
      </Tabs>

      {/* Boss Battle Section */}
      {stats.level >= 5 && (
        <motion.div
          initial={{ opacity: 0, y: 20 }}
          animate={{ opacity: 1, y: 0 }}
          transition={{ delay: 0.3 }}
        >
          <Card className="overflow-hidden border-orange-500/20">
            <CardHeader className="bg-gradient-to-r from-orange-500/10 to-red-500/10">
              <CardTitle className="flex items-center gap-2">
                <motion.div
                  animate={{ rotate: [0, -15, 15, 0] }}
                  transition={{ duration: 2, repeat: Infinity }}
                >
                  <Swords className="w-5 h-5 text-orange-400" />
                </motion.div>
                Active Boss Battles
                <Badge variant="outline" className="ml-2 text-xs">Unlocked at Lv. 5</Badge>
              </CardTitle>
            </CardHeader>
            <CardContent className="p-4">
              {bossQuests.length > 0 ? (
                <motion.div 
                  className="grid grid-cols-1 md:grid-cols-2 gap-4"
                  variants={containerVariants}
                  initial="hidden"
                  animate="show"
                >
                  {bossQuests.map((boss, index) => (
                    <QuestCard key={boss.id} quest={boss} index={index} />
                  ))}
                </motion.div>
              ) : (
                <div className="text-center py-8">
                  <Trophy className="w-12 h-12 mx-auto text-muted-foreground mb-4" />
                  <p className="text-muted-foreground">No active boss battles. Click Refresh to generate one!</p>
                </div>
              )}
            </CardContent>
          </Card>
        </motion.div>
      )}

      {/* Boss Battle Teaser */}
      {stats.level < 5 && (
        <motion.div
          initial={{ opacity: 0 }}
          animate={{ opacity: 0.6 }}
          transition={{ delay: 0.4 }}
        >
          <Card className="overflow-hidden">
            <CardHeader>
              <CardTitle className="flex items-center gap-2">
                <Swords className="w-5 h-5 text-muted-foreground" />
                Boss Battles
                <Badge variant="outline" className="ml-2 text-xs">Locked - Reach Lv. 5</Badge>
              </CardTitle>
            </CardHeader>
            <CardContent>
              <div className="text-center py-8">
                <Trophy className="w-12 h-12 mx-auto text-muted-foreground mb-4" />
                <p className="text-muted-foreground">
                  Reach level 5 to unlock epic Boss Battles with legendary rewards!
                </p>
                <p className="text-sm text-muted-foreground mt-2">
                  Current Level: {stats.level} / 5
                </p>
                <Progress value={(stats.level / 5) * 100} className="mt-3 max-w-xs mx-auto" />
              </div>
            </CardContent>
          </Card>
        </motion.div>
      )}
    </motion.div>
  );
}
