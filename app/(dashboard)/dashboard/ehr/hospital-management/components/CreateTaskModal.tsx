"use client";

import { useState, useEffect } from "react";
import { Button } from "@/components/ui/button";
import { Dialog, DialogContent, DialogHeader, DialogTitle, DialogTrigger } from "@/components/ui/dialog";
import { Input } from "@/components/ui/input";
import { Textarea } from "@/components/ui/textarea";
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from "@/components/ui/select";
import { Label } from "@/components/ui/label";
import { toast } from "sonner";
import { Loader } from "@/components/ui/Loader";
import { ClipboardList } from "lucide-react";
import { useSession } from 'next-auth/react';
import { useLanguage } from '@/contexts/LanguageContext';
import { dashboardTranslations } from '@/lib/dashboard-translations';

interface Patient {
  _id: string;
  firstName: string;
  lastName: string;
  mrn: string;
  ward?: { _id: string; name: string } | string;
  department?: { _id: string; name: string } | string;
  assignedNurse?: {
    _id: string;
    fullName: string;
  };
}

interface Nurse {
  _id: string;
  fullName: string;
  department?: { _id: string; name: string } | string;
  ward?: { _id: string; name: string } | string;
}

interface CreateTaskModalProps {
  onTaskCreated: () => void;
  children: React.ReactNode;
}

const CreateTaskModal = ({ onTaskCreated, children }: CreateTaskModalProps) => {
  const { data: session } = useSession();
  const { language } = useLanguage();
  const t = (key: string) => {
    const keys = key.split('.');
    let value: any = dashboardTranslations[language as keyof typeof dashboardTranslations];
    for (const k of keys) {
      value = value?.[k];
    }
    return value || key;
  };
  const [open, setOpen] = useState(false);
  const [loading, setLoading] = useState(false);
  const [patients, setPatients] = useState<Patient[]>([]);
  const [nurses, setNurses] = useState<Nurse[]>([]);
  const [fetching, setFetching] = useState(true);

  const [formData, setFormData] = useState({
    patientId: '',
    assignedTo: '',
    title: '',
    description: '',
    type: 'custom',
    priority: 'medium',
    dueTime: ''
  } as {
    patientId: string;
    assignedTo: string;
    title: string;
    description: string;
    type: string;
    priority: string;
    dueTime: string;
  });

  useEffect(() => {
    if (open) {
      fetchData();
    }
  }, [open]);

  const fetchData = async () => {
    setFetching(true);
    try {
      const [patientsRes, nursesRes] = await Promise.all([
        fetch('/api/patients?limit=100'),
        fetch('/api/users?role=nurse&role=matron_nurse')
      ]);

      if (patientsRes.ok) {
        const patientsData: Patient[] = await patientsRes.json();
        setPatients(patientsData);
      }

      if (nursesRes.ok) {
        const nursesData: Nurse[] = await nursesRes.json();
        setNurses(nursesData);
      }
    } catch (error) {
      console.error('Failed to fetch data:', error);
      toast.error(error instanceof Error ? error.message : t('createTaskModal.loading'));
    } finally {
      setFetching(false);
    }
  };

  const handleCreateTask = async () => {
    if (!session?.user?.role?.includes('matron') && !session?.user?.role?.includes('admin')) {
      toast.error(t('createTaskModal.insufficientPermissions'));
      return;
    }

    if (!formData.patientId || !formData.assignedTo || !formData.title) {
      toast.error(t('createTaskModal.fillRequiredFields'));
      return;
    }

    const selectedPatient = patients.find(p => p._id === formData.patientId);
    const selectedNurse = nurses.find(n => n._id === formData.assignedTo);

    if (selectedPatient && selectedNurse) {
      const patientDept = typeof selectedPatient.department === 'object' ? selectedPatient.department._id : selectedPatient.department;
      const nurseDept = typeof selectedNurse.department === 'object' ? selectedNurse.department._id : selectedNurse.department;
      const patientWard = typeof selectedPatient.ward === 'object' ? selectedPatient.ward._id : selectedPatient.ward;
      const nurseWard = typeof selectedNurse.ward === 'object' ? selectedNurse.ward._id : selectedNurse.ward;

      const canAssign = (patientDept && nurseDept && patientDept === nurseDept) ||
                        (patientWard && nurseWard && patientWard === nurseWard) ||
                        !patientDept;

      if (!canAssign) {
        toast.error(t('createTaskModal.assignPermissionError'));
        return;
      }
    }

    setLoading(true);
    try {
      const taskData = {
        ...formData,
        dueTime: formData.dueTime ? new Date(formData.dueTime).toISOString() : new Date(Date.now() + 60 * 60 * 1000).toISOString(),
        createdBy: session.user.id
      };

      const response = await fetch('/api/tasks', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify(taskData)
      });

      if (response.ok) {
        toast.success(t('createTaskModal.success'));
        onTaskCreated();
        setOpen(false);
        resetForm();
      } else {
        toast.error(t('createTaskModal.failed'));
      }
    } catch (error) {
      console.error('Failed to create task:', error);
      toast.error(error instanceof Error ? error.message : t('createTaskModal.failed'));
    } finally {
      setLoading(false);
    }
  };

  const resetForm = () => {
    setFormData({
      patientId: '',
      assignedTo: '',
      title: '',
      description: '',
      type: 'custom',
      priority: 'medium',
      dueTime: ''
    });
  };

  const handlePatientChange = (patientId: string) => {
    setFormData(prev => ({ ...prev, patientId }));

    const patient = patients.find(p => p._id === patientId);
    if (patient?.assignedNurse?._id) {
      setFormData(prev => ({ ...prev, assignedTo: patient?.assignedNurse?._id || prev.assignedTo }));
    }
  };

  const availableNurses = nurses.filter(nurse => {
    if (!formData.patientId) return true;
    const patient = patients.find(p => p._id === formData.patientId);
    if (!patient) return false;

    const patientDept = typeof patient.department === 'object' ? patient.department._id : patient.department;
    const nurseDept = typeof nurse.department === 'object' ? nurse.department._id : nurse.department;
    const patientWard = typeof patient.ward === 'object' ? patient.ward._id : patient.ward;
    const nurseWard = typeof nurse.ward === 'object' ? nurse.ward._id : nurse.ward;

    return (
      (patientDept && nurseDept && patientDept === nurseDept) ||
      (patientWard && nurseWard && patientWard === nurseWard) ||
      !patient.department
    );
  });

  return (
    <Dialog open={open} onOpenChange={setOpen}>
      <DialogTrigger asChild>
        {children}
      </DialogTrigger>
      <DialogContent className="max-w-2xl p-0 overflow-hidden">
        <DialogHeader className="border-b px-6 py-4">
          <DialogTitle className="flex items-center gap-2 text-lg font-medium">
            <ClipboardList className="h-5 w-5 text-primary" />
            {t('createTaskModal.title')}
          </DialogTitle>
        </DialogHeader>

        <div className="p-6 pt-4 max-h-[70vh] overflow-y-auto">
          {fetching ? (
            <div className="flex flex-col items-center justify-center py-12">
              <Loader />
              <p className="text-sm text-muted-foreground mt-3">{t('createTaskModal.loading')}</p>
            </div>
          ) : (
            <div className="space-y-5">
              <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                <div className="space-y-2">
                  <Label htmlFor="patient">{t('createTaskModal.patient')} <span className="text-red-600">*</span></Label>
                  <Select value={formData.patientId} onValueChange={handlePatientChange}>
                    <SelectTrigger id="patient">
                      <SelectValue placeholder={t('createTaskModal.selectPatient')} />
                    </SelectTrigger>
                    <SelectContent>
                      {patients.map((patient) => (
                        <SelectItem key={patient._id} value={patient._id}>
                          {patient.firstName} {patient.lastName} (MRN: {patient.mrn})
                        </SelectItem>
                      ))}
                    </SelectContent>
                  </Select>
                </div>

                <div className="space-y-2">
                  <Label htmlFor="assignedTo">{t('createTaskModal.assignTo')} <span className="text-red-600">*</span></Label>
                  <Select value={formData.assignedTo} onValueChange={(value) => setFormData(prev => ({ ...prev, assignedTo: value }))}>
                    <SelectTrigger id="assignedTo">
                      <SelectValue placeholder={t('createTaskModal.selectNurse')} />
                    </SelectTrigger>
                    <SelectContent>
                      {availableNurses.map((nurse) => (
                        <SelectItem key={nurse._id} value={nurse._id}>
                          {nurse.fullName}
                        </SelectItem>
                      ))}
                    </SelectContent>
                  </Select>
                </div>
              </div>

              <div className="space-y-2">
                <Label htmlFor="title">{t('createTaskModal.taskTitle')} <span className="text-red-600">*</span></Label>
                <Input
                  id="title"
                  value={formData.title}
                  onChange={(e) => setFormData(prev => ({ ...prev, title: e.target.value }))}
                  placeholder={t('createTaskModal.taskTitlePlaceholder')}
                />
              </div>

              <div className="space-y-2">
                <Label htmlFor="description">{t('createTaskModal.description')}</Label>
                <Textarea
                  id="description"
                  value={formData.description}
                  onChange={(e) => setFormData(prev => ({ ...prev, description: e.target.value }))}
                  placeholder={t('createTaskModal.descriptionPlaceholder')}
                  rows={3}
                />
              </div>

              <div className="grid grid-cols-1 md:grid-cols-3 gap-4">
                <div className="space-y-2">
                  <Label htmlFor="type">{t('createTaskModal.taskType')}</Label>
                  <Select value={formData.type} onValueChange={(value) => setFormData(prev => ({ ...prev, type: value }))}>
                    <SelectTrigger id="type">
                      <SelectValue />
                    </SelectTrigger>
                    <SelectContent>
                      <SelectItem value="assessment">{t('createTaskModal.taskTypes.assessment')}</SelectItem>
                      <SelectItem value="medication">{t('createTaskModal.taskTypes.medication')}</SelectItem>
                      <SelectItem value="vital_check">{t('createTaskModal.taskTypes.vital_check')}</SelectItem>
                      <SelectItem value="documentation">{t('createTaskModal.taskTypes.documentation')}</SelectItem>
                      <SelectItem value="custom">{t('createTaskModal.taskTypes.custom')}</SelectItem>
                    </SelectContent>
                  </Select>
                </div>

                <div className="space-y-2">
                  <Label htmlFor="priority">{t('createTaskModal.priority')}</Label>
                  <Select value={formData.priority} onValueChange={(value) => setFormData(prev => ({ ...prev, priority: value }))}>
                    <SelectTrigger id="priority">
                      <SelectValue />
                    </SelectTrigger>
                    <SelectContent>
                      <SelectItem value="low">{t('createTaskModal.priorities.low')}</SelectItem>
                      <SelectItem value="medium">{t('createTaskModal.priorities.medium')}</SelectItem>
                      <SelectItem value="high">{t('createTaskModal.priorities.high')}</SelectItem>
                      <SelectItem value="urgent">{t('createTaskModal.priorities.urgent')}</SelectItem>
                    </SelectContent>
                  </Select>
                </div>

                <div className="space-y-2">
                  <Label htmlFor="dueTime">{t('createTaskModal.dueDateTime')}</Label>
                  <Input
                    id="dueTime"
                    type="datetime-local"
                    value={formData.dueTime}
                    onChange={(e) => setFormData(prev => ({ ...prev, dueTime: e.target.value }))}
                  />
                </div>
              </div>

              <div className="flex justify-end gap-3 pt-5 border-t">
                <Button variant="outline" onClick={() => setOpen(false)} disabled={loading}>
                  {t('createTaskModal.cancel')}
                </Button>
                <Button onClick={handleCreateTask} disabled={loading}>
                  {loading ? t('createTaskModal.creating') : t('createTaskModal.createTask')}
                </Button>
              </div>
            </div>
          )}
        </div>
      </DialogContent>
    </Dialog>
  );
};

export default CreateTaskModal;