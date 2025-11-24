"use client";

import { FC, useEffect, useState } from 'react';

interface MedicalSummaryProps {
  patientId: string;
}

const MedicalSummary: FC<MedicalSummaryProps> = ({ patientId }) => {
  const [summary, setSummary] = useState<any>(null);
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    const fetchSummary = async () => {
      try {
        const response = await fetch(`/api/patients/${patientId}/medical-summary`);
        if (response.ok) {
          const data = await response.json();
          setSummary(data);
        }
      } catch (error) {
        console.error("Failed to fetch medical summary", error);
      } finally {
        setLoading(false);
      }
    };

    fetchSummary();
  }, [patientId]);

  if (loading) {
    return <div>Loading medical summary...</div>;
  }

  if (!summary) {
    return <div>No medical summary available.</div>;
  }

  return (
    <div className="mt-8">
      <h2 className="text-xl font-semibold text-gray-900 dark:text-white">Medical Summary</h2>
      <div className="mt-4 space-y-4">
        <div>
          <h3 className="text-lg font-medium text-gray-900 dark:text-white">Latest Vitals</h3>
          {summary.summary.latestVitals ? (
            <ul className="mt-2 space-y-2 text-sm text-gray-600 dark:text-gray-400">
              <li><strong>Heart Rate:</strong> {summary.summary.latestVitals.heartRate} bpm</li>
              <li><strong>Blood Pressure:</strong> {summary.summary.latestVitals.bloodPressure}</li>
              <li><strong>Temperature:</strong> {summary.summary.latestVitals.temperature}°C</li>
              <li><strong>Oxygen Saturation:</strong> {summary.summary.latestVitals.oxygenSaturation}%</li>
            </ul>
          ) : (
            <p>No vitals recorded.</p>
          )}
        </div>
        <div>
          <h3 className="text-lg font-medium text-gray-900 dark:text-white">Active Medications</h3>
          {summary.summary.activeMedications.length > 0 ? (
            <ul className="mt-2 space-y-2 text-sm text-gray-600 dark:text-gray-400">
              {summary.summary.activeMedications.map((med: any) => (
                <li key={med._id}>{med.name} - {med.dosage} {med.frequency}</li>
              ))}
            </ul>
          ) : (
            <p>No active medications.</p>
          )}
        </div>
        <div>
          <h3 className="text-lg font-medium text-gray-900 dark:text-white">Primary Diagnosis</h3>
          {summary.summary.primaryDiagnosis ? (
            <p className="mt-2 text-sm text-gray-600 dark:text-gray-400">
              {summary.summary.primaryDiagnosis.icd10Code.description} ({summary.summary.primaryDiagnosis.icd10Code.code})
            </p>
          ) : (
            <p>No primary diagnosis.</p>
          )}
        </div>
      </div>
    </div>
  );
};

export default MedicalSummary;