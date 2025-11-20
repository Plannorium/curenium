"use client";

import { useState } from 'react';
import { Modal } from '@/components/ui/modal';
import { Button } from '@/components/ui/button';
import { Input } from '@/components/ui/input';
import { Textarea } from '@/components/ui/textarea';
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from '@/components/ui/select';
import { toast } from 'sonner';

interface AddNursingCarePlanModalProps {
  patientId: string;
  nurseId: string;
  isOpen: boolean;
  onClose: () => void;
}

export const AddNursingCarePlanModal = ({ patientId, nurseId, isOpen, onClose }: AddNursingCarePlanModalProps) => {
  const [diagnoses, setDiagnoses] = useState('');
  const [interventions, setInterventions] = useState('');
  const [outcomes, setOutcomes] = useState('');
  const [evaluation, setEvaluation] = useState('');
  const [status, setStatus] = useState('Active');
  const [isSubmitting, setIsSubmitting] = useState(false);

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();

    if ((status === 'Inactive' || status === 'Resolved') && !evaluation) {
      toast.error('Evaluation is required when status is Inactive or Resolved.');
      return;
    }

    setIsSubmitting(true);

    try {
      const res = await fetch(`/api/patients/${patientId}/nursing-care-plans`, {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({ 
          nurseId, 
          diagnoses: diagnoses.split(',').map(d => d.trim()),
          interventions: interventions.split(',').map(i => i.trim()),
          outcomes: outcomes.split(',').map(o => o.trim()),
          evaluation,
          status
        }),
      });

      if (!res.ok) {
        throw new Error('Failed to add nursing care plan');
      }

      toast.success('Nursing care plan added successfully');
      onClose();
    } catch (error) {
      toast.error((error as Error).message);
    } finally {
      setIsSubmitting(false);
    }
  };

  return (
    <Modal isOpen={isOpen} onClose={onClose} title="Add Nursing Care Plan">
      <form onSubmit={handleSubmit} className="space-y-4">
        <div>
          <label htmlFor="diagnoses" className="block text-sm font-medium text-gray-700 dark:text-gray-300">Diagnoses (comma-separated)</label>
          <Input id="diagnoses" value={diagnoses} onChange={(e) => setDiagnoses(e.target.value)} required />
        </div>
        <div>
          <label htmlFor="interventions" className="block text-sm font-medium text-gray-700 dark:text-gray-300">Interventions (comma-separated)</label>
          <Textarea id="interventions" value={interventions} onChange={(e) => setInterventions(e.target.value)} required />
        </div>
        <div>
          <label htmlFor="outcomes" className="block text-sm font-medium text-gray-700 dark:text-gray-300">Outcomes (comma-separated)</label>
          <Textarea id="outcomes" value={outcomes} onChange={(e) => setOutcomes(e.target.value)} required />
        </div>
        <div>
          <label htmlFor="evaluation" className="block text-sm font-medium text-gray-700 dark:text-gray-300">Evaluation</label>
          <Textarea id="evaluation" value={evaluation} onChange={(e) => setEvaluation(e.target.value)} />
        </div>
        <div>
          <label htmlFor="status" className="block text-sm font-medium text-gray-700 dark:text-gray-300">Status</label>
          <Select value={status} onValueChange={setStatus}>
            <SelectTrigger>
              <SelectValue placeholder="Select status" />
            </SelectTrigger>
            <SelectContent>
              <SelectItem value="Active">Active</SelectItem>
              <SelectItem value="Resolved">Resolved</SelectItem>
              <SelectItem value="Inactive">Inactive</SelectItem>
            </SelectContent>
          </Select>
        </div>
        <div className="flex justify-end space-x-2">
          <Button className='cursor-pointer' type="button" variant="outline" onClick={onClose}>Cancel</Button>
          <Button className='cursor-pointer' type="submit" disabled={isSubmitting}>{isSubmitting ? 'Adding...' : 'Add Plan'}</Button>
        </div>
      </form>
    </Modal>
  );
};