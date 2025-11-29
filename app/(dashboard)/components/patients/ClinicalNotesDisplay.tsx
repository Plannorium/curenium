"use client";

import { useState, useEffect } from 'react';
import { Button } from "@/components/ui/button";
import { PlusCircle, FileText } from "lucide-react";
import { AddClinicalNoteModal } from "./AddClinicalNoteModal";
import { AddSOAPNoteModal } from "./AddSOAPNoteModal"; // Import the new modal
import { ClinicalNote } from "@/types/clinical-note";
import { ISOAPNote } from '@/models/SOAPNote';
import { toast } from 'sonner';
import { useLanguage } from '@/contexts/LanguageContext';
import { dashboardTranslations } from '@/lib/dashboard-translations';

interface ClinicalNotesDisplayProps {
  patientId: string;
}

type SOAPNote = Omit<ISOAPNote, keyof Document | 'toObject' | 'toJSON'>;

type CombinedNote = (ClinicalNote | SOAPNote) & { noteType: 'clinical' | 'soap' };

export default function ClinicalNotesDisplay({ patientId }: ClinicalNotesDisplayProps) {
  const { language } = useLanguage();
  const t = (key: string) => {
    const keys = key.split('.');
    let value: any = dashboardTranslations[language as keyof typeof dashboardTranslations];
    for (const k of keys) {
      value = value?.[k];
    }
    return value || key;
  };

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
      toast.error(t('clinicalNotesDisplay.errorFetchingNotes'));
    }
  };

  useEffect(() => {
    fetchNotes();
  }, [patientId]);

  return (
    <div className="bg-white/70 dark:bg-gray-950/60 backdrop-blur-lg rounded-2xl border border-gray-200/50 dark:border-gray-800/50 shadow-xl p-4 lg:p-6">
      <div className="flex flex-col sm:flex-row justify-between items-start sm:items-center mb-6 sm:mb-8 space-y-4 sm:space-y-0">
        <div className="flex items-center space-x-3">
          <div className="p-2 bg-linear-to-br from-blue-500 to-blue-600 rounded-lg shadow-lg">
            <FileText className="h-5 w-5 sm:h-6 sm:w-6 text-white" />
          </div>
          <div>
            <h2 className="text-xl sm:text-2xl font-bold bg-linear-to-r from-gray-900 via-gray-800 to-gray-900 dark:from-white dark:via-gray-100 dark:to-white bg-clip-text text-transparent">
              {t('clinicalNotesDisplay.title')}
            </h2>
            <p className="text-xs sm:text-sm text-muted-foreground">{t('clinicalNotesDisplay.subtitle')}</p>
          </div>
        </div>
        <div className="flex flex-col sm:flex-row space-y-2 sm:space-y-0 sm:space-x-3 w-full sm:w-auto">
          <Button
            onClick={() => setIsNoteModalOpen(true)}
            className="bg-linear-to-r from-blue-500 to-blue-600 hover:from-blue-600 hover:to-blue-700 text-white shadow-lg hover:shadow-xl transition-all duration-300 transform hover:scale-105 cursor-pointer w-full sm:w-auto"
            size="sm"
          >
            <PlusCircle className="mr-2 h-4 w-4" />
            <span className="text-sm">{t('clinicalNotesDisplay.newNote')}</span>
          </Button>
          <Button
            onClick={() => setIsSOAPModalOpen(true)}
            variant="outline"
            className="border-2 border-purple-200 dark:border-purple-800/50 bg-purple-50/50 dark:bg-purple-950/20 hover:bg-purple-100/50 dark:hover:bg-purple-950/30 text-purple-700 dark:text-purple-300 shadow-lg hover:shadow-xl transition-all duration-300 transform hover:scale-105 cursor-pointer w-full sm:w-auto"
            size="sm"
          >
            <PlusCircle className="mr-2 h-4 w-4" />
            <span className="text-sm">{t('clinicalNotesDisplay.soapNote')}</span>
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
                className="group bg-white/80 dark:bg-gray-800/80 backdrop-blur-sm p-4 lg:p-6 rounded-xl shadow-lg hover:shadow-xl transition-all duration-300 border border-gray-200/50 dark:border-gray-700/50 hover:scale-[1.02] hover:-translate-y-1"
                style={{ animationDelay: `${index * 100}ms` }}
              >
                <div className="flex flex-col sm:flex-row sm:items-center justify-between mb-4 space-y-2 sm:space-y-0">
                  <div className="flex items-center space-x-3">
                    <div className="p-2 bg-blue-100 dark:bg-blue-900/30 rounded-lg">
                      <FileText className="h-4 w-4 text-blue-600 dark:text-blue-400" />
                    </div>
                    <div>
                      <p className="text-sm font-medium text-gray-900 dark:text-white">{t('clinicalNotesDisplay.clinicalNote')}</p>
                      <p className="text-xs text-gray-500 dark:text-gray-400">{new Date(note.createdAt).toLocaleString()}</p>
                    </div>
                  </div>
                  <div className="px-3 py-1 bg-gray-100 dark:bg-gray-700/50 rounded-full text-xs font-medium text-gray-600 dark:text-gray-300 capitalize self-start sm:self-center">
                    {note.visibility}
                  </div>
                </div>
                <p className="text-gray-800 dark:text-gray-200 leading-relaxed text-sm sm:text-base">{(note as ClinicalNote).content}</p>
                <div className="absolute inset-0 bg-linear-to-r from-transparent via-white/2 dark:via-white/1 to-transparent opacity-0 group-hover:opacity-100 transition-opacity duration-300 pointer-events-none rounded-xl"></div>
              </div>
            );
          }
          if (note.noteType === 'soap') {
            const soapNote = note as SOAPNote;
            return (
              <div
                key={soapNote._id}
                className="group bg-white/80 dark:bg-gray-800/80 backdrop-blur-sm p-4 lg:p-6 rounded-xl shadow-lg hover:shadow-xl transition-all duration-300 border border-gray-200/50 dark:border-gray-700/50 hover:scale-[1.02] hover:-translate-y-1"
                style={{ animationDelay: `${index * 100}ms` }}
              >
                <div className="flex flex-col sm:flex-row sm:items-center justify-between mb-4 sm:mb-6 space-y-2 sm:space-y-0">
                  <div className="flex items-center space-x-3">
                    <div className="p-2 bg-purple-100 dark:bg-purple-900/30 rounded-lg">
                      <FileText className="h-4 w-4 text-purple-600 dark:text-purple-400" />
                    </div>
                    <div>
                      <p className="text-sm font-medium text-gray-900 dark:text-white">{t('clinicalNotesDisplay.soapNoteLabel')}</p>
                      <p className="text-xs text-gray-500 dark:text-gray-400">{new Date(soapNote.createdAt).toLocaleString()}</p>
                    </div>
                  </div>
                  <div className="px-3 py-1 bg-gray-100 dark:bg-gray-700/50 rounded-full text-xs font-medium text-gray-600 dark:text-gray-300 capitalize self-start sm:self-center">
                    {soapNote.visibility}
                  </div>
                </div>
                <div className="grid grid-cols-1 sm:grid-cols-2 gap-4 sm:gap-6">
                  <div className="space-y-3">
                    <div className="flex items-center space-x-2">
                      <div className="w-2 h-2 bg-blue-500 rounded-full"></div>
                      <h3 className="font-semibold text-gray-900 dark:text-white text-sm sm:text-base">{t('clinicalNotesDisplay.subjective')}</h3>
                    </div>
                    <p className="text-gray-700 dark:text-gray-300 text-sm leading-relaxed pl-4">{soapNote.subjective}</p>
                  </div>
                  <div className="space-y-3">
                    <div className="flex items-center space-x-2">
                      <div className="w-2 h-2 bg-green-500 rounded-full"></div>
                      <h3 className="font-semibold text-gray-900 dark:text-white text-sm sm:text-base">{t('clinicalNotesDisplay.objective')}</h3>
                    </div>
                    <p className="text-gray-700 dark:text-gray-300 text-sm leading-relaxed pl-4">{soapNote.objective}</p>
                  </div>
                  <div className="space-y-3">
                    <div className="flex items-center space-x-2">
                      <div className="w-2 h-2 bg-orange-500 rounded-full"></div>
                      <h3 className="font-semibold text-gray-900 dark:text-white text-sm sm:text-base">{t('clinicalNotesDisplay.assessment')}</h3>
                    </div>
                    <p className="text-gray-700 dark:text-gray-300 text-sm leading-relaxed pl-4">{soapNote.assessment}</p>
                  </div>
                  <div className="space-y-3">
                    <div className="flex items-center space-x-2">
                      <div className="w-2 h-2 bg-pink-500 rounded-full"></div>
                      <h3 className="font-semibold text-gray-900 dark:text-white text-sm sm:text-base">{t('clinicalNotesDisplay.plan')}</h3>
                    </div>
                    <p className="text-gray-700 dark:text-gray-300 text-sm leading-relaxed pl-4">{soapNote.plan}</p>
                  </div>
                </div>
                <div className="absolute inset-0 bg-linear-to-r from-transparent via-white/2 dark:via-white/1 to-transparent opacity-0 group-hover:opacity-100 transition-opacity duration-300 pointer-events-none rounded-xl"></div>
              </div>
            );
          }
          return null;
        })}
        {combinedNotes.length === 0 && (
          <div className="text-center py-12 sm:py-16">
            <div className="inline-flex items-center justify-center w-12 h-12 sm:w-16 sm:h-16 bg-gray-100 dark:bg-gray-800/50 rounded-full mb-4">
              <FileText className="h-6 w-6 sm:h-8 sm:w-8 text-gray-400 dark:text-gray-600" />
            </div>
            <h3 className="text-base sm:text-lg font-semibold text-gray-900 dark:text-white mb-2">{t('clinicalNotesDisplay.noNotesYet')}</h3>
            <p className="text-gray-500 dark:text-gray-400 max-w-md mx-auto text-sm sm:text-base px-4">
              {t('clinicalNotesDisplay.startDocumenting')}
            </p>
          </div>
        )}
      </div>
    </div>
  );
}