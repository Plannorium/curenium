"use client";

import { FC, useState } from 'react';
import { motion } from 'framer-motion';
import { Button } from '@/components/ui/button';
import { Input } from '@/components/ui/input';
import { Textarea } from '@/components/ui/textarea';
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from '@/components/ui/select';
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card';
import { Label } from '@/components/ui/label';
import { Badge } from '@/components/ui/badge';
import { Checkbox } from '@/components/ui/checkbox';
import {
  Dialog,
  DialogContent,
  DialogHeader,
  DialogTitle,
  DialogTrigger,
} from '@/components/ui/dialog';
import HijriCalendar from '@/components/ui/hijri-calendar';
import { useCalendar } from '@/components/ui/calendar-context';
import { Brain, AlertCircle, Calendar, FileText, CheckCircle2, Loader2, Plus } from 'lucide-react';
import { toast } from 'sonner';
import { useLanguage } from '@/contexts/LanguageContext';
import { dashboardTranslations } from '@/lib/dashboard-translations';

interface CreateDiagnosisProps {
  patientId?: string;
  onDiagnosisCreated?: () => void;
  children: React.ReactNode;
}

const CreateDiagnosis: FC<CreateDiagnosisProps> = ({ patientId, onDiagnosisCreated, children }) => {
  const { calendarType, setCalendarType } = useCalendar();
  const { language } = useLanguage();
  const t = (key: string) => {
    const keys = key.split('.');
    let value: any = dashboardTranslations[language as keyof typeof dashboardTranslations];
    for (const k of keys) {
      value = value?.[k];
    }
    return value || key;
  };

  const [isOpen, setIsOpen] = useState(false);
  const [icd10Code, setIcd10Code] = useState('');
  const [description, setDescription] = useState('');
  const [severity, setSeverity] = useState('');
  const [onsetDate, setOnsetDate] = useState<Date | undefined>();
  const [note, setNote] = useState('');
  const [isPrimary, setIsPrimary] = useState(false);
  const [isSubmitting, setIsSubmitting] = useState(false);

  // Form validation
  const isFormValid = icd10Code.trim() && description.trim() && severity;

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();

    // Validation with specific error messages
    if (!icd10Code.trim()) {
      toast.error(t('createDiagnosis.icd10CodeRequired'));
      return;
    }

    if (!description.trim()) {
      toast.error(t('createDiagnosis.diagnosisDescriptionRequired'));
      return;
    }

    if (!severity) {
      toast.error(t('createDiagnosis.severityRequired'));
      return;
    }

    // Validate onsetDate if provided
    if (onsetDate && isNaN(onsetDate.getTime())) {
      toast.error(t('createDiagnosis.invalidOnsetDate'));
      return;
    }

    setIsSubmitting(true);
    try {
      const response = await fetch(`/api/patients/${patientId}/diagnoses`, {
        method: 'POST',
        headers: {
          'Content-Type': 'application/json',
        },
        body: JSON.stringify({
          icd10Code: icd10Code.trim(),
          description: description.trim(),
          severity,
          ...(onsetDate && { onsetDate: onsetDate.toISOString().split('T')[0] }),
          note: note.trim(),
          isPrimary
        }),
      });

      if (response.ok) {
        toast.success(t('createDiagnosis.diagnosisCreated'));
        // Reset form
        setIcd10Code('');
        setDescription('');
        setSeverity('');
        setOnsetDate(undefined);
        setNote('');
        setIsPrimary(false);
        setIsOpen(false);
        onDiagnosisCreated?.();
      } else {
        const errorData: { message?: string } = await response.json();
        toast.error(errorData.message || t('createDiagnosis.failedToCreate'));
      }
    } catch (error) {
      console.error("Failed to create diagnosis", error);
      toast.error(t('createDiagnosis.errorCreating'));
    } finally {
      setIsSubmitting(false);
    }
  };

  const severityOptions = [
    { value: 'mild', label: t('createDiagnosis.severity.mild'), color: 'bg-green-100 text-green-800 dark:bg-green-900/20 dark:text-green-400' },
    { value: 'moderate', label: t('createDiagnosis.severity.moderate'), color: 'bg-yellow-100 text-yellow-800 dark:bg-yellow-900/20 dark:text-yellow-400' },
    { value: 'severe', label: t('createDiagnosis.severity.severe'), color: 'bg-red-100 text-red-800 dark:bg-red-900/20 dark:text-red-400' }
  ];

  return (
    <Dialog open={isOpen} onOpenChange={setIsOpen}>
      <DialogTrigger asChild>
        {children}
      </DialogTrigger>
      <DialogContent className="sm:max-w-2xl max-h-[90vh] overflow-y-auto bg-white/90 dark:bg-gray-950/90 backdrop-blur-lg border border-gray-200/50 dark:border-gray-800/50 shadow-2xl">
        <DialogHeader className="pb-4">
          <div className="flex items-center space-x-3 mb-2">
            <div className="p-2 bg-purple-100 dark:bg-purple-900/20 rounded-lg shadow-lg">
              <Brain className="h-5 w-5 text-purple-600 dark:text-purple-400" />
            </div>
            <DialogTitle className="text-xl font-bold bg-linear-to-r from-gray-900 via-gray-800 to-gray-900 dark:from-white dark:via-gray-100 dark:to-white bg-clip-text text-transparent">
              {t('createDiagnosis.title')}
            </DialogTitle>
          </div>
        </DialogHeader>

        <motion.div
          initial={{ opacity: 0, y: 20 }}
          animate={{ opacity: 1, y: 0 }}
          transition={{ duration: 0.5 }}
          className="space-y-6"
        >
          <form onSubmit={handleSubmit} className="space-y-6">
            <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
              {/* ICD-10 Code */}
              <motion.div
                initial={{ opacity: 0, x: -20 }}
                animate={{ opacity: 1, x: 0 }}
                transition={{ delay: 0.1 }}
                className="space-y-2"
              >
                <Label htmlFor="icd10Code" className="text-sm font-semibold flex items-center">
                  <AlertCircle className="h-4 w-4 mr-2 text-primary" />
                  {t('createDiagnosis.icd10CodeLabel')}
                </Label>
                <Input
                  id="icd10Code"
                  value={icd10Code}
                  onChange={(e) => setIcd10Code(e.target.value.toUpperCase())}
                  placeholder={t('createDiagnosis.icd10CodePlaceholder')}
                  className="h-11 border-2 border-gray-200/50 dark:border-gray-700/50 focus:border-purple-500/50 rounded-lg"
                  required
                />
              </motion.div>

              {/* Severity */}
              <motion.div
                initial={{ opacity: 0, x: 20 }}
                animate={{ opacity: 1, x: 0 }}
                transition={{ delay: 0.2 }}
                className="space-y-2"
              >
                <Label htmlFor="severity" className="text-sm font-semibold flex items-center">
                  <AlertCircle className="h-4 w-4 mr-2 text-primary" />
                  {t('createDiagnosis.severityLabel')}
                </Label>
                <Select onValueChange={setSeverity} value={severity}>
                  <SelectTrigger className="h-11 border-2 border-gray-200/50 dark:border-gray-700/50 focus:border-purple-500/50 rounded-lg">
                    <SelectValue placeholder={t('createDiagnosis.selectSeverityPlaceholder')} />
                  </SelectTrigger>
                  <SelectContent>
                    {severityOptions.map((option) => (
                      <SelectItem key={option.value} value={option.value}>
                        <div className="flex items-center space-x-2">
                          <Badge className={option.color}>{option.label}</Badge>
                        </div>
                      </SelectItem>
                    ))}
                  </SelectContent>
                </Select>
              </motion.div>
            </div>

            {/* Description */}
            <motion.div
              initial={{ opacity: 0, y: 20 }}
              animate={{ opacity: 1, y: 0 }}
              transition={{ delay: 0.3 }}
              className="space-y-2"
            >
              <Label htmlFor="description" className="text-sm font-semibold flex items-center">
                <FileText className="h-4 w-4 mr-2 text-primary" />
                {t('createDiagnosis.diagnosisDescriptionLabel')}
              </Label>
              <Textarea
                id="description"
                value={description}
                onChange={(e) => setDescription(e.target.value)}
                placeholder={t('createDiagnosis.diagnosisDescriptionPlaceholder')}
                className="min-h-[100px] border-2 border-gray-200/50 dark:border-gray-700/50 focus:border-purple-500/50 rounded-lg resize-none"
                required
              />
            </motion.div>

            <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
              {/* Onset Date */}
              <motion.div
                initial={{ opacity: 0, x: -20 }}
                animate={{ opacity: 1, x: 0 }}
                transition={{ delay: 0.4 }}
                className="space-y-2"
              >
                <Label className="text-sm font-semibold flex items-center">
                  <Calendar className="h-4 w-4 mr-2 text-primary" />
                  {t('createDiagnosis.onsetDateLabel')}
                </Label>
                <div className="space-y-2'[PLo[p">
                  <HijriCalendar
                    selectedDate={onsetDate}
                    onDateSelect={setOnsetDate}
                    calendarType={calendarType}
                    onCalendarTypeChange={setCalendarType}
                  />
                </div>
              </motion.div>

              {/* Primary Diagnosis Checkbox */}
              <motion.div
                initial={{ opacity: 0, x: 20 }}
                animate={{ opacity: 1, x: 0 }}
                transition={{ delay: 0.5 }}
                className="flex items-center space-x-2 pt-8"
              >
                <Checkbox
                  id="isPrimary"
                  checked={isPrimary}
                  onCheckedChange={(checked) => setIsPrimary(checked as boolean)}
                  className="data-[state=checked]:bg-purple-600 data-[state=checked]:border-purple-600"
                />
                <Label htmlFor="isPrimary" className="text-sm font-semibold cursor-pointer">
                  {t('createDiagnosis.markAsPrimaryDiagnosis')}
                </Label>
              </motion.div>
            </div>

            {/* Clinical Notes */}
            <motion.div
              initial={{ opacity: 0, y: 20 }}
              animate={{ opacity: 1, y: 0 }}
              transition={{ delay: 0.6 }}
              className="space-y-2"
            >
              <Label htmlFor="note" className="text-sm font-semibold flex items-center">
                <FileText className="h-4 w-4 mr-2 text-primary" />
                {t('createDiagnosis.clinicalNotesLabel')}
              </Label>
              <Textarea
                id="note"
                value={note}
                onChange={(e) => setNote(e.target.value)}
                placeholder={t('createDiagnosis.clinicalNotesPlaceholder')}
                className="min-h-[120px] border-2 border-gray-200/50 dark:border-gray-700/50 focus:border-purple-500/50 rounded-lg resize-none"
              />
            </motion.div>

            {/* Submit Button */}
            <motion.div
              initial={{ opacity: 0, y: 20 }}
              animate={{ opacity: 1, y: 0 }}
              transition={{ delay: 0.7 }}
              className="flex justify-end pt-4"
            >
              <Button
                type="submit"
                disabled={isSubmitting || !isFormValid}
                className="px-8 py-3 bg-linear-to-r from-purple-600 to-purple-700 hover:from-purple-700 hover:to-purple-800 text-white font-semibold rounded-lg shadow-lg hover:shadow-xl transition-all duration-300 hover:scale-105 disabled:opacity-50 disabled:cursor-not-allowed disabled:hover:scale-100"
              >
                {isSubmitting ? (
                  <>
                    <Loader2 className="h-5 w-5 mr-2 animate-spin" />
                    {t('createDiagnosis.creatingDiagnosis')}
                  </>
                ) : (
                  <>
                    <CheckCircle2 className="h-5 w-5 mr-2" />
                    {t('createDiagnosis.createDiagnosis')}
                  </>
                )}
              </Button>
            </motion.div>
          </form>
        </motion.div>
      </DialogContent>
    </Dialog>
  );
};

export default CreateDiagnosis;