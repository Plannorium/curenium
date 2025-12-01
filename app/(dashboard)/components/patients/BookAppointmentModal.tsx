'use client';
import React, { useState, useEffect } from 'react';
import { Button } from '@/components/ui/button';
import {
  Dialog,
  DialogContent,
  DialogDescription,
  DialogHeader,
  DialogTitle,
  DialogTrigger,
} from '@/components/ui/dialog';
import HijriCalendar from '@/components/ui/hijri-calendar';
import { CalendarPlus } from 'lucide-react';
import { toast } from 'sonner';
import { useSession } from 'next-auth/react';
import { Patient } from '@/types/patient';
import { Input } from '@/components/ui/input';
import { Label } from '@/components/ui/label';
import type { IUser as User } from '@/models/User';
import { useCalendar } from '@/components/ui/calendar-context';
import {
  Select,
  SelectContent,
  SelectItem,
  SelectTrigger,
  SelectValue,
} from '@/components/ui/select';


import {
  Popover,
  PopoverContent,
  PopoverTrigger,
} from "@/components/ui/popover";
import {
  Command,
  CommandEmpty,
  CommandGroup,
  CommandInput,
  CommandItem,
  CommandList,
} from "@/components/ui/command";
import { ChevronsUpDown, User as UserIcon } from "lucide-react";
import { useDebounce } from "use-debounce";
import { Appointment } from '@/types/appointment';
import { useLanguage } from '@/contexts/LanguageContext';
import { dashboardTranslations } from '@/lib/dashboard-translations';


interface BookAppointmentModalProps {
  patientId?: string;
  onAppointmentBooked: () => void;
  children: React.ReactNode;
}

const BookAppointmentModal: React.FC<BookAppointmentModalProps> = ({ patientId, onAppointmentBooked, children }) => {
  const { data: session } = useSession();
  const { calendarType, setCalendarType } = useCalendar();
  const { language } = useLanguage();
  const t = (key: string) => {
    const keys = key.split('.');
    let value: any = dashboardTranslations[language as keyof typeof dashboardTranslations];
    for (const k of keys) {
      value = value?.[k];
    }
    return value || key;
  };

  const [isOpen, setIsOpen] = useState(false);
  const [isSubmitting, setIsSubmitting] = useState(false);
  const [reason, setReason] = useState('');
  const [appointmentType, setAppointmentType] = useState('Consultation');
  const [customReason, setCustomReason] = useState('');
  const [date, setDate] = useState<Date | undefined>();
  const [time, setTime] = useState('');
  const [searchTerm, setSearchTerm] = useState('');
  const [patients, setPatients] = useState<Patient[]>([]);
  const [selectedPatient, setSelectedPatient] = useState<Patient | null>(null);
  const [personnel, setPersonnel] = useState<User[]>([]);
  const [selectedPersonnel, setSelectedPersonnel] = useState<User | null>(null);
  const [personnelType, setPersonnelType] = useState('doctor');
  const [open, setOpen] = React.useState(false)
  const [debouncedSearchTerm] = useDebounce(searchTerm, 300);
  const [bookedAppointments, setBookedAppointments] = useState<Appointment[]>([]);
  const [availableTimes, setAvailableTimes] = useState<string[]>([]);

  const appointmentTypes = {
    [t('appointments.generalConsultation')]: 'doctor',
    [t('appointments.followup')]: 'doctor',
    [t('appointments.specialistConsultation')]: 'doctor',
    [t('appointments.therapySession')]: 'therapist',
    [t('appointments.routineTest')]: 'lab_technician',
    [t('appointments.emergency')]: '',
    [t('appointments.other')]: ''
  };

  const personnelTypes = {
    'doctor': t('appointments.doctor'),
    'nurse': t('appointments.nurse'),
    'therapist': t('appointments.therapist'),
    'lab_technician': t('appointments.labTechnician'),
    'admin': t('appointments.admin')
  }

  useEffect(() => {
    const fetchPersonnel = async () => {
      const role = personnelType;
      if (role) {
        const res = await fetch(`/api/users?role=${role}`);
        const data = await res.json();
        setPersonnel(data as User[]);
      } else {
        setPersonnel([]);
      }
    };
    if (isOpen) {
      fetchPersonnel();
    }
  }, [isOpen, personnelType]);

  useEffect(() => {
    const fetchBookedAppointments = async () => {
      if (selectedPersonnel) {
        const res = await fetch(`/api/appointments?personnelId=${selectedPersonnel._id}`);
        const data = await res.json();
        setBookedAppointments(data as Appointment[]);
      }
    };
    fetchBookedAppointments();
  }, [selectedPersonnel]);

  const generateTimeSlots = (date: Date, appointments: Appointment[]) => {
    const slots: string[] = [];
    const dayStart = new Date(date);
    dayStart.setHours(9, 0, 0, 0);
    const dayEnd = new Date(date);
    dayEnd.setHours(17, 0, 0, 0);

    const bookedTimes = appointments
      .filter(a => new Date(a.date).toDateString() === date.toDateString())
      .map(a => {
        const d = new Date(a.date);
        return `${String(d.getHours()).padStart(2, '0')}:${String(d.getMinutes()).padStart(2, '0')}`;
      });

    const current = dayStart;
    while (current < dayEnd) {
      const timeString = `${String(current.getHours()).padStart(2, '0')}:${String(current.getMinutes()).padStart(2, '0')}`;
      if (!bookedTimes.includes(timeString)) {
        slots.push(timeString);
      }
      current.setMinutes(current.getMinutes() + 30);
    }
    return slots;
  };

  useEffect(() => {
    if (date && selectedPersonnel) {
      setAvailableTimes(generateTimeSlots(date, bookedAppointments));
    }
  }, [date, bookedAppointments, selectedPersonnel]);

  const handleSearch = async () => {
    if (debouncedSearchTerm.length < 2) return;
    const res = await fetch(`/api/patients?search=${debouncedSearchTerm}`);
    const data = await res.json();
    setPatients(data as Patient[]);
  };

  useEffect(() => {
    if (debouncedSearchTerm) {
      handleSearch();
    } else {
      setPatients([]);
    }
  }, [debouncedSearchTerm]);

  const handleAppointmentSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    setIsSubmitting(true);
    const finalPatientId = patientId || selectedPatient?._id;

    if (!finalPatientId) {
      toast.error(t('appointments.selectPatientError'));
      setIsSubmitting(false);
      return;
    }
    if (!date) {
      toast.error(t('appointments.selectDateError'));
      setIsSubmitting(false);
      return;
    }
    if (!time) {
      toast.error(t('appointments.selectTimeError'));
      setIsSubmitting(false);
      return;
    }
    if (!selectedPersonnel) {
      toast.error(t('appointments.selectPersonnelError'));
      setIsSubmitting(false);
      return;
    }

    try {
      const [hours, minutes] = time.split(':').map(Number);
      const combinedDateTime = new Date(date);
      combinedDateTime.setHours(hours, minutes);

      const res = await fetch(`/api/patients/${finalPatientId}/appointments`, {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({
          reason: appointmentType === 'Other' ? customReason : reason,
          type: appointmentType,
          date: combinedDateTime.toISOString(),
          personnelId: selectedPersonnel._id,
        }),
      });

      if (res.ok) {
        onAppointmentBooked();
        setIsOpen(false);
        toast.success(t('appointments.bookingSuccess'));
      } else {
        toast.error(t('appointments.bookingFailed'));
      }
    } catch (error) {
      console.error('Failed:', error);
      toast.error(t('appointments.serverError'));
    } finally {
      setIsSubmitting(false);
    }
  };

  if (session?.user?.role !== 'admin' && session?.user?.role !== 'receptionist') {
    return null;
  }

  return (
    <Dialog open={isOpen} onOpenChange={setIsOpen}>
      <DialogTrigger asChild>{children}</DialogTrigger>

      <DialogContent className="sm:max-w-2xl max-h-[90vh] overflow-y-auto bg-white/90 dark:bg-gray-950/90 backdrop-blur-lg border border-gray-200/50 dark:border-gray-900/50 shadow-2xl outline-none">
        <DialogHeader className="pb-4">
          <div className="flex items-center space-x-3 mb-2">
            <div className="p-2 bg-linear-to-br from-blue-500 to-blue-600 rounded-lg shadow-lg">
              <CalendarPlus className="h-5 w-5 text-white" />
            </div>
            <DialogTitle className="text-xl font-bold bg-linear-to-r from-gray-900 via-gray-800 to-gray-900 dark:from-white dark:via-gray-100 dark:to-white bg-clip-text text-transparent">
              {t('appointments.bookNewAppointment')}
            </DialogTitle>
          </div>
          <DialogDescription className="text-muted-foreground">
            {t('appointments.scheduleAppointment')}
          </DialogDescription>
        </DialogHeader>

        <div className="p-6 space-y-6">
          <form onSubmit={handleAppointmentSubmit} className="space-y-6">
            {!patientId && (
              <div className="space-y-3">
                <Label htmlFor="patient-search" className="text-sm font-semibold text-gray-800 dark:text-gray-200 flex items-center">
                  <UserIcon className="h-4 w-4 mr-2 text-blue-500" />
                  {t('appointments.findPatient')}
                </Label>
                <Popover open={open} onOpenChange={setOpen}>
                  <PopoverTrigger asChild>
                    <Button
                      variant="outline"
                      role="combobox"
                      aria-expanded={open}
                      className="w-full justify-between bg-gray-50/80 dark:bg-gray-900/80 border-gray-200/70 dark:border-gray-700/60 focus:border-blue-400 dark:focus:border-blue-500 rounded-xl h-11 hover:bg-gray-100/50 dark:hover:bg-gray-800/50 transition-all duration-200"
                    >
                      {selectedPatient
                        ? `${selectedPatient.firstName} ${selectedPatient.lastName}`
                        : t('appointments.selectPatient')}
                      <ChevronsUpDown className="ml-2 h-4 w-4 shrink-0 opacity-50" />
                    </Button>
                  </PopoverTrigger>
                  <PopoverContent className="w-[--radix-popover-trigger-width] p-0 bg-white/90 dark:bg-gray-900/90 backdrop-blur-lg border border-gray-200/50 dark:border-gray-700/50 rounded-xl shadow-xl">
                    <Command>
                      <CommandInput
                        placeholder={t('appointments.searchPatients')}
                        value={searchTerm}
                        onValueChange={setSearchTerm}
                        className="border-b border-gray-200/50 dark:border-gray-700/50"
                      />
                      <CommandList>
                        <CommandEmpty className="py-6 text-center text-sm text-muted-foreground">{t('appointments.noPatientFound')}</CommandEmpty>
                        <CommandGroup>
                          {patients.map((p) => (
                            <CommandItem
                              key={p._id}
                              value={`${p.firstName} ${p.lastName} ${p.mrn}`}
                              onSelect={(currentValue) => {
                                const patient = patients.find(p => `${p.firstName} ${p.lastName} ${p.mrn}`.toLowerCase() === currentValue.toLowerCase());
                                if (patient) {
                                  setSelectedPatient(patient);
                                }
                                setOpen(false);
                              }}
                              className="hover:bg-blue-50 dark:hover:bg-blue-950/30 rounded-lg mx-1"
                            >
                              {p.firstName} {p.lastName} (MRN: {p.mrn})
                            </CommandItem>
                          ))}
                        </CommandGroup>
                      </CommandList>
                    </Command>
                  </PopoverContent>
                </Popover>
              </div>
            )}

            <div className="space-y-3">
              <Label htmlFor="appointment-type" className="text-sm font-semibold text-gray-800 dark:text-gray-200 flex items-center">
                <div className="w-4 h-4 mr-2 bg-linear-to-br from-blue-400 to-blue-600 rounded"></div>
                {t('appointments.appointmentType')}
              </Label>
              <Select onValueChange={setAppointmentType} defaultValue="Consultation">
                <SelectTrigger id="appointment-type" className="bg-gray-50/80 dark:bg-gray-900/80 border-gray-200/70 dark:border-gray-700/60 focus:border-blue-400 dark:focus:border-blue-500 rounded-xl h-11">
                  <SelectValue placeholder={t('appointments.selectType')} />
                </SelectTrigger>
                <SelectContent className="bg-white/90 dark:bg-gray-900/90 backdrop-blur-lg border border-gray-200/50 dark:border-gray-700/50 rounded-xl">
                  {Object.keys(appointmentTypes).map((type) => (
                    <SelectItem key={type} value={type} className="hover:bg-blue-50 dark:hover:bg-blue-950/30 rounded-lg mx-1">
                      {type}
                    </SelectItem>
                  ))}
                </SelectContent>
              </Select>
            </div>

            <div className="space-y-3">
              <Label htmlFor="purpose-of-visit" className="text-sm font-semibold text-gray-800 dark:text-gray-200 flex items-center">
                <div className="w-4 h-4 mr-2 bg-linear-to-br from-green-400 to-green-600 rounded"></div>
                {t('appointments.purposeOfVisit')}
              </Label>
              <Input
                id="purpose-of-visit"
                type="text"
                value={appointmentType === 'Other' ? customReason : reason}
                onChange={(e) => {
                  if (appointmentType === 'Other') {
                    setCustomReason(e.target.value);
                  } else {
                    setReason(e.target.value);
                  }
                }}
                placeholder={appointmentType === 'Other' ? t('appointments.specifyReason') : t('appointments.purposeOfVisit')}
                required
                className="bg-gray-50/80 dark:bg-gray-900/80 border-gray-200/70 dark:border-gray-700/60 focus:border-green-400 dark:focus:border-green-500 rounded-xl h-11"
              />
            </div>

            <div className="grid grid-cols-1 gap-4">
              <div className="space-y-2">
                <Label htmlFor="date">{t('appointments.date')}</Label>
                <HijriCalendar
                  selectedDate={date}
                  onDateSelect={setDate}
                  calendarType={calendarType}
                  onCalendarTypeChange={setCalendarType}
                  highlightedDays={[]} // Could add logic to highlight available dates
                />
              </div>

              <div className="space-y-2">
                <Label htmlFor="time">{t('appointments.time')}</Label>
                <Select onValueChange={setTime} value={time} disabled={!date || !selectedPersonnel || availableTimes.length === 0}>
                  <SelectTrigger id="time">
                    <SelectValue placeholder={t('appointments.selectDate')} />
                  </SelectTrigger>
                  <SelectContent>
                    {availableTimes.length > 0 ? (
                      availableTimes.map((slot) => (
                        <SelectItem key={slot} value={slot}>
                          {slot}
                        </SelectItem>
                      ))
                    ) : (
                      <SelectItem value="no-slots" disabled>
                        {date && selectedPersonnel ? t('appointments.noSlots') : t('appointments.selectDateAndPersonnel')}
                      </SelectItem>
                    )}
                  </SelectContent>
                </Select>
              </div>
            </div>

            <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
              <div className="space-y-2">
                <Label htmlFor="personnel-type">{t('appointments.personnelType')}</Label>
                <Select onValueChange={setPersonnelType} defaultValue={personnelType}>
                  <SelectTrigger id="personnel-type">
                    <SelectValue placeholder={t('appointments.selectPersonnelType')} />
                  </SelectTrigger>
                  <SelectContent>
                    {Object.entries(personnelTypes).map(([value, label]) => (
                      <SelectItem key={value} value={value}>{label}</SelectItem>
                    ))}
                  </SelectContent>
                </Select>
              </div>
              <div className="space-y-2">
                <Label htmlFor="personnel">{t('appointments.healthPersonnel')}</Label>
                <Select
                  onValueChange={(value) =>
                    setSelectedPersonnel(
                      personnel.find((p) => p._id.toString() === value) || null
                    )
                  }
                  disabled={!personnel.length}
                >
                  <SelectTrigger id="personnel">
                    <SelectValue placeholder={t('appointments.selectProfessional')} />
                  </SelectTrigger>
                  <SelectContent>
                    {personnel.map((p) => (
                      <SelectItem key={p._id.toString()} value={p._id.toString()}>
                        {p.fullName}
                      </SelectItem>
                    ))}
                  </SelectContent>
                </Select>
              </div>
            </div>

            <Button
              type="submit"
              disabled={isSubmitting}
              className="w-full bg-linear-to-r from-blue-500 to-blue-600 hover:from-blue-600 hover:to-blue-700 text-white shadow-lg hover:shadow-xl transition-all duration-300 rounded-xl h-11 font-semibold disabled:opacity-50 disabled:cursor-not-allowed"
            >
              {isSubmitting ? (
                <div className="flex items-center justify-center">
                  <div className="w-4 h-4 border-2 border-white/30 border-t-white rounded-full animate-spin mr-2"></div>
                  {t('appointments.booking')}
                </div>
              ) : (
                t('appointments.bookAppointmentBtn')
              )}
            </Button>
          </form>
        </div>
      </DialogContent>
    </Dialog>
  );
};

export default BookAppointmentModal;