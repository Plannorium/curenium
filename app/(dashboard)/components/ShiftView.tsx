'use client';
import React, { useState, useEffect, useMemo } from 'react';
import HijriCalendar from '@/components/ui/hijri-calendar';
import { useCalendar } from '@/components/ui/calendar-context';
import { Avatar, AvatarFallback, AvatarImage } from "@/components/ui/avatar";
import { Button } from '@/components/ui/button';
import { ChevronLeft, ChevronRight, Plus, MoreVertical, Calendar as CalendarIcon, Stethoscope, UserCheck, Clock, Shield, Heart, StickyNote, Play, Pause, Square, Coffee } from 'lucide-react';
import {
  DropdownMenu,
  DropdownMenuContent,
  DropdownMenuItem,
  DropdownMenuTrigger,
} from "@/components/ui/dropdown-menu";
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card';
import { Badge } from '@/components/ui/badge';
import AddShiftModal from './AddShiftModal';
import NotesModal from './NotesModal'; // Import NotesModal
import { useSession } from 'next-auth/react';
import { toast } from 'sonner';

interface Shift {
  _id: string;
  role: string;
  user: {
    _id: string;
    fullName: string;
    image?: string;
  };
  startTime: string | null;
  endTime: string | null;
  initials: string;
  status: 'on-shift' | 'on-call' | 'upcoming';
  department?: {
    _id: string;
    name: string;
  };
  ward?: {
    _id: string;
    name: string;
    wardNumber: string;
  };
  shiftNotes?: string;
  _malformed?: boolean;
}

interface ShiftViewProps {
  limit?: number;
}

const ShiftView = ({ limit }: ShiftViewProps) => {
   const { data: session } = useSession();
   const { calendarType, setCalendarType } = useCalendar();
   const [selectedDate, setSelectedDate] = useState<Date | undefined>(new Date());
   const [displayMonth, setDisplayMonth] = useState<Date>(selectedDate || new Date());
   const [shifts, setShifts] = useState<Shift[]>([]);
   const [selectedShift, setSelectedShift] = useState<Shift | null>(null);
   const [currentTime, setCurrentTime] = useState(new Date());

  const fetchShifts = async () => {
    try {
      // Fetch from both APIs simultaneously
      const [shiftTrackingRes, basicShiftsRes] = await Promise.all([
        fetch('/api/shift-tracking'),
        fetch('/api/shifts')
      ]);

      const allShifts: any[] = [];

      // Process shift-tracking data
      if (shiftTrackingRes.ok) {
        const shiftTrackingData = await shiftTrackingRes.json();
        const trackingArr = Array.isArray(shiftTrackingData) ? shiftTrackingData : [];
        allShifts.push(...trackingArr);
      }

      // Process basic shifts data
      if (basicShiftsRes.ok) {
        const basicShiftsData = await basicShiftsRes.json();
        const basicArr = Array.isArray(basicShiftsData) ? basicShiftsData : [];
        allShifts.push(...basicArr);
      }

      // Normalize and validate all shifts
      const normalized: Shift[] = allShifts.map((s) => {
        const out: Partial<Shift> = { ...s };

        // Handle different time field names
        let start: Date | null = null;
        let end: Date | null = null;

        if (s.scheduledStart) {
          // From shift-tracking API
          start = new Date(s.scheduledStart);
          end = new Date(s.scheduledEnd);
        } else if (s.startTime) {
          // From basic shifts API
          start = new Date(s.startTime);
          end = new Date(s.endTime);
        }

        out.startTime = start && !isNaN(start.getTime()) ? start.toISOString() : null;
        out.endTime = end && !isNaN(end.getTime()) ? end.toISOString() : null;

        // Ensure user object
        out.user = s.user || { _id: '', fullName: 'Unknown' };
        // Ensure role
        out.role = s.role || 'Staff';

        // Handle department and ward (populated from shift-tracking API)
        out.department = s.department;
        out.ward = s.ward;
        out.shiftNotes = s.shiftNotes;

        // Map status from shift-tracking to basic shift status
        const statusMap: { [key: string]: string } = {
          'scheduled': 'upcoming',
          'active': 'on-shift',
          'on_call': 'on-call',
          'completed': 'upcoming',
          'cancelled': 'upcoming'
        };
        out.status = statusMap[s.status] || s.status || 'upcoming';

        // initials fallback
        out.initials = s.initials || (out.user && out.user.fullName ? out.user.fullName.split(' ').map((n: string) => n[0]).slice(0,2).join('') : '');

        // flag malformed if required fields missing or times invalid
        const validTimes = !!out.startTime && !!out.endTime;
        const hasUser = !!out.user && !!out.user.fullName;
        const hasRole = !!out.role;
        out._malformed = !(validTimes && hasUser && hasRole);

        return out as Shift; // Cast to Shift after ensuring all required properties
      });

      // Remove duplicates based on _id
      const uniqueShifts = normalized.filter((shift, index, self) =>
        index === self.findIndex(s => s._id === shift._id)
      );

      const malformed = uniqueShifts.filter((s) => s._malformed);
      if (malformed.length > 0) {
        console.warn('Malformed shift records detected:', malformed);
      }

      setShifts(uniqueShifts);
    } catch (error) {
      console.error("Failed to fetch shifts:", error);
      setShifts([]);
    }
  };

  useEffect(() => {
    fetchShifts();
  }, []);

  useEffect(() => {
    if (selectedDate) {
      setDisplayMonth(selectedDate);
    }
  }, [selectedDate]);

  // Update current time every minute for real-time status
  useEffect(() => {
    const timer = setInterval(() => setCurrentTime(new Date()), 60000);
    return () => clearInterval(timer);
  }, []);

  const filteredShifts = useMemo(() => {
    if (!selectedDate) {
      // If no date is selected, show all shifts
      return shifts?.filter(shift => !!shift.startTime && !!shift.endTime) || [];
    }

    return shifts?.filter(shift => {
      // include shifts that span the selected date
      if (!shift.startTime || !shift.endTime) return false;
      const start = new Date(shift.startTime);
      const end = new Date(shift.endTime);
      if (isNaN(start.getTime()) || isNaN(end.getTime())) return false;

      const targetDate = new Date(selectedDate);
      const dayStart = new Date(targetDate);
      dayStart.setHours(0, 0, 0, 0);
      const dayEnd = new Date(targetDate);
      dayEnd.setHours(23, 59, 59, 999);

      return (start <= dayEnd && end >= dayStart);
    }) || [];
  }, [shifts, selectedDate]);

  const onCallShifts = useMemo(() => {
    return shifts?.filter(shift => shift.status === 'on-call');
  }, [shifts]);

  // Calculate days with shifts for highlighting
  const daysWithShifts = useMemo(() => {
    const shiftDays = new Set<Date>();
    shifts?.forEach(shift => {
      if (shift.startTime) {
        const startDate = new Date(shift.startTime);
        // Add the start date
        const startDay = new Date(startDate.getFullYear(), startDate.getMonth(), startDate.getDate());
        shiftDays.add(startDay);

        // If shift spans multiple days, add those days too
        if (shift.endTime) {
          const endDate = new Date(shift.endTime);
          const endDay = new Date(endDate.getFullYear(), endDate.getMonth(), endDate.getDate());

          // Add all days between start and end
          const currentDay = new Date(startDay);
          while (currentDay <= endDay) {
            shiftDays.add(new Date(currentDay));
            currentDay.setDate(currentDay.getDate() + 1);
          }
        }
      }
    });
    return Array.from(shiftDays);
  }, [shifts]);

  const getRoleIcon = (role?: string) => {
    const r = (role || '').toLowerCase();
    switch (r) {
      case 'cardiologist':
        return <Heart className="w-4 h-4 text-primary-600 dark:text-primary-400" />;
      case 'surgeon':
      case 'on-call surgeon':
        return <Shield className="w-4 h-4 text-primary-600 dark:text-primary-400" />;
      case 'emergency nurse':
      case 'nurse':
        return <UserCheck className="w-4 h-4 text-primary-600 dark:text-primary-400" />;
      case 'neurologist':
        return <Stethoscope className="w-4 h-4 text-primary-600 dark:text-primary-400" />;
      default:
        return <Stethoscope className="w-4 h-4 text-primary-600 dark:text-primary-400" />;
    }
  };

  const getStatusBadgeVariant = (status: string) => {
    switch (status) {
      case 'on-shift':
        return 'default'; // Will use primary colors
      case 'on-call':
        return 'secondary'; // Will use accent colors
      case 'upcoming':
        return 'outline';
      default:
        return 'secondary';
    }
  };

  const navigateDate = (direction: 'prev' | 'next') => {
    if (!selectedDate) return;
    const newDate = new Date(selectedDate);
    newDate.setDate(newDate.getDate() + (direction === 'next' ? 1 : -1));
    setSelectedDate(newDate);
  };

  // Shift action handlers for real-time status updates
  const handleShiftAction = async (shiftId: string, action: string, data?: any) => {
    try {
      const response = await fetch(`/api/shifts/${shiftId}`, {
        method: 'PUT',
        headers: {
          'Content-Type': 'application/json',
        },
        body: JSON.stringify({ action, ...data }),
      });

      if (response.ok) {
        toast.success(`Shift ${action.replace('_', ' ')} successfully`);
        fetchShifts(); // Refresh shifts to show updated status
      } else {
        const error = await response.json() as { message?: string };
        toast.error(error.message || `Failed to ${action} shift`);
      }
    } catch (error) {
      console.error(`Failed to ${action} shift:`, error);
      toast.error(`An error occurred while ${action}ing shift`);
    }
  };

  // Check if user can perform actions on their shift
  const canClockIn = (shift: Shift) => {
    return session?.user?.id === shift.user._id &&
           shift.status === 'upcoming' &&
           shift.startTime &&
           new Date(shift.startTime) <= currentTime;
  };

  const canClockOut = (shift: Shift) => {
    return session?.user?.id === shift.user._id &&
           (shift.status === 'on-shift' || shift.status === 'on-call');
  };

  const canGoOnCall = (shift: Shift) => {
    return session?.user?.id === shift.user._id &&
           shift.status === 'on-shift';
  };

  const canGoOffCall = (shift: Shift) => {
    return session?.user?.id === shift.user._id &&
           shift.status === 'on-call';
  };

  return (
    <div className="h-full flex flex-col bg-background">
      {/* Header */}
      <div className="bg-gradient-to-r from-primary-50 to-primary-100 dark:from-primary-950/50 dark:to-primary-900/30 border-b border-border px-6 py-4">
        <div className="flex items-center justify-between">
          <div className="flex items-center gap-4">
            <div className="p-2 bg-primary-100 dark:bg-primary-900/50 rounded-lg">
              <CalendarIcon className="w-5 h-5 text-primary-600 dark:text-primary-400" />
            </div>
            <div>
              <h1 className="text-xl font-semibold text-foreground">Shift Schedule</h1>
              <p className="text-sm text-muted-foreground">Manage team schedules and on-call assignments</p>
            </div>
          </div>
          <AddShiftModal onShiftAdded={fetchShifts}>
            <Button 
              size="sm"
              className="bg-primary hover:bg-primary/90 text-primary-foreground shadow-lg hover:shadow-xl transition-all duration-300 hover:scale-[1.02] backdrop-blur-sm cursor-pointer"
            >
              <Plus className="h-4 w-4 lg:mr-2" />
             <span className='hidden md:block'>
              Add Shift
              </span> 
            </Button>
          </AddShiftModal>
        </div>
      </div>

      {/* Date Navigation */}
      <div className="bg-card/80 dark:bg-gray-900/70 border-border/50 dark:border-gray-700/50 border-b px-6 py-3">
        <div className="flex items-center justify-center gap-4">
          <Button 
            variant="ghost" 
            size="icon" 
            className="h-8 w-8 hover:bg-primary-50 dark:hover:bg-primary-900/50 hover:text-primary-600 dark:hover:text-primary-400 transition-colors" 
            onClick={() => navigateDate('prev')}
          >
            <ChevronLeft className="h-4 w-4" />
          </Button>
          <div className="text-center min-w-[200px]">
            <p className="font-semibold text-foreground">
              {selectedDate ? selectedDate.toLocaleDateString('en-US', { weekday: 'long' }) : 'Select a date'}
            </p>
            <p className="text-xs text-muted-foreground">
              {selectedDate ? selectedDate.toLocaleDateString('en-US', { month: 'long', day: 'numeric', year: 'numeric' }) : ''}
            </p>
          </div>
          <Button 
            variant="ghost" 
            size="icon" 
            className="h-8 w-8 hover:bg-primary-50 dark:hover:bg-primary-900/50 hover:text-primary-600 dark:hover:text-primary-400 transition-colors" 
            onClick={() => navigateDate('next')}
          >
            <ChevronRight className="h-4 w-4" />
          </Button>
        </div>
      </div>
      
      <div className="flex flex-1 flex-col md:flex-row overflow-hidden">
        {/* Calendar Section */}
        <div className="w-full md:w-1/3 lg:w-2/5 bg-card/80 dark:bg-gray-900/70 border-border/50 dark:border-gray-700/50 border-b md:border-b-0 md:border-r p-4 overflow-y-auto flex justify-center">
          <div className="w-full max-w-md">
            <HijriCalendar
              selectedDate={selectedDate}
              onDateSelect={setSelectedDate}
              calendarType={calendarType}
              onCalendarTypeChange={setCalendarType}
              highlightedDays={daysWithShifts}
            />
          </div>
        </div>

          {/* Shifts List */}
        <div className="w-full md:w-2/3 lg:w-3/5 xl:w-1/2 bg-card/80 dark:bg-gray-900/70 border-border/50 dark:border-gray-700/50 border-b md:border-b-0 md:border-r overflow-y-auto p-2">
          <div className="space-y-4">
            <div className="flex items-center justify-between">
              <h2 className="text-lg font-semibold text-foreground">Today&apos;s Shifts</h2>
              <Badge variant="outline" className="text-xs">
                {limit ? Math.min(filteredShifts.length, limit) : filteredShifts.length} {((limit ? Math.min(filteredShifts.length, limit) : filteredShifts.length) === 1) ? 'shift' : 'shifts'}
              </Badge>
            </div>
            
            {(limit ? filteredShifts.slice(0, limit) : filteredShifts).length > 0 ? (
              <div className="space-y-3">
                {(limit ? filteredShifts.slice(0, limit) : filteredShifts).map((shift: Shift) => (
                  <div
                    key={shift._id}
                    className="group bg-card border border-border rounded-lg p-4 transition-all duration-200 hover:bg-muted/50 hover:border-primary/20"
                  >
                    <div className="flex items-center justify-between gap-4">
                      <div className="flex items-center gap-4 flex-1 min-w-0">
                        <Avatar className="h-10 w-10 ring-2 ring-primary-100 dark:ring-primary-900/50 group-hover:scale-105 transform transition-transform duration-200">
                          <AvatarImage src={shift.user?.image || ''} alt={shift.user?.fullName || ''} />
                          <AvatarFallback className="bg-primary-100 dark:bg-primary-900/50 text-primary-600 dark:text-primary-400 font-medium">
                            {shift.initials}
                          </AvatarFallback>
                        </Avatar>
                        <div className="flex-1 min-w-0">
                          <div className="flex items-center gap-2">
                            {getRoleIcon(shift.role)}
                            <p className="font-semibold text-base text-foreground truncate">{shift.user.fullName}</p>
                            {shift._malformed && (
                              <Badge variant="destructive" className="ml-2 text-xs flex-shrink-0">!</Badge>
                            )}
                            {(shift.department || shift.ward) && (
                              <Badge variant="secondary" className="ml-2 text-xs flex-shrink-0 bg-blue-100 text-blue-700 dark:bg-blue-900/30 dark:text-blue-300">
                                Advanced
                              </Badge>
                            )}
                          </div>
                          <div className="text-sm text-muted-foreground mt-1 space-y-1">
                            <span className="flex items-center gap-1.5">
                              <Clock className="w-4 h-4" />
                              <span>
                                {(shift.startTime ? new Date(shift.startTime).toLocaleTimeString([], { hour: '2-digit', minute: '2-digit' }) : '—')} - {(shift.endTime ? new Date(shift.endTime).toLocaleTimeString([], { hour: '2-digit', minute: '2-digit' }) : '—')}
                              </span>
                            </span>
                            {(shift.department || shift.ward) && (
                              <div className="flex items-center gap-3 text-xs">
                                {shift.department && (
                                  <span className="flex items-center gap-1">
                                    <div className="w-1.5 h-1.5 bg-blue-500 rounded-full"></div>
                                    {shift.department.name}
                                  </span>
                                )}
                                {shift.ward && (
                                  <span className="flex items-center gap-1">
                                    <div className="w-1.5 h-1.5 bg-green-500 rounded-full"></div>
                                    {shift.ward.name} ({shift.ward.wardNumber})
                                  </span>
                                )}
                              </div>
                            )}
                          </div>
                        </div>
                      </div>
                      
                      <div className="flex items-center gap-4">
                        {/* Desktop badge */}
                        <Badge
                          variant={getStatusBadgeVariant(shift.status)}
                          className={`inline-flex items-center flex-shrink-0
                            ${
                              shift.status === 'on-shift' ? 'bg-primary-100 text-primary-700 dark:bg-primary-900/30 dark:text-primary-300' : ''
                            }
                            ${shift.status === 'on-call' ? 'bg-accent-100 text-accent-700 dark:bg-accent-900/30 dark:text-accent-300' : ''}
                            ${shift.status === 'upcoming' ? 'border-muted-foreground/30' : ''}
                          `}
                        >
                          {shift.status === 'on-shift' && <div className="w-2 h-2 bg-primary-600 dark:bg-primary-400 rounded-full mr-1.5" />}
                          {shift.status === 'on-call' && <div className="w-2 h-2 bg-accent-600 dark:bg-accent-400 rounded-full mr-1.5" />}
                          {shift.status === 'upcoming' && <div className="w-2 h-2 bg-muted-400 rounded-full mr-1.5" />}
                          <span className="capitalize">{typeof shift.status === 'string' ? shift.status.replace('-', ' ') : 'unknown'}</span>
                        </Badge>

                        {/* Mobile icon */}
                        
                        <DropdownMenu>
                          <DropdownMenuTrigger asChild>
                            <Button variant="ghost" size="icon" className="h-8 w-8 flex-shrink-0">
                              <MoreVertical className="h-4 w-4 text-muted-foreground group-hover:text-foreground transition-colors" />
                            </Button>
                          </DropdownMenuTrigger>
                          <DropdownMenuContent align="end">
                            <DropdownMenuItem onClick={() => setSelectedShift(shift)}>
                              <StickyNote className="mr-2 h-4 w-4" />
                              View Notes
                            </DropdownMenuItem>

                            {/* Shift Action Buttons */}
                            {canClockIn(shift) && (
                              <DropdownMenuItem
                                onClick={() => handleShiftAction(shift._id, 'clock_in')}
                                className="text-green-600 hover:text-green-700"
                              >
                                <Play className="mr-2 h-4 w-4" />
                                Clock In
                              </DropdownMenuItem>
                            )}

                            {canClockOut(shift) && (
                              <DropdownMenuItem
                                onClick={() => handleShiftAction(shift._id, 'clock_out')}
                                className="text-red-600 hover:text-red-700"
                              >
                                <Square className="mr-2 h-4 w-4" />
                                Clock Out
                              </DropdownMenuItem>
                            )}

                            {canGoOnCall(shift) && (
                              <DropdownMenuItem
                                onClick={() => handleShiftAction(shift._id, 'go_on_call')}
                                className="text-blue-600 hover:text-blue-700"
                              >
                                <UserCheck className="mr-2 h-4 w-4" />
                                Go On Call
                              </DropdownMenuItem>
                            )}

                            {canGoOffCall(shift) && (
                              <DropdownMenuItem
                                onClick={() => handleShiftAction(shift._id, 'go_off_call')}
                                className="text-blue-600 hover:text-blue-700"
                              >
                                <UserCheck className="mr-2 h-4 w-4" />
                                Go Off Call
                              </DropdownMenuItem>
                            )}
                          </DropdownMenuContent>
                        </DropdownMenu>
                      </div>
                    </div>
                  </div>
                ))}
              </div>
            ) : (
              <div className="text-center py-12">
                <div className="p-4 bg-muted/50 rounded-full w-16 h-16 mx-auto mb-4 flex items-center justify-center">
                  <CalendarIcon className="w-8 h-8 text-muted-foreground" />
                </div>
                <h3 className="text-lg font-medium text-foreground mb-2">No shifts scheduled</h3>
                <p className="text-muted-foreground mb-6">No shifts are scheduled for this day.</p>
                <AddShiftModal onShiftAdded={fetchShifts}>
                  <Button className='cursor-pointer' variant="outline" size="sm">
                    <Plus className="w-4 h-4 mr-2" />
                    Schedule Shift
                  </Button>
                </AddShiftModal>
              </div>
            )}
          </div>
        </div>

        {/* On-Call Team Panel */}
        <div className="hidden xl:block w-1/4 bg-card/80 dark:bg-gray-900/70 border-border/50 dark:border-gray-700/50 border-l overflow-y-auto">
          <div className="p-6">
            <Card className="border-0 shadow-none bg-transparent">
              <CardHeader className="px-0 pb-4">
                <CardTitle className="text-lg font-semibold text-foreground flex items-center gap-2">
                  <Shield className="w-5 h-5 text-primary-600 dark:text-primary-400" />
                  On-Call Team
                </CardTitle>
              </CardHeader>
              <CardContent className="px-0">
                <div className="space-y-3">
                  {onCallShifts.length > 0 ? onCallShifts.map((shift) => (
                    <div key={shift._id} className="bg-card border border-border rounded-lg p-3 hover:shadow-sm transition-shadow">
                      <div className="flex items-center gap-3">
                        <Avatar className="h-8 w-8">
                          <AvatarImage src={shift.user?.image || ""} alt={shift.user?.fullName || ''} />
                          <AvatarFallback className="bg-accent-100 dark:bg-accent-900/30 text-accent-600 dark:text-accent-400 text-xs">
                            {shift.initials}
                          </AvatarFallback>
                        </Avatar>
                        <div className="flex-1 min-w-0">
                          <p className="text-sm font-medium text-foreground truncate">{shift.user.fullName}</p>
                          <p className="text-xs text-muted-foreground truncate">{shift.role}</p>
                        </div>
                        <Badge 
                          variant="secondary"
                          className="bg-accent-100 text-accent-700 dark:bg-accent-900/30 dark:text-accent-300 text-xs"
                        >
                          On-Call
                        </Badge>
                      </div>
                    </div>
                  )) : (
                    <div className="text-center py-6">
                      <p className="text-sm text-muted-foreground">No on-call staff for this day</p>
                    </div>
                  )}
                </div>
              </CardContent>
            </Card>
          </div>
        </div>
      </div>
      {selectedShift && <NotesModal shift={selectedShift} onClose={() => setSelectedShift(null)} />}
    </div>
  );
};

export default ShiftView;