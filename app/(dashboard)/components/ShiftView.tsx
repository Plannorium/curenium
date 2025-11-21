'use client';
import React, { useState, useEffect, useMemo } from 'react';
import { DayPicker } from 'react-day-picker';
import 'react-day-picker/dist/style.css';
import { Avatar, AvatarFallback, AvatarImage } from "@/components/ui/avatar";
import { Button } from '@/components/ui/button';
import { ChevronLeft, ChevronRight, Plus, MoreVertical, Calendar as CalendarIcon, Stethoscope, UserCheck, Clock, Shield, Heart, StickyNote } from 'lucide-react';
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
  _malformed?: boolean;
}

interface ShiftViewProps {
  limit?: number;
}

const ShiftView = ({ limit }: ShiftViewProps) => {
  const [selectedDate, setSelectedDate] = useState<Date | undefined>(new Date());
  const [displayMonth, setDisplayMonth] = useState<Date>(selectedDate || new Date());
  const [shifts, setShifts] = useState<Shift[]>([]);
  const [selectedShift, setSelectedShift] = useState<Shift | null>(null);

  const fetchShifts = async () => {
    try {
      const res = await fetch('/api/shifts');
      if (res.ok) {
        const data = await res.json();
        const arr = Array.isArray(data) ? data : [];

        // Normalize and validate shifts
        const normalized: Shift[] = arr.map((s) => {
          const out: Partial<Shift> = { ...s };
          // Parse times and convert to ISO if possible
          const start = s.startTime ? new Date(s.startTime) : null;
          const end = s.endTime ? new Date(s.endTime) : null;
          out.startTime = start && !isNaN(start.getTime()) ? start.toISOString() : null;
          out.endTime = end && !isNaN(end.getTime()) ? end.toISOString() : null;

          // Ensure user object
          out.user = s.user || { _id: '', fullName: 'Unknown' };
          // Ensure role
          out.role = s.role || 'Staff';
          // Ensure status
          out.status = s.status || 'upcoming';
          // initials fallback
          out.initials = s.initials || (out.user && out.user.fullName ? out.user.fullName.split(' ').map((n: string) => n[0]).slice(0,2).join('') : '');

          // flag malformed if required fields missing or times invalid
          const validTimes = !!out.startTime && !!out.endTime;
          const hasUser = !!out.user && !!out.user.fullName;
          const hasRole = !!out.role;
          out._malformed = !(validTimes && hasUser && hasRole);
          return out as Shift; // Cast to Shift after ensuring all required properties
        });

        const malformed = normalized.filter((s) => s._malformed);
        if (malformed.length > 0) {
          console.warn('Malformed shift records detected:', malformed);
        }

        setShifts(normalized);
      }
    } catch (error) { console.error("Failed to fetch shifts:", error); }
  };

  useEffect(() => {
    fetchShifts();
  }, []);

  useEffect(() => {
    if (selectedDate) {
      setDisplayMonth(selectedDate);
    }
  }, [selectedDate]);

  const filteredShifts = useMemo(() => {
    return shifts?.filter(shift => {
      // include shifts that span the selected date
      if (!shift.startTime || !shift.endTime) return false;
      const start = new Date(shift.startTime);
      const end = new Date(shift.endTime);
      if (isNaN(start.getTime()) || isNaN(end.getTime())) return false;

      const targetDate = selectedDate ? new Date(selectedDate) : new Date();
      const dayStart = new Date(targetDate);
      dayStart.setHours(0, 0, 0, 0);
      const dayEnd = new Date(targetDate);
      dayEnd.setHours(23, 59, 59, 999);

      return (start <= dayEnd && end >= dayStart);
    });
  }, [shifts, selectedDate]);

  const onCallShifts = useMemo(() => {
    return shifts?.filter(shift => shift.status === 'on-call');
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
        <div className="w-full md:w-1/3 lg:w-2/5 bg-card/80 dark:bg-gray-900/70 border-border/50 dark:border-gray-700/50 border-b md:border-b-0 md:border-r p-0 overflow-y-auto pt-2.5 flex justify-center">
          <div className="shift-calendar">
            <DayPicker
              mode="single"
              selected={selectedDate}
              onSelect={setSelectedDate}
              month={displayMonth}
              onMonthChange={setDisplayMonth}
              className="w-full"
              showOutsideDays
              classNames={{
                months: "flex md:space-y-2 space-x-1.5",
                month: "space-y-2",
                caption: "flex justify-center pt-1 relative items-center",
                caption_label: "text-xs font-medium text-foreground",
                nav: "hidden",
                nav_button: "h-4 w-4 bg-transparent p-0 opacity-50 hover:opacity-100 hover:bg-primary-50 dark:hover:bg-primary-900/50 rounded-md transition-colors",
                nav_button_previous: "absolute left-1",
                nav_button_next: "absolute right-1",
                table: "w-full border-collapse space-y-1",
                head_row: "flex",
                head_cell: "text-muted-foreground rounded-md w-full font-normal text-[0.6rem] justify-center",
                row: "flex w-full mt-1",
                cell: "relative p-0 text-center text-[0.7rem] focus-within:relative focus-within:z-20 [&:has([aria-selected])]:bg-primary-50 dark:[&:has([aria-selected])]:bg-primary-900/50 [&:has([aria-selected].day-outside)]:bg-accent/50 [&:has([aria-selected].day-range-end)]:rounded-r-md",
                day: "h-2 w-2 p-0 font-normal aria-selected:opacity-100 hover:bg-primary-50 dark:hover:bg-primary-900/50 rounded-md transition-colors",
                day_range_end: "day-range-end",
                day_selected: "bg-primary-600 text-primary-foreground hover:bg-primary-600 hover:text-primary-foreground focus:bg-primary-600 focus:text-primary-foreground",
                day_today: "bg-accent text-accent-foreground font-semibold",
                day_outside: "day-outside text-muted-foreground opacity-50 aria-selected:bg-accent/50 aria-selected:text-muted-foreground aria-selected:opacity-30",
                day_disabled: "text-muted-foreground opacity-50",
                day_range_middle: "aria-selected:bg-accent aria-selected:text-accent-foreground",
                day_hidden: "invisible",
              }}
            />
            <div className="w-full flex items-center justify-center gap-2 mt-2">
                <Button
                    variant="outline"
                    size="sm"
                    onClick={() => setDisplayMonth(new Date(displayMonth.getFullYear(), displayMonth.getMonth() - 1))}
                    className="w-fit h-7 px-2"
                >
                    <ChevronLeft className="h-3 w-3" />
                </Button>
                <Button
                    variant="outline"
                    size="sm"
                    onClick={() => setDisplayMonth(new Date(displayMonth.getFullYear(), displayMonth.getMonth() + 1))}
                    className="w-fit h-7 px-2"
                >
                    <ChevronRight className="h-3 w-3" />
                </Button>
            </div>
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
                          </div>
                          <div className="text-sm text-muted-foreground mt-1">
                            <span className="flex items-center gap-1.5">
                              <Clock className="w-4 h-4" />
                              <span>
                                {(shift.startTime ? new Date(shift.startTime).toLocaleTimeString([], { hour: '2-digit', minute: '2-digit' }) : '—')} - {(shift.endTime ? new Date(shift.endTime).toLocaleTimeString([], { hour: '2-digit', minute: '2-digit' }) : '—')}
                              </span>
                            </span>
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