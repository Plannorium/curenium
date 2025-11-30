"use client";
import React, { useState, useEffect } from "react";
import { Avatar, AvatarFallback, AvatarImage } from "@/components/ui/avatar";
import { Button } from "@/components/ui/button";
import {
  Dialog,
  DialogContent,
  DialogHeader,
  DialogTitle,
  DialogTrigger,
  DialogFooter,
} from "@/components/ui/dialog";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import { Textarea } from "@/components/ui/textarea";
import {
  Select,
  SelectContent,
  SelectItem,
  SelectTrigger,
  SelectValue,
} from "@/components/ui/select";
import { Checkbox } from "@/components/ui/checkbox";
import { Plus, Calendar, User, AlertTriangle, Clock, FileText, Loader2, Building, Bed } from "lucide-react";
import { toast } from "sonner";
import { useLanguage } from '@/contexts/LanguageContext';
import { dashboardTranslations } from '@/lib/dashboard-translations';

interface Patient {
  _id: string;
  firstName: string;
  lastName: string;
  mrn?: string;
  dob?: string;
  gender?: string;
}

interface Department {
  _id: string;
  name: string;
}

interface Ward {
  _id: string;
  name: string;
  wardNumber: string;
  department: string;
  totalBeds: number;
  occupiedBeds: number;
}

interface AddAdmissionModalProps {
  onAdmissionAdded: () => void;
  children: React.ReactNode;
}

// specialRequirements moved to translations

const AddAdmissionModal: React.FC<AddAdmissionModalProps> = React.memo(
  ({ onAdmissionAdded, children }) => {
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
    const [patients, setPatients] = useState<Patient[]>([]);
    const [departments, setDepartments] = useState<Department[]>([]);
    const [wards, setWards] = useState<Ward[]>([]);
    const [selectedPatient, setSelectedPatient] = useState("");
    const [selectedDepartment, setSelectedDepartment] = useState("");
    const [selectedWard, setSelectedWard] = useState("");
    const [reason, setReason] = useState("");
    const [urgency, setUrgency] = useState<'routine' | 'urgent' | 'emergency'>('routine');
    const [estimatedStay, setEstimatedStay] = useState("");
    const [selectedRequirements, setSelectedRequirements] = useState<string[]>([]);
    const [doctorNotes, setDoctorNotes] = useState("");
    const [isLoading, setIsLoading] = useState(false);
    const [isSubmitting, setIsSubmitting] = useState(false);
    const [departmentsLoading, setDepartmentsLoading] = useState(false);
    const [wardsLoading, setWardsLoading] = useState(false);

    useEffect(() => {
      const fetchData = async () => {
        setIsLoading(true);
        setDepartmentsLoading(true);
        try {
          const [patientsRes, departmentsRes] = await Promise.all([
            fetch("/api/patients"),
            fetch("/api/departments")
          ]);
  
          if (patientsRes.ok) {
            const patientsData: Patient[] = await patientsRes.json();
            setPatients(patientsData || []);
          }
  
          if (departmentsRes.ok) {
            const departmentsData: Department[] = await departmentsRes.json();
            setDepartments(departmentsData || []);
          }
        } catch (error) {
          console.error("Failed to fetch data:", error);
        } finally {
          setIsLoading(false);
          setDepartmentsLoading(false);
        }
      };
      if (isOpen) {
        fetchData();
      }
    }, [isOpen]);
  
    // Fetch wards when department is selected
    useEffect(() => {
      const fetchWards = async () => {
        if (!selectedDepartment) {
          setWards([]);
          return;
        }
  
        setWardsLoading(true);
        try {
          const wardsRes = await fetch(`/api/wards?department=${selectedDepartment}`);
          if (wardsRes.ok) {
            const wardsData: Ward[] = await wardsRes.json();
            setWards(wardsData || []);
          }
        } catch (error) {
          console.error("Failed to fetch wards:", error);
          setWards([]);
        } finally {
          setWardsLoading(false);
        }
      };
  
      if (selectedDepartment) {
        fetchWards();
      } else {
        setWards([]);
        setWardsLoading(false);
      }
    }, [selectedDepartment]);
  
    // Wards are now fetched filtered by department, so no additional filtering needed
    const filteredWards = wards;

    const handleSubmit = async () => {
      if (!selectedPatient || !reason.trim() || !urgency || !selectedDepartment || !selectedWard) return;

      setIsSubmitting(true);
      try {
        const res = await fetch("/api/admissions", {
          method: "POST",
          headers: { "Content-Type": "application/json" },
          body: JSON.stringify({
            patientId: selectedPatient,
            reason: reason.trim(),
            urgency,
            estimatedStay: estimatedStay ? parseInt(estimatedStay) : undefined,
            specialRequirements: selectedRequirements.length > 0 ? selectedRequirements : undefined,
            doctorNotes: doctorNotes.trim() || undefined,
            departmentId: selectedDepartment,
            wardId: selectedWard,
          }),
        });

        if (res.ok) {
          onAdmissionAdded();
          setIsOpen(false);
          // Reset form
          setSelectedPatient("");
          setSelectedDepartment("");
          setSelectedWard("");
          setReason("");
          setUrgency('routine');
          setEstimatedStay("");
          setSelectedRequirements([]);
          setDoctorNotes("");
          toast.success(t('addAdmissionModal.success.submitted'));
        } else {
          const error = await res.json() as { message?: string };
          toast.error(error.message || t('addAdmissionModal.errors.failedToSubmit'));
        }
      } catch (error) {
        console.error("Failed to submit admission:", error);
        toast.error(t('addAdmissionModal.errors.errorSubmitting'));
      } finally {
        setIsSubmitting(false);
      }
    };

    const isFormValid = selectedPatient && reason.trim() && urgency && selectedDepartment && selectedWard;

    const handleRequirementToggle = (requirement: string) => {
      setSelectedRequirements(prev =>
        prev.includes(requirement)
          ? prev.filter(r => r !== requirement)
          : [...prev, requirement]
      );
    };

    return (
      <Dialog open={isOpen} onOpenChange={setIsOpen}>
        <DialogTrigger asChild>{children}</DialogTrigger>
        <DialogContent className="bg-white/80 dark:bg-gray-950/80 backdrop-blur-lg max-w-md sm:max-w-lg lg:mx-4 p-0 max-h-[90vh] overflow-y-auto">
          <DialogHeader className="p-4 md:p-6 pb-3 md:pb-4">
            <DialogTitle className="text-lg md:text-xl font-bold text-gray-800 dark:text-gray-100 flex items-center">
              <div className="flex items-center justify-center w-8 h-8 md:w-9 md:h-9 rounded-lg bg-blue-500/10 border border-blue-500/20 mr-2 md:mr-3">
                <Calendar className="h-4 w-4 md:h-5 md:w-5 text-blue-500 dark:text-blue-400" />
              </div>
              <span className="text-sm md:text-base">{t('addAdmissionModal.title')}</span>
            </DialogTitle>
          </DialogHeader>

          <div className="px-4 md:px-6 pb-4 md:pb-6 space-y-4 md:space-y-5">
            <div className="space-y-2">
              <Label
                htmlFor="patient"
                className="text-sm font-semibold text-gray-700 dark:text-gray-300 flex items-center"
              >
                <User className="h-4 w-4 mr-2 text-gray-500 dark:text-gray-400" />
                {t('addAdmissionModal.labels.selectPatient')}
              </Label>
              <Select value={selectedPatient} onValueChange={setSelectedPatient} disabled={isLoading}>
                <SelectTrigger className="w-full bg-gray-50/80 dark:bg-gray-900/80 border-gray-300/70 dark:border-gray-700/60">
                  <SelectValue
                    placeholder={
                      isLoading ? t('addAdmissionModal.labels.loadingPatients') : t('addAdmissionModal.labels.selectPatientPlaceholder')
                    }
                  />
                </SelectTrigger>
                <SelectContent className="bg-white dark:bg-gray-950 max-h-60">
                  {patients.map((patient) => (
                    <SelectItem key={patient._id} value={patient._id}>
                      <div className="flex items-center gap-3">
                        <Avatar className="h-6 w-6">
                          <AvatarFallback className="text-xs">
                            {patient.firstName[0]}{patient.lastName[0]}
                          </AvatarFallback>
                        </Avatar>
                        <div className="flex flex-col">
                          <span>{patient.firstName} {patient.lastName}</span>
                          {patient.mrn && (
                            <span className="text-xs text-muted-foreground">MRN: {patient.mrn}</span>
                          )}
                        </div>
                      </div>
                    </SelectItem>
                  ))}
                </SelectContent>
              </Select>
            </div>

            <div className="space-y-2">
              <Label
                htmlFor="reason"
                className="text-sm font-semibold text-gray-700 dark:text-gray-300 flex items-center"
              >
                <FileText className="h-4 w-4 mr-2 text-gray-500 dark:text-gray-400" />
                {t('addAdmissionModal.labels.reasonForAdmission')}
              </Label>
              <Textarea
                id="reason"
                value={reason}
                onChange={(e) => setReason(e.target.value)}
                placeholder={t('addAdmissionModal.labels.reasonPlaceholder')}
                className="bg-gray-50/80 dark:bg-gray-900/80 border-gray-300/70 dark:border-gray-700/60 min-h-20"
                required
              />
            </div>

            <div className="space-y-2">
              <Label
                htmlFor="urgency"
                className="text-sm font-semibold text-gray-700 dark:text-gray-300 flex items-center"
              >
                <AlertTriangle className="h-4 w-4 mr-2 text-gray-500 dark:text-gray-400" />
                {t('addAdmissionModal.labels.urgencyLevel')}
              </Label>
              <Select value={urgency} onValueChange={(value: 'routine' | 'urgent' | 'emergency') => setUrgency(value)}>
                <SelectTrigger className="w-full bg-gray-50/80 dark:bg-gray-900/80 border-gray-300/70 dark:border-gray-700/60">
                  <SelectValue placeholder={t('addAdmissionModal.labels.urgencyLevelPlaceholder')} />
                </SelectTrigger>
                <SelectContent className="bg-white dark:bg-gray-950">
                  <SelectItem value="routine">
                    <div className="flex items-center gap-2">
                      <div className="w-2 h-2 bg-green-500 rounded-full"></div>
                      {t('addAdmissionModal.urgencyLevels.routine')}
                    </div>
                  </SelectItem>
                  <SelectItem value="urgent">
                    <div className="flex items-center gap-2">
                      <div className="w-2 h-2 bg-orange-500 rounded-full"></div>
                      {t('addAdmissionModal.urgencyLevels.urgent')}
                    </div>
                  </SelectItem>
                  <SelectItem value="emergency">
                    <div className="flex items-center gap-2">
                      <div className="w-2 h-2 bg-red-500 rounded-full"></div>
                      {t('addAdmissionModal.urgencyLevels.emergency')}
                    </div>
                  </SelectItem>
                </SelectContent>
              </Select>
            </div>

            <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
              <div className="space-y-2">
                <Label
                  htmlFor="department"
                  className="text-sm font-semibold text-gray-700 dark:text-gray-300 flex items-center"
                >
                  <Building className="h-4 w-4 mr-2 text-gray-500 dark:text-gray-400" />
                  {t('addAdmissionModal.labels.department')}
                </Label>
                <Select value={selectedDepartment} onValueChange={(value) => {
                  setSelectedDepartment(value);
                  setSelectedWard(""); // Reset ward when department changes
                }} disabled={departmentsLoading}>
                  <SelectTrigger className="w-full bg-gray-50/80 dark:bg-gray-900/80 border-gray-300/70 dark:border-gray-700/60">
                    <SelectValue placeholder={departmentsLoading ? "Loading departments..." : "Select department"} />
                  </SelectTrigger>
                  <SelectContent className="bg-white dark:bg-gray-950">
                    {departments.map((dept) => (
                      <SelectItem key={dept._id} value={dept._id}>
                        {dept.name}
                      </SelectItem>
                    ))}
                  </SelectContent>
                </Select>
              </div>

              <div className="space-y-2">
                <Label
                  htmlFor="ward"
                  className="text-sm font-semibold text-gray-700 dark:text-gray-300 flex items-center"
                >
                  <Bed className="h-4 w-4 mr-2 text-gray-500 dark:text-gray-400" />
                  Ward *
                </Label>
                <Select value={selectedWard} onValueChange={setSelectedWard} disabled={!selectedDepartment || wardsLoading}>
                  <SelectTrigger className="w-full bg-gray-50/80 dark:bg-gray-900/80 border-gray-300/70 dark:border-gray-700/60">
                    <SelectValue placeholder={
                      !selectedDepartment
                        ? "Select department first"
                        : wardsLoading
                          ? "Loading wards..."
                          : "Select ward"
                    } />
                  </SelectTrigger>
                  <SelectContent className="bg-white dark:bg-gray-950">
                    {filteredWards.map((ward) => (
                      <SelectItem key={ward._id} value={ward._id}>
                        {t('addAdmissionModal.wardDisplayText')
                          .replace('{name}', ward.name)
                          .replace('{number}', ward.wardNumber.toString())
                          .replace('{available}', (ward.totalBeds - ward.occupiedBeds).toString())}
                      </SelectItem>
                    ))}
                  </SelectContent>
                </Select>
              </div>
            </div>

            <div className="space-y-2">
              <Label
                htmlFor="estimatedStay"
                className="text-sm font-semibold text-gray-700 dark:text-gray-300 flex items-center"
              >
                <Clock className="h-4 w-4 mr-2 text-gray-500 dark:text-gray-400" />
                {t('addAdmissionModal.labels.estimatedStay')}
              </Label>
              <Input
                id="estimatedStay"
                type="number"
                min="1"
                max="365"
                value={estimatedStay}
                onChange={(e) => setEstimatedStay(e.target.value)}
                placeholder={t('addAdmissionModal.labels.estimatedStayPlaceholder')}
                className="bg-gray-50/80 dark:bg-gray-900/80 border-gray-300/70 dark:border-gray-700/60"
              />
            </div>

            <div className="space-y-3">
              <Label className="text-sm font-semibold text-gray-700 dark:text-gray-300">
                {t('addAdmissionModal.labels.specialRequirements')}
              </Label>
              <div className="grid grid-cols-1 sm:grid-cols-2 gap-2">
                {t('addAdmissionModal.specialRequirements').map((requirement: string) => (
                  <div key={requirement} className="flex items-center space-x-2">
                    <Checkbox
                      id={requirement}
                      checked={selectedRequirements.includes(requirement)}
                      onCheckedChange={() => handleRequirementToggle(requirement)}
                    />
                    <Label
                      htmlFor={requirement}
                      className="text-sm font-normal cursor-pointer"
                    >
                      {requirement}
                    </Label>
                  </div>
                ))}
              </div>
            </div>

            <div className="space-y-2">
              <Label
                htmlFor="doctorNotes"
                className="text-sm font-semibold text-gray-700 dark:text-gray-300 flex items-center"
              >
                <FileText className="h-4 w-4 mr-2 text-gray-500 dark:text-gray-400" />
                {t('addAdmissionModal.labels.doctorNotes')}
              </Label>
              <Textarea
                id="doctorNotes"
                value={doctorNotes}
                onChange={(e) => setDoctorNotes(e.target.value)}
                placeholder={t('addAdmissionModal.labels.doctorNotesPlaceholder')}
                className="bg-gray-50/80 dark:bg-gray-900/80 border-gray-300/70 dark:border-gray-700/60 min-h-16"
              />
            </div>
          </div>

          <DialogFooter className="px-4 md:px-6 py-3 md:py-4 bg-gray-50 dark:bg-gray-900/70 border-t border-gray-200 dark:border-gray-800/60 flex flex-col sm:flex-row gap-2 sm:gap-0">
            <Button
              variant="ghost"
              onClick={() => setIsOpen(false)}
              disabled={isSubmitting}
              className="w-full sm:w-auto order-2 sm:order-1"
            >
              {t('addAdmissionModal.buttons.cancel')}
            </Button>
            <Button
              onClick={handleSubmit}
              disabled={!isFormValid || isSubmitting}
              className="bg-blue-500 hover:bg-blue-600 dark:bg-blue-600 dark:hover:bg-blue-700 text-white shadow-lg hover:shadow-xl transition-all duration-300 disabled:opacity-50 w-full sm:w-auto order-1 sm:order-2"
            >
              {isSubmitting ? (
                <>
                  <Loader2 className="h-4 w-4 mr-2 animate-spin" /> {t('addAdmissionModal.buttons.submitting')}
                </>
              ) : (
                <>
                  <Plus className="h-4 w-4 mr-2" />
                  {t('addAdmissionModal.buttons.requestAdmission')}
                </>
              )}
            </Button>
          </DialogFooter>
        </DialogContent>
      </Dialog>
    );
  }
);

AddAdmissionModal.displayName = "AddAdmissionModal";

export default AddAdmissionModal;