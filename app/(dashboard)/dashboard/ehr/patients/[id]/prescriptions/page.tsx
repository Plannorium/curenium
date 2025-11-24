"use client";

import { useEffect, useState, useCallback } from "react";
import { Prescription } from "@/types/prescription";
import { useParams } from "next/navigation";
import { motion, AnimatePresence } from "framer-motion";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { Button } from "@/components/ui/button";
import { Badge } from "@/components/ui/badge";
import { Tabs, TabsContent, TabsList, TabsTrigger } from "@/components/ui/tabs";
import {
  Pill,
  Calendar,
  Clock,
  User,
  ArrowLeft,
  PlusCircle,
  Filter,
  Search,
  BarChart3,
  Activity,
  AlertCircle,
  CheckCircle,
  XCircle,
  PauseCircle
} from "lucide-react";
import { toast } from "sonner";
import Link from "next/link";
import { Input } from "@/components/ui/input";
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from "@/components/ui/select";
import { Table, TableBody, TableCell, TableHead, TableHeader, TableRow } from "@/components/ui/table";
import { AdministrationDetailsModal } from "./AdministrationDetailsModal";

const HistoricalPrescriptionsPage = () => {
  const [prescriptions, setPrescriptions] = useState<Prescription[]>([]);
  const [filteredPrescriptions, setFilteredPrescriptions] = useState<Prescription[]>([]);
  const [isLoading, setIsLoading] = useState(true);
  const [searchTerm, setSearchTerm] = useState("");
  const [statusFilter, setStatusFilter] = useState<"all" | "active" | "completed" | "cancelled">("all");
  const [isAdminDetailsModalOpen, setIsAdminDetailsModalOpen] = useState(false);
  const [selectedAdminPrescription, setSelectedAdminPrescription] = useState<Prescription | null>(null);
  const params = useParams();
  const patientId = params?.id as string;

  const fetchPrescriptions = useCallback(async () => {
    if (!patientId) return;
    setIsLoading(true);
    try {
      const res = await fetch(`/api/patients/${patientId}/prescriptions`);
      if (res.ok) {
        const data: Prescription[] = await res.json();
        setPrescriptions(data);
        setFilteredPrescriptions(data);
      } else {
        toast.error("Failed to fetch historical prescriptions.");
      }
    } catch (error) {
      console.error("Failed to fetch historical prescriptions:", error);
      toast.error("An unexpected error occurred while fetching prescriptions.");
    } finally {
      setIsLoading(false);
    }
  }, [patientId]);

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

    // Apply search filter
    if (searchTerm) {
      filtered = filtered.filter(p =>
        p.medications?.some(m => m.toLowerCase().includes(searchTerm.toLowerCase())) ||
        p.medication?.toLowerCase().includes(searchTerm.toLowerCase()) ||
        p.dose?.toLowerCase().includes(searchTerm.toLowerCase()) ||
        p.frequency?.toLowerCase().includes(searchTerm.toLowerCase())
      );
    }

    // Apply status filter
    if (statusFilter !== "all") {
      filtered = filtered.filter(p => p.status === statusFilter);
    }

    setFilteredPrescriptions(filtered);
  }, [prescriptions, searchTerm, statusFilter]);

  const getStatusIcon = (status: string) => {
    switch (status) {
      case "active":
        return <CheckCircle className="h-4 w-4 text-green-500" />;
      case "completed":
        return <CheckCircle className="h-4 w-4 text-blue-500" />;
      case "cancelled":
        return <XCircle className="h-4 w-4 text-red-500" />;
      default:
        return <PauseCircle className="h-4 w-4 text-gray-500" />;
    }
  };

  const getStatusBadgeVariant = (status: string) => {
    switch (status) {
      case "active":
        return "bg-green-100 text-green-800 dark:bg-green-900/20 dark:text-green-400";
      case "completed":
        return "bg-blue-100 text-blue-800 dark:bg-blue-900/20 dark:text-blue-400";
      case "cancelled":
        return "bg-red-100 text-red-800 dark:bg-red-900/20 dark:text-red-400";
      default:
        return "bg-gray-100 text-gray-800 dark:bg-gray-900/20 dark:text-gray-400";
    }
  };

  const getActivePrescriptionsCount = () => {
    return prescriptions.filter(p => p.status === "active").length;
  };

  if (isLoading) {
    return (
      <div className="min-h-screen bg-linear-to-br from-gray-50 via-white to-gray-100 dark:from-gray-900 dark:via-gray-950 dark:to-gray-900">
        <div className="container mx-auto px-4 py-8">
          <div className="animate-pulse space-y-6">
            <div className="h-8 bg-gray-300 dark:bg-gray-700 rounded w-1/4"></div>
            <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6">
              {Array.from({ length: 6 }).map((_, i) => (
                <div key={i} className="h-48 bg-gray-300 dark:bg-gray-700 rounded-xl"></div>
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
          className="flex items-center justify-between mb-8"
        >
          <div className="flex items-center space-x-4">
            <Link href={`/dashboard/ehr/patients/${patientId}`}>
              <Button variant="ghost" size="sm" className="hover:bg-gray-100 dark:hover:bg-gray-800">
                <ArrowLeft className="h-4 w-4 mr-2" />
                Back to Patient
              </Button>
            </Link>
            <div>
              <h1 className="text-3xl font-bold bg-linear-to-r from-gray-900 via-gray-800 to-gray-900 dark:from-white dark:via-gray-100 dark:to-white bg-clip-text text-transparent">
                Prescription History
              </h1>
              <p className="text-muted-foreground mt-1">
                {getActivePrescriptionsCount()} active prescriptions • {prescriptions.length} total
              </p>
            </div>
          </div>
          {/* <Button className="bg-linear-to-r from-blue-500 to-blue-600 hover:from-blue-600 hover:to-blue-700 text-white shadow-lg hover:shadow-xl transition-all duration-300">
            <PlusCircle className="h-4 w-4 mr-2" />
            New Prescription
          </Button> */}
        </motion.div>

        {/* Filters */}
        <motion.div
          initial={{ opacity: 0, y: 20 }}
          animate={{ opacity: 1, y: 0 }}
          transition={{ delay: 0.1 }}
          className="mb-8"
        >
          <Card className="bg-white/70 dark:bg-gray-950/60 backdrop-blur-lg border-gray-200/50 dark:border-gray-800/50 shadow-xl">
            <CardContent className="p-6">
              <div className="flex flex-col sm:flex-row gap-4">
                <div className="relative flex-1">
                  <Search className="absolute left-3 top-1/2 -translate-y-1/2 h-4 w-4 text-muted-foreground" />
                  <Input
                    placeholder="Search medications, dosage, or frequency..."
                    value={searchTerm}
                    onChange={(e) => setSearchTerm(e.target.value)}
                    className="pl-10 bg-gray-50/80 dark:bg-gray-900/80 border-gray-200/70 dark:border-gray-700/60 focus:border-blue-400 dark:focus:border-blue-500 rounded-xl"
                  />
                </div>
                <Select value={statusFilter} onValueChange={(value: "all" | "active" | "completed" | "cancelled") => setStatusFilter(value)}>
                  <SelectTrigger className="w-full sm:w-48 bg-gray-50/80 dark:bg-gray-900/80 border-gray-200/70 dark:border-gray-700/60 focus:border-blue-400 dark:focus:border-blue-500 rounded-xl">
                    <SelectValue placeholder="Filter by status" />
                  </SelectTrigger>
                  <SelectContent className="bg-white/90 dark:bg-gray-900/90 backdrop-blur-lg border border-gray-200/50 dark:border-gray-700/50 rounded-xl">
                    <SelectItem value="all">All Prescriptions</SelectItem>
                    <SelectItem value="active">Active</SelectItem>
                    <SelectItem value="completed">Completed</SelectItem>
                    <SelectItem value="cancelled">Cancelled</SelectItem>
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
            <Table>
              <TableHeader>
                <TableRow className="bg-gray-50/80 dark:bg-gray-900/80">
                  <TableHead className="font-semibold">Medications</TableHead>
                  <TableHead className="font-semibold">Dose</TableHead>
                  <TableHead className="font-semibold">Frequency</TableHead>
                  <TableHead className="font-semibold">Route</TableHead>
                  <TableHead className="font-semibold">Status</TableHead>
                  <TableHead className="font-semibold">Status Reason</TableHead>
                  <TableHead className="font-semibold">Prescribed</TableHead>
                  <TableHead className="font-semibold">Duration</TableHead>
                  <TableHead className="font-semibold">Administrations</TableHead>
                </TableRow>
              </TableHeader>
              <TableBody>
                {filteredPrescriptions.map((prescription) => (
                  <TableRow key={prescription._id} className="hover:bg-gray-50/50 dark:hover:bg-gray-900/50">
                    <TableCell className="font-medium">
                      <div className="flex items-center space-x-2">
                        <Pill className="h-4 w-4 text-blue-600" />
                        <div>
                          {(prescription.medications || (prescription.medication ? [prescription.medication] : [])).map((med, idx) => (
                            <div key={idx} className="text-sm">{med}</div>
                          ))}
                        </div>
                      </div>
                    </TableCell>
                    <TableCell>{prescription.dose}</TableCell>
                    <TableCell>{prescription.frequency}</TableCell>
                    <TableCell>{prescription.route || 'N/A'}</TableCell>
                    <TableCell>
                      <Select value={prescription.status} onValueChange={(value) => handleStatusChange(prescription._id, value)}>
                        <SelectTrigger className="w-32">
                          <SelectValue />
                        </SelectTrigger>
                        <SelectContent>
                          <SelectItem value="active">Active</SelectItem>
                          <SelectItem value="completed">Completed</SelectItem>
                          <SelectItem value="cancelled">Cancelled</SelectItem>
                        </SelectContent>
                      </Select>
                    </TableCell>
                    <TableCell className="text-sm">{prescription.statusReason || 'N/A'}</TableCell>
                    <TableCell className="text-sm">
                      <div>{new Date(prescription.createdAt).toLocaleDateString()}</div>
                      {prescription.prescribedBy && (
                        <div className="text-muted-foreground">by {prescription.prescribedBy}</div>
                      )}
                    </TableCell>
                    <TableCell>
                      {prescription.durationDays ? `${prescription.durationDays} days` : 'N/A'}
                    </TableCell>
                    <TableCell>
                      {prescription.administrations && prescription.administrations.length > 0 ? (
                        <div className="space-y-2">
                          <div className="text-sm">
                            <div className="font-medium">{prescription.administrations.length} administrations</div>
                            {(() => {
                              const lastAdmin = prescription.administrations[prescription.administrations.length - 1];
                              return (
                                <div className="text-muted-foreground">
                                  Last: {lastAdmin.doseAdministered ? `${lastAdmin.doseAdministered} by ` : ''}
                                  {(lastAdmin.administeredBy as any)?.fullName || 'Unknown'} on {new Date(lastAdmin.administeredAt).toLocaleDateString()}
                                </div>
                              );
                            })()}
                          </div>
                          <Button
                            size="sm"
                            variant="outline"
                            onClick={() => {
                              setSelectedAdminPrescription(prescription);
                              setIsAdminDetailsModalOpen(true);
                            }}
                            className="text-xs"
                          >
                            View Details
                          </Button>
                        </div>
                      ) : (
                        <span className="text-muted-foreground">None</span>
                      )}
                    </TableCell>
                  </TableRow>
                ))}
              </TableBody>
            </Table>
          ) : (
            <div className="p-12 text-center">
              <Pill className="h-16 w-16 text-muted-foreground mx-auto mb-4" />
              <h3 className="text-lg font-semibold text-gray-900 dark:text-white mb-2">
                {searchTerm || statusFilter !== "all" ? "No prescriptions found" : "No prescriptions yet"}
              </h3>
              <p className="text-muted-foreground mb-6">
                {searchTerm || statusFilter !== "all"
                  ? "Try adjusting your search or filter criteria."
                  : "Prescriptions will appear here once they are prescribed."
                }
              </p>
              {(searchTerm || statusFilter !== "all") && (
                <Button
                  variant="outline"
                  onClick={() => {
                    setSearchTerm("");
                    setStatusFilter("all");
                  }}
                  className="hover:bg-gray-100 dark:hover:bg-gray-800"
                >
                  Clear Filters
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
      </div>
    </div>
  );
};

export default HistoricalPrescriptionsPage;