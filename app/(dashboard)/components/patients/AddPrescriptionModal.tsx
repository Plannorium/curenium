"use client";

import { useState } from 'react';
import { Button } from "@/components/ui/button";
import { Dialog, DialogContent, DialogHeader, DialogTitle, DialogFooter } from "@/components/ui/dialog";
import { Input } from "@/components/ui/input";
import { Textarea } from "@/components/ui/textarea";
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
  const [medications, setMedications] = useState<string[]>([]);
  const [dose, setDose] = useState('');
  const [frequency, setFrequency] = useState('');
  const [route, setRoute] = useState('');
  const [durationDays, setDurationDays] = useState<number | undefined>();
  const [startDate, setStartDate] = useState<string>('');
  const [endDate, setEndDate] = useState<string>('');
  const [refills, setRefills] = useState<number | undefined>();
  const [instructions, setInstructions] = useState('');
  const [reasonForPrescription, setReasonForPrescription] = useState('');

  const handleSubmit = async () => {
    if (!medications.length || !dose || !frequency) {
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
          medications,
          dose,
          frequency,
          route,
          durationDays,
          startDate: startDate ? new Date(startDate) : undefined,
          endDate: endDate ? new Date(endDate) : undefined,
          refills,
          instructions,
          reasonForPrescription,
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
      <DialogContent className="dark:bg-slate-900/80">
        <DialogHeader>
          <DialogTitle>Add Prescription</DialogTitle>
        </DialogHeader>
        <div className="space-y-4">
          <Textarea
            placeholder="Medications (comma-separated)"
            value={medications.join(', ')}
            onChange={(e) => setMedications(e.target.value.split(',').map(m => m.trim()).filter(m => m))}
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
          <Input
            placeholder="Route"
            value={route}
            onChange={(e) => setRoute(e.target.value)}
          />
          <Input
            type="number"
            placeholder="Duration (days)"
            value={durationDays}
            onChange={(e) => setDurationDays(parseInt(e.target.value))}
          />
          <Input
            type="date"
            placeholder="Start Date"
            value={startDate}
            onChange={(e) => setStartDate(e.target.value)}
          />
          <Input
            type="date"
            placeholder="End Date"
            value={endDate}
            onChange={(e) => setEndDate(e.target.value)}
          />
          <Input
            type="number"
            placeholder="Refills"
            value={refills}
            onChange={(e) => setRefills(parseInt(e.target.value))}
          />
          <Textarea
            placeholder="Instructions"
            value={instructions}
            onChange={(e) => setInstructions(e.target.value)}
          />
          <Textarea
            placeholder="Reason for Prescription"
            value={reasonForPrescription}
            onChange={(e) => setReasonForPrescription(e.target.value)}
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