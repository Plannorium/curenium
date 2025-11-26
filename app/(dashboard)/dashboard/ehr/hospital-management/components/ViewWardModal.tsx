"use client";
import React, { useState } from "react";
import { Button } from "@/components/ui/button";
import {
  Dialog,
  DialogContent,
  DialogHeader,
  DialogTitle,
  DialogTrigger,
  DialogFooter,
} from "@/components/ui/dialog";
import { Badge } from "@/components/ui/badge";
import { Label } from "@/components/ui/label";
import { Separator } from "@/components/ui/separator";
import { Bed, Building2, MapPin, Phone, Users, Calendar } from "lucide-react";

interface Ward {
  _id: string;
  name: string;
  wardNumber: string;
  department: {
    _id: string;
    name: string;
  };
  totalBeds: number;
  occupiedBeds: number;
  availableBeds: number;
  wardType: string;
  floor?: string;
  building?: string;
  isActive: boolean;
  chargeNurse?: {
    _id: string;
    fullName: string;
  };
  assignedNurses: Array<{
    _id: string;
    fullName: string;
  }>;
  contactInfo?: {
    phone?: string;
    extension?: string;
  };
  facilities?: string[];
  createdAt?: string;
}

interface ViewWardModalProps {
  ward: Ward | null;
  children: React.ReactNode;
}

const ViewWardModal: React.FC<ViewWardModalProps> = React.memo(
  ({ ward, children }) => {
    const [isOpen, setIsOpen] = useState(false);

    if (!ward) return null;

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

    return (
      <Dialog open={isOpen} onOpenChange={setIsOpen}>
        <DialogTrigger asChild>{children}</DialogTrigger>
        <DialogContent className="bg-white/80 dark:bg-gray-950/80 backdrop-blur-lg max-w-md sm:max-w-lg lg:mx-4 p-0 max-h-[90vh] overflow-y-auto">
          <DialogHeader className="p-4 md:p-6 pb-3 md:pb-4">
            <DialogTitle className="text-lg md:text-xl font-bold text-gray-800 dark:text-gray-100 flex items-center">
              <div className="flex items-center justify-center w-8 h-8 md:w-9 md:h-9 rounded-lg bg-blue-500/10 border border-blue-500/20 mr-2 md:mr-3">
                <Bed className="h-4 w-4 md:h-5 md:w-5 text-blue-500 dark:text-blue-400" />
              </div>
              Ward Details
            </DialogTitle>
          </DialogHeader>

          <div className="px-4 md:px-6 pb-4 md:pb-6 space-y-4 md:space-y-5">
            <div className="flex items-center justify-between">
              <div>
                <h3 className="text-xl font-semibold text-gray-900 dark:text-white">
                  {ward.name}
                </h3>
                <p className="text-sm text-gray-600 dark:text-gray-400">
                  Ward #{ward.wardNumber}
                </p>
              </div>
              <div className="flex items-center gap-2">
                <Badge className={getWardTypeColor(ward.wardType)}>
                  {ward.wardType.toUpperCase()}
                </Badge>
                <Badge variant={ward.isActive ? "default" : "secondary"}>
                  {ward.isActive ? "Active" : "Inactive"}
                </Badge>
              </div>
            </div>

            <div className="grid grid-cols-2 gap-4">
              <div className="bg-gray-50/80 dark:bg-gray-900/80 p-3 rounded-lg">
                <div className="flex items-center gap-2 mb-1">
                  <Bed className="h-4 w-4 text-blue-600" />
                  <span className="text-sm font-medium text-gray-700 dark:text-gray-300">Total Beds</span>
                </div>
                <p className="text-lg font-bold text-gray-900 dark:text-white">{ward.totalBeds}</p>
              </div>

              <div className="bg-gray-50/80 dark:bg-gray-900/80 p-3 rounded-lg">
                <div className="flex items-center gap-2 mb-1">
                  <Users className="h-4 w-4 text-green-600" />
                  <span className="text-sm font-medium text-gray-700 dark:text-gray-300">Available</span>
                </div>
                <p className="text-lg font-bold text-green-600 dark:text-green-400">{ward.availableBeds}</p>
              </div>
            </div>

            <div className="space-y-2">
              <Label className="text-sm font-semibold text-gray-700 dark:text-gray-300 flex items-center">
                <Building2 className="h-4 w-4 mr-2" />
                Department
              </Label>
              <p className="text-sm text-gray-600 dark:text-gray-400 bg-gray-50/80 dark:bg-gray-900/80 p-3 rounded-lg">
                {ward.department.name}
              </p>
            </div>

            {(ward.building || ward.floor) && (
              <div className="space-y-2">
                <Label className="text-sm font-semibold text-gray-700 dark:text-gray-300 flex items-center">
                  <MapPin className="h-4 w-4 mr-2" />
                  Location
                </Label>
                <p className="text-sm text-gray-600 dark:text-gray-400 bg-gray-50/80 dark:bg-gray-900/80 p-3 rounded-lg">
                  {ward.building && `Building ${ward.building}`}
                  {ward.building && ward.floor && ', '}
                  {ward.floor && `Floor ${ward.floor}`}
                </p>
              </div>
            )}

            {ward.chargeNurse && (
              <div className="space-y-2">
                <Label className="text-sm font-semibold text-gray-700 dark:text-gray-300 flex items-center">
                  <Users className="h-4 w-4 mr-2" />
                  Charge Nurse
                </Label>
                <p className="text-sm text-gray-600 dark:text-gray-400 bg-gray-50/80 dark:bg-gray-900/80 p-3 rounded-lg">
                  {ward.chargeNurse.fullName}
                </p>
              </div>
            )}

            {ward.assignedNurses && ward.assignedNurses.length > 0 && (
              <div className="space-y-2">
                <Label className="text-sm font-semibold text-gray-700 dark:text-gray-300 flex items-center">
                  <Users className="h-4 w-4 mr-2" />
                  Assigned Nurses ({ward.assignedNurses.length})
                </Label>
                <div className="bg-gray-50/80 dark:bg-gray-900/80 p-3 rounded-lg">
                  <div className="flex flex-wrap gap-2">
                    {ward.assignedNurses.map((nurse, index) => (
                      <Badge key={index} variant="outline" className="text-xs">
                        {nurse.fullName}
                      </Badge>
                    ))}
                  </div>
                </div>
              </div>
            )}

            {(ward.contactInfo?.phone || ward.contactInfo?.extension) && (
              <div className="space-y-2">
                <Label className="text-sm font-semibold text-gray-700 dark:text-gray-300 flex items-center">
                  <Phone className="h-4 w-4 mr-2" />
                  Contact Information
                </Label>
                <div className="space-y-1">
                  {ward.contactInfo.phone && (
                    <p className="text-sm text-gray-600 dark:text-gray-400">
                      Phone: {ward.contactInfo.phone}
                    </p>
                  )}
                  {ward.contactInfo.extension && (
                    <p className="text-sm text-gray-600 dark:text-gray-400">
                      Extension: {ward.contactInfo.extension}
                    </p>
                  )}
                </div>
              </div>
            )}

            {ward.facilities && ward.facilities.length > 0 && (
              <div className="space-y-2">
                <Label className="text-sm font-semibold text-gray-700 dark:text-gray-300">
                  Facilities
                </Label>
                <div className="flex flex-wrap gap-2">
                  {ward.facilities.map((facility, index) => (
                    <Badge key={index} variant="outline" className="text-xs">
                      {facility}
                    </Badge>
                  ))}
                </div>
              </div>
            )}

            <Separator />

            <div className="space-y-2">
              <Label className="text-sm font-semibold text-gray-700 dark:text-gray-300 flex items-center">
                <Calendar className="h-4 w-4 mr-2" />
                Created
              </Label>
              <p className="text-sm text-gray-600 dark:text-gray-400">
                {ward.createdAt ? new Date(ward.createdAt).toLocaleDateString('en-US', {
                  year: 'numeric',
                  month: 'long',
                  day: 'numeric',
                  hour: '2-digit',
                  minute: '2-digit'
                }) : 'Not available'}
              </p>
            </div>
          </div>

          <DialogFooter className="px-4 md:px-6 py-3 md:py-4 bg-gray-50 dark:bg-gray-900/70 border-t border-gray-200 dark:border-gray-800/60">
            <Button variant="ghost" onClick={() => setIsOpen(false)}>
              Close
            </Button>
          </DialogFooter>
        </DialogContent>
      </Dialog>
    );
  }
);

ViewWardModal.displayName = "ViewWardModal";

export default ViewWardModal;