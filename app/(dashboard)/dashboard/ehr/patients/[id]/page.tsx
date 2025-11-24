"use client";

import { useEffect, useState } from 'react';
import { useParams, useRouter } from 'next/navigation';
import PatientDetail from '@/app/(dashboard)/components/patients/PatientDetail';
import LabOrdersDisplay from '@/app/(dashboard)/components/patients/LabOrdersDisplay';
import HistoricalLabResultsPage from './lab-results/page';
import { Patient } from '@/types/patient';
import { Loader2, ArrowLeft } from 'lucide-react';
import { Button } from '@/components/ui/button';
import { Tabs, TabsContent, TabsList, TabsTrigger } from "@/components/ui/tabs"

export default function PatientPage() {
  const params = useParams();
  const router = useRouter();
  const id = params?.id as string;
  const [patient, setPatient] = useState<Patient | null>(null);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState<string | null>(null);

  useEffect(() => {
    async function fetchPatient() {
      if (!id) {
        setError('Patient ID not found');
        setLoading(false);
        return;
      }

      try {
        const response = await fetch(`/api/patients/${id}`);
        if (!response.ok) {
          if (response.status === 401) {
            setError('Unauthorized access');
          } else if (response.status === 404) {
            setError('Patient not found');
          } else {
            setError('Failed to load patient');
          }
          setLoading(false);
          return;
        }

        const patientData = await response.json() as Patient;
        setPatient(patientData);
      } catch (error) {
        console.error('Failed to fetch patient:', error);
        setError('Failed to load patient');
      } finally {
        setLoading(false);
      }
    }

    fetchPatient();
  }, [id]);

  if (loading) {
    return (
      <div className="h-full flex flex-col bg-gray-50 dark:bg-gray-900 text-gray-900 dark:text-white">
        <div className="flex items-center justify-center flex-1">
          <div className="flex items-center space-x-2">
            <Loader2 className="h-6 w-6 animate-spin" />
            <span>Loading patient details...</span>
          </div>
        </div>
      </div>
    );
  }

  if (error) {
    return (
      <div className="h-full flex flex-col bg-gray-50 dark:bg-gray-900 text-gray-900 dark:text-white">
        <header className="p-2 lg:p-4 border-b border-gray-200 dark:border-gray-800">
          <Button
            variant="ghost"
            size="sm"
            onClick={() => router.back()}
            className="flex items-center space-x-2"
          >
            <ArrowLeft className="h-4 w-4" />
            <span>Back</span>
          </Button>
        </header>
        <div className="flex items-center justify-center flex-1">
          <div className="text-center">
            <h1 className="text-2xl font-bold text-red-600 mb-2">Error</h1>
            <p className="text-gray-600 dark:text-gray-400">{error}</p>
          </div>
        </div>
      </div>
    );
  }

  if (!patient) {
    return (
      <div className="h-full flex flex-col bg-gray-50 dark:bg-gray-900 text-gray-900 dark:text-white">
        <header className="p-2 lg:p-4 border-b border-gray-200 dark:border-gray-800">
          <Button
            variant="ghost"
            size="sm"
            onClick={() => router.back()}
            className="flex items-center space-x-2"
          >
            <ArrowLeft className="h-4 w-4" />
            <span>Back</span>
          </Button>
        </header>
        <div className="flex items-center justify-center flex-1">
          <div className="text-center">
            <h1 className="text-2xl font-bold text-gray-600 dark:text-gray-400 mb-2">Patient Not Found</h1>
            <p className="text-gray-600 dark:text-gray-400">The requested patient could not be found.</p>
          </div>
        </div>
      </div>
    );
  }

  return (
    <div className="h-full flex flex-col bg-gray-50 dark:bg-gray-900 text-gray-900 dark:text-white">
      {/* Header */}
      <header className="p-2 lg:p-4 border-b border-gray-200 dark:border-gray-800 flex justify-between items-center">
        <div className="flex items-center space-x-2">
          <Button
            variant="ghost"
            size="sm"
            onClick={() => router.back()}
            className="flex items-center space-x-2"
          >
            <ArrowLeft className="h-4 w-4" />
            <span className="hidden sm:inline">Back to Patients</span>
          </Button>
        </div>
        <h1 className="text-lg sm:text-2xl font-bold truncate">
          {patient.firstName} {patient.lastName}
        </h1>
        <div className="w-20 sm:w-32"></div> {/* Spacer for centering */}
      </header>

      {/* Main Content */}
      <main className="flex-1 overflow-y-auto p-2 sm:p-4 lg:p-6">
        <div className="max-w-280 mx-auto">
          <PatientDetail patient={patient} />
          {/* <Tabs defaultValue="lab-orders" className="w-full mt-8">
            <TabsList>
              <TabsTrigger value="lab-orders">Lab Orders</TabsTrigger>
              <TabsTrigger value="lab-results">Lab Results</TabsTrigger>
            </TabsList>
            <TabsContent value="lab-orders">
              <LabOrdersDisplay patientId={id} />
            </TabsContent>
            <TabsContent value="lab-results">
              <HistoricalLabResultsPage />
            </TabsContent>
          </Tabs> */}
        </div>
      </main>
    </div>
  );
}