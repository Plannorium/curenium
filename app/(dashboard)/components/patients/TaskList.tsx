"use client";

import { useState, useEffect, useCallback } from 'react';
import { motion, AnimatePresence } from 'framer-motion';
import { Card, CardHeader, CardTitle, CardContent } from '@/components/ui/card';
import { Button } from '@/components/ui/button';
import { Badge } from '@/components/ui/badge';
import { Input } from '@/components/ui/input';
import { Textarea } from '@/components/ui/textarea';
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from '@/components/ui/select';
import { Dialog, DialogContent, DialogHeader, DialogTitle, DialogTrigger } from '@/components/ui/dialog';
import { Label } from '@/components/ui/label';
import {
  CheckSquare,
  Clock,
  AlertTriangle,
  Search,
  RefreshCw,
  Plus,
  Bell,
  ChevronDown,
  ChevronUp
} from 'lucide-react';
import { TaskItem, Task } from './TaskItem';
import { toast } from 'sonner';
import { useSession } from 'next-auth/react';
import { useNotifications } from '@/hooks/use-notifications';

interface TaskListProps {
  patientId?: string;
  compact?: boolean;
  className?: string;
  onAddTask?: () => void;
  showAddTask?: boolean;
}

export const TaskList: React.FC<TaskListProps> = ({
  patientId,
  compact = false,
  className = '',
  onAddTask,
  showAddTask = false
}) => {
  const { data: session } = useSession();
  const { markAsRead } = useNotifications();

  const [tasks, setTasks] = useState<Task[]>([]);
  const [filteredTasks, setFilteredTasks] = useState<Task[]>([]);
  const [isLoading, setIsLoading] = useState(true);
  const [searchQuery, setSearchQuery] = useState('');
  const [statusFilter, setStatusFilter] = useState<'all' | 'pending' | 'completed' | 'overdue'>('all');
  const [priorityFilter, setPriorityFilter] = useState<'all' | 'low' | 'medium' | 'high' | 'urgent'>('all');
  const [typeFilter, setTypeFilter] = useState<'all' | 'medication' | 'vital_check' | 'assessment' | 'documentation' | 'custom'>('all');
  const [isRefreshing, setIsRefreshing] = useState(false);
  const [isCollapsed, setIsCollapsed] = useState(false);
  const [showCreateTaskModal, setShowCreateTaskModal] = useState(false);
  const [taskFormData, setTaskFormData] = useState({
    assignedTo: '',
    title: '',
    description: '',
    type: 'custom',
    priority: 'medium',
    dueTime: ''
  });
  const [availableNurses, setAvailableNurses] = useState<any[]>([]);
  const [isCreatingTask, setIsCreatingTask] = useState(false);

  const fetchTasks = useCallback(async () => {
    if (!session?.user?.id) return;

    try {
      setIsLoading(true);
      const url = patientId
        ? `/api/patients/${patientId}/tasks`
        : `/api/shift-tracking/tasks?userId=${session.user.id}`;

      const response = await fetch(url);
      if (response.ok) {
        const data: Task[] = await response.json();
        setTasks(data);
      } else {
        toast.error('Failed to fetch tasks');
      }
    } catch (error) {
      toast.error('Error fetching tasks');
    } finally {
      setIsLoading(false);
    }
  }, [session?.user?.id, patientId]);

  useEffect(() => {
    let filtered = tasks;

    if (searchQuery) {
      filtered = filtered.filter(task =>
        task.title.toLowerCase().includes(searchQuery.toLowerCase()) ||
        task.description?.toLowerCase().includes(searchQuery.toLowerCase())
      );
    }

    if (statusFilter !== 'all') filtered = filtered.filter(task => task.status === statusFilter);
    if (priorityFilter !== 'all') filtered = filtered.filter(task => task.priority === priorityFilter);
    if (typeFilter !== 'all') filtered = filtered.filter(task => task.type === typeFilter);

    filtered.sort((a, b) => {
      const priorityOrder = { urgent: 4, high: 3, medium: 2, low: 1 };
      const aPriority = priorityOrder[a.priority] || 0;
      const bPriority = priorityOrder[b.priority] || 0;

      if (aPriority !== bPriority) return bPriority - aPriority;
      if (a.dueTime && b.dueTime) return new Date(a.dueTime).getTime() - new Date(b.dueTime).getTime();
      return 0;
    });

    setFilteredTasks(filtered);
  }, [tasks, searchQuery, statusFilter, priorityFilter, typeFilter]);

  useEffect(() => {
    fetchTasks();
  }, [fetchTasks]);

  useEffect(() => {
    if (showCreateTaskModal && session?.user?.organizationId) {
      // Fetch nurses for assignment
      fetch('/api/users?role=nurse&role=matron_nurse')
        .then(res => res.json())
        .then((data: any[]) => setAvailableNurses(data))
        .catch(err => console.error('Failed to fetch nurses:', err));
    }
  }, [showCreateTaskModal, session?.user?.organizationId]);

  const handleTaskComplete = async (taskId: string) => {
    try {
      const response = await fetch(`/api/tasks/${taskId}/complete`, {
        method: 'PATCH',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({
          completedBy: session?.user?.id,
          completedAt: new Date()
        })
      });

      if (response.ok) {
        setTasks(prev => prev.map(task =>
          task.id === taskId
            ? {
                ...task,
                status: 'completed' as const,
                completedAt: new Date(),
                completedBy: session?.user ? {
                  _id: session.user.id || '',
                  fullName: session.user.name || session.user.fullName || 'Unknown',
                  image: session.user.image || undefined
                } : undefined
              }
            : task
        ));
        markAsRead(taskId);
      }
    } catch (error) {
      throw error;
    }
  };

  const handleRefresh = async () => {
    setIsRefreshing(true);
    await fetchTasks();
    setIsRefreshing(false);
    toast.success('Tasks refreshed');
  };

  const handleCreateTask = async () => {
    if (!session?.user?.role?.includes('matron') && !session?.user?.role?.includes('admin')) {
      toast.error('Insufficient permissions to create tasks');
      return;
    }

    if (!taskFormData.assignedTo) {
      toast.error('Please select a nurse to assign the task to');
      return;
    }

    if (!taskFormData.title.trim()) {
      toast.error('Task title is required');
      return;
    }

    if (!patientId) {
      toast.error('Cannot create task: no patient selected');
      return;
    }

    setIsCreatingTask(true);
    try {
      const response = await fetch('/api/tasks', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({
          patientId,
          assignedTo: taskFormData.assignedTo,
          title: taskFormData.title,
          description: taskFormData.description,
          type: taskFormData.type,
          priority: taskFormData.priority,
          dueTime: taskFormData.dueTime || new Date(Date.now() + 60 * 60 * 1000).toISOString(), // Default 1 hour
          createdBy: session.user.id
        })
      });

      if (response.ok) {
        toast.success('Task created successfully');
        setShowCreateTaskModal(false);
        setTaskFormData({
          assignedTo: '',
          title: '',
          description: '',
          type: 'custom',
          priority: 'medium',
          dueTime: ''
        });
        await fetchTasks(); // Refresh the task list
      } else {
        const error = await response.json();
        toast.error('Failed to create task');
      }
    } catch (error) {
      toast.error('Failed to create task');
    } finally {
      setIsCreatingTask(false);
    }
  };

  const getTaskStats = () => {
    const pending = tasks.filter(t => t.status === 'pending').length;
    const completed = tasks.filter(t => t.status === 'completed').length;
    const overdue = tasks.filter(t => t.status === 'overdue').length;
    const urgent = tasks.filter(t => t.priority === 'urgent' && t.status === 'pending').length;
    return { pending, completed, overdue, urgent };
  };

  const stats = getTaskStats();

  if (compact) {
    return (
      <Card className={`border shadow-sm ${className}`}>
        <CardHeader className="pb-3">
          <div className="flex items-center justify-between">
            <CardTitle className="text-sm font-medium flex items-center gap-2">
              <CheckSquare className="h-4 w-4 text-primary" />
              Tasks
              {stats.urgent > 0 && (
                <Badge variant="destructive" className="text-xs px-1.5">
                  {stats.urgent}
                </Badge>
              )}
            </CardTitle>
            <Button
              variant="ghost"
              size="icon"
              className="h-6 w-6"
              onClick={() => setIsCollapsed(!isCollapsed)}
            >
              {isCollapsed ? <ChevronDown className="h-4 w-4" /> : <ChevronUp className="h-4 w-4" />}
            </Button>
          </div>
        </CardHeader>

        {!isCollapsed && (
          <CardContent className="pt-0 space-y-3">
            <div className="grid grid-cols-2 gap-2 text-xs">
              <div className="text-center py-2 bg-muted/50 rounded-md">
                <div className="font-semibold">{stats.pending}</div>
                <div className="text-muted-foreground">Pending</div>
              </div>
              <div className="text-center py-2 bg-muted/50 rounded-md">
                <div className="font-semibold">{stats.completed}</div>
                <div className="text-muted-foreground">Done</div>
              </div>
            </div>

            <div className="space-y-2 max-h-64 overflow-y-auto">
              {isLoading ? (
                <p className="text-center text-sm text-muted-foreground py-4">Loading...</p>
              ) : filteredTasks.length > 0 ? (
                filteredTasks.slice(0, 5).map(task => (
                  <TaskItem key={task.id} task={task} onComplete={handleTaskComplete} compact />
                ))
              ) : (
                <p className="text-center text-sm text-muted-foreground py-4">No tasks</p>
              )}
            </div>
          </CardContent>
        )}
      </Card>
    );
  }

  return (
    <div className={`space-y-5 ${className}`}>
      <div className="flex items-center justify-between">
        <div>
          <h2 className="text-xl font-semibold flex items-center gap-2">
            <CheckSquare className="h-5 w-5 text-primary" />
            Task List
          </h2>
          <p className="text-sm text-muted-foreground mt-1">
            {patientId ? 'Patient-specific tasks' : 'Your shift tasks and responsibilities'}
          </p>
        </div>

        <div className="flex items-center gap-2">
          <Button variant="outline" size="sm" onClick={handleRefresh} disabled={isRefreshing}>
            <RefreshCw className={`h-4 w-4 ${isRefreshing ? 'animate-spin' : ''}`} />
          </Button>
          {showAddTask && (onAddTask || (session?.user?.role?.includes('matron') || session?.user?.role?.includes('admin'))) && (
            <Dialog open={showCreateTaskModal} onOpenChange={setShowCreateTaskModal}>
              <DialogTrigger asChild>
                <Button size="sm" onClick={() => onAddTask ? onAddTask() : setShowCreateTaskModal(true)}>
                  <Plus className="h-4 w-4 mr-1.5" />
                  Add Task
                </Button>
              </DialogTrigger>
              <DialogContent className="max-w-md">
                <DialogHeader>
                  <DialogTitle>Create New Task</DialogTitle>
                </DialogHeader>
                <div className="space-y-4">
                  <div>
                    <Label htmlFor="assignedTo">Assign To *</Label>
                    <Select value={taskFormData.assignedTo} onValueChange={(value) => setTaskFormData(prev => ({ ...prev, assignedTo: value }))}>
                      <SelectTrigger>
                        <SelectValue placeholder="Select nurse" />
                      </SelectTrigger>
                      <SelectContent>
                        {availableNurses.map((nurse) => (
                          <SelectItem key={nurse._id} value={nurse._id}>
                            {nurse.fullName}
                          </SelectItem>
                        ))}
                      </SelectContent>
                    </Select>
                  </div>
                  <div>
                    <Label htmlFor="title">Task Title *</Label>
                    <Input
                      id="title"
                      value={taskFormData.title}
                      onChange={(e) => setTaskFormData(prev => ({ ...prev, title: e.target.value }))}
                      placeholder="Enter task title"
                    />
                  </div>
                  <div>
                    <Label htmlFor="description">Description</Label>
                    <Textarea
                      id="description"
                      value={taskFormData.description}
                      onChange={(e) => setTaskFormData(prev => ({ ...prev, description: e.target.value }))}
                      placeholder="Enter task description"
                      rows={3}
                    />
                  </div>
                  <div className="grid grid-cols-2 gap-4">
                    <div>
                      <Label htmlFor="type">Type</Label>
                      <Select value={taskFormData.type} onValueChange={(value) => setTaskFormData(prev => ({ ...prev, type: value }))}>
                        <SelectTrigger>
                          <SelectValue />
                        </SelectTrigger>
                        <SelectContent>
                          <SelectItem value="custom">Custom</SelectItem>
                          <SelectItem value="assessment">Assessment</SelectItem>
                          <SelectItem value="medication">Medication</SelectItem>
                          <SelectItem value="vital_check">Vital Check</SelectItem>
                          <SelectItem value="documentation">Documentation</SelectItem>
                        </SelectContent>
                      </Select>
                    </div>
                    <div>
                      <Label htmlFor="priority">Priority</Label>
                      <Select value={taskFormData.priority} onValueChange={(value) => setTaskFormData(prev => ({ ...prev, priority: value }))}>
                        <SelectTrigger>
                          <SelectValue />
                        </SelectTrigger>
                        <SelectContent>
                          <SelectItem value="low">Low</SelectItem>
                          <SelectItem value="medium">Medium</SelectItem>
                          <SelectItem value="high">High</SelectItem>
                          <SelectItem value="urgent">Urgent</SelectItem>
                        </SelectContent>
                      </Select>
                    </div>
                  </div>
                  <div>
                    <Label htmlFor="dueTime">Due Time</Label>
                    <Input
                      id="dueTime"
                      type="datetime-local"
                      value={taskFormData.dueTime}
                      onChange={(e) => setTaskFormData(prev => ({ ...prev, dueTime: e.target.value }))}
                    />
                  </div>
                  <div className="flex justify-end gap-3">
                    <Button variant="outline" onClick={() => setShowCreateTaskModal(false)}>
                      Cancel
                    </Button>
                    <Button onClick={handleCreateTask} disabled={isCreatingTask}>
                      {isCreatingTask ? 'Creating...' : 'Create Task'}
                    </Button>
                  </div>
                </div>
              </DialogContent>
            </Dialog>
          )}
        </div>
      </div>

      <div className="grid grid-cols-2 md:grid-cols-4 gap-3">
        <Card className="border">
          <CardContent className="p-4">
            <div className="flex items-center justify-between">
              <div>
                <p className="text-2xl font-bold">{stats.pending}</p>
                <p className="text-sm text-muted-foreground">Pending</p>
              </div>
              <Clock className="h-7 w-7 text-muted-foreground/70" />
            </div>
          </CardContent>
        </Card>

        <Card className="border">
          <CardContent className="p-4">
            <div className="flex items-center justify-between">
              <div>
                <p className="text-2xl font-bold">{stats.completed}</p>
                <p className="text-sm text-muted-foreground">Completed</p>
              </div>
              <CheckSquare className="h-7 w-7 text-muted-foreground/70" />
            </div>
          </CardContent>
        </Card>

        <Card className="border">
          <CardContent className="p-4">
            <div className="flex items-center justify-between">
              <div>
                <p className="text-2xl font-bold">{stats.overdue}</p>
                <p className="text-sm text-muted-foreground">Overdue</p>
              </div>
              <AlertTriangle className="h-7 w-7 text-muted-foreground/70" />
            </div>
          </CardContent>
        </Card>

        <Card className="border">
          <CardContent className="p-4">
            <div className="flex items-center justify-between">
              <div>
                <p className="text-2xl font-bold">{stats.urgent}</p>
                <p className="text-sm text-muted-foreground">Urgent</p>
              </div>
              <Bell className="h-7 w-7 text-muted-foreground/70" />
            </div>
          </CardContent>
        </Card>
      </div>

      <Card className="border shadow-sm">
        <CardContent className="p-4">
          <div className="flex flex-col sm:flex-row gap-3">
            <div className="relative flex-1">
              <Search className="absolute left-3 top-1/2 -translate-y-1/2 h-4 w-4 text-muted-foreground" />
              <Input
                placeholder="Search tasks..."
                value={searchQuery}
                onChange={(e) => setSearchQuery(e.target.value)}
                className="pl-10"
              />
            </div>
            <div className="flex gap-2">
              <Select value={statusFilter} onValueChange={(v: any) => setStatusFilter(v)}>
                <SelectTrigger className="w-32">
                  <SelectValue placeholder="Status" />
                </SelectTrigger>
                <SelectContent>
                  <SelectItem value="all">All Status</SelectItem>
                  <SelectItem value="pending">Pending</SelectItem>
                  <SelectItem value="completed">Completed</SelectItem>
                  <SelectItem value="overdue">Overdue</SelectItem>
                </SelectContent>
              </Select>

              <Select value={priorityFilter} onValueChange={(v: any) => setPriorityFilter(v)}>
                <SelectTrigger className="w-32">
                  <SelectValue placeholder="Priority" />
                </SelectTrigger>
                <SelectContent>
                  <SelectItem value="all">All Priority</SelectItem>
                  <SelectItem value="urgent">Urgent</SelectItem>
                  <SelectItem value="high">High</SelectItem>
                  <SelectItem value="medium">Medium</SelectItem>
                  <SelectItem value="low">Low</SelectItem>
                </SelectContent>
              </Select>
            </div>
          </div>
        </CardContent>
      </Card>

      <div className="space-y-3">
        {isLoading ? (
          <Card className="p-8 text-center">
            <RefreshCw className="h-6 w-6 animate-spin mx-auto text-muted-foreground" />
            <p className="mt-2 text-muted-foreground">Loading tasks...</p>
          </Card>
        ) : filteredTasks.length > 0 ? (
          <AnimatePresence>
            {filteredTasks.map(task => (
              <TaskItem key={task.id} task={task} onComplete={handleTaskComplete} showPatientInfo={!patientId} />
            ))}
          </AnimatePresence>
        ) : (
          <Card className="p-12 text-center border">
            <CheckSquare className="h-12 w-12 text-muted-foreground mx-auto mb-4" />
            <h3 className="font-medium mb-1">No tasks found</h3>
            <p className="text-sm text-muted-foreground">
              {searchQuery || statusFilter !== 'all' || priorityFilter !== 'all'
                ? 'Try adjusting your filters'
                : 'All caught up! No pending tasks.'}
            </p>
          </Card>
        )}
      </div>
    </div>
  );
};