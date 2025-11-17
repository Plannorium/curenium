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
import { Skeleton } from "@/components/ui/skeleton";
import { Alert, AlertDescription, AlertTitle } from "@/components/ui/alert";
import { ServerCrash } from "lucide-react";

interface AuditLog {
  _id: string;
  action: string;
  createdAt: string;
  userId: { fullName: string };
}

interface AuditLogDisplayProps {
  patientId: string;
}

const AuditLogDisplay = ({ patientId }: AuditLogDisplayProps) => {
  const [auditLogs, setAuditLogs] = useState<AuditLog[]>([]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState<string | null>(null);

  useEffect(() => {
    async function fetchAuditLogs() {
      try {
        const response = await fetch(`/api/audit-logs?patientId=${patientId}`);
        if (!response.ok) {
          throw new Error("Failed to fetch audit logs");
        }
        const data: AuditLog[] = await response.json();
        setAuditLogs(data);
      } catch (err) {
        setError(err instanceof Error ? err.message : "An unknown error occurred");
      } finally {
        setLoading(false);
      }
    }

    fetchAuditLogs();
  }, [patientId]);

  const formatAction = (action: string) => {
    if (!action) return "";
    const [entity, event] = action.split('.');
    if (!entity || !event) return action;
  
    const formattedEntity = entity.charAt(0).toUpperCase() + entity.slice(1);
    let formattedEvent;
  
    switch (event) {
      case 'create':
        formattedEvent = 'Created';
        break;
      case 'update':
        formattedEvent = 'Updated';
        break;
      case 'delete':
        formattedEvent = 'Deleted';
        break;
      default:
        formattedEvent = event.charAt(0).toUpperCase() + event.slice(1);
    }
  
    return `${formattedEntity} ${formattedEvent}`;
  };

  if (loading) {
    return (
      <Card>
        <CardHeader>
          <CardTitle>Audit Log</CardTitle>
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
      <CardHeader>
        <CardTitle>Audit Log</CardTitle>
      </CardHeader>
      <CardContent>
        {auditLogs.length > 0 ? (
          <Table>
            <TableHeader>
              <TableRow>
                <TableHead>Date</TableHead>
                <TableHead>Action</TableHead>
                <TableHead>User</TableHead>
              </TableRow>
            </TableHeader>
            <TableBody>
              {auditLogs.map((log) => (
                <TableRow key={log._id}>
                  <TableCell>
                    {new Date(log.createdAt).toLocaleString()}
                  </TableCell>
                  <TableCell>{formatAction(log.action)}</TableCell>
                  <TableCell>{log.userId?.fullName || "System"}</TableCell>
                </TableRow>
              ))}
            </TableBody>
          </Table>
        ) : (
          <p>No audit logs found for this patient.</p>
        )}
      </CardContent>
    </Card>
  );
};

export default AuditLogDisplay;