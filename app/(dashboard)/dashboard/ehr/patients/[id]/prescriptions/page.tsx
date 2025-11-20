"use client";

import { useEffect, useState } from "react";
import { Prescription } from "@/types/prescription";
import { useParams } from "next/navigation";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { Table, TableBody, TableCell, TableHead, TableHeader, TableRow } from "@/components/ui/table";
import { Badge } from "@/components/ui/badge";
import { Loader2 } from "lucide-react";
import { toast } from "sonner";

const HistoricalPrescriptionsPage = () => {
  const [prescriptions, setPrescriptions] = useState<Prescription[]>([]);
  const [isLoading, setIsLoading] = useState(true);
  const params = useParams();
  const patientId = params?.id as string;

  useEffect(() => {
    const fetchPrescriptions = async () => {
      if (!patientId) return;
      setIsLoading(true);
      try {
        const res = await fetch(`/api/patients/${patientId}/prescriptions`);
        if (res.ok) {
          const data: Prescription[] = await res.json();
          setPrescriptions(data);
        } else {
          toast.error("Failed to fetch historical prescriptions.");
        }
      } catch (error) {
        console.error("Failed to fetch historical prescriptions:", error);
        toast.error("An unexpected error occurred while fetching prescriptions.");
      } finally {
        setIsLoading(false);
      }
    };

    fetchPrescriptions();
  }, [patientId]);

  return (
    <div className="p-4 md:p-8">
      <Card>
        <CardHeader>
          <CardTitle>Historical Prescriptions</CardTitle>
        </CardHeader>
        <CardContent>
          {isLoading ? (
            <div className="flex justify-center items-center h-48">
              <Loader2 className="h-8 w-8 animate-spin text-primary" />
            </div>
          ) : prescriptions.length > 0 ? (
            <Table>
              <TableHeader>
                <TableRow>
                  <TableHead>Date</TableHead>
                  <TableHead>Medication</TableHead>
                  <TableHead>Dosage</TableHead>
                  <TableHead>Frequency</TableHead>
                  <TableHead>Status</TableHead>
                </TableRow>
              </TableHeader>
              <TableBody>
                {prescriptions.map((p) => (
                  <TableRow key={p._id}>
                    <TableCell>
                      {new Date(p.createdAt).toLocaleDateString()}
                    </TableCell>
                    <TableCell>{p.medication}</TableCell>
                    <TableCell>{p.dose}</TableCell>
                    <TableCell>{p.frequency}</TableCell>
                    <TableCell>
                      <Badge
                        variant={
                          p.status === "active" ? "default" : "secondary"
                        }
                      >
                        {p.status}
                      </Badge>
                    </TableCell>
                  </TableRow>
                ))}
              </TableBody>
            </Table>
          ) : (
            <p className="text-center text-gray-500 dark:text-gray-400">No historical prescriptions found.</p>
          )}
        </CardContent>
      </Card>
    </div>
  );
};

export default HistoricalPrescriptionsPage;