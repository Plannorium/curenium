"use client";

import { useState, useEffect } from 'react';
import { useRef } from 'react';
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { Button } from "@/components/ui/button";
import { Badge } from "@/components/ui/badge";
import { Avatar, AvatarFallback, AvatarImage } from "@/components/ui/avatar";
import {
  FileText,
  Plus,
  Eye,
  QrCode,
  Download,
  Share2,
  Clock,
  User,
  Calendar,
  Play,
  Pause,
  Volume2,
  RotateCcw
} from "lucide-react";
import { toast } from "sonner";
import { useLanguage } from '@/contexts/LanguageContext';
import { dashboardTranslations } from '@/lib/dashboard-translations';
import { useAudioPlayer } from '@/hooks/useAudioPlayer';
import { HandoffReportModal } from './HandoffReportModal';

interface HandoffNote {
  _id: string;
  type: 'ward' | 'department' | 'shift' | 'patient';
  situation?: string;
  background?: string;
  assessment?: string;
  recommendation?: string;
  qrCode?: string;
  situationVoiceRecording?: string;
  backgroundVoiceRecording?: string;
  assessmentVoiceRecording?: string;
  recommendationVoiceRecording?: string;
  visibility: 'team' | 'private' | 'public';
  author: {
    fullName: string;
    image?: string;
    initials?: string;
  };
  shiftId?: {
    shiftDate: string;
    scheduledStart: string;
    scheduledEnd: string;
  };
  patientId?: {
    firstName: string;
    lastName: string;
  };
  wardId?: {
    name: string;
    wardNumber: string;
  };
  departmentId?: {
    name: string;
  };
  createdAt: string;
}

interface HandoffReportsDisplayProps {
  patientId?: string;
  shiftId?: string;
  wardId?: string;
  departmentId?: string;
  type?: 'ward' | 'department' | 'shift' | 'patient';
  allowedTypes?: ('ward' | 'department' | 'shift' | 'patient')[];
}

export default function HandoffReportsDisplay({ patientId, shiftId, wardId, departmentId, type, allowedTypes }: HandoffReportsDisplayProps) {
  const { language } = useLanguage();
  const t = (key: string) => {
    const keys = key.split('.');
    let value: any = dashboardTranslations[language as keyof typeof dashboardTranslations];
    for (const k of keys) {
      value = value?.[k];
    }
    return value || key;
  };

  const [reports, setReports] = useState<HandoffNote[]>([]);
  const [loading, setLoading] = useState(true);
  const [showModal, setShowModal] = useState(false);
  const [playingAudio, setPlayingAudio] = useState<{ reportId: string; field: string; isPlaying: boolean } | null>(null);
  const reportFieldsRef = useRef<Record<string, string[]>>({});
  const { playingId, setOnUpdate, toggleSequence, restartSequence, stop } = useAudioPlayer();

  // Register update callback from the audio hook to reflect playing state and field
  useEffect(() => {
    setOnUpdate((payload) => {
      if (!payload.isPlaying) {
        setPlayingAudio(null);
        return;
      }
      const id = payload.id as string | null;
      if (!id) {
        setPlayingAudio(null);
        return;
      }
      const fields = reportFieldsRef.current[id] || [];
      let fieldName: string | null = null;
      if (payload.field != null) {
        const idx = parseInt(String(payload.field), 10);
        if (!isNaN(idx) && fields[idx]) fieldName = fields[idx];
      }
      // Fallback: if we couldn't map index to name, leave as null
      setPlayingAudio({ reportId: id, field: fieldName || '', isPlaying: true });
    });

    return () => setOnUpdate(null);
  }, [setOnUpdate]);

  useEffect(() => {
    fetchReports();
  }, [patientId, shiftId, wardId, departmentId, type]);

  const fetchReports = async () => {
    setLoading(true);
    try {
      const params = new URLSearchParams();
      if (patientId) params.append('patientId', patientId);
      if (shiftId) params.append('shiftId', shiftId);
      if (wardId) params.append('wardId', wardId);
      if (departmentId) params.append('departmentId', departmentId);
      if (type) params.append('type', type);

      const response = await fetch(`/api/notes/handoff?${params}`);
      if (response.ok) {
        const data = await response.json();
        setReports(data as HandoffNote[]);
      } else {
        toast.error('Failed to fetch handoff reports');
      }
    } catch (error) {
      console.error('Error fetching handoff reports:', error);
      toast.error('Error fetching handoff reports');
    } finally {
      setLoading(false);
    }
  };

  const handleReportAdded = () => {
    setShowModal(false);
    fetchReports();
  };

  const downloadQRCode = async (report: HandoffNote) => {
    if (!report.qrCode) {
      toast.error('No QR code available for this report');
      return;
    }

    try {
      // Create a temporary anchor element to trigger download
      const link = document.createElement('a');
      link.href = report.qrCode;
      link.download = `handoff-qr-${report._id}.png`;
      document.body.appendChild(link);
      link.click();
      document.body.removeChild(link);

      toast.success('QR code downloaded successfully');
    } catch (error) {
      console.error('Error downloading QR code:', error);
      toast.error('Error downloading QR code');
    }
  };

  const shareInChat = async (report: HandoffNote) => {
    if (!report.qrCode) {
      toast.error('No QR code available for this report');
      return;
    }

    try {
      // Copy QR code data to clipboard for sharing in platform channels
      await navigator.clipboard.writeText(report.qrCode);
      toast.success('QR code copied! Share it in any channel within the platform.');
    } catch (error) {
      console.error('Error copying QR code:', error);
      toast.error('Failed to copy QR code. Please try again.');
    }
  };

  const toggleAudioPlayback = (reportId: string) => {
    const report = reports.find(r => r._id === reportId);
    if (!report) return;

    const voiceUrls = [
      { field: 'situation', url: report.situationVoiceRecording },
      { field: 'background', url: report.backgroundVoiceRecording },
      { field: 'assessment', url: report.assessmentVoiceRecording },
      { field: 'recommendation', url: report.recommendationVoiceRecording }
    ].filter(item => item.url) as { field: string; url: string }[];

    if (voiceUrls.length === 0) return;

    // Use audio player hook to play the sequence for this report
    const urls = voiceUrls.map(v => v.url);
    reportFieldsRef.current[reportId] = voiceUrls.map(v => v.field);
    toggleSequence(urls, reportId);
  };

  const restartAudioPlayback = (reportId: string) => {
    const report = reports.find(r => r._id === reportId);
    if (!report) return;
    const voiceUrls = [
      { field: 'situation', url: report.situationVoiceRecording },
      { field: 'background', url: report.backgroundVoiceRecording },
      { field: 'assessment', url: report.assessmentVoiceRecording },
      { field: 'recommendation', url: report.recommendationVoiceRecording }
    ].filter(item => item.url) as { field: string; url: string }[];
    if (voiceUrls.length === 0) return;
    const urls = voiceUrls.map(v => v.url);
    reportFieldsRef.current[reportId] = voiceUrls.map(v => v.field);
    restartSequence(urls, reportId);
  };

  if (loading) {
    return (
      <div className="space-y-4">
        {Array.from({ length: 3 }).map((_, i) => (
          <Card key={i} className="animate-pulse">
            <CardContent className="p-6">
              <div className="space-y-3">
                <div className="h-4 bg-gray-300 rounded w-1/4"></div>
                <div className="h-3 bg-gray-300 rounded w-1/2"></div>
                <div className="h-3 bg-gray-300 rounded w-3/4"></div>
              </div>
            </CardContent>
          </Card>
        ))}
      </div>
    );
  }

  return (
    <div className="space-y-6">
      <div className="flex items-center justify-between">
        <div>
          <h3 className="text-lg font-semibold text-gray-900 dark:text-white">
            {t('handoff.sbarTitle')}
          </h3>
          <p className="text-sm text-muted-foreground">
            {t('handoff.description')}
          </p>
        </div>
        <Button
          onClick={() => setShowModal(true)}
          className="flex items-center gap-2"
        >
          <Plus className="h-4 w-4" />
          {t('handoff.newReport')}
        </Button>
      </div>

      {reports.length === 0 ? (
        <Card className="bg-gray-50/50 dark:bg-gray-900/50">
          <CardContent className="p-8 text-center">
            <FileText className="h-12 w-12 text-muted-foreground mx-auto mb-4" />
            <h3 className="text-lg font-semibold text-gray-900 dark:text-white mb-2">
              {t('handoff.noReports')}
            </h3>
            <p className="text-muted-foreground mb-4">
              {t('handoff.createFirst')}
            </p>
            <Button onClick={() => setShowModal(true)}>
              <Plus className="h-4 w-4 mr-2" />
              {t('handoff.createFirstButton')}
            </Button>
          </CardContent>
        </Card>
      ) : (
        <div className="space-y-4">
          {reports.map((report) => (
            <Card key={report._id} className="hover:shadow-md transition-shadow">
              <CardContent className="p-6">
                <div className="flex items-start justify-between mb-4">
                  <div className="flex items-center space-x-3">
                    <Avatar className="h-8 w-8">
                      <AvatarImage src={report.author.image} />
                      <AvatarFallback className="text-xs">
                        {report.author.initials || report.author.fullName.split(' ').map(n => n[0]).join('')}
                      </AvatarFallback>
                    </Avatar>
                    <div>
                      <p className="font-medium text-sm">{report.author.fullName}</p>
                      <div className="flex items-center space-x-2 text-xs text-muted-foreground">
                        <Clock className="h-3 w-3" />
                        <span>{new Date(report.createdAt).toLocaleString()}</span>
                        {report.shiftId && (
                          <>
                            <Calendar className="h-3 w-3" />
                            <span>{new Date(report.shiftId.shiftDate).toLocaleDateString()}</span>
                          </>
                        )}
                        {report.patientId && (
                          <>
                            <User className="h-3 w-3" />
                            <span>{report.patientId.firstName} {report.patientId.lastName}</span>
                          </>
                        )}
                        {report.wardId && (
                          <>
                            <span className="text-xs">🏥</span>
                            <span>{report.wardId.name} ({report.wardId.wardNumber})</span>
                          </>
                        )}
                        {report.departmentId && (
                          <>
                            <span className="text-xs">🏢</span>
                            <span>{report.departmentId.name}</span>
                          </>
                        )}
                      </div>
                    </div>
                  </div>
                  <div className="flex items-center space-x-2">
                    <Badge variant="outline" className="text-xs capitalize">
                      {report.type}
                    </Badge>
                    <Badge variant="outline" className="text-xs">
                      {report.visibility}
                    </Badge>
                    {(report.qrCode || report.situationVoiceRecording || report.backgroundVoiceRecording || report.assessmentVoiceRecording || report.recommendationVoiceRecording) && (
                      <div className="flex space-x-1">
                        {(report.situationVoiceRecording || report.backgroundVoiceRecording || report.assessmentVoiceRecording || report.recommendationVoiceRecording) && (
                          <div className="flex space-x-1">
                            <Button
                              variant="ghost"
                              size="sm"
                              onClick={() => toggleAudioPlayback(report._id)}
                              className="h-8 w-8 p-0"
                            >
                              {playingAudio?.reportId === report._id && playingAudio?.isPlaying ? (
                                <Pause className="h-4 w-4" />
                              ) : (
                                <Play className="h-4 w-4" />
                              )}
                            </Button>
                            {playingAudio?.reportId === report._id && (
                              <Button
                                variant="ghost"
                                size="sm"
                                onClick={() => restartAudioPlayback(report._id)}
                                className="h-8 w-8 p-0"
                                title="Restart playback"
                              >
                                <RotateCcw className="h-4 w-4" />
                              </Button>
                            )}
                          </div>
                        )}
                        {report.qrCode && (
                          <>
                            <Button
                              variant="ghost"
                              size="sm"
                              onClick={() => downloadQRCode(report)}
                              className="h-8 w-8 p-0"
                              title="Download QR Code"
                            >
                              <Download className="h-4 w-4" />
                            </Button>
                            <Button
                              variant="ghost"
                              size="sm"
                              onClick={() => shareInChat(report)}
                              className="h-8 w-8 p-0"
                            >
                              <Share2 className="h-4 w-4" />
                            </Button>
                          </>
                        )}
                      </div>
                    )}
                  </div>
                </div>

                <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                  <div className={`p-3 rounded-lg transition-colors ${playingAudio?.reportId === report._id && playingAudio?.field === 'situation' ? 'bg-blue-50 dark:bg-blue-900/20 border border-blue-200 dark:border-blue-800' : ''}`}>
                    <div className="flex items-center gap-2 mb-1">
                      <h4 className="font-medium text-sm text-blue-600 dark:text-blue-400">
                        {t('handoff.situationLabel')}
                      </h4>
                      {report.situationVoiceRecording && (
                        <Volume2 className={`h-3 w-3 ${playingAudio?.reportId === report._id && playingAudio?.field === 'situation' ? 'text-blue-600 animate-pulse' : 'text-blue-500'}`} />
                      )}
                    </div>
                    <p className="text-sm text-gray-700 dark:text-gray-300 line-clamp-2">
                      {report.situation || (report.situationVoiceRecording ? 'Voice recording available' : 'No content')}
                    </p>
                  </div>
                  <div className={`p-3 rounded-lg transition-colors ${playingAudio?.reportId === report._id && playingAudio?.field === 'background' ? 'bg-green-50 dark:bg-green-900/20 border border-green-200 dark:border-green-800' : ''}`}>
                    <div className="flex items-center gap-2 mb-1">
                      <h4 className="font-medium text-sm text-green-600 dark:text-green-400">
                        {t('handoff.backgroundLabel')}
                      </h4>
                      {report.backgroundVoiceRecording && (
                        <Volume2 className={`h-3 w-3 ${playingAudio?.reportId === report._id && playingAudio?.field === 'background' ? 'text-green-600 animate-pulse' : 'text-green-500'}`} />
                      )}
                    </div>
                    <p className="text-sm text-gray-700 dark:text-gray-300 line-clamp-2">
                      {report.background || (report.backgroundVoiceRecording ? 'Voice recording available' : 'No content')}
                    </p>
                  </div>
                  <div className={`p-3 rounded-lg transition-colors ${playingAudio?.reportId === report._id && playingAudio?.field === 'assessment' ? 'bg-orange-50 dark:bg-orange-900/20 border border-orange-200 dark:border-orange-800' : ''}`}>
                    <div className="flex items-center gap-2 mb-1">
                      <h4 className="font-medium text-sm text-orange-600 dark:text-orange-400">
                        {t('handoff.assessmentLabel')}
                      </h4>
                      {report.assessmentVoiceRecording && (
                        <Volume2 className={`h-3 w-3 ${playingAudio?.reportId === report._id && playingAudio?.field === 'assessment' ? 'text-orange-600 animate-pulse' : 'text-orange-500'}`} />
                      )}
                    </div>
                    <p className="text-sm text-gray-700 dark:text-gray-300 line-clamp-2">
                      {report.assessment || (report.assessmentVoiceRecording ? 'Voice recording available' : 'No content')}
                    </p>
                  </div>
                  <div className={`p-3 rounded-lg transition-colors ${playingAudio?.reportId === report._id && playingAudio?.field === 'recommendation' ? 'bg-purple-50 dark:bg-purple-900/20 border border-purple-200 dark:border-purple-800' : ''}`}>
                    <div className="flex items-center gap-2 mb-1">
                      <h4 className="font-medium text-sm text-purple-600 dark:text-purple-400">
                        {t('handoff.recommendationLabel')}
                      </h4>
                      {report.recommendationVoiceRecording && (
                        <Volume2 className={`h-3 w-3 ${playingAudio?.reportId === report._id && playingAudio?.field === 'recommendation' ? 'text-purple-600 animate-pulse' : 'text-purple-500'}`} />
                      )}
                    </div>
                    <p className="text-sm text-gray-700 dark:text-gray-300 line-clamp-2">
                      {report.recommendation || (report.recommendationVoiceRecording ? 'Voice recording available' : 'No content')}
                    </p>
                  </div>
                </div>

                {report.qrCode && (
                  <div className="mt-4 flex justify-end">
                    <img
                      src={report.qrCode}
                      alt="QR Code"
                      className="w-16 h-16 border rounded"
                    />
                  </div>
                )}
              </CardContent>
            </Card>
          ))}
        </div>
      )}

      {/* Audio playback handled by shared hook (no hidden DOM audio elements here) */}

      <HandoffReportModal
        patientId={patientId}
        shiftId={shiftId}
        wardId={wardId}
        departmentId={departmentId}
        defaultType={type}
        allowedTypes={allowedTypes}
        isOpen={showModal}
        onClose={() => setShowModal(false)}
        onReportAdded={handleReportAdded}
      />
    </div>
  );
}