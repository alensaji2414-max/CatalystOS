import { create } from 'zustand';
import { persist, createJSONStorage } from 'zustand/middleware';
import { v4 as uuidv4 } from 'uuid';

// Types
export interface Subject {
  id: string;
  name: string;
  icon: string;
  color: string;
  weightage: number;
  priority: 'low' | 'medium' | 'high' | 'critical';
  difficulty: number;
  totalMinutes: number;
  createdAt: number;
}

export interface StudySession {
  id: string;
  subjectId: string;
  startTime: number;
  endTime: number;
  duration: number;
  type: 'pomodoro' | 'deep-work' | 'review';
  xpEarned: number;
  focusScore: number;
  streakMultiplier?: number;
}

export interface Quest {
  id: string;
  title: string;
  description: string;
  type: 'daily' | 'weekly' | 'long-term' | 'boss' | 'random';
  rarity: 'common' | 'uncommon' | 'rare' | 'epic' | 'legendary';
  subjectId?: string;
  targetMinutes?: number;
  targetSessions?: number;
  currentProgress: number;
  requiredProgress: number;
  xpReward: number;
  coinReward: number;
  researchPointReward: number;
  completed: boolean;
  expiresAt?: number;
  createdAt: number;
}

export interface Note {
  id: string;
  title: string;
  content: string;
  subjectId?: string;
  tags: string[];
  isFavorite: boolean;
  isFlashcard: boolean;
  flashcardAnswer?: string;
  createdAt: number;
  updatedAt: number;
}

export interface Achievement {
  id: string;
  name: string;
  description: string;
  icon: string;
  rarity: 'common' | 'uncommon' | 'rare' | 'epic' | 'legendary';
  unlockedAt?: number;
  isSecret: boolean;
  condition: {
    type: 'xp' | 'sessions' | 'streak' | 'level' | 'subject' | 'time' | 'quest';
    value: number;
  };
}

export interface LootBox {
  id: string;
  type: 'common' | 'rare' | 'epic' | 'legendary';
  contents: {
    xp?: number;
    coins?: number;
    researchPoints?: number;
    cosmetic?: string;
  };
  openedAt?: number;
}

export interface SkillNode {
  id: string;
  name: string;
  description: string;
  icon: string;
  tier: number;
  category: 'focus' | 'efficiency' | 'mastery' | 'endurance';
  cost: number;
  unlocked: boolean;
  effect: {
    type: 'xp_boost' | 'coin_boost' | 'focus_boost' | 'burnout_reduction';
    value: number;
  };
  requires?: string[];
}

export interface ChemistryCard {
  id: string;
  type: 'reaction' | 'formula' | 'mechanism' | 'equation';
  front: string;
  back: string;
  difficulty: number;
  timesReviewed: number;
  lastReviewed?: number;
  nextReview?: number;
  mastery: number;
  easeFactor: number; // SM-2 algorithm
  interval: number; // Days until next review
}

export type CharacterTheme = 'chemist' | 'molecular' | 'hero';

export interface CharacterProgress {
  theme: CharacterTheme;
  level: number;
  title: string;
}

export interface DailyData {
  date: string;
  totalMinutes: number;
  sessions: number;
  xpEarned: number;
  subjectBreakdown: Record<string, number>;
}

export interface PomodoroSettings {
  workDuration: number;
  shortBreakDuration: number;
  longBreakDuration: number;
  sessionsBeforeLongBreak: number;
  autoStartBreaks: boolean;
  autoStartWork: boolean;
  soundEnabled: boolean;
  ambientSound: 'none' | 'rain' | 'fire' | 'lab' | 'forest';
}

export interface UserStats {
  xp: number;
  level: number;
  totalXp: number;
  focusEnergy: number;
  maxFocusEnergy: number;
  burnoutMeter: number;
  consistencyScore: number;
  researchPoints: number;
  coins: number;
  knowledgeMastery: number;
  weeklyMomentum: number;
  disciplineRating: number;
  accuracyScore: number;
  currentStreak: number;
  longestStreak: number;
  lastStudyDate?: string;
  lastInitDate?: string; // Track daily initialization
  totalStudyMinutes: number;
  totalSessions: number;
  totalQuestsCompleted: number;
}

// Boosts calculated from skill tree and streak
export interface ActiveBoosts {
  xpMultiplier: number;
  coinMultiplier: number;
  focusRecoveryMultiplier: number;
  burnoutReductionMultiplier: number;
  streakMultiplier: number;
}

export interface CreatorProfile {
  name: string;
  role: string;
  researchId: string;
  profileImage?: string;
  githubUrl?: string;
}

// Celebration events for motivation loops
export interface CelebrationEvent {
  type: "level_up" | "achievement" | "quest_complete" | "streak" | "milestone";
  title: string;
  subtitle?: string;
  icon?: string;
  xpGained?: number;
  coinsGained?: number;
  newLevel?: number;
}

interface StudyStore {
  // User Stats
  stats: UserStats;
  updateStats: (updates: Partial<UserStats>) => void;
  addXp: (amount: number) => void;
  spendCoins: (amount: number) => boolean;
  spendResearchPoints: (amount: number) => boolean;
  
  // Celebration Events
  celebrationEvent: CelebrationEvent | null;
  triggerCelebration: (event: CelebrationEvent) => void;
  clearCelebration: () => void;
  
  // Boosts
  getActiveBoosts: () => ActiveBoosts;
  getStreakMultiplier: () => number;
  
  // Character
  character: CharacterProgress;
  setCharacterTheme: (theme: CharacterTheme) => void;
  
  // Subjects
  subjects: Subject[];
  addSubject: (subject: Omit<Subject, 'id' | 'totalMinutes' | 'createdAt'>) => void;
  updateSubject: (id: string, updates: Partial<Subject>) => void;
  deleteSubject: (id: string) => void;
  
  // Sessions
  sessions: StudySession[];
  addSession: (session: Omit<StudySession, 'id'>) => void;
  
  // Quests
  quests: Quest[];
  addQuest: (quest: Omit<Quest, 'id' | 'currentProgress' | 'completed' | 'createdAt'>) => void;
  updateQuestProgress: (id: string, progress: number) => void;
  completeQuest: (id: string) => void;
  generateDailyQuests: () => void;
  generateWeeklyQuests: () => void;
  generateBossQuest: () => void;
  checkAndAutoCompleteQuests: () => void;
  
  // Notes
  notes: Note[];
  addNote: (note: Omit<Note, 'id' | 'createdAt' | 'updatedAt'>) => void;
  updateNote: (id: string, updates: Partial<Note>) => void;
  deleteNote: (id: string) => void;
  
  // Achievements
  achievements: Achievement[];
  unlockAchievement: (id: string) => void;
  checkAchievements: () => void;
  
  // Loot Boxes
  lootBoxes: LootBox[];
  addLootBox: (type: LootBox['type']) => void;
  openLootBox: (id: string) => LootBox['contents'] | null;
  
  // Skill Tree
  skillNodes: SkillNode[];
  unlockSkill: (id: string) => boolean;
  
  // Chemistry Cards
  chemistryCards: ChemistryCard[];
  addChemistryCard: (card: Omit<ChemistryCard, 'id' | 'timesReviewed' | 'mastery' | 'easeFactor' | 'interval'>) => void;
  updateCardMastery: (id: string, quality: 0 | 1 | 2 | 3 | 4 | 5) => void; // SM-2 quality ratings
  deleteChemistryCard: (id: string) => void;
  getCardsForReview: () => ChemistryCard[];
  
  // Daily Data
  dailyData: DailyData[];
  recordDailyActivity: (minutes: number, subjectId: string, xp: number) => void;
  
  // Pomodoro Settings
  pomodoroSettings: PomodoroSettings;
  updatePomodoroSettings: (settings: Partial<PomodoroSettings>) => void;
  
  // Cosmetics
  unlockedCosmetics: string[];
  selectedCosmetics: Record<string, string>;
  unlockCosmetic: (id: string) => void;
  selectCosmetic: (category: string, id: string) => void;
  
  // Daily Reset & Initialization
  initializeDay: () => void;
  
  // Creator Profile
  creatorProfile: CreatorProfile;
  updateCreatorProfile: (updates: Partial<CreatorProfile>) => void;
  
  // Data Management
  exportData: () => string;
  importData: (data: string) => boolean;
  resetAllData: () => void;
}

// Level thresholds
const LEVEL_THRESHOLDS = [
  0, 100, 250, 450, 700, 1000, 1400, 1900, 2500, 3200,
  4000, 5000, 6200, 7600, 9200, 11000, 13000, 15500, 18500, 22000,
  26000, 30500, 35500, 41000, 47000, 54000, 62000, 71000, 81000, 92000,
  104000, 118000, 134000, 152000, 172000, 195000, 221000, 250000, 283000, 320000,
  362000, 410000, 465000, 527000, 598000, 678000, 769000, 872000, 989000, 1121000
];

const CHARACTER_TITLES: Record<CharacterTheme, string[]> = {
  chemist: ['Lab Intern', 'Research Assistant', 'Lab Technician', 'Graduate Researcher', 'Postdoctoral Fellow', 'Principal Investigator', 'Department Head', 'Nobel Laureate'],
  molecular: ['Hydrogen', 'Helium', 'Carbon', 'Nitrogen', 'Oxygen', 'Iron', 'Gold', 'Uranium'],
  hero: ['Novice', 'Apprentice', 'Scholar', 'Adept', 'Expert', 'Master', 'Grandmaster', 'Legend']
};

const getCharacterTitle = (theme: CharacterTheme, level: number): string => {
  const titles = CHARACTER_TITLES[theme];
  const tierIndex = Math.min(Math.floor(level / 7), titles.length - 1);
  return titles[tierIndex];
};

const calculateLevel = (xp: number): number => {
  for (let i = LEVEL_THRESHOLDS.length - 1; i >= 0; i--) {
    if (xp >= LEVEL_THRESHOLDS[i]) return i + 1;
  }
  return 1;
};

// Streak multiplier calculation - rewards consistency
const calculateStreakMultiplier = (streak: number): number => {
  if (streak <= 0) return 1.0;
  if (streak <= 3) return 1.0 + (streak * 0.05); // 1.05, 1.10, 1.15
  if (streak <= 7) return 1.15 + ((streak - 3) * 0.05); // up to 1.35
  if (streak <= 14) return 1.35 + ((streak - 7) * 0.03); // up to 1.56
  if (streak <= 30) return 1.56 + ((streak - 14) * 0.02); // up to 1.88
  return Math.min(2.5, 1.88 + ((streak - 30) * 0.01)); // caps at 2.5x
};

const DEFAULT_ACHIEVEMENTS: Achievement[] = [
  // Session achievements
  { id: 'first-session', name: 'First Reaction', description: 'Complete your first study session', icon: '🔬', rarity: 'common', isSecret: false, condition: { type: 'sessions', value: 1 } },
  { id: 'ten-sessions', name: 'Lab Regular', description: 'Complete 10 study sessions', icon: '📚', rarity: 'common', isSecret: false, condition: { type: 'sessions', value: 10 } },
  { id: 'fifty-sessions', name: 'Research Associate', description: 'Complete 50 study sessions', icon: '🎓', rarity: 'uncommon', isSecret: false, condition: { type: 'sessions', value: 50 } },
  { id: 'hundred-sessions', name: 'Senior Researcher', description: 'Complete 100 study sessions', icon: '🔭', rarity: 'rare', isSecret: false, condition: { type: 'sessions', value: 100 } },
  { id: 'fivehundred-sessions', name: 'Lab Director', description: 'Complete 500 study sessions', icon: '🏛️', rarity: 'epic', isSecret: false, condition: { type: 'sessions', value: 500 } },
  
  // Streak achievements
  { id: 'streak-3', name: 'Catalyzing', description: 'Maintain a 3-day streak', icon: '🔥', rarity: 'common', isSecret: false, condition: { type: 'streak', value: 3 } },
  { id: 'streak-7', name: 'Chain Reaction', description: 'Maintain a 7-day streak', icon: '⚡', rarity: 'uncommon', isSecret: false, condition: { type: 'streak', value: 7 } },
  { id: 'streak-14', name: 'Sustained Reaction', description: 'Maintain a 14-day streak', icon: '💫', rarity: 'rare', isSecret: false, condition: { type: 'streak', value: 14 } },
  { id: 'streak-30', name: 'Perpetual Motion', description: 'Maintain a 30-day streak', icon: '💎', rarity: 'epic', isSecret: false, condition: { type: 'streak', value: 30 } },
  { id: 'streak-100', name: 'Nuclear Fusion', description: 'Maintain a 100-day streak', icon: '👑', rarity: 'legendary', isSecret: false, condition: { type: 'streak', value: 100 } },
  
  // Level achievements
  { id: 'level-5', name: 'Electron Excited', description: 'Reach level 5', icon: '⭐', rarity: 'common', isSecret: false, condition: { type: 'level', value: 5 } },
  { id: 'level-10', name: 'Valence Shell', description: 'Reach level 10', icon: '🌟', rarity: 'uncommon', isSecret: false, condition: { type: 'level', value: 10 } },
  { id: 'level-25', name: 'Noble Gas', description: 'Reach level 25', icon: '💫', rarity: 'rare', isSecret: false, condition: { type: 'level', value: 25 } },
  { id: 'level-50', name: 'Superconductor', description: 'Reach level 50', icon: '🏆', rarity: 'legendary', isSecret: false, condition: { type: 'level', value: 50 } },
  
  // Time achievements
  { id: 'hour-1', name: 'First Flask', description: 'Study for 1 hour total', icon: '⏱️', rarity: 'common', isSecret: false, condition: { type: 'time', value: 60 } },
  { id: 'hour-10', name: 'Bunsen Burner', description: 'Study for 10 hours total', icon: '⏰', rarity: 'uncommon', isSecret: false, condition: { type: 'time', value: 600 } },
  { id: 'hour-50', name: 'Lab Veteran', description: 'Study for 50 hours total', icon: '🔬', rarity: 'rare', isSecret: false, condition: { type: 'time', value: 3000 } },
  { id: 'hour-100', name: 'Century Compound', description: 'Study for 100 hours total', icon: '🕰️', rarity: 'epic', isSecret: false, condition: { type: 'time', value: 6000 } },
  
  // Quest achievements
  { id: 'quest-10', name: 'Experiment Logger', description: 'Complete 10 quests', icon: '📜', rarity: 'uncommon', isSecret: false, condition: { type: 'quest', value: 10 } },
  { id: 'quest-50', name: 'Protocol Master', description: 'Complete 50 quests', icon: '🗺️', rarity: 'rare', isSecret: false, condition: { type: 'quest', value: 50 } },
  { id: 'quest-100', name: 'Research Grant', description: 'Complete 100 quests', icon: '🏅', rarity: 'epic', isSecret: false, condition: { type: 'quest', value: 100 } },
  
  // Secret achievements
  { id: 'secret-night', name: 'Night Shift', description: 'Study past midnight', icon: '🦉', rarity: 'rare', isSecret: true, condition: { type: 'sessions', value: 1 } },
  { id: 'secret-early', name: 'Dawn Patrol', description: 'Start studying before 6 AM', icon: '🌅', rarity: 'rare', isSecret: true, condition: { type: 'sessions', value: 1 } },
  { id: 'secret-marathon', name: 'Lab Lockdown', description: 'Study for 4 hours in one day', icon: '🔒', rarity: 'epic', isSecret: true, condition: { type: 'time', value: 240 } },
];

const DEFAULT_SKILL_NODES: SkillNode[] = [
  // Focus Tree - XP boosts
  { id: 'focus-1', name: 'Concentration I', description: '+5% XP from all sessions', icon: '🎯', tier: 1, category: 'focus', cost: 100, unlocked: false, effect: { type: 'xp_boost', value: 0.05 } },
  { id: 'focus-2', name: 'Concentration II', description: '+10% XP from all sessions', icon: '🎯', tier: 2, category: 'focus', cost: 250, unlocked: false, effect: { type: 'xp_boost', value: 0.10 }, requires: ['focus-1'] },
  { id: 'focus-3', name: 'Deep Focus', description: '+15% XP from all sessions', icon: '🧠', tier: 3, category: 'focus', cost: 500, unlocked: false, effect: { type: 'xp_boost', value: 0.15 }, requires: ['focus-2'] },
  { id: 'focus-4', name: 'Flow State', description: '+25% XP from all sessions', icon: '✨', tier: 4, category: 'focus', cost: 1000, unlocked: false, effect: { type: 'xp_boost', value: 0.25 }, requires: ['focus-3'] },
  
  // Efficiency Tree - Coin boosts
  { id: 'efficiency-1', name: 'Quick Learner I', description: '+10% coin gain', icon: '💰', tier: 1, category: 'efficiency', cost: 100, unlocked: false, effect: { type: 'coin_boost', value: 0.10 } },
  { id: 'efficiency-2', name: 'Quick Learner II', description: '+15% coin gain', icon: '💰', tier: 2, category: 'efficiency', cost: 250, unlocked: false, effect: { type: 'coin_boost', value: 0.15 }, requires: ['efficiency-1'] },
  { id: 'efficiency-3', name: 'Resource Master', description: '+25% coin gain', icon: '🔬', tier: 3, category: 'efficiency', cost: 500, unlocked: false, effect: { type: 'coin_boost', value: 0.25 }, requires: ['efficiency-2'] },
  { id: 'efficiency-4', name: 'Grant Writer', description: '+40% coin gain', icon: '💎', tier: 4, category: 'efficiency', cost: 1000, unlocked: false, effect: { type: 'coin_boost', value: 0.40 }, requires: ['efficiency-3'] },
  
  // Endurance Tree - Burnout reduction
  { id: 'endurance-1', name: 'Stamina I', description: '-10% burnout gain', icon: '💪', tier: 1, category: 'endurance', cost: 100, unlocked: false, effect: { type: 'burnout_reduction', value: 0.10 } },
  { id: 'endurance-2', name: 'Stamina II', description: '-15% burnout gain', icon: '💪', tier: 2, category: 'endurance', cost: 250, unlocked: false, effect: { type: 'burnout_reduction', value: 0.15 }, requires: ['endurance-1'] },
  { id: 'endurance-3', name: 'Iron Will', description: '-25% burnout gain', icon: '🛡️', tier: 3, category: 'endurance', cost: 500, unlocked: false, effect: { type: 'burnout_reduction', value: 0.25 }, requires: ['endurance-2'] },
  { id: 'endurance-4', name: 'Indefatigable', description: '-40% burnout gain', icon: '⚔️', tier: 4, category: 'endurance', cost: 1000, unlocked: false, effect: { type: 'burnout_reduction', value: 0.40 }, requires: ['endurance-3'] },
  
  // Mastery Tree - Focus recovery
  { id: 'mastery-1', name: 'Scholar I', description: '+10% focus energy recovery', icon: '📖', tier: 1, category: 'mastery', cost: 100, unlocked: false, effect: { type: 'focus_boost', value: 0.10 } },
  { id: 'mastery-2', name: 'Scholar II', description: '+15% focus energy recovery', icon: '📖', tier: 2, category: 'mastery', cost: 250, unlocked: false, effect: { type: 'focus_boost', value: 0.15 }, requires: ['mastery-1'] },
  { id: 'mastery-3', name: 'Sage', description: '+25% focus energy recovery', icon: '🧙', tier: 3, category: 'mastery', cost: 500, unlocked: false, effect: { type: 'focus_boost', value: 0.25 }, requires: ['mastery-2'] },
  { id: 'mastery-4', name: 'Enlightened', description: '+40% focus energy recovery', icon: '☀️', tier: 4, category: 'mastery', cost: 1000, unlocked: false, effect: { type: 'focus_boost', value: 0.40 }, requires: ['mastery-3'] },
];

const QUEST_TEMPLATES = {
  daily: [
    { title: 'Morning Catalyst', description: 'Complete a study session before noon', targetMinutes: 25, xpReward: 50, coinReward: 10 },
    { title: 'Focus Sprint', description: 'Complete 2 pomodoro sessions', targetSessions: 2, xpReward: 75, coinReward: 15 },
    { title: 'Element Variety', description: 'Study 2 different subjects', targetSessions: 2, xpReward: 60, coinReward: 12 },
    { title: 'Deep Reaction', description: 'Study for 45 minutes total', targetMinutes: 45, xpReward: 100, coinReward: 20 },
    { title: 'Lab Hour', description: 'Log at least 1 hour of study time', targetMinutes: 60, xpReward: 80, coinReward: 16 },
    { title: 'Triple Bond', description: 'Complete 3 study sessions', targetSessions: 3, xpReward: 90, coinReward: 18 },
  ],
  weekly: [
    { title: 'Weekly Synthesis', description: 'Study for 10 hours this week', targetMinutes: 600, xpReward: 500, coinReward: 100, researchPointReward: 50 },
    { title: 'Session Marathon', description: 'Complete 20 study sessions', targetSessions: 20, xpReward: 400, coinReward: 80, researchPointReward: 40 },
    { title: 'Perfect Titration', description: 'Study every day of the week', targetSessions: 7, xpReward: 600, coinReward: 120, researchPointReward: 60 },
    { title: 'Subject Mastery', description: 'Study one subject for 5 hours', targetMinutes: 300, xpReward: 450, coinReward: 90, researchPointReward: 45 },
    { title: 'Compound Builder', description: 'Complete 15 study sessions', targetSessions: 15, xpReward: 350, coinReward: 70, researchPointReward: 35 },
  ],
  boss: [
    { title: 'The Grind Reactor', description: 'Complete 50 pomodoro sessions', targetSessions: 50, xpReward: 2000, coinReward: 500, researchPointReward: 200, rarity: 'legendary' as const },
    { title: 'Marathon Synthesis', description: 'Study for 30 hours total', targetMinutes: 1800, xpReward: 2500, coinReward: 600, researchPointReward: 250, rarity: 'legendary' as const },
    { title: 'Streak Catalyst', description: 'Maintain a 14-day streak', targetSessions: 14, xpReward: 1500, coinReward: 400, researchPointReward: 150, rarity: 'epic' as const },
    { title: 'Century Session', description: 'Complete 100 study sessions', targetSessions: 100, xpReward: 3000, coinReward: 750, researchPointReward: 300, rarity: 'legendary' as const },
    { title: 'Deep Work Master', description: 'Log 50 hours of study time', targetMinutes: 3000, xpReward: 3500, coinReward: 800, researchPointReward: 350, rarity: 'legendary' as const },
  ],
  subject: [
    { title: 'Organic Focus', description: 'Study Organic Chemistry for 2 hours', targetMinutes: 120, xpReward: 200, coinReward: 40, subjectMatch: 'organic' },
    { title: 'Inorganic Dive', description: 'Study Inorganic Chemistry for 2 hours', targetMinutes: 120, xpReward: 200, coinReward: 40, subjectMatch: 'inorganic' },
    { title: 'Physical Challenge', description: 'Study Physical Chemistry for 2 hours', targetMinutes: 120, xpReward: 200, coinReward: 40, subjectMatch: 'physical' },
    { title: 'Analytical Precision', description: 'Study Analytical Chemistry for 2 hours', targetMinutes: 120, xpReward: 200, coinReward: 40, subjectMatch: 'analytical' },
  ],
};

const initialStats: UserStats = {
  xp: 0,
  level: 1,
  totalXp: 0,
  focusEnergy: 100,
  maxFocusEnergy: 100,
  burnoutMeter: 0,
  consistencyScore: 0,
  researchPoints: 0,
  coins: 50,
  knowledgeMastery: 0,
  weeklyMomentum: 0,
  disciplineRating: 0,
  accuracyScore: 100,
  currentStreak: 0,
  longestStreak: 0,
  totalStudyMinutes: 0,
  totalSessions: 0,
  totalQuestsCompleted: 0,
};

const initialPomodoroSettings: PomodoroSettings = {
  workDuration: 25,
  shortBreakDuration: 5,
  longBreakDuration: 15,
  sessionsBeforeLongBreak: 4,
  autoStartBreaks: false,
  autoStartWork: false,
  soundEnabled: true,
  ambientSound: 'none',
};

export const useStudyStore = create<StudyStore>()(
  persist(
    (set, get) => ({
      // Initial State
      stats: initialStats,
      character: { theme: 'chemist', level: 1, title: 'Lab Intern' },
      celebrationEvent: null,
      subjects: [
        { id: 'chem-org', name: 'Organic Chemistry', icon: '🧪', color: '#00d4aa', weightage: 30, priority: 'critical', difficulty: 4, totalMinutes: 0, createdAt: Date.now() },
        { id: 'chem-inorg', name: 'Inorganic Chemistry', icon: '⚗️', color: '#00a8e8', weightage: 25, priority: 'high', difficulty: 3, totalMinutes: 0, createdAt: Date.now() },
        { id: 'chem-phys', name: 'Physical Chemistry', icon: '📊', color: '#9d4edd', weightage: 25, priority: 'high', difficulty: 4, totalMinutes: 0, createdAt: Date.now() },
        { id: 'chem-anal', name: 'Analytical Chemistry', icon: '🔬', color: '#ff6b6b', weightage: 20, priority: 'medium', difficulty: 3, totalMinutes: 0, createdAt: Date.now() },
      ],
      sessions: [],
      quests: [],
      notes: [],
      achievements: DEFAULT_ACHIEVEMENTS,
      lootBoxes: [],
      skillNodes: DEFAULT_SKILL_NODES,
      chemistryCards: [],
      dailyData: [],
      pomodoroSettings: initialPomodoroSettings,
      unlockedCosmetics: ['default-badge', 'default-border'],
      selectedCosmetics: { badge: 'default-badge', border: 'default-border' },
      creatorProfile: {
        name: 'Alen Saji',
        role: 'Lead Researcher',
        researchId: 'ALN-001',
        githubUrl: 'https://github.com/alensaji',
      },
      
      // Calculate streak multiplier
      getStreakMultiplier: () => {
        const { stats } = get();
        return calculateStreakMultiplier(stats.currentStreak);
      },
      
      // Calculate all active boosts from skill tree + streak
      getActiveBoosts: () => {
        const { skillNodes, stats } = get();
        const streakMult = calculateStreakMultiplier(stats.currentStreak);
        
        let xpBoost = 0;
        let coinBoost = 0;
        let focusBoost = 0;
        let burnoutReduction = 0;
        
        skillNodes.forEach(node => {
          if (node.unlocked) {
            switch (node.effect.type) {
              case 'xp_boost': xpBoost += node.effect.value; break;
              case 'coin_boost': coinBoost += node.effect.value; break;
              case 'focus_boost': focusBoost += node.effect.value; break;
              case 'burnout_reduction': burnoutReduction += node.effect.value; break;
            }
          }
        });
        
        return {
          xpMultiplier: (1 + xpBoost) * streakMult,
          coinMultiplier: 1 + coinBoost,
          focusRecoveryMultiplier: 1 + focusBoost,
          burnoutReductionMultiplier: 1 - burnoutReduction,
          streakMultiplier: streakMult,
        };
      },
      
      // Stats Methods
      updateStats: (updates) => set((state) => ({
        stats: { ...state.stats, ...updates }
      })),
      
      // Celebration methods
      triggerCelebration: (event) => set({ celebrationEvent: event }),
      clearCelebration: () => set({ celebrationEvent: null }),
      
      addXp: (amount) => {
        const state = get();
        const boosts = state.getActiveBoosts();
        const boostedAmount = Math.round(amount * boosts.xpMultiplier);
        const newTotalXp = state.stats.totalXp + boostedAmount;
        const newLevel = calculateLevel(newTotalXp);
        const newTitle = getCharacterTitle(state.character.theme, newLevel);
        
        // Level up rewards
        let bonusCoins = 0;
        let bonusResearch = 0;
        const leveledUp = newLevel > state.stats.level;
        if (leveledUp) {
          bonusCoins = newLevel * 15;
          bonusResearch = newLevel * 8;
        }
        
        set({
          stats: {
            ...state.stats,
            xp: boostedAmount,
            totalXp: newTotalXp,
            level: newLevel,
            coins: state.stats.coins + bonusCoins,
            researchPoints: state.stats.researchPoints + bonusResearch,
          },
          character: {
            ...state.character,
            level: newLevel,
            title: newTitle,
          }
        });
        
        // Trigger level up celebration
        if (leveledUp) {
          setTimeout(() => {
            get().triggerCelebration({
              type: "level_up",
              title: "Level Up!",
              subtitle: `You are now ${newTitle}`,
              icon: "⬆️",
              newLevel,
              coinsGained: bonusCoins,
            });
          }, 100);
        }
      },
      
      spendCoins: (amount) => {
        const { stats } = get();
        if (stats.coins < amount) return false;
        set({ stats: { ...stats, coins: stats.coins - amount } });
        return true;
      },
      
      spendResearchPoints: (amount) => {
        const { stats } = get();
        if (stats.researchPoints < amount) return false;
        set({ stats: { ...stats, researchPoints: stats.researchPoints - amount } });
        return true;
      },
      
      // Character Methods
      setCharacterTheme: (theme) => set((state) => ({
        character: {
          ...state.character,
          theme,
          title: getCharacterTitle(theme, state.character.level),
        }
      })),
      
      // Subject Methods
      addSubject: (subject) => set((state) => ({
        subjects: [...state.subjects, {
          ...subject,
          id: uuidv4(),
          totalMinutes: 0,
          createdAt: Date.now(),
        }]
      })),
      
      updateSubject: (id, updates) => set((state) => ({
        subjects: state.subjects.map((s) => 
          s.id === id ? { ...s, ...updates } : s
        )
      })),
      
      deleteSubject: (id) => set((state) => ({
        subjects: state.subjects.filter((s) => s.id !== id)
      })),
      
      // Session Methods
      addSession: (session) => {
        const { getActiveBoosts, triggerCelebration, stats: currentStats } = get();
        const boosts = getActiveBoosts();
        const newSession = { 
          ...session, 
          id: uuidv4(),
          streakMultiplier: boosts.streakMultiplier,
        };
        
        // Calculate streak
        const today = new Date().toDateString();
        const isNewDay = currentStats.lastStudyDate !== today;
        let newStreak = currentStats.currentStreak;
        
        if (isNewDay) {
          const yesterday = new Date();
          yesterday.setDate(yesterday.getDate() - 1);
          if (currentStats.lastStudyDate === yesterday.toDateString()) {
            newStreak += 1;
          } else if (currentStats.lastStudyDate !== today) {
            newStreak = 1;
          }
        }
        
        // Check for streak milestones BEFORE updating state
        const streakMilestones = [3, 7, 14, 30, 50, 100];
        const hitMilestone = streakMilestones.find(
          m => newStreak === m && currentStats.currentStreak < m
        );
        
        set((state) => {
          // Update subject total minutes
          const updatedSubjects = state.subjects.map((s) =>
            s.id === session.subjectId
              ? { ...s, totalMinutes: s.totalMinutes + session.duration }
              : s
          );
          
          // Calculate burnout with reduction from skills
          const baseBurnoutGain = session.duration * 0.1;
          const burnoutGain = baseBurnoutGain * boosts.burnoutReductionMultiplier;
          const newBurnout = Math.min(100, state.stats.burnoutMeter + burnoutGain);
          
          // Focus energy cost
          const focusCost = session.duration * 0.5;
          const newFocusEnergy = Math.max(0, state.stats.focusEnergy - focusCost);
          
          return {
            sessions: [...state.sessions, newSession],
            subjects: updatedSubjects,
            stats: {
              ...state.stats,
              totalStudyMinutes: state.stats.totalStudyMinutes + session.duration,
              totalSessions: state.stats.totalSessions + 1,
              currentStreak: newStreak,
              longestStreak: Math.max(state.stats.longestStreak, newStreak),
              lastStudyDate: today,
              burnoutMeter: newBurnout,
              focusEnergy: newFocusEnergy,
            }
          };
        });
        
        // Trigger streak milestone celebration AFTER state update
        if (hitMilestone) {
          const milestoneMessages: Record<number, string> = {
            3: 'Catalyzing! You\'re building momentum!',
            7: 'Chain Reaction! A full week of dedication!',
            14: 'Sustained Reaction! Two weeks strong!',
            30: 'Perpetual Motion! A month of excellence!',
            50: 'Unstoppable Force! 50 days of mastery!',
            100: 'Nuclear Fusion! 100 days - you\'re legendary!',
          };
          
          triggerCelebration({
            type: 'streak',
            title: `${hitMilestone}-Day Streak!`,
            subtitle: milestoneMessages[hitMilestone],
            icon: hitMilestone >= 30 ? '🔥' : '⚡',
          });
        }
      },
      
      // Quest Methods
      addQuest: (quest) => set((state) => ({
        quests: [...state.quests, {
          ...quest,
          id: uuidv4(),
          currentProgress: 0,
          completed: false,
          createdAt: Date.now(),
        }]
      })),
      
      updateQuestProgress: (id, progress) => {
        set((state) => ({
          quests: state.quests.map((q) =>
            q.id === id ? { ...q, currentProgress: Math.min(progress, q.requiredProgress) } : q
          )
        }));
        // Auto-complete check
        get().checkAndAutoCompleteQuests();
      },
      
      checkAndAutoCompleteQuests: () => {
        const { quests, completeQuest } = get();
        quests.forEach(quest => {
          if (!quest.completed && quest.currentProgress >= quest.requiredProgress) {
            completeQuest(quest.id);
          }
        });
      },
      
      completeQuest: (id) => {
        const { quests, stats, addLootBox, getActiveBoosts } = get();
        const quest = quests.find((q) => q.id === id);
        if (!quest || quest.completed) return;
        
        const boosts = getActiveBoosts();
        const boostedCoins = Math.round(quest.coinReward * boosts.coinMultiplier);
        
        set((state) => ({
          quests: state.quests.map((q) =>
            q.id === id ? { ...q, completed: true } : q
          ),
          stats: {
            ...state.stats,
            coins: state.stats.coins + boostedCoins,
            researchPoints: state.stats.researchPoints + (quest.researchPointReward || 0),
            totalQuestsCompleted: state.stats.totalQuestsCompleted + 1,
          }
        }));
        
        get().addXp(quest.xpReward);
        
        // Chance for loot box on quest completion
        const lootChance = quest.rarity === 'legendary' ? 0.8 :
                          quest.rarity === 'epic' ? 0.6 :
                          quest.rarity === 'rare' ? 0.4 : 0.25;
        
        if (Math.random() < lootChance) {
          const lootType = quest.rarity === 'legendary' ? 'legendary' :
                          quest.rarity === 'epic' ? 'epic' :
                          quest.rarity === 'rare' ? 'rare' : 'common';
          addLootBox(lootType);
        }
        
        // Check achievements after quest completion
        get().checkAchievements();
      },
      
      generateDailyQuests: () => {
        const { quests } = get();
        const today = new Date().toDateString();
        
        // Check if we already have today's daily quests
        const hasTodayDailies = quests.some(q => 
          q.type === 'daily' && 
          !q.completed && 
          q.expiresAt && 
          new Date(q.expiresAt).toDateString() === today
        );
        
        if (hasTodayDailies) return;
        
        // Remove expired daily quests
        const activeQuests = quests.filter((q) => 
          q.type !== 'daily' || (q.expiresAt && q.expiresAt > Date.now())
        );
        
        // Generate new daily quests
        const templates = QUEST_TEMPLATES.daily;
        const numQuests = 3;
        const shuffled = [...templates].sort(() => Math.random() - 0.5);
        const selectedTemplates = shuffled.slice(0, numQuests);
        
        const endOfDay = new Date();
        endOfDay.setHours(23, 59, 59, 999);
        
        const newQuests: Quest[] = selectedTemplates.map((t) => ({
          id: uuidv4(),
          title: t.title,
          description: t.description,
          type: 'daily' as const,
          rarity: 'common' as const,
          targetMinutes: t.targetMinutes,
          targetSessions: t.targetSessions,
          currentProgress: 0,
          requiredProgress: t.targetMinutes || t.targetSessions || 1,
          xpReward: t.xpReward,
          coinReward: t.coinReward,
          researchPointReward: 0,
          completed: false,
          expiresAt: endOfDay.getTime(),
          createdAt: Date.now(),
        }));
        
        set({ quests: [...activeQuests, ...newQuests] });
      },
      
      generateWeeklyQuests: () => {
        const { quests } = get();
        
        // Check if we need new weekly quests
        const hasActiveWeekly = quests.some((q) => 
          q.type === 'weekly' && !q.completed && q.expiresAt && q.expiresAt > Date.now()
        );
        
        if (hasActiveWeekly) return;
        
        const templates = QUEST_TEMPLATES.weekly;
        const numQuests = 2;
        const shuffled = [...templates].sort(() => Math.random() - 0.5);
        const selectedTemplates = shuffled.slice(0, numQuests);
        
        const endOfWeek = new Date();
        endOfWeek.setDate(endOfWeek.getDate() + (7 - endOfWeek.getDay()));
        endOfWeek.setHours(23, 59, 59, 999);
        
        const newQuests: Quest[] = selectedTemplates.map((t) => ({
          id: uuidv4(),
          title: t.title,
          description: t.description,
          type: 'weekly' as const,
          rarity: 'uncommon' as const,
          targetMinutes: t.targetMinutes,
          targetSessions: t.targetSessions,
          currentProgress: 0,
          requiredProgress: t.targetMinutes || t.targetSessions || 1,
          xpReward: t.xpReward,
          coinReward: t.coinReward,
          researchPointReward: t.researchPointReward || 0,
          completed: false,
          expiresAt: endOfWeek.getTime(),
          createdAt: Date.now(),
        }));
        
        set((state) => ({ quests: [...state.quests, ...newQuests] }));
      },
      
      generateBossQuest: () => {
        const { quests, stats } = get();
        
        // Only generate boss quest if player is level 5+ and no active boss quest
        if (stats.level < 5) return;
        
        const hasActiveBoss = quests.some(q => 
          q.type === 'boss' && !q.completed
        );
        
        if (hasActiveBoss) return;
        
        const templates = QUEST_TEMPLATES.boss;
        const template = templates[Math.floor(Math.random() * templates.length)];
        
        // Boss quests don't expire
        const newQuest: Quest = {
          id: uuidv4(),
          title: template.title,
          description: template.description,
          type: 'boss',
          rarity: template.rarity,
          targetMinutes: template.targetMinutes,
          targetSessions: template.targetSessions,
          currentProgress: 0,
          requiredProgress: template.targetMinutes || template.targetSessions || 1,
          xpReward: template.xpReward,
          coinReward: template.coinReward,
          researchPointReward: template.researchPointReward,
          completed: false,
          createdAt: Date.now(),
        };
        
        set((state) => ({ quests: [...state.quests, newQuest] }));
      },
      
      // Notes Methods
      addNote: (note) => set((state) => ({
        notes: [...state.notes, {
          ...note,
          id: uuidv4(),
          createdAt: Date.now(),
          updatedAt: Date.now(),
        }]
      })),
      
      updateNote: (id, updates) => set((state) => ({
        notes: state.notes.map((n) =>
          n.id === id ? { ...n, ...updates, updatedAt: Date.now() } : n
        )
      })),
      
      deleteNote: (id) => set((state) => ({
        notes: state.notes.filter((n) => n.id !== id)
      })),
      
      // Achievement Methods
      unlockAchievement: (id) => {
        const { achievements, triggerCelebration } = get();
        const achievement = achievements.find(a => a.id === id);
        
        // Only unlock if not already unlocked
        if (!achievement || achievement.unlockedAt) return;
        
        set((state) => ({
          achievements: state.achievements.map((a) =>
            a.id === id ? { ...a, unlockedAt: Date.now() } : a
          )
        }));
        
        // Trigger celebration for the newly unlocked achievement
        triggerCelebration({
          type: 'achievement',
          title: achievement.name,
          subtitle: achievement.description,
          icon: achievement.icon,
        });
      },
      
      checkAchievements: () => {
        const { stats, achievements, quests, unlockAchievement, addLootBox } = get();
        
        achievements.forEach((achievement) => {
          if (achievement.unlockedAt) return;
          
          let shouldUnlock = false;
          
          switch (achievement.condition.type) {
            case 'sessions':
              shouldUnlock = stats.totalSessions >= achievement.condition.value;
              break;
            case 'streak':
              shouldUnlock = stats.currentStreak >= achievement.condition.value;
              break;
            case 'level':
              shouldUnlock = stats.level >= achievement.condition.value;
              break;
            case 'time':
              shouldUnlock = stats.totalStudyMinutes >= achievement.condition.value;
              break;
            case 'quest':
              shouldUnlock = stats.totalQuestsCompleted >= achievement.condition.value;
              break;
          }
          
          if (shouldUnlock) {
            unlockAchievement(achievement.id);
            // Reward for achievement
            const lootType = achievement.rarity === 'legendary' ? 'legendary' :
                            achievement.rarity === 'epic' ? 'epic' :
                            achievement.rarity === 'rare' ? 'rare' : 'common';
            addLootBox(lootType);
          }
        });
      },
      
      // Loot Box Methods
      addLootBox: (type) => set((state) => {
        const contents: LootBox['contents'] = {};
        const boosts = get().getActiveBoosts();
        
        switch (type) {
          case 'common':
            contents.xp = Math.floor((Math.random() * 50 + 25) * boosts.xpMultiplier);
            contents.coins = Math.floor((Math.random() * 20 + 10) * boosts.coinMultiplier);
            break;
          case 'rare':
            contents.xp = Math.floor((Math.random() * 100 + 50) * boosts.xpMultiplier);
            contents.coins = Math.floor((Math.random() * 50 + 25) * boosts.coinMultiplier);
            contents.researchPoints = Math.floor(Math.random() * 20 + 10);
            break;
          case 'epic':
            contents.xp = Math.floor((Math.random() * 200 + 100) * boosts.xpMultiplier);
            contents.coins = Math.floor((Math.random() * 100 + 50) * boosts.coinMultiplier);
            contents.researchPoints = Math.floor(Math.random() * 50 + 25);
            break;
          case 'legendary':
            contents.xp = Math.floor((Math.random() * 500 + 250) * boosts.xpMultiplier);
            contents.coins = Math.floor((Math.random() * 200 + 100) * boosts.coinMultiplier);
            contents.researchPoints = Math.floor(Math.random() * 100 + 50);
            break;
        }
        
        return {
          lootBoxes: [...state.lootBoxes, {
            id: uuidv4(),
            type,
            contents,
          }]
        };
      }),
      
      openLootBox: (id) => {
        const { lootBoxes, addXp } = get();
        const box = lootBoxes.find((b) => b.id === id && !b.openedAt);
        if (!box) return null;
        
        set((state) => ({
          lootBoxes: state.lootBoxes.map((b) =>
            b.id === id ? { ...b, openedAt: Date.now() } : b
          ),
          stats: {
            ...state.stats,
            coins: state.stats.coins + (box.contents.coins || 0),
            researchPoints: state.stats.researchPoints + (box.contents.researchPoints || 0),
          }
        }));
        
        if (box.contents.xp) {
          addXp(box.contents.xp);
        }
        
        return box.contents;
      },
      
      // Skill Tree Methods
      unlockSkill: (id) => {
        const { skillNodes, spendResearchPoints } = get();
        const skill = skillNodes.find((s) => s.id === id);
        
        if (!skill || skill.unlocked) return false;
        
        // Check requirements
        if (skill.requires) {
          const allUnlocked = skill.requires.every((reqId) =>
            skillNodes.find((s) => s.id === reqId)?.unlocked
          );
          if (!allUnlocked) return false;
        }
        
        if (!spendResearchPoints(skill.cost)) return false;
        
        set((state) => ({
          skillNodes: state.skillNodes.map((s) =>
            s.id === id ? { ...s, unlocked: true } : s
          )
        }));
        
        return true;
      },
      
      // Chemistry Card Methods with SM-2 Algorithm
      addChemistryCard: (card) => set((state) => ({
        chemistryCards: [...state.chemistryCards, {
          ...card,
          id: uuidv4(),
          timesReviewed: 0,
          mastery: 0,
          easeFactor: 2.5, // Default SM-2 ease factor
          interval: 1, // Days
        }]
      })),
      
      // SM-2 Algorithm implementation
      // Quality: 0 = complete blackout, 1 = incorrect, 2 = incorrect but remembered, 
      // 3 = correct with difficulty, 4 = correct, 5 = perfect
      updateCardMastery: (id, quality) => set((state) => ({
        chemistryCards: state.chemistryCards.map((c) => {
          if (c.id !== id) return c;
          
          let { easeFactor, interval, mastery } = c;
          
          // SM-2 Algorithm
          if (quality < 3) {
            // Failed review - reset interval
            interval = 1;
            mastery = Math.max(0, mastery - 15);
          } else {
            // Successful review
            if (c.timesReviewed === 0) {
              interval = 1;
            } else if (c.timesReviewed === 1) {
              interval = 6;
            } else {
              interval = Math.round(interval * easeFactor);
            }
            
            // Update ease factor
            easeFactor = easeFactor + (0.1 - (5 - quality) * (0.08 + (5 - quality) * 0.02));
            easeFactor = Math.max(1.3, easeFactor); // Minimum ease factor
            
            // Update mastery based on quality
            const masteryGain = quality === 5 ? 15 : quality === 4 ? 10 : 5;
            mastery = Math.min(100, mastery + masteryGain);
          }
          
          const nextReview = Date.now() + interval * 24 * 60 * 60 * 1000;
          
          return {
            ...c,
            mastery,
            easeFactor,
            interval,
            timesReviewed: c.timesReviewed + 1,
            lastReviewed: Date.now(),
            nextReview,
          };
        })
      })),
      
      deleteChemistryCard: (id) => set((state) => ({
        chemistryCards: state.chemistryCards.filter((c) => c.id !== id)
      })),
      
      getCardsForReview: () => {
        const { chemistryCards } = get();
        const now = Date.now();
        return chemistryCards.filter(card => 
          !card.nextReview || card.nextReview <= now
        ).sort((a, b) => (a.nextReview || 0) - (b.nextReview || 0));
      },
      
      // Daily Data Methods
      recordDailyActivity: (minutes, subjectId, xp) => set((state) => {
        const today = new Date().toISOString().split('T')[0];
        const existingIndex = state.dailyData.findIndex((d) => d.date === today);
        
        if (existingIndex >= 0) {
          const existing = state.dailyData[existingIndex];
          const updatedData = [...state.dailyData];
          updatedData[existingIndex] = {
            ...existing,
            totalMinutes: existing.totalMinutes + minutes,
            sessions: existing.sessions + 1,
            xpEarned: existing.xpEarned + xp,
            subjectBreakdown: {
              ...existing.subjectBreakdown,
              [subjectId]: (existing.subjectBreakdown[subjectId] || 0) + minutes,
            },
          };
          return { dailyData: updatedData };
        }
        
        return {
          dailyData: [...state.dailyData, {
            date: today,
            totalMinutes: minutes,
            sessions: 1,
            xpEarned: xp,
            subjectBreakdown: { [subjectId]: minutes },
          }]
        };
      }),
      
      // Pomodoro Settings
      updatePomodoroSettings: (settings) => set((state) => ({
        pomodoroSettings: { ...state.pomodoroSettings, ...settings }
      })),
      
      // Cosmetics
      unlockCosmetic: (id) => set((state) => ({
        unlockedCosmetics: [...state.unlockedCosmetics, id]
      })),
      
      selectCosmetic: (category, id) => set((state) => ({
        selectedCosmetics: { ...state.selectedCosmetics, [category]: id }
      })),
      
      // Daily Reset & Initialization
      initializeDay: () => {
        const { stats, getActiveBoosts, generateDailyQuests, generateWeeklyQuests, generateBossQuest, quests } = get();
        const today = new Date().toDateString();
        
        // Skip if already initialized today
        if (stats.lastInitDate === today) return;
        
        const boosts = getActiveBoosts();
        
        // Recover focus energy (with skill boost)
        const baseRecovery = 30;
        const recoveryAmount = Math.round(baseRecovery * boosts.focusRecoveryMultiplier);
        const newFocusEnergy = Math.min(stats.maxFocusEnergy, stats.focusEnergy + recoveryAmount);
        
        // Reduce burnout overnight
        const burnoutReduction = 20;
        const newBurnout = Math.max(0, stats.burnoutMeter - burnoutReduction);
        
        // Check streak - if missed yesterday, reset
        let newStreak = stats.currentStreak;
        if (stats.lastStudyDate) {
          const yesterday = new Date();
          yesterday.setDate(yesterday.getDate() - 1);
          const lastStudy = new Date(stats.lastStudyDate);
          
          // If last study was before yesterday, streak is broken
          if (lastStudy < yesterday && stats.lastStudyDate !== yesterday.toDateString()) {
            newStreak = 0;
          }
        }
        
        // Clean up expired quests
        const activeQuests = quests.filter(q => 
          !q.expiresAt || q.expiresAt > Date.now() || q.completed
        );
        
        set({
          stats: {
            ...stats,
            focusEnergy: newFocusEnergy,
            burnoutMeter: newBurnout,
            currentStreak: newStreak,
            lastInitDate: today,
          },
          quests: activeQuests,
        });
        
        // Generate new quests
        generateDailyQuests();
        generateWeeklyQuests();
        generateBossQuest();
      },
      
      updateCreatorProfile: (updates) => set(state => ({
        creatorProfile: { ...state.creatorProfile, ...updates }
      })),
      
      // Data Management
      exportData: () => {
        const state = get();
        return JSON.stringify({
          stats: state.stats,
          character: state.character,
          subjects: state.subjects,
          sessions: state.sessions,
          quests: state.quests,
          notes: state.notes,
          achievements: state.achievements,
          lootBoxes: state.lootBoxes,
          skillNodes: state.skillNodes,
          chemistryCards: state.chemistryCards,
          dailyData: state.dailyData,
          pomodoroSettings: state.pomodoroSettings,
          unlockedCosmetics: state.unlockedCosmetics,
          selectedCosmetics: state.selectedCosmetics,
          exportedAt: Date.now(),
          version: 2, // Version tracking for future migrations
        }, null, 2);
      },
      
      importData: (data) => {
        try {
          const parsed = JSON.parse(data);
          set({
            stats: { ...initialStats, ...parsed.stats, totalQuestsCompleted: parsed.stats?.totalQuestsCompleted || 0 },
            character: parsed.character || { theme: 'chemist', level: 1, title: 'Lab Intern' },
            subjects: parsed.subjects || [],
            sessions: parsed.sessions || [],
            quests: parsed.quests || [],
            notes: parsed.notes || [],
            achievements: parsed.achievements || DEFAULT_ACHIEVEMENTS,
            lootBoxes: parsed.lootBoxes || [],
            skillNodes: parsed.skillNodes || DEFAULT_SKILL_NODES,
            chemistryCards: (parsed.chemistryCards || []).map((c: ChemistryCard) => ({
              ...c,
              easeFactor: c.easeFactor || 2.5,
              interval: c.interval || 1,
            })),
            dailyData: parsed.dailyData || [],
            pomodoroSettings: parsed.pomodoroSettings || initialPomodoroSettings,
            unlockedCosmetics: parsed.unlockedCosmetics || ['default-badge', 'default-border'],
            selectedCosmetics: parsed.selectedCosmetics || { badge: 'default-badge', border: 'default-border' },
          });
          return true;
        } catch {
          return false;
        }
      },
      
      resetAllData: () => set({
        stats: initialStats,
        character: { theme: 'chemist', level: 1, title: 'Lab Intern' },
        subjects: [
          { id: 'chem-org', name: 'Organic Chemistry', icon: '🧪', color: '#00d4aa', weightage: 30, priority: 'critical', difficulty: 4, totalMinutes: 0, createdAt: Date.now() },
          { id: 'chem-inorg', name: 'Inorganic Chemistry', icon: '⚗️', color: '#00a8e8', weightage: 25, priority: 'high', difficulty: 3, totalMinutes: 0, createdAt: Date.now() },
          { id: 'chem-phys', name: 'Physical Chemistry', icon: '📊', color: '#9d4edd', weightage: 25, priority: 'high', difficulty: 4, totalMinutes: 0, createdAt: Date.now() },
          { id: 'chem-anal', name: 'Analytical Chemistry', icon: '🔬', color: '#ff6b6b', weightage: 20, priority: 'medium', difficulty: 3, totalMinutes: 0, createdAt: Date.now() },
        ],
        sessions: [],
        quests: [],
        notes: [],
        achievements: DEFAULT_ACHIEVEMENTS,
        lootBoxes: [],
        skillNodes: DEFAULT_SKILL_NODES,
        chemistryCards: [],
        dailyData: [],
        pomodoroSettings: initialPomodoroSettings,
        unlockedCosmetics: ['default-badge', 'default-border'],
        selectedCosmetics: { badge: 'default-badge', border: 'default-border' },
      }),
    }),
    {
      name: 'catalyst-os-storage',
      storage: createJSONStorage(() => localStorage),
    }
  )
);
