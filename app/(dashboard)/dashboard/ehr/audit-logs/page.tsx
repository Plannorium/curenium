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
  targetType: string;
  targetId: string;
}

const formatAction = (action: string) => {
  const [target, event] = action.split('.');
  if (!target || !event) return action;

  const formattedTarget = target.charAt(0).toUpperCase() + target.slice(1);
  
  let formattedEvent = event;
  if (!event.endsWith('ed')) {
      if (event.endsWith('e')) {
          formattedEvent += 'd';
      } else {
          formattedEvent += 'ed';
      }
  }

  return `${formattedTarget} ${formattedEvent.charAt(0).toUpperCase() + formattedEvent.slice(1)}`;
};

const AuditLogPage = () => {
  const [auditLogs, setAuditLogs] = useState<AuditLog[]>([]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState<string | null>(null);

  useEffect(() => {
    const fetchAuditLogs = async () => {
      try {
        const res = await fetch(`/api/audit-logs`);
        if (!res.ok) {
          throw new Error("Failed to fetch audit logs");
        }
        const data: AuditLog[] = await res.json();
        setAuditLogs(data);
      } catch (err: any) {
        setError(err.message);
      } finally {
        setLoading(false);
      }
    };

    fetchAuditLogs();
  }, []);

  if (loading) {
    return (
      <Card>
        <CardHeader>
          <CardTitle>Global Audit Log</CardTitle>
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
    <div className="p-4 sm:p-6 lg:p-8">
      <Card>
        <CardHeader>
          <CardTitle>Global Audit Log</CardTitle>
        </CardHeader>
        <CardContent>
          {auditLogs.length > 0 ? (
            <Table>
              <TableHeader>
                <TableRow>
                  <TableHead>Date</TableHead>
                  <TableHead>Action</TableHead>
                  <TableHead>User</TableHead>
                  <TableHead>Target Type</TableHead>
                  <TableHead>Target ID</TableHead>
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
                    <TableCell>{log.targetType}</TableCell>
                    <TableCell>{log.targetId}</TableCell>
                  </TableRow>
                ))}
              </TableBody>
            </Table>
          ) : (
            <p>No audit logs found.</p>
          )}
        </CardContent>
      </Card>
    </div>
  );
};

export default AuditLogPage;