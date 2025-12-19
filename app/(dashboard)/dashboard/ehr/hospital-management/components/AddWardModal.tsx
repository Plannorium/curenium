"use client";
import React, { useState, useEffect } from "react";
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
import { Plus, Bed, Loader2 } from "lucide-react";
import { toast } from "sonner";
import { useLanguage } from '@/contexts/LanguageContext';
import { dashboardTranslations } from '@/lib/dashboard-translations';

interface Department {
  _id: string;
  name: string;
}

interface User {
  _id: string;
  fullName: string;
  email: string;
}

interface AddWardModalProps {
  onWardAdded: () => void;
  children: React.ReactNode;
}

const wardTypes = [
  { value: 'general', label: 'General Ward' },
  { value: 'icu', label: 'Intensive Care Unit' },
  { value: 'emergency', label: 'Emergency' },
  { value: 'maternity', label: 'Maternity' },
  { value: 'pediatric', label: 'Pediatric' },
  { value: 'surgical', label: 'Surgical' },
  { value: 'medical', label: 'Medical' },
];

const AddWardModal: React.FC<AddWardModalProps> = React.memo(
  ({ onWardAdded, children }) => {
    const { language } = useLanguage();
    const t = (key: string) => {
      const keys = key.split('.');
      let value: any = dashboardTranslations[language as keyof typeof dashboardTranslations];
      for (const k of keys) {
        value = value?.[k];
      }
      return value || key;
    };

    const [isOpen, setIsOpen] = useState(false);
    const [name, setName] = useState("");
    const [wardNumber, setWardNumber] = useState("");
    const [department, setDepartment] = useState("");
    const [description, setDescription] = useState("");
    const [totalBeds, setTotalBeds] = useState("");
    const [totalRooms, setTotalRooms] = useState("");
    const [wardType, setWardType] = useState<'general' | 'icu' | 'emergency' | 'maternity' | 'pediatric' | 'surgical' | 'medical'>('general');
    const [floor, setFloor] = useState("");
    const [building, setBuilding] = useState("");
    const [phone, setPhone] = useState("");
    const [extension, setExtension] = useState("");
    const [departments, setDepartments] = useState<Department[]>([]);
    const [users, setUsers] = useState<User[]>([]);
    const [isLoading, setIsLoading] = useState(false);
    const [isSubmitting, setIsSubmitting] = useState(false);

    useEffect(() => {
      const fetchData = async () => {
        setIsLoading(true);
        try {
          const [deptRes, userRes] = await Promise.all([
            fetch("/api/departments"),
            fetch("/api/users?role=nurse")
          ]);

          if (deptRes.ok) {
            const deptData: Department[] = await deptRes.json();
            setDepartments(deptData || []);
          }

          if (userRes.ok) {
            const userData: User[] = await userRes.json();
            setUsers(userData || []);
          }
        } catch (error) {
          console.error("Failed to fetch data:", error);
        } finally {
          setIsLoading(false);
        }
      };
      if (isOpen) {
        fetchData();
      }
    }, [isOpen]);

    const handleSubmit = async () => {
      if (!name.trim() || !wardNumber.trim() || !department || !totalBeds || !wardType) return;

      setIsSubmitting(true);
      try {
        const res = await fetch("/api/wards", {
          method: "POST",
          headers: { "Content-Type": "application/json" },
          body: JSON.stringify({
            name: name.trim(),
            wardNumber: wardNumber.trim(),
            department,
            description: description.trim() || undefined,
            totalBeds: parseInt(totalBeds),
            totalRooms: totalRooms ? parseInt(totalRooms) : undefined,
            wardType,
            floor: floor.trim() || undefined,
            building: building.trim() || undefined,
            contactInfo: {
              phone: phone.trim() || undefined,
              extension: extension.trim() || undefined,
            },
          }),
        });

        if (res.ok) {
          onWardAdded();
          setIsOpen(false);
          // Reset form
          setName("");
          setWardNumber("");
          setDepartment("");
          setDescription("");
          setTotalBeds("");
          setTotalRooms("");
          setWardType('general');
          setFloor("");
          setBuilding("");
          setPhone("");
          setExtension("");
          toast.success(t('hospitalManagementPage.modals.addWard.success'));
        } else {
          const error = await res.json() as { message?: string };
          toast.error(error.message || t('hospitalManagementPage.modals.addWard.failed'));
        }
      } catch (error) {
        console.error("Failed to create ward:", error);
        toast.error(t('hospitalManagementPage.modals.addWard.error'));
      } finally {
        setIsSubmitting(false);
      }
    };

    const isFormValid = name.trim() && wardNumber.trim() && department && totalBeds && wardType;

    return (
      <Dialog open={isOpen} onOpenChange={setIsOpen}>
        <DialogTrigger asChild>{children}</DialogTrigger>
        <DialogContent className="bg-white/80 dark:bg-gray-950/80 backdrop-blur-lg max-w-md sm:max-w-lg lg:mx-4 p-0 max-h-[90vh] overflow-y-auto">
          <DialogHeader className="p-4 md:p-6 pb-3 md:pb-4">
            <DialogTitle className="text-lg md:text-xl font-bold text-gray-800 dark:text-gray-100 flex items-center">
              <div className="flex items-center justify-center w-8 h-8 md:w-9 md:h-9 rounded-lg bg-blue-500/10 border border-blue-500/20 mr-2 md:mr-3">
                <Bed className="h-4 w-4 md:h-5 md:w-5 text-blue-500 dark:text-blue-400" />
              </div>
              {t('hospitalManagementPage.modals.addWard.title')}
            </DialogTitle>
          </DialogHeader>

          <div className="px-4 md:px-6 pb-4 md:pb-6 space-y-4 md:space-y-5">
            <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
              <div className="space-y-2">
                <Label
                  htmlFor="name"
                  className="text-sm font-semibold text-gray-700 dark:text-gray-300 flex items-center"
                >
                  <Bed className="h-4 w-4 mr-2 text-gray-500 dark:text-gray-400" />
                  {t('hospitalManagementPage.modals.addWard.wardName')}
                </Label>
                <Input
                  id="name"
                  value={name}
                  onChange={(e) => setName(e.target.value)}
                  placeholder="e.g., Medical Ward A"
                  className="bg-gray-50/80 dark:bg-gray-900/80 border-gray-300/70 dark:border-gray-700/60"
                  required
                />
              </div>

              <div className="space-y-2">
                <Label
                  htmlFor="wardNumber"
                  className="text-sm font-semibold text-gray-700 dark:text-gray-300"
                >
                  {t('hospitalManagementPage.modals.addWard.wardNumber')}
                </Label>
                <Input
                  id="wardNumber"
                  value={wardNumber}
                  onChange={(e) => setWardNumber(e.target.value)}
                  placeholder="e.g., W001"
                  className="bg-gray-50/80 dark:bg-gray-900/80 border-gray-300/70 dark:border-gray-700/60"
                  required
                />
              </div>
            </div>

            <div className="space-y-2">
              <Label
                htmlFor="department"
                className="text-sm font-semibold text-gray-700 dark:text-gray-300"
              >
                {t('hospitalManagementPage.modals.addWard.department')}
              </Label>
              <Select value={department} onValueChange={setDepartment} disabled={isLoading}>
                <SelectTrigger className="w-full bg-gray-50/80 dark:bg-gray-900/80 border-gray-300/70 dark:border-gray-700/60">
                  <SelectValue placeholder={t('hospitalManagementPage.modals.addWard.selectDepartment')} />
                </SelectTrigger>
                <SelectContent className="bg-white dark:bg-gray-950 max-h-60">
                  {departments.map((dept) => (
                    <SelectItem key={dept._id} value={dept._id}>
                      {dept.name}
                    </SelectItem>
                  ))}
                </SelectContent>
              </Select>
            </div>

            <div className="grid grid-cols-1 md:grid-cols-3 gap-4">
               <div className="space-y-2">
                 <Label
                   htmlFor="totalBeds"
                   className="text-sm font-semibold text-gray-700 dark:text-gray-300"
                 >
                   {t('hospitalManagementPage.modals.addWard.totalBeds')}
                 </Label>
                 <Input
                   id="totalBeds"
                   type="number"
                   min="1"
                   max="100"
                   value={totalBeds}
                   onChange={(e) => setTotalBeds(e.target.value)}
                   placeholder="Number of beds"
                   className="bg-gray-50/80 dark:bg-gray-900/80 border-gray-300/70 dark:border-gray-700/60"
                   required
                 />
               </div>

               <div className="space-y-2">
                 <Label
                   htmlFor="totalRooms"
                   className="text-sm font-semibold text-gray-700 dark:text-gray-300"
                 >
                   Total Rooms
                 </Label>
                 <Input
                   id="totalRooms"
                   type="number"
                   min="1"
                   max="50"
                   value={totalRooms}
                   onChange={(e) => setTotalRooms(e.target.value)}
                   placeholder="Number of rooms"
                   className="bg-gray-50/80 dark:bg-gray-900/80 border-gray-300/70 dark:border-gray-700/60"
                 />
               </div>

               <div className="space-y-2">
                 <Label
                   htmlFor="wardType"
                   className="text-sm font-semibold text-gray-700 dark:text-gray-300"
                 >
                   {t('hospitalManagementPage.modals.addWard.wardType')}
                 </Label>
                 <Select value={wardType} onValueChange={(value: any) => setWardType(value)}>
                   <SelectTrigger className="w-full bg-gray-50/80 dark:bg-gray-900/80 border-gray-300/70 dark:border-gray-700/60">
                     <SelectValue placeholder={t('hospitalManagementPage.modals.addWard.selectWardType')} />
                   </SelectTrigger>
                   <SelectContent className="bg-white dark:bg-gray-950">
                     {wardTypes.map((type) => (
                       <SelectItem key={type.value} value={type.value}>
                         {type.label}
                       </SelectItem>
                     ))}
                   </SelectContent>
                 </Select>
               </div>
             </div>

            <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
              <div className="space-y-2">
                <Label
                  htmlFor="floor"
                  className="text-sm font-semibold text-gray-700 dark:text-gray-300"
                >
                  {t('hospitalManagementPage.modals.addWard.floor')}
                </Label>
                <Input
                  id="floor"
                  value={floor}
                  onChange={(e) => setFloor(e.target.value)}
                  placeholder="e.g., 2nd Floor"
                  className="bg-gray-50/80 dark:bg-gray-900/80 border-gray-300/70 dark:border-gray-700/60"
                />
              </div>

              <div className="space-y-2">
                <Label
                  htmlFor="building"
                  className="text-sm font-semibold text-gray-700 dark:text-gray-300"
                >
                  {t('hospitalManagementPage.modals.addWard.building')}
                </Label>
                <Input
                  id="building"
                  value={building}
                  onChange={(e) => setBuilding(e.target.value)}
                  placeholder="e.g., Main Building"
                  className="bg-gray-50/80 dark:bg-gray-900/80 border-gray-300/70 dark:border-gray-700/60"
                />
              </div>
            </div>

            <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
              <div className="space-y-2">
                <Label
                  htmlFor="phone"
                  className="text-sm font-semibold text-gray-700 dark:text-gray-300"
                >
                  {t('hospitalManagementPage.modals.addWard.phone')}
                </Label>
                <Input
                  id="phone"
                  value={phone}
                  onChange={(e) => setPhone(e.target.value)}
                  placeholder="Contact phone"
                  className="bg-gray-50/80 dark:bg-gray-900/80 border-gray-300/70 dark:border-gray-700/60"
                />
              </div>

              <div className="space-y-2">
                <Label
                  htmlFor="extension"
                  className="text-sm font-semibold text-gray-700 dark:text-gray-300"
                >
                  {t('hospitalManagementPage.modals.addWard.extension')}
                </Label>
                <Input
                  id="extension"
                  value={extension}
                  onChange={(e) => setExtension(e.target.value)}
                  placeholder="Phone extension"
                  className="bg-gray-50/80 dark:bg-gray-900/80 border-gray-300/70 dark:border-gray-700/60"
                />
              </div>
            </div>

            <div className="space-y-2">
              <Label
                htmlFor="description"
                className="text-sm font-semibold text-gray-700 dark:text-gray-300"
              >
                {t('hospitalManagementPage.modals.addWard.description')}
              </Label>
              <Textarea
                id="description"
                value={description}
                onChange={(e) => setDescription(e.target.value)}
                placeholder={t('hospitalManagementPage.modals.addWard.descriptionPlaceholder')}
                className="bg-gray-50/80 dark:bg-gray-900/80 border-gray-300/70 dark:border-gray-700/60 min-h-16"
              />
            </div>
          </div>

          <DialogFooter className="px-4 md:px-6 py-3 md:py-4 bg-gray-50 dark:bg-gray-900/70 border-t border-gray-200 dark:border-gray-800/60 flex flex-col sm:flex-row gap-2 sm:gap-0">
            <Button
              variant="ghost"
              onClick={() => setIsOpen(false)}
              disabled={isSubmitting}
              className="w-full sm:w-auto order-2 sm:order-1"
            >
              {t('hospitalManagementPage.modals.addWard.cancel')}
            </Button>
            <Button
              onClick={handleSubmit}
              disabled={!isFormValid || isSubmitting}
              className="bg-blue-500 hover:bg-blue-600 dark:bg-blue-600 dark:hover:bg-blue-700 text-white shadow-lg hover:shadow-xl transition-all duration-300 disabled:opacity-50 w-full sm:w-auto order-1 sm:order-2"
            >
              {isSubmitting ? (
                <>
                  <Loader2 className="h-4 w-4 mr-2 animate-spin" /> {t('hospitalManagementPage.modals.addWard.creating')}
                </>
              ) : (
                <>
                  <Plus className="h-4 w-4 mr-2" />
                  {t('hospitalManagementPage.modals.addWard.createWard')}
                </>
              )}
            </Button>
          </DialogFooter>
        </DialogContent>
      </Dialog>
    );
  }
);

AddWardModal.displayName = "AddWardModal";

export default AddWardModal;