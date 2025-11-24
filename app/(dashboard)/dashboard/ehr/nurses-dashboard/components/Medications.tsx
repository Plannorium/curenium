"use client";

import { FC, useState, useEffect } from 'react';
import { motion, AnimatePresence } from 'framer-motion';
import { Button } from '@/components/ui/button';
import { Input } from '@/components/ui/input';
import { Textarea } from '@/components/ui/textarea';
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card';
import { Badge } from '@/components/ui/badge';
import { Label } from '@/components/ui/label';
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from '@/components/ui/select';
import { Pill, Clock, Activity, CheckCircle2, Loader2, Plus, AlertCircle } from 'lucide-react';
import { toast } from 'sonner';

interface Medication {
  _id: string;
  name: string;
  dosage: string;
  frequency: string;
  status: string;
  route?: string;
  notes?: string;
  createdAt?: string;
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
    route: '',
    notes: '',
    status: 'active',
  });
  const [isSubmitting, setIsSubmitting] = useState(false);
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    const fetchMedications = async () => {
      try {
        const response = await fetch(`/api/patients/${patientId}/medications`);
        if (response.ok) {
          const data = await response.json();
          setMedications(data as Medication[]);
        } else {
          toast.error("Failed to fetch medications");
        }
      } catch (error) {
        console.error("Failed to fetch medications", error);
        toast.error("An error occurred while fetching medications");
      } finally {
        setLoading(false);
      }
    };

    fetchMedications();
  }, [patientId]);

  const handleInputChange = (e: React.ChangeEvent<HTMLInputElement | HTMLTextAreaElement>) => {
    const { name, value } = e.target;
    setNewMedication((prev) => ({ ...prev, [name]: value }));
  };

  const handleSelectChange = (name: string, value: string) => {
    setNewMedication((prev) => ({ ...prev, [name]: value }));
  };

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    if (!newMedication.name.trim() || !newMedication.dosage.trim()) {
      toast.error("Please fill in the required fields");
      return;
    }

    setIsSubmitting(true);
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
          route: '',
          notes: '',
          status: 'active',
        });
        toast.success("Medication added successfully");
      } else {
        const errorData = await response.json() as { message?: string };
        toast.error(errorData.message || "Failed to save medication");
      }
    } catch (error) {
      console.error("Failed to save medication", error);
      toast.error("An error occurred while saving the medication");
    } finally {
      setIsSubmitting(false);
    }
  };

  const getStatusBadgeVariant = (status: string) => {
    switch (status.toLowerCase()) {
      case 'active':
        return 'bg-green-100 text-green-800 dark:bg-green-900/20 dark:text-green-400';
      case 'completed':
        return 'bg-blue-100 text-blue-800 dark:bg-blue-900/20 dark:text-blue-400';
      case 'discontinued':
        return 'bg-red-100 text-red-800 dark:bg-red-900/20 dark:text-red-400';
      case 'on-hold':
        return 'bg-yellow-100 text-yellow-800 dark:bg-yellow-900/20 dark:text-yellow-400';
      default:
        return 'bg-gray-100 text-gray-800 dark:bg-gray-900/20 dark:text-gray-400';
    }
  };

  const getStatusIcon = (status: string) => {
    switch (status.toLowerCase()) {
      case 'active':
        return <CheckCircle2 className="h-4 w-4 text-green-500" />;
      case 'completed':
        return <CheckCircle2 className="h-4 w-4 text-blue-500" />;
      case 'discontinued':
        return <AlertCircle className="h-4 w-4 text-red-500" />;
      case 'on-hold':
        return <Clock className="h-4 w-4 text-yellow-500" />;
      default:
        return <Pill className="h-4 w-4 text-gray-500" />;
    }
  };

  const frequencyOptions = [
    'Once daily', 'Twice daily', 'Three times daily', 'Four times daily',
    'Every 4 hours', 'Every 6 hours', 'Every 8 hours', 'Every 12 hours',
    'As needed', 'Before meals', 'After meals', 'With meals'
  ];

  const routeOptions = [
    'Oral', 'Intravenous', 'Intramuscular', 'Subcutaneous', 'Topical',
    'Inhaled', 'Rectal', 'Ophthalmic', 'Otic', 'Nasal'
  ];

  return (
    <motion.div
      initial={{ opacity: 0, y: 20 }}
      animate={{ opacity: 1, y: 0 }}
      transition={{ duration: 0.5 }}
      className="space-y-6"
    >
      {/* Add Medication Form */}
      <Card className="bg-white/70 dark:bg-gray-950/60 backdrop-blur-lg border-gray-200/50 dark:border-gray-800/50 shadow-xl">
        <CardHeader>
          <CardTitle className="flex items-center text-2xl">
            <div className="p-2 bg-purple-100 dark:bg-purple-900/20 rounded-lg mr-3">
              <Pill className="h-6 w-6 text-purple-600 dark:text-purple-400" />
            </div>
            Add Medication
          </CardTitle>
        </CardHeader>
        <CardContent>
          <form onSubmit={handleSubmit} className="space-y-6">
            <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
              {/* Medication Name */}
              <motion.div
                initial={{ opacity: 0, x: -20 }}
                animate={{ opacity: 1, x: 0 }}
                transition={{ delay: 0.1 }}
                className="space-y-2"
              >
                <Label htmlFor="name" className="text-sm font-semibold flex items-center">
                  <Pill className="h-4 w-4 mr-2 text-primary" />
                  Medication Name *
                </Label>
                <Input
                  id="name"
                  name="name"
                  value={newMedication.name}
                  onChange={handleInputChange}
                  placeholder="e.g., Acetaminophen"
                  className="h-11 border-2 border-gray-200/50 dark:border-gray-700/50 focus:border-purple-500/50 rounded-lg"
                  required
                />
              </motion.div>

              {/* Dosage */}
              <motion.div
                initial={{ opacity: 0, x: 20 }}
                animate={{ opacity: 1, x: 0 }}
                transition={{ delay: 0.2 }}
                className="space-y-2"
              >
                <Label htmlFor="dosage" className="text-sm font-semibold flex items-center">
                  <Activity className="h-4 w-4 mr-2 text-primary" />
                  Dosage *
                </Label>
                <Input
                  id="dosage"
                  name="dosage"
                  value={newMedication.dosage}
                  onChange={handleInputChange}
                  placeholder="e.g., 500mg, 10mL"
                  className="h-11 border-2 border-gray-200/50 dark:border-gray-700/50 focus:border-purple-500/50 rounded-lg"
                  required
                />
              </motion.div>

              {/* Frequency */}
              <motion.div
                initial={{ opacity: 0, x: -20 }}
                animate={{ opacity: 1, x: 0 }}
                transition={{ delay: 0.3 }}
                className="space-y-2"
              >
                <Label htmlFor="frequency" className="text-sm font-semibold flex items-center">
                  <Clock className="h-4 w-4 mr-2 text-primary" />
                  Frequency
                </Label>
                <Select onValueChange={(value) => handleSelectChange('frequency', value)} value={newMedication.frequency}>
                  <SelectTrigger className="h-11 border-2 border-gray-200/50 dark:border-gray-700/50 focus:border-purple-500/50 rounded-lg">
                    <SelectValue placeholder="Select frequency" />
                  </SelectTrigger>
                  <SelectContent>
                    {frequencyOptions.map((freq) => (
                      <SelectItem key={freq} value={freq}>
                        {freq}
                      </SelectItem>
                    ))}
                  </SelectContent>
                </Select>
              </motion.div>

              {/* Route */}
              <motion.div
                initial={{ opacity: 0, x: 20 }}
                animate={{ opacity: 1, x: 0 }}
                transition={{ delay: 0.4 }}
                className="space-y-2"
              >
                <Label htmlFor="route" className="text-sm font-semibold flex items-center">
                  <Activity className="h-4 w-4 mr-2 text-primary" />
                  Route
                </Label>
                <Select onValueChange={(value) => handleSelectChange('route', value)} value={newMedication.route}>
                  <SelectTrigger className="h-11 border-2 border-gray-200/50 dark:border-gray-700/50 focus:border-purple-500/50 rounded-lg">
                    <SelectValue placeholder="Select route" />
                  </SelectTrigger>
                  <SelectContent>
                    {routeOptions.map((route) => (
                      <SelectItem key={route} value={route}>
                        {route}
                      </SelectItem>
                    ))}
                  </SelectContent>
                </Select>
              </motion.div>
            </div>

            {/* Notes */}
            <motion.div
              initial={{ opacity: 0, y: 20 }}
              animate={{ opacity: 1, y: 0 }}
              transition={{ delay: 0.5 }}
              className="space-y-2"
            >
              <Label htmlFor="notes" className="text-sm font-semibold flex items-center">
                <AlertCircle className="h-4 w-4 mr-2 text-primary" />
                Notes/Instructions
              </Label>
              <Textarea
                id="notes"
                name="notes"
                value={newMedication.notes}
                onChange={handleInputChange}
                placeholder="Special instructions, side effects, or additional notes..."
                className="min-h-20 border-2 border-gray-200/50 dark:border-gray-700/50 focus:border-purple-500/50 rounded-lg resize-none"
              />
            </motion.div>

            {/* Submit Button */}
            <motion.div
              initial={{ opacity: 0, y: 20 }}
              animate={{ opacity: 1, y: 0 }}
              transition={{ delay: 0.6 }}
              className="flex justify-end pt-4"
            >
              <Button
                type="submit"
                disabled={isSubmitting}
                className="px-8 py-3 bg-linear-to-r from-purple-600 to-purple-700 hover:from-purple-700 hover:to-purple-800 text-white font-semibold rounded-lg shadow-lg hover:shadow-xl transition-all duration-300 hover:scale-105 disabled:opacity-50 disabled:cursor-not-allowed disabled:hover:scale-100"
              >
                {isSubmitting ? (
                  <>
                    <Loader2 className="h-5 w-5 mr-2 animate-spin" />
                    Adding Medication...
                  </>
                ) : (
                  <>
                    <Plus className="h-5 w-5 mr-2" />
                    Add Medication
                  </>
                )}
              </Button>
            </motion.div>
          </form>
        </CardContent>
      </Card>

      {/* Medications List */}
      <Card className="bg-white/70 dark:bg-gray-950/60 backdrop-blur-lg border-gray-200/50 dark:border-gray-800/50 shadow-xl">
        <CardHeader>
          <CardTitle className="flex items-center text-2xl">
            <div className="p-2 bg-green-100 dark:bg-green-900/20 rounded-lg mr-3">
              <Pill className="h-6 w-6 text-green-600 dark:text-green-400" />
            </div>
            Current Medications
            <Badge variant="secondary" className="ml-auto bg-green-100 text-green-800 dark:bg-green-900/20 dark:text-green-400">
              {medications.filter(m => m.status === 'active').length} Active
            </Badge>
          </CardTitle>
        </CardHeader>
        <CardContent>
          {loading ? (
            <div className="flex items-center justify-center py-12">
              <Loader2 className="h-8 w-8 animate-spin text-primary" />
              <span className="ml-3 text-muted-foreground">Loading medications...</span>
            </div>
          ) : medications.length > 0 ? (
            <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
              <AnimatePresence>
                {medications.map((medication, index) => (
                  <motion.div
                    key={medication._id}
                    initial={{ opacity: 0, y: 20 }}
                    animate={{ opacity: 1, y: 0 }}
                    exit={{ opacity: 0, y: -20 }}
                    transition={{ delay: index * 0.1 }}
                  >
                    <Card className="bg-linear-to-br from-white/80 to-gray-50/80 dark:from-gray-800/80 dark:to-gray-900/80 backdrop-blur-sm hover:shadow-xl transition-all duration-300 border border-gray-200/50 dark:border-gray-700/50 hover:scale-[1.02]">
                      <CardContent className="p-6">
                        <div className="flex items-start justify-between mb-4">
                          <div className="flex items-center space-x-3">
                            <div className="p-2 bg-purple-100 dark:bg-purple-900/30 rounded-lg">
                              <Pill className="h-5 w-5 text-purple-600 dark:text-purple-400" />
                            </div>
                            <div>
                              <h4 className="font-semibold text-lg text-gray-900 dark:text-white">
                                {medication.name}
                              </h4>
                              <p className="text-sm text-muted-foreground">
                                {medication.dosage}
                              </p>
                            </div>
                          </div>
                          <div className="flex items-center space-x-2">
                            {getStatusIcon(medication.status)}
                            <Badge className={`text-xs font-medium ${getStatusBadgeVariant(medication.status)}`}>
                              {medication.status}
                            </Badge>
                          </div>
                        </div>

                        <div className="space-y-2 text-sm">
                          {medication.frequency && (
                            <div className="flex items-center justify-between">
                              <div className="flex items-center text-muted-foreground">
                                <Clock className="h-4 w-4 mr-2" />
                                Frequency
                              </div>
                              <span className="font-medium text-gray-900 dark:text-white">
                                {medication.frequency}
                              </span>
                            </div>
                          )}

                          {medication.route && (
                            <div className="flex items-center justify-between">
                              <div className="flex items-center text-muted-foreground">
                                <Activity className="h-4 w-4 mr-2" />
                                Route
                              </div>
                              <span className="font-medium text-gray-900 dark:text-white">
                                {medication.route}
                              </span>
                            </div>
                          )}

                          {medication.notes && (
                            <div className="mt-3 p-3 bg-gray-50/50 dark:bg-gray-800/50 rounded-lg">
                              <p className="text-xs text-muted-foreground mb-1">Notes:</p>
                              <p className="text-sm text-gray-700 dark:text-gray-300">
                                {medication.notes}
                              </p>
                            </div>
                          )}
                        </div>
                      </CardContent>
                    </Card>
                  </motion.div>
                ))}
              </AnimatePresence>
            </div>
          ) : (
            <div className="text-center py-12">
              <div className="p-4 bg-gray-100 dark:bg-gray-800/50 rounded-full w-fit mx-auto mb-4">
                <Pill className="h-8 w-8 text-gray-400 dark:text-gray-500" />
              </div>
              <h3 className="text-lg font-semibold text-gray-900 dark:text-white mb-2">
                No Medications Yet
              </h3>
              <p className="text-muted-foreground">
                Medications will appear here once they are prescribed and administered.
              </p>
            </div>
          )}
        </CardContent>
      </Card>
    </motion.div>
  );
};

export default Medications;