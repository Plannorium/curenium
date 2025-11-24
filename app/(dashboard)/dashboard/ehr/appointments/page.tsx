"use client";
import { useState, useEffect } from "react";
import { Calendar } from "@/components/ui/calendar";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { Button } from "@/components/ui/button";
import { CalendarPlus } from "lucide-react";
import BookAppointmentModal from "@/app/(dashboard)/components/patients/BookAppointmentModal";
import { useSession } from "next-auth/react";
import { PopulatedAppointment } from "@/types/appointment";
import AppointmentCard from "@/app/(dashboard)/components/appointments/AppointmentCard";
import { Loader } from "@/components/ui/Loader";

const AppointmentsPage = () => {
  const { data: session } = useSession();
  const [date, setDate] = useState<Date | undefined>(undefined);
  const [appointments, setAppointments] = useState<PopulatedAppointment[]>([]);
  const [filteredAppointments, setFilteredAppointments] = useState<PopulatedAppointment[]>([]);
  const [loading, setLoading] = useState(true);

  const fetchAppointments = async () => {
    setLoading(true);
    const res = await fetch("/api/appointments");
    const data = await res.json();
    setAppointments(data as PopulatedAppointment[]);
    setLoading(false);
  };

  useEffect(() => {
    fetchAppointments();
  }, []);

  useEffect(() => {
    if (date) {
      const filtered = appointments.filter(a => {
        const appointmentDate = new Date(a.date);
        return appointmentDate.getFullYear() === date.getFullYear() &&
               appointmentDate.getMonth() === date.getMonth() &&
               appointmentDate.getDate() === date.getDate();
      });
      setFilteredAppointments(filtered);
    } else {
      setFilteredAppointments(appointments);
    }
  }, [date, appointments]);

  const daysWithAppointments = appointments.map(a => new Date(a.date));

  return (
    <div className="grid grid-cols-1 lg:grid-cols-6 gap-1.5 lg:gap-3 p-2 lg:p-0 lg:pt-3 lg:pr-7">
      <div className="col-span-1 lg:col-span-2">
        <Card className="border-none shadow-none rounded-none">
          <CardContent className="bg-background border-none shadow-none rounded-none p-0 flex justify-center items-start">
            <Calendar
              mode="single"
              selected={date}
              onSelect={setDate}
              className="premium-calendar rounded-md border"
              modifiers={{
                hasAppointment: daysWithAppointments,
              }}
              modifiersClassNames={{
                hasAppointment: 'rdp-day_hasAppointment',
              }}
            />
          </CardContent>
        </Card>
      </div>
      <div className="col-span-1 lg:col-span-4">
        <Card>
          <CardHeader className="flex flex-row items-center justify-between">
            <CardTitle>
              {date
                ? `Appointments for ${date.toLocaleDateString()}`
                : "All Appointments"}
            </CardTitle>
            {session?.user?.role && ['admin', 'receptionist'].includes(session.user.role) && (
              <BookAppointmentModal onAppointmentBooked={fetchAppointments}>
                <Button className="cursor-pointer dark:text-black" size="sm">
                  <CalendarPlus className="mr-2 h-4 w-4" />
                  Book Appointment
                </Button>
              </BookAppointmentModal>
            )}
          </CardHeader>
          <CardContent>
            {loading ? (
              <Loader />
            ) : (
              <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-4">
                {filteredAppointments.map((a) => (
                  <AppointmentCard key={a._id} appointment={a} />
                ))}
              </div>
            )}
          </CardContent>
        </Card>
      </div>
    </div>
  );
};

export default AppointmentsPage;