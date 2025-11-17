
"use client";

import { useEffect, useState } from "react";
import { Vital } from "@/types/vital";
import {
  Card,
  CardContent,
  CardHeader,
  CardTitle,
} from "@/components/ui/card";
import {
  Table,
  TableBody,
  TableCell,
  TableHead,
  TableHeader,
  TableRow,
} from "@/components/ui/table";
import { Badge } from "@/components/ui/badge";
import { Button } from "@/components/ui/button";
import { Loader2, HeartPulse, Thermometer, Wind, Activity, PlusCircle } from "lucide-react";
import { toast } from "sonner";

import { RecordVitalsModal } from "./RecordVitalsModal";

import { Patient } from "@/types/patient";

interface VitalsDisplayProps {
  patientId: string;
}

const VitalsDisplay: React.FC<VitalsDisplayProps> = ({ patientId }) => {
  const [vitals, setVitals] = useState<Vital[]>([]);
  const [patient, setPatient] = useState<Patient | null>(null);
  const [isLoading, setIsLoading] = useState(true);
  const [isModalOpen, setIsModalOpen] = useState(false);

  const fetchVitals = async () => {
    setIsLoading(true);
    try {
      const res = await fetch(`/api/patients/${patientId}/vitals`);
      if (res.ok) {
          const data: Vital[] = await res.json();
          setVitals(data);
        } else {
        toast.error("Failed to fetch vitals.");
      }
    } catch (error) {
      console.error("Failed to fetch vitals:", error);
      toast.error("An unexpected error occurred while fetching vitals.");
    } finally {
      setIsLoading(false);
    }
  };

  useEffect(() => {
    const fetchPatient = async () => {
      try {
        const res = await fetch(`/api/patients/${patientId}`);
        if (res.ok) {
          const data: Patient = await res.json();
          setPatient(data);
        } else {
          toast.error("Failed to fetch patient details.");
        }
      } catch (error) {
        console.error("Failed to fetch patient details:", error);
        toast.error("An unexpected error occurred while fetching patient details.");
      }
    };

    if (patientId) {
      fetchVitals();
      fetchPatient();
    }
  }, [patientId]);

  const getBloodPressureCategory = (systolic: number, diastolic: number) => {
    if (systolic < 120 && diastolic < 80) return "Normal";
    if (systolic >= 120 && systolic <= 129 && diastolic < 80) return "Elevated";
    if (systolic >= 130 && systolic <= 139 || diastolic >= 80 && diastolic <= 89) return "High (Stage 1)";
    if (systolic >= 140 || diastolic >= 90) return "High (Stage 2)";
    if (systolic > 180 || diastolic > 120) return "Crisis";
    return "N/A";
  };

  const getCategoryBadgeVariant = (category: string) => {
    switch (category) {
      case "Normal":
        return "bg-green-100 text-green-800";
      case "Elevated":
        return "bg-yellow-100 text-yellow-800";
      case "High (Stage 1)":
        return "bg-orange-100 text-orange-800";
      case "High (Stage 2)":
        return "bg-red-100 text-red-800";
      case "Crisis":
        return "bg-red-200 text-red-900 animate-pulse";
      default:
        return "bg-gray-100 text-gray-800";
    }
  };

  if (isLoading) {
    return (
      <div className="flex justify-center items-center h-40">
        <Loader2 className="h-8 w-8 animate-spin text-primary" />
      </div>
    );
  }

  return (
    <Card className="bg-white/70 dark:bg-gray-950/60 backdrop-blur-lg rounded-2xl border-gray-200/50 dark:border-gray-800/50">
      <CardHeader className="flex flex-row items-center justify-between">
        <CardTitle className="flex items-center">
          <Activity className="mr-2" />
          Vitals History
        </CardTitle>
        <Button className="cursor-pointer" size="sm" onClick={() => setIsModalOpen(true)}>
          <PlusCircle className="mr-2 h-4 w-4" />
          Record Vitals
        </Button>
      </CardHeader>
      <CardContent>
        {vitals.length > 0 ? (
          <>
            {/* Desktop View: Table */}
            <div className="hidden md:block">
              <Table>
                <TableHeader>
                  <TableRow>
                    <TableHead>Date</TableHead>
                    <TableHead><HeartPulse className="inline-block mr-1 h-4 w-4" />Blood Pressure</TableHead>
                    <TableHead><HeartPulse className="inline-block mr-1 h-4 w-4" />Heart Rate</TableHead>
                    <TableHead><Thermometer className="inline-block mr-1 h-4 w-4" />Temp</TableHead>
                    <TableHead><Wind className="inline-block mr-1 h-4 w-4" />Resp. Rate</TableHead>
                    <TableHead><Activity className="inline-block mr-1 h-4 w-4" />SpO2</TableHead>
                  </TableRow>
                </TableHeader>
                <TableBody>
                  {vitals.map((vital) => {
                    const bpCategory = getBloodPressureCategory(vital.bpSystolic, vital.bpDiastolic);
                    return (
                      <TableRow key={vital._id}>
                        <TableCell className="font-medium">{new Date(vital.recordedAt).toLocaleString()}{vital.isUrgent && <span className="ml-2 h-2 w-2 rounded-full bg-red-500 inline-block" title="Urgent" />}</TableCell>
                        <TableCell>{vital.bpSystolic}/{vital.bpDiastolic} <Badge variant="outline" className={`ml-2 ${getCategoryBadgeVariant(bpCategory)}`}>{bpCategory}</Badge></TableCell>
                        <TableCell>{vital.heartRate} bpm</TableCell>
                        <TableCell>{vital.temperature}°F</TableCell>
                        <TableCell>{vital.respiratoryRate} br/min</TableCell>
                        <TableCell>{vital.spo2}%</TableCell>
                      </TableRow>
                    );
                  })}
                </TableBody>
              </Table>
            </div>

            {/* Mobile View: Cards */}
            <div className="md:hidden space-y-4">
              {vitals.map((vital) => {
                const bpCategory = getBloodPressureCategory(vital.bpSystolic, vital.bpDiastolic);
                return (
                  <div key={vital._id} className="p-4 border rounded-lg bg-background/50">
                    <div className="flex justify-between items-center mb-3">
                      <p className="font-semibold text-sm">{new Date(vital.recordedAt).toLocaleString()}</p>
                      {vital.isUrgent && <Badge variant="destructive" className="animate-pulse">Urgent</Badge>}
                    </div>
                    <div className="grid grid-cols-2 gap-x-4 gap-y-3 text-sm">
                      <div className="col-span-2">
                        <p className="text-xs text-muted-foreground">Blood Pressure</p>
                        <div className="flex items-center">
                          <span className="font-medium">{vital.bpSystolic}/{vital.bpDiastolic} mmHg</span>
                          <Badge variant="outline" className={`ml-2 ${getCategoryBadgeVariant(bpCategory)}`}>{bpCategory}</Badge>
                        </div>
                      </div>
                      <div><p className="text-xs text-muted-foreground">Heart Rate</p><p className="font-medium">{vital.heartRate} bpm</p></div>
                      <div><p className="text-xs text-muted-foreground">SpO2</p><p className="font-medium">{vital.spo2}%</p></div>
                      <div><p className="text-xs text-muted-foreground">Temperature</p><p className="font-medium">{vital.temperature}°F</p></div>
                      <div><p className="text-xs text-muted-foreground">Resp. Rate</p><p className="font-medium">{vital.respiratoryRate} br/min</p></div>
                    </div>
                    {vital.notes && <p className="text-xs text-muted-foreground mt-3 pt-3 border-t">Notes: <span className="font-normal text-foreground">{vital.notes}</span></p>}
                  </div>
                );
              })}
            </div>
          </>
        ) : (
          <div className="text-center text-gray-500 dark:text-gray-400 py-8">
            <p>No vitals recorded for this patient yet.</p>
          </div>
        )}
      </CardContent>
      <RecordVitalsModal
        patientId={patientId}
        patientName={patient?.fullName || ""}
        isOpen={isModalOpen}
        onClose={() => setIsModalOpen(false)}
        onVitalsRecorded={fetchVitals}
      />
    </Card>
  );
};

export default VitalsDisplay;