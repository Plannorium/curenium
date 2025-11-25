"use client";

import { useState } from 'react';
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

const PRESCRIPTION_TYPES = [
  { value: 'medication', label: 'Medication', icon: Pill },
  { value: 'treatment', label: 'Treatment', icon: Activity },
  { value: 'procedure', label: 'Procedure', icon: Stethoscope },
  { value: 'therapy', label: 'Therapy', icon: Syringe },
  { value: 'device', label: 'Medical Device', icon: Activity },
  { value: 'other', label: 'Other', icon: Activity },
];

const DOSAGE_FORMS = [
  'Tablet', 'Capsule', 'Syrup', 'Injection', 'Cream', 'Ointment', 'Suppository',
  'Inhaler', 'Nebulizer', 'Drops', 'Spray', 'Patch', 'Gel', 'Lotion'
];

const ROUTES = [
  'Oral', 'Intravenous', 'Intramuscular', 'Subcutaneous', 'Topical', 'Inhaled',
  'Rectal', 'Vaginal', 'Ophthalmic', 'Otic', 'Nasal', 'Sublingual', 'Buccal'
];

const FREQUENCIES = [
  'Once daily', 'Twice daily', 'Three times daily', 'Four times daily',
  'Every 4 hours', 'Every 6 hours', 'Every 8 hours', 'Every 12 hours',
  'As needed', 'Before meals', 'After meals', 'At bedtime', 'Weekly', 'Monthly'
];

const DURATION_UNITS = [
  { value: 'days', label: 'Days' },
  { value: 'weeks', label: 'Weeks' },
  { value: 'months', label: 'Months' }
];

export function AddPrescriptionModal({ patientId, isOpen, onClose, onPrescriptionAdded }: AddPrescriptionModalProps) {
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
      <DialogContent className="sm:max-w-4xl max-h-[90vh] overflow-y-auto bg-white/90 dark:bg-gray-950/90 backdrop-blur-lg border border-gray-200/50 dark:border-gray-800/50 shadow-2xl">
        <DialogHeader className="pb-4">
          <div className="flex items-center space-x-3 mb-2">
            <div className="p-2 bg-blue-100 dark:bg-blue-900/20 rounded-lg shadow-lg">
              <Pill className="h-5 w-5 text-blue-600 dark:text-blue-400" />
            </div>
            <DialogTitle className="text-xl font-bold bg-linear-to-r from-gray-900 via-gray-800 to-gray-900 dark:from-white dark:via-gray-100 dark:to-white bg-clip-text text-transparent">
              Professional Prescription
            </DialogTitle>
          </div>
        </DialogHeader>

        <div className="space-y-6">
          {/* Prescription Items */}
          <div className="space-y-4">
            <div className="flex items-center justify-between">
              <Label className="text-lg font-semibold">Prescription Items</Label>
              <Button
                type="button"
                variant="outline"
                size="sm"
                onClick={addPrescriptionItem}
                className="flex items-center space-x-2"
              >
                <Plus className="h-4 w-4" />
                <span>Add Item</span>
              </Button>
            </div>

            {prescriptionItems.map((item, index) => (
              <Card key={item.id} className="border border-gray-200/50 dark:border-gray-800/50">
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
                      <Label>Type</Label>
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
                      <Label>Name</Label>
                      <Input
                        placeholder={`Enter ${item.type} name`}
                        value={item.name}
                        onChange={(e) => updatePrescriptionItem(item.id, { name: e.target.value })}
                        className="w-full"
                      />
                    </div>
                  </div>

                  {item.type === 'medication' && (
                    <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-4 gap-4">
                      <div className="space-y-2">
                        <Label className="text-red-500">Strength/Dose *</Label>
                        <Input
                          placeholder="e.g., 500mg"
                          value={item.strength || ''}
                          onChange={(e) => updatePrescriptionItem(item.id, { strength: e.target.value })}
                          className="w-full"
                          required
                        />
                      </div>

                      <div className="space-y-2">
                        <Label>Form</Label>
                        <Select
                          value={item.form || ''}
                          onValueChange={(value) => updatePrescriptionItem(item.id, { form: value })}
                        >
                          <SelectTrigger className="w-full">
                            <SelectValue placeholder="Select form" />
                          </SelectTrigger>
                          <SelectContent>
                            {DOSAGE_FORMS.map(form => (
                              <SelectItem key={form} value={form}>{form}</SelectItem>
                            ))}
                          </SelectContent>
                        </Select>
                      </div>

                      <div className="space-y-2">
                        <Label className="text-red-500">Route *</Label>
                        <Select
                          value={item.route || ''}
                          onValueChange={(value) => updatePrescriptionItem(item.id, { route: value })}
                        >
                          <SelectTrigger className="w-full">
                            <SelectValue placeholder="Select route" />
                          </SelectTrigger>
                          <SelectContent>
                            {ROUTES.map(route => (
                              <SelectItem key={route} value={route}>{route}</SelectItem>
                            ))}
                          </SelectContent>
                        </Select>
                      </div>

                      <div className="space-y-2">
                        <Label className="text-red-500">Frequency *</Label>
                        <Select
                          value={item.frequency || ''}
                          onValueChange={(value) => updatePrescriptionItem(item.id, { frequency: value })}
                        >
                          <SelectTrigger className="w-full">
                            <SelectValue placeholder="Select frequency" />
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
                      <Label>Duration</Label>
                      <div className="flex space-x-2">
                        <Input
                          type="number"
                          placeholder="Duration"
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
                      <Label>Quantity</Label>
                      <Input
                        type="number"
                        placeholder="Quantity"
                        value={item.quantity || ''}
                        onChange={(e) => updatePrescriptionItem(item.id, { quantity: parseInt(e.target.value) || undefined })}
                        className="w-full"
                      />
                    </div>

                    <div className="space-y-2">
                      <Label>Refills</Label>
                      <Input
                        type="number"
                        placeholder="Refills"
                        value={item.refills || ''}
                        onChange={(e) => updatePrescriptionItem(item.id, { refills: parseInt(e.target.value) || undefined })}
                        className="w-full"
                      />
                    </div>
                  </div>

                  <div className="space-y-2">
                    <Label>Specific Instructions</Label>
                    <Textarea
                      placeholder="Enter specific instructions for this prescription item..."
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
          <Card className="border border-gray-200/50 dark:border-gray-800/50">
            <CardHeader>
              <CardTitle className="flex items-center text-lg">
                <Calendar className="h-5 w-5 mr-2 text-primary" />
                Prescription Details
              </CardTitle>
            </CardHeader>
            <CardContent className="space-y-4">
              <div className="flex flex-col sm:flex-row sm:items-center sm:justify-center space-y-2 sm:space-y-0 sm:space-x-4 mb-4">
                <Label className="sm:mb-0">Calendar Type:</Label>
                <div className="flex items-center space-x-2">
                  <Button
                    type="button"
                    variant={calendarType === 'gregorian' ? 'default' : 'outline'}
                    size="sm"
                    onClick={() => setCalendarType('gregorian')}
                    className="flex-1 sm:flex-initial"
                  >
                    Gregorian (AD)
                  </Button>
                  <Button
                    type="button"
                    variant={calendarType === 'hijri' ? 'default' : 'outline'}
                    size="sm"
                    onClick={() => setCalendarType('hijri')}
                    className="flex-1 sm:flex-initial"
                  >
                    Hijri (AH)
                  </Button>
                </div>
              </div>
              <div className="grid grid-cols-1 lg:grid-cols-2 gap-6">
                <div className="space-y-2">
                  <Label>Start Date</Label>
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
                  <Label>End Date (Optional)</Label>
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
              <Label className="text-red-500">Reason for Prescription *</Label>
              <Textarea
                placeholder="Enter the medical reason for this prescription..."
                value={reasonForPrescription}
                onChange={(e) => setReasonForPrescription(e.target.value)}
                rows={3}
                required
                className="w-full resize-none"
              />
            </div>

            <div className="space-y-2">
              <Label>Additional Notes</Label>
              <Textarea
                placeholder="Any additional notes or special instructions..."
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
            {prescriptionItems.filter(item => item.name.trim()).length} prescription item(s) ready
          </div>
          <div className="flex flex-col sm:flex-row space-y-2 sm:space-y-0 sm:space-x-2 w-full sm:w-auto">
            <Button variant="outline" onClick={onClose} disabled={isSubmitting} className="w-full sm:w-auto">
              Cancel
            </Button>
            <Button
              onClick={handleSubmit}
              disabled={isSubmitting || !reasonForPrescription.trim()}
              className="bg-linear-to-r from-blue-600 to-blue-700 hover:from-blue-700 hover:to-blue-800 w-full sm:w-auto"
            >
              {isSubmitting ? (
                <>
                  <Clock className="h-4 w-4 mr-2 animate-spin" />
                  Creating...
                </>
              ) : (
                <>
                  <Pill className="h-4 w-4 mr-2" />
                  <span className="hidden sm:inline">Create Prescription</span>
                  <span className="sm:hidden">Create</span>
                </>
              )}
            </Button>
          </div>
        </DialogFooter>
      </DialogContent>
    </Dialog>
  );
}