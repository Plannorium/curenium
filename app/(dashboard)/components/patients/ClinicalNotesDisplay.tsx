"use client";

import { useState, useEffect } from 'react';
import { Button } from "@/components/ui/button";
import { PlusCircle } from "lucide-react";
import { AddClinicalNoteModal } from "./AddClinicalNoteModal";
import { ClinicalNote } from "@/types/clinical-note";
import { toast } from 'sonner';

interface ClinicalNotesDisplayProps {
  patientId: string;
}

export default function ClinicalNotesDisplay({ patientId }: ClinicalNotesDisplayProps) {
  const [notes, setNotes] = useState<ClinicalNote[]>([]);
  const [isModalOpen, setIsModalOpen] = useState(false);

  const fetchNotes = async () => {
    try {
      const response = await fetch(`/api/patients/${patientId}/clinical-notes`);
      if (response.ok) {
        const data = await response.json();
        setNotes(data as ClinicalNote[]);
      } else {
        toast.error('Failed to fetch clinical notes');
      }
    } catch (error) {
      toast.error('An error occurred while fetching clinical notes');
    }
  };

  useEffect(() => {
    fetchNotes();
  }, [patientId]);

  return (
    <div className="p-4">
      <div className="flex justify-between items-center mb-4">
        <h2 className="text-xl font-bold">Clinical Notes</h2>
        <Button onClick={() => setIsModalOpen(true)}>
          <PlusCircle className="mr-2 h-4 w-4" />
          New Note
        </Button>
      </div>
      <AddClinicalNoteModal
        patientId={patientId}
        isOpen={isModalOpen}
        onClose={() => setIsModalOpen(false)}
        onNoteAdded={fetchNotes}
      />
      <div className="space-y-4">
        {notes.length > 0 ? (
          notes.map((note) => (
            <div key={note._id} className="p-4 border rounded-lg">
              <p className="text-sm text-gray-500">{new Date(note.createdAt).toLocaleString()}</p>
              <p>{note.content}</p>
              <p className="text-xs text-gray-400 capitalize">Visibility: {note.visibility}</p>
            </div>
          ))
        ) : (
          <p>No clinical notes available.</p>
        )}
      </div>
    </div>
  );
}