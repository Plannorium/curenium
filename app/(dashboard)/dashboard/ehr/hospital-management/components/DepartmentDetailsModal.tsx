"use client";

import { useState } from "react";
import { Button } from "@/components/ui/button";
import { Dialog, DialogContent, DialogHeader, DialogTitle, DialogTrigger } from "@/components/ui/dialog";
import { Badge } from "@/components/ui/badge";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { toast } from "sonner";
import { Building2, Users, UserCheck, UserX } from "lucide-react";
import { useSession } from 'next-auth/react';
import { Department } from '../../../../../../types/schema';
import AssignStaffModal from './AssignStaffModal';

interface DepartmentDetailsModalProps {
  department: Department;
  onDepartmentUpdated: () => void;
  children: React.ReactNode;
}

const DepartmentDetailsModal = ({ department, onDepartmentUpdated, children }: DepartmentDetailsModalProps) => {
  const { data: session } = useSession();
  const [open, setOpen] = useState(false);
  const [loading, setLoading] = useState(false);
  const [confirmRemove, setConfirmRemove] = useState<string | null>(null);
  const isMatronOrAdmin = session?.user?.role?.includes('matron') || session?.user?.role?.includes('admin');

  const handleRemoveStaff = (staffId: string) => {
    setConfirmRemove(staffId);
  };

  const confirmRemoveStaff = async () => {
    if (!confirmRemove) return;

    setLoading(true);
    try {
      const currentStaff = department.assignedStaff || [];
      const staffIds = currentStaff
        .map(s => typeof s === 'object' && s !== null && '_id' in s ? s._id : s)
        .filter(id => id !== confirmRemove);

      const response = await fetch(`/api/departments/${department._id}/assign-staff`, {
        method: 'PATCH',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({ staffIds })
      });

      if (response.ok) {
        toast.success('Staff member removed successfully');
        onDepartmentUpdated();
        setConfirmRemove(null);
      } else {
        toast.error('Failed to remove staff member');
      }
    } catch (error) {
      console.error('Failed to remove staff:', error);
      toast.error('Failed to remove staff member');
    } finally {
      setLoading(false);
    }
  };

  return (
    <Dialog open={open} onOpenChange={setOpen}>
      <DialogTrigger asChild>
        {children}
      </DialogTrigger>
      <DialogContent className="max-w-3xl p-0 overflow-hidden">
        <DialogHeader className="border-b px-6 py-4">
          <DialogTitle className="flex items-center gap-2 text-lg font-medium">
            <Building2 className="h-5 w-5 text-primary" />
            {department.name}
          </DialogTitle>
          <p className="text-sm text-muted-foreground mt-1">
            Department Details
          </p>
        </DialogHeader>

        <div className="p-6 pt-4 space-y-6 max-h-[70vh] overflow-y-auto">
          {/* Department Information */}
          <div className="space-y-4">
            <h3 className="font-medium text-base flex items-center gap-2">
              Department Information
            </h3>
            <div className="grid grid-cols-1 sm:grid-cols-2 gap-4 text-sm">
              <div>
                <p className="text-muted-foreground">Name</p>
                <p className="font-medium">{department.name}</p>
              </div>
              <div>
                <p className="text-muted-foreground">Status</p>
                <Badge variant={department.isActive ? "default" : "secondary"} className="mt-1">
                  {department.isActive ? "Active" : "Inactive"}
                </Badge>
              </div>
              {department.headOfDepartment && (
                <div>
                  <p className="text-muted-foreground">Head of Department</p>
                  <p className="font-medium">{department.headOfDepartment.fullName}</p>
                </div>
              )}
              <div className="sm:col-span-2">
                <p className="text-muted-foreground">Description</p>
                <p className="font-medium">{department.description || "No description provided"}</p>
              </div>
              {department.specialties && department.specialties.length > 0 && (
                <div className="sm:col-span-2">
                  <p className="text-muted-foreground">Specialties</p>
                  <div className="flex flex-wrap gap-1.5 mt-1">
                    {department.specialties.map((specialty, index) => (
                      <Badge key={index} variant="outline" className="text-xs">
                        {specialty}
                      </Badge>
                    ))}
                  </div>
                </div>
              )}
            </div>
          </div>

          {/* Assigned Staff */}
          <div className="space-y-4">
            <div className="flex items-center justify-between">
              <h3 className="font-medium text-base flex items-center gap-2">
                <Users className="h-5 w-5" />
                Assigned Staff ({department.assignedStaff?.length || 0})
              </h3>
              {isMatronOrAdmin && (
                <AssignStaffModal department={department} onStaffAssigned={onDepartmentUpdated}>
                  <Button size="sm">
                    <UserCheck className="h-4 w-4 mr-1.5" />
                    Assign Staff
                  </Button>
                </AssignStaffModal>
              )}
            </div>

            {department.assignedStaff && department.assignedStaff.length > 0 ? (
              <div className="grid grid-cols-1 sm:grid-cols-2 gap-3">
                {department.assignedStaff.map((staff, index) => (
                  <Card key={`staff-${staff._id}-${index}`} className="border shadow-sm">
                    <CardContent className="p-4">
                      <div className="flex items-center justify-between gap-3">
                        <div className="flex-1 min-w-0">
                          <p className="font-medium text-sm truncate">{staff.fullName}</p>
                          <Badge variant="outline" className="text-xs mt-1">
                            {staff.role}
                          </Badge>
                        </div>
                        {isMatronOrAdmin && (
                          <Button
                            variant="ghost"
                            size="icon"
                            onClick={() => handleRemoveStaff(typeof staff === 'object' && staff !== null && '_id' in staff ? staff._id : staff)}
                            className="h-8 w-8 text-red-600 hover:text-red-700 hover:bg-red-50"
                            disabled={loading}
                            aria-label={`Remove ${staff.fullName} from department`}
                          >
                            <UserX className="h-4 w-4" />
                          </Button>
                        )}
                      </div>
                      {confirmRemove === (typeof staff === 'object' && staff !== null && '_id' in staff ? staff._id : staff) && (
                        <div className="mt-3 p-3 bg-red-50 border border-red-200 rounded-md">
                          <p className="text-sm text-red-800 mb-2">
                            Are you sure you want to remove this staff member?
                          </p>
                          <div className="flex gap-2">
                            <Button
                              size="sm"
                              variant="destructive"
                              onClick={confirmRemoveStaff}
                              disabled={loading}
                            >
                              {loading ? 'Removing...' : 'Remove'}
                            </Button>
                            <Button
                              size="sm"
                              variant="outline"
                              onClick={() => setConfirmRemove(null)}
                            >
                              Cancel
                            </Button>
                          </div>
                        </div>
                      )}
                    </CardContent>
                  </Card>
                ))}
              </div>
            ) : (
              <div className="text-center py-10 border rounded-lg bg-muted/30">
                <Users className="h-10 w-10 text-muted-foreground mx-auto mb-3 opacity-50" />
                <p className="text-sm text-muted-foreground">
                  No staff members assigned to this department
                </p>
                {isMatronOrAdmin && (
                  <AssignStaffModal department={department} onStaffAssigned={onDepartmentUpdated}>
                    <Button size="sm" className="mt-4">
                      <UserCheck className="h-4 w-4 mr-1.5" />
                      Assign First Staff Member
                    </Button>
                  </AssignStaffModal>
                )}
              </div>
            )}
          </div>

          <div className="flex justify-end pt-4 border-t">
            <Button variant="outline" onClick={() => setOpen(false)}>
              Close
            </Button>
          </div>
        </div>
      </DialogContent>
    </Dialog>
  );
};

export default DepartmentDetailsModal;