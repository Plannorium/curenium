"use client";
import { useState, useEffect } from "react";
import { useParams } from "next/navigation";
import { ILabResult } from "@/models/LabResult";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { Table, TableBody, TableCell, TableHead, TableHeader, TableRow } from "@/components/ui/table";
import { Badge } from "@/components/ui/badge";
import { Skeleton } from "@/components/ui/skeleton";
import { Alert, AlertDescription, AlertTitle } from "@/components/ui/alert";
import { ServerCrash } from "lucide-react";

const HistoricalLabResultsPage = () => {
  const params = useParams();
  const patientId = params?.id as string;
  const [labResults, setLabResults] = useState<ILabResult[]>([]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState<string | null>(null);

  useEffect(() => {
    if (!patientId) return;

    const fetchLabResults = async () => {
      try {
        const res = await fetch(`/api/patients/${patientId}/lab-results`);
        if (!res.ok) {
          throw new Error("Failed to fetch lab results");
        }
        const data: ILabResult[] = await res.json();
        setLabResults(data);
      } catch (err: any) {
        setError(err.message);
      } finally {
        setLoading(false);
      }
    };

    fetchLabResults();
  }, [patientId]);

  if (loading) {
    return (
      <div className="space-y-4">
        <Skeleton className="h-8 w-1/4" />
        <Card>
          <CardContent>
            <Table>
              <TableHeader>
                <TableRow>
                  <TableHead><Skeleton className="h-4 w-full" /></TableHead>
                  <TableHead><Skeleton className="h-4 w-full" /></TableHead>
                  <TableHead><Skeleton className="h-4 w-full" /></TableHead>
                  <TableHead><Skeleton className="h-4 w-full" /></TableHead>
                </TableRow>
              </TableHeader>
              <TableBody>
                {[...Array(5)].map((_, i) => (
                  <TableRow key={i}>
                    <TableCell><Skeleton className="h-4 w-full" /></TableCell>
                    <TableCell><Skeleton className="h-4 w-full" /></TableCell>
                    <TableCell><Skeleton className="h-4 w-full" /></TableCell>
                    <TableCell><Skeleton className="h-4 w-full" /></TableCell>
                  </TableRow>
                ))}
              </TableBody>
            </Table>
          </CardContent>
        </Card>
      </div>
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
    <div className="space-y-4">
      <h1 className="text-2xl font-bold">Historical Lab Results</h1>
      <Card>
        <CardContent>
          <Table>
            <TableHeader>
              <TableRow>
                <TableHead>Test Name</TableHead>
                <TableHead>Result</TableHead>
                <TableHead>Units</TableHead>
                <TableHead>Collected At</TableHead>
              </TableRow>
            </TableHeader>
            <TableBody>
              {labResults.length > 0 ? (
                labResults.map((result) => (
                  <TableRow key={result._id?.toString() || Math.random()}>
                    <TableCell>{result.testName}</TableCell>
                    <TableCell>{result.value}</TableCell>
                    <TableCell>{result.units}</TableCell>
                    <TableCell>{new Date(result.collectedDate).toLocaleString()}</TableCell>
                  </TableRow>
                ))
              ) : (
                <TableRow>
                  <TableCell colSpan={4} className="text-center">No lab results found.</TableCell>
                </TableRow>
              )}
            </TableBody>
          </Table>
        </CardContent>
      </Card>
    </div>
  );
};

export default HistoricalLabResultsPage;