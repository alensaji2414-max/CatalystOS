'use client';

import { useStudyStore, CharacterTheme } from '@/lib/study-store';
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card';
import { Button } from '@/components/ui/button';
import { Progress } from '@/components/ui/progress';
import { Badge } from '@/components/ui/badge';
import { Tabs, TabsContent, TabsList, TabsTrigger } from '@/components/ui/tabs';
import { 
  Zap, 
  Flame, 
  Brain, 
  Target, 
  TrendingUp, 
  Award,
  Beaker,
  Atom,
  Sword,
  Star,
  Crown
} from 'lucide-react';

const LEVEL_THRESHOLDS = [
  0, 100, 250, 450, 700, 1000, 1400, 1900, 2500, 3200,
  4000, 5000, 6200, 7600, 9200, 11000, 13000, 15500, 18500, 22000,
  26000, 30500, 35500, 41000, 47000, 54000, 62000, 71000, 81000, 92000,
  104000, 118000, 134000, 152000, 172000, 195000, 221000, 250000, 283000, 320000,
  362000, 410000, 465000, 527000, 598000, 678000, 769000, 872000, 989000, 1121000
];

const THEME_INFO: Record<CharacterTheme, { icon: React.ReactNode; name: string; description: string; titles: string[] }> = {
  chemist: {
    icon: <Beaker className="w-6 h-6" />,
    name: 'Chemist Evolution',
    description: 'Evolve from a student to a Nobel-tier researcher',
    titles: ['Student', 'Research Assistant', 'Lab Scholar', 'Scientist', 'Principal Investigator', 'Nobel-tier Researcher']
  },
  molecular: {
    icon: <Atom className="w-6 h-6" />,
    name: 'Molecular Evolution',
    description: 'Transform from an atom to a quantum entity',
    titles: ['Atom', 'Molecule', 'Compound', 'Catalyst', 'Reaction Network', 'Quantum Entity']
  },
  hero: {
    icon: <Sword className="w-6 h-6" />,
    name: 'Hero Progression',
    description: 'Rise from novice to transcendent legend',
    titles: ['Novice', 'Scholar', 'Strategist', 'Master', 'Legend', 'Transcendent']
  }
};

const getProgressToNextLevel = (totalXp: number, level: number): number => {
  if (level >= LEVEL_THRESHOLDS.length) return 100;
  const currentThreshold = LEVEL_THRESHOLDS[level - 1];
  const nextThreshold = LEVEL_THRESHOLDS[level] || LEVEL_THRESHOLDS[LEVEL_THRESHOLDS.length - 1];
  const progress = ((totalXp - currentThreshold) / (nextThreshold - currentThreshold)) * 100;
  return Math.min(Math.max(progress, 0), 100);
};

const getXpToNextLevel = (totalXp: number, level: number): number => {
  if (level >= LEVEL_THRESHOLDS.length) return 0;
  const nextThreshold = LEVEL_THRESHOLDS[level] || LEVEL_THRESHOLDS[LEVEL_THRESHOLDS.length - 1];
  return nextThreshold - totalXp;
};

export function CharacterSystem() {
  const { stats, character, setCharacterTheme } = useStudyStore();
  
  const progress = getProgressToNextLevel(stats.totalXp, stats.level);
  const xpToNext = getXpToNextLevel(stats.totalXp, stats.level);
  const currentTheme = THEME_INFO[character.theme];
  const tierIndex = Math.min(Math.floor(stats.level / 10), currentTheme.titles.length - 1);

  const renderCharacterVisual = () => {
    const size = 120 + stats.level * 2;
    const glowIntensity = Math.min(stats.level / 50, 1);
    
    return (
      <div 
        className="relative flex items-center justify-center"
        style={{ width: size, height: size }}
      >
        {/* Outer glow rings */}
        {[...Array(3)].map((_, i) => (
          <div
            key={i}
            className="absolute rounded-full animate-pulse"
            style={{
              width: size - i * 15,
              height: size - i * 15,
              background: `radial-gradient(circle, transparent 50%, ${
                character.theme === 'chemist' ? 'rgba(0, 212, 170,' :
                character.theme === 'molecular' ? 'rgba(0, 168, 232,' :
                'rgba(157, 78, 221,'
              } ${0.1 * (3 - i) * glowIntensity}))`,
              animationDelay: `${i * 0.3}s`,
            }}
          />
        ))}
        
        {/* Core character */}
        <div
          className={`relative z-10 rounded-full flex items-center justify-center transition-all duration-500 ${
            character.theme === 'chemist' ? 'neon-glow-cyan' :
            character.theme === 'molecular' ? 'neon-glow-green' :
            'neon-glow-purple'
          }`}
          style={{
            width: size * 0.6,
            height: size * 0.6,
            background: `linear-gradient(135deg, ${
              character.theme === 'chemist' ? '#0a3d3d, #00d4aa' :
              character.theme === 'molecular' ? '#0a2d3d, #00a8e8' :
              '#2d0a3d, #9d4edd'
            })`,
          }}
        >
          <div className="text-4xl">
            {character.theme === 'chemist' ? '⚗️' :
             character.theme === 'molecular' ? '⚛️' :
             '⚔️'}
          </div>
        </div>
        
        {/* Orbiting elements for higher levels */}
        {stats.level >= 5 && (
          <>
            {[...Array(Math.min(Math.floor(stats.level / 5), 6))].map((_, i) => (
              <div
                key={i}
                className="absolute rounded-full bg-primary/60"
                style={{
                  width: 8,
                  height: 8,
                  animation: `orbit ${3 + i}s linear infinite`,
                  transformOrigin: `${size / 2}px center`,
                }}
              />
            ))}
          </>
        )}
        
        {/* Level badge */}
        <div className="absolute -bottom-2 -right-2 bg-card border-2 border-primary rounded-full w-10 h-10 flex items-center justify-center">
          <span className="font-bold text-primary">{stats.level}</span>
        </div>
      </div>
    );
  };

  return (
    <div className="space-y-6">
      {/* Main Character Card */}
      <Card className="gradient-border overflow-hidden">
        <CardContent className="p-8">
          <div className="flex flex-col md:flex-row items-center gap-8">
            {/* Character Visual */}
            <div className="flex-shrink-0">
              {renderCharacterVisual()}
            </div>
            
            {/* Character Info */}
            <div className="flex-grow space-y-4 text-center md:text-left">
              <div>
                <Badge variant="outline" className="mb-2">
                  {currentTheme.icon}
                  <span className="ml-2">{currentTheme.name}</span>
                </Badge>
                <h2 className="text-3xl font-bold neon-text-cyan">{character.title}</h2>
                <p className="text-muted-foreground">Level {stats.level}</p>
              </div>
              
              {/* XP Progress */}
              <div className="space-y-2">
                <div className="flex justify-between text-sm">
                  <span className="text-muted-foreground">Experience</span>
                  <span className="font-mono">{stats.totalXp.toLocaleString()} XP</span>
                </div>
                <div className="relative">
                  <Progress value={progress} className="h-4 progress-glow" />
                  <span className="absolute inset-0 flex items-center justify-center text-xs font-medium">
                    {Math.round(progress)}% to Level {stats.level + 1}
                  </span>
                </div>
                <p className="text-xs text-muted-foreground text-right">
                  {xpToNext.toLocaleString()} XP to next level
                </p>
              </div>

              {/* Tier Progress */}
              <div className="flex items-center gap-2 flex-wrap">
                {currentTheme.titles.map((title, i) => (
                  <div
                    key={title}
                    className={`flex items-center gap-1 px-2 py-1 rounded text-xs ${
                      i <= tierIndex 
                        ? 'bg-primary/20 text-primary border border-primary/50' 
                        : 'bg-muted/50 text-muted-foreground'
                    }`}
                  >
                    {i <= tierIndex && <Star className="w-3 h-3" />}
                    <span>{title}</span>
                  </div>
                ))}
              </div>
            </div>
          </div>
        </CardContent>
      </Card>

      {/* Theme Selector */}
      <Card>
        <CardHeader>
          <CardTitle className="flex items-center gap-2">
            <Crown className="w-5 h-5" />
            Choose Your Path
          </CardTitle>
        </CardHeader>
        <CardContent>
          <Tabs value={character.theme} onValueChange={(v) => setCharacterTheme(v as CharacterTheme)}>
            <TabsList className="grid grid-cols-3 w-full">
              {(Object.keys(THEME_INFO) as CharacterTheme[]).map((theme) => (
                <TabsTrigger key={theme} value={theme} className="flex items-center gap-2">
                  {THEME_INFO[theme].icon}
                  <span className="hidden sm:inline">{THEME_INFO[theme].name.split(' ')[0]}</span>
                </TabsTrigger>
              ))}
            </TabsList>
            {(Object.keys(THEME_INFO) as CharacterTheme[]).map((theme) => (
              <TabsContent key={theme} value={theme} className="mt-4">
                <div className="space-y-4">
                  <p className="text-muted-foreground">{THEME_INFO[theme].description}</p>
                  <div className="flex flex-wrap gap-2">
                    {THEME_INFO[theme].titles.map((title, i) => (
                      <div
                        key={title}
                        className="flex items-center gap-1 px-3 py-1.5 rounded-full text-sm bg-muted/50"
                      >
                        <span className="text-xs text-muted-foreground">Lv.{i * 10 + 1}+</span>
                        <span>{title}</span>
                      </div>
                    ))}
                  </div>
                </div>
              </TabsContent>
            ))}
          </Tabs>
        </CardContent>
      </Card>

      {/* Stats Grid */}
      <div className="grid grid-cols-2 md:grid-cols-4 gap-4">
        <StatCard
          icon={<Zap className="w-5 h-5 text-neon-cyan" />}
          label="Focus Energy"
          value={stats.focusEnergy}
          max={stats.maxFocusEnergy}
          color="cyan"
        />
        <StatCard
          icon={<Flame className="w-5 h-5 text-neon-orange" />}
          label="Burnout"
          value={stats.burnoutMeter}
          max={100}
          color="orange"
          inverted
        />
        <StatCard
          icon={<Target className="w-5 h-5 text-neon-green" />}
          label="Consistency"
          value={stats.consistencyScore}
          max={100}
          color="green"
        />
        <StatCard
          icon={<TrendingUp className="w-5 h-5 text-neon-purple" />}
          label="Momentum"
          value={stats.weeklyMomentum}
          max={100}
          color="purple"
        />
      </div>

      {/* Detailed Stats */}
      <Card>
        <CardHeader>
          <CardTitle className="flex items-center gap-2">
            <Award className="w-5 h-5" />
            Detailed Statistics
          </CardTitle>
        </CardHeader>
        <CardContent>
          <div className="grid grid-cols-2 md:grid-cols-4 gap-6">
            <DetailStat icon="🔥" label="Current Streak" value={`${stats.currentStreak} days`} />
            <DetailStat icon="🏆" label="Longest Streak" value={`${stats.longestStreak} days`} />
            <DetailStat icon="⏱️" label="Total Study Time" value={`${Math.floor(stats.totalStudyMinutes / 60)}h ${stats.totalStudyMinutes % 60}m`} />
            <DetailStat icon="📚" label="Total Sessions" value={stats.totalSessions.toString()} />
            <DetailStat icon="💰" label="Coins" value={stats.coins.toLocaleString()} />
            <DetailStat icon="🔬" label="Research Points" value={stats.researchPoints.toLocaleString()} />
            <DetailStat icon="🎯" label="Accuracy Score" value={`${stats.accuracyScore}%`} />
            <DetailStat icon="📖" label="Knowledge Mastery" value={`${stats.knowledgeMastery}%`} />
          </div>
        </CardContent>
      </Card>

      <style jsx>{`
        @keyframes orbit {
          from { transform: rotate(0deg) translateX(50px) rotate(0deg); }
          to { transform: rotate(360deg) translateX(50px) rotate(-360deg); }
        }
      `}</style>
    </div>
  );
}

function StatCard({ 
  icon, 
  label, 
  value, 
  max, 
  color, 
  inverted = false 
}: { 
  icon: React.ReactNode; 
  label: string; 
  value: number; 
  max: number; 
  color: string;
  inverted?: boolean;
}) {
  const percentage = (value / max) * 100;
  const displayPercentage = inverted ? 100 - percentage : percentage;
  
  return (
    <Card className="card-hover">
      <CardContent className="p-4">
        <div className="flex items-center gap-2 mb-2">
          {icon}
          <span className="text-sm text-muted-foreground">{label}</span>
        </div>
        <div className="flex items-end justify-between">
          <span className="text-2xl font-bold">{value}</span>
          <span className="text-xs text-muted-foreground">/{max}</span>
        </div>
        <div className="mt-2 h-1.5 bg-muted rounded-full overflow-hidden">
          <div 
            className={`h-full rounded-full transition-all duration-500 ${
              inverted 
                ? percentage > 70 ? 'bg-red-500' : percentage > 40 ? 'bg-yellow-500' : 'bg-green-500'
                : `bg-neon-${color}`
            }`}
            style={{ width: `${percentage}%` }}
          />
        </div>
      </CardContent>
    </Card>
  );
}

function DetailStat({ icon, label, value }: { icon: string; label: string; value: string }) {
  return (
    <div className="flex items-center gap-3">
      <span className="text-2xl">{icon}</span>
      <div>
        <p className="text-sm text-muted-foreground">{label}</p>
        <p className="font-semibold">{value}</p>
      </div>
    </div>
  );
}
