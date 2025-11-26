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
import { Building, User, Phone, Mail, Calendar } from "lucide-react";

interface Department {
  _id: string;
  name: string;
  description?: string;
  headOfDepartment?: {
    _id: string;
    fullName: string;
    email: string;
  };
  specialties?: string[];
  contactInfo?: {
    phone?: string;
    email?: string;
  };
  isActive: boolean;
  createdAt: string;
}

interface ViewDepartmentModalProps {
  department: Department | null;
  children: React.ReactNode;
}

const ViewDepartmentModal: React.FC<ViewDepartmentModalProps> = React.memo(
  ({ department, children }) => {
    const [isOpen, setIsOpen] = useState(false);

    if (!department) return null;

    return (
      <Dialog open={isOpen} onOpenChange={setIsOpen}>
        <DialogTrigger asChild>{children}</DialogTrigger>
        <DialogContent className="bg-white/80 dark:bg-gray-950/80 backdrop-blur-lg max-w-md sm:max-w-lg lg:mx-4 p-0 max-h-[90vh] overflow-y-auto">
          <DialogHeader className="p-4 md:p-6 pb-3 md:pb-4">
            <DialogTitle className="text-lg md:text-xl font-bold text-gray-800 dark:text-gray-100 flex items-center">
              <div className="flex items-center justify-center w-8 h-8 md:w-9 md:h-9 rounded-lg bg-blue-500/10 border border-blue-500/20 mr-2 md:mr-3">
                <Building className="h-4 w-4 md:h-5 md:w-5 text-blue-500 dark:text-blue-400" />
              </div>
              Department Details
            </DialogTitle>
          </DialogHeader>

          <div className="px-4 md:px-6 pb-4 md:pb-6 space-y-4 md:space-y-5">
            <div className="flex items-center justify-between">
              <h3 className="text-xl font-semibold text-gray-900 dark:text-white">
                {department.name}
              </h3>
              <Badge variant={department.isActive ? "default" : "secondary"}>
                {department.isActive ? "Active" : "Inactive"}
              </Badge>
            </div>

            {department.description && (
              <div className="space-y-2">
                <Label className="text-sm font-semibold text-gray-700 dark:text-gray-300">
                  Description
                </Label>
                <p className="text-sm text-gray-600 dark:text-gray-400 bg-gray-50/80 dark:bg-gray-900/80 p-3 rounded-lg">
                  {department.description}
                </p>
              </div>
            )}

            {department.headOfDepartment && (
              <div className="space-y-2">
                <Label className="text-sm font-semibold text-gray-700 dark:text-gray-300 flex items-center">
                  <User className="h-4 w-4 mr-2" />
                  Head of Department
                </Label>
                <div className="bg-gray-50/80 dark:bg-gray-900/80 p-3 rounded-lg">
                  <p className="text-sm font-medium text-gray-900 dark:text-white">
                    {department.headOfDepartment.fullName}
                  </p>
                  <p className="text-sm text-gray-600 dark:text-gray-400">
                    {department.headOfDepartment.email}
                  </p>
                </div>
              </div>
            )}

            {department.specialties && department.specialties.length > 0 && (
              <div className="space-y-2">
                <Label className="text-sm font-semibold text-gray-700 dark:text-gray-300">
                  Specialties
                </Label>
                <div className="flex flex-wrap gap-2">
                  {department.specialties.map((specialty, index) => (
                    <Badge key={index} variant="outline" className="text-xs">
                      {specialty}
                    </Badge>
                  ))}
                </div>
              </div>
            )}

            {(department.contactInfo?.phone || department.contactInfo?.email) && (
              <div className="space-y-2">
                <Label className="text-sm font-semibold text-gray-700 dark:text-gray-300">
                  Contact Information
                </Label>
                <div className="space-y-2">
                  {department.contactInfo.phone && (
                    <div className="flex items-center gap-2 text-sm text-gray-600 dark:text-gray-400">
                      <Phone className="h-4 w-4" />
                      <span>{department.contactInfo.phone}</span>
                    </div>
                  )}
                  {department.contactInfo.email && (
                    <div className="flex items-center gap-2 text-sm text-gray-600 dark:text-gray-400">
                      <Mail className="h-4 w-4" />
                      <span>{department.contactInfo.email}</span>
                    </div>
                  )}
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
                {new Date(department.createdAt).toLocaleDateString('en-US', {
                  year: 'numeric',
                  month: 'long',
                  day: 'numeric',
                  hour: '2-digit',
                  minute: '2-digit'
                })}
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

ViewDepartmentModal.displayName = "ViewDepartmentModal";

export default ViewDepartmentModal;