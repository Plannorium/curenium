"use client";

import { useState, useRef, useEffect } from 'react';
import { Button } from "@/components/ui/button";
import { Dialog, DialogContent, DialogHeader, DialogTitle, DialogFooter } from "@/components/ui/dialog";
import { Textarea } from "@/components/ui/textarea";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import { toast } from 'sonner';
import { useSession } from 'next-auth/react';
import { FileText, Mic, MicOff, QrCode, Download } from 'lucide-react';
import { useLanguage } from '@/contexts/LanguageContext';
import { dashboardTranslations } from '@/lib/dashboard-translations';
import SpeechRecognition, { useSpeechRecognition } from 'react-speech-recognition';
import QRCode from 'qrcode';
import { useChat } from '@/hooks/useChat';

interface HandoffReportModalProps {
  patientId?: string;
  shiftId?: string;
  wardId?: string;
  departmentId?: string;
  defaultType?: 'ward' | 'department' | 'shift' | 'patient';
  allowedTypes?: ('ward' | 'department' | 'shift' | 'patient')[];
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
  const [isListening, setIsListening] = useState(false);
  const [currentField, setCurrentField] = useState<keyof SBARData | null>(null);
  const [qrCodeUrl, setQrCodeUrl] = useState<string>('');
  const [isGeneratingQR, setIsGeneratingQR] = useState(false);

  const { transcript, listening, resetTranscript, browserSupportsSpeechRecognition } = useSpeechRecognition();

  useEffect(() => {
    if (transcript && currentField) {
      setSbar(prev => ({
        ...prev,
        [currentField]: prev[currentField] + ' ' + transcript
      }));
    }
  }, [transcript, currentField]);

  const startListening = (field: keyof SBARData) => {
    if (!browserSupportsSpeechRecognition) {
      toast.error('Browser does not support speech recognition');
      return;
    }
    setCurrentField(field);
    setIsListening(true);
    resetTranscript();
    SpeechRecognition.startListening({ continuous: true });
  };

  const stopListening = () => {
    setIsListening(false);
    setCurrentField(null);
    SpeechRecognition.stopListening();
  };

  const generateQRCode = async () => {
    setIsGeneratingQR(true);
    try {
      const reportData = {
        type: 'handoff_report',
        patientId,
        shiftId,
        sbar,
        createdBy: session?.user?.id,
        createdAt: new Date().toISOString(),
        organizationId: session?.user?.organizationId
      };

      const qrData = JSON.stringify(reportData);
      const url = await QRCode.toDataURL(qrData);
      setQrCodeUrl(url);
      toast.success('QR code generated successfully');
    } catch (error) {
      toast.error('Failed to generate QR code');
    } finally {
      setIsGeneratingQR(false);
    }
  };

  const shareViaChat = async () => {
    if (!qrCodeUrl) {
      toast.error('Generate QR code first');
      return;
    }

    try {
      // Upload QR code image to get a URL
      const response = await fetch('/api/upload', {
        method: 'POST',
        body: JSON.stringify({
          file: qrCodeUrl,
          fileName: `handoff-qr-${Date.now()}.png`,
          fileType: 'image/png'
        }),
        headers: {
          'Content-Type': 'application/json',
        },
      });

      if (response.ok) {
        const data = (await response.json()) as { url: string };
        const { url } = data;
        // Use the chat hook's combined message sender
        await sendCombinedMessage(`Handoff Report QR Code: ${url}`);
        toast.success('QR code shared in chat');
      } else {
        toast.error('Failed to upload QR code');
      }
    } catch (error) {
      toast.error('Failed to share QR code');
    }
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
        toast.success('PDF exported successfully');
      } else {
        toast.error('Failed to export PDF');
      }
    } catch (error) {
      toast.error('Error exporting PDF');
    }
  };

  const handleSubmit = async () => {
    if (!sbar.situation || !sbar.background || !sbar.assessment || !sbar.recommendation) {
      toast.error('All SBAR fields are required');
      return;
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
          sbar
        }),
      });

      if (response.ok) {
        toast.success('Handoff report added successfully');
        onReportAdded();
        onClose();
        // Reset form
        setSbar({
          situation: '',
          background: '',
          assessment: '',
          recommendation: ''
        });
        setQrCodeUrl('');
      } else {
        toast.error('Failed to add handoff report');
      }
    } catch (error) {
      toast.error('Error adding handoff report');
    }
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

          {/* QR Code Section */}
          <div className="border-t border-gray-200/50 dark:border-gray-700/50 pt-4">
            <div className="flex items-center justify-between mb-4">
              <Label className="text-sm font-semibold text-gray-800 dark:text-gray-200">
                {t('handoff.qrSection')}
              </Label>
              <div className="flex space-x-2">
                <Button
                  type="button"
                  variant="outline"
                  size="sm"
                  onClick={generateQRCode}
                  disabled={isGeneratingQR}
                  className="flex items-center space-x-2"
                >
                  <QrCode className="h-4 w-4" />
                  <span>{isGeneratingQR ? t('handoff.generating') : t('handoff.generateQR')}</span>
                </Button>
                {qrCodeUrl && (
                  <>
                    <Button
                      type="button"
                      variant="outline"
                      size="sm"
                      onClick={shareViaChat}
                      className="flex items-center space-x-2"
                    >
                      <span>{t('handoff.shareInChat')}</span>
                    </Button>
                    <Button
                      type="button"
                      variant="outline"
                      size="sm"
                      onClick={exportPDF}
                      className="flex items-center space-x-2"
                    >
                      <Download className="h-4 w-4" />
                      <span>{t('handoff.exportPDF')}</span>
                    </Button>
                  </>
                )}
              </div>
            </div>
            {qrCodeUrl && (
              <div className="flex justify-center">
                <img src={qrCodeUrl} alt="Handoff Report QR Code" className="max-w-32 max-h-32" />
              </div>
            )}
          </div>
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