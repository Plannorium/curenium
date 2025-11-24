"use client";

import { useState, useEffect } from 'react';
import { Button } from "@/components/ui/button";
import { PlusCircle, FileText } from "lucide-react";
import { AddClinicalNoteModal } from "./AddClinicalNoteModal";
import { AddSOAPNoteModal } from "./AddSOAPNoteModal"; // Import the new modal
import { ClinicalNote } from "@/types/clinical-note";
import { ISOAPNote } from '@/models/SOAPNote';
import { toast } from 'sonner';

interface ClinicalNotesDisplayProps {
  patientId: string;
}

type SOAPNote = Omit<ISOAPNote, keyof Document | 'toObject' | 'toJSON'>;

type CombinedNote = (ClinicalNote | SOAPNote) & { noteType: 'clinical' | 'soap' };

export default function ClinicalNotesDisplay({ patientId }: ClinicalNotesDisplayProps) {
  const [combinedNotes, setCombinedNotes] = useState<CombinedNote[]>([]);
  const [isNoteModalOpen, setIsNoteModalOpen] = useState(false);
  const [isSOAPModalOpen, setIsSOAPModalOpen] = useState(false);

  const fetchNotes = async () => {
    try {
      const notesResponse = await fetch(`/api/patients/${patientId}/clinical-notes`);
      const notesData = notesResponse.ok ? await notesResponse.json() : [];
      const clinicalNotes: CombinedNote[] = (notesData as ClinicalNote[]).map(note => ({ ...note, noteType: 'clinical' }));

      const soapNotesResponse = await fetch(`/api/patients/${patientId}/soap-notes`);
      const soapNotesData = soapNotesResponse.ok ? await soapNotesResponse.json() : [];
      const soapNotes: CombinedNote[] = (soapNotesData as SOAPNote[]).map(note => ({ ...note, noteType: 'soap' }));

      const allNotes = [...clinicalNotes, ...soapNotes].sort((a, b) => new Date(b.createdAt).getTime() - new Date(a.createdAt).getTime());
      setCombinedNotes(allNotes);

    } catch (error) {
      toast.error('An error occurred while fetching notes');
    }
  };

  useEffect(() => {
    fetchNotes();
  }, [patientId]);

  return (
    <div className="bg-white/70 dark:bg-gray-950/60 backdrop-blur-lg rounded-2xl border border-gray-200/50 dark:border-gray-800/50 shadow-xl p-6">
      <div className="flex justify-between items-center mb-8">
        <div className="flex items-center space-x-3">
          <div className="p-2 bg-gradient-to-br from-blue-500 to-blue-600 rounded-lg shadow-lg">
            <FileText className="h-6 w-6 text-white" />
          </div>
          <div>
            <h2 className="text-2xl font-bold bg-gradient-to-r from-gray-900 via-gray-800 to-gray-900 dark:from-white dark:via-gray-100 dark:to-white bg-clip-text text-transparent">
              Clinical Notes
            </h2>
            <p className="text-sm text-muted-foreground">Document patient findings and observations</p>
          </div>
        </div>
        <div className="flex space-x-3">
          <Button
            onClick={() => setIsNoteModalOpen(true)}
            className="bg-gradient-to-r from-blue-500 to-blue-600 hover:from-blue-600 hover:to-blue-700 text-white shadow-lg hover:shadow-xl transition-all duration-300 transform hover:scale-105"
          >
            <PlusCircle className="lg:mr-1 h-3 w-3" />
            New Note
          </Button>
          <Button
            onClick={() => setIsSOAPModalOpen(true)}
            variant="outline"
            className="border-2 border-purple-200 dark:border-purple-800/50 bg-purple-50/50 dark:bg-purple-950/20 hover:bg-purple-100/50 dark:hover:bg-purple-950/30 text-purple-700 dark:text-purple-300 shadow-lg hover:shadow-xl transition-all duration-300 transform hover:scale-105"
          >
            <PlusCircle className="lg:mr-1 h-3 w-3" />
            New SOAP Note
          </Button>
        </div>
      </div>
      <AddClinicalNoteModal
        patientId={patientId}
        isOpen={isNoteModalOpen}
        onClose={() => setIsNoteModalOpen(false)}
        onNoteAdded={fetchNotes}
      />
      <AddSOAPNoteModal
        patientId={patientId}
        isOpen={isSOAPModalOpen}
        onClose={() => setIsSOAPModalOpen(false)}
        onNoteAdded={fetchNotes}
      />
      <div className="space-y-6">
        {combinedNotes.map((note, index) => {
          if (note.noteType === 'clinical') {
            return (
              <div
                key={note._id}
                className="group bg-white/80 dark:bg-gray-800/80 backdrop-blur-sm p-6 rounded-xl shadow-lg hover:shadow-xl transition-all duration-300 border border-gray-200/50 dark:border-gray-700/50 hover:scale-[1.02] hover:-translate-y-1"
                style={{ animationDelay: `${index * 100}ms` }}
              >
                <div className="flex items-center justify-between mb-4">
                  <div className="flex items-center space-x-3">
                    <div className="p-2 bg-blue-100 dark:bg-blue-900/30 rounded-lg">
                      <FileText className="h-4 w-4 text-blue-600 dark:text-blue-400" />
                    </div>
                    <div>
                      <p className="text-sm font-medium text-gray-900 dark:text-white">Clinical Note</p>
                      <p className="text-xs text-gray-500 dark:text-gray-400">{new Date(note.createdAt).toLocaleString()}</p>
                    </div>
                  </div>
                  <div className="px-3 py-1 bg-gray-100 dark:bg-gray-700/50 rounded-full text-xs font-medium text-gray-600 dark:text-gray-300 capitalize">
                    {note.visibility}
                  </div>
                </div>
                <p className="text-gray-800 dark:text-gray-200 leading-relaxed">{(note as ClinicalNote).content}</p>
                <div className="absolute inset-0 bg-gradient-to-r from-transparent via-white/[0.02] dark:via-white/[0.01] to-transparent opacity-0 group-hover:opacity-100 transition-opacity duration-300 pointer-events-none rounded-xl"></div>
              </div>
            );
          }
          if (note.noteType === 'soap') {
            const soapNote = note as SOAPNote;
            return (
              <div
                key={soapNote._id}
                className="group bg-white/80 dark:bg-gray-800/80 backdrop-blur-sm p-6 rounded-xl shadow-lg hover:shadow-xl transition-all duration-300 border border-gray-200/50 dark:border-gray-700/50 hover:scale-[1.02] hover:-translate-y-1"
                style={{ animationDelay: `${index * 100}ms` }}
              >
                <div className="flex items-center justify-between mb-6">
                  <div className="flex items-center space-x-3">
                    <div className="p-2 bg-purple-100 dark:bg-purple-900/30 rounded-lg">
                      <FileText className="h-4 w-4 text-purple-600 dark:text-purple-400" />
                    </div>
                    <div>
                      <p className="text-sm font-medium text-gray-900 dark:text-white">SOAP Note</p>
                      <p className="text-xs text-gray-500 dark:text-gray-400">{new Date(soapNote.createdAt).toLocaleString()}</p>
                    </div>
                  </div>
                  <div className="px-3 py-1 bg-gray-100 dark:bg-gray-700/50 rounded-full text-xs font-medium text-gray-600 dark:text-gray-300 capitalize">
                    {soapNote.visibility}
                  </div>
                </div>
                <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
                  <div className="space-y-3">
                    <div className="flex items-center space-x-2">
                      <div className="w-2 h-2 bg-blue-500 rounded-full"></div>
                      <h3 className="font-semibold text-gray-900 dark:text-white">Subjective</h3>
                    </div>
                    <p className="text-gray-700 dark:text-gray-300 text-sm leading-relaxed pl-4">{soapNote.subjective}</p>
                  </div>
                  <div className="space-y-3">
                    <div className="flex items-center space-x-2">
                      <div className="w-2 h-2 bg-green-500 rounded-full"></div>
                      <h3 className="font-semibold text-gray-900 dark:text-white">Objective</h3>
                    </div>
                    <p className="text-gray-700 dark:text-gray-300 text-sm leading-relaxed pl-4">{soapNote.objective}</p>
                  </div>
                  <div className="space-y-3">
                    <div className="flex items-center space-x-2">
                      <div className="w-2 h-2 bg-orange-500 rounded-full"></div>
                      <h3 className="font-semibold text-gray-900 dark:text-white">Assessment</h3>
                    </div>
                    <p className="text-gray-700 dark:text-gray-300 text-sm leading-relaxed pl-4">{soapNote.assessment}</p>
                  </div>
                  <div className="space-y-3">
                    <div className="flex items-center space-x-2">
                      <div className="w-2 h-2 bg-pink-500 rounded-full"></div>
                      <h3 className="font-semibold text-gray-900 dark:text-white">Plan</h3>
                    </div>
                    <p className="text-gray-700 dark:text-gray-300 text-sm leading-relaxed pl-4">{soapNote.plan}</p>
                  </div>
                </div>
                <div className="absolute inset-0 bg-gradient-to-r from-transparent via-white/[0.02] dark:via-white/[0.01] to-transparent opacity-0 group-hover:opacity-100 transition-opacity duration-300 pointer-events-none rounded-xl"></div>
              </div>
            );
          }
          return null;
        })}
        {combinedNotes.length === 0 && (
          <div className="text-center py-16">
            <div className="inline-flex items-center justify-center w-16 h-16 bg-gray-100 dark:bg-gray-800/50 rounded-full mb-4">
              <FileText className="h-8 w-8 text-gray-400 dark:text-gray-600" />
            </div>
            <h3 className="text-lg font-semibold text-gray-900 dark:text-white mb-2">No clinical notes yet</h3>
            <p className="text-gray-500 dark:text-gray-400 max-w-md mx-auto">
              Start documenting patient findings and observations by creating your first clinical note.
            </p>
          </div>
        )}
      </div>
    </div>
  );
}