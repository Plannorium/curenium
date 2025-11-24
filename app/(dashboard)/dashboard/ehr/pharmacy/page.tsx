"use client";
import { useState, useEffect, useMemo } from "react";
import { Prescription } from "@/types/prescription";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import {
  Table,
  TableBody,
  TableCell,
  TableHead,
  TableHeader,
  TableRow,
} from "@/components/ui/table";
import { Badge } from "@/components/ui/badge";
import { Button } from "@/components/ui/button";
import { Tabs, TabsContent, TabsList, TabsTrigger } from "@/components/ui/tabs";
import { FileText, Pill, Truck, Clock, CheckCircle, XCircle, Search, Filter } from "lucide-react";
import { toast } from "sonner";
import { DispensePrescriptionModal } from "../../../components/pharmacy/DispensePrescriptionModal";
import { Input } from "@/components/ui/input";
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from "@/components/ui/select";
import { Skeleton } from "@/components/ui/skeleton";

const PharmacyDashboard = () => {
  const [prescriptions, setPrescriptions] = useState<Prescription[]>([]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState<string | null>(null);
  const [selectedPrescription, setSelectedPrescription] = useState<Prescription | null>(null);
  const [isModalOpen, setIsModalOpen] = useState(false);
  const [searchQuery, setSearchQuery] = useState("");
  const [statusFilter, setStatusFilter] = useState("all");

  const fetchPrescriptions = async () => {
    try {
      const response = await fetch("/api/prescriptions");
      if (!response.ok) {
        throw new Error("Failed to fetch prescriptions");
      }
      const data = await response.json();
      setPrescriptions(data as Prescription[]);
    } catch (err: any) {
      setError(err.message);
      toast.error(err.message);
    } finally {
      setLoading(false);
    }
  };

  useEffect(() => {
    fetchPrescriptions();
  }, []);

  const handleOpenModal = (prescription: Prescription) => {
    setSelectedPrescription(prescription);
    setIsModalOpen(true);
  };

  const handleCloseModal = () => {
    setSelectedPrescription(null);
    setIsModalOpen(false);
  };

  const filteredPrescriptions = useMemo(() => {
    return prescriptions.filter((p) => {
      const matchesSearch =
        searchQuery === "" ||
        `${(p.patientId as any)?.firstName} ${(p.patientId as any)?.lastName}`
          .toLowerCase()
          .includes(searchQuery.toLowerCase()) ||
        p.medication?.toLowerCase().includes(searchQuery.toLowerCase());

      const matchesStatus = statusFilter === "all" || p.status === statusFilter;

      return matchesSearch && matchesStatus;
    });
  }, [prescriptions, searchQuery, statusFilter]);

  const stats = useMemo(() => {
    const active = prescriptions.filter(p => p.status === 'active').length;
    const completed = prescriptions.filter(p => p.status === 'completed').length;
    const cancelled = prescriptions.filter(p => p.status === 'cancelled').length;
    return { active, completed, cancelled, total: prescriptions.length };
  }, [prescriptions]);

  const getStatusBadge = (status: string) => {
    switch (status) {
      case 'active':
        return <Badge className="bg-blue-100 text-blue-800 dark:bg-blue-900/20 dark:text-blue-400">Active</Badge>;
      case 'completed':
        return <Badge className="bg-green-100 text-green-800 dark:bg-green-900/20 dark:text-green-400">Completed</Badge>;
      case 'cancelled':
        return <Badge className="bg-red-100 text-red-800 dark:bg-red-900/20 dark:text-red-400">Cancelled</Badge>;
      default:
        return <Badge variant="secondary">{status}</Badge>;
    }
  };

  const StatCard = ({ title, value, icon: Icon, color }: { title: string; value: number; icon: any; color: string }) => (
    <Card className="bg-white/70 dark:bg-gray-950/60 backdrop-blur-lg border-gray-200/50 dark:border-gray-800/50 shadow-lg hover:shadow-xl transition-all duration-300">
      <CardHeader className="flex flex-row items-center justify-between space-y-0 pb-2">
        <CardTitle className="text-sm font-medium text-gray-600 dark:text-gray-400">{title}</CardTitle>
        <div className={`p-2 rounded-lg ${color}`}>
          <Icon className="h-4 w-4 text-white" />
        </div>
      </CardHeader>
      <CardContent>
        <div className="text-2xl font-bold">{value}</div>
      </CardContent>
    </Card>
  );

  if (loading) {
    return (
      <div className="space-y-6 p-4 md:p-6">
        <div className="grid gap-4 md:grid-cols-4">
          {[...Array(4)].map((_, i) => (
            <Skeleton key={i} className="h-24 w-full" />
          ))}
        </div>
        <Skeleton className="h-96 w-full" />
      </div>
    );
  }

  if (error) {
    return (
      <div className="flex items-center justify-center h-96">
        <div className="text-center">
          <XCircle className="h-12 w-12 text-red-500 mx-auto mb-4" />
          <h3 className="text-lg font-semibold text-gray-900 dark:text-gray-100">Error Loading Prescriptions</h3>
          <p className="text-gray-600 dark:text-gray-400 mt-2">{error}</p>
        </div>
      </div>
    );
  }

  return (
    <div className="space-y-6 p-4 md:p-6 bg-gray-50/50 dark:bg-gray-900/50 min-h-screen">
      <header className="flex flex-col md:flex-row items-start md:items-center justify-between space-y-4 md:space-y-0">
        <h1 className="text-3xl font-bold tracking-tight bg-linear-to-r from-primary to-primary/70 bg-clip-text text-transparent">
          Pharmacy Dashboard
        </h1>
      </header>

      {/* Statistics Cards */}
      <div className="grid gap-4 md:grid-cols-2 lg:grid-cols-4">
        <StatCard
          title="Active Prescriptions"
          value={stats.active}
          icon={Pill}
          color="bg-blue-500"
        />
        <StatCard
          title="Completed"
          value={stats.completed}
          icon={CheckCircle}
          color="bg-green-500"
        />
        <StatCard
          title="Cancelled"
          value={stats.cancelled}
          icon={XCircle}
          color="bg-red-500"
        />
        <StatCard
          title="Total Prescriptions"
          value={stats.total}
          icon={FileText}
          color="bg-purple-500"
        />
      </div>

      {/* Main Content */}
      <Card className="bg-white/70 dark:bg-gray-950/60 backdrop-blur-lg border-gray-200/50 dark:border-gray-800/50 shadow-xl">
        <CardHeader>
          <div className="flex flex-col md:flex-row items-center space-y-4 md:space-y-0 md:space-x-4">
            <div className="relative flex-1 w-full md:w-auto">
              <Search className="absolute left-3 top-1/2 -translate-y-1/2 h-4 w-4 text-muted-foreground" />
              <Input
                placeholder="Search by patient or medication..."
                className="pl-10 w-full"
                value={searchQuery}
                onChange={(e) => setSearchQuery(e.target.value)}
              />
            </div>
            {/* <Select value={statusFilter} onValueChange={setStatusFilter}>
              <SelectTrigger className="w-full md:w-[180px]">
                <SelectValue placeholder="Filter by status" />
              </SelectTrigger>
              <SelectContent>
                <SelectItem value="all">All Statuses</SelectItem>
                <SelectItem value="active">Active</SelectItem>
                <SelectItem value="completed">Completed</SelectItem>
                <SelectItem value="cancelled">Cancelled</SelectItem>
              </SelectContent>
            </Select> */}
          </div>
        </CardHeader>
        <CardContent>
          <Tabs defaultValue="active" className="w-full">
            <TabsList className="grid w-full grid-cols-3 mb-6">
              <TabsTrigger value="active" className="flex items-center gap-2">
                <Clock className="h-4 w-4" />
                Active ({prescriptions.filter(p => p.status === 'active').length})
              </TabsTrigger>
              <TabsTrigger value="completed" className="flex items-center gap-2">
                <CheckCircle className="h-4 w-4" />
                Completed ({prescriptions.filter(p => p.status === 'completed').length})
              </TabsTrigger>
              <TabsTrigger value="cancelled" className="flex items-center gap-2">
                <XCircle className="h-4 w-4" />
                Cancelled ({prescriptions.filter(p => p.status === 'cancelled').length})
              </TabsTrigger>
            </TabsList>

            <TabsContent value="active" className="space-y-4">
              <PrescriptionTable
                prescriptions={filteredPrescriptions.filter(p => p.status === 'active')}
                onViewDetails={handleOpenModal}
                emptyMessage="No active prescriptions found"
              />
            </TabsContent>

            <TabsContent value="completed" className="space-y-4">
              <PrescriptionTable
                prescriptions={filteredPrescriptions.filter(p => p.status === 'completed')}
                onViewDetails={handleOpenModal}
                emptyMessage="No completed prescriptions found"
              />
            </TabsContent>

            <TabsContent value="cancelled" className="space-y-4">
              <PrescriptionTable
                prescriptions={filteredPrescriptions.filter(p => p.status === 'cancelled')}
                onViewDetails={handleOpenModal}
                emptyMessage="No cancelled prescriptions found"
              />
            </TabsContent>
          </Tabs>
        </CardContent>
      </Card>

      <DispensePrescriptionModal
        prescription={selectedPrescription}
        isOpen={isModalOpen}
        onClose={handleCloseModal}
        onDispensed={() => {
          fetchPrescriptions();
          handleCloseModal();
        }}
      />
    </div>
  );
};

const PrescriptionTable = ({
  prescriptions,
  onViewDetails,
  emptyMessage
}: {
  prescriptions: Prescription[];
  onViewDetails: (prescription: Prescription) => void;
  emptyMessage: string;
}) => {
  if (prescriptions.length === 0) {
    return (
      <div className="text-center py-16">
        <Pill className="mx-auto h-12 w-12 text-gray-400" />
        <h3 className="mt-2 text-lg font-medium text-gray-900 dark:text-gray-100">No Prescriptions</h3>
        <p className="mt-1 text-sm text-gray-500 dark:text-gray-400">{emptyMessage}</p>
      </div>
    );
  }

  return (
    <div className="overflow-x-auto">
      <Table>
        <TableHeader>
          <TableRow>
            <TableHead className="w-[200px]">Patient</TableHead>
            <TableHead className="w-[200px]">Medication</TableHead>
            <TableHead className="w-[120px]">Dose</TableHead>
            <TableHead className="w-[120px]">Frequency</TableHead>
            <TableHead className="w-[120px]">Date</TableHead>
            <TableHead className="w-[120px]">Status</TableHead>
            <TableHead className="w-[150px]">Actions</TableHead>
          </TableRow>
        </TableHeader>
        <TableBody>
          {prescriptions.map((p) => (
            <TableRow key={p._id} className="hover:bg-gray-50/50 dark:hover:bg-gray-800/50">
              <TableCell className="font-medium">
                {(p.patientId as any)?.firstName} {(p.patientId as any)?.lastName}
              </TableCell>
              <TableCell className="font-medium text-primary">{p.medication}</TableCell>
              <TableCell>{p.dose}</TableCell>
              <TableCell>{p.frequency}</TableCell>
              <TableCell className="text-sm text-muted-foreground">
                {new Date(p.createdAt).toLocaleDateString()}
              </TableCell>
              <TableCell>
                {getStatusBadge(p.status)}
              </TableCell>
              <TableCell>
                <Button
                  variant="outline"
                  size="sm"
                  onClick={() => onViewDetails(p)}
                  className="hover:bg-primary/10 hover:border-primary/50"
                >
                  <FileText className="h-4 w-4 mr-2" />
                  View Details
                </Button>
              </TableCell>
            </TableRow>
          ))}
        </TableBody>
      </Table>
    </div>
  );
};

const getStatusBadge = (status: string) => {
  switch (status) {
    case 'active':
      return <Badge className="bg-blue-100 text-blue-800 dark:bg-blue-900/20 dark:text-blue-400">Active</Badge>;
    case 'completed':
      return <Badge className="bg-green-100 text-green-800 dark:bg-green-900/20 dark:text-green-400">Completed</Badge>;
    case 'cancelled':
      return <Badge className="bg-red-100 text-red-800 dark:bg-red-900/20 dark:text-red-400">Cancelled</Badge>;
    default:
      return <Badge variant="secondary">{status}</Badge>;
  }
};

export default PharmacyDashboard;