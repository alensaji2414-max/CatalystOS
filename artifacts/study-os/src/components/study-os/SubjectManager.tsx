import { useState } from 'react';
import { useStudyStore, Subject } from '@/lib/study-store';
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card';
import { Button } from '@/components/ui/button';
import { Input } from '@/components/ui/input';
import { Label } from '@/components/ui/label';
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from '@/components/ui/select';
import { Slider } from '@/components/ui/slider';
import { Badge } from '@/components/ui/badge';
import { Dialog, DialogContent, DialogHeader, DialogTitle, DialogTrigger, DialogFooter, DialogClose } from '@/components/ui/dialog';
import { 
  Plus, 
  Edit, 
  Trash2, 
  BookOpen, 
  Clock, 
  Target,
  Beaker,
  FlaskConical,
  Microscope,
  Atom,
  TestTube,
  Gauge
} from 'lucide-react';

const SUBJECT_ICONS = [
  { value: '🧪', label: 'Flask' },
  { value: '⚗️', label: 'Alembic' },
  { value: '🔬', label: 'Microscope' },
  { value: '⚛️', label: 'Atom' },
  { value: '📊', label: 'Chart' },
  { value: '📚', label: 'Books' },
  { value: '🧬', label: 'DNA' },
  { value: '💎', label: 'Crystal' },
  { value: '🌡️', label: 'Thermometer' },
  { value: '⚡', label: 'Energy' },
  { value: '🔋', label: 'Battery' },
  { value: '🧲', label: 'Magnet' },
];

const SUBJECT_COLORS = [
  '#00d4aa', '#00a8e8', '#9d4edd', '#ff6b6b', '#ffd93d',
  '#10b981', '#f472b6', '#60a5fa', '#f97316', '#a3e635',
];

const PRIORITY_OPTIONS: { value: Subject['priority']; label: string; color: string }[] = [
  { value: 'low', label: 'Low', color: 'bg-blue-500/20 text-blue-400' },
  { value: 'medium', label: 'Medium', color: 'bg-green-500/20 text-green-400' },
  { value: 'high', label: 'High', color: 'bg-orange-500/20 text-orange-400' },
  { value: 'critical', label: 'Critical', color: 'bg-red-500/20 text-red-400' },
];

export function SubjectManager() {
  const { subjects, addSubject, updateSubject, deleteSubject } = useStudyStore();
  const [isAddOpen, setIsAddOpen] = useState(false);
  const [editingSubject, setEditingSubject] = useState<Subject | null>(null);
  const [formData, setFormData] = useState({
    name: '',
    icon: '🧪',
    color: '#00d4aa',
    weightage: 25,
    priority: 'medium' as Subject['priority'],
    difficulty: 3,
  });

  const resetForm = () => {
    setFormData({
      name: '',
      icon: '🧪',
      color: '#00d4aa',
      weightage: 25,
      priority: 'medium',
      difficulty: 3,
    });
  };

  const handleAdd = () => {
    if (!formData.name.trim()) return;
    addSubject({
      name: formData.name,
      icon: formData.icon,
      color: formData.color,
      weightage: formData.weightage,
      priority: formData.priority,
      difficulty: formData.difficulty,
    });
    resetForm();
    setIsAddOpen(false);
  };

  const handleUpdate = () => {
    if (!editingSubject || !formData.name.trim()) return;
    updateSubject(editingSubject.id, {
      name: formData.name,
      icon: formData.icon,
      color: formData.color,
      weightage: formData.weightage,
      priority: formData.priority,
      difficulty: formData.difficulty,
    });
    setEditingSubject(null);
    resetForm();
  };

  const handleEdit = (subject: Subject) => {
    setEditingSubject(subject);
    setFormData({
      name: subject.name,
      icon: subject.icon,
      color: subject.color,
      weightage: subject.weightage,
      priority: subject.priority,
      difficulty: subject.difficulty,
    });
  };

  const totalWeightage = subjects.reduce((sum, s) => sum + s.weightage, 0);

  const formatTime = (minutes: number) => {
    const hours = Math.floor(minutes / 60);
    const mins = minutes % 60;
    if (hours === 0) return `${mins}m`;
    return `${hours}h ${mins}m`;
  };

  const SubjectForm = ({ isEdit = false }: { isEdit?: boolean }) => (
    <div className="space-y-6">
      <div className="space-y-2">
        <Label>Subject Name</Label>
        <Input
          placeholder="e.g., Organic Chemistry"
          value={formData.name}
          onChange={(e) => setFormData({ ...formData, name: e.target.value })}
        />
      </div>

      <div className="space-y-2">
        <Label>Icon</Label>
        <div className="grid grid-cols-6 gap-2">
          {SUBJECT_ICONS.map((icon) => (
            <Button
              key={icon.value}
              variant={formData.icon === icon.value ? 'default' : 'outline'}
              className="h-10 text-xl"
              onClick={() => setFormData({ ...formData, icon: icon.value })}
            >
              {icon.value}
            </Button>
          ))}
        </div>
      </div>

      <div className="space-y-2">
        <Label>Color</Label>
        <div className="grid grid-cols-5 gap-2">
          {SUBJECT_COLORS.map((color) => (
            <Button
              key={color}
              variant="outline"
              className={`h-10 ${formData.color === color ? 'ring-2 ring-primary ring-offset-2 ring-offset-background' : ''}`}
              style={{ backgroundColor: color }}
              onClick={() => setFormData({ ...formData, color })}
            />
          ))}
        </div>
      </div>

      <div className="space-y-2">
        <Label>Weightage: {formData.weightage}%</Label>
        <Slider
          value={[formData.weightage]}
          onValueChange={([value]) => setFormData({ ...formData, weightage: value })}
          min={5}
          max={50}
          step={5}
        />
        <p className="text-xs text-muted-foreground">
          How much of your study time should this subject take?
        </p>
      </div>

      <div className="space-y-2">
        <Label>Priority</Label>
        <Select
          value={formData.priority}
          onValueChange={(value) => setFormData({ ...formData, priority: value as Subject['priority'] })}
        >
          <SelectTrigger>
            <SelectValue />
          </SelectTrigger>
          <SelectContent>
            {PRIORITY_OPTIONS.map((option) => (
              <SelectItem key={option.value} value={option.value}>
                <div className="flex items-center gap-2">
                  <div className={`px-2 py-0.5 rounded text-xs ${option.color}`}>
                    {option.label}
                  </div>
                </div>
              </SelectItem>
            ))}
          </SelectContent>
        </Select>
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
        <div className="flex justify-between text-xs text-muted-foreground">
          <span>Easy</span>
          <span>Hard</span>
        </div>
      </div>

      <DialogFooter>
        <DialogClose asChild>
          <Button variant="outline">Cancel</Button>
        </DialogClose>
        <Button onClick={isEdit ? handleUpdate : handleAdd}>
          {isEdit ? 'Save Changes' : 'Add Subject'}
        </Button>
      </DialogFooter>
    </div>
  );

  return (
    <div className="space-y-6">
      {/* Header */}
      <div className="flex items-center justify-between">
        <div>
          <h2 className="text-2xl font-bold flex items-center gap-2">
            <BookOpen className="w-6 h-6" />
            Subjects
          </h2>
          <p className="text-muted-foreground">
            Manage your study subjects and their priorities
          </p>
        </div>
        <Dialog open={isAddOpen} onOpenChange={setIsAddOpen}>
          <DialogTrigger asChild>
            <Button className="neon-glow-cyan" onClick={() => { resetForm(); setIsAddOpen(true); }}>
              <Plus className="w-4 h-4 mr-2" />
              Add Subject
            </Button>
          </DialogTrigger>
          <DialogContent className="max-w-md">
            <DialogHeader>
              <DialogTitle>Add New Subject</DialogTitle>
            </DialogHeader>
            <SubjectForm />
          </DialogContent>
        </Dialog>
      </div>

      {/* Weightage Overview */}
      <Card>
        <CardHeader>
          <CardTitle className="text-sm">Weightage Distribution</CardTitle>
        </CardHeader>
        <CardContent>
          <div className="h-4 rounded-full bg-muted flex overflow-hidden">
            {subjects.map((subject) => (
              <div
                key={subject.id}
                className="h-full transition-all duration-500"
                style={{
                  width: `${(subject.weightage / Math.max(totalWeightage, 100)) * 100}%`,
                  backgroundColor: subject.color,
                }}
                title={`${subject.name}: ${subject.weightage}%`}
              />
            ))}
          </div>
          <div className="flex flex-wrap gap-2 mt-3">
            {subjects.map((subject) => (
              <div key={subject.id} className="flex items-center gap-1 text-xs">
                <div
                  className="w-3 h-3 rounded-full"
                  style={{ backgroundColor: subject.color }}
                />
                <span>{subject.name}: {subject.weightage}%</span>
              </div>
            ))}
          </div>
        </CardContent>
      </Card>

      {/* Subject Cards */}
      <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
        {subjects.map((subject) => (
          <Card key={subject.id} className="card-hover overflow-hidden">
            <div
              className="h-2"
              style={{ backgroundColor: subject.color }}
            />
            <CardContent className="p-4">
              <div className="flex items-start justify-between">
                <div className="flex items-center gap-3">
                  <div
                    className="w-12 h-12 rounded-lg flex items-center justify-center text-2xl"
                    style={{ backgroundColor: `${subject.color}20` }}
                  >
                    {subject.icon}
                  </div>
                  <div>
                    <h3 className="font-semibold">{subject.name}</h3>
                    <div className="flex items-center gap-2 mt-1">
                      <Badge
                        variant="outline"
                        className={PRIORITY_OPTIONS.find((p) => p.value === subject.priority)?.color}
                      >
                        {subject.priority}
                      </Badge>
                      <span className="text-xs text-muted-foreground">
                        Difficulty: {'⭐'.repeat(subject.difficulty)}
                      </span>
                    </div>
                  </div>
                </div>
                <div className="flex gap-1">
                  <Dialog
                    open={editingSubject?.id === subject.id}
                    onOpenChange={(open) => {
                      if (!open) setEditingSubject(null);
                    }}
                  >
                    <DialogTrigger asChild>
                      <Button
                        variant="ghost"
                        size="icon"
                        onClick={() => handleEdit(subject)}
                      >
                        <Edit className="w-4 h-4" />
                      </Button>
                    </DialogTrigger>
                    <DialogContent className="max-w-md">
                      <DialogHeader>
                        <DialogTitle>Edit Subject</DialogTitle>
                      </DialogHeader>
                      <SubjectForm isEdit />
                    </DialogContent>
                  </Dialog>
                  <Button
                    variant="ghost"
                    size="icon"
                    className="text-destructive hover:text-destructive"
                    onClick={() => deleteSubject(subject.id)}
                  >
                    <Trash2 className="w-4 h-4" />
                  </Button>
                </div>
              </div>

              <div className="grid grid-cols-3 gap-4 mt-4 pt-4 border-t">
                <div className="text-center">
                  <div className="flex items-center justify-center gap-1 text-muted-foreground mb-1">
                    <Gauge className="w-4 h-4" />
                    <span className="text-xs">Weight</span>
                  </div>
                  <p className="font-bold">{subject.weightage}%</p>
                </div>
                <div className="text-center">
                  <div className="flex items-center justify-center gap-1 text-muted-foreground mb-1">
                    <Clock className="w-4 h-4" />
                    <span className="text-xs">Total Time</span>
                  </div>
                  <p className="font-bold">{formatTime(subject.totalMinutes)}</p>
                </div>
                <div className="text-center">
                  <div className="flex items-center justify-center gap-1 text-muted-foreground mb-1">
                    <Target className="w-4 h-4" />
                    <span className="text-xs">Sessions</span>
                  </div>
                  <p className="font-bold">
                    {Math.floor(subject.totalMinutes / 25)}
                  </p>
                </div>
              </div>
            </CardContent>
          </Card>
        ))}
      </div>

      {subjects.length === 0 && (
        <Card className="border-dashed">
          <CardContent className="flex flex-col items-center justify-center py-12">
            <Beaker className="w-12 h-12 text-muted-foreground mb-4" />
            <h3 className="text-lg font-semibold mb-2">No subjects yet</h3>
            <p className="text-muted-foreground text-center mb-4">
              Add your first subject to start tracking your study progress
            </p>
            <Button onClick={() => setIsAddOpen(true)}>
              <Plus className="w-4 h-4 mr-2" />
              Add Your First Subject
            </Button>
          </CardContent>
        </Card>
      )}
    </div>
  );
}
