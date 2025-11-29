"use client";

import { useState, useMemo } from 'react';
import { Button } from "@/components/ui/button";
import { Dialog, DialogContent, DialogHeader, DialogTitle, DialogFooter } from "@/components/ui/dialog";
import { Input } from "@/components/ui/input";
import { Textarea } from "@/components/ui/textarea";
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from "@/components/ui/select";
import { Label } from "@/components/ui/label";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { Badge } from "@/components/ui/badge";
import { Checkbox } from "@/components/ui/checkbox";
import { Tabs, TabsContent, TabsList, TabsTrigger } from "@/components/ui/tabs";
import { Plus, X, Pill, Activity, Stethoscope, Syringe, Clock, Calendar, ChevronDown, ChevronUp } from 'lucide-react';
import { toast } from 'sonner';
import { useSession } from 'next-auth/react';
import HijriCalendar from '@/components/ui/hijri-calendar';
import { useCalendar } from '@/components/ui/calendar-context';
import { useLanguage } from "@/contexts/LanguageContext";
import { dashboardTranslations } from "@/lib/dashboard-translations";

interface PrescriptionItem {
  id: string;
  type: 'medication' | 'treatment' | 'procedure' | 'therapy' | 'device' | 'other';
  name: string;
  dose?: string;
  strength?: string;
  form?: string;
  route?: string;
  frequency?: string;
  duration?: number;
  durationUnit?: 'days' | 'weeks' | 'months';
  instructions?: string;
  quantity?: number;
  refills?: number;
  collapsed?: boolean;
}

interface AddPrescriptionModalProps {
  patientId: string;
  isOpen: boolean;
  onClose: () => void;
  onPrescriptionAdded: () => void;
}

export function AddPrescriptionModal({ patientId, isOpen, onClose, onPrescriptionAdded }: AddPrescriptionModalProps) {
  const { language } = useLanguage();
  const { data: session } = useSession();
  const { calendarType, setCalendarType } = useCalendar();
  const [prescriptionItems, setPrescriptionItems] = useState<PrescriptionItem[]>([
    { id: '1', type: 'medication', name: '', collapsed: false }
  ]);
  const [startDate, setStartDate] = useState<Date | undefined>();
  const [endDate, setEndDate] = useState<Date | undefined>();
  const [reasonForPrescription, setReasonForPrescription] = useState('');
  const [additionalNotes, setAdditionalNotes] = useState('');
  const [isSubmitting, setIsSubmitting] = useState(false);

  const t = useMemo(() => {
    return (key: string) => {
      const keys = key.split('.');
      let value: any = dashboardTranslations[language as keyof typeof dashboardTranslations];
      for (const k of keys) {
        value = value?.[k];
      }
      return value || key;
    };
  }, [language]);

  const PRESCRIPTION_TYPES = useMemo(() => [
    { value: 'medication', label: t('addPrescriptionModal.prescriptionTypes.medication'), icon: Pill },
    { value: 'treatment', label: t('addPrescriptionModal.prescriptionTypes.treatment'), icon: Activity },
    { value: 'procedure', label: t('addPrescriptionModal.prescriptionTypes.procedure'), icon: Stethoscope },
    { value: 'therapy', label: t('addPrescriptionModal.prescriptionTypes.therapy'), icon: Syringe },
    { value: 'device', label: t('addPrescriptionModal.prescriptionTypes.device'), icon: Activity },
    { value: 'other', label: t('addPrescriptionModal.prescriptionTypes.other'), icon: Activity },
  ], [t]);

  const DOSAGE_FORMS = useMemo(() => [
    t('addPrescriptionModal.dosageForms.tablet'), t('addPrescriptionModal.dosageForms.capsule'), t('addPrescriptionModal.dosageForms.syrup'), t('addPrescriptionModal.dosageForms.injection'), t('addPrescriptionModal.dosageForms.cream'), t('addPrescriptionModal.dosageForms.ointment'), t('addPrescriptionModal.dosageForms.suppository'),
    t('addPrescriptionModal.dosageForms.inhaler'), t('addPrescriptionModal.dosageForms.nebulizer'), t('addPrescriptionModal.dosageForms.drops'), t('addPrescriptionModal.dosageForms.spray'), t('addPrescriptionModal.dosageForms.patch'), t('addPrescriptionModal.dosageForms.gel'), t('addPrescriptionModal.dosageForms.lotion')
  ], [t]);

  const ROUTES = useMemo(() => [
    t('addPrescriptionModal.routes.oral'), t('addPrescriptionModal.routes.intravenous'), t('addPrescriptionModal.routes.intramuscular'), t('addPrescriptionModal.routes.subcutaneous'), t('addPrescriptionModal.routes.topical'), t('addPrescriptionModal.routes.inhaled'),
    t('addPrescriptionModal.routes.rectal'), t('addPrescriptionModal.routes.vaginal'), t('addPrescriptionModal.routes.ophthalmic'), t('addPrescriptionModal.routes.otic'), t('addPrescriptionModal.routes.nasal'), t('addPrescriptionModal.routes.sublingual'), t('addPrescriptionModal.routes.buccal')
  ], [t]);

  const FREQUENCIES = useMemo(() => [
    t('addPrescriptionModal.frequencies.onceDaily'), t('addPrescriptionModal.frequencies.twiceDaily'), t('addPrescriptionModal.frequencies.threeTimesDaily'), t('addPrescriptionModal.frequencies.fourTimesDaily'),
    t('addPrescriptionModal.frequencies.every4Hours'), t('addPrescriptionModal.frequencies.every6Hours'), t('addPrescriptionModal.frequencies.every8Hours'), t('addPrescriptionModal.frequencies.every12Hours'),
    t('addPrescriptionModal.frequencies.asNeeded'), t('addPrescriptionModal.frequencies.beforeMeals'), t('addPrescriptionModal.frequencies.afterMeals'), t('addPrescriptionModal.frequencies.atBedtime'), t('addPrescriptionModal.frequencies.weekly'), t('addPrescriptionModal.frequencies.monthly')
  ], [t]);

  const DURATION_UNITS = useMemo(() => [
    { value: 'days', label: t('addPrescriptionModal.durationUnits.days') },
    { value: 'weeks', label: t('addPrescriptionModal.durationUnits.weeks') },
    { value: 'months', label: t('addPrescriptionModal.durationUnits.months') }
  ], [t]);

  const addPrescriptionItem = () => {
    const newItem: PrescriptionItem = {
      id: Date.now().toString(),
      type: 'medication',
      name: '',
      collapsed: false
    };
    setPrescriptionItems([...prescriptionItems, newItem]);
  };

  const toggleItemCollapse = (id: string) => {
    setPrescriptionItems(prescriptionItems.map(item =>
      item.id === id ? { ...item, collapsed: !item.collapsed } : item
    ));
  };

  const removePrescriptionItem = (id: string) => {
    setPrescriptionItems(prescriptionItems.filter(item => item.id !== id));
  };

  const updatePrescriptionItem = (id: string, updates: Partial<PrescriptionItem>) => {
    setPrescriptionItems(prescriptionItems.map(item =>
      item.id === id ? { ...item, ...updates } : item
    ));
  };

  const handleSubmit = async () => {
    // Validate that at least one prescription item has required fields
    const validItems = prescriptionItems.filter(item => {
      if (!item.name.trim()) return false;

      if (item.type === 'medication') {
        // For medications, ensure required model fields can be populated
        return item.strength && item.frequency && item.route;
      }

      // For other types, just need name
      return true;
    });

    if (validItems.length === 0) {
      toast.error('Please complete all prescription items. Medications require: name, strength, frequency, and route.');
      return;
    }

    if (!reasonForPrescription.trim()) {
      toast.error('Reason for prescription is required');
      return;
    }

    setIsSubmitting(true);

    try {
      // Create prescriptions for each valid item
      const prescriptionPromises = validItems.map(async (item) => {
        const prescriptionData: any = {
          patientId,
          prescribedBy: session?.user?.id,
          reasonForPrescription,
          notes: additionalNotes,
          startDate,
          endDate,
        };

        // Handle different prescription types - map to required model fields
        if (item.type === 'medication') {
          prescriptionData.medication = item.name;
          prescriptionData.dose = item.strength || 'Not specified';
          prescriptionData.frequency = item.frequency || 'As directed';
          prescriptionData.route = item.route || 'Oral';
          prescriptionData.durationDays = item.duration && item.durationUnit === 'days' ? item.duration : undefined;
          prescriptionData.refills = item.refills;
          prescriptionData.instructions = item.instructions;
        } else {
          // For non-medication prescriptions - provide required fields with defaults
          prescriptionData.medication = `${item.type}: ${item.name}`;
          prescriptionData.dose = item.strength || item.quantity ? `${item.quantity || 'N/A'} units` : 'N/A';
          prescriptionData.frequency = item.frequency || 'As needed';
          prescriptionData.route = item.route || 'As applicable';
          prescriptionData.durationDays = item.duration && item.durationUnit === 'days' ? item.duration : undefined;
          prescriptionData.refills = item.refills;
          prescriptionData.instructions = item.instructions;
        }

        const response = await fetch(`/api/patients/${patientId}/prescriptions`, {
          method: 'POST',
          headers: { 'Content-Type': 'application/json' },
          body: JSON.stringify(prescriptionData),
        });

        if (!response.ok) {
          throw new Error(`Failed to create prescription for ${item.name}`);
        }

        return response.json();
      });

      await Promise.all(prescriptionPromises);

      toast.success('Prescriptions added successfully');
      onPrescriptionAdded();
      onClose();

      // Reset form
      setPrescriptionItems([{ id: '1', type: 'medication', name: '' }]);
      setStartDate(undefined);
      setEndDate(undefined);
      setReasonForPrescription('');
      setAdditionalNotes('');

    } catch (error) {
      console.error('Error creating prescriptions:', error);
      toast.error('Failed to create prescriptions');
    } finally {
      setIsSubmitting(false);
    }
  };

  return (
    <Dialog open={isOpen} onOpenChange={onClose}>
      <DialogContent className="sm:max-w-4xl max-h-[90vh] overflow-y-auto bg-white/90 dark:bg-gray-950/90 backdrop-blur-lg border border-gray-200/50 dark:border-gray-800/50 shadow-2xl outline-none">
        <DialogHeader className="pb-4 p-5">
          <div className="flex items-center space-x-3 mb-2">
            <div className="p-2 bg-blue-100 dark:bg-blue-900/20 rounded-lg shadow-lg">
              <Pill className="h-5 w-5 text-blue-600 dark:text-blue-400" />
            </div>
            <DialogTitle className="text-xl font-bold bg-linear-to-r from-gray-900 via-gray-800 to-gray-900 dark:from-white dark:via-gray-100 dark:to-white bg-clip-text text-transparent">
              {t('addPrescriptionModal.title')}
            </DialogTitle>
          </div>
        </DialogHeader>

        <div className="space-y-6">
          {/* Prescription Items */}
          <div className="space-y-4">
            <div className="flex items-center justify-between">
              <Label className="text-lg font-semibold">{t('addPrescriptionModal.prescriptionItems')}</Label>
              <Button
                type="button"
                variant="outline"
                size="sm"
                onClick={addPrescriptionItem}
                className="flex items-center space-x-2"
              >
                <Plus className="h-4 w-4" />
                <span>{t('addPrescriptionModal.addItem')}</span>
              </Button>
            </div>

            {prescriptionItems.map((item, index) => (
              <Card key={item.id} className="border border-gray-200/50 dark:border-gray-800/50 dark:bg-slate-900/80">
                <CardHeader className="pb-3">
                  <div className="flex items-center justify-between">
                    <div className="flex items-center space-x-3 flex-1 min-w-0">
                      <Badge variant="outline" className="capitalize flex-shrink-0">
                        {PRESCRIPTION_TYPES.find(t => t.value === item.type)?.label || item.type}
                      </Badge>
                      <span className="text-sm text-muted-foreground truncate">
                        {item.name || `Item ${index + 1}`}
                      </span>
                    </div>
                    <div className="flex items-center space-x-1 flex-shrink-0">
                      <Button
                        type="button"
                        variant="ghost"
                        size="sm"
                        onClick={() => toggleItemCollapse(item.id)}
                        className="h-8 w-8 p-0"
                      >
                        {item.collapsed ? (
                          <ChevronDown className="h-4 w-4" />
                        ) : (
                          <ChevronUp className="h-4 w-4" />
                        )}
                      </Button>
                      {prescriptionItems.length > 1 && (
                        <Button
                          type="button"
                          variant="ghost"
                          size="sm"
                          onClick={() => removePrescriptionItem(item.id)}
                          className="text-red-500 hover:text-red-700 h-8 w-8 p-0"
                        >
                          <X className="h-4 w-4" />
                        </Button>
                      )}
                    </div>
                  </div>
                </CardHeader>
                {!item.collapsed && (
                  <CardContent className="space-y-4">
                  <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
                    <div className="space-y-2">
                      <Label>{t('addPrescriptionModal.labels.type')}</Label>
                      <Select
                        value={item.type}
                        onValueChange={(value: any) => updatePrescriptionItem(item.id, { type: value })}
                      >
                        <SelectTrigger className="w-full">
                          <SelectValue />
                        </SelectTrigger>
                        <SelectContent>
                          {PRESCRIPTION_TYPES.map(type => (
                            <SelectItem key={type.value} value={type.value}>
                              <div className="flex items-center space-x-2">
                                <type.icon className="h-4 w-4" />
                                <span>{type.label}</span>
                              </div>
                            </SelectItem>
                          ))}
                        </SelectContent>
                      </Select>
                    </div>

                    <div className="space-y-2">
                      <Label>{t('addPrescriptionModal.labels.name')}</Label>
                      <Input
                        placeholder={t('addPrescriptionModal.placeholders.enterName')}
                        value={item.name}
                        onChange={(e) => updatePrescriptionItem(item.id, { name: e.target.value })}
                        className="w-full"
                      />
                    </div>
                  </div>

                  {item.type === 'medication' && (
                    <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-4 gap-4">
                      <div className="space-y-2">
                        <Label className="text-red-500">{t('addPrescriptionModal.labels.strengthDose')} *</Label>
                        <Input
                          placeholder={t('addPrescriptionModal.placeholders.strengthExample')}
                          value={item.strength || ''}
                          onChange={(e) => updatePrescriptionItem(item.id, { strength: e.target.value })}
                          className="w-full"
                          required
                        />
                      </div>

                      <div className="space-y-2">
                        <Label>{t('addPrescriptionModal.labels.form')}</Label>
                        <Select
                          value={item.form || ''}
                          onValueChange={(value) => updatePrescriptionItem(item.id, { form: value })}
                        >
                          <SelectTrigger className="w-full">
                            <SelectValue placeholder={t('addPrescriptionModal.placeholders.selectForm')} />
                          </SelectTrigger>
                          <SelectContent>
                            {DOSAGE_FORMS.map(form => (
                              <SelectItem key={form} value={form}>{form}</SelectItem>
                            ))}
                          </SelectContent>
                        </Select>
                      </div>

                      <div className="space-y-2">
                        <Label className="text-red-500">{t('addPrescriptionModal.labels.route')} *</Label>
                        <Select
                          value={item.route || ''}
                          onValueChange={(value) => updatePrescriptionItem(item.id, { route: value })}
                        >
                          <SelectTrigger className="w-full">
                            <SelectValue placeholder={t('addPrescriptionModal.placeholders.selectRoute')} />
                          </SelectTrigger>
                          <SelectContent>
                            {ROUTES.map(route => (
                              <SelectItem key={route} value={route}>{route}</SelectItem>
                            ))}
                          </SelectContent>
                        </Select>
                      </div>

                      <div className="space-y-2">
                        <Label className="text-red-500">{t('addPrescriptionModal.labels.frequency')} *</Label>
                        <Select
                          value={item.frequency || ''}
                          onValueChange={(value) => updatePrescriptionItem(item.id, { frequency: value })}
                        >
                          <SelectTrigger className="w-full">
                            <SelectValue placeholder={t('addPrescriptionModal.placeholders.selectFrequency')} />
                          </SelectTrigger>
                          <SelectContent>
                            {FREQUENCIES.map(freq => (
                              <SelectItem key={freq} value={freq}>{freq}</SelectItem>
                            ))}
                          </SelectContent>
                        </Select>
                      </div>
                    </div>
                  )}

                  <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 gap-4">
                    <div className="space-y-2">
                      <Label>{t('addPrescriptionModal.labels.duration')}</Label>
                      <div className="flex space-x-2">
                        <Input
                          type="number"
                          placeholder={t('addPrescriptionModal.placeholders.duration')}
                          value={item.duration || ''}
                          onChange={(e) => updatePrescriptionItem(item.id, { duration: parseInt(e.target.value) || undefined })}
                          className="flex-1"
                        />
                        <Select
                          value={item.durationUnit || 'days'}
                          onValueChange={(value: any) => updatePrescriptionItem(item.id, { durationUnit: value })}
                        >
                          <SelectTrigger className="w-20 sm:w-24">
                            <SelectValue />
                          </SelectTrigger>
                          <SelectContent>
                            {DURATION_UNITS.map(unit => (
                              <SelectItem key={unit.value} value={unit.value}>{unit.label}</SelectItem>
                            ))}
                          </SelectContent>
                        </Select>
                      </div>
                    </div>

                    <div className="space-y-2">
                      <Label>{t('addPrescriptionModal.labels.quantity')}</Label>
                      <Input
                        type="number"
                        placeholder={t('addPrescriptionModal.placeholders.quantity')}
                        value={item.quantity || ''}
                        onChange={(e) => updatePrescriptionItem(item.id, { quantity: parseInt(e.target.value) || undefined })}
                        className="w-full"
                      />
                    </div>

                    <div className="space-y-2">
                      <Label>{t('addPrescriptionModal.labels.refills')}</Label>
                      <Input
                        type="number"
                        placeholder={t('addPrescriptionModal.placeholders.refills')}
                        value={item.refills || ''}
                        onChange={(e) => updatePrescriptionItem(item.id, { refills: parseInt(e.target.value) || undefined })}
                        className="w-full"
                      />
                    </div>
                  </div>

                  <div className="space-y-2">
                    <Label>{t('addPrescriptionModal.labels.specificInstructions')}</Label>
                    <Textarea
                      placeholder={t('addPrescriptionModal.placeholders.specificInstructions')}
                      value={item.instructions || ''}
                      onChange={(e) => updatePrescriptionItem(item.id, { instructions: e.target.value })}
                      rows={2}
                    />
                  </div>
                  </CardContent>
                )}
              </Card>
            ))}
          </div>

          {/* Prescription Details */}
          <Card className="border border-gray-200/50 dark:border-gray-800/50 dark:bg-slate-900/80">
            <CardHeader>
              <CardTitle className="flex items-center text-lg">
                <Calendar className="h-5 w-5 mr-2 text-primary" />
                {t('addPrescriptionModal.prescriptionDetails')}
              </CardTitle>
            </CardHeader>
            <CardContent className="space-y-4">
              <div className="flex flex-col sm:flex-row sm:items-center sm:justify-center space-y-2 sm:space-y-0 sm:space-x-4 mb-4">
                <Label className="sm:mb-0">{t('addPrescriptionModal.calendarType')}:</Label>
                <div className="flex items-center space-x-2">
                  <Button
                    type="button"
                    variant={calendarType === 'gregorian' ? 'default' : 'outline'}
                    size="sm"
                    onClick={() => setCalendarType('gregorian')}
                    className="flex-1 sm:flex-initial"
                  >
                    {t('addPrescriptionModal.gregorian')}
                  </Button>
                  <Button
                    type="button"
                    variant={calendarType === 'hijri' ? 'default' : 'outline'}
                    size="sm"
                    onClick={() => setCalendarType('hijri')}
                    className="flex-1 sm:flex-initial"
                  >
                    {t('addPrescriptionModal.hijri')}
                  </Button>
                </div>
              </div>
              <div className="grid grid-cols-1 lg:grid-cols-2 gap-6">
                <div className="space-y-2">
                  <Label>{t('addPrescriptionModal.startDate')}</Label>
                  <div className="max-h-64 overflow-y-auto">
                    <HijriCalendar
                      selectedDate={startDate}
                      onDateSelect={setStartDate}
                      calendarType={calendarType}
                      onCalendarTypeChange={setCalendarType}
                    />
                  </div>
                </div>

                <div className="space-y-2">
                  <Label>{t('addPrescriptionModal.endDate')}</Label>
                  <div className="max-h-64 overflow-y-auto">
                    <HijriCalendar
                      selectedDate={endDate}
                      onDateSelect={setEndDate}
                      calendarType={calendarType}
                      onCalendarTypeChange={setCalendarType}
                    />
                  </div>
                </div>
              </div>
            </CardContent>
          </Card>

          {/* Reason and Notes */}
          <div className="grid grid-cols-1 lg:grid-cols-2 gap-6">
            <div className="space-y-2">
              <Label className="text-red-500">{t('addPrescriptionModal.reasonForPrescription')} *</Label>
              <Textarea
                placeholder={t('addPrescriptionModal.placeholders.reasonForPrescription')}
                value={reasonForPrescription}
                onChange={(e) => setReasonForPrescription(e.target.value)}
                rows={3}
                required
                className="w-full resize-none"
              />
            </div>

            <div className="space-y-2">
              <Label>{t('addPrescriptionModal.additionalNotes')}</Label>
              <Textarea
                placeholder={t('addPrescriptionModal.placeholders.additionalNotes')}
                value={additionalNotes}
                onChange={(e) => setAdditionalNotes(e.target.value)}
                rows={3}
                className="w-full resize-none"
              />
            </div>
          </div>
        </div>

        <DialogFooter className="flex flex-col sm:flex-row sm:items-center sm:justify-between gap-4">
          <div className="text-sm text-muted-foreground text-center sm:text-left">
            {prescriptionItems.filter(item => item.name.trim()).length} {t('addPrescriptionModal.prescriptionItemsReady')}
          </div>
          <div className="flex flex-col sm:flex-row space-y-2 sm:space-y-0 sm:space-x-2 w-full sm:w-auto">
            <Button variant="outline" onClick={onClose} disabled={isSubmitting} className="w-full sm:w-auto">
              {t('common.cancel')}
            </Button>
            <Button
              onClick={handleSubmit}
              disabled={isSubmitting || !reasonForPrescription.trim()}
              className="bg-linear-to-r from-blue-600 to-blue-700 hover:from-blue-700 hover:to-blue-800 w-full sm:w-auto"
            >
              {isSubmitting ? (
                <>
                  <Clock className="h-4 w-4 mr-2 animate-spin" />
                  {t('addPrescriptionModal.creating')}
                </>
              ) : (
                <>
                  <Pill className="h-4 w-4 mr-2" />
                  <span className="hidden sm:inline">{t('addPrescriptionModal.createPrescription')}</span>
                  <span className="sm:hidden">{t('addPrescriptionModal.create')}</span>
                </>
              )}
            </Button>
          </div>
        </DialogFooter>
      </DialogContent>
    </Dialog>
  );
}