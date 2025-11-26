"use client";
import React, { useState, useEffect } from "react";
import { Avatar, AvatarFallback, AvatarImage } from "@/components/ui/avatar";
import { Button } from "@/components/ui/button";
import {
  Dialog,
  DialogContent,
  DialogHeader,
  DialogTitle,
  DialogTrigger,
  DialogFooter,
} from "@/components/ui/dialog";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import { Textarea } from "@/components/ui/textarea";
import {
  Select,
  SelectContent,
  SelectItem,
  SelectTrigger,
  SelectValue,
} from "@/components/ui/select";
import { Badge } from "@/components/ui/badge";
import { Separator } from "@/components/ui/separator";
import {
  Eye,
  CheckCircle,
  XCircle,
  Bed,
  Building,
  FileText,
  Clock,
  User,
  AlertTriangle,
  Loader2
} from "lucide-react";
import { toast } from "sonner";
import { useSession } from "next-auth/react";

interface Patient {
  _id: string;
  firstName: string;
  lastName: string;
  mrn?: string;
  dob?: string;
  gender?: string;
}

interface Admission {
  _id: string;
  patient: Patient;
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
  estimatedStay?: number;
  specialRequirements?: string[];
}

interface Department {
  _id: string;
  name: string;
}

interface Ward {
  _id: string;
  name: string;
  wardNumber: string;
  department: string;
  totalBeds: number;
  occupiedBeds: number;
}

interface AdmissionDetailsModalProps {
  admission: Admission | null;
  onAdmissionUpdated: () => void;
  children: React.ReactNode;
}

const AdmissionDetailsModal: React.FC<AdmissionDetailsModalProps> = React.memo(
  ({ admission, onAdmissionUpdated, children }) => {
    const { data: session } = useSession();
    const [isOpen, setIsOpen] = useState(false);
    const [departments, setDepartments] = useState<Department[]>([]);
    const [wards, setWards] = useState<Ward[]>([]);
    const [selectedDepartment, setSelectedDepartment] = useState("");
    const [selectedWard, setSelectedWard] = useState("");
    const [bedNumber, setBedNumber] = useState("");
    const [matronNurseNotes, setMatronNurseNotes] = useState("");
    const [isSubmitting, setIsSubmitting] = useState(false);
    const [wardsLoading, setWardsLoading] = useState(false);

    useEffect(() => {
      if (admission && isOpen) {
        setSelectedDepartment(admission.department?._id || "");
        setSelectedWard(admission.ward?._id || "");
        setBedNumber(admission.bedNumber || "");
        setMatronNurseNotes(admission.matronNurseNotes || "");
      }
    }, [admission, isOpen]);

    useEffect(() => {
      const fetchDepartments = async () => {
        if (!isOpen) return;

        try {
          const deptRes = await fetch('/api/departments');
          if (deptRes.ok) {
            const deptData = await deptRes.json() as Department[];
            setDepartments(deptData);
          }
        } catch (error) {
          console.error("Failed to fetch departments:", error);
        }
      };

      fetchDepartments();
    }, [isOpen]);

    // Fetch wards when department is selected
    useEffect(() => {
      const fetchWards = async () => {
        if (!selectedDepartment) {
          setWards([]);
          return;
        }

        setWardsLoading(true);
        try {
          const wardsRes = await fetch(`/api/wards?department=${selectedDepartment}`);
          if (wardsRes.ok) {
            const wardsData = await wardsRes.json() as Ward[];
            setWards(wardsData);
          }
        } catch (error) {
          console.error("Failed to fetch wards:", error);
          setWards([]);
        } finally {
          setWardsLoading(false);
        }
      };

      if (selectedDepartment) {
        fetchWards();
      } else {
        setWards([]);
        setWardsLoading(false);
      }
    }, [selectedDepartment]);

    const handleAdmissionAction = async (action: string, data?: any) => {
      if (!admission) return;

      setIsSubmitting(true);
      try {
        const response = await fetch(`/api/admissions/${admission._id}`, {
          method: 'PUT',
          headers: { "Content-Type": "application/json" },
          body: JSON.stringify({ action, ...data }),
        });

        if (response.ok) {
          toast.success(`Admission ${action.replace('_', ' ')} successfully`);
          onAdmissionUpdated();
          setIsOpen(false);
        } else {
          const error = await response.json() as { message?: string };
          toast.error(error.message || `Failed to ${action} admission`);
        }
      } catch (error) {
        console.error(`Failed to ${action} admission:`, error);
        toast.error(`An error occurred while ${action}ing admission`);
      } finally {
        setIsSubmitting(false);
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

    const canApprove = (session?.user?.role === 'matron_nurse' || session?.user?.role === 'admin') && admission?.status === 'requested';
    const canAssign = session?.user?.role === 'matron_nurse' && admission?.status === 'approved' && admission?.matronNurse?._id === session.user.id;
    const canCancel = (session?.user?.role === 'doctor' && admission?.doctor._id === session.user.id) ||
                     (session?.user?.role === 'matron_nurse' && admission?.matronNurse?._id === session.user.id) ||
                     session?.user?.role === 'admin';

    const filteredWards = wards.filter(ward =>
      !selectedDepartment || ward.department === selectedDepartment
    );

    if (!admission) return null;

    return (
      <Dialog open={isOpen} onOpenChange={setIsOpen}>
        <DialogTrigger asChild>{children}</DialogTrigger>
        <DialogContent className="bg-white/80 dark:bg-gray-950/80 backdrop-blur-lg max-w-4xl max-h-[90vh] overflow-y-auto p-0">
          <DialogHeader className="p-4 md:p-6 pb-3 md:pb-4">
            <DialogTitle className="text-lg md:text-xl font-bold text-gray-800 dark:text-gray-100 flex items-center">
              <div className="flex items-center justify-center w-8 h-8 md:w-9 md:h-9 rounded-lg bg-blue-500/10 border border-blue-500/20 mr-2 md:mr-3">
                <Eye className="h-4 w-4 md:h-5 md:w-5 text-blue-500 dark:text-blue-400" />
              </div>
              Admission Details
            </DialogTitle>
          </DialogHeader>

          <div className="px-4 md:px-6 pb-4 md:pb-6 space-y-6">
            {/* Patient Info */}
            <div className="bg-gray-50/80 dark:bg-gray-900/80 rounded-lg p-4">
              <div className="flex items-center space-x-4 mb-4">
                <Avatar className="h-12 w-12">
                  <AvatarFallback>
                    {admission.patient.firstName[0]}{admission.patient.lastName[0]}
                  </AvatarFallback>
                </Avatar>
                <div>
                  <h3 className="text-lg font-semibold text-gray-900 dark:text-white">
                    {admission.patient.firstName} {admission.patient.lastName}
                  </h3>
                  <p className="text-sm text-muted-foreground">
                    MRN: {admission.patient.mrn || 'N/A'}
                  </p>
                </div>
              </div>

              <div className="grid grid-cols-1 md:grid-cols-2 gap-4 text-sm">
                <div>
                  <span className="font-medium">Age:</span> {admission.patient.dob ? new Date().getFullYear() - new Date(admission.patient.dob).getFullYear() : 'N/A'}
                </div>
                <div>
                  <span className="font-medium">Gender:</span> {admission.patient.gender || 'N/A'}
                </div>
                <div>
                  <span className="font-medium">Doctor:</span> {admission.doctor.fullName}
                </div>
                <div>
                  <span className="font-medium">Requested:</span> {new Date(admission.requestedAt).toLocaleString()}
                </div>
              </div>
            </div>

            {/* Status and Urgency */}
            <div className="flex flex-wrap gap-2">
              <Badge className={`${getStatusColor(admission.status)} text-sm px-3 py-1`}>
                Status: {admission.status.replace('_', ' ').toUpperCase()}
              </Badge>
              <Badge className={`${getUrgencyColor(admission.urgency)} text-sm px-3 py-1`}>
                <AlertTriangle className="h-3 w-3 mr-1" />
                {admission.urgency.toUpperCase()}
              </Badge>
            </div>

            {/* Admission Details */}
            <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
              <div className="space-y-4">
                <div>
                  <Label className="text-sm font-semibold text-gray-700 dark:text-gray-300 flex items-center">
                    <FileText className="h-4 w-4 mr-2" />
                    Reason for Admission
                  </Label>
                  <p className="mt-2 text-sm text-gray-600 dark:text-gray-400 bg-gray-50/80 dark:bg-gray-900/80 p-3 rounded-lg">
                    {admission.reason}
                  </p>
                </div>

                {admission.estimatedStay && (
                  <div>
                    <Label className="text-sm font-semibold text-gray-700 dark:text-gray-300 flex items-center">
                      <Clock className="h-4 w-4 mr-2" />
                      Estimated Stay
                    </Label>
                    <p className="mt-2 text-sm text-gray-600 dark:text-gray-400">
                      {admission.estimatedStay} days
                    </p>
                  </div>
                )}

                {admission.specialRequirements && admission.specialRequirements.length > 0 && (
                  <div>
                    <Label className="text-sm font-semibold text-gray-700 dark:text-gray-300">
                      Special Requirements
                    </Label>
                    <div className="mt-2 flex flex-wrap gap-2">
                      {admission.specialRequirements.map((req, index) => (
                        <Badge key={index} variant="outline" className="text-xs">
                          {req}
                        </Badge>
                      ))}
                    </div>
                  </div>
                )}
              </div>

              <div className="space-y-4">
                {admission.doctorNotes && (
                  <div>
                    <Label className="text-sm font-semibold text-gray-700 dark:text-gray-300 flex items-center">
                      <User className="h-4 w-4 mr-2" />
                      Doctor Notes
                    </Label>
                    <p className="mt-2 text-sm text-gray-600 dark:text-gray-400 bg-gray-50/80 dark:bg-gray-900/80 p-3 rounded-lg">
                      {admission.doctorNotes}
                    </p>
                  </div>
                )}

                {admission.matronNurse && admission.matronNurseNotes && (
                  <div>
                    <Label className="text-sm font-semibold text-gray-700 dark:text-gray-300 flex items-center">
                      <User className="h-4 w-4 mr-2" />
                      Matron Nurse Notes
                    </Label>
                    <p className="mt-2 text-sm text-gray-600 dark:text-gray-400 bg-gray-50/80 dark:bg-gray-900/80 p-3 rounded-lg">
                      {admission.matronNurseNotes}
                    </p>
                  </div>
                )}

                {admission.ward && (
                  <div>
                    <Label className="text-sm font-semibold text-gray-700 dark:text-gray-300 flex items-center">
                      <Bed className="h-4 w-4 mr-2" />
                      Ward Assignment
                    </Label>
                    <p className="mt-2 text-sm text-gray-600 dark:text-gray-400">
                      {admission.ward.name} (Ward {admission.ward.wardNumber})
                      {admission.bedNumber && ` - Bed ${admission.bedNumber}`}
                    </p>
                  </div>
                )}
              </div>
            </div>

            {/* Action Forms */}
            {canApprove && (
              <>
                <Separator />
                <div className="space-y-4">
                  <h4 className="text-md font-semibold text-gray-800 dark:text-gray-200">Approve Admission Request</h4>

                  <div className="space-y-2">
                    <Label htmlFor="approval-notes" className="text-sm font-semibold text-gray-700 dark:text-gray-300">
                      Approval Notes
                    </Label>
                    <Textarea
                      id="approval-notes"
                      value={matronNurseNotes}
                      onChange={(e) => setMatronNurseNotes(e.target.value)}
                      placeholder="Add approval notes..."
                      className="bg-gray-50/80 dark:bg-gray-900/80 border-gray-300/70 dark:border-gray-700/60"
                    />
                  </div>

                  <div className="grid grid-cols-1 md:grid-cols-3 gap-4">
                    <div className="space-y-2">
                      <Label htmlFor="department" className="text-sm font-semibold text-gray-700 dark:text-gray-300 flex items-center">
                        <Building className="h-4 w-4 mr-2" />
                        Department *
                      </Label>
                      <Select value={selectedDepartment} onValueChange={(value) => {
                        setSelectedDepartment(value);
                        setSelectedWard(""); // Reset ward when department changes
                      }}>
                        <SelectTrigger className="bg-gray-50/80 dark:bg-gray-900/80 border-gray-300/70 dark:border-gray-700/60">
                          <SelectValue placeholder="Select department" />
                        </SelectTrigger>
                        <SelectContent>
                          {departments.map((dept) => (
                            <SelectItem key={dept._id} value={dept._id}>
                              {dept.name}
                            </SelectItem>
                          ))}
                        </SelectContent>
                      </Select>
                    </div>

                    <div className="space-y-2">
                      <Label htmlFor="ward" className="text-sm font-semibold text-gray-700 dark:text-gray-300 flex items-center">
                        <Bed className="h-4 w-4 mr-2" />
                        Ward *
                      </Label>
                      <Select value={selectedWard} onValueChange={setSelectedWard} disabled={!selectedDepartment || wardsLoading}>
                        <SelectTrigger className="bg-gray-50/80 dark:bg-gray-900/80 border-gray-300/70 dark:border-gray-700/60">
                          <SelectValue placeholder={
                            !selectedDepartment
                              ? "Select department first"
                              : wardsLoading
                                ? "Loading wards..."
                                : "Select ward"
                          } />
                        </SelectTrigger>
                        <SelectContent>
                          {filteredWards.map((ward) => (
                            <SelectItem key={ward._id} value={ward._id}>
                              {ward.name} (Ward {ward.wardNumber}) - {ward.totalBeds - ward.occupiedBeds} beds available
                            </SelectItem>
                          ))}
                        </SelectContent>
                      </Select>
                    </div>

                    <div className="flex items-end">
                      <Button
                        onClick={() => handleAdmissionAction('approve', {
                          matronNurseNotes,
                          department: selectedDepartment,
                          ward: selectedWard
                        })}
                        disabled={isSubmitting || !selectedDepartment || !selectedWard}
                        className="bg-green-500 hover:bg-green-600 text-white w-full"
                      >
                        {isSubmitting ? <Loader2 className="h-4 w-4 animate-spin mr-2" /> : <CheckCircle className="h-4 w-4 mr-2" />}
                        Approve Admission
                      </Button>
                    </div>
                  </div>
                </div>
              </>
            )}

            {canAssign && (
              <>
                <Separator />
                <div className="space-y-4">
                  <h4 className="text-md font-semibold text-gray-800 dark:text-gray-200">Assign Ward and Bed</h4>

                  <div className="grid grid-cols-1 md:grid-cols-3 gap-4">
                    <div className="space-y-2">
                      <Label htmlFor="department" className="text-sm font-semibold text-gray-700 dark:text-gray-300 flex items-center">
                        <Building className="h-4 w-4 mr-2" />
                        Department
                      </Label>
                      <Select value={selectedDepartment} onValueChange={setSelectedDepartment}>
                        <SelectTrigger className="bg-gray-50/80 dark:bg-gray-900/80 border-gray-300/70 dark:border-gray-700/60">
                          <SelectValue placeholder="Select department" />
                        </SelectTrigger>
                        <SelectContent>
                          {departments.map((dept) => (
                            <SelectItem key={dept._id} value={dept._id}>
                              {dept.name}
                            </SelectItem>
                          ))}
                        </SelectContent>
                      </Select>
                    </div>

                    <div className="space-y-2">
                      <Label htmlFor="ward" className="text-sm font-semibold text-gray-700 dark:text-gray-300 flex items-center">
                        <Bed className="h-4 w-4 mr-2" />
                        Ward
                      </Label>
                      <Select value={selectedWard} onValueChange={setSelectedWard} disabled={!selectedDepartment}>
                        <SelectTrigger className="bg-gray-50/80 dark:bg-gray-900/80 border-gray-300/70 dark:border-gray-700/60">
                          <SelectValue placeholder="Select ward" />
                        </SelectTrigger>
                        <SelectContent>
                          {filteredWards.map((ward) => (
                            <SelectItem key={ward._id} value={ward._id}>
                              {ward.name} (Ward {ward.wardNumber}) - {ward.totalBeds - ward.occupiedBeds} beds available
                            </SelectItem>
                          ))}
                        </SelectContent>
                      </Select>
                    </div>

                    <div className="space-y-2">
                      <Label htmlFor="bed" className="text-sm font-semibold text-gray-700 dark:text-gray-300">
                        Bed Number
                      </Label>
                      <Input
                        id="bed"
                        value={bedNumber}
                        onChange={(e) => setBedNumber(e.target.value)}
                        placeholder="e.g., B001"
                        className="bg-gray-50/80 dark:bg-gray-900/80 border-gray-300/70 dark:border-gray-700/60"
                      />
                    </div>
                  </div>

                  <Button
                    onClick={() => handleAdmissionAction('assign', {
                      department: selectedDepartment,
                      ward: selectedWard,
                      bedNumber
                    })}
                    disabled={isSubmitting || !selectedWard || !bedNumber.trim()}
                    className="bg-purple-500 hover:bg-purple-600 text-white"
                  >
                    {isSubmitting ? <Loader2 className="h-4 w-4 animate-spin mr-2" /> : <Bed className="h-4 w-4 mr-2" />}
                    Assign Ward & Bed
                  </Button>
                </div>
              </>
            )}
          </div>

          <DialogFooter className="px-4 md:px-6 py-3 md:py-4 bg-gray-50 dark:bg-gray-900/70 border-t border-gray-200 dark:border-gray-800/60">
            <Button variant="ghost" onClick={() => setIsOpen(false)}>
              Close
            </Button>
            {canCancel && (
              <Button
                variant="outline"
                onClick={() => handleAdmissionAction('cancel')}
                disabled={isSubmitting}
                className="text-red-600 hover:text-red-700"
              >
                <XCircle className="h-4 w-4 mr-2" />
                Cancel Admission
              </Button>
            )}
          </DialogFooter>
        </DialogContent>
      </Dialog>
    );
  }
);

AdmissionDetailsModal.displayName = "AdmissionDetailsModal";

export default AdmissionDetailsModal;