"use client";

import { useState, useEffect } from "react";
import { Button } from "@/components/ui/button";
import { Dialog, DialogContent, DialogHeader, DialogTitle, DialogTrigger } from "@/components/ui/dialog";
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from "@/components/ui/select";
import { Badge } from "@/components/ui/badge";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { toast } from "sonner";
import { Loader } from "@/components/ui/Loader";
import { UserCheck, X } from "lucide-react";
import { useSession } from 'next-auth/react';
import { Department, Staff } from '../../../../../../types/schema';

interface AssignStaffModalProps {
  department: Department;
  onStaffAssigned: () => void;
  children: React.ReactNode;
}

const AssignStaffModal = ({ department, onStaffAssigned, children }: AssignStaffModalProps) => {
  const { data: session } = useSession();
  const [open, setOpen] = useState(false);
  const [availableStaff, setAvailableStaff] = useState<Staff[]>([]);
  const [selectedStaff, setSelectedStaff] = useState<string[]>([]);
  const [loading, setLoading] = useState(false);
  const [fetching, setFetching] = useState(true);

  useEffect(() => {
    if (open) {
      fetchAvailableStaff();
    }
  }, [open]);

  const fetchAvailableStaff = async () => {
    setFetching(true);
    try {
      // Fetch all departments and wards to check current assignments
      const [staffRes, departmentsRes, wardsRes] = await Promise.all([
        fetch('/api/users?role=admin&role=doctor&role=nurse&role=matron_nurse&role=manager&role=staff&role=labtech&role=reception'),
        fetch('/api/departments'),
        fetch('/api/wards')
      ]);

      if (staffRes.ok && departmentsRes.ok && wardsRes.ok) {
        const staff: Staff[] = await staffRes.json();
        const departments: any[] = await departmentsRes.json();
        const wards: any[] = await wardsRes.json();

        // Create a map of staff currently assigned to other departments/wards
        const assignedElsewhere = new Set<string>();
        const assignmentDetails = new Map<string, string>();

        departments.forEach(dept => {
          if (dept._id !== department._id && dept.assignedStaff) {
            dept.assignedStaff.forEach((s: any) => {
              // Handle both populated and non-populated data structures
              const staffId = s._id?._id || s._id || s;
              assignedElsewhere.add(staffId);
              assignmentDetails.set(staffId, `Department: ${dept.name}`);
            });
          }
        });

        wards.forEach(ward => {
          if (ward.assignedNurses) {
            ward.assignedNurses.forEach((n: any) => {
              // Handle both populated and non-populated data structures
              const nurseId = n._id?._id || n._id || n;
              assignedElsewhere.add(nurseId);
              assignmentDetails.set(nurseId, `Ward: ${ward.name}`);
            });
          }
        });

        // Filter out staff already assigned elsewhere
        const availableStaffFiltered = staff
          .filter(s => !assignedElsewhere.has(s._id));

        setAvailableStaff(availableStaffFiltered);
        // Pre-select currently assigned staff
        setSelectedStaff(department.assignedStaff?.map(s => (s._id as any)?._id || s._id) || []);
      }
    } catch (error) {
      console.error('Failed to fetch staff:', error);
      toast.error('Failed to load staff');
    } finally {
      setFetching(false);
    }
  };

  const handleAssignStaff = async () => {
    if (!session?.user?.role?.includes('matron') && !session?.user?.role?.includes('admin')) {
      toast.error('Insufficient permissions to assign staff');
      return;
    }

    setLoading(true);
    try {
      const response = await fetch(`/api/departments/${department._id}/assign-staff`, {
        method: 'PATCH',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({ staffIds: selectedStaff })
      });

      if (response.ok) {
        toast.success('Staff assigned successfully');
        onStaffAssigned();
        setOpen(false);
      } else {
        const errorData = await response.json();
        toast.error('Failed to assign staff');
      }
    } catch (error) {
      console.error('Failed to assign staff:', error);
      toast.error(error instanceof Error ? error.message : 'Failed to assign staff');
    } finally {
      setLoading(false);
    }
  };

  const toggleStaffSelection = (staffId: string) => {
    setSelectedStaff(prev =>
      prev.includes(staffId)
        ? prev.filter(id => id !== staffId)
        : [...prev, staffId]
    );
  };

  return (
    <Dialog open={open} onOpenChange={setOpen}>
      <DialogTrigger asChild>
        {children}
      </DialogTrigger>
      <DialogContent className="max-w-2xl max-h-[80vh] overflow-y-auto">
        <DialogHeader>
          <DialogTitle className="flex items-center gap-2">
            <UserCheck className="h-5 w-5" />
            Assign Staff to {department.name}
          </DialogTitle>
        </DialogHeader>

        {fetching ? (
          <Loader text="Loading staff..." />
        ) : (
          <div className="space-y-4">
            <div className="flex items-center justify-between">
              <p className="text-sm text-muted-foreground">
                Select staff members to assign to this department.
              </p>
              <Badge variant="outline">
                {selectedStaff.length} selected
              </Badge>
            </div>

            <div className="grid grid-cols-1 md:grid-cols-2 gap-3 max-h-96 overflow-y-auto">
              {availableStaff.map((staff, index) => {
                const isSelected = selectedStaff.includes(staff._id);
                const isCurrentlyAssigned = department.assignedStaff?.some(s => ((s._id as any)?._id || s._id) === staff._id);

                return (
                  <Card
                    key={`assign-staff-${staff._id}-${index}`}
                    className={`cursor-pointer transition-all ${
                      isSelected ? 'ring-2 ring-primary bg-primary/5' : 'hover:shadow-md'
                    }`}
                    onClick={() => toggleStaffSelection(staff._id)}
                  >
                    <CardContent className="p-3">
                      <div className="flex items-center justify-between">
                        <div className="flex-1">
                          <p className="font-medium text-sm">{staff.fullName}</p>
                          <p className="text-xs text-muted-foreground">{staff.email}</p>
                          <Badge variant="outline" className="text-xs mt-1">
                            {staff.role}
                          </Badge>
                          {(staff as any).assignedTo && (
                            <p className="text-xs text-orange-600 mt-1">
                              ⚠️ {(staff as any).assignedTo}
                            </p>
                          )}
                        </div>
                        <div className="flex items-center gap-2">
                          {isCurrentlyAssigned && (
                            <Badge variant="secondary" className="text-xs">
                              Assigned
                            </Badge>
                          )}
                          {isSelected && <UserCheck className="h-4 w-4 text-primary" />}
                        </div>
                      </div>
                    </CardContent>
                  </Card>
                );
              })}
            </div>

            {availableStaff.length === 0 && (
              <div className="text-center py-8 text-muted-foreground">
                No staff members available for assignment.
              </div>
            )}

            <div className="flex justify-end gap-3 pt-4 border-t">
              <Button variant="outline" onClick={() => setOpen(false)}>
                Cancel
              </Button>
              <Button onClick={handleAssignStaff} disabled={loading}>
                {loading ? 'Assigning...' : 'Assign Staff'}
              </Button>
            </div>
          </div>
        )}
      </DialogContent>
    </Dialog>
  );
};

export default AssignStaffModal;