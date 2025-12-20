"use client";

import { useState, useEffect, useCallback } from "react";
import { motion, AnimatePresence } from "framer-motion";
import { Card, CardHeader, CardTitle, CardContent } from "@/components/ui/card";
import { Button } from "@/components/ui/button";
import { Badge } from "@/components/ui/badge";
import { Input } from "@/components/ui/input";
import { Textarea } from "@/components/ui/textarea";
import {
  Select,
  SelectContent,
  SelectItem,
  SelectTrigger,
  SelectValue,
} from "@/components/ui/select";
import {
  Dialog,
  DialogContent,
  DialogHeader,
  DialogTitle,
  DialogTrigger,
} from "@/components/ui/dialog";
import { Label } from "@/components/ui/label";
import {
  CheckSquare,
  Clock,
  AlertTriangle,
  Search,
  RefreshCw,
  Plus,
  Bell,
  ChevronDown,
  ChevronUp,
} from "lucide-react";
import { TaskItem, Task } from "./TaskItem";
import { toast } from "sonner";
import { useSession } from "next-auth/react";
import { useNotifications } from "@/hooks/use-notifications";
import { dashboardTranslations } from "@/lib/dashboard-translations";
import { useLanguage } from "@/contexts/LanguageContext";

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
  className = "",
  onAddTask,
  showAddTask = false,
}) => {
  const { data: session } = useSession();
  const { markAsRead } = useNotifications();

  const { language } = useLanguage();
  const t =
    dashboardTranslations[language as keyof typeof dashboardTranslations]
      ?.taskList || {};
  const createModalT =
    dashboardTranslations[language as keyof typeof dashboardTranslations]
      ?.createTaskModal || {};
  const common =
    dashboardTranslations[language as keyof typeof dashboardTranslations]
      ?.common || {};

  const [tasks, setTasks] = useState<Task[]>([]);
  const [filteredTasks, setFilteredTasks] = useState<Task[]>([]);
  const [isLoading, setIsLoading] = useState(true);
  const [searchQuery, setSearchQuery] = useState("");
  const [statusFilter, setStatusFilter] = useState<
    "all" | "pending" | "completed" | "overdue"
  >("all");
  const [priorityFilter, setPriorityFilter] = useState<
    "all" | "low" | "medium" | "high" | "urgent"
  >("all");
  const [typeFilter, setTypeFilter] = useState<
    | "all"
    | "medication"
    | "vital_check"
    | "assessment"
    | "documentation"
    | "custom"
  >("all");
  const [isRefreshing, setIsRefreshing] = useState(false);
  const [isCollapsed, setIsCollapsed] = useState(false);
  const [showCreateTaskModal, setShowCreateTaskModal] = useState(false);
  const [showCompleted, setShowCompleted] = useState(false);
  const [taskFormData, setTaskFormData] = useState({
    assignedTo: "",
    title: "",
    description: "",
    type: "custom",
    priority: "medium",
    dueTime: "",
  });
  const [availableNurses, setAvailableNurses] = useState<any[]>([]);
  const [isCreatingTask, setIsCreatingTask] = useState(false);
  const [isLoadingNurses, setIsLoadingNurses] = useState(false);

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
        toast.error(t.failedToFetch || "Failed to fetch tasks");
      }
    } catch (error) {
      toast.error(t.failedToFetch || common.error || "Error fetching tasks");
    } finally {
      setIsLoading(false);
    }
  }, [session?.user?.id, patientId]);

  useEffect(() => {
    let filtered = [...tasks];

    if (searchQuery) {
      filtered = filtered.filter(
        (task) =>
          task.title.toLowerCase().includes(searchQuery.toLowerCase()) ||
          task.description?.toLowerCase().includes(searchQuery.toLowerCase())
      );
    }

    if (statusFilter !== "all")
      filtered = filtered.filter((task) => task.status === statusFilter);
    if (priorityFilter !== "all")
      filtered = filtered.filter((task) => task.priority === priorityFilter);
    if (typeFilter !== "all")
      filtered = filtered.filter((task) => task.type === typeFilter);

    filtered.sort((a, b) => {
      // First by status: pending/overdue first, completed last
      const statusOrder = { pending: 1, overdue: 1, completed: 2 };
      const aStatus = statusOrder[a.status as keyof typeof statusOrder] || 1;
      const bStatus = statusOrder[b.status as keyof typeof statusOrder] || 1;

      if (aStatus !== bStatus) return aStatus - bStatus;

      // Then by priority
      const priorityOrder = { urgent: 4, high: 3, medium: 2, low: 1 };
      const aPriority = priorityOrder[a.priority] || 0;
      const bPriority = priorityOrder[b.priority] || 0;

      if (aPriority !== bPriority) return bPriority - aPriority;
      if (a.dueTime && b.dueTime)
        return new Date(a.dueTime).getTime() - new Date(b.dueTime).getTime();
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
      setIsLoadingNurses(true);
      fetch("/api/users?role=nurse&role=matron_nurse")
        .then((res) => res.json())
        .then((data: any[]) => setAvailableNurses(data))
        .catch((err) => console.error("Failed to fetch nurses:", err))
        .finally(() => setIsLoadingNurses(false));
    }
  }, [showCreateTaskModal, session?.user?.organizationId]);

  const handleTaskComplete = async (taskId: string) => {
    try {
      const response = await fetch(`/api/tasks/${taskId}/complete`, {
        method: "PATCH",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({
          completedBy: session?.user?.id,
          completedAt: new Date(),
        }),
      });

      if (response.ok) {
        setTasks((prev) =>
          prev.map((task) =>
            task.id === taskId
              ? {
                  ...task,
                  status: "completed" as const,
                  completedAt: new Date(),
                  completedBy: session?.user
                    ? {
                        _id: session.user.id || "",
                        fullName:
                          session.user.name ||
                          session.user.fullName ||
                          "Unknown",
                        image: session.user.image || undefined,
                      }
                    : undefined,
                }
              : task
          )
        );
        markAsRead(taskId);
      } else {
        toast.error(common.error || "Failed to complete task");
      }
    } catch (error) {
      console.error("Error completing task:", error);
      toast.error(common.error || "Failed to complete task");
    }
  };

  const handleRefresh = async () => {
    setIsRefreshing(true);
    await fetchTasks();
    setIsRefreshing(false);
    toast.success(common.success || "Tasks refreshed");
  };

  const handleCreateTask = async () => {
    const role = session?.user?.role;
    if (role !== 'matron_nurse' && role !== 'admin') {
      toast.error(
        createModalT.insufficientPermissions ||
          common.error ||
          "Insufficient permissions to create tasks"
      );
      return;
    }

    if (!taskFormData.assignedTo) {
      toast.error(
        createModalT.selectNurse ||
          common.error ||
          "Please select a nurse to assign the task to"
      );
      return;
    }

    if (!taskFormData.title.trim()) {
      toast.error(
        createModalT.fillRequiredFields ||
          common.error ||
          "Task title is required"
      );
      return;
    }

    if (!patientId) {
      toast.error(
        createModalT.selectPatient ||
          common.error ||
          "Cannot create task: no patient selected"
      );
      return;
    }

    setIsCreatingTask(true);
    try {
      const response = await fetch("/api/tasks", {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({
          patientId,
          assignedTo: taskFormData.assignedTo,
          title: taskFormData.title,
          description: taskFormData.description,
          type: taskFormData.type,
          priority: taskFormData.priority,
          dueTime:
            taskFormData.dueTime ||
            new Date(Date.now() + 60 * 60 * 1000).toISOString(), // Default 1 hour
          createdBy: session?.user?.id,
        }),
      });

      if (response.ok) {
        toast.success(
          createModalT.success || common.success || "Task created successfully"
        );
        setShowCreateTaskModal(false);
        setTaskFormData({
          assignedTo: "",
          title: "",
          description: "",
          type: "custom",
          priority: "medium",
          dueTime: "",
        });
        await fetchTasks(); // Refresh the task list
      } else {
        const error = await response.json();
        toast.error("Failed to create task");
      }
    } catch (error) {
      toast.error("Failed to create task");
    } finally {
      setIsCreatingTask(false);
    }
  };

  const getTaskStats = () => {
    const pending = tasks.filter((t) => t.status === "pending").length;
    const completed = tasks.filter((t) => t.status === "completed").length;
    const overdue = tasks.filter((t) => t.status === "overdue").length;
    const urgent = tasks.filter(
      (t) => t.priority === "urgent" && t.status === "pending"
    ).length;
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
              {t.title}
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
              {isCollapsed ? (
                <ChevronDown className="h-4 w-4" />
              ) : (
                <ChevronUp className="h-4 w-4" />
              )}
            </Button>
          </div>
        </CardHeader>

        {!isCollapsed && (
          <CardContent className="pt-0 space-y-3">
            <div className="grid grid-cols-2 gap-2 text-xs">
              <div className="text-center py-2 bg-muted/50 rounded-md">
                <div className="font-semibold">{stats.pending}</div>
                <div className="text-muted-foreground">{t.status?.pending ?? 'Pending'}</div>
              </div>
              <div className="text-center py-2 bg-muted/50 rounded-md">
                <div className="font-semibold">{stats.completed}</div>
                <div className="text-muted-foreground">
                  {t.status?.completed ?? 'Completed'}
                </div>
              </div>
            </div>

            <div className="space-y-2 max-h-64 overflow-y-auto">
              {isLoading ? (
                <p className="text-center text-sm text-muted-foreground py-4">
                  {common.loading}
                </p>
              ) : filteredTasks.length > 0 ? (
                filteredTasks
                  .slice(0, 5)
                  .map((task) => (
                    <TaskItem
                      key={task.id}
                      task={task}
                      onComplete={handleTaskComplete}
                      compact
                    />
                  ))
              ) : (
                <p className="text-center text-sm text-muted-foreground py-4">
                  {t.noTasksYet}
                </p>
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
            {t.title}
          </h2>
          <p className="text-sm text-muted-foreground mt-1">
            {patientId ? t.tasksDescription : t.subtitle}
          </p>
        </div>

        <div className="flex items-center gap-2">
          <Button
            variant="outline"
            size="sm"
            onClick={handleRefresh}
            disabled={isRefreshing}
          >
            <RefreshCw
              className={`h-4 w-4 ${isRefreshing ? "animate-spin" : ""}`}
            />
          </Button>
          {showAddTask &&
            (onAddTask ||
              session?.user?.role === 'matron_nurse' ||
              session?.user?.role === 'admin') &&
            (onAddTask ? (
              <Button size="sm" onClick={onAddTask}>
                <Plus className="h-4 w-4 mr-1.5" />
                {t.createTask}
              </Button>
            ) : (
              <Dialog
                open={showCreateTaskModal}
                onOpenChange={setShowCreateTaskModal}
              >
                <DialogTrigger asChild>
                  <Button
                    size="sm"
                    onClick={() => setShowCreateTaskModal(true)}
                  >
                    <Plus className="h-4 w-4 mr-1.5" />
                    {t.createTask}
                  </Button>
                </DialogTrigger>
                <DialogContent className="max-w-md">
                  <DialogHeader>
                    <DialogTitle>
                      {createModalT.title || t.createTask}
                    </DialogTitle>
                  </DialogHeader>
                  <div className="space-y-4">
                    <div>
                      <Label htmlFor="assignedTo">
                        {createModalT.assignTo || "Assign To"} *
                      </Label>
                      <Select
                        value={taskFormData.assignedTo}
                        onValueChange={(value) =>
                          setTaskFormData((prev) => ({
                            ...prev,
                            assignedTo: value,
                          }))
                        }
                      >
                        <SelectTrigger>
                          <SelectValue
                            placeholder={
                              isLoadingNurses
                                ? "Loading nurses..."
                                : createModalT.selectNursePlaceholder ||
                                  "Select nurse"
                            }
                          />
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
                      <Label htmlFor="title">
                        {createModalT.taskTitle || "Task Title"} *
                      </Label>
                      <Input
                        id="title"
                        value={taskFormData.title}
                        onChange={(e) =>
                          setTaskFormData((prev) => ({
                            ...prev,
                            title: e.target.value,
                          }))
                        }
                        placeholder={createModalT.taskTitlePlaceholder}
                      />
                    </div>
                    <div>
                      <Label htmlFor="description">
                        {createModalT.description || "Description"}
                      </Label>
                      <Textarea
                        id="description"
                        value={taskFormData.description}
                        onChange={(e) =>
                          setTaskFormData((prev) => ({
                            ...prev,
                            description: e.target.value,
                          }))
                        }
                        placeholder={createModalT.descriptionPlaceholder}
                        rows={3}
                      />
                    </div>
                    <div className="grid grid-cols-2 gap-4">
                      <div>
                        <Label htmlFor="type">
                          {createModalT.taskType || "Type"}
                        </Label>
                        <Select
                          value={taskFormData.type}
                          onValueChange={(value) =>
                            setTaskFormData((prev) => ({
                              ...prev,
                              type: value,
                            }))
                          }
                        >
                          <SelectTrigger>
                            <SelectValue />
                          </SelectTrigger>
                          <SelectContent>
                            <SelectItem value="custom">
                              {createModalT.taskTypes.custom}
                            </SelectItem>
                            <SelectItem value="assessment">
                              {createModalT.taskTypes.assessment}
                            </SelectItem>
                            <SelectItem value="medication">
                              {createModalT.taskTypes.medication}
                            </SelectItem>
                            <SelectItem value="vital_check">
                              {createModalT.taskTypes.vital_check}
                            </SelectItem>
                            <SelectItem value="documentation">
                              {createModalT.taskTypes.documentation}
                            </SelectItem>
                          </SelectContent>
                        </Select>
                      </div>
                      <div>
                        <Label htmlFor="priority">
                          {createModalT.priority || "Priority"}
                        </Label>
                        <Select
                          value={taskFormData.priority}
                          onValueChange={(value) =>
                            setTaskFormData((prev) => ({
                              ...prev,
                              priority: value,
                            }))
                          }
                        >
                          <SelectTrigger>
                            <SelectValue />
                          </SelectTrigger>
                          <SelectContent>
                            <SelectItem value="low">
                              {createModalT.priorities.low}
                            </SelectItem>
                            <SelectItem value="medium">
                              {createModalT.priorities.medium}
                            </SelectItem>
                            <SelectItem value="high">
                              {createModalT.priorities.high}
                            </SelectItem>
                            <SelectItem value="urgent">
                              {createModalT.priorities.urgent}
                            </SelectItem>
                          </SelectContent>
                        </Select>
                      </div>
                    </div>
                    <div>
                      <Label htmlFor="dueTime">
                        {createModalT.dueDateTime || "Due Time"}
                      </Label>
                      <Input
                        id="dueTime"
                        type="datetime-local"
                        value={taskFormData.dueTime}
                        onChange={(e) =>
                          setTaskFormData((prev) => ({
                            ...prev,
                            dueTime: e.target.value,
                          }))
                        }
                      />
                    </div>
                    <div className="flex justify-end gap-3">
                      <Button
                        variant="outline"
                        onClick={() => setShowCreateTaskModal(false)}
                      >
                        {common.cancel}
                      </Button>
                      <Button
                        onClick={handleCreateTask}
                        disabled={isCreatingTask}
                      >
                        {isCreatingTask
                          ? createModalT.creating || "Creating..."
                          : createModalT.createTask || t.createTask}
                      </Button>
                    </div>
                  </div>
                </DialogContent>
              </Dialog>
            ))}
        </div>
      </div>

      <div className="grid grid-cols-2 md:grid-cols-4 gap-3">
        <Card className="border">
          <CardContent className="p-4">
            <div className="flex items-center justify-between">
              <div>
                <p className="text-2xl font-bold">{stats.pending}</p>
                <p className="text-sm text-muted-foreground">
                  {t.stats.pending}
                </p>
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
                <p className="text-sm text-muted-foreground">
                  {t.stats.completed}
                </p>
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
                <p className="text-sm text-muted-foreground">
                  {t.stats.overdue}
                </p>
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
                <p className="text-sm text-muted-foreground">
                  {t.stats.urgent}
                </p>
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
                placeholder={t.filters.searchPlaceholder}
                value={searchQuery}
                onChange={(e) => setSearchQuery(e.target.value)}
                className="pl-10"
              />
            </div>
            <div className="flex gap-2">
              <Select
                value={statusFilter}
                onValueChange={(v: any) => setStatusFilter(v)}
              >
                <SelectTrigger className="w-32">
                  <SelectValue placeholder={t.filters.statusPlaceholder} />
                </SelectTrigger>
                <SelectContent>
                  <SelectItem value="all">{t.filters.status.all}</SelectItem>
                  <SelectItem value="pending">
                    {t.filters.status.pending}
                  </SelectItem>
                  <SelectItem value="completed">
                    {t.filters.status.completed}
                  </SelectItem>
                  <SelectItem value="overdue">
                    {t.filters.status.overdue}
                  </SelectItem>
                </SelectContent>
              </Select>

              <Select
                value={priorityFilter}
                onValueChange={(v: any) => setPriorityFilter(v)}
              >
                <SelectTrigger className="w-32">
                  <SelectValue placeholder={t.filters.priorityPlaceholder} />
                </SelectTrigger>
                <SelectContent>
                  <SelectItem value="all">{t.filters.priority.all}</SelectItem>
                  <SelectItem value="urgent">
                    {t.filters.priority.urgent}
                  </SelectItem>
                  <SelectItem value="high">
                    {t.filters.priority.high}
                  </SelectItem>
                  <SelectItem value="medium">
                    {t.filters.priority.medium}
                  </SelectItem>
                  <SelectItem value="low">{t.filters.priority.low}</SelectItem>
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
            <p className="mt-2 text-muted-foreground">{t.loadingTasks}</p>
          </Card>
        ) : (
          <>
            {(() => {
              const pendingTasks = filteredTasks.filter(t => t.status !== 'completed');
              const completedTasks = filteredTasks.filter(t => t.status === 'completed');

              return (
                <>
                  {pendingTasks.length > 0 && (
                    <AnimatePresence>
                      {pendingTasks.map((task) => (
                        <TaskItem
                          key={task.id}
                          task={task}
                          onComplete={handleTaskComplete}
                          showPatientInfo={!patientId}
                        />
                      ))}
                    </AnimatePresence>
                  )}

                  {completedTasks.length > 0 && (
                    <div className="space-y-3">
                      <Button
                        variant="outline"
                        onClick={() => setShowCompleted(!showCompleted)}
                        className="w-full justify-between"
                      >
                        <span>
                          {showCompleted ? 'Hide' : 'Show'} Completed Tasks ({completedTasks.length})
                        </span>
                        {showCompleted ? (
                          <ChevronUp className="h-4 w-4" />
                        ) : (
                          <ChevronDown className="h-4 w-4" />
                        )}
                      </Button>

                      {showCompleted && (
                        <AnimatePresence>
                          {completedTasks.map((task) => (
                            <TaskItem
                              key={task.id}
                              task={task}
                              onComplete={handleTaskComplete}
                              showPatientInfo={!patientId}
                            />
                          ))}
                        </AnimatePresence>
                      )}
                    </div>
                  )}

                  {pendingTasks.length === 0 && completedTasks.length === 0 && (
                    <Card className="p-12 text-center border">
                      <CheckSquare className="h-12 w-12 text-muted-foreground mx-auto mb-4" />
                      <h3 className="font-medium mb-1">{t.emptyState.noTasksFound}</h3>
                      <p className="text-sm text-muted-foreground">
                        {searchQuery || statusFilter !== "all" || priorityFilter !== "all"
                          ? t.emptyState.tryAdjustingFilters
                          : t.emptyState.allCaughtUp}
                      </p>
                    </Card>
                  )}
                </>
              );
            })()}
          </>
        )}
      </div>
    </div>
  );
};
