"use client";
import { useState } from 'react';
import { Dialog, DialogContent, DialogHeader, DialogTitle, DialogFooter } from '@/components/ui/dialog';
import { Button } from '@/components/ui/button';
import { Input } from '@/components/ui/input';
import { Textarea } from '@/components/ui/textarea';
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from '@/components/ui/select';
import { Prescription } from '@/types/prescription';

interface AdministerPrescriptionModalProps {
  isOpen: boolean;
  onClose: () => void;
  prescription: Prescription;
  onAdministrationAdded: () => void;
}

export const AdministerPrescriptionModal = ({ isOpen, onClose, prescription, onAdministrationAdded }: AdministerPrescriptionModalProps) => {
  const [status, setStatus] = useState<'administered' | 'missed' | 'patient_refused' | 'not_available'>('administered');
  const [doseAdministered, setDoseAdministered] = useState('');
  const [notes, setNotes] = useState('');
  const [isSubmitting, setIsSubmitting] = useState(false);

  const handleSubmit = async () => {
    setIsSubmitting(true);
    try {
      const res = await fetch(`/api/prescriptions/${prescription._id}/administer`, {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({ 
          status,
          doseAdministered,
          notes,
          administeredAt: new Date(),
        }),
      });

      if (!res.ok) {
        throw new Error('Failed to add administration record');
      }

      onAdministrationAdded();
      onClose();
    } catch (error) {
      console.error(error);
    } finally {
      setIsSubmitting(false);
    }
  };

  return (
    <Dialog open={isOpen} onOpenChange={onClose}>
      <DialogContent className='dark:bg-slate-900/80'>
        <DialogHeader>
          <DialogTitle>Administer Medication</DialogTitle>
        </DialogHeader>
        <div className="space-y-4">
          <div>
            <label>Medications</label>
            <p className="font-semibold">{prescription.medications?.join(', ') || prescription.medication || 'N/A'}</p>
          </div>
          <Select onValueChange={(value) => setStatus(value as any)} defaultValue={status}>
            <SelectTrigger>
              <SelectValue placeholder="Status" />
            </SelectTrigger>
            <SelectContent>
              <SelectItem value="administered">Administered</SelectItem>
              <SelectItem value="missed">Missed</SelectItem>
              <SelectItem value="patient_refused">Patient Refused</SelectItem>
              <SelectItem value="not_available">Not Available</SelectItem>
            </SelectContent>
          </Select>
          <Input 
            placeholder={`Dose Administered (e.g., ${prescription.dose})`}
            value={doseAdministered}
            onChange={(e) => setDoseAdministered(e.target.value)}
          />
          <Textarea 
            placeholder="Notes"
            value={notes}
            onChange={(e) => setNotes(e.target.value)}
          />
        </div>
        <DialogFooter>
          <Button variant="outline" onClick={onClose} disabled={isSubmitting}>Cancel</Button>
          <Button onClick={handleSubmit} disabled={isSubmitting}>
            {isSubmitting ? 'Submitting...' : 'Submit Administration'}
          </Button>
        </DialogFooter>
      </DialogContent>
    </Dialog>
  );
};