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
import { Ward, Nurse } from '../../../../../../types/schema';



interface AssignNursesModalProps {
  ward: Ward;
  onNursesAssigned: () => void;
  children: React.ReactNode;
}

const AssignNursesModal = ({ ward, onNursesAssigned, children }: AssignNursesModalProps) => {
  const { data: session } = useSession();
  const [open, setOpen] = useState(false);
  const [availableNurses, setAvailableNurses] = useState<Nurse[]>([]);
  const [selectedNurses, setSelectedNurses] = useState<string[]>([]);
  const [loading, setLoading] = useState(false);
  const [fetching, setFetching] = useState(true);

  useEffect(() => {
    if (open) {
      fetchAvailableNurses();
    }
  }, [open]);

  const fetchAvailableNurses = async () => {
    setFetching(true);
    try {
      // Fetch all departments and wards to check current assignments
      const [nursesRes, departmentsRes, wardsRes] = await Promise.all([
        fetch('/api/users?role=nurse&role=matron_nurse'),
        fetch('/api/departments'),
        fetch('/api/wards')
      ]);

      if (nursesRes.ok && departmentsRes.ok && wardsRes.ok) {
        const nurses: Nurse[] = await nursesRes.json();
        const departments: any[] = await departmentsRes.json();
        const wards: any[] = await wardsRes.json();

        // Create a map of nurses currently assigned to other departments or wards
        const assignedElsewhere = new Set<string>();
        const assignmentDetails = new Map<string, string>();

        // Check OTHER department assignments (exclude current department)
        departments.forEach(dept => {
          if (dept._id !== ward.department._id && dept.assignedStaff) {
            dept.assignedStaff.forEach((s: any) => {
              // Handle both populated and non-populated data structures
              const staffId = s._id?._id || s._id || s;
              assignedElsewhere.add(staffId);
              assignmentDetails.set(staffId, `Department: ${dept.name}`);
            });
          }
        });

        // Check ward assignments (exclude current ward)
        wards.forEach(w => {
          if (w._id !== ward._id && w.assignedNurses) {
            w.assignedNurses.forEach((n: any) => {
              // Handle both populated and non-populated data structures
              const nurseId = n._id?._id || n._id || n;
              assignedElsewhere.add(nurseId);
              assignmentDetails.set(nurseId, `Ward: ${w.name}`);
            });
          }
        });

        // Filter nurses
        const availableNursesFiltered = nurses
          .filter(nurse => nurse.department === ward.department._id || !nurse.department)
          .filter(nurse => !assignedElsewhere.has(nurse._id));

        setAvailableNurses(availableNursesFiltered);
        // Pre-select currently assigned nurses
        setSelectedNurses(ward.assignedNurses?.map(n => n._id) || []);
      }
    } catch (error) {
      console.error('Failed to fetch nurses:', error);
      toast.error('Failed to load nurses');
    } finally {
      setFetching(false);
    }
  };

  const handleAssignNurses = async () => {
    if (session?.user?.role !== 'matron_nurse' && session?.user?.role !== 'admin') {
      toast.error('Insufficient permissions to assign nurses');
      return;
    }

    setLoading(true);
    try {
      const response = await fetch(`/api/wards/${ward._id}/assign-nurses`, {
        method: 'PATCH',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({ nurseIds: selectedNurses })
      });

      if (response.ok) {
        toast.success('Nurses assigned successfully');
        onNursesAssigned();
        setOpen(false);
      } else {
        const errorData = await response.json();
        toast.error('Failed to assign nurses');
      }
    } catch (error) {
      console.error('Failed to assign nurses:', error);
      toast.error(error instanceof Error ? error.message : 'Failed to assign nurses');
    } finally {
      setLoading(false);
    }
  };

  const toggleNurseSelection = (nurseId: string) => {
    setSelectedNurses(prev =>
      prev.includes(nurseId)
        ? prev.filter(id => id !== nurseId)
        : [...prev, nurseId]
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
            Assign Nurses to {ward.name}
          </DialogTitle>
        </DialogHeader>

        {fetching ? (
          <Loader text="Loading nurses..." />
        ) : (
          <div className="space-y-4">
            <div className="flex items-center justify-between">
              <p className="text-sm text-muted-foreground">
                Select nurses to assign to this ward. Only nurses from the same department can be assigned.
              </p>
              <Badge variant="outline">
                {selectedNurses.length} selected
              </Badge>
            </div>

            <div className="grid grid-cols-1 md:grid-cols-2 gap-3 max-h-96 overflow-y-auto">
              {availableNurses.map((nurse, index) => {
                const isSelected = selectedNurses.includes(nurse._id);
                const isCurrentlyAssigned = ward.assignedNurses?.some(n => n._id === nurse._id);

                return (
                  <Card
                    key={`assign-nurse-${nurse._id}-${index}`}
                    className={`cursor-pointer transition-all ${
                      isSelected ? 'ring-2 ring-primary bg-primary/5' : 'hover:shadow-md'
                    }`}
                    onClick={() => toggleNurseSelection(nurse._id)}
                  >
                    <CardContent className="p-3">
                      <div className="flex items-center justify-between">
                        <div className="flex-1">
                          <p className="font-medium text-sm">{nurse.fullName}</p>
                          <p className="text-xs text-muted-foreground">{nurse.email}</p>
                          <Badge variant="outline" className="text-xs mt-1">
                            {nurse.role}
                          </Badge>
                          {(nurse as any).assignedTo && (
                            <p className="text-xs text-orange-600 mt-1">
                              ⚠️ {(nurse as any).assignedTo}
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

            {availableNurses.filter(nurse => nurse.department === ward.department._id || !nurse.department).length === 0 && (
              <div className="text-center py-8 text-muted-foreground">
                No nurses available for assignment in this department.
              </div>
            )}

            <div className="flex justify-end gap-3 pt-4 border-t">
              <Button variant="outline" onClick={() => setOpen(false)}>
                Cancel
              </Button>
              <Button onClick={handleAssignNurses} disabled={loading}>
                {loading ? 'Assigning...' : 'Assign Nurses'}
              </Button>
            </div>
          </div>
        )}
      </DialogContent>
    </Dialog>
  );
};

export default AssignNursesModal;