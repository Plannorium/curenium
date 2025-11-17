
"use client";

import { useState } from "react";
import {
  Dialog,
  DialogContent,
  DialogHeader,
  DialogTitle,
  DialogFooter,
  DialogDescription,
} from "@/components/ui/dialog";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import { useSession } from "next-auth/react";
import { toast } from "sonner";
import { Loader2, Ruler, Weight, Heart, ThermometerIcon, Wind, Activity } from "lucide-react";

import { sendWebSocketMessage } from "@/lib/websockets";
import { z } from "zod";

interface RecordVitalsModalProps {
  patientId: string;
  patientName: string;
  isOpen: boolean;
  onClose: () => void;
  onVitalsRecorded: () => void;
}

import { Checkbox } from "@/components/ui/checkbox";

const vitalsSchema = z.object({
  bpSystolic: z.number().min(50).max(300),
  bpDiastolic: z.number().min(30).max(200),
  heartRate: z.number().min(30).max(250),
  respiratoryRate: z.number().min(5).max(60),
  temperature: z.number().min(90).max(110),
  spo2: z.number().min(70).max(100),
  height: z.number().min(20).max(100),
  weight: z.number().min(2).max(1000),
  notes: z.string().optional(),
});


export const RecordVitalsModal: React.FC<RecordVitalsModalProps> = ({
  patientId,
  patientName,
  isOpen,
  onClose,
  onVitalsRecorded,
}) => {
  const { data: session } = useSession();
  const [isLoading, setIsLoading] = useState(false);
  const [isUrgent, setIsUrgent] = useState(false);
  const [errors, setErrors] = useState<z.ZodError | null>(null);
  const [vitals, setVitals] = useState({
    bpSystolic: "",
    bpDiastolic: "",
    heartRate: "",
    respiratoryRate: "",
    temperature: "",
    spo2: "",
    notes: "",
    height: "",
    weight: "",
  });
  const [bmi, setBmi] = useState<number | null>(null);

  const calculateBmi = (height: number, weight: number) => {
    if (height > 0 && weight > 0) {
      const heightInMeters = height * 0.0254;
      const bmiValue = weight / (heightInMeters * heightInMeters);
      setBmi(bmiValue);
    } else {
      setBmi(null);
    }
  };

  const handleChange = (e: React.ChangeEvent<HTMLInputElement>) => {
    const { name, value } = e.target;
    setVitals((prev) => ({ ...prev, [name]: value }));

    if (name === "height" || name === "weight") {
      const newHeight = name === "height" ? parseFloat(value) : parseFloat(vitals.height);
      const newWeight = name === "weight" ? parseFloat(value) : parseFloat(vitals.weight);
      calculateBmi(newHeight, newWeight);
    }
  };

  const handleSubmit = async () => {
    setIsLoading(true);
    setErrors(null);

    const parsedVitals = {
      ...vitals,
      bpSystolic: parseFloat(vitals.bpSystolic),
      bpDiastolic: parseFloat(vitals.bpDiastolic),
      heartRate: parseFloat(vitals.heartRate),
      respiratoryRate: parseFloat(vitals.respiratoryRate),
      temperature: parseFloat(vitals.temperature),
      spo2: parseFloat(vitals.spo2),
      height: parseFloat(vitals.height),
      weight: parseFloat(vitals.weight),
    };

    const validationResult = vitalsSchema.safeParse(parsedVitals);

    if (!validationResult.success) {
      setErrors(validationResult.error);
      setIsLoading(false);
      return;
    }

    try {
      const res = await fetch(`/api/patients/${patientId}/vitals`, {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({
          ...validationResult.data,
          isUrgent,
          recordedAt: new Date().toISOString(),
          orgId: session?.user.organizationId,
        }),
      });

      const result = await res.json();

      if (res.ok && session?.user.organizationId) {
        toast.success("Vitals recorded successfully!");
        onVitalsRecorded();
        onClose();
        sendWebSocketMessage(
          {
            type: "vitals.recorded",
            payload: {
              ...validationResult.data,
              isUrgent,
              patientId,
              patientName,
            },
          },
          session.user.organizationId,
          session.user.token
        );
      } else {
        toast.error((result as any).message || "Failed to record vitals.");
      }
    } catch (error: any) {
      console.error("Failed to record vitals:", error);
      toast.error(error.message || "An unexpected error occurred.");
    } finally {
      setIsLoading(false);
    }
  };

  return (
    <Dialog open={isOpen} onOpenChange={onClose}>
      <DialogContent className="max-w-2xl">
        <DialogHeader>
          <DialogTitle>Record Vitals for {patientName}</DialogTitle>
          <DialogDescription>
            Enter the patient's latest vital signs. All fields are required.
          </DialogDescription>
        </DialogHeader>
        <div className="grid grid-cols-2 gap-6 py-4">
          <div className="space-y-2">
            <Label htmlFor="bpSystolic">BP Systolic (mmHg)</Label>
            <div className="relative">
              <Heart className="absolute left-3 top-1/2 -translate-y-1/2 h-5 w-5 text-gray-400" />
              <Input
                id="bpSystolic"
                name="bpSystolic"
                value={vitals.bpSystolic}
                onChange={handleChange}
                className="pl-10"
              />
            </div>
            {errors?.issues.find((issue) => issue.path[0] === "bpSystolic") && (
              <p className="text-sm text-red-500">
                {errors.issues.find((issue) => issue.path[0] === "bpSystolic")?.message}
              </p>
            )}
          </div>
          <div className="space-y-2">
            <Label htmlFor="bpDiastolic">BP Diastolic (mmHg)</Label>
            <div className="relative">
              <Heart className="absolute left-3 top-1/2 -translate-y-1/2 h-5 w-5 text-gray-400" />
              <Input
                id="bpDiastolic"
                name="bpDiastolic"
                value={vitals.bpDiastolic}
                onChange={handleChange}
                className="pl-10"
              />
            </div>
            {errors?.issues.find((issue) => issue.path[0] === "bpDiastolic") && (
              <p className="text-sm text-red-500">
                {errors.issues.find((issue) => issue.path[0] === "bpDiastolic")?.message}
              </p>
            )}
          </div>
          <div className="space-y-2">
            <Label htmlFor="heartRate">Heart Rate (bpm)</Label>
            <div className="relative">
              <Activity className="absolute left-3 top-1/2 -translate-y-1/2 h-5 w-5 text-gray-400" />
              <Input
                id="heartRate"
                name="heartRate"
                value={vitals.heartRate}
                onChange={handleChange}
                className="pl-10"
              />
            </div>
            {errors?.issues.find((issue) => issue.path[0] === "heartRate") && (
              <p className="text-sm text-red-500">
                {errors.issues.find((issue) => issue.path[0] === "heartRate")?.message}
              </p>
            )}
          </div>
          <div className="space-y-2">
            <Label htmlFor="temperature">Temperature (°F)</Label>
            <div className="relative">
              <ThermometerIcon className="absolute left-3 top-1/2 -translate-y-1/2 h-5 w-5 text-gray-400" />
              <Input
                id="temperature"
                name="temperature"
                value={vitals.temperature}
                onChange={handleChange}
                className="pl-10"
              />
            </div>
            {errors?.issues.find((issue) => issue.path[0] === "temperature") && (
              <p className="text-sm text-red-500">
                {errors.issues.find((issue) => issue.path[0] === "temperature")?.message}
              </p>
            )}
          </div>
          <div className="space-y-2">
            <Label htmlFor="respiratoryRate">Respiratory Rate (breaths/min)</Label>
            <div className="relative">
              <Wind className="absolute left-3 top-1/2 -translate-y-1/2 h-5 w-5 text-gray-400" />
              <Input
                id="respiratoryRate"
                name="respiratoryRate"
                value={vitals.respiratoryRate}
                onChange={handleChange}
                className="pl-10"
              />
            </div>
            {errors?.issues.find((issue) => issue.path[0] === "respiratoryRate") && (
              <p className="text-sm text-red-500">
                {errors.issues.find((issue) => issue.path[0] === "respiratoryRate")?.message}
              </p>
            )}
          </div>
          <div className="space-y-2">
            <Label htmlFor="spo2">SpO2 (%)</Label>
            <div className="relative">
              <Activity className="absolute left-3 top-1/2 -translate-y-1/2 h-5 w-5 text-gray-400" />
              <Input
                id="spo2"
                name="spo2"
                value={vitals.spo2}
                onChange={handleChange}
                className="pl-10"
              />
            </div>
            {errors?.issues.find((issue) => issue.path[0] === "spo2") && (
              <p className="text-sm text-red-500">
                {errors.issues.find((issue) => issue.path[0] === "spo2")?.message}
              </p>
            )}
          </div>
          <div className="space-y-2">
            <Label htmlFor="height">Height (in)</Label>
            <div className="relative">
              <Ruler className="absolute left-3 top-1/2 -translate-y-1/2 h-5 w-5 text-gray-400" />
              <Input
                id="height"
                name="height"
                value={vitals.height}
                onChange={handleChange}
                className="pl-10"
              />
            </div>
            {errors?.issues.find((issue) => issue.path[0] === "height") && (
              <p className="text-sm text-red-500">
                {errors.issues.find((issue) => issue.path[0] === "height")?.message}
              </p>
            )}
          </div>
          <div className="space-y-2">
            <Label htmlFor="weight">Weight (lbs)</Label>
            <div className="relative">
              <Weight className="absolute left-3 top-1/2 -translate-y-1/2 h-5 w-5 text-gray-400" />
              <Input
                id="weight"
                name="weight"
                value={vitals.weight}
                onChange={handleChange}
                className="pl-10"
              />
            </div>
            {errors?.issues.find((issue) => issue.path[0] === "weight") && (
              <p className="text-sm text-red-500">
                {errors.issues.find((issue) => issue.path[0] === "weight")?.message}
              </p>
            )}
          </div>
          {bmi && (
            <div className="col-span-2 p-3 bg-gray-100 dark:bg-gray-800 rounded-lg">
              <p className="text-sm font-medium text-center">
                Body Mass Index (BMI): {bmi.toFixed(2)}
              </p>
            </div>
          )}
          <div className="col-span-2 space-y-2">
            <Label htmlFor="notes">Notes</Label>
            <Input id="notes" name="notes" value={vitals.notes} onChange={handleChange} />
            {errors?.issues.find((issue) => issue.path[0] === "notes") && (
              <p className="text-sm text-red-500">
                {errors.issues.find((issue) => issue.path[0] === "notes")?.message}
              </p>
            )}
          </div>
          <div className="col-span-2 flex items-center space-x-2">
            <Checkbox
              id="isUrgent"
              checked={isUrgent}
              onCheckedChange={(checked) => setIsUrgent(checked as boolean)}
            />
            <label
              htmlFor="isUrgent"
              className="text-sm font-medium leading-none peer-disabled:cursor-not-allowed peer-disabled:opacity-70"
            >
              Mark as Urgent
            </label>
          </div>
        </div>
        <DialogFooter>
          <Button variant="outline" onClick={onClose}>
            Cancel
          </Button>
          <Button onClick={handleSubmit} disabled={isLoading}>
            {isLoading && <Loader2 className="mr-2 h-4 w-4 animate-spin" />}
            Save Vitals
          </Button>
        </DialogFooter>
      </DialogContent>
    </Dialog>
  );
};