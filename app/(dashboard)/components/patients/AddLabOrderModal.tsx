"use client";
import { useState } from "react";
import { useSession } from "next-auth/react";
import {
  Dialog, DialogContent, DialogHeader, DialogTitle, DialogFooter
} from "@/components/ui/dialog";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import { Textarea } from "@/components/ui/textarea";
import { toast } from "sonner";
import { useLanguage } from '@/contexts/LanguageContext';
import { dashboardTranslations } from '@/lib/dashboard-translations';

interface AddLabOrderModalProps {
  patientId: string;
  isOpen: boolean;
  onClose: () => void;
  onLabOrderAdded: () => void;
}

export const AddLabOrderModal = ({ patientId, isOpen, onClose, onLabOrderAdded }: AddLabOrderModalProps) => {
  const { data: session } = useSession();
  const { language } = useLanguage();
  const [testName, setTestName] = useState("");
  const [tests, setTests] = useState("");
  const [notes, setNotes] = useState("");
  const [isSubmitting, setIsSubmitting] = useState(false);

  const t = (key: string) => {
    const keys = key.split('.');
    let value: any = dashboardTranslations[language as keyof typeof dashboardTranslations];
    for (const k of keys) {
      value = value?.[k];
    }
    return value || key;
  };

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    if (!session?.user?.id) return;
    setIsSubmitting(true);

    try {
      const res = await fetch(`/api/patients/${patientId}/lab-orders`, {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({
          testName,
          tests: tests.split(",").map(t => t.trim()),
          notes: notes.trim() || undefined
        }),
      });

      if (!res.ok) {
        throw new Error("Failed to create lab order");
      }

      toast.success("Lab order created successfully.");
      onLabOrderAdded();
      onClose();
    } catch (error) {
      toast.error("Failed to create lab order.");
    } finally {
      setIsSubmitting(false);
      setTestName("");
      setTests("");
      setNotes("");
    }
  };

  return (
    <Dialog open={isOpen} onOpenChange={onClose}>
      <DialogContent className="dark:bg-slate-900/80">
        <DialogHeader>
          <DialogTitle>{t('addLabOrderModal.title')}</DialogTitle>
        </DialogHeader>
        <form onSubmit={handleSubmit}>
          <div className="grid gap-4 py-4">
            <div className="grid grid-cols-4 items-center gap-4">
              <Label htmlFor="testName" className="text-right">
                {t('addLabOrderModal.testName')}
              </Label>
              <Input
                id="testName"
                value={testName}
                onChange={(e) => setTestName(e.target.value)}
                className="col-span-3"
                placeholder={t('addLabOrderModal.testNamePlaceholder')}
              />
            </div>
            <div className="grid grid-cols-4 items-center gap-4">
              <Label htmlFor="tests" className="text-right">
                {t('addLabOrderModal.tests')}
              </Label>
              <Input
                id="tests"
                value={tests}
                onChange={(e) => setTests(e.target.value)}
                className="col-span-3"
                placeholder={t('addLabOrderModal.testsPlaceholder')}
              />
            </div>
            <div className="grid grid-cols-4 items-start gap-4">
              <Label htmlFor="notes" className="text-right pt-2">
                {t('addLabOrderModal.notes')}
              </Label>
              <Textarea
                id="notes"
                value={notes}
                onChange={(e) => setNotes(e.target.value)}
                className="col-span-3 resize-none"
                placeholder={t('addLabOrderModal.notesPlaceholder')}
                rows={3}
              />
            </div>
          </div>
          <DialogFooter>
            <Button type="button" variant="outline" onClick={onClose}>{t('addLabOrderModal.cancel')}</Button>
            <Button type="submit" disabled={isSubmitting || !testName.trim() || !tests.trim()}>
              {isSubmitting ? t('addLabOrderModal.submitting') : t('addLabOrderModal.submit')}
            </Button>
          </DialogFooter>
        </form>
      </DialogContent>
    </Dialog>
  );
};