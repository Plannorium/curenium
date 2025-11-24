"use client";

import { useState } from 'react';
import { Button } from "@/components/ui/button";
import { Dialog, DialogContent, DialogHeader, DialogTitle, DialogFooter } from "@/components/ui/dialog";
import { Textarea } from "@/components/ui/textarea";
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from "@/components/ui/select";
import { toast } from 'sonner';
import { useSession } from 'next-auth/react';
import { FileText } from 'lucide-react';

interface AddClinicalNoteModalProps {
  patientId: string;
  isOpen: boolean;
  onClose: () => void;
  onNoteAdded: () => void;
}

export function AddClinicalNoteModal({ patientId, isOpen, onClose, onNoteAdded }: AddClinicalNoteModalProps) {
  const { data: session } = useSession();
  const [content, setContent] = useState('');
  const [visibility, setVisibility] = useState<'team' | 'private' | 'public'>('team');

  const handleSubmit = async () => {
    if (!content) {
      toast.error('Note content cannot be empty');
      return;
    }

    try {
      const response = await fetch(`/api/patients/${patientId}/clinical-notes`, {
        method: 'POST',
        headers: {
          'Content-Type': 'application/json',
        },
        body: JSON.stringify({ 
          content, 
          visibility, 
          doctorId: session?.user?.id 
        }),
      });

      if (response.ok) {
        toast.success('Clinical note added successfully');
        onNoteAdded();
        onClose();
      } else {
        toast.error('Failed to add clinical note');
      }
    } catch (error) {
      toast.error('An error occurred while adding the clinical note');
    }
  };

  return (
    <Dialog open={isOpen} onOpenChange={onClose}>
      <DialogContent className="sm:max-w-[500px] bg-white/90 dark:bg-gray-950/90 backdrop-blur-lg border border-gray-200/50 dark:border-gray-800/50 shadow-2xl">
        <DialogHeader className="pb-4">
          <div className="flex items-center space-x-3 mb-2">
            <div className="p-2 bg-linear-to-br from-blue-500 to-blue-600 rounded-lg shadow-lg">
              <FileText className="h-5 w-5 text-white" />
            </div>
            <DialogTitle className="text-xl font-bold bg-linear-to-r from-gray-900 via-gray-800 to-gray-900 dark:from-white dark:via-gray-100 dark:to-white bg-clip-text text-transparent">
              Add Clinical Note
            </DialogTitle>
          </div>
          <p className="text-sm text-muted-foreground">Document patient findings and observations</p>
        </DialogHeader>
        <form onSubmit={(e) => {
          e.preventDefault();
          handleSubmit();
        }} className="space-y-6 py-4">
          <div className="space-y-3">
            <label htmlFor="note-content" className="text-sm font-semibold text-gray-800 dark:text-gray-200 flex items-center">
              <FileText className="h-4 w-4 mr-2 text-blue-500" />
              Note Content
            </label>
            <Textarea
              id="note-content"
              placeholder="Write your clinical note here..."
              value={content}
              onChange={(e) => setContent(e.target.value)}
              rows={6}
              required
              className="bg-gray-50/80 dark:bg-gray-900/80 border-gray-200/70 dark:border-gray-700/60 focus:border-blue-400 dark:focus:border-blue-500 rounded-xl resize-none transition-all duration-200"
            />
          </div>
          <div className="space-y-3">
            <label htmlFor="visibility" className="text-sm font-semibold text-gray-800 dark:text-gray-200 flex items-center">
              <div className="w-4 h-4 mr-2 bg-linear-to-br from-gray-400 to-gray-600 rounded"></div>
              Visibility
            </label>
            <Select onValueChange={(value: 'team' | 'private' | 'public') => setVisibility(value)} defaultValue={visibility}>
              <SelectTrigger id="visibility" className="bg-gray-50/80 dark:bg-gray-900/80 border-gray-200/70 dark:border-gray-700/60 focus:border-blue-400 dark:focus:border-blue-500 rounded-xl h-11">
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
              className="bg-linear-to-r from-blue-500 to-blue-600 hover:from-blue-600 hover:to-blue-700 text-white shadow-lg hover:shadow-xl transition-all duration-300 rounded-xl px-6"
            >
              Save Note
            </Button>
          </DialogFooter>
        </form>
      </DialogContent>
    </Dialog>
  );
}