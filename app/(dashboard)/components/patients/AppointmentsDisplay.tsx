"use client";
import { useState, useEffect } from "react";
import {
  Table,
  TableBody,
  TableCell,
  TableHead,
  TableHeader,
  TableRow,
} from "@/components/ui/table";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { Badge } from "@/components/ui/badge";
import { Button } from "@/components/ui/button";
import { Appointment } from "@/types/appointment";
import { Skeleton } from "@/components/ui/skeleton";
import { Alert, AlertDescription, AlertTitle } from "@/components/ui/alert";
import { ServerCrash, CalendarPlus } from "lucide-react";
import BookAppointmentModal from "./BookAppointmentModal";
import { useSession } from "next-auth/react";

interface AppointmentsDisplayProps {
  patientId: string;
}

const AppointmentsDisplay = ({ patientId }: AppointmentsDisplayProps) => {
  const { data: session } = useSession();
  const [appointments, setAppointments] = useState<Appointment[]>([]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState<string | null>(null);

  const fetchAppointments = async () => {
    try {
      const res = await fetch(`/api/patients/${patientId}/appointments`);
      if (!res.ok) {
        throw new Error("Failed to fetch appointments");
      }
      const data = await res.json();
      setAppointments(data as Appointment[]);
    } catch (err: any) {
      setError(err.message);
    } finally {
      setLoading(false);
    }
  };

  const handleConfirmAppointment = async (appointmentId: string) => {
    try {
      const res = await fetch(`/api/patients/${patientId}/appointments`, {
        method: 'PUT',
        headers: {
          'Content-Type': 'application/json',
        },
        body: JSON.stringify({
          appointmentId,
          status: 'confirmed',
        }),
      });
      if (!res.ok) {
        throw new Error("Failed to confirm appointment");
      }
      // Refresh appointments
      fetchAppointments();
    } catch (err: any) {
      setError(err.message);
    }
  };

  useEffect(() => {
    fetchAppointments();
  }, [patientId]);

  if (loading) {
    return (
      <Card className="bg-white/70 dark:bg-gray-950/60 backdrop-blur-lg rounded-2xl border-gray-200/50 dark:border-gray-800/50 shadow-xl">
        <CardHeader>
          <CardTitle className="flex items-center text-xl font-bold bg-gradient-to-r from-primary to-primary/70 bg-clip-text text-transparent">
            <CalendarPlus className="mr-3 h-6 w-6 text-primary" />
            Appointments
          </CardTitle>
        </CardHeader>
        <CardContent>
          <Skeleton className="h-4 w-full mb-2" />
          <Skeleton className="h-4 w-full mb-2" />
          <Skeleton className="h-4 w-3/4" />
        </CardContent>
      </Card>
    );
  }

  if (error) {
    return (
      <Alert variant="destructive" className="bg-red-50/80 dark:bg-red-950/20 border-red-200/50 dark:border-red-800/50 backdrop-blur-lg">
        <ServerCrash className="h-4 w-4" />
        <AlertTitle>Error</AlertTitle>
        <AlertDescription>{error}</AlertDescription>
      </Alert>
    );
  }

  return (
    <Card className="bg-white/70 dark:bg-gray-950/60 backdrop-blur-lg rounded-2xl border-gray-200/50 dark:border-gray-800/50 shadow-xl">
      <CardHeader className="flex flex-col sm:flex-row items-start sm:items-center justify-between space-y-4 sm:space-y-0 pb-4 sm:pb-6">
        <CardTitle className="flex items-center text-xl sm:text-2xl font-bold bg-gradient-to-r from-primary to-primary/70 bg-clip-text text-transparent">
          <CalendarPlus className="mr-2 sm:mr-3 h-5 w-5 sm:h-6 sm:w-6 text-primary" />
          <span className="text-lg sm:text-2xl">Appointments</span>
        </CardTitle>
        {session?.user?.role && ['admin', 'receptionist'].includes(session.user.role) && (
          <BookAppointmentModal patientId={patientId} onAppointmentBooked={fetchAppointments}>
            <Button
              size="sm"
              className="w-full sm:w-auto bg-gradient-to-r from-primary to-primary/80 hover:from-primary/90 hover:to-primary/70 text-white shadow-lg hover:shadow-xl transition-all duration-300 hover:scale-105"
            >
              <CalendarPlus className="mr-2 h-3 w-3 sm:h-4 sm:w-4" />
              <span className="text-sm sm:text-base">Book Appointment</span>
            </Button>
          </BookAppointmentModal>
        )}
      </CardHeader>
      <CardContent>
        {appointments.length > 0 ? (
          <div className="rounded-xl border border-gray-200/50 dark:border-gray-800/50 overflow-hidden bg-white/50 dark:bg-gray-900/30">
            <Table>
              <TableHeader>
                <TableRow className="bg-gradient-to-r from-gray-50 to-gray-100 dark:from-gray-800 dark:to-gray-900 border-b border-gray-200 dark:border-gray-700">
                  <TableHead className="font-semibold text-gray-900 dark:text-gray-100">Date</TableHead>
                  <TableHead className="font-semibold text-gray-900 dark:text-gray-100">Reason</TableHead>
                  <TableHead className="font-semibold text-gray-900 dark:text-gray-100">Status</TableHead>
                </TableRow>
              </TableHeader>
              <TableBody>
                {appointments.map((a, index) => (
                  <TableRow
                    key={a._id}
                    className={`hover:bg-gray-50/50 dark:hover:bg-gray-800/30 transition-colors duration-200 ${
                      index % 2 === 0 ? 'bg-white/30 dark:bg-gray-900/10' : 'bg-gray-50/30 dark:bg-gray-800/20'
                    }`}
                  >
                    <TableCell className="font-medium text-gray-900 dark:text-gray-100">
                      {new Date(a.date).toLocaleString()}
                    </TableCell>
                    <TableCell className="text-gray-700 dark:text-gray-300">{a.reason}</TableCell>
                    <TableCell>
                      <div className="flex items-center space-x-2">
                        <Badge
                          variant={
                            a.status === "scheduled"
                              ? "default"
                              : a.status === "confirmed"
                              ? "secondary"
                              : a.status === "completed"
                              ? "secondary"
                              : "destructive"
                          }
                          className="font-medium"
                        >
                          {a.status}
                        </Badge>
                        {a.status === "scheduled" && session?.user?.role && ['doctor', 'admin', 'staff'].includes(session.user.role) && (
                          <Button
                            size="sm"
                            variant="outline"
                            onClick={() => handleConfirmAppointment(a._id)}
                            className="text-xs"
                          >
                            Confirm
                          </Button>
                        )}
                      </div>
                    </TableCell>
                  </TableRow>
                ))}
              </TableBody>
            </Table>
          </div>
        ) : (
          <div className="text-center py-8 sm:py-12 bg-gradient-to-br from-gray-50 to-gray-100 dark:from-gray-800 dark:to-gray-900 rounded-xl border-2 border-dashed border-gray-300 dark:border-gray-600">
            <CalendarPlus className="mx-auto h-8 w-8 sm:h-12 sm:w-12 text-gray-400 dark:text-gray-500 mb-3 sm:mb-4" />
            <h3 className="text-base sm:text-lg font-semibold text-gray-900 dark:text-gray-100 mb-2">
              No Appointments Yet
            </h3>
            <p className="text-gray-500 dark:text-gray-400 mb-4 sm:mb-6 max-w-md mx-auto text-sm sm:text-base px-4">
              Schedule appointments to track patient visits and follow-ups.
            </p>
            {session?.user?.role && ['admin', 'receptionist'].includes(session.user.role) && (
              <BookAppointmentModal patientId={patientId} onAppointmentBooked={fetchAppointments}>
                <Button
                  size="sm"
                  className="bg-gradient-to-r from-primary to-primary/80 hover:from-primary/90 hover:to-primary/70 text-white shadow-lg hover:shadow-xl transition-all duration-300"
                >
                  <CalendarPlus className="mr-2 h-3 w-3 sm:h-4 sm:w-4" />
                  <span className="text-sm sm:text-base">Schedule First Appointment</span>
                </Button>
              </BookAppointmentModal>
            )}
          </div>
        )}
      </CardContent>
    </Card>
  );
};

export default AppointmentsDisplay;