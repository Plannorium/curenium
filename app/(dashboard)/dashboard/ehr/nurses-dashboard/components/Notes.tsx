"use client";

import { FC, useState, useEffect } from 'react';
import { Button } from '@/components/ui/button';
import { Textarea } from '@/components/ui/textarea';

interface Note {
  _id: string;
  content: string;
  createdAt: string;
}

interface NotesProps {
  patientId: string;
}

const Notes: FC<NotesProps> = ({ patientId }) => {
  const [notes, setNotes] = useState<Note[]>([]);
  const [newNote, setNewNote] = useState('');

  useEffect(() => {
    const fetchNotes = async () => {
      try {
        const response = await fetch(`/api/patients/${patientId}/notes`);
        if (response.ok) {
          const data: { notes: Note[] } = await response.json();
          setNotes(data.notes);
        }
      } catch (error) {
        console.error("Failed to fetch notes", error);
      }
    };

    fetchNotes();
  }, [patientId]);

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    try {
      const response = await fetch(`/api/patients/${patientId}/notes`, {
        method: 'POST',
        headers: {
          'Content-Type': 'application/json',
        },
        body: JSON.stringify({ content: newNote }),
      });

      if (response.ok) {
        const data: { note: Note } = await response.json();
        setNotes([data.note, ...notes]);
        setNewNote('');
      }
    } catch (error) {
      console.error("Failed to save note", error);
    }
  };

  return (
    <div className="mt-8">
      <form onSubmit={handleSubmit} className="space-y-4">
        <h2 className="text-xl font-semibold text-gray-900 dark:text-white">Add Note</h2>
        <div>
          <Textarea
            value={newNote}
            onChange={(e) => setNewNote(e.target.value)}
            placeholder="Type your note here..."
            className="mt-1 dark:bg-gray-700 dark:text-white"
          />
        </div>
        <Button type="submit" className="bg-blue-500 hover:bg-blue-600 text-white">Save Note</Button>
      </form>

      <div className="mt-8">
        <h2 className="text-xl font-semibold text-gray-900 dark:text-white">Recorded Notes</h2>
        <div className="mt-4 space-y-4">
          {notes.map((note) => (
            <div key={note._id} className="p-4 border rounded-md dark:border-gray-700">
              <p>{note.content}</p>
              <p className="text-sm text-gray-500 dark:text-gray-400">Recorded at: {new Date(note.createdAt).toLocaleString()}</p>
            </div>
          ))}
        </div>
      </div>
    </div>
  );
};

export default Notes;