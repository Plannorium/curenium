'use client';
import React, { useState } from 'react';
import { Button } from '@/components/ui/button';
import {
  Dialog,
  DialogContent,
  DialogHeader,
  DialogTitle,
  DialogTrigger,
} from '@/components/ui/dialog';
import PatientForm from './PatientForm';
import { Plus, Loader2 } from 'lucide-react';
import { Patient } from '@/types/patient';
import { PatientFormData } from './PatientForm';
import { toast } from 'sonner';

interface AddPatientModalProps {
  onPatientAdded: (patient: Patient) => void;
  children: React.ReactNode;
}

const AddPatientModal: React.FC<AddPatientModalProps> = ({ onPatientAdded, children }) => {
  const [isOpen, setIsOpen] = useState(false);
  const [isSubmitting, setIsSubmitting] = useState(false);

  const handlePatientSubmit = async (data: PatientFormData) => {
    setIsSubmitting(true);
    try {
      const res = await fetch('/api/patients', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify(data),
      });

      if (res.ok) {
        const newPatient: Patient = await res.json();
        onPatientAdded(newPatient);
        setIsOpen(false);
        toast.success('Patient created successfully!');
      } else {
        toast.error('Failed to create patient.');
      }
    } catch (error) {
      console.error('Failed to add patient:', error);
      toast.error('An unexpected error occurred.');
    } finally {
      setIsSubmitting(false);
    }
  };

  return (
    <Dialog open={isOpen} onOpenChange={setIsOpen}>
      <DialogTrigger asChild>{children}</DialogTrigger>
      <DialogContent className="bg-white/80 dark:bg-gray-950/80 backdrop-blur-lg w-full max-w-md md:max-w-lg lg:max-w-2xl p-0 border-2 border-gray-200/50 dark:border-gray-800/50 shadow-2xl rounded-2xl overflow-y-auto max-h-[90vh]">
        <DialogHeader className="p-4 md:p-6 pb-4 border-b border-gray-200/50 dark:border-gray-800/50">
          <DialogTitle className="text-xl md:text-2xl font-bold text-gray-900 dark:text-gray-50 flex items-center">
            <div className="flex items-center justify-center w-8 h-8 md:w-10 md:h-10 rounded-lg bg-gradient-to-br from-blue-500 to-blue-600 shadow-lg mr-3 md:mr-4">
              <Plus className="h-5 w-5 md:h-6 md:w-6 text-white" />
            </div>
            Add New Patient
          </DialogTitle>
        </DialogHeader>
        <div className="p-6">
          <PatientForm onSubmit={handlePatientSubmit} isSubmitting={isSubmitting} />
        </div>
      </DialogContent>
    </Dialog>
  );
};

export default AddPatientModal;