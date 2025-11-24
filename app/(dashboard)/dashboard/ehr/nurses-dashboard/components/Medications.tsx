"use client";

import { FC, useState, useEffect } from 'react';
import { Button } from '@/components/ui/button';
import { Input } from '@/components/ui/input';
import { Textarea } from '@/components/ui/textarea';

interface Medication {
  _id: string;
  name: string;
  dosage: string;
  frequency: string;
  status: string;
}

interface MedicationsProps {
  patientId: string;
}

const Medications: FC<MedicationsProps> = ({ patientId }) => {
  const [medications, setMedications] = useState<Medication[]>([]);
  const [newMedication, setNewMedication] = useState({
    name: '',
    dosage: '',
    frequency: '',
    status: 'active',
  });

  useEffect(() => {
    const fetchMedications = async () => {
      try {
        const response = await fetch(`/api/patients/${patientId}/medications`);
        if (response.ok) {
          const data = await response.json();
          setMedications(data as Medication[]);
        }
      } catch (error) {
        console.error("Failed to fetch medications", error);
      }
    };

    fetchMedications();
  }, [patientId]);

  const handleInputChange = (e: React.ChangeEvent<HTMLInputElement | HTMLTextAreaElement>) => {
    const { name, value } = e.target;
    setNewMedication((prev) => ({ ...prev, [name]: value }));
  };

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    try {
      const response = await fetch(`/api/patients/${patientId}/medications`, {
        method: 'POST',
        headers: {
          'Content-Type': 'application/json',
        },
        body: JSON.stringify(newMedication),
      });

      if (response.ok) {
        const data = await response.json();
        setMedications([data as Medication, ...medications]);
        setNewMedication({
          name: '',
          dosage: '',
          frequency: '',
          status: 'active',
        });
      }
    } catch (error) {
      console.error("Failed to save medication", error);
    }
  };

  return (
    <div className="mt-8">
      <form onSubmit={handleSubmit} className="space-y-4">
        <h2 className="text-xl font-semibold text-gray-900 dark:text-white">Add Medication</h2>
        <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
          <Input name="name" value={newMedication.name} onChange={handleInputChange} placeholder="Name" />
          <Input name="dosage" value={newMedication.dosage} onChange={handleInputChange} placeholder="Dosage" />
          <Input name="frequency" value={newMedication.frequency} onChange={handleInputChange} placeholder="Frequency" />
        </div>
        <Button type="submit" className="bg-blue-500 hover:bg-blue-600 text-white">Save Medication</Button>
      </form>

      <div className="mt-8">
        <h2 className="text-xl font-semibold text-gray-900 dark:text-white">Current Medications</h2>
        <div className="mt-4 space-y-4">
          {medications.map((med: any) => (
            <div key={med._id} className="p-4 border rounded-md dark:border-gray-700">
              <p className="font-semibold">{med.name}</p>
              <p>Dosage: {med.dosage}</p>
              <p>Frequency: {med.frequency}</p>
              <p>Status: {med.status}</p>
            </div>
          ))}
        </div>
      </div>
    </div>
  );
};

export default Medications;