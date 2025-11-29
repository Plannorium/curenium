"use client";

import { useState } from 'react';
import { Dialog, DialogContent, DialogHeader, DialogTitle } from '@/components/ui/dialog';
import { Button } from '@/components/ui/button';
import { Input } from '@/components/ui/input';
import { Textarea } from '@/components/ui/textarea';
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from '@/components/ui/select';
import { toast } from 'sonner';
import { useLanguage } from '@/contexts/LanguageContext';
import { dashboardTranslations } from '@/lib/dashboard-translations';

interface AddNursingCarePlanModalProps {
  patientId: string;
  nurseId: string;
  isOpen: boolean;
  onClose: () => void;
}

export const AddNursingCarePlanModal = ({ patientId, nurseId, isOpen, onClose }: AddNursingCarePlanModalProps) => {
  const { language } = useLanguage();
  const t = (key: string) => {
    const keys = key.split('.');
    let value: any = dashboardTranslations[language as keyof typeof dashboardTranslations];
    for (const k of keys) {
      value = value?.[k];
    }
    return value || key;
  };

  const [diagnoses, setDiagnoses] = useState('');
  const [interventions, setInterventions] = useState('');
  const [outcomes, setOutcomes] = useState('');
  const [evaluation, setEvaluation] = useState('');
  const [status, setStatus] = useState('Active');
  const [isSubmitting, setIsSubmitting] = useState(false);

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();

    if ((status === 'Inactive' || status === 'Resolved') && !evaluation) {
      toast.error(t('addNursingCarePlanModal.evaluationRequired'));
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

      toast.success(t('addNursingCarePlanModal.planAdded'));
      onClose();
    } catch (error) {
      toast.error(t('addNursingCarePlanModal.failedToAdd'));
    } finally {
      setIsSubmitting(false);
    }
  };

  return (
    <Dialog open={isOpen} onOpenChange={onClose}>
      <DialogContent className="backdrop-blur-xl bg-background/95 dark:bg-slate-900/80 border-border/50 shadow-2xl max-w-lg">
        <DialogHeader>
          <DialogTitle>{t('addNursingCarePlanModal.title')}</DialogTitle>
        </DialogHeader>
        <form onSubmit={handleSubmit} className="space-y-4">
          <div>
            <label htmlFor="diagnoses" className="block text-sm font-medium text-gray-700 dark:text-gray-300">{t('addNursingCarePlanModal.diagnosesLabel')}</label>
            <Input id="diagnoses" value={diagnoses} onChange={(e) => setDiagnoses(e.target.value)} required />
          </div>
          <div>
            <label htmlFor="interventions" className="block text-sm font-medium text-gray-700 dark:text-gray-300">{t('addNursingCarePlanModal.interventionsLabel')}</label>
            <Textarea id="interventions" value={interventions} onChange={(e) => setInterventions(e.target.value)} required />
          </div>
          <div>
            <label htmlFor="outcomes" className="block text-sm font-medium text-gray-700 dark:text-gray-300">{t('addNursingCarePlanModal.outcomesLabel')}</label>
            <Textarea id="outcomes" value={outcomes} onChange={(e) => setOutcomes(e.target.value)} required />
          </div>
          <div>
            <label htmlFor="evaluation" className="block text-sm font-medium text-gray-700 dark:text-gray-300">{t('addNursingCarePlanModal.evaluationLabel')}</label>
            <Textarea id="evaluation" value={evaluation} onChange={(e) => setEvaluation(e.target.value)} />
          </div>
          <div>
            <label htmlFor="status" className="block text-sm font-medium text-gray-700 dark:text-gray-300">{t('addNursingCarePlanModal.statusLabel')}</label>
            <Select value={status} onValueChange={setStatus}>
              <SelectTrigger>
                <SelectValue placeholder={t('addNursingCarePlanModal.selectStatus')} />
              </SelectTrigger>
              <SelectContent>
                <SelectItem value="Active">{t('addNursingCarePlanModal.active')}</SelectItem>
                <SelectItem value="Resolved">{t('addNursingCarePlanModal.resolved')}</SelectItem>
                <SelectItem value="Inactive">{t('addNursingCarePlanModal.inactive')}</SelectItem>
              </SelectContent>
            </Select>
          </div>
          <div className="flex justify-end space-x-2">
            <Button className='cursor-pointer' type="button" variant="outline" onClick={onClose}>{t('addNursingCarePlanModal.cancel')}</Button>
            <Button className='cursor-pointer' type="submit" disabled={isSubmitting}>{isSubmitting ? t('addNursingCarePlanModal.adding') : t('addNursingCarePlanModal.addPlan')}</Button>
          </div>
        </form>
      </DialogContent>
    </Dialog>
  );
};