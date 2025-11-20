"use client";
import { useState, useEffect } from "react";
import {
  Card, CardContent, CardHeader, CardTitle
} from "@/components/ui/card";
import { Button } from "@/components/ui/button";
import { Skeleton } from "@/components/ui/skeleton";
import { Alert, AlertDescription, AlertTitle } from "@/components/ui/alert";
import { ServerCrash, Beaker, Calendar, FileText, CheckCircle, ArrowRight } from "lucide-react";
import Link from "next/link";
import { ILabResult } from "@/models/LabResult";

interface LabResultsDisplayProps {
  patientId: string;
}

const LabResultsDisplay = ({ patientId }: LabResultsDisplayProps) => {
  const [latestLabResult, setLatestLabResult] = useState<ILabResult | null>(null);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState<string | null>(null);

  useEffect(() => {
    const fetchLabResults = async () => {
      try {
        const res = await fetch(`/api/patients/${patientId}/lab-results?limit=1`);
        if (!res.ok) {
          throw new Error("Failed to fetch lab results");
        }
        const data: ILabResult[] = await res.json();
        setLatestLabResult(data.length > 0 ? data[0] : null);
      } catch (err: any) {
        setError(err.message);
      } finally {
        setLoading(false);
      }
    };

    fetchLabResults();
  }, [patientId]);

  const InfoItem = ({ icon: Icon, label, value }: { icon: React.ElementType, label: string, value: string }) => (
    <div className="flex items-start space-x-3">
      <Icon className="h-5 w-5 text-primary shrink-0 mt-1" />
      <div>
        <p className="text-sm text-gray-500 dark:text-gray-400">{label}</p>
        <p className="text-md font-semibold">{value}</p>
      </div>
    </div>
  );

  if (loading) {
    return (
      <Card className="bg-white/70 dark:bg-gray-950/60 backdrop-blur-lg rounded-2xl border-gray-200/50 dark:border-gray-800/50 shadow-xl">
        <CardHeader>
          <CardTitle className="flex items-center text-xl font-bold bg-gradient-to-r from-primary to-primary/70 bg-clip-text text-transparent">
            <Beaker className="mr-3 h-6 w-6 text-primary" />
            Latest Lab Result
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
          <Beaker className="mr-2 sm:mr-3 h-5 w-5 sm:h-6 sm:w-6 text-primary" />
          <span className="text-lg sm:text-2xl">Latest Lab Result</span>
        </CardTitle>
        <Button variant="outline" size="sm" asChild className="w-full sm:w-auto">
          <Link href={`/dashboard/ehr/patients/${patientId}/lab-results`}>
            <span className="text-sm sm:text-base">View All</span>
            <ArrowRight className="ml-2 h-3 w-3 sm:h-4 sm:w-4" />
          </Link>
        </Button>
      </CardHeader>
      <CardContent>
        {latestLabResult ? (
          <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-4">
            <InfoItem icon={Beaker} label="Test Name" value={latestLabResult.testName} />
            <InfoItem icon={FileText} label="Result" value={`${latestLabResult.value} ${latestLabResult.units}`} />
            <InfoItem icon={Calendar} label="Collected At" value={new Date(latestLabResult.collectedDate).toLocaleDateString()} />
          </div>
        ) : (
          <div className="text-center py-8 sm:py-12 bg-gradient-to-br from-gray-50 to-gray-100 dark:from-gray-800 dark:to-gray-900 rounded-xl border-2 border-dashed border-gray-300 dark:border-gray-600">
            <Beaker className="mx-auto h-8 w-8 sm:h-12 sm:w-12 text-gray-400 dark:text-gray-500 mb-3 sm:mb-4" />
            <h3 className="text-base sm:text-lg font-semibold text-gray-900 dark:text-gray-100 mb-2">
              No Lab Results Yet
            </h3>
            <p className="text-gray-500 dark:text-gray-400 mb-4 sm:mb-6 max-w-md mx-auto text-sm sm:text-base px-4">
              Laboratory test results will appear here once they are available.
            </p>
            <Button variant="outline" size="sm" asChild>
              <Link href={`/dashboard/ehr/patients/${patientId}/lab-results`}>
                <span className="text-sm sm:text-base">View All Results</span>
                <ArrowRight className="ml-2 h-3 w-3 sm:h-4 sm:w-4" />
              </Link>
            </Button>
          </div>
        )}
      </CardContent>
    </Card>
  );
};

export default LabResultsDisplay;