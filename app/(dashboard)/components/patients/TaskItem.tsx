"use client";

import { useState } from 'react';
import { motion, AnimatePresence } from 'framer-motion';
import { Card, CardContent } from '@/components/ui/card';
import { Button } from '@/components/ui/button';
import { Badge } from '@/components/ui/badge';
import {
    CheckCircle,
    Clock,
    AlertTriangle,
    User,
    Calendar,
    Pill,
    Activity,
    FileText,
    ChevronRight
  } from 'lucide-react';
  import { toast } from 'sonner';
  import { dashboardTranslations } from '@/lib/dashboard-translations';
  import { useLanguage } from '@/contexts/LanguageContext';

  export interface Task {
    id: string;
    title: string;
    description?: string;
    type: 'medication' | 'vital_check' | 'assessment' | 'documentation' | 'custom';
    patientId?: string;
    prescriptionId?: string;
    dueTime?: Date;
    completedAt?: Date;
    completedBy?: { _id: string; fullName: string; image?: string };
    priority: 'low' | 'medium' | 'high' | 'urgent';
    status: 'pending' | 'completed' | 'overdue' | 'cancelled';
    notes?: string;
    delegatedTo?: { _id: string; fullName: string; image?: string };
    reminderSent?: boolean;
    assignedTo?: {
      _id: string;
      fullName: string;
      role?: string[];
    };
  }

  interface TaskItemProps {
    task: Task;
    onComplete: (taskId: string) => void;
    onDelegate?: (taskId: string, userId: string) => void;
    onViewDetails?: (task: Task) => void;
    showPatientInfo?: boolean;
    compact?: boolean;
  }

  const getTaskIcon = (type: Task['type']) => {
    switch (type) {
      case 'medication': return <Pill className="h-4 w-4" />;
      case 'vital_check': return <Activity className="h-4 w-4" />;
      case 'assessment': return <User className="h-4 w-4" />;
      case 'documentation': return <FileText className="h-4 w-4" />;
      default: return <Clock className="h-4 w-4" />;
    }
  };

const getPriorityBadge = (priority: Task['priority']) => {
  const colors = {
    urgent: 'border-red-600 text-red-700 dark:border-red-400 dark:text-red-300',
    high: 'border-orange-600 text-orange-700 dark:border-orange-400 dark:text-orange-300',
    medium: 'border-amber-600 text-amber-700 dark:border-amber-400 dark:text-amber-300',
    low: 'border-green-600 text-green-700 dark:border-green-400 dark:text-green-300'
  };
  return `border ${colors[priority] || 'border-muted text-muted-foreground'}`;
};

export const TaskItem: React.FC<TaskItemProps> = ({
  task,
  onComplete,
  showPatientInfo = false,
  compact = false
}) => {
  const [isExpanded, setIsExpanded] = useState(false);
  const [isCompleting, setIsCompleting] = useState(false);
  const { language } = useLanguage();
  const t = dashboardTranslations[language as keyof typeof dashboardTranslations]?.taskList || {};
  const common = dashboardTranslations[language as keyof typeof dashboardTranslations]?.common || {};

  const handleComplete = async (e: React.MouseEvent) => {
    e.stopPropagation();
    setIsCompleting(true);
    try {
      await onComplete(task.id);
      toast.success('Task completed!');
    } catch {
      toast.error('Failed to complete task');
    } finally {
      setIsCompleting(false);
    }
  };

  const isOverdue = task.dueTime && new Date(task.dueTime) < new Date() && task.status === 'pending';
  const isDueSoon = task.dueTime && !isOverdue &&
    new Date(task.dueTime).getTime() - new Date().getTime() < 30 * 60 * 1000;

  return (
    <motion.div initial={{ opacity: 0, y: 8 }} animate={{ opacity: 1, y: 0 }} exit={{ opacity: 0, y: -8 }}>
      <Card
        className={`border shadow-sm hover:shadow transition-shadow cursor-pointer ${
          task.status === 'completed' ? 'opacity-70' : ''
        } ${isOverdue ? 'ring-1 ring-red-400' : ''}`}
        onClick={() => setIsExpanded(!isExpanded)}
      >
        <CardContent className="p-4">
          <div className="flex items-start justify-between gap-3">
            <div className="flex items-start gap-3 flex-1 min-w-0">
              <div className={`p-1.5 rounded-md ${task.status === 'completed' ? 'bg-muted/50' : 'bg-primary/10'}`}>
                {task.status === 'completed' ? <CheckCircle className="h-4 w-4 text-green-600" /> : getTaskIcon(task.type)}
              </div>

              <div className="flex-1 min-w-0">
                <h4 className={`font-medium text-base ${task.status === 'completed' ? 'line-through text-muted-foreground' : ''}`}>
                  {task.title}
                </h4>

                {!compact && task.description && (
                  <p className="text-sm text-muted-foreground mt-1 line-clamp-2">{task.description}</p>
                )}

                <div className="flex flex-wrap items-center gap-2 mt-2">
                  <Badge variant="outline" className={`text-xs ${getPriorityBadge(task.priority)}`}>
                    {t.priority?.[task.priority] || task.priority}
                  </Badge>

                  {task.status !== 'pending' && (
                    <Badge variant="outline" className="text-xs border-muted text-muted-foreground">
                      {t.status?.[task.status] || task.status}
                    </Badge>
                  )}

                  {isOverdue && (
                    <Badge variant="outline" className="text-xs border-red-600 text-red-700">
                      <AlertTriangle className="h-3 w-3 mr-1" />
                      {t.status?.overdue || 'Overdue'}
                    </Badge>
                  )}

                  {isDueSoon && (
                    <Badge variant="outline" className="text-xs border-orange-600 text-orange-700">
                      <Clock className="h-3 w-3 mr-1" />
                      {'Due Soon'}
                    </Badge>
                  )}
                </div>

                {task.dueTime && (
                  <div className="flex items-center gap-1.5 text-xs text-muted-foreground mt-2">
                    <Calendar className="h-3.5 w-3.5" />
                    {new Date(task.dueTime).toLocaleTimeString([], { hour: '2-digit', minute: '2-digit' })}
                  </div>
                )}

                {task.completedBy && task.status === 'completed' && (
                  <div className="flex items-center gap-1.5 text-xs text-muted-foreground mt-1">
                    <CheckCircle className="h-3.5 w-3.5" />
                    {dashboardTranslations.en.taskList.createdBy.replace('{name}', task.completedBy.fullName)}
                  </div>
                )}
              </div>
            </div>

            <Button
              variant="ghost"
              size="icon"
              className="h-8 w-8 shrink-0"
              onClick={(e) => { e.stopPropagation(); setIsExpanded(!isExpanded); }}
            >
              <ChevronRight className={`h-4 w-4 transition-transform ${isExpanded ? 'rotate-90' : ''}`} />
            </Button>
          </div>

          <AnimatePresence>
            {isExpanded && (
              <motion.div
                initial={{ height: 0, opacity: 0 }}
                animate={{ height: "auto", opacity: 1 }}
                exit={{ height: 0, opacity: 0 }}
                className="overflow-hidden"
              >
                <div className="mt-4 pt-4 border-t">
                  <div className="flex flex-wrap gap-2">
                    {task.status !== 'completed' && (
                      <Button size="sm" onClick={handleComplete} disabled={isCompleting} className="h-8">
                        <CheckCircle className="h-3.5 w-3.5 mr-1.5" />
                        {isCompleting ? 'Completing...' : 'Complete'}
                      </Button>
                    )}
                  </div>

                  {task.notes && (
                    <div className="mt-4 p-3 bg-muted/50 rounded-md">
                      <p className="text-sm text-foreground">{task.notes}</p>
                    </div>
                  )}
                </div>
              </motion.div>
            )}
          </AnimatePresence>
        </CardContent>
      </Card>
    </motion.div>
  );
};