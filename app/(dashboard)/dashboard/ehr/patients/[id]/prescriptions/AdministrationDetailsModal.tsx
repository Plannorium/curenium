"use client";

import { Dialog, DialogContent, DialogHeader, DialogTitle } from "@/components/ui/dialog";
import { Badge } from "@/components/ui/badge";
import { Calendar, Clock, User, FileText, Syringe } from "lucide-react";
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

  const sortedAdministrations = [...(prescription.administrations || [])].sort(
    (a, b) => new Date(b.administeredAt).getTime() - new Date(a.administeredAt).getTime()
  );

  return (
    <Dialog open={isOpen} onOpenChange={onClose}>
      <DialogContent className="max-w-2xl max-h-[85vh] overflow-y-auto p-0 outline-none">
        <DialogHeader className="border-b px-6 py-4">
          <DialogTitle className="flex items-center gap-2 text-lg font-medium">
            <FileText className="h-5 w-5 text-primary" />
            {t('administrationDetailsModal.title')}
          </DialogTitle>
          <p className="text-sm text-muted-foreground mt-1">
            {prescription.medication || 'N/A'}
          </p>
        </DialogHeader>

        <div className="p-6 pt-4">
          {sortedAdministrations.length > 0 ? (
            <div className="space-y-4">
              {sortedAdministrations.map((admin, index) => (
                <div
                  key={admin._id || index}
                  className="rounded-lg border bg-card/50 p-4 shadow-sm"
                >
                  {/* Date, Time & Status */}
                  <div className="flex items-start justify-between mb-3">
                    <div className="space-y-1">
                      <div className="flex items-center gap-2 text-sm font-medium">
                        <Calendar className="h-4 w-4 text-primary" />
                        {new Date(admin.administeredAt).toLocaleDateString(undefined, {
                          weekday: 'short',
                          year: 'numeric',
                          month: 'short',
                          day: 'numeric',
                        })}
                      </div>
                      <div className="flex items-center gap-2 text-sm text-muted-foreground">
                        <Clock className="h-4 w-4" />
                        {new Date(admin.administeredAt).toLocaleTimeString(undefined, {
                          hour: '2-digit',
                          minute: '2-digit',
                        })}
                      </div>
                    </div>

                    <Badge
                      variant="outline"
                      className={`${
                        admin.status === 'administered'
                          ? 'border-green-600 text-green-700 dark:border-green-400 dark:text-green-300'
                          : admin.status === 'missed'
                          ? 'border-red-600 text-red-700 dark:border-red-400 dark:text-red-300'
                          : 'border-amber-600 text-amber-700 dark:border-amber-400 dark:text-amber-300'
                      }`}
                    >
                      {t(`prescriptionsDisplay.administrationStatus.${admin.status}`) || admin.status}
                    </Badge>
                  </div>

                  {/* Administered By & Dose */}
                  <div className="grid grid-cols-1 sm:grid-cols-2 gap-4 text-sm">
                    <div className="flex items-center gap-2">
                      <User className="h-4 w-4 text-muted-foreground" />
                      <div>
                        <p className="text-xs text-muted-foreground">{t('administrationDetailsModal.administeredBy')}</p>
                        <p className="font-medium">
                          {(admin.administeredBy as any)?.fullName || 'Unknown'}
                        </p>
                      </div>
                    </div>

                    {admin.doseAdministered && (
                      <div className="flex items-center gap-2">
                        <Syringe className="h-4 w-4 text-muted-foreground" />
                        <div>
                          <p className="text-xs text-muted-foreground">{t('administrationDetailsModal.doseAdministered')}</p>
                          <p className="font-medium">{admin.doseAdministered}</p>
                        </div>
                      </div>
                    )}
                  </div>

                  {/* Notes */}
                  {admin.notes && (
                    <div className="mt-4 pt-4 border-t">
                      <div className="flex items-center gap-2 mb-2 text-sm">
                        <FileText className="h-4 w-4 text-muted-foreground" />
                        <span className="text-muted-foreground">{t('administrationDetailsModal.notes')}</span>
                      </div>
                      <p className="text-sm bg-muted/50 rounded-md px-3 py-2">
                        {admin.notes}
                      </p>
                    </div>
                  )}
                </div>
              ))}
            </div>
          ) : (
            <div className="text-center py-12">
              <FileText className="h-10 w-10 text-muted-foreground mx-auto mb-4" />
              <h3 className="text-lg font-medium mb-2">
                {t('administrationDetailsModal.noAdministrations')}
              </h3>
              <p className="text-sm text-muted-foreground">
                {t('administrationDetailsModal.noAdministrationsMessage')}
              </p>
            </div>
          )}
        </div>
      </DialogContent>
    </Dialog>
  );
};