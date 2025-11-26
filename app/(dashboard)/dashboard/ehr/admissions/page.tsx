"use client";

import { useState, useEffect } from "react";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { Button } from "@/components/ui/button";
import { Badge } from "@/components/ui/badge";
import { Avatar, AvatarFallback, AvatarImage } from "@/components/ui/avatar";
import { Tabs, TabsContent, TabsList, TabsTrigger } from "@/components/ui/tabs";
import {
  Plus,
  User,
  Clock,
  CheckCircle,
  XCircle,
  AlertTriangle,
  Bed,
  Building,
  FileText,
  Eye,
  Edit
} from "lucide-react";
import { toast } from "sonner";
import { useSession } from "next-auth/react";
import { Loader } from "@/components/ui/Loader";
import AddAdmissionModal from "./components/AddAdmissionModal";
import AdmissionDetailsModal from "@/app/(dashboard)/dashboard/ehr/admissions/components/AdmissionDetailsModal";

// Types
interface Admission {
  _id: string;
  patient: {
    _id: string;
    firstName: string;
    lastName: string;
    mrn?: string;
    dob?: string;
    gender?: string;
  };
  doctor: {
    _id: string;
    fullName: string;
    email: string;
  };
  matronNurse?: {
    _id: string;
    fullName: string;
    email: string;
  };
  department?: {
    _id: string;
    name: string;
  };
  ward?: {
    _id: string;
    name: string;
    wardNumber: string;
  };
  bedNumber?: string;
  reason: string;
  urgency: 'routine' | 'urgent' | 'emergency';
  status: 'requested' | 'pending_review' | 'approved' | 'assigned' | 'completed' | 'cancelled';
  requestedAt: string;
  reviewedAt?: string;
  assignedAt?: string;
  doctorNotes?: string;
  matronNurseNotes?: string;
  wardNotes?: string;
}

const AdmissionsPage = () => {
  const { data: session } = useSession();
  const [admissions, setAdmissions] = useState<Admission[]>([]);
  const [loading, setLoading] = useState(true);
  const [activeTab, setActiveTab] = useState("all");
  const [selectedAdmission, setSelectedAdmission] = useState<Admission | null>(null);

  useEffect(() => {
    fetchAdmissions();
  }, []);

  const fetchAdmissions = async () => {
    setLoading(true);
    try {
      const response = await fetch('/api/admissions');
      if (response.ok) {
        const data = await response.json() as Admission[];
        setAdmissions(data);
      } else {
        toast.error('Failed to fetch admissions');
      }
    } catch (error) {
      console.error('Failed to fetch admissions:', error);
      toast.error('An error occurred while fetching admissions');
    } finally {
      setLoading(false);
    }
  };

  const getStatusColor = (status: string) => {
    switch (status) {
      case 'requested': return 'bg-blue-100 text-blue-800 dark:bg-blue-900/20 dark:text-blue-400';
      case 'pending_review': return 'bg-yellow-100 text-yellow-800 dark:bg-yellow-900/20 dark:text-yellow-400';
      case 'approved': return 'bg-green-100 text-green-800 dark:bg-green-900/20 dark:text-green-400';
      case 'assigned': return 'bg-purple-100 text-purple-800 dark:bg-purple-900/20 dark:text-purple-400';
      case 'completed': return 'bg-gray-100 text-gray-800 dark:bg-gray-900/20 dark:text-gray-400';
      case 'cancelled': return 'bg-red-100 text-red-800 dark:bg-red-900/20 dark:text-red-400';
      default: return 'bg-gray-100 text-gray-800 dark:bg-gray-900/20 dark:text-gray-400';
    }
  };

  const getUrgencyColor = (urgency: string) => {
    switch (urgency) {
      case 'emergency': return 'bg-red-100 text-red-800 dark:bg-red-900/20 dark:text-red-400';
      case 'urgent': return 'bg-orange-100 text-orange-800 dark:bg-orange-900/20 dark:text-orange-400';
      case 'routine': return 'bg-green-100 text-green-800 dark:bg-green-900/20 dark:text-green-400';
      default: return 'bg-gray-100 text-gray-800 dark:bg-gray-900/20 dark:text-gray-400';
    }
  };

  const handleAdmissionAction = async (admissionId: string, action: string, data?: any) => {
    try {
      const response = await fetch(`/api/admissions/${admissionId}`, {
        method: 'PUT',
        headers: {
          'Content-Type': 'application/json',
        },
        body: JSON.stringify({ action, ...data }),
      });

      if (response.ok) {
        toast.success(`Admission ${action} successfully`);
        fetchAdmissions();
      } else {
        const error = await response.json() as { message?: string };
        toast.error(error.message || `Failed to ${action} admission`);
      }
    } catch (error) {
      console.error(`Failed to ${action} admission:`, error);
      toast.error(`An error occurred while ${action}ing admission`);
    }
  };

  const filteredAdmissions = admissions.filter(admission => {
    if (activeTab === 'all') return true;
    if (activeTab === 'pending') return admission.status === 'requested';
    if (activeTab === 'active') return ['approved', 'assigned'].includes(admission.status);
    return admission.status === activeTab;
  });

  const canApproveAdmission = (admission: Admission) => {
    return (session?.user?.role === 'matron_nurse' || session?.user?.role === 'admin') &&
           admission.status === 'requested';
  };

  const canAssignAdmission = (admission: Admission) => {
    return session?.user?.role === 'matron_nurse' &&
           admission.status === 'approved' &&
           admission.matronNurse?._id === session.user.id;
  };

  const canCancelAdmission = (admission: Admission) => {
    return (session?.user?.role === 'doctor' && admission.doctor._id === session.user.id) ||
           (session?.user?.role === 'matron_nurse' && admission.matronNurse?._id === session.user.id);
  };

  if (loading) {
    return <Loader text="Loading admissions..." />;
  }

  return (
    <div className="space-y-6 md:space-y-8 p-3 md:p-4 lg:p-5">
      {/* Header */}
      <div className="flex flex-col sm:flex-row sm:items-center sm:justify-between gap-4">
        <div>
          <h1 className="text-2xl md:text-3xl font-bold text-gray-900 dark:text-white">
            Admission Management
          </h1>
          <p className="text-sm md:text-base text-muted-foreground mt-1 md:mt-2">
            Manage patient admissions and ward assignments
          </p>
        </div>
        {(session?.user?.role === 'doctor' || session?.user?.role === 'matron_nurse' || session?.user?.role === 'admin') && (
          <AddAdmissionModal onAdmissionAdded={fetchAdmissions}>
            <Button className="w-full sm:w-auto">
              <Plus className="h-4 w-4 mr-2" />
              <span className="hidden md:inline">Request Admission</span>
              <span className="md:hidden">New</span>
            </Button>
          </AddAdmissionModal>
        )}
      </div>

      {/* Stats Cards */}
      <div className="grid grid-cols-2 sm:grid-cols-4 gap-3 md:gap-4 lg:gap-6">
        <Card>
          <CardContent className="p-6">
            <div className="flex items-center">
              <Clock className="h-8 w-8 text-blue-600" />
              <div className="ml-4">
                <p className="text-sm font-medium text-muted-foreground">Pending Review</p>
                <p className="text-2xl font-bold">
                  {admissions.filter(a => a.status === 'requested').length}
                </p>
              </div>
            </div>
          </CardContent>
        </Card>

        <Card>
          <CardContent className="p-6">
            <div className="flex items-center">
              <CheckCircle className="h-8 w-8 text-green-600" />
              <div className="ml-4">
                <p className="text-sm font-medium text-muted-foreground">Approved</p>
                <p className="text-2xl font-bold">
                  {admissions.filter(a => a.status === 'approved').length}
                </p>
              </div>
            </div>
          </CardContent>
        </Card>

        <Card>
          <CardContent className="p-6">
            <div className="flex items-center">
              <Bed className="h-8 w-8 text-purple-600" />
              <div className="ml-4">
                <p className="text-sm font-medium text-muted-foreground">Assigned</p>
                <p className="text-2xl font-bold">
                  {admissions.filter(a => a.status === 'assigned').length}
                </p>
              </div>
            </div>
          </CardContent>
        </Card>

        <Card>
          <CardContent className="p-6">
            <div className="flex items-center">
              <AlertTriangle className="h-8 w-8 text-orange-600" />
              <div className="ml-4">
                <p className="text-sm font-medium text-muted-foreground">Total Active</p>
                <p className="text-2xl font-bold">
                  {admissions.filter(a => ['requested', 'approved', 'assigned'].includes(a.status)).length}
                </p>
              </div>
            </div>
          </CardContent>
        </Card>
      </div>

      {/* Admissions List */}
      <Card>
        <CardHeader>
          <CardTitle>Admissions</CardTitle>
        </CardHeader>
        <CardContent>
          <Tabs value={activeTab} onValueChange={setActiveTab}>
            <TabsList className="grid w-full grid-cols-3 sm:grid-cols-5 h-auto p-1">
              <TabsTrigger value="all" className="text-xs sm:text-sm">All</TabsTrigger>
              <TabsTrigger value="pending" className="text-xs sm:text-sm">Pending</TabsTrigger>
              <TabsTrigger value="approved" className="text-xs sm:text-sm hidden sm:inline-flex">Approved</TabsTrigger>
              <TabsTrigger value="assigned" className="text-xs sm:text-sm hidden sm:inline-flex">Assigned</TabsTrigger>
              <TabsTrigger value="completed" className="text-xs sm:text-sm">Done</TabsTrigger>
            </TabsList>

            <div className="mt-6 space-y-4">
              {filteredAdmissions.length === 0 ? (
                <div className="text-center py-8">
                  <FileText className="h-12 w-12 text-muted-foreground mx-auto mb-4" />
                  <h3 className="text-lg font-semibold text-gray-900 dark:text-white mb-2">
                    No admissions found
                  </h3>
                  <p className="text-muted-foreground">
                    {activeTab === 'all' ? 'No admissions have been requested yet.' : `No ${activeTab} admissions.`}
                  </p>
                </div>
              ) : (
                filteredAdmissions.map((admission) => (
                  <Card key={admission._id} className="hover:shadow-md transition-shadow">
                    <CardContent className="p-4 md:p-6">
                      <div className="flex flex-col sm:flex-row sm:items-start sm:justify-between gap-4">
                        <div className="flex items-start space-x-3 md:space-x-4 flex-1 min-w-0">
                          <Avatar className="h-10 w-10 md:h-12 md:w-12 shrink-0">
                            <AvatarFallback className="text-xs md:text-sm">
                              {admission.patient.firstName[0]}{admission.patient.lastName[0]}
                            </AvatarFallback>
                          </Avatar>

                          <div className="flex-1 min-w-0">
                            <div className="flex flex-wrap items-center gap-2 mb-2">
                              <h3 className="text-base md:text-lg font-semibold text-gray-900 dark:text-white truncate">
                                {admission.patient.firstName} {admission.patient.lastName}
                              </h3>
                              <Badge className={`${getUrgencyColor(admission.urgency)} text-xs`}>
                                {admission.urgency.toUpperCase()}
                              </Badge>
                              <Badge className={`${getStatusColor(admission.status)} text-xs`}>
                                {admission.status.replace('_', ' ').toUpperCase()}
                              </Badge>
                            </div>

                            <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 gap-2 md:gap-4 text-xs md:text-sm text-muted-foreground mb-3 md:mb-4">
                              <div className="min-w-0">
                                <span className="font-medium">MRN:</span>
                                <div className="truncate">{admission.patient.mrn || 'N/A'}</div>
                              </div>
                              <div className="min-w-0">
                                <span className="font-medium">Doctor:</span>
                                <div className="truncate">{admission.doctor.fullName}</div>
                              </div>
                              <div className="min-w-0">
                                <span className="font-medium">Requested:</span>
                                <div className="truncate">{new Date(admission.requestedAt).toLocaleDateString()}</div>
                              </div>
                              {admission.matronNurse && (
                                <div className="min-w-0">
                                  <span className="font-medium">Matron Nurse:</span>
                                  <div className="truncate">{admission.matronNurse.fullName}</div>
                                </div>
                              )}
                              {admission.ward && (
                                <div className="min-w-0">
                                  <span className="font-medium">Ward:</span>
                                  <div className="truncate">{admission.ward.name} ({admission.ward.wardNumber})</div>
                                </div>
                              )}
                              {admission.bedNumber && (
                                <div className="min-w-0">
                                  <span className="font-medium">Bed:</span>
                                  <div className="truncate">{admission.bedNumber}</div>
                                </div>
                              )}
                            </div>

                            <div className="mb-3 md:mb-4">
                              <p className="text-xs md:text-sm">
                                <span className="font-medium">Reason:</span> {admission.reason}
                              </p>
                            </div>

                            {(admission.doctorNotes || admission.matronNurseNotes) && (
                              <div className="space-y-1 md:space-y-2">
                                {admission.doctorNotes && (
                                  <p className="text-xs md:text-sm">
                                    <span className="font-medium">Doctor Notes:</span> {admission.doctorNotes}
                                  </p>
                                )}
                                {admission.matronNurseNotes && (
                                  <p className="text-xs md:text-sm">
                                    <span className="font-medium">Matron Nurse Notes:</span> {admission.matronNurseNotes}
                                  </p>
                                )}
                              </div>
                            )}
                          </div>
                        </div>

                        <div className="flex flex-col sm:flex-row sm:items-center gap-2 sm:ml-4">
                          <div className="flex flex-wrap gap-2">
                          <AdmissionDetailsModal admission={admission} onAdmissionUpdated={fetchAdmissions}>
                            <Button variant="outline" size="sm" className="flex-1 sm:flex-none">
                              <Eye className="h-4 w-4 sm:mr-1" />
                              <span className="hidden sm:inline">View</span>
                            </Button>
                          </AdmissionDetailsModal>

                            {canApproveAdmission(admission) && (
                              <Button
                                variant="outline"
                                size="sm"
                                onClick={() => handleAdmissionAction(admission._id, 'approve')}
                                className="flex-1 sm:flex-none"
                              >
                                <CheckCircle className="h-4 w-4 sm:mr-1" />
                                <span className="hidden sm:inline">Approve</span>
                              </Button>
                            )}

                            {canAssignAdmission(admission) && (
                              <Button
                                variant="outline"
                                size="sm"
                                onClick={() => handleAdmissionAction(admission._id, 'assign', {
                                  ward: 'ward_id', // This would come from a ward selection modal
                                  bedNumber: 'B001'
                                })}
                                className="flex-1 sm:flex-none"
                              >
                                <span className="hidden sm:inline">Assign Ward</span>
                                <span className="sm:hidden">Assign</span>
                              </Button>
                            )}

                            {canCancelAdmission(admission) && (
                              <Button
                                variant="outline"
                                size="sm"
                                onClick={() => handleAdmissionAction(admission._id, 'cancel')}
                                className="text-red-600 hover:text-red-700 flex-1 sm:flex-none"
                              >
                                <XCircle className="h-4 w-4 sm:mr-1" />
                                <span className="hidden sm:inline">Cancel</span>
                              </Button>
                            )}
                          </div>
                        </div>
                      </div>
                    </CardContent>
                  </Card>
                ))
              )}
            </div>
          </Tabs>
        </CardContent>
      </Card>
    </div>
  );
};

export default AdmissionsPage;