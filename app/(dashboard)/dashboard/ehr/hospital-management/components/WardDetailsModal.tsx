"use client";

import { useState, useEffect } from "react";
import { Button } from "@/components/ui/button";
import { Dialog, DialogContent, DialogHeader, DialogTitle, DialogTrigger } from "@/components/ui/dialog";
import { Badge } from "@/components/ui/badge";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { toast } from "sonner";
import { Loader } from "@/components/ui/Loader";
import { Users, UserCheck, UserX, Bed, MapPin, Calendar } from "lucide-react";
import { useSession } from 'next-auth/react';
import { Ward } from '../../../../../../types/schema';
import AssignNursesModal from './AssignNursesModal';

interface WardDetailsModalProps {
  ward: Ward;
  onWardUpdated: () => void;
  children: React.ReactNode;
}

const WardDetailsModal = ({ ward, onWardUpdated, children }: WardDetailsModalProps) => {
  const { data: session } = useSession();
  const [open, setOpen] = useState(false);
  const [loading, setLoading] = useState(false);
  const [confirmRemove, setConfirmRemove] = useState<string | null>(null);
  const isMatronOrAdmin = session?.user?.role?.includes('matron') || session?.user?.role?.includes('admin');

  const handleRemoveNurse = (nurseId: string) => {
    setConfirmRemove(nurseId);
  };

  const confirmRemoveNurse = async () => {
    if (!confirmRemove) return;

    setLoading(true);
    try {
      const currentNurses = ward.assignedNurses || [];
      const updatedNurses = currentNurses.filter(n => ((n._id as any)?._id || n._id) !== confirmRemove);

      const response = await fetch(`/api/wards/${ward._id}/assign-nurses`, {
        method: 'PATCH',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({ nurseIds: updatedNurses.map(n => (n._id as any)?._id || n._id) })
      });

      if (response.ok) {
        toast.success('Nurse removed successfully');
        onWardUpdated();
        setConfirmRemove(null);
      } else {
        toast.error('Failed to remove nurse');
      }
    } catch (error) {
      console.error('Failed to remove nurse:', error);
      toast.error('Failed to remove nurse');
    } finally {
      setLoading(false);
    }
  };

  const getWardTypeColor = (type: string) => {
    switch (type) {
      case 'icu': return 'bg-red-100 text-red-800 dark:bg-red-900/20 dark:text-red-400';
      case 'emergency': return 'bg-orange-100 text-orange-800 dark:bg-orange-900/20 dark:text-orange-400';
      case 'maternity': return 'bg-pink-100 text-pink-800 dark:bg-pink-900/20 dark:text-pink-400';
      case 'pediatric': return 'bg-blue-100 text-blue-800 dark:bg-blue-900/20 dark:text-blue-400';
      case 'surgical': return 'bg-purple-100 text-purple-800 dark:bg-purple-900/20 dark:text-purple-400';
      default: return 'bg-gray-100 text-gray-800 dark:bg-gray-900/20 dark:text-gray-400';
    }
  };

  const getWardTypeLabel = (type: string) => {
    const labels: { [key: string]: string } = {
      icu: 'ICU',
      emergency: 'Emergency',
      maternity: 'Maternity',
      pediatric: 'Pediatric',
      surgical: 'Surgical',
      general: 'General'
    };
    return labels[type] || type;
  };

  return (
    <Dialog open={open} onOpenChange={setOpen}>
      <DialogTrigger asChild>
        {children}
      </DialogTrigger>
      <DialogContent className="max-w-4xl max-h-[90vh] overflow-y-auto">
        <DialogHeader>
          <DialogTitle className="flex items-center gap-2">
            <Bed className="h-5 w-5" />
            {ward.name} - Ward Details
          </DialogTitle>
        </DialogHeader>

        <div className="space-y-6">
          {/* Ward Info */}
          <Card>
            <CardHeader>
              <CardTitle className="text-lg">Ward Information</CardTitle>
            </CardHeader>
            <CardContent className="space-y-3">
              <div className="grid grid-cols-2 gap-4">
                <div>
                  <p className="text-sm font-medium text-muted-foreground">Name</p>
                  <p className="text-sm">{ward.name}</p>
                </div>
                <div>
                  <p className="text-sm font-medium text-muted-foreground">Type</p>
                  <Badge className={getWardTypeColor(ward.wardType)}>
                    {getWardTypeLabel(ward.wardType)}
                  </Badge>
                </div>
                <div>
                  <p className="text-sm font-medium text-muted-foreground">Ward Number</p>
                  <p className="text-sm">{ward.wardNumber}</p>
                </div>
                <div>
                  <p className="text-sm font-medium text-muted-foreground">Department</p>
                  <p className="text-sm">{ward.department.name}</p>
                </div>
                <div>
                  <p className="text-sm font-medium text-muted-foreground">Beds</p>
                  <p className="text-sm">
                    {ward.occupiedBeds}/{ward.totalBeds} ({ward.availableBeds} available)
                  </p>
                </div>
                {ward.chargeNurse && (
                  <div>
                    <p className="text-sm font-medium text-muted-foreground">Charge Nurse</p>
                    <p className="text-sm">{ward.chargeNurse.fullName}</p>
                  </div>
                )}
                {(ward.floor || ward.building) && (
                  <div className="col-span-2">
                    <p className="text-sm font-medium text-muted-foreground flex items-center gap-1">
                      <MapPin className="h-3 w-3" />
                      Location
                    </p>
                    <p className="text-sm">
                      {ward.building && `Building ${ward.building}`}
                      {ward.building && ward.floor && ', '}
                      {ward.floor && `Floor ${ward.floor}`}
                    </p>
                  </div>
                )}
              </div>
            </CardContent>
          </Card>

          {/* Assigned Nurses */}
          <Card>
            <CardHeader>
              <div className="flex items-center justify-between">
                <CardTitle className="text-lg flex items-center gap-2">
                  <Users className="h-5 w-5" />
                  Assigned Nurses ({ward.assignedNurses?.length || 0})
                </CardTitle>
                {isMatronOrAdmin && (
                  <AssignNursesModal ward={ward} onNursesAssigned={onWardUpdated}>
                    <Button size="sm">
                      <UserCheck className="h-4 w-4 mr-2" />
                      Assign Nurses
                    </Button>
                  </AssignNursesModal>
                )}
              </div>
            </CardHeader>
            <CardContent>
              {ward.assignedNurses && ward.assignedNurses.length > 0 ? (
                <div className="grid grid-cols-1 md:grid-cols-2 gap-3">
                  {ward.assignedNurses.map((nurse, index) => (
                    <Card key={`nurse-${nurse._id}-${index}`} className="border">
                      <CardContent className="p-4">
                        <div className="flex items-center justify-between">
                          <div className="flex-1">
                            <p className="font-medium text-sm">{nurse.fullName}</p>
                            <p className="text-xs text-muted-foreground">{nurse.email}</p>
                            <Badge variant="outline" className="text-xs mt-1">
                              {nurse.role}
                            </Badge>
                            {ward.chargeNurse && ((ward.chargeNurse._id as any)?._id || ward.chargeNurse._id) === ((nurse._id as any)?._id || nurse._id) && (
                              <Badge variant="secondary" className="text-xs mt-1 ml-1">
                                Charge Nurse
                              </Badge>
                            )}
                          </div>
                          {isMatronOrAdmin && (
                            <Button
                              variant="outline"
                              size="sm"
                              onClick={() => handleRemoveNurse((nurse._id as any)?._id || nurse._id)}
                              className="text-red-600 hover:text-red-700"
                              disabled={loading}
                            >
                              <UserX className="h-4 w-4" />
                            </Button>
                          )}
                        </div>
                        {confirmRemove === ((nurse._id as any)?._id || nurse._id) && (
                          <div className="mt-3 p-3 bg-red-50 border border-red-200 rounded-md">
                            <p className="text-sm text-red-800 mb-2">
                              Are you sure you want to remove this nurse?
                            </p>
                            <div className="flex gap-2">
                              <Button
                                size="sm"
                                variant="destructive"
                                onClick={confirmRemoveNurse}
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
                <div className="text-center py-8 text-muted-foreground">
                  <Users className="h-12 w-12 mx-auto mb-4 opacity-50" />
                  <p>No nurses assigned to this ward</p>
                  {isMatronOrAdmin && (
                    <AssignNursesModal ward={ward} onNursesAssigned={onWardUpdated}>
                      <Button className="mt-4">
                        <UserCheck className="h-4 w-4 mr-2" />
                        Assign First Nurse
                      </Button>
                    </AssignNursesModal>
                  )}
                </div>
              )}
            </CardContent>
          </Card>

          {/* Action Buttons */}
          <div className="flex justify-end gap-3 pt-4 border-t">
            <Button variant="outline" onClick={() => setOpen(false)}>
              Close
            </Button>
          </div>
        </div>
      </DialogContent>
    </Dialog>
  );
};

export default WardDetailsModal;