"use client";

import { useState, useRef, useEffect, useCallback } from 'react';
import { Button } from "@/components/ui/button";
import { Dialog, DialogContent, DialogHeader, DialogTitle, DialogFooter } from "@/components/ui/dialog";
import { Textarea } from "@/components/ui/textarea";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import { toast } from 'sonner';
import { useSession } from 'next-auth/react';
import { FileText, Mic, MicOff } from 'lucide-react';
import { useLanguage } from '@/contexts/LanguageContext';
import { dashboardTranslations } from '@/lib/dashboard-translations';
import SpeechRecognition, { useSpeechRecognition } from 'react-speech-recognition';
import { useChat } from '@/hooks/useChat';
import { VoiceRecorder } from './VoiceRecorder';

interface HandoffReportModalProps {
  patientId?: string;
  shiftId?: string;
  isOpen: boolean;
  onClose: () => void;
  onReportAdded: () => void;
}

interface SBARData {
  situation: string;
  background: string;
  assessment: string;
  recommendation: string;
}

export function HandoffReportModal({ patientId, shiftId, isOpen, onClose, onReportAdded }: HandoffReportModalProps) {
  const { data: session } = useSession();
  const { language } = useLanguage();
  // Provide a room identifier to the chat hook. Use patientId when available,
  // otherwise fall back to a global room so hook has the required parameter.
  const { sendCombinedMessage } = useChat(patientId ?? 'global');
  const t = (key: string) => {
    const keys = key.split('.');
    let value: any = dashboardTranslations[language as keyof typeof dashboardTranslations];
    for (const k of keys) {
      value = value?.[k];
    }
    return value || key;
  };

  const [sbar, setSbar] = useState<SBARData>({
    situation: '',
    background: '',
    assessment: '',
    recommendation: ''
  });
  const [voiceRecordings, setVoiceRecordings] = useState<{[K in keyof SBARData]?: { blob?: Blob; url?: string; publicId?: string }}>({});
  const [isUploadingVoice, setIsUploadingVoice] = useState(false);
  const [isListening, setIsListening] = useState(false);
  const [currentField, setCurrentField] = useState<keyof SBARData | null>(null);

  const { transcript, listening, resetTranscript, browserSupportsSpeechRecognition } = useSpeechRecognition();
  const lastTranscriptLengthRef = useRef(0);

  useEffect(() => {
    if (!currentField) return;
    const delta = transcript.slice(lastTranscriptLengthRef.current);
    lastTranscriptLengthRef.current = transcript.length;
    if (!delta.trim()) return;
    setSbar(prev => ({
      ...prev,
      [currentField]: `${prev[currentField]} ${delta}`.trim()
    }));
  }, [transcript, currentField]);

  const stopListening = useCallback(() => {
    setIsListening(false);
    setCurrentField(null);
    SpeechRecognition.stopListening();
  }, []);


  useEffect(() => {
    if (!isOpen && isListening) {
      stopListening();
      resetTranscript();
    }
  }, [isOpen, isListening, stopListening, resetTranscript]);

  const startListening = (field: keyof SBARData) => {
    if (!browserSupportsSpeechRecognition) {
      toast.error(t('handoff.browserNotSupportSpeech'));
      return;
    }
    setCurrentField(field);
    setIsListening(true);
    resetTranscript();
    SpeechRecognition.startListening({ continuous: true, interimResults: true });
  };



  const exportPDF = async () => {
    try {
      const response = await fetch('/api/notes/handoff', {
        method: 'POST',
        headers: {
          'Content-Type': 'application/json',
        },
        body: JSON.stringify({
          patientId,
          shiftId,
          sbar,
          type: 'patient',
          exportPDF: true
        }),
      });

      if (response.ok) {
        const blob = await response.blob();
        const url = window.URL.createObjectURL(blob);
        const a = document.createElement('a');
        a.href = url;
        a.download = `handoff-report-${Date.now()}.pdf`;
        document.body.appendChild(a);
        a.click();
        window.URL.revokeObjectURL(url);
        document.body.removeChild(a);
        toast.success(t('handoff.pdfExported'));
      } else {
        toast.error(t('handoff.failedToExportPDF'));
      }
    } catch (error) {
      toast.error(t('handoff.errorExportingPDF'));
    }
  };

  const handleSubmit = async () => {
    // Validate that each SBAR field has either typed text or a voice recording
    const fields: (keyof SBARData)[] = ['situation', 'background', 'assessment', 'recommendation'];
    for (const f of fields) {
      if (!sbar[f] && !voiceRecordings[f]?.url) {
        toast.error(t('handoff.fieldRequired'));
        return;
      }
    }

    try {
      const response = await fetch('/api/notes/handoff', {
        method: 'POST',
        headers: {
          'Content-Type': 'application/json',
        },
        body: JSON.stringify({
          patientId,
          shiftId,
          sbar,
          voiceRecordings: {
            situation: voiceRecordings.situation?.url,
            background: voiceRecordings.background?.url,
            assessment: voiceRecordings.assessment?.url,
            recommendation: voiceRecordings.recommendation?.url,
          }
        }),
      });

      if (response.ok) {
        toast.success(t('handoff.reportSaved'));
        onReportAdded();
        onClose();
        // Reset form
        setSbar({ situation: '', background: '', assessment: '', recommendation: '' });
        setVoiceRecordings({});
      } else {
        toast.error(t('handoff.saveFailed'));
      }
    } catch (error) {
      console.error('Error adding handoff report', error);
      toast.error(t('handoff.saveFailed'));
    }
  };

  // Upload voice blob for a specific SBAR field
  const handleVoiceRecording = async (field: keyof SBARData, audioBlob: Blob, transcript?: string) => {
    try {
      setIsUploadingVoice(true);
      const fd = new FormData();
      fd.append('file', audioBlob, `handoff-${field}-${Date.now()}.webm`);

      const res = await fetch('/api/upload-voice', {
        method: 'POST',
        body: fd,
      });

      if (!res.ok) throw new Error('Upload failed');
      const data: any = await res.json();

      setVoiceRecordings(prev => ({ ...prev, [field]: { blob: audioBlob, url: data.url, publicId: data.publicId } }));

      // If transcript provided and field empty, set text
      if (transcript && !sbar[field]) {
        setSbar(prev => ({ ...prev, [field]: transcript }));
      }

      toast.success(t('handoff.voiceUploadSuccess'));
    } catch (err) {
      console.error('Voice upload error', err);
      toast.error(t('handoff.voiceUploadFailed'));
    } finally {
      setIsUploadingVoice(false);
    }
  };

  const handleVoiceRecordingCanceled = async (field: keyof SBARData) => {
    const recording = voiceRecordings[field];
    if (recording?.publicId) {
      try {
        await fetch('/api/upload-voice', {
          method: 'DELETE',
          headers: {
            'Content-Type': 'application/json',
          },
          body: JSON.stringify({ publicId: recording.publicId }),
        });
      } catch (error) {
        console.error('Error deleting voice recording from Cloudinary:', error);
        toast.error(t('handoff.voiceDeleteFailed'));
        return;
      }
    }
    setVoiceRecordings(prev => {
      const next = { ...prev };
      delete next[field];
      return next;
    });
    toast.info(t('handoff.voiceRemoved'));
  };
  

  const renderField = (field: keyof SBARData, label: string, placeholder: string) => (
    <div className="space-y-2">
      <div className="flex items-center justify-between">
        <Label htmlFor={field} className="text-sm font-semibold text-gray-800 dark:text-gray-200">
          {t(`handoff.${field}Label`)}
        </Label>
        <Button
          type="button"
          variant="ghost"
          size="sm"
          onClick={() => isListening && currentField === field ? stopListening() : startListening(field)}
          className={`p-2 ${isListening && currentField === field ? 'bg-red-100 text-red-600' : 'hover:bg-blue-50 text-blue-600'}`}
        >
          {isListening && currentField === field ? <MicOff className="h-4 w-4" /> : <Mic className="h-4 w-4" />}
        </Button>
      </div>
      <Textarea
        id={field}
        placeholder={t(`handoff.${field}Placeholder`)}
        value={sbar[field]}
        onChange={(e) => setSbar(prev => ({ ...prev, [field]: e.target.value }))}
        rows={4}
        className="bg-gray-50/80 dark:bg-gray-900/80 border-gray-200/70 dark:border-gray-700/60 focus:border-blue-400 dark:focus:border-blue-500 rounded-xl resize-none transition-all duration-200"
      />
      <VoiceRecorder
        fieldName={`${t(`handoff.${field}Label`)} Voice Recording`}
        onRecordingComplete={(audioBlob, transcript) => handleVoiceRecording(field, audioBlob, transcript)}
        onRecordingCanceled={() => handleVoiceRecordingCanceled(field)}
        maxDuration={300}
      />
    </div>
  );

  return (
    <Dialog open={isOpen} onOpenChange={onClose}>
      <DialogContent className="sm:max-w-[700px] max-h-[90vh] overflow-y-auto bg-white/90 dark:bg-gray-950/90 backdrop-blur-lg border border-gray-200/50 dark:border-gray-800/50 shadow-2xl p-10 rounded-2xl">
        <DialogHeader className="pb-4">
          <div className="flex items-center space-x-3 mb-2">
            <div className="p-2 bg-linear-to-br from-green-500 to-green-600 rounded-lg shadow-lg">
              <FileText className="h-5 w-5 text-white" />
            </div>
            <DialogTitle className="text-xl font-bold bg-linear-to-r from-gray-900 via-gray-800 to-gray-900 dark:from-white dark:via-gray-100 dark:to-white bg-clip-text text-transparent">
              {t('handoff.modalTitle')}
            </DialogTitle>
          </div>
          <p className="text-sm text-muted-foreground">
            {t('handoff.modalDescription')}
          </p>
        </DialogHeader>

        <div className="space-y-6 py-4">
          {renderField('situation', 'S - Situation', 'What is happening right now?')}
          {renderField('background', 'B - Background', 'What is the context and relevant history?')}
          {renderField('assessment', 'A - Assessment', 'What do I think the problem is?')}
          {renderField('recommendation', 'R - Recommendation', 'What should be done next?')}


        </div>

        <DialogFooter className="pt-4 border-t border-gray-200/50 dark:border-gray-700/50">
          <Button
            type="button"
            variant="ghost"
            onClick={onClose}
            className="hover:bg-gray-100 dark:hover:bg-gray-800/50 rounded-xl transition-all duration-200"
          >
            {t('common.cancel')}
          </Button>
          <Button
            type="button"
            onClick={handleSubmit}
            className="bg-linear-to-r from-green-500 to-green-600 hover:from-green-600 hover:to-green-700 text-white shadow-lg hover:shadow-xl transition-all duration-300 rounded-xl px-6"
          >
            {t('handoff.saveReport')}
          </Button>
        </DialogFooter>
      </DialogContent>
    </Dialog>
  );
}