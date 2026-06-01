import { useMemo, useRef, useState } from 'react';
import { useStudyStore } from '@/lib/study-store';
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card';
import { Tabs, TabsContent, TabsList, TabsTrigger } from '@/components/ui/tabs';
import { Button } from '@/components/ui/button';
import {
  DropdownMenu,
  DropdownMenuContent,
  DropdownMenuItem,
  DropdownMenuTrigger,
} from '@/components/ui/dropdown-menu';
import { motion, AnimatePresence } from 'framer-motion';
import { 
  BarChart, 
  Bar, 
  XAxis, 
  YAxis, 
  CartesianGrid, 
  Tooltip, 
  ResponsiveContainer,
  LineChart,
  Line,
  PieChart,
  Pie,
  Cell,
  AreaChart,
  Area,
  RadarChart,
  PolarGrid,
  PolarAngleAxis,
  PolarRadiusAxis,
  Radar
} from 'recharts';
import { 
  BarChart3, 
  TrendingUp, 
  Calendar,
  Clock,
  Target,
  Flame,
  BookOpen,
  Activity,
  Sparkles,
  Zap,
  Download,
  Loader2,
  FileImage,
  FileText,
} from 'lucide-react';

const CHART_COLORS = ['#00dcbe', '#0ea5e9', '#a855f7', '#f97316', '#eab308', '#10b981'];

const containerVariants = {
  hidden: { opacity: 0 },
  visible: {
    opacity: 1,
    transition: { staggerChildren: 0.08, delayChildren: 0.1 }
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

export function Analytics() {
  const { dailyData, subjects, stats } = useStudyStore();
  const containerRef = useRef<HTMLDivElement>(null);
  const [exporting, setExporting] = useState<'png' | 'pdf' | null>(null);

  const handleExport = async (format: 'png' | 'pdf') => {
    if (!containerRef.current || exporting) return;
    setExporting(format);
    try {
      const html2canvas = (await import('html2canvas')).default;
      const canvas = await html2canvas(containerRef.current, {
        backgroundColor: '#060812',
        scale: 2,
        useCORS: true,
        allowTaint: true,
        logging: false,
      });

      const date = new Date().toISOString().split('T')[0];

      if (format === 'png') {
        const link = document.createElement('a');
        link.download = `catalyst-analytics-${date}.png`;
        link.href = canvas.toDataURL('image/png');
        link.click();
      } else {
        const { jsPDF } = await import('jspdf');
        const imgData = canvas.toDataURL('image/png');
        const pdf = new jsPDF({
          orientation: canvas.width > canvas.height ? 'landscape' : 'portrait',
          unit: 'px',
          format: [canvas.width / 2, canvas.height / 2],
        });
        pdf.addImage(imgData, 'PNG', 0, 0, canvas.width / 2, canvas.height / 2);
        pdf.save(`catalyst-analytics-${date}.pdf`);
      }
    } finally {
      setExporting(null);
    }
  };

  // Process data for charts
  const last7Days = useMemo(() => {
    const days = [];
    for (let i = 6; i >= 0; i--) {
      const date = new Date();
      date.setDate(date.getDate() - i);
      const dateStr = date.toISOString().split('T')[0];
      const dayData = dailyData.find((d) => d.date === dateStr);
      days.push({
        date: date.toLocaleDateString('en-US', { weekday: 'short' }),
        fullDate: dateStr,
        minutes: dayData?.totalMinutes || 0,
        sessions: dayData?.sessions || 0,
        xp: dayData?.xpEarned || 0,
      });
    }
    return days;
  }, [dailyData]);

  const last30Days = useMemo(() => {
    const days = [];
    for (let i = 29; i >= 0; i--) {
      const date = new Date();
      date.setDate(date.getDate() - i);
      const dateStr = date.toISOString().split('T')[0];
      const dayData = dailyData.find((d) => d.date === dateStr);
      days.push({
        date: date.getDate().toString(),
        fullDate: dateStr,
        minutes: dayData?.totalMinutes || 0,
        sessions: dayData?.sessions || 0,
        xp: dayData?.xpEarned || 0,
      });
    }
    return days;
  }, [dailyData]);

  const subjectDistribution = useMemo(() => {
    return subjects.map((subject, i) => ({
      name: subject.name,
      value: subject.totalMinutes,
      color: subject.color || CHART_COLORS[i % CHART_COLORS.length],
      icon: subject.icon,
    })).filter((s) => s.value > 0);
  }, [subjects]);

  const weeklyHeatmap = useMemo(() => {
    const heatmap: Record<string, Record<string, number>> = {};
    const hours = ['6-9', '9-12', '12-15', '15-18', '18-21', '21-24'];
    const days = ['Sun', 'Mon', 'Tue', 'Wed', 'Thu', 'Fri', 'Sat'];
    
    days.forEach((day) => {
      heatmap[day] = {};
      hours.forEach((hour) => {
        heatmap[day][hour] = Math.floor(Math.random() * 60); // Simulated data
      });
    });
    
    return { heatmap, hours, days };
  }, []);

  const performanceRadar = useMemo(() => {
    return [
      { subject: 'Focus', value: Math.min(stats.focusEnergy, 100), fullMark: 100 },
      { subject: 'Consistency', value: stats.consistencyScore, fullMark: 100 },
      { subject: 'Momentum', value: stats.weeklyMomentum, fullMark: 100 },
      { subject: 'Discipline', value: stats.disciplineRating, fullMark: 100 },
      { subject: 'Mastery', value: stats.knowledgeMastery, fullMark: 100 },
    ];
  }, [stats]);

  const totalMinutesLast7Days = last7Days.reduce((sum, d) => sum + d.minutes, 0);
  const totalSessionsLast7Days = last7Days.reduce((sum, d) => sum + d.sessions, 0);
  const avgMinutesPerDay = Math.round(totalMinutesLast7Days / 7);
  const totalXpLast7Days = last7Days.reduce((sum, d) => sum + d.xp, 0);

  const formatMinutes = (minutes: number) => {
    if (minutes < 60) return `${minutes}m`;
    const hours = Math.floor(minutes / 60);
    const mins = minutes % 60;
    return mins > 0 ? `${hours}h ${mins}m` : `${hours}h`;
  };

  const CustomTooltip = ({ active, payload, label }: { active?: boolean; payload?: { value: number; name: string; color: string }[]; label?: string }) => {
    if (active && payload && payload.length) {
      return (
        <div className="bg-card border border-primary/20 p-3 rounded-lg shadow-lg backdrop-blur-sm">
          <p className="font-medium mb-1 text-foreground">{label}</p>
          {payload.map((entry, index) => (
            <p key={index} style={{ color: entry.color }} className="text-sm font-mono">
              {entry.name}: {entry.name.includes('Minutes') ? formatMinutes(entry.value) : entry.value}
            </p>
          ))}
        </div>
      );
    }
    return null;
  };

  return (
    <motion.div 
      ref={containerRef}
      className="space-y-6"
      variants={containerVariants}
      initial="hidden"
      animate="visible"
    >
      {/* Header */}
      <motion.div variants={itemVariants} className="flex items-start justify-between gap-4">
        <div>
          <h2 className="text-2xl font-bold flex items-center gap-2">
            <motion.div
              animate={{ rotate: [0, 10, -10, 0] }}
              transition={{ duration: 2, repeat: Infinity, repeatDelay: 3 }}
            >
              <BarChart3 className="w-6 h-6 text-primary" />
            </motion.div>
            <span className="neon-text-cyan">Analytics Dashboard</span>
          </h2>
          <p className="text-muted-foreground">
            Track your study patterns and performance
          </p>
        </div>

        <DropdownMenu>
          <DropdownMenuTrigger asChild>
            <Button
              variant="outline"
              size="sm"
              className="border-primary/30 hover:border-primary/60 hover:bg-primary/10 gap-2 flex-shrink-0"
              disabled={!!exporting}
            >
              {exporting ? (
                <Loader2 className="h-4 w-4 animate-spin" />
              ) : (
                <Download className="h-4 w-4 text-primary" />
              )}
              {exporting ? 'Exporting…' : 'Export'}
            </Button>
          </DropdownMenuTrigger>
          <DropdownMenuContent align="end" className="w-44">
            <DropdownMenuItem
              className="gap-2 cursor-pointer"
              onClick={() => handleExport('png')}
            >
              <FileImage className="h-4 w-4 text-cyan-400" />
              Save as PNG
            </DropdownMenuItem>
            <DropdownMenuItem
              className="gap-2 cursor-pointer"
              onClick={() => handleExport('pdf')}
            >
              <FileText className="h-4 w-4 text-purple-400" />
              Save as PDF
            </DropdownMenuItem>
          </DropdownMenuContent>
        </DropdownMenu>
      </motion.div>

      {/* Quick Stats */}
      <motion.div 
        className="grid grid-cols-2 md:grid-cols-4 gap-4"
        variants={containerVariants}
      >
        {[
          { icon: Clock, value: formatMinutes(totalMinutesLast7Days), label: "Total study time", sublabel: "Last 7 Days", color: "text-primary", gradient: "from-primary/20 to-primary/5", borderColor: "border-primary/30" },
          { icon: Target, value: totalSessionsLast7Days, label: "Completed this week", sublabel: "Sessions", color: "text-green-400", gradient: "from-green-500/20 to-green-500/5", borderColor: "border-green-500/30" },
          { icon: Activity, value: formatMinutes(avgMinutesPerDay), label: "Per day this week", sublabel: "Daily Average", color: "text-purple-400", gradient: "from-purple-500/20 to-purple-500/5", borderColor: "border-purple-500/30" },
          { icon: Flame, value: totalXpLast7Days.toLocaleString(), label: "This week", sublabel: "XP Earned", color: "text-orange-400", gradient: "from-orange-500/20 to-orange-500/5", borderColor: "border-orange-500/30" },
        ].map((stat, index) => (
          <motion.div key={stat.sublabel} variants={itemVariants}>
            <Card className={`card-hover border ${stat.borderColor} bg-gradient-to-br ${stat.gradient} backdrop-blur`}>
              <CardContent className="p-4">
                <div className="flex items-center gap-2 text-muted-foreground mb-1">
                  <motion.div
                    whileHover={{ scale: 1.2, rotate: 10 }}
                    transition={{ type: "spring", stiffness: 400 }}
                  >
                    <stat.icon className={`w-4 h-4 ${stat.color}`} />
                  </motion.div>
                  <span className="text-xs">{stat.sublabel}</span>
                </div>
                <motion.p 
                  className={`text-2xl font-bold font-mono ${stat.color}`}
                  initial={{ opacity: 0, scale: 0.5 }}
                  animate={{ opacity: 1, scale: 1 }}
                  transition={{ delay: 0.2 + index * 0.1, type: "spring" }}
                >
                  {stat.value}
                </motion.p>
                <p className="text-xs text-muted-foreground">{stat.label}</p>
              </CardContent>
            </Card>
          </motion.div>
        ))}
      </motion.div>

      {/* Charts */}
      <motion.div variants={itemVariants}>
        <Tabs defaultValue="weekly" className="space-y-4">
          <TabsList className="bg-muted/50 backdrop-blur">
            <TabsTrigger value="weekly">Weekly View</TabsTrigger>
            <TabsTrigger value="monthly">Monthly View</TabsTrigger>
            <TabsTrigger value="subjects">Subjects</TabsTrigger>
            <TabsTrigger value="performance">Performance</TabsTrigger>
          </TabsList>

          <AnimatePresence mode="wait">
            <TabsContent value="weekly" className="space-y-4">
              <motion.div 
                className="grid grid-cols-1 lg:grid-cols-2 gap-4"
                initial={{ opacity: 0, y: 20 }}
                animate={{ opacity: 1, y: 0 }}
                exit={{ opacity: 0, y: -20 }}
                transition={{ duration: 0.3 }}
              >
                {/* Study Time Bar Chart */}
                <Card className="border-primary/20 bg-card/50 backdrop-blur">
                  <CardHeader>
                    <CardTitle className="text-base flex items-center gap-2">
                      <Clock className="w-4 h-4 text-primary" />
                      Study Time (Last 7 Days)
                    </CardTitle>
                  </CardHeader>
                  <CardContent>
                    <div className="h-[250px]">
                      <ResponsiveContainer width="100%" height="100%">
                        <BarChart data={last7Days}>
                          <defs>
                            <linearGradient id="barGradient" x1="0" y1="0" x2="0" y2="1">
                              <stop offset="0%" stopColor="#00dcbe" stopOpacity={1}/>
                              <stop offset="100%" stopColor="#00dcbe" stopOpacity={0.5}/>
                            </linearGradient>
                          </defs>
                          <CartesianGrid strokeDasharray="3 3" stroke="rgba(255,255,255,0.1)" />
                          <XAxis dataKey="date" stroke="#888" fontSize={12} />
                          <YAxis stroke="#888" fontSize={12} tickFormatter={(v) => `${v}m`} />
                          <Tooltip content={<CustomTooltip />} />
                          <Bar 
                            dataKey="minutes" 
                            name="Minutes"
                            fill="url(#barGradient)"
                            radius={[4, 4, 0, 0]}
                          />
                        </BarChart>
                      </ResponsiveContainer>
                    </div>
                  </CardContent>
                </Card>

                {/* Sessions & XP Line Chart */}
                <Card className="border-primary/20 bg-card/50 backdrop-blur">
                  <CardHeader>
                    <CardTitle className="text-base flex items-center gap-2">
                      <TrendingUp className="w-4 h-4 text-cyan-400" />
                      Sessions & XP Trend
                    </CardTitle>
                  </CardHeader>
                  <CardContent>
                    <div className="h-[250px]">
                      <ResponsiveContainer width="100%" height="100%">
                        <LineChart data={last7Days}>
                          <CartesianGrid strokeDasharray="3 3" stroke="rgba(255,255,255,0.1)" />
                          <XAxis dataKey="date" stroke="#888" fontSize={12} />
                          <YAxis yAxisId="left" stroke="#0ea5e9" fontSize={12} />
                          <YAxis yAxisId="right" orientation="right" stroke="#a855f7" fontSize={12} />
                          <Tooltip content={<CustomTooltip />} />
                          <Line 
                            yAxisId="left"
                            type="monotone" 
                            dataKey="sessions" 
                            name="Sessions"
                            stroke="#0ea5e9" 
                            strokeWidth={2}
                            dot={{ fill: '#0ea5e9', strokeWidth: 2 }}
                            activeDot={{ r: 6, fill: '#0ea5e9' }}
                          />
                          <Line 
                            yAxisId="right"
                            type="monotone" 
                            dataKey="xp" 
                            name="XP"
                            stroke="#a855f7" 
                            strokeWidth={2}
                            dot={{ fill: '#a855f7', strokeWidth: 2 }}
                            activeDot={{ r: 6, fill: '#a855f7' }}
                          />
                        </LineChart>
                      </ResponsiveContainer>
                    </div>
                  </CardContent>
                </Card>
              </motion.div>

              {/* Heatmap */}
              <motion.div
                initial={{ opacity: 0, y: 20 }}
                animate={{ opacity: 1, y: 0 }}
                transition={{ delay: 0.2 }}
              >
                <Card className="border-primary/20 bg-card/50 backdrop-blur">
                  <CardHeader>
                    <CardTitle className="text-base flex items-center gap-2">
                      <Calendar className="w-4 h-4 text-green-400" />
                      Study Heatmap
                    </CardTitle>
                  </CardHeader>
                  <CardContent>
                    <div className="overflow-x-auto">
                      <div className="min-w-[500px]">
                        <div className="grid grid-cols-8 gap-1 mb-2">
                          {['', ...weeklyHeatmap.days].map((day, i) => (
                            <div key={i} className="text-center text-xs text-muted-foreground font-medium">
                              {day}
                            </div>
                          ))}
                        </div>
                        {weeklyHeatmap.hours.map((hour, hourIndex) => (
                          <div key={hour} className="grid grid-cols-8 gap-1 mb-1">
                            <div className="text-xs text-muted-foreground flex items-center">{hour}</div>
                            {weeklyHeatmap.days.map((day, dayIndex) => {
                              const value = weeklyHeatmap.heatmap[day][hour];
                              const intensity = Math.min(value / 60, 1);
                              return (
                                <motion.div
                                  key={`${day}-${hour}`}
                                  initial={{ opacity: 0, scale: 0 }}
                                  animate={{ opacity: 1, scale: 1 }}
                                  transition={{ delay: (hourIndex * 7 + dayIndex) * 0.02 }}
                                  whileHover={{ scale: 1.2 }}
                                  className="h-8 rounded cursor-pointer transition-transform"
                                  style={{
                                    backgroundColor: `rgba(0, 220, 190, ${intensity * 0.8 + 0.1})`,
                                  }}
                                  title={`${day} ${hour}: ${value} minutes`}
                                />
                              );
                            })}
                          </div>
                        ))}
                      </div>
                    </div>
                    <div className="flex items-center justify-end gap-2 mt-4">
                      <span className="text-xs text-muted-foreground">Less</span>
                      {[0.1, 0.3, 0.5, 0.7, 0.9].map((opacity, i) => (
                        <motion.div
                          key={opacity}
                          initial={{ opacity: 0, scale: 0 }}
                          animate={{ opacity: 1, scale: 1 }}
                          transition={{ delay: 0.5 + i * 0.05 }}
                          className="w-4 h-4 rounded"
                          style={{ backgroundColor: `rgba(0, 220, 190, ${opacity})` }}
                        />
                      ))}
                      <span className="text-xs text-muted-foreground">More</span>
                    </div>
                  </CardContent>
                </Card>
              </motion.div>
            </TabsContent>

            <TabsContent value="monthly" className="space-y-4">
              <motion.div
                initial={{ opacity: 0, y: 20 }}
                animate={{ opacity: 1, y: 0 }}
                exit={{ opacity: 0, y: -20 }}
              >
                <Card className="border-primary/20 bg-card/50 backdrop-blur">
                  <CardHeader>
                    <CardTitle className="text-base flex items-center gap-2">
                      <Calendar className="w-4 h-4 text-purple-400" />
                      30-Day Study Trend
                    </CardTitle>
                  </CardHeader>
                  <CardContent>
                    <div className="h-[300px]">
                      <ResponsiveContainer width="100%" height="100%">
                        <AreaChart data={last30Days}>
                          <defs>
                            <linearGradient id="colorMinutes" x1="0" y1="0" x2="0" y2="1">
                              <stop offset="5%" stopColor="#00dcbe" stopOpacity={0.8}/>
                              <stop offset="95%" stopColor="#00dcbe" stopOpacity={0}/>
                            </linearGradient>
                          </defs>
                          <CartesianGrid strokeDasharray="3 3" stroke="rgba(255,255,255,0.1)" />
                          <XAxis dataKey="date" stroke="#888" fontSize={10} />
                          <YAxis stroke="#888" fontSize={12} tickFormatter={(v) => `${v}m`} />
                          <Tooltip content={<CustomTooltip />} />
                          <Area 
                            type="monotone" 
                            dataKey="minutes" 
                            name="Minutes"
                            stroke="#00dcbe" 
                            strokeWidth={2}
                            fillOpacity={1}
                            fill="url(#colorMinutes)"
                          />
                        </AreaChart>
                      </ResponsiveContainer>
                    </div>
                  </CardContent>
                </Card>
              </motion.div>
            </TabsContent>

            <TabsContent value="subjects" className="space-y-4">
              <motion.div 
                className="grid grid-cols-1 lg:grid-cols-2 gap-4"
                initial={{ opacity: 0, y: 20 }}
                animate={{ opacity: 1, y: 0 }}
                exit={{ opacity: 0, y: -20 }}
              >
                {/* Subject Distribution Pie */}
                <Card className="border-primary/20 bg-card/50 backdrop-blur">
                  <CardHeader>
                    <CardTitle className="text-base flex items-center gap-2">
                      <BookOpen className="w-4 h-4 text-blue-400" />
                      Subject Distribution
                    </CardTitle>
                  </CardHeader>
                  <CardContent>
                    <div className="h-[300px]">
                      {subjectDistribution.length > 0 ? (
                        <ResponsiveContainer width="100%" height="100%">
                          <PieChart>
                            <Pie
                              data={subjectDistribution}
                              cx="50%"
                              cy="50%"
                              innerRadius={60}
                              outerRadius={100}
                              paddingAngle={2}
                              dataKey="value"
                              label={({ name, percent }) => `${name} ${(percent * 100).toFixed(0)}%`}
                              labelLine={false}
                            >
                              {subjectDistribution.map((entry, index) => (
                                <Cell key={`cell-${index}`} fill={entry.color} />
                              ))}
                            </Pie>
                            <Tooltip content={<CustomTooltip />} />
                          </PieChart>
                        </ResponsiveContainer>
                      ) : (
                        <div className="h-full flex flex-col items-center justify-center text-muted-foreground">
                          <Sparkles className="w-12 h-12 mb-2 opacity-50" />
                          <p>No study data yet</p>
                          <p className="text-xs">Complete study sessions to see your subject distribution</p>
                        </div>
                      )}
                    </div>
                  </CardContent>
                </Card>

                {/* Subject Breakdown */}
                <Card className="border-primary/20 bg-card/50 backdrop-blur">
                  <CardHeader>
                    <CardTitle className="text-base">Subject Details</CardTitle>
                  </CardHeader>
                  <CardContent>
                    <div className="space-y-4">
                      {subjects.map((subject, index) => {
                        const totalMinutes = subjects.reduce((sum, s) => sum + s.totalMinutes, 0);
                        const percentage = totalMinutes > 0 ? (subject.totalMinutes / totalMinutes) * 100 : 0;
                        return (
                          <motion.div 
                            key={subject.id} 
                            className="space-y-1"
                            initial={{ opacity: 0, x: -20 }}
                            animate={{ opacity: 1, x: 0 }}
                            transition={{ delay: index * 0.1 }}
                          >
                            <div className="flex items-center justify-between text-sm">
                              <motion.span 
                                className="flex items-center gap-2"
                                whileHover={{ x: 4 }}
                              >
                                {subject.icon} {subject.name}
                              </motion.span>
                              <span className="font-mono">{formatMinutes(subject.totalMinutes)}</span>
                            </div>
                            <div className="h-2 bg-muted rounded-full overflow-hidden">
                              <motion.div
                                className="h-full rounded-full"
                                initial={{ width: 0 }}
                                animate={{ width: `${percentage}%` }}
                                transition={{ duration: 1, delay: index * 0.1, ease: "easeOut" }}
                                style={{
                                  backgroundColor: subject.color,
                                }}
                              />
                            </div>
                          </motion.div>
                        );
                      })}
                    </div>
                  </CardContent>
                </Card>
              </motion.div>
            </TabsContent>

            <TabsContent value="performance" className="space-y-4">
              <motion.div 
                className="grid grid-cols-1 lg:grid-cols-2 gap-4"
                initial={{ opacity: 0, y: 20 }}
                animate={{ opacity: 1, y: 0 }}
                exit={{ opacity: 0, y: -20 }}
              >
                {/* Performance Radar */}
                <Card className="border-primary/20 bg-card/50 backdrop-blur">
                  <CardHeader>
                    <CardTitle className="text-base flex items-center gap-2">
                      <Activity className="w-4 h-4 text-yellow-400" />
                      Performance Overview
                    </CardTitle>
                  </CardHeader>
                  <CardContent>
                    <div className="h-[300px]">
                      <ResponsiveContainer width="100%" height="100%">
                        <RadarChart data={performanceRadar}>
                          <PolarGrid stroke="rgba(255,255,255,0.15)" />
                          <PolarAngleAxis dataKey="subject" stroke="#888" fontSize={12} />
                          <PolarRadiusAxis angle={30} domain={[0, 100]} stroke="#888" fontSize={10} />
                          <Radar
                            name="Score"
                            dataKey="value"
                            stroke="#00dcbe"
                            fill="#00dcbe"
                            fillOpacity={0.3}
                          />
                        </RadarChart>
                      </ResponsiveContainer>
                    </div>
                  </CardContent>
                </Card>

                {/* Stats Cards */}
                <Card className="border-primary/20 bg-card/50 backdrop-blur">
                  <CardHeader>
                    <CardTitle className="text-base flex items-center gap-2">
                      <Zap className="w-4 h-4 text-orange-400" />
                      Performance Metrics
                    </CardTitle>
                  </CardHeader>
                  <CardContent>
                    <motion.div 
                      className="grid grid-cols-2 gap-4"
                      variants={containerVariants}
                      initial="hidden"
                      animate="visible"
                    >
                      {[
                        { label: 'Focus Score', value: `${stats.focusEnergy}%`, color: 'text-primary' },
                        { label: 'Consistency', value: `${stats.consistencyScore}%`, color: 'text-green-400' },
                        { label: 'Weekly Momentum', value: `${stats.weeklyMomentum}%`, color: 'text-purple-400' },
                        { label: 'Discipline', value: `${stats.disciplineRating}%`, color: 'text-orange-400' },
                        { label: 'Accuracy', value: `${stats.accuracyScore}%`, color: 'text-cyan-400' },
                        { label: 'Mastery', value: `${stats.knowledgeMastery}%`, color: 'text-yellow-400' },
                      ].map((metric, index) => (
                        <motion.div 
                          key={metric.label} 
                          variants={itemVariants}
                          whileHover={{ scale: 1.05, y: -2 }}
                          className="text-center p-3 rounded-lg bg-muted/30 border border-primary/10"
                        >
                          <motion.p 
                            className={`text-2xl font-bold font-mono ${metric.color}`}
                            initial={{ scale: 0 }}
                            animate={{ scale: 1 }}
                            transition={{ delay: 0.3 + index * 0.05, type: "spring" }}
                          >
                            {metric.value}
                          </motion.p>
                          <p className="text-xs text-muted-foreground">{metric.label}</p>
                        </motion.div>
                      ))}
                    </motion.div>
                  </CardContent>
                </Card>
              </motion.div>
            </TabsContent>
          </AnimatePresence>
        </Tabs>
      </motion.div>
    </motion.div>
  );
}
