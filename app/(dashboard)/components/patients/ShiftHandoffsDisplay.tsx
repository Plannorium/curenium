"use client";

import { useState, useEffect, useRef } from "react";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { Button } from "@/components/ui/button";
import { Badge } from "@/components/ui/badge";
import { Avatar, AvatarFallback, AvatarImage } from "@/components/ui/avatar";
import { Separator } from "@/components/ui/separator";
import { toast } from "sonner";
import {
  FileText,
  Clock,
  User,
  MapPin,
  Play,
  Pause,
  RotateCcw,
  Download,
  Share2,
  Mic,
  Calendar,
  Building,
  Hospital
} from "lucide-react";
import ShiftHandoffModal from "./ShiftHandoffModal";
import { useSession } from "next-auth/react";
import { useAudioPlayer } from '@/hooks/useAudioPlayer';
import { useLanguage } from '@/contexts/LanguageContext';
import { dashboardTranslations } from '@/lib/dashboard-translations';

interface ShiftHandoff {
  _id: string;
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
  createdBy: {
    _id: string;
    fullName: string;
    image?: string;
    role: string;
  };
  createdAt: string;
  ward?: {
    _id: string;
    name: string;
    wardNumber: string;
  };
  department?: {
    _id: string;
    name: string;
  };
}

interface ShiftHandoffsDisplayProps {
  wardId?: string;
  departmentId?: string;
  type: 'ward' | 'department' | 'shift';
  allowedTypes?: ('ward' | 'department' | 'shift')[];
}

const ShiftHandoffsDisplay = ({
  wardId,
  departmentId,
  type,
  allowedTypes = ['ward', 'department', 'shift']
}: ShiftHandoffsDisplayProps) => {
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

  const [handoffs, setHandoffs] = useState<ShiftHandoff[]>([]);
  const [loading, setLoading] = useState(true);
  const [playingAudio, setPlayingAudio] = useState<string | null>(null);
  const audioFieldsRef = useRef<Record<string, string[]>>({});
  const { playingId, setOnUpdate, togglePlay, restartSequence, stop } = useAudioPlayer();

  useEffect(() => {
    fetchHandoffs();
  }, [wardId, departmentId, type]);

  const fetchHandoffs = async () => {
    setLoading(true);
    try {
      const params = new URLSearchParams();
      if (wardId) params.append('wardId', wardId);
      if (departmentId) params.append('departmentId', departmentId);
      params.append('type', type);

      const response = await fetch(`/api/notes/shift-handoff?${params}`);
      if (response.ok) {
        const data: ShiftHandoff[] = await response.json();
        setHandoffs(data);
      } else {
        toast.error('Failed to fetch handoff reports');
      }
    } catch (error) {
      console.error('Error fetching handoffs:', error);
      toast.error(t('shiftHandoff.failedToCreate'));
    } finally {
      setLoading(false);
    }
  };

  // Wire hook updates to playingAudio state
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
      // For shift handoffs we use ids like `${field}-${handoffId}` so field is embedded
      setPlayingAudio(id);
    });

    return () => setOnUpdate(null);
  }, [setOnUpdate]);

  // Helper restart for single-audio items
  const restartAudio = async (url: string, id: string) => {
    // stop then play
    stop(id);
    await togglePlay(url, id);
  };

  const downloadQR = async (handoffId: string) => {
    try {
      const response = await fetch(`/api/notes/shift-handoff/${handoffId}/qr`);
      if (response.ok) {
        const blob = await response.blob();
        const url = window.URL.createObjectURL(blob);
        const a = document.createElement('a');
        a.href = url;
        a.download = `shift-handoff-${handoffId}-qr.png`;
        document.body.appendChild(a);
        a.click();
        document.body.removeChild(a);
        window.URL.revokeObjectURL(url);
      } else {
        toast.error(t('shiftHandoff.failedToGenerateQR'));
      }
    } catch (error) {
      console.error('Error downloading QR:', error);
      toast.error(t('shiftHandoff.failedToDownloadQR'));
    }
  };

  const shareHandoff = async (handoff: ShiftHandoff) => {
    const shareData = {
      title: `${type.charAt(0).toUpperCase() + type.slice(1)} Shift Handoff`,
      text: `Shift handoff report from ${handoff.createdBy.fullName}`,
      url: `${window.location.origin}/shift-handoff/${handoff._id}`
    };

    try {
      if (navigator.share) {
        await navigator.share(shareData);
      } else {
        // Fallback: copy to clipboard
        await navigator.clipboard.writeText(shareData.url);
        toast.success('Link copied to clipboard');
      }
    } catch (error) {
      console.error('Error sharing:', error);
      toast.error(t('shiftHandoff.failedToShare'));
    }
  };

  const getTypeIcon = (type: string) => {
    switch (type) {
      case 'ward': return <Hospital className="h-4 w-4" />;
      case 'department': return <Building className="h-4 w-4" />;
      case 'shift': return <Clock className="h-4 w-4" />;
      default: return <FileText className="h-4 w-4" />;
    }
  };

  const getTypeColor = (type: string) => {
    switch (type) {
      case 'ward': return 'bg-blue-100 text-blue-800 dark:bg-blue-900/20 dark:text-blue-400';
      case 'department': return 'bg-green-100 text-green-800 dark:bg-green-900/20 dark:text-green-400';
      case 'shift': return 'bg-purple-100 text-purple-800 dark:bg-purple-900/20 dark:text-purple-400';
      default: return 'bg-gray-100 text-gray-800 dark:bg-gray-900/20 dark:text-gray-400';
    }
  };

  if (loading) {
    return (
      <div className="flex items-center justify-center py-8">
        <div className="animate-spin rounded-full h-8 w-8 border-b-2 border-primary"></div>
      </div>
    );
  }

  return (
    <div className="space-y-6">
      {/* Header with Create Button */}
      <div className="flex items-center justify-between">
        <div>
          <h3 className="text-lg font-semibold">
            {t('shiftHandoff.recentHandoffs').replace('{type}', type.charAt(0).toUpperCase() + type.slice(1))}
          </h3>
          <p className="text-sm text-muted-foreground">
            {t('shiftHandoff.shiftHandoffs')}
          </p>
        </div>
        <ShiftHandoffModal
          wardId={wardId}
          departmentId={departmentId}
          type={type}
          onHandoffCreated={fetchHandoffs}
        >
          <Button>
            <FileText className="h-4 w-4 mr-2" />
            {t('shiftHandoff.createHandoffReport')}
          </Button>
        </ShiftHandoffModal>
      </div>

      {/* Handoffs List */}
      {handoffs.length === 0 ? (
        <Card>
          <CardContent className="py-8 text-center">
            <FileText className="h-12 w-12 text-muted-foreground mx-auto mb-4" />
            <h3 className="text-lg font-semibold mb-2">{t('shiftHandoff.noHandoffReports')}</h3>
            <p className="text-muted-foreground">
              {t('shiftHandoff.createFirstHandoff').replace('{type}', type)}
            </p>
          </CardContent>
        </Card>
      ) : (
        <div className="space-y-4">
          {handoffs.map((handoff) => (
            <Card key={handoff._id} className="hover:shadow-md transition-shadow">
              <CardHeader>
                <div className="flex items-start justify-between">
                  <div className="flex items-center gap-3">
                    <Avatar className="h-10 w-10">
                      <AvatarImage src={handoff.createdBy.image || ''} alt={handoff.createdBy.fullName} />
                      <AvatarFallback>
                        {handoff.createdBy.fullName.split(' ').map(n => n[0]).join('')}
                      </AvatarFallback>
                    </Avatar>
                    <div>
                      <div className="flex items-center gap-2">
                        <h4 className="font-semibold">{handoff.createdBy.fullName}</h4>
                        <Badge className={getTypeColor(handoff.type)}>
                          {getTypeIcon(handoff.type)}
                          <span className="ml-1 capitalize">{handoff.type}</span>
                        </Badge>
                      </div>
                      <div className="flex items-center gap-4 text-sm text-muted-foreground">
                        <span className="flex items-center gap-1">
                          <Calendar className="h-3 w-3" />
                          {new Date(handoff.createdAt).toLocaleDateString()}
                        </span>
                        <span className="flex items-center gap-1">
                          <Clock className="h-3 w-3" />
                          {new Date(handoff.createdAt).toLocaleTimeString([], { hour: '2-digit', minute: '2-digit' })}
                        </span>
                        {handoff.ward && (
                          <span className="flex items-center gap-1">
                            <Hospital className="h-3 w-3" />
                            {handoff.ward.name} ({handoff.ward.wardNumber})
                          </span>
                        )}
                        {handoff.department && (
                          <span className="flex items-center gap-1">
                            <Building className="h-3 w-3" />
                            {handoff.department.name}
                          </span>
                        )}
                      </div>
                    </div>
                  </div>
                  <div className="flex gap-2">
                    <Button
                      variant="outline"
                      size="sm"
                      onClick={() => downloadQR(handoff._id)}
                      title={t('shiftHandoff.downloadQR')}
                    >
                      <Download className="h-4 w-4" />
                    </Button>
                    <Button
                      variant="outline"
                      size="sm"
                      onClick={() => shareHandoff(handoff)}
                      title={t('shiftHandoff.shareHandoff')}
                    >
                      <Share2 className="h-4 w-4" />
                    </Button>
                  </div>
                </div>
              </CardHeader>

              <CardContent className="space-y-4">
                {/* Overview */}
                {handoff.voiceRecordings.overview && (
                  <div>
                    <div className="flex items-center gap-2 mb-2">
                      <User className="h-4 w-4 text-blue-600" />
                      <h5 className="font-medium">{t('shiftHandoff.wardDepartmentOverview')}</h5>
                        {handoff.voiceRecordings.overview && (
                        <div className="flex items-center gap-2">
                            <Button
                              variant="ghost"
                              size="sm"
                              onClick={() => togglePlay(handoff.voiceRecordings.overview!, `overview-${handoff._id}`)}
                            >
                              {playingAudio === `overview-${handoff._id}` ? (
                                <Pause className="h-4 w-4" />
                              ) : (
                                <Play className={`h-4 w-4 ${playingAudio === `overview-${handoff._id}` ? 'animate-pulse' : ''}`} />
                              )}
                            </Button>
                          <Button
                            variant="ghost"
                            size="sm"
                            onClick={() => restartAudio(handoff.voiceRecordings.overview!, `overview-${handoff._id}`)}
                            title="Restart playback"
                          >
                            <RotateCcw className="h-4 w-4" />
                          </Button>
                        </div>
                      )}
                    </div>
                    <p className="text-sm text-muted-foreground pl-6">{handoff.overview}</p>
                  </div>
                )}

                {/* Situations Managed */}
                {handoff.voiceRecordings.situationsManaged && (
                  <>
                    <Separator />
                    <div>
                      <div className="flex items-center gap-2 mb-2">
                        <Clock className="h-4 w-4 text-green-600" />
                        <h5 className="font-medium">{t('shiftHandoff.situationsManaged')}</h5>
                        {handoff.voiceRecordings.situationsManaged && (
                          <div className="flex items-center gap-2">
                            <Button
                              variant="ghost"
                              size="sm"
                              onClick={() => togglePlay(handoff.voiceRecordings.situationsManaged!, `situations-${handoff._id}`)}
                            >
                              {playingAudio === `situations-${handoff._id}` ? (
                                <Pause className="h-4 w-4" />
                              ) : (
                                <Play className={`h-4 w-4 ${playingAudio === `situations-${handoff._id}` ? 'animate-pulse' : ''}`} />
                              )}
                            </Button>
                            <Button
                              variant="ghost"
                              size="sm"
                              onClick={() => restartAudio(handoff.voiceRecordings.situationsManaged!, `situations-${handoff._id}`)}
                              title="Restart playback"
                            >
                              <RotateCcw className="h-4 w-4" />
                            </Button>
                          </div>
                        )}
                      </div>
                      <p className="text-sm text-muted-foreground pl-6">{handoff.situationsManaged}</p>
                    </div>
                  </>
                )}

                {/* Incidents Occurred */}
                {handoff.voiceRecordings.incidentsOccurred && (
                  <>
                    <Separator />
                    <div>
                      <div className="flex items-center gap-2 mb-2">
                        <MapPin className="h-4 w-4 text-red-600" />
                        <h5 className="font-medium">{t('shiftHandoff.incidentsEvents')}</h5>
                        {handoff.voiceRecordings.incidentsOccurred && (
                          <div className="flex items-center gap-2">
                            <Button
                              variant="ghost"
                              size="sm"
                              onClick={() => togglePlay(handoff.voiceRecordings.incidentsOccurred!, `incidents-${handoff._id}`)}
                            >
                              {playingAudio === `incidents-${handoff._id}` ? (
                                <Pause className="h-4 w-4" />
                              ) : (
                                <Play className={`h-4 w-4 ${playingAudio === `incidents-${handoff._id}` ? 'animate-pulse' : ''}`} />
                              )}
                            </Button>
                            <Button
                              variant="ghost"
                              size="sm"
                              onClick={() => restartAudio(handoff.voiceRecordings.incidentsOccurred!, `incidents-${handoff._id}`)}
                              title="Restart playback"
                            >
                              <RotateCcw className="h-4 w-4" />
                            </Button>
                          </div>
                        )}
                      </div>
                      <p className="text-sm text-muted-foreground pl-6">{handoff.incidentsOccurred}</p>
                    </div>
                  </>
                )}

                {/* Recommendations */}
                {handoff.voiceRecordings.recommendations && (
                  <>
                    <Separator />
                    <div>
                      <div className="flex items-center gap-2 mb-2">
                        <FileText className="h-4 w-4 text-purple-600" />
                        <h5 className="font-medium">{t('shiftHandoff.recommendations')}</h5>
                        {handoff.voiceRecordings.recommendations && (
                          <div className="flex items-center gap-2">
                            <Button
                              variant="ghost"
                              size="sm"
                              onClick={() => togglePlay(handoff.voiceRecordings.recommendations!, `recommendations-${handoff._id}`)}
                            >
                              {playingAudio === `recommendations-${handoff._id}` ? (
                                <Pause className="h-4 w-4" />
                              ) : (
                                <Play className={`h-4 w-4 ${playingAudio === `recommendations-${handoff._id}` ? 'animate-pulse' : ''}`} />
                              )}
                            </Button>
                            <Button
                              variant="ghost"
                              size="sm"
                              onClick={() => restartAudio(handoff.voiceRecordings.recommendations!, `recommendations-${handoff._id}`)}
                              title="Restart playback"
                            >
                              <RotateCcw className="h-4 w-4" />
                            </Button>
                          </div>
                        )}
                      </div>
                      <p className="text-sm text-muted-foreground pl-6">{handoff.recommendations}</p>
                    </div>
                  </>
                )}

                {/* Additional Notes */}
                {handoff.additionalNotes && (
                  <>
                    <Separator />
                    <div>
                      <h5 className="font-medium mb-2">{t('shiftHandoff.additionalNotes')}</h5>
                      <p className="text-sm text-muted-foreground pl-6">{handoff.additionalNotes}</p>
                    </div>
                  </>
                )}
              </CardContent>
            </Card>
          ))}
        </div>
      )}
    </div>
  );
};

export default ShiftHandoffsDisplay;