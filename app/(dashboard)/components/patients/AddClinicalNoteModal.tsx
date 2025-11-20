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
      <DialogContent>
        <DialogHeader>
          <DialogTitle>Add Clinical Note</DialogTitle>
        </DialogHeader>
        <div className="space-y-4">
          <Textarea
            placeholder="Write your clinical note here..."
            value={content}
            onChange={(e) => setContent(e.target.value)}
            rows={6}
          />
          <Select onValueChange={(value: 'team' | 'private' | 'public') => setVisibility(value)} defaultValue={visibility}>
            <SelectTrigger>
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
          <Button variant="outline" onClick={onClose}>Cancel</Button>
          <Button onClick={handleSubmit}>Save Note</Button>
        </DialogFooter>
      </DialogContent>
    </Dialog>
  );
}