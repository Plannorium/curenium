"use client";

import { useState } from 'react';
import { Button } from "@/components/ui/button";
import { Dialog, DialogContent, DialogHeader, DialogTitle, DialogFooter } from "@/components/ui/dialog";
import { Textarea } from "@/components/ui/textarea";
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from "@/components/ui/select";
import { toast } from 'sonner';
import { useSession } from 'next-auth/react';

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
      <DialogContent className='bg-slate-900/80'>
        <DialogHeader>
          <DialogTitle>Add Clinical Note</DialogTitle>
        </DialogHeader>
        <form onSubmit={(e) => {
          e.preventDefault();
          handleSubmit();
        }} className="space-y-4">
          <div>
            <label htmlFor="note-content" className="block text-sm font-medium text-gray-700 dark:text-gray-300">Note Content</label>
            <Textarea
              id="note-content"
              placeholder="Write your clinical note here..."
              value={content}
              onChange={(e) => setContent(e.target.value)}
              rows={6}
              required
            />
          </div>
          <div>
            <label htmlFor="visibility" className="block text-sm font-medium text-gray-700 dark:text-gray-300">Visibility</label>
            <Select onValueChange={(value: 'team' | 'private' | 'public') => setVisibility(value)} defaultValue={visibility}>
              <SelectTrigger id="visibility">
                <SelectValue placeholder="Select visibility" />
              </SelectTrigger>
              <SelectContent>
                <SelectItem value="team">Team</SelectItem>
                <SelectItem value="private">Private</SelectItem>
                <SelectItem value="public">Public</SelectItem>
              </SelectContent>
            </Select>
          </div>
          <DialogFooter>
            <Button type="button" variant="outline" onClick={onClose}>Cancel</Button>
            <Button type="submit">Save Note</Button>
          </DialogFooter>
        </form>
      </DialogContent>
    </Dialog>
  );
}