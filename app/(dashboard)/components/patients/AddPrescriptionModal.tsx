"use client";

import { useState } from 'react';
import { Button } from "@/components/ui/button";
import { Dialog, DialogContent, DialogHeader, DialogTitle, DialogFooter } from "@/components/ui/dialog";
import { Input } from "@/components/ui/input";
import { toast } from 'sonner';
import { useSession } from 'next-auth/react';

interface AddPrescriptionModalProps {
  patientId: string;
  isOpen: boolean;
  onClose: () => void;
  onPrescriptionAdded: () => void;
}

export function AddPrescriptionModal({ patientId, isOpen, onClose, onPrescriptionAdded }: AddPrescriptionModalProps) {
  const { data: session } = useSession();
  const [medication, setMedication] = useState('');
  const [dose, setDose] = useState('');
  const [frequency, setFrequency] = useState('');

  const handleSubmit = async () => {
    if (!medication || !dose || !frequency) {
      toast.error('All fields are required');
      return;
    }

    try {
      const response = await fetch(`/api/patients/${patientId}/prescriptions`, {
        method: 'POST',
        headers: {
          'Content-Type': 'application/json',
        },
        body: JSON.stringify({ 
          medication, 
          dose, 
          frequency, 
          prescribedBy: session?.user?.id 
        }),
      });

      if (response.ok) {
        toast.success('Prescription added successfully');
        onPrescriptionAdded();
        onClose();
      } else {
        toast.error('Failed to add prescription');
      }
    } catch (error) {
      toast.error('An error occurred while adding the prescription');
    }
  };

  return (
    <Dialog open={isOpen} onOpenChange={onClose}>
      <DialogContent>
        <DialogHeader>
          <DialogTitle>Add Prescription</DialogTitle>
        </DialogHeader>
        <div className="space-y-4">
          <Input
            placeholder="Medication"
            value={medication}
            onChange={(e) => setMedication(e.target.value)}
          />
          <Input
            placeholder="Dose"
            value={dose}
            onChange={(e) => setDose(e.target.value)}
          />
          <Input
            placeholder="Frequency"
            value={frequency}
            onChange={(e) => setFrequency(e.target.value)}
          />
        </div>
        <DialogFooter>
          <Button variant="outline" onClick={onClose}>Cancel</Button>
          <Button onClick={handleSubmit}>Save Prescription</Button>
        </DialogFooter>
      </DialogContent>
    </Dialog>
  );
}