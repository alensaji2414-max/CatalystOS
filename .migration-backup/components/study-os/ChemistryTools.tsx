'use client';

import { useState, useMemo, useCallback } from 'react';
import { useStudyStore, ChemistryCard } from '@/lib/study-store';
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card';
import { Button } from '@/components/ui/button';
import { Input } from '@/components/ui/input';
import { Label } from '@/components/ui/label';
import { Textarea } from '@/components/ui/textarea';
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from '@/components/ui/select';
import { Badge } from '@/components/ui/badge';
import { Progress } from '@/components/ui/progress';
import { Slider } from '@/components/ui/slider';
import { Dialog, DialogContent, DialogHeader, DialogTitle, DialogTrigger, DialogFooter, DialogClose } from '@/components/ui/dialog';
import { Tabs, TabsContent, TabsList, TabsTrigger } from '@/components/ui/tabs';
import { 
  Beaker, 
  Plus, 
  FlipHorizontal,
  Trash2,
  FlaskConical,
  Atom,
  Microscope,
  Calculator,
  BookOpen,
  Brain,
  ArrowRight,
  Check,
  X,
  Sparkles,
  RefreshCw,
  Trophy,
  Zap
} from 'lucide-react';

const CARD_TYPES: { value: ChemistryCard['type']; label: string; icon: React.ReactNode }[] = [
  { value: 'reaction', label: 'Reaction', icon: <FlaskConical className="w-4 h-4" /> },
  { value: 'formula', label: 'Formula', icon: <Atom className="w-4 h-4" /> },
  { value: 'mechanism', label: 'Mechanism', icon: <Microscope className="w-4 h-4" /> },
  { value: 'equation', label: 'Equation', icon: <Calculator className="w-4 h-4" /> },
];

const PRESET_REACTIONS = [
  { front: 'CH3OH + HBr -> ?', back: 'CH3Br + H2O (Nucleophilic substitution)' },
  { front: 'C2H4 + H2 -> ?', back: 'C2H6 (Hydrogenation)' },
  { front: 'CH3COOH + NaOH -> ?', back: 'CH3COONa + H2O (Neutralization)' },
  { front: 'C6H6 + Br2 (FeBr3) -> ?', back: 'C6H5Br + HBr (Electrophilic aromatic substitution)' },
  { front: '2Na + 2H2O -> ?', back: '2NaOH + H2 (Single displacement)' },
];

const PRESET_FORMULAS = [
  { front: 'Ideal Gas Law', back: 'PV = nRT' },
  { front: 'Henderson-Hasselbalch', back: 'pH = pKa + log([A-]/[HA])' },
  { front: 'Gibbs Free Energy', back: 'dG = dH - TdS' },
  { front: 'Arrhenius Equation', back: 'k = Ae^(-Ea/RT)' },
  { front: 'Beer-Lambert Law', back: 'A = elc' },
];

const UNIT_CONVERSIONS = [
  { name: 'Temperature', conversions: ['C to K: K = C + 273.15', 'F to C: C = (F - 32) x 5/9'] },
  { name: 'Pressure', conversions: ['1 atm = 101.325 kPa', '1 atm = 760 mmHg', '1 bar = 100 kPa'] },
  { name: 'Energy', conversions: ['1 cal = 4.184 J', '1 eV = 1.602 x 10^-19 J', '1 kJ/mol = 0.239 kcal/mol'] },
  { name: 'Mass', conversions: ['1 amu = 1.661 x 10^-27 kg', '1 mol = 6.022 x 10^23 particles'] },
];

// Periodic Table Data
const PERIODIC_TABLE: ElementData[] = [
  // Period 1
  { symbol: 'H', name: 'Hydrogen', number: 1, mass: 1.008, category: 'nonmetal', row: 1, col: 1 },
  { symbol: 'He', name: 'Helium', number: 2, mass: 4.003, category: 'noble-gas', row: 1, col: 18 },
  // Period 2
  { symbol: 'Li', name: 'Lithium', number: 3, mass: 6.941, category: 'alkali', row: 2, col: 1 },
  { symbol: 'Be', name: 'Beryllium', number: 4, mass: 9.012, category: 'alkaline', row: 2, col: 2 },
  { symbol: 'B', name: 'Boron', number: 5, mass: 10.81, category: 'metalloid', row: 2, col: 13 },
  { symbol: 'C', name: 'Carbon', number: 6, mass: 12.01, category: 'nonmetal', row: 2, col: 14 },
  { symbol: 'N', name: 'Nitrogen', number: 7, mass: 14.01, category: 'nonmetal', row: 2, col: 15 },
  { symbol: 'O', name: 'Oxygen', number: 8, mass: 16.00, category: 'nonmetal', row: 2, col: 16 },
  { symbol: 'F', name: 'Fluorine', number: 9, mass: 19.00, category: 'halogen', row: 2, col: 17 },
  { symbol: 'Ne', name: 'Neon', number: 10, mass: 20.18, category: 'noble-gas', row: 2, col: 18 },
  // Period 3
  { symbol: 'Na', name: 'Sodium', number: 11, mass: 22.99, category: 'alkali', row: 3, col: 1 },
  { symbol: 'Mg', name: 'Magnesium', number: 12, mass: 24.31, category: 'alkaline', row: 3, col: 2 },
  { symbol: 'Al', name: 'Aluminum', number: 13, mass: 26.98, category: 'post-transition', row: 3, col: 13 },
  { symbol: 'Si', name: 'Silicon', number: 14, mass: 28.09, category: 'metalloid', row: 3, col: 14 },
  { symbol: 'P', name: 'Phosphorus', number: 15, mass: 30.97, category: 'nonmetal', row: 3, col: 15 },
  { symbol: 'S', name: 'Sulfur', number: 16, mass: 32.07, category: 'nonmetal', row: 3, col: 16 },
  { symbol: 'Cl', name: 'Chlorine', number: 17, mass: 35.45, category: 'halogen', row: 3, col: 17 },
  { symbol: 'Ar', name: 'Argon', number: 18, mass: 39.95, category: 'noble-gas', row: 3, col: 18 },
  // Period 4
  { symbol: 'K', name: 'Potassium', number: 19, mass: 39.10, category: 'alkali', row: 4, col: 1 },
  { symbol: 'Ca', name: 'Calcium', number: 20, mass: 40.08, category: 'alkaline', row: 4, col: 2 },
  { symbol: 'Sc', name: 'Scandium', number: 21, mass: 44.96, category: 'transition', row: 4, col: 3 },
  { symbol: 'Ti', name: 'Titanium', number: 22, mass: 47.87, category: 'transition', row: 4, col: 4 },
  { symbol: 'V', name: 'Vanadium', number: 23, mass: 50.94, category: 'transition', row: 4, col: 5 },
  { symbol: 'Cr', name: 'Chromium', number: 24, mass: 52.00, category: 'transition', row: 4, col: 6 },
  { symbol: 'Mn', name: 'Manganese', number: 25, mass: 54.94, category: 'transition', row: 4, col: 7 },
  { symbol: 'Fe', name: 'Iron', number: 26, mass: 55.85, category: 'transition', row: 4, col: 8 },
  { symbol: 'Co', name: 'Cobalt', number: 27, mass: 58.93, category: 'transition', row: 4, col: 9 },
  { symbol: 'Ni', name: 'Nickel', number: 28, mass: 58.69, category: 'transition', row: 4, col: 10 },
  { symbol: 'Cu', name: 'Copper', number: 29, mass: 63.55, category: 'transition', row: 4, col: 11 },
  { symbol: 'Zn', name: 'Zinc', number: 30, mass: 65.38, category: 'transition', row: 4, col: 12 },
  { symbol: 'Ga', name: 'Gallium', number: 31, mass: 69.72, category: 'post-transition', row: 4, col: 13 },
  { symbol: 'Ge', name: 'Germanium', number: 32, mass: 72.63, category: 'metalloid', row: 4, col: 14 },
  { symbol: 'As', name: 'Arsenic', number: 33, mass: 74.92, category: 'metalloid', row: 4, col: 15 },
  { symbol: 'Se', name: 'Selenium', number: 34, mass: 78.97, category: 'nonmetal', row: 4, col: 16 },
  { symbol: 'Br', name: 'Bromine', number: 35, mass: 79.90, category: 'halogen', row: 4, col: 17 },
  { symbol: 'Kr', name: 'Krypton', number: 36, mass: 83.80, category: 'noble-gas', row: 4, col: 18 },
];

interface ElementData {
  symbol: string;
  name: string;
  number: number;
  mass: number;
  category: string;
  row: number;
  col: number;
}

const CATEGORY_COLORS: Record<string, string> = {
  'alkali': 'bg-red-500/30 border-red-500/50 hover:bg-red-500/40',
  'alkaline': 'bg-orange-500/30 border-orange-500/50 hover:bg-orange-500/40',
  'transition': 'bg-yellow-500/30 border-yellow-500/50 hover:bg-yellow-500/40',
  'post-transition': 'bg-green-500/30 border-green-500/50 hover:bg-green-500/40',
  'metalloid': 'bg-teal-500/30 border-teal-500/50 hover:bg-teal-500/40',
  'nonmetal': 'bg-cyan-500/30 border-cyan-500/50 hover:bg-cyan-500/40',
  'halogen': 'bg-blue-500/30 border-blue-500/50 hover:bg-blue-500/40',
  'noble-gas': 'bg-purple-500/30 border-purple-500/50 hover:bg-purple-500/40',
};

// Reaction Balancing Challenges
const BALANCING_CHALLENGES = [
  { unbalanced: 'H2 + O2 -> H2O', balanced: '2H2 + O2 -> 2H2O', difficulty: 1 },
  { unbalanced: 'N2 + H2 -> NH3', balanced: 'N2 + 3H2 -> 2NH3', difficulty: 1 },
  { unbalanced: 'Fe + O2 -> Fe2O3', balanced: '4Fe + 3O2 -> 2Fe2O3', difficulty: 2 },
  { unbalanced: 'C3H8 + O2 -> CO2 + H2O', balanced: 'C3H8 + 5O2 -> 3CO2 + 4H2O', difficulty: 2 },
  { unbalanced: 'KMnO4 + HCl -> KCl + MnCl2 + Cl2 + H2O', balanced: '2KMnO4 + 16HCl -> 2KCl + 2MnCl2 + 5Cl2 + 8H2O', difficulty: 3 },
  { unbalanced: 'Al + H2SO4 -> Al2(SO4)3 + H2', balanced: '2Al + 3H2SO4 -> Al2(SO4)3 + 3H2', difficulty: 2 },
  { unbalanced: 'Ca(OH)2 + H3PO4 -> Ca3(PO4)2 + H2O', balanced: '3Ca(OH)2 + 2H3PO4 -> Ca3(PO4)2 + 6H2O', difficulty: 3 },
];

// SM-2 Quality Descriptions
const QUALITY_RATINGS = [
  { value: 0, label: 'Blackout', description: 'Complete failure to recall', color: 'bg-red-600' },
  { value: 1, label: 'Wrong', description: 'Incorrect response', color: 'bg-red-500' },
  { value: 2, label: 'Hard', description: 'Correct with serious difficulty', color: 'bg-orange-500' },
  { value: 3, label: 'Good', description: 'Correct with hesitation', color: 'bg-yellow-500' },
  { value: 4, label: 'Easy', description: 'Correct with minor hesitation', color: 'bg-green-400' },
  { value: 5, label: 'Perfect', description: 'Perfect response', color: 'bg-green-500' },
];

export function ChemistryTools() {
  const { 
    chemistryCards, 
    addChemistryCard, 
    updateCardMastery, 
    deleteChemistryCard,
    getCardsForReview,
    addXp,
    stats
  } = useStudyStore();
  
  const [isAddOpen, setIsAddOpen] = useState(false);
  const [practiceMode, setPracticeMode] = useState(false);
  const [currentCardIndex, setCurrentCardIndex] = useState(0);
  const [isFlipped, setIsFlipped] = useState(false);
  const [selectedType, setSelectedType] = useState<ChemistryCard['type'] | 'all'>('all');
  const [selectedElement, setSelectedElement] = useState<ElementData | null>(null);
  
  // Balancing Challenge State
  const [balancingMode, setBalancingMode] = useState(false);
  const [currentChallenge, setCurrentChallenge] = useState(0);
  const [userAnswer, setUserAnswer] = useState('');
  const [challengeResult, setChallengeResult] = useState<'correct' | 'incorrect' | null>(null);
  const [balancingScore, setBalancingScore] = useState(0);
  
  const [formData, setFormData] = useState({
    type: 'reaction' as ChemistryCard['type'],
    front: '',
    back: '',
    difficulty: 3,
  });

  const filteredCards = useMemo(() => {
    if (selectedType === 'all') return chemistryCards;
    return chemistryCards.filter((c) => c.type === selectedType);
  }, [chemistryCards, selectedType]);

  const dueCards = useMemo(() => {
    return getCardsForReview();
  }, [getCardsForReview]);

  const resetForm = () => {
    setFormData({
      type: 'reaction',
      front: '',
      back: '',
      difficulty: 3,
    });
  };

  const handleAdd = () => {
    if (!formData.front.trim() || !formData.back.trim()) return;
    addChemistryCard({
      type: formData.type,
      front: formData.front,
      back: formData.back,
      difficulty: formData.difficulty,
    });
    resetForm();
    setIsAddOpen(false);
  };

  // SM-2 Quality-based answer handling
  const handleQualityAnswer = (quality: 0 | 1 | 2 | 3 | 4 | 5) => {
    const currentCard = dueCards[currentCardIndex];
    if (currentCard) {
      updateCardMastery(currentCard.id, quality);
      // Award XP based on quality
      if (quality >= 3) {
        const xpReward = quality * 2;
        addXp(xpReward);
      }
    }
    
    if (currentCardIndex < dueCards.length - 1) {
      setCurrentCardIndex((i) => i + 1);
      setIsFlipped(false);
    } else {
      setPracticeMode(false);
      setCurrentCardIndex(0);
      setIsFlipped(false);
    }
  };

  const startPractice = () => {
    if (dueCards.length === 0) return;
    setCurrentCardIndex(0);
    setIsFlipped(false);
    setPracticeMode(true);
  };

  // Balancing Challenge Functions
  const startBalancingChallenge = () => {
    setBalancingMode(true);
    setCurrentChallenge(0);
    setUserAnswer('');
    setChallengeResult(null);
    setBalancingScore(0);
  };

  const checkBalancingAnswer = () => {
    const challenge = BALANCING_CHALLENGES[currentChallenge];
    const normalized = userAnswer.replace(/\s+/g, '').toLowerCase();
    const correct = challenge.balanced.replace(/\s+/g, '').toLowerCase();
    
    if (normalized === correct) {
      setChallengeResult('correct');
      setBalancingScore((s) => s + challenge.difficulty * 10);
      addXp(challenge.difficulty * 5);
    } else {
      setChallengeResult('incorrect');
    }
  };

  const nextChallenge = () => {
    if (currentChallenge < BALANCING_CHALLENGES.length - 1) {
      setCurrentChallenge((c) => c + 1);
      setUserAnswer('');
      setChallengeResult(null);
    } else {
      setBalancingMode(false);
      addXp(balancingScore);
    }
  };

  const PracticeView = () => {
    const currentCard = dueCards[currentCardIndex];
    if (!currentCard) return null;

    return (
      <div className="space-y-6">
        <div className="flex items-center justify-between">
          <span className="text-sm text-muted-foreground">
            Card {currentCardIndex + 1} of {dueCards.length}
          </span>
          <Button variant="outline" size="sm" onClick={() => setPracticeMode(false)}>
            Exit Practice
          </Button>
        </div>

        <Card
          className="min-h-[300px] cursor-pointer transition-all duration-500 transform hover:scale-[1.01] gradient-border"
          onClick={() => setIsFlipped(!isFlipped)}
        >
          <CardContent className="p-8 h-full flex flex-col items-center justify-center text-center">
            <Badge variant="outline" className="mb-4">
              {CARD_TYPES.find((t) => t.value === currentCard.type)?.icon}
              <span className="ml-1">{currentCard.type}</span>
            </Badge>
            <div className="text-2xl font-mono mb-4 chem-formula">
              {isFlipped ? currentCard.back : currentCard.front}
            </div>
            <div className="flex items-center gap-2 text-muted-foreground text-sm">
              <FlipHorizontal className="w-4 h-4" />
              <span>{isFlipped ? 'Click to see question' : 'Click to reveal answer'}</span>
            </div>
            <div className="mt-4">
              <Progress value={currentCard.mastery} className="h-2 w-32" />
              <span className="text-xs text-muted-foreground">Mastery: {currentCard.mastery}%</span>
            </div>
          </CardContent>
        </Card>

        {isFlipped && (
          <div className="space-y-3">
            <p className="text-sm text-center text-muted-foreground">How well did you remember?</p>
            <div className="flex justify-center gap-2 flex-wrap">
              {QUALITY_RATINGS.map((rating) => (
                <Button 
                  key={rating.value}
                  variant="outline" 
                  size="sm"
                  className={`${rating.color} border-current hover:opacity-80`}
                  onClick={() => handleQualityAnswer(rating.value as 0 | 1 | 2 | 3 | 4 | 5)}
                  title={rating.description}
                >
                  {rating.label}
                </Button>
              ))}
            </div>
          </div>
        )}
      </div>
    );
  };

  const BalancingView = () => {
    const challenge = BALANCING_CHALLENGES[currentChallenge];
    
    return (
      <div className="space-y-6">
        <div className="flex items-center justify-between">
          <div className="flex items-center gap-4">
            <span className="text-sm text-muted-foreground">
              Challenge {currentChallenge + 1} of {BALANCING_CHALLENGES.length}
            </span>
            <Badge variant="outline">
              Difficulty: {'*'.repeat(challenge.difficulty)}
            </Badge>
          </div>
          <div className="flex items-center gap-4">
            <span className="text-sm font-semibold text-neon-cyan">Score: {balancingScore}</span>
            <Button variant="outline" size="sm" onClick={() => setBalancingMode(false)}>
              Exit Challenge
            </Button>
          </div>
        </div>

        <Card className="gradient-border">
          <CardContent className="p-8">
            <div className="text-center space-y-6">
              <h3 className="text-lg font-semibold">Balance this equation:</h3>
              <div className="text-2xl font-mono text-neon-orange chem-formula">
                {challenge.unbalanced}
              </div>
              
              <div className="max-w-md mx-auto space-y-4">
                <Input
                  value={userAnswer}
                  onChange={(e) => setUserAnswer(e.target.value)}
                  placeholder="Enter balanced equation..."
                  className="font-mono text-center"
                  disabled={challengeResult !== null}
                />
                
                {challengeResult === null ? (
                  <Button onClick={checkBalancingAnswer} className="w-full">
                    Check Answer
                  </Button>
                ) : (
                  <div className="space-y-4">
                    {challengeResult === 'correct' ? (
                      <div className="p-4 bg-green-500/20 border border-green-500/30 rounded-lg">
                        <div className="flex items-center justify-center gap-2 text-green-400">
                          <Check className="w-5 h-5" />
                          <span className="font-semibold">Correct!</span>
                        </div>
                        <p className="text-sm text-muted-foreground mt-2">
                          +{challenge.difficulty * 10} points, +{challenge.difficulty * 5} XP
                        </p>
                      </div>
                    ) : (
                      <div className="p-4 bg-red-500/20 border border-red-500/30 rounded-lg">
                        <div className="flex items-center justify-center gap-2 text-red-400">
                          <X className="w-5 h-5" />
                          <span className="font-semibold">Not quite!</span>
                        </div>
                        <p className="text-sm text-muted-foreground mt-2">
                          Correct answer: <span className="font-mono text-neon-cyan">{challenge.balanced}</span>
                        </p>
                      </div>
                    )}
                    <Button onClick={nextChallenge} className="w-full">
                      {currentChallenge < BALANCING_CHALLENGES.length - 1 ? 'Next Challenge' : 'Finish'}
                    </Button>
                  </div>
                )}
              </div>
            </div>
          </CardContent>
        </Card>
      </div>
    );
  };

  const PeriodicTable = () => (
    <div className="space-y-4">
      {/* Legend */}
      <div className="flex flex-wrap gap-2 justify-center text-xs">
        {Object.entries(CATEGORY_COLORS).map(([category, color]) => (
          <div key={category} className={`px-2 py-1 rounded border ${color}`}>
            {category.replace('-', ' ')}
          </div>
        ))}
      </div>
      
      {/* Table Grid */}
      <div className="overflow-x-auto">
        <div className="grid gap-1 min-w-[900px]" style={{ 
          gridTemplateColumns: 'repeat(18, minmax(45px, 1fr))',
          gridTemplateRows: 'repeat(4, 1fr)'
        }}>
          {PERIODIC_TABLE.map((element) => (
            <div
              key={element.symbol}
              className={`p-1 text-center cursor-pointer transition-all border rounded ${CATEGORY_COLORS[element.category]} hover:scale-110 hover:z-10`}
              style={{ 
                gridColumn: element.col, 
                gridRow: element.row 
              }}
              onClick={() => setSelectedElement(element)}
            >
              <div className="text-[10px] text-muted-foreground">{element.number}</div>
              <div className="text-sm font-bold">{element.symbol}</div>
              <div className="text-[9px] text-muted-foreground truncate">{element.mass.toFixed(2)}</div>
            </div>
          ))}
        </div>
      </div>

      {/* Element Details Dialog */}
      <Dialog open={!!selectedElement} onOpenChange={() => setSelectedElement(null)}>
        <DialogContent>
          <DialogHeader>
            <DialogTitle className="flex items-center gap-3">
              <div className={`p-3 rounded-lg ${selectedElement ? CATEGORY_COLORS[selectedElement.category] : ''}`}>
                <span className="text-3xl font-bold">{selectedElement?.symbol}</span>
              </div>
              <div>
                <div className="text-xl">{selectedElement?.name}</div>
                <div className="text-sm text-muted-foreground capitalize">{selectedElement?.category.replace('-', ' ')}</div>
              </div>
            </DialogTitle>
          </DialogHeader>
          <div className="grid grid-cols-2 gap-4 py-4">
            <div className="space-y-1">
              <Label className="text-muted-foreground">Atomic Number</Label>
              <div className="text-2xl font-bold">{selectedElement?.number}</div>
            </div>
            <div className="space-y-1">
              <Label className="text-muted-foreground">Atomic Mass</Label>
              <div className="text-2xl font-bold">{selectedElement?.mass.toFixed(4)} u</div>
            </div>
          </div>
          <DialogFooter>
            <Button
              onClick={() => {
                if (selectedElement) {
                  setFormData({
                    ...formData,
                    type: 'formula',
                    front: `What is the atomic number of ${selectedElement.name}?`,
                    back: `${selectedElement.number}`,
                  });
                  setSelectedElement(null);
                  setIsAddOpen(true);
                }
              }}
            >
              Create Flashcard
            </Button>
          </DialogFooter>
        </DialogContent>
      </Dialog>
    </div>
  );

  const CardForm = () => (
    <div className="space-y-4">
      <div className="space-y-2">
        <Label>Card Type</Label>
        <Select
          value={formData.type}
          onValueChange={(value) => setFormData({ ...formData, type: value as ChemistryCard['type'] })}
        >
          <SelectTrigger>
            <SelectValue />
          </SelectTrigger>
          <SelectContent>
            {CARD_TYPES.map((type) => (
              <SelectItem key={type.value} value={type.value}>
                <span className="flex items-center gap-2">
                  {type.icon}
                  {type.label}
                </span>
              </SelectItem>
            ))}
          </SelectContent>
        </Select>
      </div>

      <div className="space-y-2">
        <Label>Question / Front</Label>
        <Textarea
          placeholder="e.g., CH3OH + HBr -> ?"
          value={formData.front}
          onChange={(e) => setFormData({ ...formData, front: e.target.value })}
          className="font-mono"
        />
      </div>

      <div className="space-y-2">
        <Label>Answer / Back</Label>
        <Textarea
          placeholder="e.g., CH3Br + H2O"
          value={formData.back}
          onChange={(e) => setFormData({ ...formData, back: e.target.value })}
          className="font-mono"
        />
      </div>

      <div className="space-y-2">
        <Label>Difficulty: {formData.difficulty}/5</Label>
        <Slider
          value={[formData.difficulty]}
          onValueChange={([value]) => setFormData({ ...formData, difficulty: value })}
          min={1}
          max={5}
          step={1}
        />
      </div>

      <DialogFooter>
        <DialogClose asChild>
          <Button variant="outline">Cancel</Button>
        </DialogClose>
        <Button onClick={handleAdd}>Add Card</Button>
      </DialogFooter>
    </div>
  );

  if (practiceMode) {
    return <PracticeView />;
  }

  if (balancingMode) {
    return <BalancingView />;
  }

  return (
    <div className="space-y-6">
      {/* Header */}
      <div className="flex items-center justify-between flex-wrap gap-4">
        <div>
          <h2 className="text-2xl font-bold flex items-center gap-2">
            <Beaker className="w-6 h-6" />
            Chemistry Lab
          </h2>
          <p className="text-muted-foreground">
            Periodic table, flashcards, and reaction challenges
          </p>
        </div>
        <div className="flex gap-2 flex-wrap">
          <Button
            variant="outline"
            onClick={startBalancingChallenge}
          >
            <Zap className="w-4 h-4 mr-2" />
            Balance Challenge
          </Button>
          <Button
            variant="outline"
            onClick={startPractice}
            disabled={dueCards.length === 0}
          >
            <Brain className="w-4 h-4 mr-2" />
            Practice ({dueCards.length} due)
          </Button>
          <Dialog open={isAddOpen} onOpenChange={setIsAddOpen}>
            <DialogTrigger asChild>
              <Button className="neon-glow-cyan" onClick={() => { resetForm(); setIsAddOpen(true); }}>
                <Plus className="w-4 h-4 mr-2" />
                Add Card
              </Button>
            </DialogTrigger>
            <DialogContent>
              <DialogHeader>
                <DialogTitle>Add Chemistry Card</DialogTitle>
              </DialogHeader>
              <CardForm />
            </DialogContent>
          </Dialog>
        </div>
      </div>

      <Tabs defaultValue="periodic" className="space-y-4">
        <TabsList>
          <TabsTrigger value="periodic">
            <Atom className="w-4 h-4 mr-2" />
            Periodic Table
          </TabsTrigger>
          <TabsTrigger value="cards">
            <BookOpen className="w-4 h-4 mr-2" />
            Flashcards ({chemistryCards.length})
          </TabsTrigger>
          <TabsTrigger value="templates">
            <FlaskConical className="w-4 h-4 mr-2" />
            Templates
          </TabsTrigger>
          <TabsTrigger value="converter">
            <Calculator className="w-4 h-4 mr-2" />
            Converter
          </TabsTrigger>
        </TabsList>

        <TabsContent value="periodic">
          <Card>
            <CardHeader>
              <CardTitle className="text-base flex items-center gap-2">
                <Atom className="w-5 h-5" />
                Interactive Periodic Table
                <Badge variant="outline" className="ml-2">Click elements for details</Badge>
              </CardTitle>
            </CardHeader>
            <CardContent>
              <PeriodicTable />
            </CardContent>
          </Card>
        </TabsContent>

        <TabsContent value="cards" className="space-y-4">
          {/* Filter */}
          <div className="flex gap-2">
            <Button
              variant={selectedType === 'all' ? 'default' : 'outline'}
              size="sm"
              onClick={() => setSelectedType('all')}
            >
              All
            </Button>
            {CARD_TYPES.map((type) => (
              <Button
                key={type.value}
                variant={selectedType === type.value ? 'default' : 'outline'}
                size="sm"
                onClick={() => setSelectedType(type.value)}
              >
                {type.icon}
                <span className="ml-1 hidden sm:inline">{type.label}</span>
              </Button>
            ))}
          </div>

          {/* Cards Grid */}
          {filteredCards.length > 0 ? (
            <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-4">
              {filteredCards.map((card) => (
                <Card key={card.id} className="card-hover group">
                  <CardContent className="p-4">
                    <div className="flex items-center justify-between mb-2">
                      <Badge variant="outline">
                        {CARD_TYPES.find((t) => t.value === card.type)?.icon}
                        <span className="ml-1">{card.type}</span>
                      </Badge>
                      <Button
                        variant="ghost"
                        size="icon"
                        className="h-8 w-8 opacity-0 group-hover:opacity-100 transition-opacity text-destructive"
                        onClick={() => deleteChemistryCard(card.id)}
                      >
                        <Trash2 className="w-4 h-4" />
                      </Button>
                    </div>
                    <div className="space-y-2">
                      <div className="font-mono text-sm chem-formula">{card.front}</div>
                      <div className="flex items-center text-muted-foreground">
                        <ArrowRight className="w-4 h-4 mx-2" />
                      </div>
                      <div className="font-mono text-sm text-neon-cyan chem-formula">{card.back}</div>
                    </div>
                    <div className="mt-3 pt-3 border-t">
                      <div className="flex items-center justify-between text-xs text-muted-foreground">
                        <span>Mastery: {card.mastery}%</span>
                        <span>Reviews: {card.timesReviewed}x</span>
                      </div>
                      <Progress value={card.mastery} className="h-1.5 mt-1" />
                      {card.nextReview && (
                        <p className="text-xs text-muted-foreground mt-1">
                          Next: {new Date(card.nextReview).toLocaleDateString()}
                        </p>
                      )}
                    </div>
                  </CardContent>
                </Card>
              ))}
            </div>
          ) : (
            <Card className="border-dashed">
              <CardContent className="flex flex-col items-center justify-center py-12">
                <FlaskConical className="w-12 h-12 text-muted-foreground mb-4" />
                <h3 className="text-lg font-semibold mb-2">No chemistry cards yet</h3>
                <p className="text-muted-foreground text-center mb-4">
                  Add reaction cards, formulas, and mechanisms to practice
                </p>
                <Button onClick={() => setIsAddOpen(true)}>
                  <Plus className="w-4 h-4 mr-2" />
                  Add Your First Card
                </Button>
              </CardContent>
            </Card>
          )}
        </TabsContent>

        <TabsContent value="templates" className="space-y-6">
          {/* Preset Reactions */}
          <Card>
            <CardHeader>
              <CardTitle className="text-base flex items-center gap-2">
                <FlaskConical className="w-5 h-5" />
                Common Reactions
              </CardTitle>
            </CardHeader>
            <CardContent>
              <div className="grid grid-cols-1 md:grid-cols-2 gap-3">
                {PRESET_REACTIONS.map((reaction, i) => (
                  <div
                    key={i}
                    className="p-3 rounded-lg bg-muted/50 hover:bg-muted cursor-pointer transition-colors"
                    onClick={() => {
                      setFormData({
                        ...formData,
                        type: 'reaction',
                        front: reaction.front,
                        back: reaction.back,
                      });
                      setIsAddOpen(true);
                    }}
                  >
                    <p className="font-mono text-sm chem-formula">{reaction.front}</p>
                    <p className="font-mono text-sm text-neon-cyan chem-formula mt-1">{reaction.back}</p>
                  </div>
                ))}
              </div>
            </CardContent>
          </Card>

          {/* Preset Formulas */}
          <Card>
            <CardHeader>
              <CardTitle className="text-base flex items-center gap-2">
                <Atom className="w-5 h-5" />
                Key Formulas
              </CardTitle>
            </CardHeader>
            <CardContent>
              <div className="grid grid-cols-1 md:grid-cols-2 gap-3">
                {PRESET_FORMULAS.map((formula, i) => (
                  <div
                    key={i}
                    className="p-3 rounded-lg bg-muted/50 hover:bg-muted cursor-pointer transition-colors"
                    onClick={() => {
                      setFormData({
                        ...formData,
                        type: 'formula',
                        front: formula.front,
                        back: formula.back,
                      });
                      setIsAddOpen(true);
                    }}
                  >
                    <p className="font-medium text-sm">{formula.front}</p>
                    <p className="font-mono text-sm text-neon-purple mt-1">{formula.back}</p>
                  </div>
                ))}
              </div>
            </CardContent>
          </Card>
        </TabsContent>

        <TabsContent value="converter" className="space-y-4">
          <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
            {UNIT_CONVERSIONS.map((category) => (
              <Card key={category.name}>
                <CardHeader>
                  <CardTitle className="text-base">{category.name}</CardTitle>
                </CardHeader>
                <CardContent>
                  <ul className="space-y-2">
                    {category.conversions.map((conversion, i) => (
                      <li key={i} className="font-mono text-sm text-muted-foreground">
                        {conversion}
                      </li>
                    ))}
                  </ul>
                </CardContent>
              </Card>
            ))}
          </div>

          {/* Quick Calculator */}
          <Card>
            <CardHeader>
              <CardTitle className="text-base flex items-center gap-2">
                <Calculator className="w-5 h-5" />
                Quick Conversions
              </CardTitle>
            </CardHeader>
            <CardContent>
              <div className="grid grid-cols-1 md:grid-cols-3 gap-4">
                <div className="space-y-2">
                  <Label>Celsius to Kelvin</Label>
                  <div className="flex gap-2">
                    <Input type="number" placeholder="C" id="celsius" />
                    <Button
                      variant="outline"
                      onClick={() => {
                        const c = parseFloat((document.getElementById('celsius') as HTMLInputElement).value);
                        if (!isNaN(c)) {
                          (document.getElementById('kelvin') as HTMLInputElement).value = (c + 273.15).toFixed(2);
                        }
                      }}
                    >
                      Convert
                    </Button>
                    <Input type="number" placeholder="K" id="kelvin" readOnly />
                  </div>
                </div>
                <div className="space-y-2">
                  <Label>atm to kPa</Label>
                  <div className="flex gap-2">
                    <Input type="number" placeholder="atm" id="atm" />
                    <Button
                      variant="outline"
                      onClick={() => {
                        const a = parseFloat((document.getElementById('atm') as HTMLInputElement).value);
                        if (!isNaN(a)) {
                          (document.getElementById('kpa') as HTMLInputElement).value = (a * 101.325).toFixed(2);
                        }
                      }}
                    >
                      Convert
                    </Button>
                    <Input type="number" placeholder="kPa" id="kpa" readOnly />
                  </div>
                </div>
                <div className="space-y-2">
                  <Label>mol to particles</Label>
                  <div className="flex gap-2">
                    <Input type="number" placeholder="mol" id="mol" />
                    <Button
                      variant="outline"
                      onClick={() => {
                        const m = parseFloat((document.getElementById('mol') as HTMLInputElement).value);
                        if (!isNaN(m)) {
                          (document.getElementById('particles') as HTMLInputElement).value = (m * 6.022e23).toExponential(3);
                        }
                      }}
                    >
                      Convert
                    </Button>
                    <Input type="text" placeholder="particles" id="particles" readOnly />
                  </div>
                </div>
              </div>
            </CardContent>
          </Card>
        </TabsContent>
      </Tabs>
    </div>
  );
}
