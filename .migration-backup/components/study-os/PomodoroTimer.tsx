'use client';

import { useState, useEffect, useCallback, useRef } from 'react';
import { useStudyStore } from '@/lib/study-store';
import { Button } from '@/components/ui/button';
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card';
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from '@/components/ui/select';
import { Slider } from '@/components/ui/slider';
import { Switch } from '@/components/ui/switch';
import { Label } from '@/components/ui/label';
import { Badge } from '@/components/ui/badge';
import { Progress } from '@/components/ui/progress';
import { motion, AnimatePresence } from 'framer-motion';
import { Play, Pause, RotateCcw, Coffee, Zap, Settings, Volume2, VolumeX, Flame, TrendingUp, AlertTriangle, Shield, Target, Sparkles } from 'lucide-react';

type TimerMode = 'work' | 'short-break' | 'long-break';

const containerVariants = {
  hidden: { opacity: 0 },
  visible: {
    opacity: 1,
    transition: { staggerChildren: 0.1, delayChildren: 0.1 }
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

export function PomodoroTimer() {
  const { 
    pomodoroSettings, 
    updatePomodoroSettings, 
    subjects,
    addSession,
    addXp,
    recordDailyActivity,
    quests,
    updateQuestProgress,
    checkAchievements,
    getActiveBoosts,
    getStreakMultiplier,
    stats,
    initializeDay
  } = useStudyStore();
  
  const [mode, setMode] = useState<TimerMode>('work');
  const [timeLeft, setTimeLeft] = useState(pomodoroSettings.workDuration * 60);
  const [isRunning, setIsRunning] = useState(false);
  const [sessionsCompleted, setSessionsCompleted] = useState(0);
  const [selectedSubject, setSelectedSubject] = useState(subjects[0]?.id || '');
  const [showSettings, setShowSettings] = useState(false);
  const [totalWorkTime, setTotalWorkTime] = useState(0);
  
  // Anti-idle detection
  const [idleWarning, setIdleWarning] = useState(false);
  const [focusScore, setFocusScore] = useState(100);
  const lastActivityRef = useRef<number>(Date.now());
  const idleCheckRef = useRef<NodeJS.Timeout | null>(null);
  const pauseCountRef = useRef(0);
  
  const startTimeRef = useRef<number | null>(null);
  const intervalRef = useRef<NodeJS.Timeout | null>(null);

  // Get current boosts
  const boosts = getActiveBoosts();
  const streakMultiplier = getStreakMultiplier();

  // Initialize day on mount
  useEffect(() => {
    initializeDay();
  }, [initializeDay]);

  // Anti-idle detection - track user activity
  useEffect(() => {
    const handleActivity = () => {
      lastActivityRef.current = Date.now();
      setIdleWarning(false);
    };

    if (isRunning && mode === 'work') {
      window.addEventListener('mousemove', handleActivity);
      window.addEventListener('keydown', handleActivity);
      window.addEventListener('click', handleActivity);
      window.addEventListener('scroll', handleActivity);

      // Check for idle every 30 seconds
      idleCheckRef.current = setInterval(() => {
        const idleTime = Date.now() - lastActivityRef.current;
        // If idle for more than 2 minutes during focus, warn and reduce focus score
        if (idleTime > 120000) {
          setIdleWarning(true);
          setFocusScore((prev) => Math.max(50, prev - 5));
        }
      }, 30000);

      return () => {
        window.removeEventListener('mousemove', handleActivity);
        window.removeEventListener('keydown', handleActivity);
        window.removeEventListener('click', handleActivity);
        window.removeEventListener('scroll', handleActivity);
        if (idleCheckRef.current) {
          clearInterval(idleCheckRef.current);
        }
      };
    }
  }, [isRunning, mode]);

  const getDuration = useCallback((m: TimerMode) => {
    switch (m) {
      case 'work': return pomodoroSettings.workDuration * 60;
      case 'short-break': return pomodoroSettings.shortBreakDuration * 60;
      case 'long-break': return pomodoroSettings.longBreakDuration * 60;
    }
  }, [pomodoroSettings]);

  const formatTime = (seconds: number) => {
    const mins = Math.floor(seconds / 60);
    const secs = seconds % 60;
    return `${mins.toString().padStart(2, '0')}:${secs.toString().padStart(2, '0')}`;
  };

  // Enhanced XP calculation with all boosts
  const calculateXp = useCallback((minutes: number, currentFocusScore: number) => {
    // Base XP: 2 per minute
    let xp = minutes * 2;
    
    // Focus score bonus (up to 50% extra based on focus)
    const focusBonus = xp * (currentFocusScore / 200);
    xp += focusBonus;
    
    // Subject difficulty bonus
    const subject = subjects.find(s => s.id === selectedSubject);
    if (subject) {
      const difficultyBonus = xp * (subject.difficulty * 0.05);
      xp += difficultyBonus;
    }
    
    // Pause penalty (each pause reduces XP by 5%)
    const pausePenalty = Math.min(pauseCountRef.current * 0.05, 0.3);
    xp *= (1 - pausePenalty);
    
    // Note: streak and skill boosts are applied in addXp
    return Math.round(xp);
  }, [subjects, selectedSubject]);

  // Calculate preview XP (what user will earn)
  const getPreviewXp = () => {
    const baseXp = calculateXp(pomodoroSettings.workDuration, focusScore);
    return Math.round(baseXp * boosts.xpMultiplier);
  };

  const completeSession = useCallback(() => {
    if (mode === 'work' && startTimeRef.current) {
      const duration = pomodoroSettings.workDuration;
      const xpEarned = calculateXp(duration, focusScore);

      // Add session with streak multiplier tracked
      addSession({
        subjectId: selectedSubject,
        startTime: startTimeRef.current,
        endTime: Date.now(),
        duration,
        type: 'pomodoro',
        xpEarned,
        focusScore,
      });

      // Add XP (boosts applied inside)
      addXp(xpEarned);

      // Record daily activity
      recordDailyActivity(duration, selectedSubject, xpEarned);

      // Update quests
      quests.forEach((quest) => {
        if (quest.completed) return;
        if (quest.targetMinutes) {
          updateQuestProgress(quest.id, quest.currentProgress + duration);
        }
        if (quest.targetSessions) {
          updateQuestProgress(quest.id, quest.currentProgress + 1);
        }
      });

      // Check achievements
      checkAchievements();

      setSessionsCompleted((prev) => prev + 1);
      setTotalWorkTime((prev) => prev + duration);
      
      // Reset focus score and pause count for next session
      setFocusScore(100);
      pauseCountRef.current = 0;
    }

    // Play sound
    if (pomodoroSettings.soundEnabled) {
      playNotificationSound();
    }

    // Determine next mode
    if (mode === 'work') {
      const nextSessions = sessionsCompleted + 1;
      if (nextSessions % pomodoroSettings.sessionsBeforeLongBreak === 0) {
        setMode('long-break');
        setTimeLeft(getDuration('long-break'));
      } else {
        setMode('short-break');
        setTimeLeft(getDuration('short-break'));
      }
      if (pomodoroSettings.autoStartBreaks) {
        startTimeRef.current = Date.now();
        setIsRunning(true);
      } else {
        setIsRunning(false);
      }
    } else {
      setMode('work');
      setTimeLeft(getDuration('work'));
      if (pomodoroSettings.autoStartWork) {
        startTimeRef.current = Date.now();
        setIsRunning(true);
      } else {
        setIsRunning(false);
      }
    }
  }, [mode, sessionsCompleted, pomodoroSettings, selectedSubject, focusScore, addSession, addXp, recordDailyActivity, quests, updateQuestProgress, checkAchievements, getDuration, calculateXp]);

  const playNotificationSound = () => {
    try {
      const audioContext = new (window.AudioContext || (window as unknown as { webkitAudioContext: typeof AudioContext }).webkitAudioContext)();
      const oscillator = audioContext.createOscillator();
      const gainNode = audioContext.createGain();

      oscillator.connect(gainNode);
      gainNode.connect(audioContext.destination);

      oscillator.frequency.value = 800;
      oscillator.type = 'sine';
      
      gainNode.gain.setValueAtTime(0.3, audioContext.currentTime);
      gainNode.gain.exponentialRampToValueAtTime(0.01, audioContext.currentTime + 0.5);

      oscillator.start(audioContext.currentTime);
      oscillator.stop(audioContext.currentTime + 0.5);
    } catch {
      // Audio not supported
    }
  };

  useEffect(() => {
    if (isRunning) {
      intervalRef.current = setInterval(() => {
        setTimeLeft((prev) => {
          if (prev <= 1) {
            completeSession();
            return 0;
          }
          return prev - 1;
        });
      }, 1000);
    } else {
      if (intervalRef.current) {
        clearInterval(intervalRef.current);
      }
    }

    return () => {
      if (intervalRef.current) {
        clearInterval(intervalRef.current);
      }
    };
  }, [isRunning, completeSession]);

  const handleStart = () => {
    if (!isRunning) {
      startTimeRef.current = Date.now();
      lastActivityRef.current = Date.now();
      setIdleWarning(false);
    }
    setIsRunning(true);
  };

  const handlePause = () => {
    setIsRunning(false);
    // Track pauses for focus penalty
    if (mode === 'work') {
      pauseCountRef.current += 1;
      // Reduce focus score slightly on pause
      setFocusScore((prev) => Math.max(60, prev - 3));
    }
  };

  const handleReset = () => {
    setIsRunning(false);
    setTimeLeft(getDuration(mode));
    startTimeRef.current = null;
    setFocusScore(100);
    pauseCountRef.current = 0;
    setIdleWarning(false);
  };

  const handleModeChange = (newMode: TimerMode) => {
    setMode(newMode);
    setTimeLeft(getDuration(newMode));
    setIsRunning(false);
    startTimeRef.current = null;
    setFocusScore(100);
    pauseCountRef.current = 0;
    setIdleWarning(false);
  };

  const progress = ((getDuration(mode) - timeLeft) / getDuration(mode)) * 100;
  const circumference = 2 * Math.PI * 120;
  const strokeDashoffset = circumference - (progress / 100) * circumference;

  // Dynamic color based on focus score
  const getFocusColor = () => {
    if (focusScore >= 90) return 'text-green-400';
    if (focusScore >= 70) return 'text-yellow-400';
    return 'text-orange-400';
  };

  const getModeColor = () => {
    switch (mode) {
      case 'work': return { primary: '#00dcbe', secondary: '#0ea5e9' };
      case 'short-break': return { primary: '#22c55e', secondary: '#10b981' };
      case 'long-break': return { primary: '#a855f7', secondary: '#8b5cf6' };
    }
  };

  const modeColors = getModeColor();

  return (
    <motion.div 
      className="space-y-6"
      variants={containerVariants}
      initial="hidden"
      animate="visible"
    >
      {/* Active Boosts Display */}
      <AnimatePresence>
        {(boosts.xpMultiplier > 1 || stats.currentStreak > 0) && (
          <motion.div
            initial={{ opacity: 0, y: -20, scale: 0.95 }}
            animate={{ opacity: 1, y: 0, scale: 1 }}
            exit={{ opacity: 0, y: -20, scale: 0.95 }}
            transition={{ type: "spring", stiffness: 300, damping: 24 }}
          >
            <Card className="bg-gradient-to-r from-primary/10 via-purple-500/10 to-cyan-500/10 border-primary/30 overflow-hidden relative">
              {/* Animated background particles */}
              <div className="absolute inset-0 overflow-hidden pointer-events-none">
                {[...Array(6)].map((_, i) => (
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
                      duration: 3 + Math.random() * 2,
                      repeat: Infinity,
                      delay: i * 0.5,
                      ease: "easeOut"
                    }}
                  />
                ))}
              </div>
              
              <CardContent className="p-4 relative">
                <div className="flex items-center justify-between flex-wrap gap-4">
                  <div className="flex items-center gap-4">
                    <motion.div 
                      className="flex items-center gap-2"
                      animate={{ scale: [1, 1.05, 1] }}
                      transition={{ duration: 2, repeat: Infinity }}
                    >
                      <TrendingUp className="w-5 h-5 text-primary" />
                      <span className="text-sm font-medium">Active Boosts</span>
                    </motion.div>
                    <div className="flex gap-2">
                      {stats.currentStreak > 0 && (
                        <motion.div
                          initial={{ scale: 0 }}
                          animate={{ scale: 1 }}
                          transition={{ type: "spring", delay: 0.2 }}
                        >
                          <Badge variant="outline" className="bg-orange-500/20 text-orange-400 border-orange-500/30">
                            <motion.div
                              animate={{ rotate: [0, -10, 10, 0] }}
                              transition={{ duration: 0.5, repeat: Infinity, repeatDelay: 2 }}
                            >
                              <Flame className="w-3 h-3 mr-1" />
                            </motion.div>
                            {stats.currentStreak} day streak ({((streakMultiplier - 1) * 100).toFixed(0)}% XP)
                          </Badge>
                        </motion.div>
                      )}
                      {boosts.xpMultiplier > streakMultiplier && (
                        <motion.div
                          initial={{ scale: 0 }}
                          animate={{ scale: 1 }}
                          transition={{ type: "spring", delay: 0.3 }}
                        >
                          <Badge variant="outline" className="bg-purple-500/20 text-purple-400 border-purple-500/30">
                            <Target className="w-3 h-3 mr-1" />
                            Skill Boost Active
                          </Badge>
                        </motion.div>
                      )}
                    </div>
                  </div>
                  <motion.div 
                    className="text-right"
                    animate={{ scale: [1, 1.02, 1] }}
                    transition={{ duration: 1.5, repeat: Infinity }}
                  >
                    <span className="text-2xl font-bold text-primary font-mono">{boosts.xpMultiplier.toFixed(2)}x</span>
                    <p className="text-xs text-muted-foreground">Total XP Multiplier</p>
                  </motion.div>
                </div>
              </CardContent>
            </Card>
          </motion.div>
        )}
      </AnimatePresence>

      {/* Idle Warning */}
      <AnimatePresence>
        {idleWarning && (
          <motion.div
            initial={{ opacity: 0, y: -20, scale: 0.95 }}
            animate={{ opacity: 1, y: 0, scale: 1 }}
            exit={{ opacity: 0, y: -20, scale: 0.95 }}
            transition={{ type: "spring" }}
          >
            <Card className="bg-yellow-500/10 border-yellow-500/30">
              <CardContent className="p-4">
                <div className="flex items-center gap-3">
                  <motion.div
                    animate={{ rotate: [0, 10, -10, 0], scale: [1, 1.1, 1] }}
                    transition={{ duration: 0.5, repeat: Infinity }}
                  >
                    <AlertTriangle className="w-5 h-5 text-yellow-500" />
                  </motion.div>
                  <div>
                    <p className="font-medium text-yellow-400">Are you still focusing?</p>
                    <p className="text-sm text-muted-foreground">
                      No activity detected. Move your mouse or type to dismiss this warning.
                    </p>
                  </div>
                </div>
              </CardContent>
            </Card>
          </motion.div>
        )}
      </AnimatePresence>

      {/* Timer Display */}
      <motion.div variants={itemVariants}>
        <Card className="gradient-border overflow-hidden relative">
          {/* Animated background gradient */}
          <motion.div
            className="absolute inset-0 opacity-30"
            animate={{
              background: isRunning
                ? [
                    `radial-gradient(circle at 30% 30%, ${modeColors.primary}20, transparent 60%)`,
                    `radial-gradient(circle at 70% 70%, ${modeColors.secondary}20, transparent 60%)`,
                    `radial-gradient(circle at 30% 30%, ${modeColors.primary}20, transparent 60%)`,
                  ]
                : `radial-gradient(circle at 50% 50%, ${modeColors.primary}10, transparent 70%)`,
            }}
            transition={{ duration: 4, repeat: Infinity, ease: "easeInOut" }}
          />
          
          <CardContent className="p-8 relative">
            <div className="flex flex-col items-center">
              {/* Mode Tabs */}
              <motion.div 
                className="flex gap-2 mb-8"
                initial={{ opacity: 0, y: -20 }}
                animate={{ opacity: 1, y: 0 }}
                transition={{ delay: 0.2 }}
              >
                {[
                  { id: 'work' as TimerMode, label: 'Focus', icon: Zap, glow: 'neon-glow-cyan' },
                  { id: 'short-break' as TimerMode, label: 'Short Break', icon: Coffee, glow: 'neon-glow-green' },
                  { id: 'long-break' as TimerMode, label: 'Long Break', icon: Coffee, glow: 'neon-glow-purple' },
                ].map((tab) => (
                  <motion.div
                    key={tab.id}
                    whileHover={{ scale: 1.05 }}
                    whileTap={{ scale: 0.95 }}
                  >
                    <Button
                      variant={mode === tab.id ? 'default' : 'outline'}
                      onClick={() => handleModeChange(tab.id)}
                      className={mode === tab.id ? tab.glow : ''}
                    >
                      <tab.icon className="w-4 h-4 mr-2" />
                      {tab.label}
                    </Button>
                  </motion.div>
                ))}
              </motion.div>

              {/* Circular Timer */}
              <div className="relative w-72 h-72 mb-8">
                {/* Outer glow ring */}
                <motion.div
                  className="absolute inset-0 rounded-full"
                  animate={isRunning ? {
                    boxShadow: [
                      `0 0 30px ${modeColors.primary}40`,
                      `0 0 60px ${modeColors.primary}60`,
                      `0 0 30px ${modeColors.primary}40`,
                    ]
                  } : {}}
                  transition={{ duration: 2, repeat: Infinity }}
                />
                
                {/* Orbiting particles when running */}
                <AnimatePresence>
                  {isRunning && [...Array(3)].map((_, i) => (
                    <motion.div
                      key={i}
                      className="absolute w-2 h-2 rounded-full"
                      style={{ 
                        background: i === 0 ? modeColors.primary : i === 1 ? modeColors.secondary : '#fff',
                        top: '50%',
                        left: '50%',
                      }}
                      initial={{ opacity: 0 }}
                      animate={{
                        opacity: [0.4, 0.8, 0.4],
                        x: [
                          Math.cos((i * 2 * Math.PI) / 3) * 140,
                          Math.cos((i * 2 * Math.PI) / 3 + Math.PI) * 140,
                          Math.cos((i * 2 * Math.PI) / 3 + 2 * Math.PI) * 140,
                        ],
                        y: [
                          Math.sin((i * 2 * Math.PI) / 3) * 140,
                          Math.sin((i * 2 * Math.PI) / 3 + Math.PI) * 140,
                          Math.sin((i * 2 * Math.PI) / 3 + 2 * Math.PI) * 140,
                        ],
                      }}
                      exit={{ opacity: 0 }}
                      transition={{
                        duration: 6 + i * 2,
                        repeat: Infinity,
                        ease: "linear",
                      }}
                    />
                  ))}
                </AnimatePresence>
                
                <svg className="w-full h-full transform -rotate-90">
                  {/* Background circle */}
                  <circle
                    cx="144"
                    cy="144"
                    r="120"
                    fill="none"
                    stroke="currentColor"
                    strokeWidth="10"
                    className="text-muted/20"
                  />
                  {/* Progress circle */}
                  <motion.circle
                    cx="144"
                    cy="144"
                    r="120"
                    fill="none"
                    stroke="url(#timerGradient)"
                    strokeWidth="10"
                    strokeLinecap="round"
                    initial={{ strokeDasharray: `0 ${circumference}` }}
                    animate={{ 
                      strokeDasharray: circumference,
                      strokeDashoffset: strokeDashoffset
                    }}
                    transition={{ duration: 0.5, ease: "easeOut" }}
                    className="drop-shadow-[0_0_10px_rgba(0,220,190,0.5)]"
                  />
                  <defs>
                    <linearGradient id="timerGradient" x1="0%" y1="0%" x2="100%" y2="100%">
                      <stop offset="0%" stopColor={modeColors.primary} />
                      <stop offset="50%" stopColor="#a855f7" />
                      <stop offset="100%" stopColor={modeColors.secondary} />
                    </linearGradient>
                  </defs>
                </svg>
                
                <div className="absolute inset-0 flex flex-col items-center justify-center">
                  <motion.span 
                    className="text-6xl font-mono font-bold"
                    animate={isRunning ? { 
                      textShadow: [
                        `0 0 20px ${modeColors.primary}`,
                        `0 0 40px ${modeColors.primary}`,
                        `0 0 20px ${modeColors.primary}`,
                      ]
                    } : {}}
                    transition={{ duration: 2, repeat: Infinity }}
                    style={{ color: modeColors.primary }}
                  >
                    {formatTime(timeLeft)}
                  </motion.span>
                  <span className="text-sm text-muted-foreground mt-2 uppercase tracking-wider">
                    {mode === 'work' ? 'Focus Time' : mode === 'short-break' ? 'Short Break' : 'Long Break'}
                  </span>
                  {isRunning && (
                    <motion.div
                      initial={{ opacity: 0, scale: 0 }}
                      animate={{ opacity: 1, scale: 1 }}
                      className="flex items-center gap-1 mt-2"
                    >
                      <motion.div
                        animate={{ scale: [1, 1.2, 1] }}
                        transition={{ duration: 1, repeat: Infinity }}
                      >
                        <Sparkles className="w-3 h-3 text-yellow-400" />
                      </motion.div>
                      <span className="text-xs text-yellow-400">Active</span>
                    </motion.div>
                  )}
                </div>
              </div>

              {/* Focus Score (only during work mode) */}
              <AnimatePresence>
                {mode === 'work' && (
                  <motion.div 
                    className="w-full max-w-xs mb-4"
                    initial={{ opacity: 0, height: 0 }}
                    animate={{ opacity: 1, height: 'auto' }}
                    exit={{ opacity: 0, height: 0 }}
                  >
                    <div className="flex items-center justify-between text-sm mb-1">
                      <span className="flex items-center gap-1">
                        <Shield className={`w-4 h-4 ${getFocusColor()}`} />
                        Focus Score
                      </span>
                      <motion.span 
                        className={`font-bold font-mono ${getFocusColor()}`}
                        key={focusScore}
                        initial={{ scale: 1.2 }}
                        animate={{ scale: 1 }}
                      >
                        {focusScore}%
                      </motion.span>
                    </div>
                    <Progress value={focusScore} className="h-2" />
                    <p className="text-xs text-muted-foreground mt-1 text-center">
                      Stay active to maintain your focus score
                    </p>
                  </motion.div>
                )}
              </AnimatePresence>

              {/* XP Preview */}
              <AnimatePresence>
                {mode === 'work' && (
                  <motion.div 
                    className="text-center mb-4 p-3 bg-muted/30 rounded-lg backdrop-blur-sm border border-primary/10"
                    initial={{ opacity: 0, y: 10 }}
                    animate={{ opacity: 1, y: 0 }}
                    exit={{ opacity: 0, y: 10 }}
                  >
                    <p className="text-sm text-muted-foreground">Estimated XP on completion</p>
                    <motion.p 
                      className="text-2xl font-bold text-primary font-mono"
                      animate={{ scale: [1, 1.02, 1] }}
                      transition={{ duration: 2, repeat: Infinity }}
                    >
                      ~{getPreviewXp()} XP
                      {boosts.xpMultiplier > 1 && (
                        <span className="text-sm text-green-400 ml-2">
                          (x{boosts.xpMultiplier.toFixed(2)} boost)
                        </span>
                      )}
                    </motion.p>
                  </motion.div>
                )}
              </AnimatePresence>

              {/* Subject Selector */}
              <AnimatePresence>
                {mode === 'work' && (
                  <motion.div 
                    className="w-full max-w-xs mb-6"
                    initial={{ opacity: 0, y: 10 }}
                    animate={{ opacity: 1, y: 0 }}
                    exit={{ opacity: 0, y: 10 }}
                  >
                    <Label className="text-sm text-muted-foreground mb-2 block">Studying</Label>
                    <Select value={selectedSubject} onValueChange={setSelectedSubject}>
                      <SelectTrigger className="border-primary/20 bg-muted/30">
                        <SelectValue placeholder="Select subject" />
                      </SelectTrigger>
                      <SelectContent>
                        {subjects.map((subject) => (
                          <SelectItem key={subject.id} value={subject.id}>
                            <span className="flex items-center gap-2">
                              <span>{subject.icon}</span>
                              <span>{subject.name}</span>
                              <Badge variant="outline" className="ml-2 text-xs">
                                Diff: {subject.difficulty}
                              </Badge>
                            </span>
                          </SelectItem>
                        ))}
                      </SelectContent>
                    </Select>
                  </motion.div>
                )}
              </AnimatePresence>

              {/* Controls */}
              <motion.div 
                className="flex gap-4 items-center"
                initial={{ opacity: 0, y: 20 }}
                animate={{ opacity: 1, y: 0 }}
                transition={{ delay: 0.3 }}
              >
                <motion.div whileHover={{ scale: 1.1 }} whileTap={{ scale: 0.9 }}>
                  <Button
                    size="lg"
                    variant="outline"
                    onClick={handleReset}
                    className="w-14 h-14 rounded-full border-primary/30"
                  >
                    <RotateCcw className="w-5 h-5" />
                  </Button>
                </motion.div>
                
                <motion.div 
                  whileHover={{ scale: 1.05 }} 
                  whileTap={{ scale: 0.95 }}
                  animate={isRunning ? {} : {
                    scale: [1, 1.05, 1],
                  }}
                  transition={{ duration: 2, repeat: isRunning ? 0 : Infinity }}
                >
                  <Button
                    size="lg"
                    onClick={isRunning ? handlePause : handleStart}
                    className={`w-24 h-24 rounded-full ${isRunning ? 'neon-glow-orange bg-orange-500 hover:bg-orange-600' : 'neon-glow-cyan'}`}
                  >
                    <AnimatePresence mode="wait">
                      {isRunning ? (
                        <motion.div
                          key="pause"
                          initial={{ scale: 0, rotate: -90 }}
                          animate={{ scale: 1, rotate: 0 }}
                          exit={{ scale: 0, rotate: 90 }}
                        >
                          <Pause className="w-10 h-10" />
                        </motion.div>
                      ) : (
                        <motion.div
                          key="play"
                          initial={{ scale: 0, rotate: -90 }}
                          animate={{ scale: 1, rotate: 0 }}
                          exit={{ scale: 0, rotate: 90 }}
                        >
                          <Play className="w-10 h-10 ml-1" />
                        </motion.div>
                      )}
                    </AnimatePresence>
                  </Button>
                </motion.div>
                
                <motion.div whileHover={{ scale: 1.1 }} whileTap={{ scale: 0.9 }}>
                  <Button
                    size="lg"
                    variant="outline"
                    onClick={() => setShowSettings(!showSettings)}
                    className={`w-14 h-14 rounded-full border-primary/30 ${showSettings ? 'bg-primary/20' : ''}`}
                  >
                    <motion.div
                      animate={showSettings ? { rotate: 180 } : { rotate: 0 }}
                      transition={{ duration: 0.3 }}
                    >
                      <Settings className="w-5 h-5" />
                    </motion.div>
                  </Button>
                </motion.div>
              </motion.div>

              {/* Session Info */}
              <motion.div 
                className="grid grid-cols-4 gap-6 mt-8 text-center"
                initial={{ opacity: 0 }}
                animate={{ opacity: 1 }}
                transition={{ delay: 0.4 }}
              >
                {[
                  { value: sessionsCompleted, label: "Sessions", color: "text-primary" },
                  { value: totalWorkTime, label: "Minutes Today", color: "text-green-400" },
                  { value: pomodoroSettings.sessionsBeforeLongBreak - (sessionsCompleted % pomodoroSettings.sessionsBeforeLongBreak), label: "Until Long Break", color: "text-purple-400" },
                  { value: stats.focusEnergy, label: "Focus Energy", color: "text-orange-400" },
                ].map((stat, index) => (
                  <motion.div
                    key={stat.label}
                    initial={{ opacity: 0, y: 20 }}
                    animate={{ opacity: 1, y: 0 }}
                    transition={{ delay: 0.4 + index * 0.1 }}
                    whileHover={{ scale: 1.05 }}
                  >
                    <motion.p 
                      className={`text-2xl font-bold font-mono ${stat.color}`}
                      key={stat.value}
                      initial={{ scale: 1.2 }}
                      animate={{ scale: 1 }}
                    >
                      {stat.value}
                    </motion.p>
                    <p className="text-xs text-muted-foreground">{stat.label}</p>
                  </motion.div>
                ))}
              </motion.div>
            </div>
          </CardContent>
        </Card>
      </motion.div>

      {/* Settings Panel */}
      <AnimatePresence>
        {showSettings && (
          <motion.div
            initial={{ opacity: 0, height: 0, y: -20 }}
            animate={{ opacity: 1, height: 'auto', y: 0 }}
            exit={{ opacity: 0, height: 0, y: -20 }}
            transition={{ type: "spring", stiffness: 300, damping: 30 }}
          >
            <Card className="border-primary/20 bg-card/50 backdrop-blur overflow-hidden">
              <CardHeader>
                <CardTitle className="flex items-center gap-2">
                  <Settings className="w-5 h-5 text-primary" />
                  Timer Settings
                </CardTitle>
              </CardHeader>
              <CardContent className="space-y-6">
                <div className="grid grid-cols-1 md:grid-cols-3 gap-6">
                  <div className="space-y-2">
                    <Label>Work Duration: {pomodoroSettings.workDuration} min</Label>
                    <Slider
                      value={[pomodoroSettings.workDuration]}
                      onValueChange={([value]) => updatePomodoroSettings({ workDuration: value })}
                      min={15}
                      max={90}
                      step={5}
                    />
                  </div>
                  <div className="space-y-2">
                    <Label>Short Break: {pomodoroSettings.shortBreakDuration} min</Label>
                    <Slider
                      value={[pomodoroSettings.shortBreakDuration]}
                      onValueChange={([value]) => updatePomodoroSettings({ shortBreakDuration: value })}
                      min={3}
                      max={15}
                      step={1}
                    />
                  </div>
                  <div className="space-y-2">
                    <Label>Long Break: {pomodoroSettings.longBreakDuration} min</Label>
                    <Slider
                      value={[pomodoroSettings.longBreakDuration]}
                      onValueChange={([value]) => updatePomodoroSettings({ longBreakDuration: value })}
                      min={10}
                      max={30}
                      step={5}
                    />
                  </div>
                </div>

                <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
                  <div className="space-y-2">
                    <Label>Sessions before long break</Label>
                    <Slider
                      value={[pomodoroSettings.sessionsBeforeLongBreak]}
                      onValueChange={([value]) => updatePomodoroSettings({ sessionsBeforeLongBreak: value })}
                      min={2}
                      max={6}
                      step={1}
                    />
                    <p className="text-xs text-muted-foreground">{pomodoroSettings.sessionsBeforeLongBreak} sessions</p>
                  </div>
                  <div className="space-y-4">
                    <div className="flex items-center justify-between">
                      <Label className="flex items-center gap-2">
                        {pomodoroSettings.soundEnabled ? <Volume2 className="w-4 h-4" /> : <VolumeX className="w-4 h-4" />}
                        Sound Notifications
                      </Label>
                      <Switch
                        checked={pomodoroSettings.soundEnabled}
                        onCheckedChange={(checked) => updatePomodoroSettings({ soundEnabled: checked })}
                      />
                    </div>
                    <div className="flex items-center justify-between">
                      <Label>Auto-start Breaks</Label>
                      <Switch
                        checked={pomodoroSettings.autoStartBreaks}
                        onCheckedChange={(checked) => updatePomodoroSettings({ autoStartBreaks: checked })}
                      />
                    </div>
                    <div className="flex items-center justify-between">
                      <Label>Auto-start Work</Label>
                      <Switch
                        checked={pomodoroSettings.autoStartWork}
                        onCheckedChange={(checked) => updatePomodoroSettings({ autoStartWork: checked })}
                      />
                    </div>
                  </div>
                </div>

                {/* XP Calculation Info */}
                <Card className="bg-muted/30 border-primary/10">
                  <CardContent className="p-4">
                    <h4 className="font-medium mb-2 flex items-center gap-2">
                      <Zap className="w-4 h-4 text-yellow-500" />
                      How XP is Calculated
                    </h4>
                    <ul className="text-sm text-muted-foreground space-y-1">
                      <li>Base: 2 XP per minute of focused study</li>
                      <li>Focus Score: Up to +50% bonus for staying active</li>
                      <li>Subject Difficulty: +5% per difficulty level</li>
                      <li>Streak Bonus: {stats.currentStreak > 0 ? `+${((streakMultiplier - 1) * 100).toFixed(0)}% (${stats.currentStreak} days)` : 'None yet'}</li>
                      <li>Skill Boosts: Applied from unlocked skill nodes</li>
                      <li>Pause Penalty: -5% per pause (max -30%)</li>
                    </ul>
                  </CardContent>
                </Card>
              </CardContent>
            </Card>
          </motion.div>
        )}
      </AnimatePresence>
    </motion.div>
  );
}
