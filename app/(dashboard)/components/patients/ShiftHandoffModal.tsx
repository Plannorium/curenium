"use client";

import { useState, useRef, useEffect } from "react";
import { Dialog, DialogContent, DialogHeader, DialogTitle, DialogTrigger } from "@/components/ui/dialog";
import { Button } from "@/components/ui/button";
import { Textarea } from "@/components/ui/textarea";
import { Label } from "@/components/ui/label";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { Badge } from "@/components/ui/badge";
import { Avatar, AvatarFallback, AvatarImage } from "@/components/ui/avatar";
import { toast } from "sonner";
import { Mic, MicOff, Play, Pause, Square, RotateCcw, Download, Share2, FileText, Clock, User, MapPin } from "lucide-react";
import {VoiceRecorder} from "./VoiceRecorder";
import { useSession } from "next-auth/react";
import { useLanguage } from '@/contexts/LanguageContext';
import { dashboardTranslations } from '@/lib/dashboard-translations';

interface ShiftHandoffModalProps {
  children: React.ReactNode;
  wardId?: string;
  departmentId?: string;
  type: 'ward' | 'department' | 'shift';
  onHandoffCreated?: () => void;
}

interface ShiftHandoffData {
  type: 'ward' | 'department' | 'shift';
  wardId?: string;
  departmentId?: string;
  shiftId?: string;
  overview: string;
  situationsManaged: string;
  incidentsOccurred: string;
  recommendations: string;
  additionalNotes: string;
  voiceRecordings: {
    overview?: string;
    situationsManaged?: string;
    incidentsOccurred?: string;
    recommendations?: string;
  };
  createdBy: string;
  createdAt: string;
}

const ShiftHandoffModal = ({ children, wardId, departmentId, type, onHandoffCreated }: ShiftHandoffModalProps) => {
  const { data: session } = useSession();
  const { language } = useLanguage();
  const t = (key: string) => {
    const keys = key.split('.');
    let value: any = dashboardTranslations[language as keyof typeof dashboardTranslations];
    for (const k of keys) {
      value = value?.[k];
    }
    return value || key;
  };

  const [open, setOpen] = useState(false);
  const [loading, setLoading] = useState(false);
  const [formData, setFormData] = useState({
    overview: '',
    situationsManaged: '',
    incidentsOccurred: '',
    recommendations: '',
    additionalNotes: ''
  });

  const [voiceRecordings, setVoiceRecordings] = useState<{[key: string]: {blob: Blob, url?: string}}>({});
  const [isUploadingVoice, setIsUploadingVoice] = useState(false);

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    if (!session?.user?.id) return;

    setLoading(true);
    try {
      const handoffData: ShiftHandoffData = {
        type,
        wardId: type === 'ward' ? wardId : undefined,
        departmentId: type === 'department' ? departmentId : undefined,
        overview: formData.overview,
        situationsManaged: formData.situationsManaged,
        incidentsOccurred: formData.incidentsOccurred,
        recommendations: formData.recommendations,
        additionalNotes: formData.additionalNotes,
        voiceRecordings: {
          overview: voiceRecordings.overview?.url,
          situationsManaged: voiceRecordings.situationsManaged?.url,
          incidentsOccurred: voiceRecordings.incidentsOccurred?.url,
          recommendations: voiceRecordings.recommendations?.url,
        },
        createdBy: session.user.id,
        createdAt: new Date().toISOString()
      };

      const response = await fetch('/api/notes/shift-handoff', {
        method: 'POST',
        headers: {
          'Content-Type': 'application/json',
        },
        body: JSON.stringify(handoffData),
      });

      if (response.ok) {
        toast.success(t('shiftHandoff.reportCreated'));
        setOpen(false);
        setFormData({
          overview: '',
          situationsManaged: '',
          incidentsOccurred: '',
          recommendations: '',
          additionalNotes: ''
        });
        setVoiceRecordings({});
        onHandoffCreated?.();
      } else {
        const error: any = await response.json();
        toast.error(error.message || t('shiftHandoff.failedToCreate'));
      }
    } catch (error: unknown) {
      console.error('Error creating handoff:', error);
      toast.error(t('shiftHandoff.errorCreating'));
    } finally {
      setLoading(false);
    }
  };

  const handleVoiceRecording = async (field: string, audioBlob: Blob, transcript?: string) => {
    try {
      setIsUploadingVoice(true);

      // Upload to Cloudinary
      const formData = new FormData();
      formData.append('file', audioBlob, `voice-${field}-${Date.now()}.wav`);

      const response = await fetch('/api/upload-voice', {
        method: 'POST',
        body: formData,
      });

      if (response.ok) {
        const result: any = await response.json();
        setVoiceRecordings(prev => ({
          ...prev,
          [field]: { blob: audioBlob, url: result.url }
        }));

        toast.success(`Voice recording for ${field} uploaded successfully`);
      } else {
        throw new Error('Upload failed');
      }
    } catch (error) {
      console.error('Voice upload error:', error);
      toast.error('Failed to upload voice recording');
    } finally {
      setIsUploadingVoice(false);
    }
  };

  const handleVoiceRecordingCanceled = (field: string) => {
    setVoiceRecordings(prev => {
      const newRecordings = { ...prev };
      delete newRecordings[field];
      return newRecordings;
    });
    toast.info(`Voice recording for ${field} removed`);
  };

  return (
    <Dialog open={open} onOpenChange={setOpen}>
      <DialogTrigger asChild>
        {children}
      </DialogTrigger>
      <DialogContent className="max-w-4xl max-h-[90vh] overflow-y-auto p-10 rounded-2xl">
        <DialogHeader>
          <DialogTitle className="flex items-center gap-2">
            <FileText className="h-5 w-5" />
            {t('shiftHandoff.modalTitle').replace('{type}', type.charAt(0).toUpperCase() + type.slice(1))}
          </DialogTitle>
        </DialogHeader>

        <form onSubmit={handleSubmit} className="space-y-6">
          {/* Overview Section */}
          <Card>
            <CardHeader>
              <CardTitle className="text-lg flex items-center gap-2">
                <User className="h-4 w-4" />
                {t('shiftHandoff.wardOverview')}
              </CardTitle>
            </CardHeader>
            <CardContent className="space-y-4">
              <div>
                <Label htmlFor="overview">{t('shiftHandoff.whatEncountered')}</Label>
                <Textarea
                  id="overview"
                  value={formData.overview}
                  onChange={(e) => setFormData(prev => ({ ...prev, overview: e.target.value }))}
                  placeholder={t('shiftHandoff.overviewPlaceholder')}
                  className="mt-1 min-h-[80px]"
                />
              </div>
              <VoiceRecorder
                onRecordingComplete={(blob, transcript) => handleVoiceRecording('overview', blob, transcript)}
                onRecordingCanceled={() => handleVoiceRecordingCanceled('overview')}
                fieldName={t('shiftHandoff.wardDepartmentOverview')}
                maxDuration={120}
              />
            </CardContent>
          </Card>

          {/* Situations Managed */}
          <Card>
            <CardHeader>
              <CardTitle className="text-lg flex items-center gap-2">
                <Clock className="h-4 w-4" />
                {t('shiftHandoff.situationsManaged')}
              </CardTitle>
            </CardHeader>
            <CardContent className="space-y-4">
              <div>
                <Label htmlFor="situationsManaged">{t('shiftHandoff.situationsManagedDesc')}</Label>
                <Textarea
                  id="situationsManaged"
                  value={formData.situationsManaged}
                  onChange={(e) => setFormData(prev => ({ ...prev, situationsManaged: e.target.value }))}
                  placeholder={t('shiftHandoff.situationsPlaceholder')}
                  className="mt-1 min-h-[80px]"
                />
              </div>
              <VoiceRecorder
                onRecordingComplete={(blob, transcript) => handleVoiceRecording('situationsManaged', blob, transcript)}
                onRecordingCanceled={() => handleVoiceRecordingCanceled('situationsManaged')}
                fieldName={t('shiftHandoff.situationsManaged')}
                maxDuration={120}
              />
            </CardContent>
          </Card>

          {/* Incidents Occurred */}
          <Card>
            <CardHeader>
              <CardTitle className="text-lg flex items-center gap-2">
                <MapPin className="h-4 w-4" />
                {t('shiftHandoff.incidentsEvents')}
              </CardTitle>
            </CardHeader>
            <CardContent className="space-y-4">
              <div>
                <Label htmlFor="incidentsOccurred">{t('shiftHandoff.incidentsDesc')}</Label>
                <Textarea
                  id="incidentsOccurred"
                  value={formData.incidentsOccurred}
                  onChange={(e) => setFormData(prev => ({ ...prev, incidentsOccurred: e.target.value }))}
                  placeholder={t('shiftHandoff.incidentsPlaceholder')}
                  className="mt-1 min-h-[80px]"
                />
              </div>
              <VoiceRecorder
                onRecordingComplete={(blob, transcript) => handleVoiceRecording('incidentsOccurred', blob, transcript)}
                onRecordingCanceled={() => handleVoiceRecordingCanceled('incidentsOccurred')}
                fieldName={t('shiftHandoff.incidentsEvents')}
                maxDuration={120}
              />
            </CardContent>
          </Card>

          {/* Recommendations */}
          <Card>
            <CardHeader>
              <CardTitle className="text-lg flex items-center gap-2">
                <FileText className="h-4 w-4" />
                {t('shiftHandoff.recommendations')}
              </CardTitle>
            </CardHeader>
            <CardContent className="space-y-4">
              <div>
                <Label htmlFor="recommendations">{t('shiftHandoff.recommendationsDesc')}</Label>
                <Textarea
                  id="recommendations"
                  value={formData.recommendations}
                  onChange={(e) => setFormData(prev => ({ ...prev, recommendations: e.target.value }))}
                  placeholder={t('shiftHandoff.recommendationsPlaceholder')}
                  className="mt-1 min-h-[80px]"
                />
              </div>
              <VoiceRecorder
                onRecordingComplete={(blob, transcript) => handleVoiceRecording('recommendations', blob, transcript)}
                onRecordingCanceled={() => handleVoiceRecordingCanceled('recommendations')}
                fieldName={t('shiftHandoff.recommendations')}
                maxDuration={120}
              />
            </CardContent>
          </Card>

          {/* Additional Notes */}
          <Card>
            <CardHeader>
              <CardTitle className="text-lg">{t('shiftHandoff.additionalNotes')}</CardTitle>
            </CardHeader>
            <CardContent>
              <div>
                <Label htmlFor="additionalNotes">{t('shiftHandoff.additionalNotesDesc')}</Label>
                <Textarea
                  id="additionalNotes"
                  value={formData.additionalNotes}
                  onChange={(e) => setFormData(prev => ({ ...prev, additionalNotes: e.target.value }))}
                  placeholder={t('shiftHandoff.additionalNotesPlaceholder')}
                  className="mt-1 min-h-[60px]"
                />
              </div>
            </CardContent>
          </Card>

          {/* Submit Button */}
          <div className="flex justify-end gap-3 pt-4">
            <Button type="button" variant="outline" onClick={() => setOpen(false)}>
              {t('shiftHandoff.cancel')}
            </Button>
            <Button type="submit" disabled={loading || isUploadingVoice}>
              {loading ? t('shiftHandoff.creating') : t('shiftHandoff.createReport')}
            </Button>
          </div>
        </form>
      </DialogContent>
    </Dialog>
  );
};

export default ShiftHandoffModal;