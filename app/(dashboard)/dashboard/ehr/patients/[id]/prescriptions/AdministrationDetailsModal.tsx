"use client";

import { Dialog, DialogContent, DialogHeader, DialogTitle } from "@/components/ui/dialog";
import { Badge } from "@/components/ui/badge";
import { Calendar, Clock, User, FileText } from "lucide-react";
import { Prescription } from "@/types/prescription";
import { useLanguage } from '@/contexts/LanguageContext';
import { dashboardTranslations } from '@/lib/dashboard-translations';

interface AdministrationDetailsModalProps {
  isOpen: boolean;
  onClose: () => void;
  prescription: Prescription | null;
}

export const AdministrationDetailsModal = ({
  isOpen,
  onClose,
  prescription,
}: AdministrationDetailsModalProps) => {
  const { language } = useLanguage();
  const t = (key: string) => {
    const keys = key.split('.');
    let value: any = dashboardTranslations[language as keyof typeof dashboardTranslations];
    for (const k of keys) {
      value = value?.[k];
    }
    return value || key;
  };

  if (!prescription) return null;

  return (
    <Dialog open={isOpen} onOpenChange={onClose}>
      <DialogContent className="max-w-4xl max-h-[80vh] overflow-y-auto dark:bg-slate-900/80">
        <DialogHeader>
          <DialogTitle className="flex items-center space-x-2">
            <FileText className="h-5 w-5" />
            <span>{t('administrationDetailsModal.title')}</span>
          </DialogTitle>
          <div className="text-sm text-muted-foreground">
            Prescription: {prescription.medications?.join(', ') || prescription.medication || 'N/A'}
          </div>
        </DialogHeader>

        <div className="space-y-6">
          {prescription.administrations && prescription.administrations.length > 0 ? (
            <div className="space-y-4">
              {prescription.administrations
                .sort((a, b) => new Date(b.administeredAt).getTime() - new Date(a.administeredAt).getTime())
                .map((admin, index) => (
                  <div
                    key={admin._id || index}
                    className="border border-gray-200 dark:border-gray-700 rounded-lg p-6 bg-gray-50/50 dark:bg-gray-800/50"
                  >
                    <div className="flex items-start justify-between mb-4">
                      <div className="flex items-center space-x-3">
                        <div className="flex items-center space-x-2">
                          <Calendar className="h-4 w-4 text-primary" />
                          <span className="font-medium">
                            {new Date(admin.administeredAt).toLocaleDateString('en-US', {
                              weekday: 'long',
                              year: 'numeric',
                              month: 'long',
                              day: 'numeric',
                            })}
                          </span>
                        </div>
                        <div className="flex items-center space-x-2">
                          <Clock className="h-4 w-4 text-primary" />
                          <span className="font-medium">
                            {new Date(admin.administeredAt).toLocaleTimeString('en-US', {
                              hour: '2-digit',
                              minute: '2-digit',
                              second: '2-digit',
                            })}
                          </span>
                        </div>
                      </div>
                      <Badge
                        className={`${
                          admin.status === 'administered'
                            ? 'bg-green-100 text-green-800 dark:bg-green-900/50 dark:text-green-300'
                            : admin.status === 'missed'
                            ? 'bg-red-100 text-red-800 dark:bg-red-900/50 dark:text-red-300'
                            : 'bg-yellow-100 text-yellow-800 dark:bg-yellow-900/50 dark:text-yellow-300'
                        }`}
                      >
                        {admin.status.replace('_', ' ').toUpperCase()}
                      </Badge>
                    </div>

                    <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                      <div className="space-y-2">
                        <div className="flex items-center space-x-2">
                          <User className="h-4 w-4 text-muted-foreground" />
                          <span className="text-sm text-muted-foreground">{t('administrationDetailsModal.administeredBy')}</span>
                        </div>
                        <p className="font-medium">
                          {(admin.administeredBy as any)?.fullName || 'Unknown'}
                        </p>
                      </div>

                      {admin.doseAdministered && (
                        <div className="space-y-2">
                          <div className="flex items-center space-x-2">
                            <FileText className="h-4 w-4 text-muted-foreground" />
                            <span className="text-sm text-muted-foreground">{t('administrationDetailsModal.doseAdministered')}</span>
                          </div>
                          <p className="font-medium">{admin.doseAdministered}</p>
                        </div>
                      )}
                    </div>

                    {admin.notes && (
                      <div className="mt-4 pt-4 border-t border-gray-200 dark:border-gray-700">
                        <div className="flex items-center space-x-2 mb-2">
                          <FileText className="h-4 w-4 text-muted-foreground" />
                          <span className="text-sm text-muted-foreground">{t('administrationDetailsModal.notes')}</span>
                        </div>
                        <p className="text-sm bg-gray-100 dark:bg-gray-800 p-3 rounded-md">
                          {admin.notes}
                        </p>
                      </div>
                    )}
                  </div>
                ))}
            </div>
          ) : (
            <div className="text-center py-8">
              <FileText className="h-12 w-12 text-muted-foreground mx-auto mb-4" />
              <h3 className="text-lg font-semibold text-gray-900 dark:text-white mb-2">
                {t('administrationDetailsModal.noAdministrations')}
              </h3>
              <p className="text-muted-foreground">
                {t('administrationDetailsModal.noAdministrationsMessage')}
              </p>
            </div>
          )}
        </div>
      </DialogContent>
    </Dialog>
  );
};