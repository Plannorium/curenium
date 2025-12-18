"use client";

import { useEffect, useState, useCallback } from "react";
import { Prescription } from "@/types/prescription";
import { useParams } from "next/navigation";
import { motion } from "framer-motion";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from "@/components/ui/select";
import { Table, TableBody, TableCell, TableHead, TableHeader, TableRow } from "@/components/ui/table";
import { Badge } from "@/components/ui/badge";
import {
  Pill,
  Calendar,
  Clock,
  User,
  ArrowLeft,
  PlusCircle,
  Search,
  Syringe,
  Eye
} from "lucide-react";
import { toast } from "sonner";
import Link from "next/link";
import { AdministrationDetailsModal } from "./AdministrationDetailsModal";
import { AdministerPrescriptionModal } from "@/app/(dashboard)/components/patients/AdministerPrescriptionModal";
import { useLanguage } from "@/contexts/LanguageContext";
import { dashboardTranslations } from "@/lib/dashboard-translations";
import { useSession } from "next-auth/react";

const HistoricalPrescriptionsPage = () => {
  const { language } = useLanguage();
  const t = (key: string) => {
    const keys = key.split('.');
    let value: any = dashboardTranslations[language as keyof typeof dashboardTranslations];
    for (const k of keys) {
      value = value?.[k];
    }
    return value || key;
  };

  const [prescriptions, setPrescriptions] = useState<Prescription[]>([]);
  const [filteredPrescriptions, setFilteredPrescriptions] = useState<Prescription[]>([]);
  const [isLoading, setIsLoading] = useState(true);
  const [searchTerm, setSearchTerm] = useState("");
  const [statusFilter, setStatusFilter] = useState<"all" | "active" | "completed" | "cancelled">("all");
  const [isAdminDetailsModalOpen, setIsAdminDetailsModalOpen] = useState(false);
  const [selectedAdminPrescription, setSelectedAdminPrescription] = useState<Prescription | null>(null);
  const [isAdministerModalOpen, setIsAdministerModalOpen] = useState(false);
  const [selectedPrescription, setSelectedPrescription] = useState<Prescription | null>(null);
  const [users, setUsers] = useState<Record<string, any>>({});

  const params = useParams();
  const patientId = params?.id as string;
  const { data: session } = useSession();

  const fetchUser = useCallback(async (userId: string) => {
    if (users[userId]) return users[userId];
    try {
      const res = await fetch(`/api/users/${userId}`);
      if (res.ok) {
        const userData = await res.json();
        setUsers(prev => ({ ...prev, [userId]: userData }));
        return userData;
      }
    } catch (error) {
      console.error("Failed to fetch user:", error);
    }
    return null;
  }, [users]);

  const fetchPrescriptions = useCallback(async () => {
    if (!patientId) return;
    setIsLoading(true);
    try {
      const res = await fetch(`/api/patients/${patientId}/prescriptions`);
      if (res.ok) {
        const data: Prescription[] = await res.json();
        const userPromises = data
          .filter(p => p.prescribedBy)
          .map(p => fetchUser(p.prescribedBy as string));
        await Promise.all(userPromises);
        setPrescriptions(data);
        setFilteredPrescriptions(data);
      } else {
        toast.error("Failed to fetch historical prescriptions.");
      }
    } catch (error) {
      toast.error("An unexpected error occurred while fetching prescriptions.");
    } finally {
      setIsLoading(false);
    }
  }, [patientId, fetchUser]);

  useEffect(() => {
    fetchPrescriptions();
  }, [fetchPrescriptions]);

  const handleStatusChange = async (prescriptionId: string, newStatus: string) => {
    try {
      const response = await fetch(`/api/prescriptions/${prescriptionId}`, {
        method: 'PATCH',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({ status: newStatus }),
      });
      if (response.ok) {
        toast.success('Status updated successfully');
        setPrescriptions(prev => prev.map(p => p._id === prescriptionId ? { ...p, status: newStatus as any } : p));
        setFilteredPrescriptions(prev => prev.map(p => p._id === prescriptionId ? { ...p, status: newStatus as any } : p));
      } else {
        toast.error('Failed to update status');
      }
    } catch (error) {
      toast.error('An error occurred while updating status');
    }
  };

  useEffect(() => {
    let filtered = prescriptions;

    if (searchTerm) {
      filtered = filtered.filter(p =>
        p.medication?.toLowerCase().includes(searchTerm.toLowerCase()) ||
        p.dose?.toLowerCase().includes(searchTerm.toLowerCase()) ||
        p.frequency?.toLowerCase().includes(searchTerm.toLowerCase())
      );
    }

    if (statusFilter !== "all") {
      filtered = filtered.filter(p => p.status === statusFilter);
    }

    setFilteredPrescriptions(filtered);
  }, [prescriptions, searchTerm, statusFilter]);

  if (isLoading) {
    return (
      <div className="min-h-screen bg-linear-to-br from-gray-50 via-white to-gray-100 dark:from-gray-900 dark:via-gray-950 dark:to-gray-900">
        <div className="container mx-auto px-4 py-8">
          <div className="animate-pulse space-y-6">
            <div className="h-8 bg-gray-300 dark:bg-gray-700 rounded w-1/3"></div>
            <div className="h-12 bg-gray-300 dark:bg-gray-700 rounded"></div>
            <div className="space-y-4">
              {[...Array(5)].map((_, i) => (
                <div key={i} className="h-16 bg-gray-300 dark:bg-gray-700 rounded"></div>
              ))}
            </div>
          </div>
        </div>
      </div>
    );
  }

  return (
    <div className="min-h-screen bg-linear-to-br from-gray-50 via-white to-gray-100 dark:from-gray-900 dark:via-gray-950 dark:to-gray-900">
      <div className="container mx-auto px-4 py-8">
        {/* Header */}
        <motion.div
          initial={{ opacity: 0, y: 20 }}
          animate={{ opacity: 1, y: 0 }}
          className="flex flex-col sm:flex-row items-start sm:items-center justify-between gap-4 mb-6"
        >
          <div className="flex flex-col sm:flex-row items-start sm:items-center gap-4 w-full">
            <Link href={`/dashboard/ehr/patients/${patientId}`}>
              <Button variant="ghost" size="sm" className="hover:bg-accent/50 cursor-pointer">
                <ArrowLeft className="h-4 w-4 mr-2" />
                {/* <span className="hidden sm:inline">{t('prescriptionsPage.backToPatient')}</span> */}
                <span className="sm:hidden">{t('prescriptionsPage.back')}</span>
              </Button>
            </Link>
            <div>
              <h1 className="text-2xl font-bold text-foreground">
                {t('prescriptionsPage.title')}
              </h1>
              <p className="text-sm text-muted-foreground">
                {t('prescriptionsPage.subtitle').replace('{count}', prescriptions.length.toString())}
              </p>
            </div>
          </div>
        </motion.div>

        {/* Filters */}
        <motion.div
          initial={{ opacity: 0, y: 20 }}
          animate={{ opacity: 1, y: 0 }}
          transition={{ delay: 0.1 }}
          className="mb-6"
        >
          <Card className="bg-white/70 dark:bg-gray-950/60 backdrop-blur-lg border-gray-200/50 dark:border-gray-800/50 shadow-xl">
            <CardContent className="p-4">
              <div className="flex flex-col sm:flex-row gap-3">
                <div className="relative flex-1">
                  <Search className="absolute left-3 top-1/2 -translate-y-1/2 h-4 w-4 text-muted-foreground" />
                  <Input
                    placeholder={t('prescriptionsPage.searchPlaceholder')}
                    value={searchTerm}
                    onChange={(e) => setSearchTerm(e.target.value)}
                    className="pl-10 bg-transparent"
                  />
                </div>
                <Select value={statusFilter} onValueChange={(value: any) => setStatusFilter(value)}>
                  <SelectTrigger className="w-full sm:w-48">
                    <SelectValue placeholder={t('prescriptionsPage.filterByStatus')} />
                  </SelectTrigger>
                  <SelectContent>
                    <SelectItem value="all">{t('prescriptionsPage.allPrescriptions')}</SelectItem>
                    <SelectItem value="active">{t('prescriptionsPage.active')}</SelectItem>
                    <SelectItem value="completed">{t('prescriptionsPage.completed')}</SelectItem>
                    <SelectItem value="cancelled">{t('prescriptionsPage.cancelled')}</SelectItem>
                  </SelectContent>
                </Select>
              </div>
            </CardContent>
          </Card>
        </motion.div>

        {/* Prescriptions Table */}
        <motion.div
          initial={{ opacity: 0 }}
          animate={{ opacity: 1 }}
          transition={{ delay: 0.2 }}
          className="bg-white/70 dark:bg-gray-950/60 backdrop-blur-lg border border-gray-200/50 dark:border-gray-800/50 rounded-xl shadow-xl overflow-hidden"
        >
          {filteredPrescriptions.length > 0 ? (
            <div className="overflow-x-auto">
              <Table>
                <TableHeader>
                  <TableRow className="bg-muted/50 border-b">
                    <TableHead className="text-foreground font-medium">{t('prescriptionsPage.medications')}</TableHead>
                    <TableHead className="text-foreground font-medium">{t('prescriptionsPage.dose')}</TableHead>
                    <TableHead className="text-foreground font-medium">{t('prescriptionsPage.frequency')}</TableHead>
                    <TableHead className="text-foreground font-medium">{t('prescriptionsPage.route')}</TableHead>
                    <TableHead className="text-foreground font-medium">{t('prescriptionsPage.status')}</TableHead>
                    <TableHead className="text-foreground font-medium">{t('prescriptionsPage.prescribed')}</TableHead>
                    <TableHead className="text-foreground font-medium">{t('prescriptionsPage.duration')}</TableHead>
                    <TableHead className="text-foreground font-medium">{t('prescriptionsPage.administrations')}</TableHead>
                  </TableRow>
                </TableHeader>
                <TableBody>
                  {filteredPrescriptions.map((prescription) => (
                    <TableRow
                      key={prescription._id}
                      className="border-b hover:bg-muted/30 transition-colors"
                    >
                      <TableCell className="py-4">
                        <div className="flex items-center gap-2.5">
                          <div className="p-1.5 rounded bg-primary/10">
                            <Pill className="h-4 w-4 text-primary" />
                          </div>
                          <div>
                            <div className="font-medium text-foreground">
                              {prescription.medication || t('prescriptionsPage.noMedicationSpecified')}
                            </div>
                          </div>
                        </div>
                      </TableCell>
                      <TableCell className="text-sm text-muted-foreground">
                        {prescription.dose || '—'}
                      </TableCell>
                      <TableCell className="text-sm text-muted-foreground">
                        {prescription.frequency}
                      </TableCell>
                      <TableCell className="text-sm text-muted-foreground">
                        {prescription.route || 'N/A'}
                      </TableCell>
                      <TableCell>
                        <Select value={prescription.status} onValueChange={(value) => handleStatusChange(prescription._id, value)}>
                          <SelectTrigger className="w-32 h-8 text-xs">
                            <SelectValue />
                          </SelectTrigger>
                          <SelectContent>
                            <SelectItem value="active">{t('prescriptionsPage.active')}</SelectItem>
                            <SelectItem value="completed">{t('prescriptionsPage.completed')}</SelectItem>
                            <SelectItem value="cancelled">{t('prescriptionsPage.cancelled')}</SelectItem>
                          </SelectContent>
                        </Select>
                      </TableCell>
                      <TableCell className="text-sm">
                        <div>{new Date(prescription.createdAt).toLocaleDateString()}</div>
                        {prescription.prescribedBy && (
                          <div className="text-muted-foreground text-xs">
                            by {users[prescription.prescribedBy as string]?.fullName || prescription.prescribedBy}
                          </div>
                        )}
                      </TableCell>
                      <TableCell className="text-sm text-muted-foreground">
                        {prescription.durationDays ? `${prescription.durationDays} ${t('prescriptionsPage.days')}` : t('prescriptionsPage.none')}
                      </TableCell>
                      <TableCell>
                        <div className="space-y-2">
                          {prescription.administrations && prescription.administrations.length > 0 ? (
                            <>
                              <div className="text-sm">
                                <span className="font-medium">{prescription.administrations.length}</span>
                                <span className="text-muted-foreground ml-1">{t('prescriptionsPage.administrationsCount')}</span>
                              </div>
                              <div className="text-xs text-muted-foreground">
                                Last: {(() => {
                                  // Sort administrations by date (most recent first) to get the actual last administration
                                  const sortedAdmins = [...prescription.administrations].sort((a, b) =>
                                    new Date(b.administeredAt).getTime() - new Date(a.administeredAt).getTime()
                                  );
                                  const lastAdmin = sortedAdmins[0];
                                  return lastAdmin ? new Date(lastAdmin.administeredAt).toLocaleDateString() : 'Unknown';
                                })()}
                              </div>
                            </>
                          ) : (
                            <span className="text-sm text-muted-foreground">{t('prescriptionsPage.none')}</span>
                          )}

                          <div className="flex flex-wrap gap-2 mt-2">
                            {prescription.administrations && prescription.administrations.length > 0 && (
                              <Button
                                size="sm"
                                variant="outline"
                                onClick={() => {
                                  setSelectedAdminPrescription(prescription);
                                  setIsAdminDetailsModalOpen(true);
                                }}
                                className="h-7 text-xs px-2"
                              >
                                {/* {t('prescriptionsPage.viewDetails')} */}
                                <Eye  className="h-3.5 w-3.5" />
                              </Button>
                            )}
                            {(prescription.status === 'active') && (session?.user?.role === 'nurse' || session?.user?.role === 'doctor' || session?.user?.role === 'admin') && (
                              <Button
                                size="sm"
                                onClick={() => {
                                  setSelectedPrescription(prescription);
                                  setIsAdministerModalOpen(true);
                                }}
                                className="h-7 text-xs px-2"
                              >
                                <Syringe className="h-3.5 w-3.5" />
                                {/* {t('prescriptionsDisplay.administer')} */}
                              </Button>
                            )}
                          </div>
                        </div>
                      </TableCell>
                    </TableRow>
                  ))}
                </TableBody>
              </Table>
            </div>
          ) : (
            <div className="p-12 text-center">
              <Pill className="h-12 w-12 text-muted-foreground mx-auto mb-4" />
              <h3 className="text-lg font-medium mb-2">
                {searchTerm || statusFilter !== "all" ? t('prescriptionsPage.noPrescriptionsFound') : t('prescriptionsPage.noPrescriptionsYet')}
              </h3>
              <p className="text-sm text-muted-foreground mb-6">
                {searchTerm || statusFilter !== "all"
                  ? t('prescriptionsPage.tryAdjustingSearch')
                  : t('prescriptionsPage.prescriptionsWillAppear')
                }
              </p>
              {(searchTerm || statusFilter !== "all") && (
                <Button
                  variant="outline"
                  onClick={() => {
                    setSearchTerm("");
                    setStatusFilter("all");
                  }}
                >
                  {t('prescriptionsPage.clearFilters')}
                </Button>
              )}
            </div>
          )}
        </motion.div>

        <AdministrationDetailsModal
          isOpen={isAdminDetailsModalOpen}
          onClose={() => setIsAdminDetailsModalOpen(false)}
          prescription={selectedAdminPrescription}
        />
        {selectedPrescription && (
          <AdministerPrescriptionModal
            isOpen={isAdministerModalOpen}
            onClose={() => setIsAdministerModalOpen(false)}
            prescription={selectedPrescription}
            onAdministrationAdded={fetchPrescriptions}
            enableBarcodeValidation={false}
          />
        )}
      </div>
    </div>
  );
};

export default HistoricalPrescriptionsPage;