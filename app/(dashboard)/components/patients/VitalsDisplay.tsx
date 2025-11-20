
"use client";

import { useEffect, useState } from "react";
import { Vital } from "@/types/vital";
import {
  Card,
  CardContent,
  CardHeader,
  CardTitle,
} from "@/components/ui/card";
import { Button } from "@/components/ui/button";
import { Badge } from "@/components/ui/badge";
import { Loader2, HeartPulse, Thermometer, Wind, Activity, PlusCircle, ArrowRight } from "lucide-react";
import { toast } from "sonner";
import Link from "next/link";

import { RecordVitalsModal } from "./RecordVitalsModal";

import { Patient } from "@/types/patient";
import { useSession } from "next-auth/react";
import { useRef } from "react";

interface VitalsDisplayProps {
  patientId: string;
}

const VitalsDisplay: React.FC<VitalsDisplayProps> = ({ patientId }) => {
  const [latestVital, setLatestVital] = useState<Vital | null>(null);
  const [patient, setPatient] = useState<Patient | null>(null);
  const [isLoading, setIsLoading] = useState(true);
  const [isModalOpen, setIsModalOpen] = useState(false);
  const { data: session } = useSession();
  const wsRef = useRef<WebSocket | null>(null);

  const fetchVitals = async () => {
    setIsLoading(true);
    try {
      const res = await fetch(`/api/patients/${patientId}/vitals`);
      if (res.ok) {
          const data: Vital[] = await res.json();
          setLatestVital(data.length > 0 ? data[0] : null);
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

  // WebSocket connection for real-time vitals updates
  useEffect(() => {
    if (!session?.user?.token || !patientId) return;

    const connectWebSocket = () => {
      const workerUrl = process.env.NODE_ENV === "development"
        ? "http://127.0.0.1:8787"
        : process.env.NEXT_PUBLIC_CLOUDFLARE_WORKER_URL;

      if (!workerUrl) return;

      const url = new URL(workerUrl);
      const wsProtocol = url.protocol === "https:" ? "wss" : "ws";
      const wsUrl = `${wsProtocol}://${url.host}/?room=vitals-updates`;

      const ws = new WebSocket(wsUrl);
      wsRef.current = ws;

      ws.onopen = () => {
        // Authenticate the WebSocket connection
        ws.send(JSON.stringify({
          type: "auth",
          token: session.user.token,
        }));
      };

      ws.onmessage = (event) => {
        try {
          const message = JSON.parse(event.data);
          if (message.type === "vitals_update" && message.payload?.patientId === patientId) {
            const newVital = message.payload.vital;
            if (newVital) {
              setLatestVital(newVital);

              // Show notification for urgent vitals
              if (newVital.isUrgent) {
                toast.error(`🚨 Urgent vitals recorded for ${patient?.fullName || 'patient'}`, {
                  description: "Please review immediately",
                  duration: 10000,
                });
              } else {
                toast.success(`New vitals recorded for ${patient?.fullName || 'patient'}`);
              }
            }
          }
        } catch (error) {
          console.error("Error parsing WebSocket message:", error);
        }
      };

      ws.onerror = (error) => {
        console.error("WebSocket error:", error);
      };

      ws.onclose = () => {
        // Attempt to reconnect after a delay
        setTimeout(connectWebSocket, 5000);
      };
    };

    connectWebSocket();

    return () => {
      if (wsRef.current) {
        wsRef.current.close();
      }
    };
  }, [session?.user?.token, patientId, patient?.fullName]);

  const getBloodPressureCategory = (systolic: number, diastolic: number) => {
    if (systolic > 180 || diastolic > 120) return "Crisis";
    if (systolic >= 140 || diastolic >= 90) return "High (Stage 2)";
    if ((systolic >= 130 && systolic <= 139) || (diastolic >= 80 && diastolic <= 89)) return "High (Stage 1)";
    if (systolic >= 120 && systolic <= 129 && diastolic < 80) return "Elevated";
    if (systolic < 120 && diastolic < 80) return "Normal";
    return "N/A";
  };

  const getCategoryBadgeVariant = (category: string) => {
    switch (category) {
      case "Normal":
        return "border-transparent bg-green-100 text-green-800 dark:bg-green-900/40 dark:text-green-300";
      case "Elevated":
        return "border-transparent bg-yellow-100 text-yellow-800 dark:bg-yellow-900/40 dark:text-yellow-300";
      case "High (Stage 1)":
        return "border-transparent bg-orange-100 text-orange-800 dark:bg-orange-900/40 dark:text-orange-300";
      case "High (Stage 2)":
        return "border-transparent bg-red-100 text-red-800 dark:bg-red-900/40 dark:text-red-300";
      case "Crisis":
        return "border-transparent bg-red-200 text-red-900 dark:bg-red-800/50 dark:text-red-200 animate-pulse";
      default:
        return "border-transparent bg-gray-100 text-gray-800 dark:bg-gray-800 dark:text-gray-300";
    }
  };

  const VitalInfo = ({ icon: Icon, label, value, unit }: { icon: React.ElementType, label: string, value: any, unit: string }) => (
    <div className="flex items-center space-x-2">
      <Icon className="h-5 w-5 text-muted-foreground" />
      <div>
        <p className="text-xs text-muted-foreground">{label}</p>
        <p className="text-base font-semibold">{value} <span className="text-xs font-normal">{unit}</span></p>
      </div>
    </div>
  );

  if (isLoading) {
    return (
      <Card className="bg-white/70 dark:bg-gray-950/60 backdrop-blur-lg rounded-2xl border-gray-200/50 dark:border-gray-800/50">
        <CardHeader className="flex flex-row items-center justify-between">
          <CardTitle className="flex items-center">
            <Activity className="mr-2" />
            Latest Vitals
          </CardTitle>
        </CardHeader>
        <CardContent>
          <div className="flex justify-center items-center h-24">
            <Loader2 className="h-8 w-8 animate-spin text-primary" />
          </div>
        </CardContent>
      </Card>
    );
  }

  return (
    <Card className="bg-white/70 dark:bg-gray-950/60 backdrop-blur-lg rounded-2xl border-gray-200/50 dark:border-gray-800/50">
      <CardHeader className="flex flex-row items-center justify-between">
        <CardTitle className="flex items-center">
          <Activity className="mr-2" />
          Latest Vitals
        </CardTitle>
        <div className="flex items-center space-x-2">
          <Button variant="outline" size="sm" asChild>
            <Link href={`/dashboard/ehr/patients/${patientId}/vitals`}>
              View All <ArrowRight className="ml-2 h-4 w-4" />
            </Link>
          </Button>
          <Button className="cursor-pointer" size="sm" onClick={() => setIsModalOpen(true)}>
            <PlusCircle className="mr-2 h-4 w-4" />
            Record Vitals
          </Button>
        </div>
      </CardHeader>
      <CardContent>
        {latestVital ? (
          <div className="grid grid-cols-2 sm:grid-cols-3 md:grid-cols-5 gap-x-4 gap-y-4 pt-2">
            <VitalInfo icon={HeartPulse} label="Heart Rate" value={latestVital.heartRate} unit="bpm" />
            <div className="flex items-start space-x-2">
              <Activity className="h-5 w-5 text-muted-foreground flex-shrink-0" />
              <div>
                <p className="text-xs text-muted-foreground">Blood Pressure</p>
                <p className="text-base font-semibold">{`${latestVital.bpSystolic}/${latestVital.bpDiastolic}`} <span className="text-xs font-normal">mmHg</span></p>
                <Badge className={`mt-1 text-xs font-medium ${getCategoryBadgeVariant(getBloodPressureCategory(latestVital.bpSystolic || 0, latestVital.bpDiastolic || 0))}`}>
                  {getBloodPressureCategory(latestVital.bpSystolic || 0, latestVital.bpDiastolic || 0)}
                </Badge>
              </div>
            </div>
            <VitalInfo icon={Activity} label="SpO2" value={latestVital.spo2} unit="%" />
            <VitalInfo icon={Thermometer} label="Temperature" value={latestVital.temperature} unit="°F" />
            <VitalInfo icon={Wind} label="Resp. Rate" value={latestVital.respiratoryRate} unit="br/min" />
          </div>
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