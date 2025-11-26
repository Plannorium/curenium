"use client";

import { useState, useEffect } from "react";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { Button } from "@/components/ui/button";
import { Badge } from "@/components/ui/badge";
import { Avatar, AvatarFallback, AvatarImage } from "@/components/ui/avatar";
import { Tabs, TabsContent, TabsList, TabsTrigger } from "@/components/ui/tabs";
import {
  Plus,
  Clock,
  Play,
  Pause,
  Square,
  Coffee,
  FileText,
  Eye,
  Edit,
  Calendar,
  User,
  Activity,
  XCircle
} from "lucide-react";
import { toast } from "sonner";
import { useSession } from "next-auth/react";
import { Loader } from "@/components/ui/Loader";
import AddShiftModal from "@/app/(dashboard)/components/AddShiftModal";

// Types
interface ShiftTracking {
  _id: string;
  user: {
    _id: string;
    fullName: string;
    email: string;
    role: string;
    image?: string;
  };
  userImage?: string; // Cached user image for better performance
  shiftDate: string;
  scheduledStart: string;
  scheduledEnd: string;
  actualStart?: string;
  actualEnd?: string;
  status: 'scheduled' | 'active' | 'on_break' | 'completed' | 'absent' | 'cancelled';
  department?: {
    _id: string;
    name: string;
  };
  ward?: {
    _id: string;
    name: string;
    wardNumber: string;
  };
  role: string;
  breaks: Array<{
    type: 'lunch' | 'rest' | 'meeting' | 'emergency' | 'other';
    startTime: string;
    endTime?: string;
    duration?: number;
    notes?: string;
  }>;
  shiftNotes?: string;
  handoverNotes?: string;
  morningReport?: string;
  eveningReport?: string;
  tasksCompleted?: number;
  incidentsReported?: number;
  patientInteractions?: number;
  loginEvents: Array<{
    timestamp: string;
    action: 'login' | 'logout' | 'break_start' | 'break_end';
    location?: string;
    notes?: string;
  }>;
  isMissed?: boolean;
  missedDuration?: number;
  isFromBasicShifts?: boolean;
}

const ShiftTrackingPage = () => {
  const { data: session } = useSession();
  const [shifts, setShifts] = useState<ShiftTracking[]>([]);
  const [loading, setLoading] = useState(true);
  const [activeTab, setActiveTab] = useState("today");
  const [currentTime, setCurrentTime] = useState(new Date());

  useEffect(() => {
    fetchShifts();
    // Update current time every minute
    const timer = setInterval(() => setCurrentTime(new Date()), 60000);
    return () => clearInterval(timer);
  }, []);

  const fetchShifts = async () => {
    setLoading(true);
    try {
      const response = await fetch('/api/shift-tracking');
      if (response.ok) {
        const data = await response.json() as ShiftTracking[];
        setShifts(data);
      } else {
        toast.error('Failed to fetch shifts');
      }
    } catch (error) {
      console.error('Failed to fetch shifts:', error);
      toast.error('An error occurred while fetching shifts');
    } finally {
      setLoading(false);
    }
  };

  const getStatusColor = (status: string) => {
    switch (status) {
      case 'scheduled': return 'bg-blue-100 text-blue-800 dark:bg-blue-900/20 dark:text-blue-400';
      case 'active': return 'bg-green-100 text-green-800 dark:bg-green-900/20 dark:text-green-400';
      case 'on_break': return 'bg-yellow-100 text-yellow-800 dark:bg-yellow-900/20 dark:text-yellow-400';
      case 'completed': return 'bg-gray-100 text-gray-800 dark:bg-gray-900/20 dark:text-gray-400';
      case 'absent': return 'bg-red-100 text-red-800 dark:bg-red-900/20 dark:text-red-400';
      case 'cancelled': return 'bg-red-100 text-red-800 dark:bg-red-900/20 dark:text-red-400';
      default: return 'bg-gray-100 text-gray-800 dark:bg-gray-900/20 dark:text-gray-400';
    }
  };

  const handleShiftAction = async (shiftId: string, action: string, data?: any) => {
    try {
      const response = await fetch(`/api/shift-tracking/${shiftId}`, {
        method: 'PUT',
        headers: {
          'Content-Type': 'application/json',
        },
        body: JSON.stringify({ action, ...data }),
      });

      if (response.ok) {
        toast.success(`Shift ${action.replace('_', ' ')} successfully`);
        fetchShifts();
      } else {
        const error = await response.json() as { message?: string };
        toast.error(error.message || `Failed to ${action} shift`);
      }
    } catch (error) {
      console.error(`Failed to ${action} shift:`, error);
      toast.error(`An error occurred while ${action}ing shift`);
    }
  };

  const filteredShifts = shifts.filter(shift => {
    const shiftDate = new Date(shift.shiftDate);
    const today = new Date();

    if (activeTab === 'all') return true;
    if (activeTab === 'today') {
      return shiftDate.toDateString() === today.toDateString();
    }
    if (activeTab === 'week') {
      const weekStart = new Date(today);
      weekStart.setDate(today.getDate() - today.getDay());
      const weekEnd = new Date(weekStart);
      weekEnd.setDate(weekStart.getDate() + 6);
      return shiftDate >= weekStart && shiftDate <= weekEnd;
    }
    if (activeTab === 'missed') {
      return shift.isMissed === true;
    }
    return shift.status === activeTab;
  });

  const canClockIn = (shift: ShiftTracking) => {
    return session?.user?.role === 'matron_nurse' &&
           shift.user._id === session.user.id &&
           shift.status === 'scheduled' &&
           new Date(shift.scheduledStart) <= currentTime;
  };

  const canClockOut = (shift: ShiftTracking) => {
    return session?.user?.role === 'matron_nurse' &&
           shift.user._id === session.user.id &&
           (shift.status === 'active' || shift.status === 'on_break');
  };

  const canStartBreak = (shift: ShiftTracking) => {
    return session?.user?.role === 'matron_nurse' &&
           shift.user._id === session.user.id &&
           shift.status === 'active';
  };

  const canEndBreak = (shift: ShiftTracking) => {
    return session?.user?.role === 'matron_nurse' &&
           shift.user._id === session.user.id &&
           shift.status === 'on_break';
  };

  const getCurrentBreakType = (shift: ShiftTracking) => {
    const currentBreak = shift.breaks.find(b => !b.endTime);
    return currentBreak?.type || 'rest';
  };

  if (loading) {
    return <Loader text="Loading shift data..." />;
  }

  return (
    <div className="space-y-6 md:space-y-8 p-3 md:p-4 lg:p-5">
      {/* Header */}
      <div className="flex flex-col sm:flex-row sm:items-center sm:justify-between gap-4">
        <div>
          <h1 className="text-2xl md:text-3xl font-bold text-gray-900 dark:text-white">
            Shift Tracking
          </h1>
          <p className="text-sm md:text-base text-muted-foreground mt-1 md:mt-2">
            Advanced shift management and time tracking
          </p>
        </div>
        {session?.user?.role === 'admin' && (
          <AddShiftModal onShiftAdded={fetchShifts}>
            <Button className="w-full sm:w-auto">
              <Plus className="h-4 w-4 mr-2" />
              <span className="hidden xs:inline">Schedule Shift</span>
              <span className="xs:hidden">Add</span>
            </Button>
          </AddShiftModal>
        )}
      </div>

      {/* Stats Cards */}
      <div className="grid grid-cols-2 sm:grid-cols-3 lg:grid-cols-5 gap-3 md:gap-4 lg:gap-6">
        <Card>
          <CardContent className="p-6">
            <div className="flex items-center">
              <Clock className="h-8 w-8 text-blue-600" />
              <div className="ml-4">
                <p className="text-sm font-medium text-muted-foreground">Active Shifts</p>
                <p className="text-2xl font-bold">
                  {shifts.filter(s => s.status === 'active').length}
                </p>
              </div>
            </div>
          </CardContent>
        </Card>

        <Card>
          <CardContent className="p-6">
            <div className="flex items-center">
              <Pause className="h-8 w-8 text-yellow-600" />
              <div className="ml-4">
                <p className="text-sm font-medium text-muted-foreground">On Break</p>
                <p className="text-2xl font-bold">
                  {shifts.filter(s => s.status === 'on_break').length}
                </p>
              </div>
            </div>
          </CardContent>
        </Card>

        <Card>
          <CardContent className="p-6">
            <div className="flex items-center">
              <Activity className="h-8 w-8 text-green-600" />
              <div className="ml-4">
                <p className="text-sm font-medium text-muted-foreground">Completed Today</p>
                <p className="text-2xl font-bold">
                  {shifts.filter(s =>
                    s.status === 'completed' &&
                    new Date(s.shiftDate).toDateString() === new Date().toDateString()
                  ).length}
                </p>
              </div>
            </div>
          </CardContent>
        </Card>

        <Card>
          <CardContent className="p-6">
            <div className="flex items-center">
              <User className="h-8 w-8 text-purple-600" />
              <div className="ml-4">
                <p className="text-sm font-medium text-muted-foreground">Total Staff</p>
                <p className="text-2xl font-bold">
                  {new Set(shifts.map(s => s.user._id)).size}
                </p>
              </div>
            </div>
          </CardContent>
        </Card>

        <Card>
          <CardContent className="p-6">
            <div className="flex items-center">
              <XCircle className="h-8 w-8 text-red-600" />
              <div className="ml-4">
                <p className="text-sm font-medium text-muted-foreground">Missed Shifts</p>
                <p className="text-2xl font-bold text-red-600">
                  {shifts.filter(s => s.isMissed).length}
                </p>
              </div>
            </div>
          </CardContent>
        </Card>
      </div>

      {/* Shifts List */}
      <Card>
        <CardHeader>
          <CardTitle>Shifts</CardTitle>
        </CardHeader>
        <CardContent>
          <Tabs value={activeTab} onValueChange={setActiveTab}>
            <TabsList className="grid w-full grid-cols-3 sm:grid-cols-6 h-auto p-1">
              <TabsTrigger value="today" className="text-xs sm:text-sm">Today</TabsTrigger>
              <TabsTrigger value="week" className="text-xs sm:text-sm hidden sm:inline-flex">Week</TabsTrigger>
              <TabsTrigger value="active" className="text-xs sm:text-sm">Active</TabsTrigger>
              <TabsTrigger value="missed" className="text-xs sm:text-sm text-red-600 data-[state=active]:text-red-600 data-[state=active]:bg-red-50">
                <span className="hidden sm:inline">Missed</span>
                <span className="sm:hidden">Miss</span>
              </TabsTrigger>
              <TabsTrigger value="completed" className="text-xs sm:text-sm hidden sm:inline-flex">Done</TabsTrigger>
              <TabsTrigger value="all" className="text-xs sm:text-sm">All</TabsTrigger>
            </TabsList>

            <div className="mt-6 space-y-4">
              {filteredShifts.length === 0 ? (
                <div className="text-center py-8">
                  <FileText className="h-12 w-12 text-muted-foreground mx-auto mb-4" />
                  <h3 className="text-lg font-semibold text-gray-900 dark:text-white mb-2">
                    {activeTab === 'missed' ? 'No missed shifts' : 'No shifts found'}
                  </h3>
                  <p className="text-muted-foreground">
                    {activeTab === 'missed'
                      ? 'Great! All scheduled shifts are on track.'
                      : activeTab === 'all'
                        ? 'No shifts have been scheduled yet.'
                        : `No ${activeTab} shifts.`
                    }
                  </p>
                </div>
              ) : (
                filteredShifts.map((shift) => (
                  <Card key={shift._id} className={`hover:shadow-md transition-shadow ${shift.isMissed ? 'border-red-300 bg-red-50/50 dark:border-red-700 dark:bg-red-950/20' : ''}`}>
                    <CardContent className="p-4 md:p-6">
                      <div className="flex flex-col sm:flex-row sm:items-start sm:justify-between gap-4">
                        <div className="flex items-start space-x-3 md:space-x-4 flex-1 min-w-0">
                          <Avatar className="h-10 w-10 md:h-12 md:w-12 shrink-0">
                            <AvatarImage src={shift.userImage || shift.user.image || ''} alt={shift.user.fullName} />
                            <AvatarFallback className="text-xs md:text-sm">
                              {shift.user.fullName.split(' ').map(n => n[0]).join('')}
                            </AvatarFallback>
                          </Avatar>

                          <div className="flex-1 min-w-0">
                            <div className="flex flex-wrap items-center gap-2 mb-2">
                              <h3 className="text-base md:text-lg font-semibold text-gray-900 dark:text-white truncate">
                                {shift.user.fullName}
                              </h3>
                              {shift.isMissed ? (
                                <Badge className="bg-red-100 text-red-800 dark:bg-red-900/20 dark:text-red-400 text-xs">
                                  MISSED ({shift.missedDuration}min late)
                                </Badge>
                              ) : (
                                <Badge className={`${getStatusColor(shift.status)} text-xs`}>
                                  {shift.status.replace('_', ' ').toUpperCase()}
                                </Badge>
                              )}
                              <Badge variant="outline" className="text-xs">
                                {shift.role}
                              </Badge>
                              {shift.isFromBasicShifts && (
                                <Badge variant="secondary" className="text-xs">
                                  Basic
                                </Badge>
                              )}
                            </div>

                            <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-4 gap-2 md:gap-4 text-xs md:text-sm text-muted-foreground mb-3 md:mb-4">
                              <div className="min-w-0">
                                <span className="font-medium">Date:</span>
                                <div className="truncate">{new Date(shift.shiftDate).toLocaleDateString()}</div>
                              </div>
                              <div className="min-w-0">
                                <span className="font-medium">Scheduled:</span>
                                <div className="truncate">
                                  {new Date(shift.scheduledStart).toLocaleTimeString([], { hour: '2-digit', minute: '2-digit' })} -
                                  {new Date(shift.scheduledEnd).toLocaleTimeString([], { hour: '2-digit', minute: '2-digit' })}
                                </div>
                              </div>
                              {shift.actualStart && (
                                <div className="min-w-0">
                                  <span className="font-medium">Started:</span>
                                  <div className="truncate">{new Date(shift.actualStart).toLocaleTimeString([], { hour: '2-digit', minute: '2-digit' })}</div>
                                </div>
                              )}
                              {shift.actualEnd && (
                                <div className="min-w-0">
                                  <span className="font-medium">Ended:</span>
                                  <div className="truncate">{new Date(shift.actualEnd).toLocaleTimeString([], { hour: '2-digit', minute: '2-digit' })}</div>
                                </div>
                              )}
                              {shift.department && (
                                <div className="min-w-0">
                                  <span className="font-medium">Dept:</span>
                                  <div className="truncate">{shift.department.name}</div>
                                </div>
                              )}
                              {shift.ward && (
                                <div className="min-w-0">
                                  <span className="font-medium">Ward:</span>
                                  <div className="truncate">{shift.ward.name} ({shift.ward.wardNumber})</div>
                                </div>
                              )}
                            </div>

                            {/* Break Information */}
                            {shift.breaks.length > 0 && (
                              <div className="mb-4">
                                <p className="text-sm font-medium mb-2">Breaks:</p>
                                <div className="flex flex-wrap gap-2">
                                  {shift.breaks.map((breakItem, index) => (
                                    <Badge key={index} variant="outline" className="text-xs">
                                      {breakItem.type}: {breakItem.duration ? `${breakItem.duration}min` : 'In progress'}
                                    </Badge>
                                  ))}
                                </div>
                              </div>
                            )}

                            {/* Performance Metrics */}
                            {(shift.tasksCompleted || shift.incidentsReported || shift.patientInteractions) && (
                              <div className="mb-4">
                                <p className="text-sm font-medium mb-2">Performance:</p>
                                <div className="flex flex-wrap gap-4 text-xs text-muted-foreground">
                                  {shift.tasksCompleted && <span>Tasks: {shift.tasksCompleted}</span>}
                                  {shift.incidentsReported && <span>Incidents: {shift.incidentsReported}</span>}
                                  {shift.patientInteractions && <span>Interactions: {shift.patientInteractions}</span>}
                                </div>
                              </div>
                            )}
                          </div>
                        </div>

                        <div className="flex flex-col sm:flex-row sm:items-center gap-2 sm:ml-4">
                          <div className="flex flex-wrap gap-2">
                            <Button variant="outline" size="sm" className="flex-1 sm:flex-none">
                              <Eye className="h-4 w-4 sm:mr-1" />
                              <span className="hidden sm:inline">Details</span>
                            </Button>

                            {/* Basic shift actions - available for both basic and advanced shifts */}
                            {canClockIn(shift) && (
                              <Button
                                variant="outline"
                                size="sm"
                                onClick={() => handleShiftAction(shift._id, 'clock_in')}
                                className="text-green-600 hover:text-green-700 flex-1 sm:flex-none"
                              >
                                <Play className="h-4 w-4 sm:mr-1" />
                                <span className="hidden sm:inline">Clock In</span>
                                <span className="sm:hidden">In</span>
                              </Button>
                            )}

                            {canClockOut(shift) && (
                              <Button
                                variant="outline"
                                size="sm"
                                onClick={() => handleShiftAction(shift._id, 'clock_out')}
                                className="text-red-600 hover:text-red-700 flex-1 sm:flex-none"
                              >
                                <Square className="h-4 w-4 sm:mr-1" />
                                <span className="hidden sm:inline">Clock Out</span>
                                <span className="sm:hidden">Out</span>
                              </Button>
                            )}

                            {/* Advanced actions - only for advanced shift tracking */}
                            {!shift.isFromBasicShifts && canStartBreak(shift) && (
                              <Button
                                variant="outline"
                                size="sm"
                                onClick={() => handleShiftAction(shift._id, 'start_break', {
                                  breakType: 'lunch',
                                  breakNotes: 'Lunch break'
                                })}
                                className="text-yellow-600 hover:text-yellow-700 flex-1 sm:flex-none"
                              >
                                <Coffee className="h-4 w-4 sm:mr-1" />
                                <span className="hidden sm:inline">Break</span>
                              </Button>
                            )}

                            {!shift.isFromBasicShifts && canEndBreak(shift) && (
                              <Button
                                variant="outline"
                                size="sm"
                                onClick={() => handleShiftAction(shift._id, 'end_break')}
                                className="text-blue-600 hover:text-blue-700 flex-1 sm:flex-none"
                              >
                                <Play className="h-4 w-4 sm:mr-1" />
                                <span className="hidden sm:inline">End Break</span>
                                <span className="sm:hidden">End</span>
                              </Button>
                            )}

                            {shift.isMissed && session?.user?.role === 'admin' && (
                              <Button
                                variant="outline"
                                size="sm"
                                onClick={() => handleShiftAction(shift._id, 'mark_absent')}
                                className="text-red-600 hover:text-red-700 flex-1 sm:flex-none"
                              >
                                <XCircle className="h-4 w-4 sm:mr-1" />
                                <span className="hidden sm:inline">Mark Absent</span>
                                <span className="sm:hidden">Absent</span>
                              </Button>
                            )}
                          </div>
                        </div>
                      </div>
                    </CardContent>
                  </Card>
                ))
              )}
            </div>
          </Tabs>
        </CardContent>
      </Card>
    </div>
  );
};

export default ShiftTrackingPage;