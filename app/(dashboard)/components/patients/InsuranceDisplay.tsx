"use client";
import { useState, useEffect } from "react";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { Insurance } from "@/types/insurance";
import { Skeleton } from "@/components/ui/skeleton";
import { Alert, AlertDescription, AlertTitle } from "@/components/ui/alert";
import { ServerCrash } from "lucide-react";
import DetailItem from "@/app/(dashboard)/components/patients/DetailItem";

interface InsuranceDisplayProps {
  patientId: string;
}

const InsuranceDisplay = ({ patientId }: InsuranceDisplayProps) => {
  const [insurance, setInsurance] = useState<Insurance[]>([]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState<string | null>(null);

  useEffect(() => {
    const fetchInsurance = async () => {
      try {
        const res = await fetch(`/api/patients/${patientId}/insurance`);
        if (!res.ok) {
          throw new Error("Failed to fetch insurance details");
        }
        const data = await res.json();
        setInsurance(data);
      } catch (err: any) {
        setError(err.message);
      } finally {
        setLoading(false);
      }
    };

    fetchInsurance();
  }, [patientId]);

  if (loading) {
    return (
      <Card>
        <CardHeader>
          <CardTitle>Insurance</CardTitle>
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
        <CardTitle>Insurance</CardTitle>
      </CardHeader>
      <CardContent>
        {insurance.length > 0 ? (
          insurance.map((ins) => (
            <div key={ins._id} className="grid grid-cols-1 md:grid-cols-2 gap-4">
              <DetailItem label="Provider" value={ins.provider} />
              <DetailItem label="Policy Number" value={ins.policyNumber} />
              {ins.groupNumber && <DetailItem label="Group Number" value={ins.groupNumber} />}
              <DetailItem label="Subscriber" value={ins.subscriberName} />
              <DetailItem label="Subscriber DOB" value={new Date(ins.subscriberDob).toLocaleDateString()} />
              <DetailItem label="Relationship" value={ins.relationshipToPatient} />
            </div>
          ))
        ) : (
          <p>No insurance details found for this patient.</p>
        )}
      </CardContent>
    </Card>
  );
};

export default InsuranceDisplay;