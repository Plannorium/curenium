"use client";

import { FC, useState } from 'react';
import { Button } from '@/components/ui/button';
import { Input } from '@/components/ui/input';

interface VitalsProps {
  patientId: string;
}

const Vitals: FC<VitalsProps> = ({ patientId }) => {
  const [newVitals, setNewVitals] = useState({
    heartRate: '',
    bloodPressure: '',
    temperature: '',
    respiratoryRate: '',
  });

  const handleChange = (e: React.ChangeEvent<HTMLInputElement>) => {
    setNewVitals({ ...newVitals, [e.target.name]: e.target.value });
  };

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    try {
      const response = await fetch(`/api/patients/${patientId}/vitals`, {
        method: 'POST',
        headers: {
          'Content-Type': 'application/json',
        },
        body: JSON.stringify(newVitals),
      });

      if (response.ok) {
        setNewVitals({
          heartRate: '',
          bloodPressure: '',
          temperature: '',
          respiratoryRate: '',
        });
      } else {
        console.error("Failed to save vitals");
      }
    } catch (error) {
      console.error("Failed to save vitals", error);
    }
  };

  return (
    <form onSubmit={handleSubmit} className="space-y-4 mt-8">
      <h2 className="text-xl font-semibold text-gray-900 dark:text-white">Record Vitals</h2>
      <div>
        <label htmlFor="heartRate" className="block text-sm font-medium text-gray-700 dark:text-gray-300">Heart Rate</label>
        <Input
          id="heartRate"
          name="heartRate"
          value={newVitals.heartRate}
          onChange={handleChange}
          className="mt-1 dark:bg-gray-700 dark:text-white"
        />
      </div>
      <div>
        <label htmlFor="bloodPressure" className="block text-sm font-medium text-gray-700 dark:text-gray-300">Blood Pressure</label>
        <Input
          id="bloodPressure"
          name="bloodPressure"
          value={newVitals.bloodPressure}
          onChange={handleChange}
          className="mt-1 dark:bg-gray-700 dark:text-white"
        />
      </div>
      <div>
        <label htmlFor="temperature" className="block text-sm font-medium text-gray-700 dark:text-gray-300">Temperature</label>
        <Input
          id="temperature"
          name="temperature"
          value={newVitals.temperature}
          onChange={handleChange}
          className="mt-1 dark:bg-gray-700 dark:text-white"
        />
      </div>
      <div>
        <label htmlFor="respiratoryRate" className="block text-sm font-medium text-gray-700 dark:text-gray-300">Respiratory Rate</label>
        <Input
          id="respiratoryRate"
          name="respiratoryRate"
          value={newVitals.respiratoryRate}
          onChange={handleChange}
          className="mt-1 dark:bg-gray-700 dark:text-white"
        />
      </div>
      <Button type="submit" className="bg-blue-500 hover:bg-blue-600 text-white">Save Vitals</Button>
    </form>
  );
};

export default Vitals;