"use client";

import { useState, useEffect } from 'react';
import { Patient } from "@/types/patient";
import PatientSearch from "../../../components/patients/PatientSearch";
import PatientDetail from "../../../components/patients/PatientDetail";
import AddPatientModal from "../../../components/patients/AddPatientModal";
import { Toaster, toast } from 'sonner';
import { Search, UserPlus } from 'lucide-react';
import { Button } from '@/components/ui/button';

export default function PatientsPage() {
  const [selectedPatient, setSelectedPatient] = useState<Patient | null>(null);
  const [isClient, setIsClient] = useState(false);

  useEffect(() => {
    setIsClient(true);
  }, []);

  const handlePatientSelect = (patient: Patient) => {
    setSelectedPatient(patient);
  };

  const handlePatientAdded = (newPatient: Patient) => {
    setSelectedPatient(newPatient);
  };

  return (
    <div className="h-full flex flex-col bg-gray-50 dark:bg-gray-900 text-gray-900 dark:text-white">
      <Toaster richColors position="top-right" />
      <header className="p-4 border-b border-gray-200 dark:border-gray-800 flex justify-between items-center">
        <h1 className="text-2xl font-bold">Patient Management</h1>
        <AddPatientModal onPatientAdded={handlePatientAdded}>
          <Button className='cursor-pointer'>
            <UserPlus className="mr-2 h-4 w-4" />
            Add Patient
          </Button>
        </AddPatientModal>
      </header>
      <div className="flex-1 flex overflow-hidden">
        <aside className="hidden md:block w-1/3 border-r border-gray-200 dark:border-gray-800 p-4 overflow-y-auto">
          <div className="mb-4">
            {isClient && (
              <PatientSearch 
                onSelectPatient={handlePatientSelect} 
              />
            )}
          </div>
        </aside>
        <main className="flex-1 p-6 overflow-y-auto">
          {selectedPatient ? (
            <PatientDetail patient={selectedPatient} />
          ) : (
            <div className="flex flex-col items-center justify-center h-full text-center text-gray-500 dark:text-gray-400">
              <Search className="h-16 w-16 mb-4 text-gray-300 dark:text-gray-600" />
              <h2 className="text-xl font-semibold">No Patient Selected</h2>
              <p className="mt-2 max-w-md">Search for a patient to view their details, or create a new patient record.</p>
            </div>
          )}
        </main>
      </div>
    </div>
  );
}