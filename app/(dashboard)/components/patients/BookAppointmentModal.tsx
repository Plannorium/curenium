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
import { Calendar } from '@/components/ui/calendar';
import { CalendarPlus } from 'lucide-react';
import { toast } from 'sonner';
import { useSession } from 'next-auth/react';
import { Patient } from '@/types/patient';
import { Input } from '@/components/ui/input';
import { Label } from '@/components/ui/label';
import { IUser as User } from '@/models/User';
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
import { ChevronsUpDown } from "lucide-react";
import { useDebounce } from "use-debounce";
import { Appointment } from '@/types/appointment';


interface BookAppointmentModalProps {
  patientId?: string;
  onAppointmentBooked: () => void;
  children: React.ReactNode;
}

const BookAppointmentModal: React.FC<BookAppointmentModalProps> = ({ patientId, onAppointmentBooked, children }) => {
  const { data: session } = useSession();
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
    'General Consultation': 'doctor',
    'Follow-up': 'doctor',
    'Specialist Consultation': 'doctor',
    'Therapy Session': 'therapist',
    'Routine Test': 'lab_technician',
    'Emergency': '',
    'Other': ''
  };

  const personnelTypes = {
    'doctor': 'Doctor',
    'nurse': 'Nurse',
    'therapist': 'Therapist',
    'lab_technician': 'Lab Technician',
    'admin': 'Admin'
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
      toast.error("Please select a patient.");
      setIsSubmitting(false);
      return;
    }
    if (!date) {
      toast.error("Please select an appointment date.");
      setIsSubmitting(false);
      return;
    }
    if (!time) {
      toast.error("Please select an appointment time.");
      setIsSubmitting(false);
      return;
    }
    if (!selectedPersonnel) {
      toast.error("Please select a health professional.");
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
        toast.success('Appointment booked successfully!');
      } else {
        toast.error('Failed to book appointment.');
      }
    } catch (error) {
      console.error('Failed:', error);
      toast.error('Unexpected server error.');
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

      <DialogContent className="sm:max-w-lg max-h-[90vh] overflow-y-auto">
        <DialogHeader>
          <DialogTitle className="flex items-center">
            <CalendarPlus className="h-6 w-6 mr-2" />
            Book New Appointment
          </DialogTitle>
          <DialogDescription>
            Fill in the details below to book a new appointment.
          </DialogDescription>
        </DialogHeader>

        <div className="p-4 sm:p-6 space-y-6">
          <form onSubmit={handleAppointmentSubmit} className="space-y-6">
            {!patientId && (
              <div className="space-y-2">
                <Label htmlFor="patient-search">Find Patient</Label>
                <Popover open={open} onOpenChange={setOpen}>
                  <PopoverTrigger asChild>
                    <Button
                      variant="outline"
                      role="combobox"
                      aria-expanded={open}
                      className="w-full justify-between"
                    >
                      {selectedPatient
                        ? `${selectedPatient.firstName} ${selectedPatient.lastName}`
                        : "Select patient..."}
                      <ChevronsUpDown className="ml-2 h-4 w-4 shrink-0 opacity-50" />
                    </Button>
                  </PopoverTrigger>
                  <PopoverContent className="w-[--radix-popover-trigger-width] p-0">
                    <Command>
                      <CommandInput
                        placeholder="Search patient..."
                        value={searchTerm}
                        onValueChange={setSearchTerm}
                      />
                      <CommandList>
                        <CommandEmpty>No patient found.</CommandEmpty>
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

            <div className="space-y-2">
              <Label htmlFor="appointment-type">Appointment Type</Label>
              <Select onValueChange={setAppointmentType} defaultValue="Consultation">
                <SelectTrigger id="appointment-type">
                  <SelectValue placeholder="Select a type" />
                </SelectTrigger>
                <SelectContent>
                  {Object.keys(appointmentTypes).map((type) => (
                    <SelectItem key={type} value={type}>
                      {type}
                    </SelectItem>
                  ))}
                </SelectContent>
              </Select>
            </div>

            <div className="space-y-2">
              <Label htmlFor="purpose-of-visit">Purpose of Visit</Label>
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
                placeholder={appointmentType === 'Other' ? "Please specify the reason" : "Purpose of visit"}
                required
              />
            </div>

            <div className="grid grid-cols-1 gap-4">
              <div className="space-y-2">
                <Label htmlFor="date">Date</Label>
                <Calendar
                  mode="single"
                  selected={date}
                  onSelect={setDate}
                  className="rounded-md border"
                  disabled={(day) => {
                    const today = new Date();
                    today.setHours(0, 0, 0, 0);
                    if (day < today || !selectedPersonnel) {
                      return day < today;
                    }
                    const availableSlots = generateTimeSlots(day, bookedAppointments);
                    return availableSlots.length === 0;
                  }}
                />
              </div>

              <div className="space-y-2">
                <Label htmlFor="time">Time</Label>
                <Select onValueChange={setTime} value={time} disabled={!date || !selectedPersonnel || availableTimes.length === 0}>
                  <SelectTrigger id="time">
                    <SelectValue placeholder="Select an available time" />
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
                        {date && selectedPersonnel ? 'No available slots' : 'Select date and personnel first'}
                      </SelectItem>
                    )}
                  </SelectContent>
                </Select>
              </div>
            </div>

            <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
              <div className="space-y-2">
                <Label htmlFor="personnel-type">Personnel Type</Label>
                <Select onValueChange={setPersonnelType} defaultValue={personnelType}>
                  <SelectTrigger id="personnel-type">
                    <SelectValue placeholder="Select a type" />
                  </SelectTrigger>
                  <SelectContent>
                    {Object.entries(personnelTypes).map(([value, label]) => (
                      <SelectItem key={value} value={value}>{label}</SelectItem>
                    ))}
                  </SelectContent>
                </Select>
              </div>
              <div className="space-y-2">
                <Label htmlFor="personnel">Health Personnel</Label>
                <Select
                  onValueChange={(value) =>
                    setSelectedPersonnel(
                      personnel.find((p) => p._id.toString() === value) || null
                    )
                  }
                  disabled={!personnel.length}
                >
                  <SelectTrigger id="personnel">
                    <SelectValue placeholder="Select a professional" />
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

            <Button type="submit" disabled={isSubmitting} className="w-full">
              {isSubmitting ? 'Booking...' : 'Book Appointment'}
            </Button>
          </form>
        </div>
      </DialogContent>
    </Dialog>
  );
};

export default BookAppointmentModal;