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
import { useLanguage } from '@/contexts/LanguageContext';
import { dashboardTranslations } from '@/lib/dashboard-translations';

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
  const { language } = useLanguage();
  const t = (key: string) => {
    const keys = key.split('.');
    let value: any = dashboardTranslations[language as keyof typeof dashboardTranslations];
    for (const k of keys) {
      value = value?.[k];
    }
    return value || key;
  };

  const [notes, setNotes] = useState("");
  const [isDispensing, setIsDispensing] = useState(false);

  const handleDispense = async () => {
    if (!prescription) return;

    setIsDispensing(true);
    try {
      const response = await fetch(`/api/prescriptions`, {
        method: "PUT",
        headers: {
          "Content-Type": "application/json",
        },
        body: JSON.stringify({
          id: prescription._id,
          dispensed: true,
          dispensedNotes: notes,
          dispensedAt: new Date().toISOString()
        }),
      });

      if (!response.ok) {
        throw new Error("Failed to dispense prescription");
      }

      toast.success(t('dispensePrescriptionModal.success'));
      onDispensed();
      onClose();
    } catch (error: any) {
      toast.error(t('dispensePrescriptionModal.error'));
    } finally {
      setIsDispensing(false);
    }
  };

  if (!prescription) return null;

  return (
    <Dialog open={isOpen} onOpenChange={onClose}>
      <DialogContent className="dark:bg-slate-900/80">
        <DialogHeader>
          <DialogTitle>{t('dispensePrescriptionModal.title')}</DialogTitle>
        </DialogHeader>
        <div>
          <p><strong>{t('dispensePrescriptionModal.labels.patient')}</strong> {(prescription.patientId as any)?.firstName} {(prescription.patientId as any)?.lastName}</p>
          <p><strong>{t('dispensePrescriptionModal.labels.medications')}</strong> {prescription.medications?.join(', ') || prescription.medication || 'N/A'}</p>
          <p><strong>{t('dispensePrescriptionModal.labels.dose')}</strong> {prescription.dose}</p>
          <p><strong>{t('dispensePrescriptionModal.labels.frequency')}</strong> {prescription.frequency}</p>
          <Textarea
            placeholder={t('dispensePrescriptionModal.placeholder')}
            value={notes}
            onChange={(e) => setNotes(e.target.value)}
            className="mt-4"
          />
        </div>
        <DialogFooter className="gap-3">
          <Button variant="outline" onClick={onClose}>
            {t('dispensePrescriptionModal.buttons.cancel')}
          </Button>
          <Button onClick={handleDispense} disabled={isDispensing}>
            {isDispensing ? t('dispensePrescriptionModal.buttons.dispensing') : t('dispensePrescriptionModal.buttons.markAsDispensed')}
          </Button>
        </DialogFooter>
      </DialogContent>
    </Dialog>
  );
};