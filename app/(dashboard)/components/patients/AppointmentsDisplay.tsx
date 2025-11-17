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

  useEffect(() => {
    fetchAppointments();
  }, [patientId]);

  if (loading) {
    return (
      <Card>
        <CardHeader>
          <CardTitle>Appointments</CardTitle>
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
      <Alert variant="destructive">
        <ServerCrash className="h-4 w-4" />
        <AlertTitle>Error</AlertTitle>
        <AlertDescription>{error}</AlertDescription>
      </Alert>
    );
  }

  return (
    <Card>
      <CardHeader className="flex flex-row items-center justify-between">
        <CardTitle>Appointments</CardTitle>
        {session?.user?.role && ['admin', 'receptionist'].includes(session.user.role) && (
          <BookAppointmentModal patientId={patientId} onAppointmentBooked={fetchAppointments}>
            <Button size="sm">
              <CalendarPlus className="mr-2 h-4 w-4" />
              Book Appointment
            </Button>
          </BookAppointmentModal>
        )}
      </CardHeader>
      <CardContent>
        {appointments.length > 0 ? (
          <Table>
            <TableHeader>
              <TableRow>
                <TableHead>Date</TableHead>
                <TableHead>Reason</TableHead>
                <TableHead>Status</TableHead>
              </TableRow>
            </TableHeader>
            <TableBody>
              {appointments.map((a) => (
                <TableRow key={a._id}>
                  <TableCell>
                    {new Date(a.date).toLocaleString()}
                  </TableCell>
                  <TableCell>{a.reason}</TableCell>
                  <TableCell>
                    <Badge
                      variant={
                        a.status === "scheduled"
                          ? "default"
                          : a.status === "completed"
                          ? "secondary"
                          : "destructive"
                      }
                    >
                      {a.status}
                    </Badge>
                  </TableCell>
                </TableRow>
              ))}
            </TableBody>
          </Table>
        ) : (
          <p>No appointments found for this patient.</p>
        )}
      </CardContent>
    </Card>
  );
};

export default AppointmentsDisplay;