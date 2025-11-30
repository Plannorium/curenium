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
import { Plus, Building, Loader2 } from "lucide-react";
import { toast } from "sonner";
import { useLanguage } from '@/contexts/LanguageContext';
import { dashboardTranslations } from '@/lib/dashboard-translations';

interface User {
  _id: string;
  fullName: string;
  email: string;
}

interface AddDepartmentModalProps {
  onDepartmentAdded: () => void;
  children: React.ReactNode;
}

const AddDepartmentModal: React.FC<AddDepartmentModalProps> = React.memo(
  ({ onDepartmentAdded, children }) => {
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
    const [description, setDescription] = useState("");
    const [headOfDepartment, setHeadOfDepartment] = useState("");
    const [specialties, setSpecialties] = useState<string[]>([]);
    const [phone, setPhone] = useState("");
    const [email, setEmail] = useState("");
    const [newSpecialty, setNewSpecialty] = useState("");
    const [users, setUsers] = useState<User[]>([]);
    const [isLoading, setIsLoading] = useState(false);
    const [isSubmitting, setIsSubmitting] = useState(false);

    useEffect(() => {
      const fetchUsers = async () => {
        setIsLoading(true);
        try {
          const res = await fetch("/api/users?role=doctor");
          const data: User[] = await res.json();
          setUsers(data || []);
        } catch (error) {
          console.error("Failed to fetch users:", error);
        } finally {
          setIsLoading(false);
        }
      };
      if (isOpen) {
        fetchUsers();
      }
    }, [isOpen]);

    const handleSubmit = async () => {
      if (!name.trim()) return;

      setIsSubmitting(true);
      try {
        const res = await fetch("/api/departments", {
          method: "POST",
          headers: { "Content-Type": "application/json" },
          body: JSON.stringify({
            name: name.trim(),
            description: description.trim() || undefined,
            headOfDepartment: headOfDepartment || undefined,
            specialties: specialties.length > 0 ? specialties : undefined,
            contactInfo: {
              phone: phone.trim() || undefined,
              email: email.trim() || undefined,
            },
          }),
        });

        if (res.ok) {
          onDepartmentAdded();
          setIsOpen(false);
          // Reset form
          setName("");
          setDescription("");
          setHeadOfDepartment("");
          setSpecialties([]);
          setNewSpecialty("");
          setPhone("");
          setEmail("");
          toast.success(t('hospitalManagementPage.modals.addDepartment.success'));
        } else {
          const error = await res.json() as { message?: string };
          toast.error(error.message || t('hospitalManagementPage.modals.addDepartment.failed'));
        }
      } catch (error) {
        console.error("Failed to create department:", error);
        toast.error(t('hospitalManagementPage.modals.addDepartment.error'));
      } finally {
        setIsSubmitting(false);
      }
    };

    const handleSpecialtyAdd = () => {
      if (newSpecialty.trim() && !specialties.includes(newSpecialty.trim())) {
        setSpecialties([...specialties, newSpecialty.trim()]);
        setNewSpecialty("");
      }
    };

    const handleSpecialtyKeyPress = (e: React.KeyboardEvent) => {
      if (e.key === 'Enter') {
        e.preventDefault();
        handleSpecialtyAdd();
      }
    };

    const handleSpecialtyRemove = (specialty: string) => {
      setSpecialties(specialties.filter(s => s !== specialty));
    };

    const isFormValid = name.trim();

    return (
      <Dialog open={isOpen} onOpenChange={setIsOpen}>
        <DialogTrigger asChild>{children}</DialogTrigger>
        <DialogContent className="bg-white/80 dark:bg-gray-950/80 backdrop-blur-lg max-w-md sm:max-w-lg lg:mx-4 p-0 max-h-[90vh] overflow-y-auto">
          <DialogHeader className="p-4 md:p-6 pb-3 md:pb-4">
            <DialogTitle className="text-lg md:text-xl font-bold text-gray-800 dark:text-gray-100 flex items-center">
              <div className="flex items-center justify-center w-8 h-8 md:w-9 md:h-9 rounded-lg bg-blue-500/10 border border-blue-500/20 mr-2 md:mr-3">
                <Building className="h-4 w-4 md:h-5 md:w-5 text-blue-500 dark:text-blue-400" />
              </div>
              {t('hospitalManagementPage.modals.addDepartment.title')}
            </DialogTitle>
          </DialogHeader>

          <div className="px-4 md:px-6 pb-4 md:pb-6 space-y-4 md:space-y-5">
            <div className="space-y-2">
              <Label
                htmlFor="name"
                className="text-sm font-semibold text-gray-700 dark:text-gray-300 flex items-center"
              >
                <Building className="h-4 w-4 mr-2 text-gray-500 dark:text-gray-400" />
                {t('hospitalManagementPage.modals.addDepartment.departmentName')}
              </Label>
              <Input
                id="name"
                value={name}
                onChange={(e) => setName(e.target.value)}
                placeholder="e.g., Cardiology"
                className="bg-gray-50/80 dark:bg-gray-900/80 border-gray-300/70 dark:border-gray-700/60"
                required
              />
            </div>

            <div className="space-y-2">
              <Label
                htmlFor="description"
                className="text-sm font-semibold text-gray-700 dark:text-gray-300"
              >
                {t('hospitalManagementPage.modals.addDepartment.description')}
              </Label>
              <Textarea
                id="description"
                value={description}
                onChange={(e) => setDescription(e.target.value)}
                placeholder="Department description..."
                className="bg-gray-50/80 dark:bg-gray-900/80 border-gray-300/70 dark:border-gray-700/60 min-h-16"
              />
            </div>

            <div className="space-y-2">
              <Label
                htmlFor="head"
                className="text-sm font-semibold text-gray-700 dark:text-gray-300"
              >
                {t('hospitalManagementPage.modals.addDepartment.headOfDepartment')}
              </Label>
              <Select value={headOfDepartment} onValueChange={setHeadOfDepartment} disabled={isLoading}>
                <SelectTrigger className="w-full bg-gray-50/80 dark:bg-gray-900/80 border-gray-300/70 dark:border-gray-700/60">
                  <SelectValue placeholder={t('hospitalManagementPage.modals.addDepartment.selectHead')} />
                </SelectTrigger>
                <SelectContent className="bg-white dark:bg-gray-950 max-h-60">
                  {users.map((user) => (
                    <SelectItem key={user._id} value={user._id}>
                      {user.fullName} ({user.email})
                    </SelectItem>
                  ))}
                </SelectContent>
              </Select>
            </div>

            <div className="space-y-2">
              <Label className="text-sm font-semibold text-gray-700 dark:text-gray-300">
                {t('hospitalManagementPage.modals.addDepartment.specialties')}
              </Label>
              <div className="flex flex-wrap gap-2 mb-2">
                {specialties.map((specialty, index) => (
                  <div key={index} className="flex items-center gap-1 bg-blue-100 dark:bg-blue-900/30 text-blue-800 dark:text-blue-300 px-2 py-1 rounded-md text-xs">
                    {specialty}
                    <button
                      onClick={() => handleSpecialtyRemove(specialty)}
                      className="ml-1 text-blue-600 hover:text-blue-800 dark:text-blue-400 dark:hover:text-blue-200"
                    >
                      ×
                    </button>
                  </div>
                ))}
              </div>
              <div className="flex gap-2">
                <Input
                  value={newSpecialty}
                  onChange={(e) => setNewSpecialty(e.target.value)}
                  onKeyPress={handleSpecialtyKeyPress}
                  placeholder={t('hospitalManagementPage.modals.addDepartment.enterSpecialty')}
                  className="flex-1 bg-gray-50/80 dark:bg-gray-900/80 border-gray-300/70 dark:border-gray-700/60"
                />
                <Button
                  type="button"
                  variant="outline"
                  size="sm"
                  onClick={handleSpecialtyAdd}
                  disabled={!newSpecialty.trim()}
                  className="px-3"
                >
                  <Plus className="h-4 w-4" />
                </Button>
              </div>
            </div>

            <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
              <div className="space-y-2">
                <Label
                  htmlFor="phone"
                  className="text-sm font-semibold text-gray-700 dark:text-gray-300"
                >
                  {t('hospitalManagementPage.modals.addDepartment.phone')}
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
                  htmlFor="email"
                  className="text-sm font-semibold text-gray-700 dark:text-gray-300"
                >
                  {t('hospitalManagementPage.modals.addDepartment.email')}
                </Label>
                <Input
                  id="email"
                  type="email"
                  value={email}
                  onChange={(e) => setEmail(e.target.value)}
                  placeholder="Contact email"
                  className="bg-gray-50/80 dark:bg-gray-900/80 border-gray-300/70 dark:border-gray-700/60"
                />
              </div>
            </div>
          </div>

          <DialogFooter className="px-4 md:px-6 py-3 md:py-4 bg-gray-50 dark:bg-gray-900/70 border-t border-gray-200 dark:border-gray-800/60 flex flex-col sm:flex-row gap-2 sm:gap-0">
            <Button
              variant="ghost"
              onClick={() => setIsOpen(false)}
              disabled={isSubmitting}
              className="w-full sm:w-auto order-2 sm:order-1"
            >
              {t('hospitalManagementPage.modals.addDepartment.cancel')}
            </Button>
            <Button
              onClick={handleSubmit}
              disabled={!isFormValid || isSubmitting}
              className="bg-blue-500 hover:bg-blue-600 dark:bg-blue-600 dark:hover:bg-blue-700 text-white shadow-lg hover:shadow-xl transition-all duration-300 disabled:opacity-50 w-full sm:w-auto order-1 sm:order-2"
            >
              {isSubmitting ? (
                <>
                  <Loader2 className="h-4 w-4 mr-2 animate-spin" /> {t('hospitalManagementPage.modals.addDepartment.creating')}
                </>
              ) : (
                <>
                  <Plus className="h-4 w-4 mr-2" />
                  {t('hospitalManagementPage.modals.addDepartment.createDepartment')}
                </>
              )}
            </Button>
          </DialogFooter>
        </DialogContent>
      </Dialog>
    );
  }
);

AddDepartmentModal.displayName = "AddDepartmentModal";

export default AddDepartmentModal;