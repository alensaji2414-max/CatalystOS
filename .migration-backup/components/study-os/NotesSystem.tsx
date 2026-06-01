'use client';

import { useState, useMemo } from 'react';
import { useStudyStore, Note } from '@/lib/study-store';
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card';
import { Button } from '@/components/ui/button';
import { Input } from '@/components/ui/input';
import { Label } from '@/components/ui/label';
import { Textarea } from '@/components/ui/textarea';
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from '@/components/ui/select';
import { Badge } from '@/components/ui/badge';
import { Switch } from '@/components/ui/switch';
import { Dialog, DialogContent, DialogHeader, DialogTitle, DialogTrigger, DialogFooter, DialogClose } from '@/components/ui/dialog';
import { Tabs, TabsContent, TabsList, TabsTrigger } from '@/components/ui/tabs';
import { 
  FileText, 
  Plus, 
  Search, 
  Star, 
  Bookmark,
  Tag,
  Trash2,
  Edit,
  Copy,
  FlipHorizontal,
  BookOpen,
  Brain,
  Sparkles
} from 'lucide-react';

export function NotesSystem() {
  const { notes, subjects, addNote, updateNote, deleteNote, addXp, triggerCelebration } = useStudyStore();
  
  const [isAddOpen, setIsAddOpen] = useState(false);
  const [editingNote, setEditingNote] = useState<Note | null>(null);
  const [searchQuery, setSearchQuery] = useState('');
  const [selectedSubject, setSelectedSubject] = useState<string>('all');
  const [selectedTag, setSelectedTag] = useState<string>('all');
  const [showFlashcards, setShowFlashcards] = useState(false);
  const [currentCardIndex, setCurrentCardIndex] = useState(0);
  const [isFlipped, setIsFlipped] = useState(false);
  
  const [formData, setFormData] = useState({
    title: '',
    content: '',
    subjectId: '',
    tags: [] as string[],
    isFlashcard: false,
    flashcardAnswer: '',
    isFavorite: false,
  });
  const [newTag, setNewTag] = useState('');
  const [reviewStats, setReviewStats] = useState({ correct: 0, incorrect: 0 });

  const allTags = useMemo(() => {
    const tagSet = new Set<string>();
    notes.forEach((note) => note.tags.forEach((tag) => tagSet.add(tag)));
    return Array.from(tagSet);
  }, [notes]);

  const filteredNotes = useMemo(() => {
    return notes.filter((note) => {
      if (showFlashcards && !note.isFlashcard) return false;
      if (searchQuery && !note.title.toLowerCase().includes(searchQuery.toLowerCase()) &&
          !note.content.toLowerCase().includes(searchQuery.toLowerCase())) return false;
      if (selectedSubject !== 'all' && note.subjectId !== selectedSubject) return false;
      if (selectedTag !== 'all' && !note.tags.includes(selectedTag)) return false;
      return true;
    });
  }, [notes, searchQuery, selectedSubject, selectedTag, showFlashcards]);

  const flashcards = filteredNotes.filter((n) => n.isFlashcard);

  const resetForm = () => {
    setFormData({
      title: '',
      content: '',
      subjectId: '',
      tags: [],
      isFlashcard: false,
      flashcardAnswer: '',
      isFavorite: false,
    });
    setNewTag('');
  };

  const handleAdd = () => {
    if (!formData.title.trim() || !formData.content.trim()) return;
    addNote({
      title: formData.title,
      content: formData.content,
      subjectId: formData.subjectId && formData.subjectId !== 'none' ? formData.subjectId : undefined,
      tags: formData.tags,
      isFlashcard: formData.isFlashcard,
      flashcardAnswer: formData.flashcardAnswer || undefined,
      isFavorite: formData.isFavorite,
    });
    resetForm();
    setIsAddOpen(false);
  };

  const handleUpdate = () => {
    if (!editingNote || !formData.title.trim()) return;
    updateNote(editingNote.id, {
      title: formData.title,
      content: formData.content,
      subjectId: formData.subjectId && formData.subjectId !== 'none' ? formData.subjectId : undefined,
      tags: formData.tags,
      isFlashcard: formData.isFlashcard,
      flashcardAnswer: formData.flashcardAnswer || undefined,
      isFavorite: formData.isFavorite,
    });
    setEditingNote(null);
    resetForm();
  };

  const handleEdit = (note: Note) => {
    setEditingNote(note);
    setFormData({
      title: note.title,
      content: note.content,
      subjectId: note.subjectId || '',
      tags: note.tags,
      isFlashcard: note.isFlashcard,
      flashcardAnswer: note.flashcardAnswer || '',
      isFavorite: note.isFavorite,
    });
  };

  const addTag = () => {
    if (newTag.trim() && !formData.tags.includes(newTag.trim())) {
      setFormData({ ...formData, tags: [...formData.tags, newTag.trim()] });
      setNewTag('');
    }
  };

  const removeTag = (tag: string) => {
    setFormData({ ...formData, tags: formData.tags.filter((t) => t !== tag) });
  };

  // Flashcard review handlers - connect to XP/progression system
  const handleFlashcardReview = (quality: 'wrong' | 'hard' | 'easy') => {
    const xpRewards = { wrong: 5, hard: 15, easy: 25 };
    const xpGained = xpRewards[quality];
    
    addXp(xpGained);
    
    // Update review stats
    if (quality === 'wrong') {
      setReviewStats(prev => ({ ...prev, incorrect: prev.incorrect + 1 }));
    } else {
      setReviewStats(prev => ({ ...prev, correct: prev.correct + 1 }));
    }
    
    // Check for milestone celebration (every 10 cards reviewed)
    const totalReviewed = reviewStats.correct + reviewStats.incorrect + 1;
    if (totalReviewed % 10 === 0) {
      triggerCelebration({
        type: 'milestone',
        title: `${totalReviewed} Cards Reviewed!`,
        subtitle: 'Keep up the great work!',
        xpGained: 50,
      });
      addXp(50); // Bonus XP for milestone
    }
    
    // Move to next card
    if (currentCardIndex < flashcards.length - 1) {
      setCurrentCardIndex((i) => i + 1);
      setIsFlipped(false);
    } else {
      // Session complete - award completion bonus
      const sessionBonus = Math.round((reviewStats.correct + 1) * 10);
      addXp(sessionBonus);
      triggerCelebration({
        type: 'quest_complete',
        title: 'Flashcard Session Complete!',
        subtitle: `${reviewStats.correct + (quality !== 'wrong' ? 1 : 0)}/${flashcards.length} correct`,
        xpGained: sessionBonus,
      });
      // Reset for next session
      setCurrentCardIndex(0);
      setIsFlipped(false);
      setReviewStats({ correct: 0, incorrect: 0 });
    }
  };

  const formatDate = (timestamp: number) => {
    return new Date(timestamp).toLocaleDateString('en-US', {
      month: 'short',
      day: 'numeric',
      year: 'numeric',
    });
  };

  const NoteForm = ({ isEdit = false }: { isEdit?: boolean }) => (
    <div className="space-y-4 max-h-[70vh] overflow-y-auto pr-2">
      <div className="space-y-2">
        <Label>Title</Label>
        <Input
          placeholder="Note title..."
          value={formData.title}
          onChange={(e) => setFormData({ ...formData, title: e.target.value })}
        />
      </div>

      <div className="space-y-2">
        <Label>Subject</Label>
        <Select
          value={formData.subjectId}
          onValueChange={(value) => setFormData({ ...formData, subjectId: value })}
        >
          <SelectTrigger>
            <SelectValue placeholder="Select subject (optional)" />
          </SelectTrigger>
          <SelectContent>
            <SelectItem value="none">None</SelectItem>
            {subjects.map((subject) => (
              <SelectItem key={subject.id} value={subject.id}>
                <span className="flex items-center gap-2">
                  <span>{subject.icon}</span>
                  <span>{subject.name}</span>
                </span>
              </SelectItem>
            ))}
          </SelectContent>
        </Select>
      </div>

      <div className="space-y-2">
        <Label>{formData.isFlashcard ? 'Question / Front' : 'Content'}</Label>
        <Textarea
          placeholder={formData.isFlashcard ? 'Enter the question or front of the card...' : 'Write your note...'}
          value={formData.content}
          onChange={(e) => setFormData({ ...formData, content: e.target.value })}
          className="min-h-[150px] font-mono text-sm"
        />
        <p className="text-xs text-muted-foreground">
          Supports chemistry notation: H₂O, CO₂, H⁺, e⁻
        </p>
      </div>

      <div className="flex items-center gap-4">
        <div className="flex items-center gap-2">
          <Switch
            checked={formData.isFlashcard}
            onCheckedChange={(checked) => setFormData({ ...formData, isFlashcard: checked })}
          />
          <Label>Flashcard Mode</Label>
        </div>
        <div className="flex items-center gap-2">
          <Switch
            checked={formData.isFavorite}
            onCheckedChange={(checked) => setFormData({ ...formData, isFavorite: checked })}
          />
          <Label>Favorite</Label>
        </div>
      </div>

      {formData.isFlashcard && (
        <div className="space-y-2">
          <Label>Answer / Back</Label>
          <Textarea
            placeholder="Enter the answer or back of the card..."
            value={formData.flashcardAnswer}
            onChange={(e) => setFormData({ ...formData, flashcardAnswer: e.target.value })}
            className="min-h-[100px] font-mono text-sm"
          />
        </div>
      )}

      <div className="space-y-2">
        <Label>Tags</Label>
        <div className="flex gap-2">
          <Input
            placeholder="Add a tag..."
            value={newTag}
            onChange={(e) => setNewTag(e.target.value)}
            onKeyDown={(e) => e.key === 'Enter' && (e.preventDefault(), addTag())}
          />
          <Button type="button" variant="outline" onClick={addTag}>
            <Plus className="w-4 h-4" />
          </Button>
        </div>
        {formData.tags.length > 0 && (
          <div className="flex flex-wrap gap-1 mt-2">
            {formData.tags.map((tag) => (
              <Badge
                key={tag}
                variant="secondary"
                className="cursor-pointer"
                onClick={() => removeTag(tag)}
              >
                {tag} ×
              </Badge>
            ))}
          </div>
        )}
      </div>

      <DialogFooter>
        <DialogClose asChild>
          <Button variant="outline">Cancel</Button>
        </DialogClose>
        <Button onClick={isEdit ? handleUpdate : handleAdd}>
          {isEdit ? 'Save Changes' : 'Create Note'}
        </Button>
      </DialogFooter>
    </div>
  );

  const FlashcardView = () => {
    if (flashcards.length === 0) {
      return (
        <Card className="border-dashed">
          <CardContent className="flex flex-col items-center justify-center py-12">
            <Brain className="w-12 h-12 text-muted-foreground mb-4" />
            <h3 className="text-lg font-semibold mb-2">No flashcards yet</h3>
            <p className="text-muted-foreground text-center">
              Create notes with flashcard mode enabled to study here
            </p>
          </CardContent>
        </Card>
      );
    }

    const currentCard = flashcards[currentCardIndex];
    const subject = currentCard.subjectId ? subjects.find((s) => s.id === currentCard.subjectId) : null;

    return (
      <div className="space-y-6">
        <div className="flex items-center justify-between">
          <span className="text-sm text-muted-foreground">
            Card {currentCardIndex + 1} of {flashcards.length}
          </span>
          <div className="flex gap-2">
            <Button
              variant="outline"
              size="sm"
              disabled={currentCardIndex === 0}
              onClick={() => { setCurrentCardIndex((i) => i - 1); setIsFlipped(false); }}
            >
              Previous
            </Button>
            <Button
              variant="outline"
              size="sm"
              disabled={currentCardIndex === flashcards.length - 1}
              onClick={() => { setCurrentCardIndex((i) => i + 1); setIsFlipped(false); }}
            >
              Next
            </Button>
          </div>
        </div>

        <Card
          className="min-h-[300px] cursor-pointer transition-all duration-500 transform hover:scale-[1.02]"
          style={{
            perspective: '1000px',
          }}
          onClick={() => setIsFlipped(!isFlipped)}
        >
          <CardContent className="p-8 h-full flex flex-col items-center justify-center text-center">
            <div className="mb-4">
              {subject && (
                <Badge variant="outline">
                  {subject.icon} {subject.name}
                </Badge>
              )}
            </div>
            <div className="text-2xl font-medium mb-4">
              {isFlipped ? currentCard.flashcardAnswer : currentCard.content}
            </div>
            <div className="flex items-center gap-2 text-muted-foreground text-sm">
              <FlipHorizontal className="w-4 h-4" />
              <span>Click to flip</span>
            </div>
          </CardContent>
        </Card>

        <div className="flex justify-center gap-4">
          <Button 
            variant="outline" 
            className="text-red-500 border-red-500/30 hover:bg-red-500/10"
            onClick={() => handleFlashcardReview('wrong')}
          >
            Wrong (+5 XP)
          </Button>
          <Button 
            variant="outline" 
            className="text-yellow-500 border-yellow-500/30 hover:bg-yellow-500/10"
            onClick={() => handleFlashcardReview('hard')}
          >
            Hard (+15 XP)
          </Button>
          <Button 
            variant="outline" 
            className="text-green-500 border-green-500/30 hover:bg-green-500/10"
            onClick={() => handleFlashcardReview('easy')}
          >
            Easy (+25 XP)
          </Button>
        </div>

        {/* Review progress indicator */}
        <div className="text-center text-sm text-muted-foreground">
          Session: {reviewStats.correct} correct, {reviewStats.incorrect} incorrect
        </div>
      </div>
    );
  };

  return (
    <div className="space-y-6">
      {/* Header */}
      <div className="flex items-center justify-between flex-wrap gap-4">
        <div>
          <h2 className="text-2xl font-bold flex items-center gap-2">
            <FileText className="w-6 h-6" />
            Notes & Flashcards
          </h2>
          <p className="text-muted-foreground">
            Store formulas, reactions, and create flashcards
          </p>
        </div>
        <Dialog open={isAddOpen} onOpenChange={setIsAddOpen}>
          <DialogTrigger asChild>
            <Button className="neon-glow-cyan" onClick={() => { resetForm(); setIsAddOpen(true); }}>
              <Plus className="w-4 h-4 mr-2" />
              New Note
            </Button>
          </DialogTrigger>
          <DialogContent className="max-w-lg">
            <DialogHeader>
              <DialogTitle>Create Note</DialogTitle>
            </DialogHeader>
            <NoteForm />
          </DialogContent>
        </Dialog>
      </div>

      {/* Filters */}
      <div className="flex flex-wrap gap-4">
        <div className="relative flex-grow max-w-sm">
          <Search className="absolute left-3 top-1/2 -translate-y-1/2 w-4 h-4 text-muted-foreground" />
          <Input
            placeholder="Search notes..."
            value={searchQuery}
            onChange={(e) => setSearchQuery(e.target.value)}
            className="pl-10"
          />
        </div>
        <Select value={selectedSubject} onValueChange={setSelectedSubject}>
          <SelectTrigger className="w-[180px]">
            <SelectValue placeholder="Filter by subject" />
          </SelectTrigger>
          <SelectContent>
            <SelectItem value="all">All Subjects</SelectItem>
            {subjects.map((subject) => (
              <SelectItem key={subject.id} value={subject.id}>
                {subject.icon} {subject.name}
              </SelectItem>
            ))}
          </SelectContent>
        </Select>
        <Select value={selectedTag} onValueChange={setSelectedTag}>
          <SelectTrigger className="w-[150px]">
            <SelectValue placeholder="Filter by tag" />
          </SelectTrigger>
          <SelectContent>
            <SelectItem value="all">All Tags</SelectItem>
            {allTags.map((tag) => (
              <SelectItem key={tag} value={tag}>{tag}</SelectItem>
            ))}
          </SelectContent>
        </Select>
        <Button
          variant={showFlashcards ? 'default' : 'outline'}
          onClick={() => setShowFlashcards(!showFlashcards)}
        >
          <Brain className="w-4 h-4 mr-2" />
          Flashcard Mode
        </Button>
      </div>

      {/* Content */}
      {showFlashcards ? (
        <FlashcardView />
      ) : (
        <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-4">
          {filteredNotes.map((note) => {
            const subject = note.subjectId ? subjects.find((s) => s.id === note.subjectId) : null;
            return (
              <Card key={note.id} className="card-hover group">
                <CardContent className="p-4">
                  <div className="flex items-start justify-between mb-2">
                    <div className="flex items-center gap-2">
                      {note.isFlashcard && (
                        <Brain className="w-4 h-4 text-neon-purple" />
                      )}
                      {note.isFavorite && (
                        <Star className="w-4 h-4 text-yellow-500 fill-yellow-500" />
                      )}
                    </div>
                    <div className="flex gap-1 opacity-0 group-hover:opacity-100 transition-opacity">
                      <Dialog
                        open={editingNote?.id === note.id}
                        onOpenChange={(open) => !open && setEditingNote(null)}
                      >
                        <DialogTrigger asChild>
                          <Button
                            variant="ghost"
                            size="icon"
                            className="h-8 w-8"
                            onClick={() => handleEdit(note)}
                          >
                            <Edit className="w-4 h-4" />
                          </Button>
                        </DialogTrigger>
                        <DialogContent className="max-w-lg">
                          <DialogHeader>
                            <DialogTitle>Edit Note</DialogTitle>
                          </DialogHeader>
                          <NoteForm isEdit />
                        </DialogContent>
                      </Dialog>
                      <Button
                        variant="ghost"
                        size="icon"
                        className="h-8 w-8 text-destructive hover:text-destructive"
                        onClick={() => deleteNote(note.id)}
                      >
                        <Trash2 className="w-4 h-4" />
                      </Button>
                    </div>
                  </div>

                  <h3 className="font-semibold mb-2 line-clamp-1">{note.title}</h3>
                  
                  {subject && (
                    <Badge variant="outline" className="mb-2">
                      {subject.icon} {subject.name}
                    </Badge>
                  )}

                  <p className="text-sm text-muted-foreground line-clamp-3 font-mono">
                    {note.content}
                  </p>

                  {note.tags.length > 0 && (
                    <div className="flex flex-wrap gap-1 mt-3">
                      {note.tags.map((tag) => (
                        <Badge key={tag} variant="secondary" className="text-xs">
                          {tag}
                        </Badge>
                      ))}
                    </div>
                  )}

                  <p className="text-xs text-muted-foreground mt-3">
                    {formatDate(note.updatedAt)}
                  </p>
                </CardContent>
              </Card>
            );
          })}

          {filteredNotes.length === 0 && (
            <Card className="col-span-full border-dashed">
              <CardContent className="flex flex-col items-center justify-center py-12">
                <BookOpen className="w-12 h-12 text-muted-foreground mb-4" />
                <h3 className="text-lg font-semibold mb-2">No notes found</h3>
                <p className="text-muted-foreground text-center">
                  {searchQuery || selectedSubject !== 'all' || selectedTag !== 'all'
                    ? 'Try adjusting your filters'
                    : 'Create your first note to get started'}
                </p>
              </CardContent>
            </Card>
          )}
        </div>
      )}

      {/* Quick Formula Templates */}
      <Card>
        <CardHeader>
          <CardTitle className="flex items-center gap-2 text-base">
            <Sparkles className="w-5 h-5" />
            Quick Chemistry Templates
          </CardTitle>
        </CardHeader>
        <CardContent>
          <div className="flex flex-wrap gap-2">
            {[
              'H₂O → H⁺ + OH⁻',
              'CH₃COOH ⇌ CH₃COO⁻ + H⁺',
              'ΔG = ΔH - TΔS',
              'E = hν',
              'PV = nRT',
              'Kₐ × Kᵦ = Kw',
              'pH = -log[H⁺]',
              'ΔE = q + w',
            ].map((formula) => (
              <Button
                key={formula}
                variant="outline"
                size="sm"
                className="font-mono text-xs"
                onClick={() => {
                  setFormData({ ...formData, content: formData.content + ' ' + formula });
                  setIsAddOpen(true);
                }}
              >
                <Copy className="w-3 h-3 mr-1" />
                {formula}
              </Button>
            ))}
          </div>
        </CardContent>
      </Card>
    </div>
  );
}
