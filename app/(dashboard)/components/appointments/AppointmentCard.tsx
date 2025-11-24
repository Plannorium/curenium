import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { Badge } from "@/components/ui/badge";
import { PopulatedAppointment } from "@/types/appointment";
import { CheckCircle, XCircle, Calendar as CalendarIcon } from "lucide-react";
import { useDateFormatter } from "@/lib/date-utils";

interface AppointmentCardProps {
  appointment: PopulatedAppointment;
}

const AppointmentCard = ({ appointment }: AppointmentCardProps) => {
  const { formatDateTime } = useDateFormatter();

  const getStatusIcon = () => {
    switch (appointment.status) {
      case "scheduled":
        return <CalendarIcon className="h-4 w-4 text-blue-500" />;
      case "completed":
        return <CheckCircle className="h-4 w-4 text-green-500" />;
      case "cancelled":
        return <XCircle className="h-4 w-4 text-red-500" />;
      default:
        return null;
    }
  };

  return (
    <Card key={appointment._id} className="transition-all duration-300 hover:shadow-lg dark:hover:shadow-white/10">
      <CardHeader className="flex flex-row items-center justify-between pb-2">
        <CardTitle className="text-sm md:text-base font-medium">
          {appointment.patientId.firstName} {appointment.patientId.lastName}
        </CardTitle>
        <Badge
          variant={
            appointment.status === "scheduled"
              ? "default"
              : appointment.status === "completed"
              ? "secondary"
              : "destructive"
          }
          className="text-xs"
        >
          {appointment.status}
        </Badge>
      </CardHeader>
      <CardContent>
        <div className="text-xs md:text-sm text-muted-foreground">
          <p className="text-sm font-medium leading-none mt-2">{appointment.type}</p>
          MRN: {appointment.patientId.mrn}
        </div>
        <div className="flex items-center pt-2">
          {getStatusIcon()}
          <span className="text-xs md:text-sm text-muted-foreground ml-2">
            {formatDateTime(appointment.date)}
          </span>
        </div>
        <p className="text-sm md:text-base font-medium leading-none mt-2">{appointment.reason}</p>
      </CardContent>
    </Card>
  );
};

export default AppointmentCard;