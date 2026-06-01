
import { useState, useRef } from "react";
import { useStudyStore } from "@/lib/study-store";
import { Button } from "@/components/ui/button";
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from "@/components/ui/card";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import { Switch } from "@/components/ui/switch";
import { Slider } from "@/components/ui/slider";
import { Separator } from "@/components/ui/separator";
import {
  AlertDialog,
  AlertDialogAction,
  AlertDialogCancel,
  AlertDialogContent,
  AlertDialogDescription,
  AlertDialogFooter,
  AlertDialogHeader,
  AlertDialogTitle,
  AlertDialogTrigger,
} from "@/components/ui/alert-dialog";
import {
  Download,
  Upload,
  Trash2,
  Volume2,
  Database,
  Shield,
  Zap,
  User,
  Camera,
  Github,
} from "lucide-react";

export function Settings() {
  const { pomodoroSettings, updatePomodoroSettings, exportData, importData, resetAllData, creatorProfile, updateCreatorProfile } = useStudyStore();
  const [importFile, setImportFile] = useState<File | null>(null);
  const imageInputRef = useRef<HTMLInputElement>(null);

  const handleExport = () => {
    const data = exportData();
    const blob = new Blob([data], { type: "application/json" });
    const url = URL.createObjectURL(blob);
    const a = document.createElement("a");
    a.href = url;
    a.download = `catalyst-os-backup-${new Date().toISOString().split("T")[0]}.json`;
    a.click();
    URL.revokeObjectURL(url);
  };

  const handleProfileImageUpload = (e: React.ChangeEvent<HTMLInputElement>) => {
    const file = e.target.files?.[0];
    if (!file) return;
    const reader = new FileReader();
    reader.onload = (ev) => {
      const result = ev.target?.result;
      if (typeof result === "string") {
        updateCreatorProfile({ profileImage: result });
      }
    };
    reader.readAsDataURL(file);
  };

  const handleImport = async () => {
    if (!importFile) return;
    const text = await importFile.text();
    const success = importData(text);
    if (success) {
      alert("Data imported successfully!");
      setImportFile(null);
    } else {
      alert("Failed to import data. Invalid format.");
    }
  };

  return (
    <div className="space-y-6">
      <div>
        <h2 className="text-2xl font-bold text-foreground flex items-center gap-2">
          <Zap className="h-6 w-6 text-primary" />
          Laboratory Settings
        </h2>
        <p className="text-muted-foreground">Configure your research environment</p>
      </div>

      {/* Creator Profile */}
      <Card className="border-primary/20 bg-card/50 backdrop-blur">
        <CardHeader>
          <CardTitle className="flex items-center gap-2">
            <User className="h-5 w-5 text-cyan-400" />
            Creator Profile
          </CardTitle>
          <CardDescription>Your researcher identity and profile image</CardDescription>
        </CardHeader>
        <CardContent className="space-y-4">
          <div className="flex items-center gap-4">
            <div className="relative flex-shrink-0">
              {creatorProfile.profileImage ? (
                <img
                  src={creatorProfile.profileImage}
                  alt={creatorProfile.name}
                  className="h-16 w-16 rounded-full object-cover ring-2 ring-primary/40"
                />
              ) : (
                <div className="h-16 w-16 rounded-full bg-gradient-to-br from-primary/20 to-cyan-500/10 flex items-center justify-center ring-2 ring-primary/20">
                  <User className="h-7 w-7 text-primary/50" />
                </div>
              )}
              <button
                onClick={() => imageInputRef.current?.click()}
                className="absolute -bottom-1 -right-1 h-6 w-6 rounded-full bg-primary flex items-center justify-center hover:bg-primary/80 transition-colors cursor-pointer"
                title="Upload profile image"
              >
                <Camera className="h-3 w-3 text-primary-foreground" />
              </button>
              <input
                ref={imageInputRef}
                type="file"
                accept="image/*"
                className="hidden"
                onChange={handleProfileImageUpload}
              />
            </div>
            <div className="space-y-0.5">
              <p className="font-medium text-foreground">{creatorProfile.name}</p>
              <p className="text-sm text-muted-foreground">{creatorProfile.role}</p>
              <p className="text-xs text-muted-foreground font-mono">{creatorProfile.researchId}</p>
            </div>
          </div>
          <Separator className="bg-primary/20" />
          <div className="grid gap-3 sm:grid-cols-3">
            <div className="space-y-1.5">
              <Label>Name</Label>
              <Input
                value={creatorProfile.name}
                onChange={(e) => updateCreatorProfile({ name: e.target.value })}
                placeholder="Your name"
              />
            </div>
            <div className="space-y-1.5">
              <Label>Role</Label>
              <Input
                value={creatorProfile.role}
                onChange={(e) => updateCreatorProfile({ role: e.target.value })}
                placeholder="Your role"
              />
            </div>
            <div className="space-y-1.5">
              <Label>Research ID</Label>
              <Input
                value={creatorProfile.researchId}
                onChange={(e) => updateCreatorProfile({ researchId: e.target.value })}
                placeholder="e.g. ALN-001"
              />
            </div>
          </div>
          <div className="space-y-1.5">
            <Label className="flex items-center gap-1.5">
              <Github className="h-3.5 w-3.5" />
              GitHub Profile URL
            </Label>
            <Input
              value={creatorProfile.githubUrl ?? ''}
              onChange={(e) => updateCreatorProfile({ githubUrl: e.target.value || undefined })}
              placeholder="https://github.com/yourusername"
            />
          </div>
          {creatorProfile.profileImage && (
            <Button
              variant="ghost"
              size="sm"
              className="text-destructive hover:text-destructive"
              onClick={() => updateCreatorProfile({ profileImage: undefined })}
            >
              Remove profile image
            </Button>
          )}
        </CardContent>
      </Card>

      <div className="grid gap-6 md:grid-cols-2">
        {/* Sound Settings */}
        <Card className="border-primary/20 bg-card/50 backdrop-blur">
          <CardHeader>
            <CardTitle className="flex items-center gap-2">
              <Volume2 className="h-5 w-5 text-cyan-400" />
              Sound Settings
            </CardTitle>
            <CardDescription>Configure audio feedback</CardDescription>
          </CardHeader>
          <CardContent className="space-y-6">
            <div className="flex items-center justify-between">
              <Label htmlFor="sound-enabled">Enable Sounds</Label>
              <Switch
                id="sound-enabled"
                checked={pomodoroSettings.soundEnabled}
                onCheckedChange={(checked) => updatePomodoroSettings({ soundEnabled: checked })}
              />
            </div>
          </CardContent>
        </Card>

        {/* Pomodoro Settings */}
        <Card className="border-primary/20 bg-card/50 backdrop-blur">
          <CardHeader>
            <CardTitle className="flex items-center gap-2">
              <Zap className="h-5 w-5 text-primary" />
              Pomodoro Settings
            </CardTitle>
            <CardDescription>Default timer durations</CardDescription>
          </CardHeader>
          <CardContent className="space-y-4">
            <div className="space-y-2">
              <Label>Focus Duration: {pomodoroSettings.workDuration} min</Label>
              <Slider
                value={[pomodoroSettings.workDuration]}
                onValueChange={([v]) => updatePomodoroSettings({ workDuration: v })}
                min={15}
                max={90}
                step={5}
              />
            </div>
            <div className="space-y-2">
              <Label>Short Break: {pomodoroSettings.shortBreakDuration} min</Label>
              <Slider
                value={[pomodoroSettings.shortBreakDuration]}
                onValueChange={([v]) => updatePomodoroSettings({ shortBreakDuration: v })}
                min={3}
                max={15}
                step={1}
              />
            </div>
            <div className="space-y-2">
              <Label>Long Break: {pomodoroSettings.longBreakDuration} min</Label>
              <Slider
                value={[pomodoroSettings.longBreakDuration]}
                onValueChange={([v]) => updatePomodoroSettings({ longBreakDuration: v })}
                min={10}
                max={45}
                step={5}
              />
            </div>
            <div className="flex items-center justify-between pt-2">
              <Label htmlFor="auto-break">Auto-start Breaks</Label>
              <Switch
                id="auto-break"
                checked={pomodoroSettings.autoStartBreaks}
                onCheckedChange={(checked) => updatePomodoroSettings({ autoStartBreaks: checked })}
              />
            </div>
            <div className="flex items-center justify-between">
              <Label htmlFor="auto-work">Auto-start Work</Label>
              <Switch
                id="auto-work"
                checked={pomodoroSettings.autoStartWork}
                onCheckedChange={(checked) => updatePomodoroSettings({ autoStartWork: checked })}
              />
            </div>
          </CardContent>
        </Card>
      </div>

      <Separator className="bg-primary/20" />

      {/* Data Management */}
      <Card className="border-primary/20 bg-card/50 backdrop-blur">
        <CardHeader>
          <CardTitle className="flex items-center gap-2">
            <Database className="h-5 w-5 text-green-400" />
            Data Management
          </CardTitle>
          <CardDescription>Export, import, or reset your data</CardDescription>
        </CardHeader>
        <CardContent className="space-y-4">
          <div className="flex flex-wrap gap-4">
            <Button onClick={handleExport} variant="outline" className="gap-2">
              <Download className="h-4 w-4" />
              Export Data
            </Button>

            <div className="flex gap-2">
              <Input
                type="file"
                accept=".json"
                onChange={(e) => setImportFile(e.target.files?.[0] || null)}
                className="max-w-[200px]"
              />
              <Button
                onClick={handleImport}
                disabled={!importFile}
                variant="outline"
                className="gap-2"
              >
                <Upload className="h-4 w-4" />
                Import
              </Button>
            </div>
          </div>

          <Separator className="bg-primary/20" />

          <div className="flex items-center justify-between">
            <div>
              <p className="font-medium text-destructive">Danger Zone</p>
              <p className="text-sm text-muted-foreground">
                This will permanently delete all your data
              </p>
            </div>
            <AlertDialog>
              <AlertDialogTrigger asChild>
                <Button variant="destructive" className="gap-2">
                  <Trash2 className="h-4 w-4" />
                  Reset All Data
                </Button>
              </AlertDialogTrigger>
              <AlertDialogContent>
                <AlertDialogHeader>
                  <AlertDialogTitle>Are you absolutely sure?</AlertDialogTitle>
                  <AlertDialogDescription>
                    This action cannot be undone. This will permanently delete all your
                    study data, progress, notes, and achievements.
                  </AlertDialogDescription>
                </AlertDialogHeader>
                <AlertDialogFooter>
                  <AlertDialogCancel>Cancel</AlertDialogCancel>
                  <AlertDialogAction
                    onClick={resetAllData}
                    className="bg-destructive text-destructive-foreground"
                  >
                    Yes, delete everything
                  </AlertDialogAction>
                </AlertDialogFooter>
              </AlertDialogContent>
            </AlertDialog>
          </div>
        </CardContent>
      </Card>

      {/* Keyboard Shortcuts */}
      <Card className="border-primary/20 bg-card/50 backdrop-blur">
        <CardHeader>
          <CardTitle className="flex items-center gap-2">
            <Shield className="h-5 w-5 text-orange-400" />
            Keyboard Shortcuts
          </CardTitle>
        </CardHeader>
        <CardContent>
          <div className="grid gap-2 sm:grid-cols-2">
            {[
              { keys: "Space", action: "Start/Pause Timer" },
              { keys: "R", action: "Reset Timer" },
              { keys: "N", action: "New Note" },
              { keys: "S", action: "Save Current" },
              { keys: "1-6", action: "Navigate Sections" },
              { keys: "Esc", action: "Close Modal" },
            ].map(({ keys, action }) => (
              <div key={keys} className="flex items-center justify-between p-2 rounded bg-muted/50">
                <span className="text-sm text-muted-foreground">{action}</span>
                <kbd className="px-2 py-1 text-xs bg-background rounded border border-primary/30">
                  {keys}
                </kbd>
              </div>
            ))}
          </div>
        </CardContent>
      </Card>
    </div>
  );
}
