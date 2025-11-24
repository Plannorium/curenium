"use client";

import { FC, useState } from 'react';
import { motion } from 'framer-motion';
import { Button } from '@/components/ui/button';
import { Input } from '@/components/ui/input';
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card';
import { Label } from '@/components/ui/label';
import { Activity, Heart, Thermometer, Wind, CheckCircle2, Loader2 } from 'lucide-react';
import { toast } from 'sonner';

interface VitalsProps {
  patientId: string;
}

const Vitals: FC<VitalsProps> = ({ patientId }) => {
  const [newVitals, setNewVitals] = useState({
    heartRate: '',
    bloodPressureSystolic: '',
    bloodPressureDiastolic: '',
    temperature: '',
    respiratoryRate: '',
    oxygenSaturation: '',
    weight: '',
    height: '',
  });
  const [isSubmitting, setIsSubmitting] = useState(false);

  const handleChange = (e: React.ChangeEvent<HTMLInputElement>) => {
    setNewVitals({ ...newVitals, [e.target.name]: e.target.value });
  };

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();

    // Basic validation
    if (!newVitals.heartRate || !newVitals.bloodPressureSystolic || !newVitals.bloodPressureDiastolic) {
      toast.error("Please fill in the required vital signs");
      return;
    }

    setIsSubmitting(true);
    try {
      const vitalsData = {
        heartRate: parseInt(newVitals.heartRate),
        bpSystolic: parseInt(newVitals.bloodPressureSystolic),
        bpDiastolic: parseInt(newVitals.bloodPressureDiastolic),
        temperature: newVitals.temperature ? parseFloat(newVitals.temperature) : undefined,
        respiratoryRate: newVitals.respiratoryRate ? parseInt(newVitals.respiratoryRate) : undefined,
        spo2: newVitals.oxygenSaturation ? parseInt(newVitals.oxygenSaturation) : undefined,
        weight: newVitals.weight ? parseFloat(newVitals.weight) : undefined,
        height: newVitals.height ? parseFloat(newVitals.height) : undefined,
        recordedAt: new Date().toISOString(),
      };

      const response = await fetch(`/api/patients/${patientId}/vitals`, {
        method: 'POST',
        headers: {
          'Content-Type': 'application/json',
        },
        body: JSON.stringify(vitalsData),
      });

      if (response.ok) {
        toast.success("Vital signs recorded successfully");
        setNewVitals({
          heartRate: '',
          bloodPressureSystolic: '',
          bloodPressureDiastolic: '',
          temperature: '',
          respiratoryRate: '',
          oxygenSaturation: '',
          weight: '',
          height: '',
        });
      } else {
        const errorData: { message?: string } = await response.json();
        toast.error(errorData.message || "Failed to save vitals");
      }
    } catch (error) {
      console.error("Failed to save vitals", error);
      toast.error("An error occurred while saving vitals");
    } finally {
      setIsSubmitting(false);
    }
  };

  const vitalFields = [
    {
      name: 'heartRate',
      label: 'Heart Rate',
      placeholder: 'e.g., 72',
      unit: 'bpm',
      icon: Heart,
      required: true,
      color: 'text-red-600 dark:text-red-400'
    },
    {
      name: 'bloodPressureSystolic',
      label: 'Blood Pressure (Systolic)',
      placeholder: 'e.g., 120',
      unit: 'mmHg',
      icon: Activity,
      required: true,
      color: 'text-blue-600 dark:text-blue-400'
    },
    {
      name: 'bloodPressureDiastolic',
      label: 'Blood Pressure (Diastolic)',
      placeholder: 'e.g., 80',
      unit: 'mmHg',
      icon: Activity,
      required: true,
      color: 'text-blue-600 dark:text-blue-400'
    },
    {
      name: 'temperature',
      label: 'Temperature',
      placeholder: 'e.g., 98.6',
      unit: '°F',
      icon: Thermometer,
      required: false,
      color: 'text-orange-600 dark:text-orange-400'
    },
    {
      name: 'respiratoryRate',
      label: 'Respiratory Rate',
      placeholder: 'e.g., 16',
      unit: 'breaths/min',
      icon: Wind,
      required: false,
      color: 'text-green-600 dark:text-green-400'
    },
    {
      name: 'oxygenSaturation',
      label: 'Oxygen Saturation (SpO2)',
      placeholder: 'e.g., 98',
      unit: '%',
      icon: Activity,
      required: false,
      color: 'text-purple-600 dark:text-purple-400'
    },
    {
      name: 'weight',
      label: 'Weight',
      placeholder: 'e.g., 150',
      unit: 'lbs',
      icon: Activity,
      required: false,
      color: 'text-indigo-600 dark:text-indigo-400'
    },
    {
      name: 'height',
      label: 'Height',
      placeholder: 'e.g., 68',
      unit: 'inches',
      icon: Activity,
      required: false,
      color: 'text-teal-600 dark:text-teal-400'
    },
  ];

  return (
    <motion.div
      initial={{ opacity: 0, y: 20 }}
      animate={{ opacity: 1, y: 0 }}
      transition={{ duration: 0.5 }}
      className="space-y-6"
    >
      <Card className="bg-white/70 dark:bg-gray-950/60 backdrop-blur-lg border-gray-200/50 dark:border-gray-800/50 shadow-xl">
        <CardHeader>
          <CardTitle className="flex items-center text-2xl">
            <div className="p-2 bg-green-100 dark:bg-green-900/20 rounded-lg mr-3">
              <Activity className="h-6 w-6 text-green-600 dark:text-green-400" />
            </div>
            Record Vital Signs
          </CardTitle>
        </CardHeader>
        <CardContent>
          <form onSubmit={handleSubmit} className="space-y-6">
            <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
              {vitalFields.map((field, index) => (
                <motion.div
                  key={field.name}
                  initial={{ opacity: 0, x: index % 2 === 0 ? -20 : 20 }}
                  animate={{ opacity: 1, x: 0 }}
                  transition={{ delay: 0.1 * index }}
                  className="space-y-2"
                >
                  <Label htmlFor={field.name} className="text-sm font-semibold flex items-center">
                    <field.icon className={`h-4 w-4 mr-2 ${field.color}`} />
                    {field.label} {field.required && <span className="text-red-500 ml-1">*</span>}
                  </Label>
                  <div className="relative">
                    <Input
                      id={field.name}
                      name={field.name}
                      type="number"
                      step={field.name === 'temperature' || field.name === 'weight' || field.name === 'height' ? '0.1' : '1'}
                      value={newVitals[field.name as keyof typeof newVitals]}
                      onChange={handleChange}
                      placeholder={field.placeholder}
                      className="h-11 border-2 border-gray-200/50 dark:border-gray-700/50 focus:border-green-500/50 rounded-lg pr-16"
                      required={field.required}
                    />
                    <span className="absolute right-3 top-1/2 -translate-y-1/2 text-sm text-muted-foreground font-medium">
                      {field.unit}
                    </span>
                  </div>
                </motion.div>
              ))}
            </div>

            {/* Submit Button */}
            <motion.div
              initial={{ opacity: 0, y: 20 }}
              animate={{ opacity: 1, y: 0 }}
              transition={{ delay: 0.8 }}
              className="flex justify-end pt-4"
            >
              <Button
                type="submit"
                disabled={isSubmitting}
                className="px-8 py-3 bg-linear-to-r from-green-600 to-green-700 hover:from-green-700 hover:to-green-800 text-white font-semibold rounded-lg shadow-lg hover:shadow-xl transition-all duration-300 hover:scale-105 disabled:opacity-50 disabled:cursor-not-allowed disabled:hover:scale-100"
              >
                {isSubmitting ? (
                  <>
                    <Loader2 className="h-5 w-5 mr-2 animate-spin" />
                    Recording Vitals...
                  </>
                ) : (
                  <>
                    <CheckCircle2 className="h-5 w-5 mr-2" />
                    Record Vital Signs
                  </>
                )}
              </Button>
            </motion.div>
          </form>
        </CardContent>
      </Card>
    </motion.div>
  );
};

export default Vitals;