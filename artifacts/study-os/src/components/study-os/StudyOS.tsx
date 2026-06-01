
import { useState, useEffect } from "react";
import { motion, AnimatePresence } from "framer-motion";
import { useStudyStore } from "@/lib/study-store";
import { Navigation } from "./Navigation";
import { Dashboard } from "./Dashboard";
import { PomodoroTimer } from "./PomodoroTimer";
import { SubjectManager } from "./SubjectManager";
import { QuestSystem } from "./QuestSystem";
import { NotesSystem } from "./NotesSystem";
import { Analytics } from "./Analytics";
import { Achievements } from "./Achievements";
import { ChemistryTools } from "./ChemistryTools";
import { Settings } from "./Settings";
import { CharacterSystem } from "./CharacterSystem";
import { ParticleBackground } from "./ParticleBackground";
import { CelebrationOverlay } from "./CelebrationOverlay";

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

export function StudyOS() {
  const [currentView, setCurrentView] = useState<View>("dashboard");
  const [mounted, setMounted] = useState(false);
  const [mobileNavOpen, setMobileNavOpen] = useState(false);
  const { generateDailyQuests, checkAchievements, initializeDay, stats, celebrationEvent, clearCelebration } = useStudyStore();

  useEffect(() => {
    initializeDay();
    generateDailyQuests();
    checkAchievements();
    setMounted(true);
  }, [initializeDay, generateDailyQuests, checkAchievements]);

  // Keyboard shortcuts
  useEffect(() => {
    const handleKeyDown = (e: KeyboardEvent) => {
      if (e.target instanceof HTMLInputElement || e.target instanceof HTMLTextAreaElement) {
        return;
      }

      const keyMap: Record<string, View> = {
        "1": "dashboard",
        "2": "pomodoro",
        "3": "subjects",
        "4": "quests",
        "5": "notes",
        "6": "analytics",
        "7": "achievements",
        "8": "character",
      };

      if (keyMap[e.key]) {
        setCurrentView(keyMap[e.key]);
        setMobileNavOpen(false);
      }
      
      // ESC to close mobile nav
      if (e.key === "Escape") {
        setMobileNavOpen(false);
      }
    };

    window.addEventListener("keydown", handleKeyDown);
    return () => window.removeEventListener("keydown", handleKeyDown);
  }, []);

  // Close mobile nav when view changes
  useEffect(() => {
    setMobileNavOpen(false);
  }, [currentView]);

  if (!mounted) {
    return (
      <div className="flex h-screen items-center justify-center bg-background">
        <motion.div 
          className="flex flex-col items-center gap-6"
          initial={{ opacity: 0, scale: 0.9 }}
          animate={{ opacity: 1, scale: 1 }}
          transition={{ duration: 0.5 }}
        >
          {/* Animated loading molecules */}
          <div className="relative w-24 h-24">
            <motion.div
              className="absolute inset-0 rounded-full border-4 border-primary/30"
              animate={{ rotate: 360 }}
              transition={{ duration: 3, repeat: Infinity, ease: "linear" }}
            />
            <motion.div
              className="absolute inset-2 rounded-full border-4 border-t-primary border-r-transparent border-b-transparent border-l-transparent"
              animate={{ rotate: -360 }}
              transition={{ duration: 2, repeat: Infinity, ease: "linear" }}
            />
            <motion.div
              className="absolute inset-4 rounded-full border-4 border-t-transparent border-r-primary border-b-transparent border-l-transparent"
              animate={{ rotate: 360 }}
              transition={{ duration: 1.5, repeat: Infinity, ease: "linear" }}
            />
            <motion.div
              className="absolute inset-0 flex items-center justify-center"
              animate={{ scale: [1, 1.1, 1] }}
              transition={{ duration: 2, repeat: Infinity }}
            >
              <span className="text-3xl">⚗️</span>
            </motion.div>
          </div>
          <motion.div
            className="text-center"
            initial={{ opacity: 0, y: 10 }}
            animate={{ opacity: 1, y: 0 }}
            transition={{ delay: 0.3 }}
          >
            <p className="text-lg font-medium text-foreground">Initializing CatalystOS...</p>
            <p className="text-sm text-muted-foreground mt-1">Preparing your research station</p>
          </motion.div>
          {/* Loading progress dots */}
          <div className="flex gap-2">
            {[0, 1, 2].map((i) => (
              <motion.div
                key={i}
                className="w-2 h-2 rounded-full bg-primary"
                animate={{ opacity: [0.3, 1, 0.3], scale: [0.8, 1.2, 0.8] }}
                transition={{ duration: 1, repeat: Infinity, delay: i * 0.2 }}
              />
            ))}
          </div>
        </motion.div>
      </div>
    );
  }

  const renderView = () => {
    const viewComponents: Record<View, React.ReactNode> = {
      dashboard: <Dashboard onNavigate={(view) => setCurrentView(view as View)} />,
      pomodoro: <PomodoroTimer />,
      subjects: <SubjectManager />,
      quests: <QuestSystem />,
      notes: <NotesSystem />,
      analytics: <Analytics />,
      achievements: <Achievements />,
      chemistry: <ChemistryTools />,
      settings: <Settings />,
      character: <CharacterSystem />,
    };
    
    return viewComponents[currentView] || viewComponents.dashboard;
  };

  return (
    <div className="min-h-screen bg-background">
      <ParticleBackground />
      
      {/* Celebration overlay for level ups, achievements, etc. */}
      <AnimatePresence>
        {celebrationEvent && (
          <CelebrationOverlay 
            event={celebrationEvent} 
            onComplete={clearCelebration}
          />
        )}
      </AnimatePresence>
      
      {/* Mobile nav backdrop */}
      <AnimatePresence>
        {mobileNavOpen && (
          <motion.div
            className="fixed inset-0 bg-black/60 backdrop-blur-sm z-40 lg:hidden"
            initial={{ opacity: 0 }}
            animate={{ opacity: 1 }}
            exit={{ opacity: 0 }}
            onClick={() => setMobileNavOpen(false)}
          />
        )}
      </AnimatePresence>
      
      <Navigation 
        currentView={currentView} 
        onViewChange={setCurrentView}
        mobileOpen={mobileNavOpen}
        onMobileToggle={() => setMobileNavOpen(!mobileNavOpen)}
      />
      
      {/* Main content with responsive margin */}
      <main className="relative z-[1] min-h-screen lg:ml-64 transition-all duration-300">
        <div className="p-4 sm:p-6">
          {/* Mobile header */}
          <div className="lg:hidden mb-4 flex items-center justify-between">
            <button
              onClick={() => setMobileNavOpen(true)}
              className="p-2 rounded-lg bg-card border border-border hover:bg-accent transition-colors"
            >
              <svg className="w-6 h-6" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M4 6h16M4 12h16M4 18h16" />
              </svg>
            </button>
            <div className="flex items-center gap-2">
              <span className="text-sm font-medium">Lv.{stats.level}</span>
              <div className="w-20 h-2 bg-muted rounded-full overflow-hidden">
                <motion.div 
                  className="h-full bg-primary"
                  initial={{ width: 0 }}
                  animate={{ width: `${((stats.totalXp % 1000) / 1000) * 100}%` }}
                />
              </div>
            </div>
          </div>
          
          <div className="mx-auto max-w-7xl">
            <AnimatePresence mode="wait">
              <motion.div
                key={currentView}
                initial={{ opacity: 0, y: 20 }}
                animate={{ opacity: 1, y: 0 }}
                exit={{ opacity: 0, y: -20 }}
                transition={{ duration: 0.3, ease: "easeOut" }}
              >
                {renderView()}
              </motion.div>
            </AnimatePresence>
          </div>
        </div>
      </main>
    </div>
  );
}
