"use client";
import { useState } from "react";
import { Prescription } from "@/types/prescription";
import {
  Dialog,
  DialogContent,
  DialogHeader,
  DialogTitle,
  DialogFooter,
} from "@/components/ui/dialog";
import { Button } from "@/components/ui/button";
import { Textarea } from "@/components/ui/textarea";
import { toast } from "sonner";

interface DispensePrescriptionModalProps {
  prescription: Prescription | null;
  isOpen: boolean;
  onClose: () => void;
  onDispensed: () => void;
}

export const DispensePrescriptionModal = ({
  prescription,
  isOpen,
  onClose,
  onDispensed,
}: DispensePrescriptionModalProps) => {
  const [notes, setNotes] = useState("");
  const [isDispensing, setIsDispensing] = useState(false);

  const handleDispense = async () => {
    if (!prescription) return;

    setIsDispensing(true);
    try {
      const response = await fetch(`/api/prescriptions/${prescription._id}`, {
        method: "PUT",
        headers: {
          "Content-Type": "application/json",
        },
        body: JSON.stringify({ notes }),
      });

      if (!response.ok) {
        throw new Error("Failed to dispense prescription");
      }

      toast.success("Prescription marked as dispensed");
      onDispensed();
      onClose();
    } catch (error: any) {
      toast.error(error.message);
    } finally {
      setIsDispensing(false);
    }
  };

  if (!prescription) return null;

  return (
    <Dialog open={isOpen} onOpenChange={onClose}>
      <DialogContent className="dark:bg-slate-900/80">
        <DialogHeader>
          <DialogTitle>Dispense Prescription</DialogTitle>
        </DialogHeader>
        <div>
          <p><strong>Patient:</strong> {(prescription.patientId as any)?.firstName} {(prescription.patientId as any)?.lastName}</p>
          <p><strong>Medications:</strong> {prescription.medications?.join(', ') || prescription.medication || 'N/A'}</p>
          <p><strong>Dose:</strong> {prescription.dose}</p>
          <p><strong>Frequency:</strong> {prescription.frequency}</p>
          <Textarea
            placeholder="Add dispensing notes..."
            value={notes}
            onChange={(e) => setNotes(e.target.value)}
            className="mt-4"
          />
        </div>
        <DialogFooter className="gap-3">
          <Button variant="outline" onClick={onClose}>
            Cancel
          </Button>
          <Button onClick={handleDispense} disabled={isDispensing}>
            {isDispensing ? "Dispensing..." : "Mark as Dispensed"}
          </Button>
        </DialogFooter>
      </DialogContent>
    </Dialog>
  );
};