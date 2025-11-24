"use client";

import { useState } from 'react';
import { Button } from "@/components/ui/button";
import { Dialog, DialogContent, DialogHeader, DialogTitle, DialogFooter } from "@/components/ui/dialog";
import { Textarea } from "@/components/ui/textarea";
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from "@/components/ui/select";
import { toast } from 'sonner';
import { useSession } from 'next-auth/react';
import { z } from 'zod';
import { FileText } from 'lucide-react';

const soapNoteSchema = z.object({
  subjective: z.string().min(1, "Subjective section cannot be empty"),
  objective: z.string().min(1, "Objective section cannot be empty"),
  assessment: z.string().min(1, "Assessment section cannot be empty"),
  plan: z.string().min(1, "Plan section cannot be empty"),
  visibility: z.enum(['team', 'private', 'public']),
});

interface AddSOAPNoteModalProps {
  patientId: string;
  isOpen: boolean;
  onClose: () => void;
  onNoteAdded: () => void;
}

export function AddSOAPNoteModal({ patientId, isOpen, onClose, onNoteAdded }: AddSOAPNoteModalProps) {
  const { data: session } = useSession();
  const [subjective, setSubjective] = useState('');
  const [objective, setObjective] = useState('');
  const [assessment, setAssessment] = useState('');
  const [plan, setPlan] = useState('');
  const [visibility, setVisibility] = useState<'team' | 'private' | 'public'>('team');
  const [errors, setErrors] = useState<z.ZodError | null>(null);

  const fieldErrors: {
    subjective?: string[];
    objective?: string[];
    assessment?: string[];
    plan?: string[];
  } | undefined = errors?.flatten().fieldErrors;

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    const noteData = {
      subjective,
      objective,
      assessment,
      plan,
      visibility,
    };

    const result = soapNoteSchema.safeParse(noteData);

    if (!result.success) {
      setErrors(result.error);
      return;
    }

    setErrors(null);

    try {
      const response = await fetch(`/api/patients/${patientId}/soap-notes`, {
        method: 'POST',
        headers: {
          'Content-Type': 'application/json',
        },
        body: JSON.stringify({
          ...result.data,
          encounterId: 'some-encounter-id', // This should be dynamic
        }),
      });

      if (response.ok) {
        toast.success('SOAP note added successfully');
        onNoteAdded();
        onClose();
      } else {
        const errorData = await response.json() as { message?: string };
        toast.error(errorData.message || 'Failed to add SOAP note');
      }
    } catch (error) {
      toast.error('An error occurred while adding the SOAP note');
    }
  };

  return (
    <Dialog open={isOpen} onOpenChange={onClose}>
      <DialogContent className="sm:max-w-4xl bg-white/90 dark:bg-gray-950/90 backdrop-blur-lg border border-gray-200/50 dark:border-gray-800/50 shadow-2xl max-h-[90vh] overflow-y-auto">
        <DialogHeader className="pb-4">
          <div className="flex items-center space-x-3 mb-2">
            <div className="p-2 bg-linear-to-br from-purple-500 to-purple-600 rounded-lg shadow-lg">
              <FileText className="h-5 w-5 text-white" />
            </div>
            <DialogTitle className="text-xl font-bold bg-linear-to-r from-gray-900 via-gray-800 to-gray-900 dark:from-white dark:via-gray-100 dark:to-white bg-clip-text text-transparent">
              Add SOAP Note
            </DialogTitle>
          </div>
          <p className="text-sm text-muted-foreground">Comprehensive patient documentation using SOAP format</p>
        </DialogHeader>
        <form onSubmit={handleSubmit} className="space-y-6 py-4">
          <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
            <div className="space-y-3">
              <label htmlFor="subjective" className="text-sm font-semibold text-gray-800 dark:text-gray-200 flex items-center">
                <div className="w-3 h-3 bg-blue-500 rounded-full mr-2"></div>
                Subjective
              </label>
              <Textarea
                id="subjective"
                placeholder="Patient's subjective report..."
                value={subjective}
                onChange={(e) => setSubjective(e.target.value)}
                rows={4}
                className="bg-blue-50/50 dark:bg-blue-950/20 border-blue-200/70 dark:border-blue-800/60 focus:border-blue-400 dark:focus:border-blue-500 rounded-xl resize-none transition-all duration-200"
              />
              {fieldErrors?.subjective && <p className="text-red-500 text-xs mt-1 flex items-center"><span className="w-1 h-1 bg-red-500 rounded-full mr-2"></span>{fieldErrors.subjective[0]}</p>}
            </div>
            <div className="space-y-3">
              <label htmlFor="objective" className="text-sm font-semibold text-gray-800 dark:text-gray-200 flex items-center">
                <div className="w-3 h-3 bg-green-500 rounded-full mr-2"></div>
                Objective
              </label>
              <Textarea
                id="objective"
                placeholder="Objective findings..."
                value={objective}
                onChange={(e) => setObjective(e.target.value)}
                rows={4}
                className="bg-green-50/50 dark:bg-green-950/20 border-green-200/70 dark:border-green-800/60 focus:border-green-400 dark:focus:border-green-500 rounded-xl resize-none transition-all duration-200"
              />
              {fieldErrors?.objective && <p className="text-red-500 text-xs mt-1 flex items-center"><span className="w-1 h-1 bg-red-500 rounded-full mr-2"></span>{fieldErrors.objective[0]}</p>}
            </div>
            <div className="space-y-3">
              <label htmlFor="assessment" className="text-sm font-semibold text-gray-800 dark:text-gray-200 flex items-center">
                <div className="w-3 h-3 bg-orange-500 rounded-full mr-2"></div>
                Assessment
              </label>
              <Textarea
                id="assessment"
                placeholder="Your assessment..."
                value={assessment}
                onChange={(e) => setAssessment(e.target.value)}
                rows={4}
                className="bg-orange-50/50 dark:bg-orange-950/20 border-orange-200/70 dark:border-orange-800/60 focus:border-orange-400 dark:focus:border-orange-500 rounded-xl resize-none transition-all duration-200"
              />
              {fieldErrors?.assessment && <p className="text-red-500 text-xs mt-1 flex items-center"><span className="w-1 h-1 bg-red-500 rounded-full mr-2"></span>{fieldErrors.assessment[0]}</p>}
            </div>
            <div className="space-y-3">
              <label htmlFor="plan" className="text-sm font-semibold text-gray-800 dark:text-gray-200 flex items-center">
                <div className="w-3 h-3 bg-pink-500 rounded-full mr-2"></div>
                Plan
              </label>
              <Textarea
                id="plan"
                placeholder="Your plan for the patient..."
                value={plan}
                onChange={(e) => setPlan(e.target.value)}
                rows={4}
                className="bg-pink-50/50 dark:bg-pink-950/20 border-pink-200/70 dark:border-pink-800/60 focus:border-pink-400 dark:focus:border-pink-500 rounded-xl resize-none transition-all duration-200"
              />
              {fieldErrors?.plan && <p className="text-red-500 text-xs mt-1 flex items-center"><span className="w-1 h-1 bg-red-500 rounded-full mr-2"></span>{fieldErrors.plan[0]}</p>}
            </div>
          </div>
          <div className="space-y-3">
            <label htmlFor="visibility" className="text-sm font-semibold text-gray-800 dark:text-gray-200 flex items-center">
              <div className="w-4 h-4 mr-2 bg-linear-to-br from-gray-400 to-gray-600 rounded"></div>
              Visibility
            </label>
            <Select onValueChange={(value: 'team' | 'private' | 'public') => setVisibility(value)} defaultValue={visibility}>
              <SelectTrigger id="visibility" className="bg-gray-50/80 dark:bg-gray-900/80 border-gray-200/70 dark:border-gray-700/60 focus:border-purple-400 dark:focus:border-purple-500 rounded-xl h-11">
                <SelectValue placeholder="Select visibility" />
              </SelectTrigger>
              <SelectContent className="bg-white/90 dark:bg-gray-900/90 backdrop-blur-lg border border-gray-200/50 dark:border-gray-700/50 rounded-xl">
                <SelectItem value="team" className="hover:bg-blue-50 dark:hover:bg-blue-950/30 rounded-lg mx-1">Team</SelectItem>
                <SelectItem value="private" className="hover:bg-orange-50 dark:hover:bg-orange-950/30 rounded-lg mx-1">Private</SelectItem>
                <SelectItem value="public" className="hover:bg-green-50 dark:hover:bg-green-950/30 rounded-lg mx-1">Public</SelectItem>
              </SelectContent>
            </Select>
          </div>
          <DialogFooter className="pt-4 border-t border-gray-200/50 dark:border-gray-700/50">
            <Button
              type="button"
              variant="ghost"
              onClick={onClose}
              className="hover:bg-gray-100 dark:hover:bg-gray-800/50 rounded-xl transition-all duration-200"
            >
              Cancel
            </Button>
            <Button
              type="submit"
              className="bg-linear-to-r from-purple-500 to-purple-600 hover:from-purple-600 hover:to-purple-700 text-white shadow-lg hover:shadow-xl transition-all duration-300 rounded-xl px-6"
            >
              Save SOAP Note
            </Button>
          </DialogFooter>
        </form>
      </DialogContent>
    </Dialog>
  );
}