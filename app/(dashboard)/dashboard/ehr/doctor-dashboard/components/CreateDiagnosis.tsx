"use client";

import { FC, useState } from 'react';
import { motion } from 'framer-motion';
import { Button } from '@/components/ui/button';
import { Input } from '@/components/ui/input';
import { Textarea } from '@/components/ui/textarea';
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from '@/components/ui/select';
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card';
import { Label } from '@/components/ui/label';
import { Badge } from '@/components/ui/badge';
import { Checkbox } from '@/components/ui/checkbox';
import { Brain, AlertCircle, Calendar, FileText, CheckCircle2, Loader2 } from 'lucide-react';
import { toast } from 'sonner';

interface CreateDiagnosisProps {
  patientId: string;
  onDiagnosisCreated?: () => void;
}

const CreateDiagnosis: FC<CreateDiagnosisProps> = ({ patientId, onDiagnosisCreated }) => {
  const [icd10Code, setIcd10Code] = useState('');
  const [description, setDescription] = useState('');
  const [severity, setSeverity] = useState('');
  const [onsetDate, setOnsetDate] = useState('');
  const [note, setNote] = useState('');
  const [isPrimary, setIsPrimary] = useState(false);
  const [isSubmitting, setIsSubmitting] = useState(false);

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    if (!icd10Code.trim() || !description.trim()) {
      toast.error("Please fill in the required fields");
      return;
    }

    setIsSubmitting(true);
    try {
      const response = await fetch(`/api/patients/${patientId}/diagnoses`, {
        method: 'POST',
        headers: {
          'Content-Type': 'application/json',
        },
        body: JSON.stringify({
          icd10Code: icd10Code.trim(),
          description: description.trim(),
          severity,
          onsetDate,
          note: note.trim(),
          isPrimary
        }),
      });

      if (response.ok) {
        toast.success("Diagnosis created successfully");
        // Reset form
        setIcd10Code('');
        setDescription('');
        setSeverity('');
        setOnsetDate('');
        setNote('');
        setIsPrimary(false);
        onDiagnosisCreated?.();
      } else {
        const errorData: { message?: string } = await response.json();
        toast.error(errorData.message || "Failed to create diagnosis");
      }
    } catch (error) {
      console.error("Failed to create diagnosis", error);
      toast.error("An error occurred while creating the diagnosis");
    } finally {
      setIsSubmitting(false);
    }
  };

  const severityOptions = [
    { value: 'mild', label: 'Mild', color: 'bg-green-100 text-green-800 dark:bg-green-900/20 dark:text-green-400' },
    { value: 'moderate', label: 'Moderate', color: 'bg-yellow-100 text-yellow-800 dark:bg-yellow-900/20 dark:text-yellow-400' },
    { value: 'severe', label: 'Severe', color: 'bg-red-100 text-red-800 dark:bg-red-900/20 dark:text-red-400' }
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
            <div className="p-2 bg-purple-100 dark:bg-purple-900/20 rounded-lg mr-3">
              <Brain className="h-6 w-6 text-purple-600 dark:text-purple-400" />
            </div>
            Create Diagnosis
          </CardTitle>
        </CardHeader>
        <CardContent>
          <form onSubmit={handleSubmit} className="space-y-6">
            <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
              {/* ICD-10 Code */}
              <motion.div
                initial={{ opacity: 0, x: -20 }}
                animate={{ opacity: 1, x: 0 }}
                transition={{ delay: 0.1 }}
                className="space-y-2"
              >
                <Label htmlFor="icd10Code" className="text-sm font-semibold flex items-center">
                  <AlertCircle className="h-4 w-4 mr-2 text-primary" />
                  ICD-10 Code *
                </Label>
                <Input
                  id="icd10Code"
                  value={icd10Code}
                  onChange={(e) => setIcd10Code(e.target.value.toUpperCase())}
                  placeholder="e.g., J00, I10, E11.9"
                  className="h-11 border-2 border-gray-200/50 dark:border-gray-700/50 focus:border-purple-500/50 rounded-lg"
                  required
                />
              </motion.div>

              {/* Severity */}
              <motion.div
                initial={{ opacity: 0, x: 20 }}
                animate={{ opacity: 1, x: 0 }}
                transition={{ delay: 0.2 }}
                className="space-y-2"
              >
                <Label htmlFor="severity" className="text-sm font-semibold flex items-center">
                  <AlertCircle className="h-4 w-4 mr-2 text-primary" />
                  Severity
                </Label>
                <Select onValueChange={setSeverity} value={severity}>
                  <SelectTrigger className="h-11 border-2 border-gray-200/50 dark:border-gray-700/50 focus:border-purple-500/50 rounded-lg">
                    <SelectValue placeholder="Select severity level" />
                  </SelectTrigger>
                  <SelectContent>
                    {severityOptions.map((option) => (
                      <SelectItem key={option.value} value={option.value}>
                        <div className="flex items-center space-x-2">
                          <Badge className={option.color}>{option.label}</Badge>
                        </div>
                      </SelectItem>
                    ))}
                  </SelectContent>
                </Select>
              </motion.div>
            </div>

            {/* Description */}
            <motion.div
              initial={{ opacity: 0, y: 20 }}
              animate={{ opacity: 1, y: 0 }}
              transition={{ delay: 0.3 }}
              className="space-y-2"
            >
              <Label htmlFor="description" className="text-sm font-semibold flex items-center">
                <FileText className="h-4 w-4 mr-2 text-primary" />
                Diagnosis Description *
              </Label>
              <Textarea
                id="description"
                value={description}
                onChange={(e) => setDescription(e.target.value)}
                placeholder="Provide a detailed description of the diagnosis..."
                className="min-h-[100px] border-2 border-gray-200/50 dark:border-gray-700/50 focus:border-purple-500/50 rounded-lg resize-none"
                required
              />
            </motion.div>

            <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
              {/* Onset Date */}
              <motion.div
                initial={{ opacity: 0, x: -20 }}
                animate={{ opacity: 1, x: 0 }}
                transition={{ delay: 0.4 }}
                className="space-y-2"
              >
                <Label htmlFor="onsetDate" className="text-sm font-semibold flex items-center">
                  <Calendar className="h-4 w-4 mr-2 text-primary" />
                  Onset Date
                </Label>
                <Input
                  id="onsetDate"
                  type="date"
                  value={onsetDate}
                  onChange={(e) => setOnsetDate(e.target.value)}
                  className="h-11 border-2 border-gray-200/50 dark:border-gray-700/50 focus:border-purple-500/50 rounded-lg"
                />
              </motion.div>

              {/* Primary Diagnosis Checkbox */}
              <motion.div
                initial={{ opacity: 0, x: 20 }}
                animate={{ opacity: 1, x: 0 }}
                transition={{ delay: 0.5 }}
                className="flex items-center space-x-2 pt-8"
              >
                <Checkbox
                  id="isPrimary"
                  checked={isPrimary}
                  onCheckedChange={(checked) => setIsPrimary(checked as boolean)}
                  className="data-[state=checked]:bg-purple-600 data-[state=checked]:border-purple-600"
                />
                <Label htmlFor="isPrimary" className="text-sm font-semibold cursor-pointer">
                  Mark as Primary Diagnosis
                </Label>
              </motion.div>
            </div>

            {/* Clinical Notes */}
            <motion.div
              initial={{ opacity: 0, y: 20 }}
              animate={{ opacity: 1, y: 0 }}
              transition={{ delay: 0.6 }}
              className="space-y-2"
            >
              <Label htmlFor="note" className="text-sm font-semibold flex items-center">
                <FileText className="h-4 w-4 mr-2 text-primary" />
                Clinical Notes
              </Label>
              <Textarea
                id="note"
                value={note}
                onChange={(e) => setNote(e.target.value)}
                placeholder="Add any additional clinical notes, observations, or treatment considerations..."
                className="min-h-[120px] border-2 border-gray-200/50 dark:border-gray-700/50 focus:border-purple-500/50 rounded-lg resize-none"
              />
            </motion.div>

            {/* Submit Button */}
            <motion.div
              initial={{ opacity: 0, y: 20 }}
              animate={{ opacity: 1, y: 0 }}
              transition={{ delay: 0.7 }}
              className="flex justify-end pt-4"
            >
              <Button
                type="submit"
                disabled={isSubmitting}
                className="px-8 py-3 bg-gradient-to-r from-purple-600 to-purple-700 hover:from-purple-700 hover:to-purple-800 text-white font-semibold rounded-lg shadow-lg hover:shadow-xl transition-all duration-300 hover:scale-105 disabled:opacity-50 disabled:cursor-not-allowed disabled:hover:scale-100"
              >
                {isSubmitting ? (
                  <>
                    <Loader2 className="h-5 w-5 mr-2 animate-spin" />
                    Creating Diagnosis...
                  </>
                ) : (
                  <>
                    <CheckCircle2 className="h-5 w-5 mr-2" />
                    Create Diagnosis
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

export default CreateDiagnosis;