"use client";

import { useState, useEffect } from 'react';
import { Patient } from "@/types/patient";
import PatientSearch from "../../../components/patients/PatientSearch";
import PatientDetail from "../../../components/patients/PatientDetail";
import AddPatientModal from "../../../components/patients/AddPatientModal";
import { Toaster, toast } from 'sonner';
import { useSearchParams } from 'next/navigation';
import { Search, UserPlus, X } from 'lucide-react';
import { Button } from '@/components/ui/button';

export default function PatientsPage() {
  const [selectedPatient, setSelectedPatient] = useState<Patient | null>(null);
  const [isClient, setIsClient] = useState(false);
  const [isSearchVisible, setIsSearchVisible] = useState(false);
  const searchParams = useSearchParams();

  useEffect(() => {
    setIsClient(true);
    const patientId = searchParams?.get('patient_id');
    if (patientId) {
      // Fetch patient data based on patientId
      const fetchPatient = async () => {
        try {
          const response = await fetch(`/api/patients/${patientId}`);
          if (response.ok) {
            const patientData: Patient = await response.json();
            setSelectedPatient(patientData);
          } else {
            toast.error('Failed to fetch patient data.');
          }
        } catch (error) {
          toast.error('An error occurred while fetching patient data.');
        }
      };
      fetchPatient();
    }
  }, [searchParams]);

  const handlePatientSelect = (patient: Patient) => {
    setSelectedPatient(patient);
  };

  const handlePatientAdded = (newPatient: Patient) => {
    setSelectedPatient(newPatient);
  };

  const toggleSearch = () => {
    setIsSearchVisible(!isSearchVisible);
  };

  return (
    <div className="h-full flex flex-col bg-gray-50 dark:bg-gray-900 text-gray-900 dark:text-white">
      <Toaster richColors position="top-right" />
      <header className="p-2 lg:p-4 border-b border-gray-200 dark:border-gray-800 flex justify-between items-center">
        <div className="flex items-center space-x-2">
          <div className="md:hidden">
            <Button variant="ghost" size="icon" onClick={toggleSearch}>
              <Search className="h-5 w-5" />
            </Button>
          </div>
        </div>
        <h1 className="text-lg sm:text-2xl font-bold">Patient Management</h1>
          <AddPatientModal onPatientAdded={handlePatientAdded}>
            <Button className='cursor-pointer text-sm md:text-base'>
              <UserPlus className="mr-2 h-4 w-4" />
            <span className='hidden md:block'>
              Add Patient
              </span>
          </Button>
        </AddPatientModal>
      </header>

      {isSearchVisible && (
        <div className="md:hidden p-4 border-b border-gray-200 dark:border-gray-800">
          {isClient && (
            <PatientSearch 
              onSelectPatient={(patient) => {
                handlePatientSelect(patient);
                setIsSearchVisible(false);
              }}
            />
          )}
        </div>
      )}

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
        <main className="flex-1 p-2 sm:p-6 overflow-y-auto">
          {selectedPatient ? (
            <PatientDetail patient={selectedPatient} />
          ) : (
            <div className="flex flex-col items-center justify-center h-full text-center text-gray-500 dark:text-gray-400">
              <Search className="h-12 w-12 sm:h-16 sm:w-16 mb-4 text-gray-300 dark:text-gray-600" />
              <h2 className="text-lg sm:text-xl font-semibold">No Patient Selected</h2>
              <p className="mt-2 max-w-md text-sm sm:text-base">Search for a patient to view their details, or create a new patient record.</p>
            </div>
          )}
        </main>
      </div>
    </div>
  );
}