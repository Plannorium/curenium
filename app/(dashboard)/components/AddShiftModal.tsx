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
import {
  Select,
  SelectContent,
  SelectItem,
  SelectTrigger,
  SelectValue,
} from "@/components/ui/select";
import { Plus, Calendar, Clock, User, Briefcase, Loader2, FileText } from "lucide-react";
import HijriCalendar from "@/components/ui/hijri-calendar";
import { useCalendar } from "@/components/ui/calendar-context";
import { useLanguage } from '@/contexts/LanguageContext';
import { dashboardTranslations } from '@/lib/dashboard-translations';

// ... (interfaces and roles remain the same)
interface User {
  _id: string;
  fullName: string;
  image?: string;
  role?: string;
}

interface Department {
  _id: string;
  name: string;
}

interface Ward {
  _id: string;
  name: string;
  wardNumber: string;
}


interface AddShiftModalProps {
  onShiftAdded: () => void;
  children: React.ReactNode;
}

const roles = {
  doctor: "Doctor",
  nurse: "Nurse",
  manager: "Manager",
  staff: "Staff",
  labtech: "Lab Tech",
  reception: "Reception",
};

const AddShiftModal: React.FC<AddShiftModalProps> = React.memo(
  ({ onShiftAdded, children }) => {
    const { language } = useLanguage();
    const [isOpen, setIsOpen] = useState(false);
    const [users, setUsers] = useState<User[]>([]);
    const [departments, setDepartments] = useState<Department[]>([]);
    const [wards, setWards] = useState<Ward[]>([]);
    const [selectedUser, setSelectedUser] = useState("");
    const [selectedUserImage, setSelectedUserImage] = useState("");
    const [selectedDepartment, setSelectedDepartment] = useState("");
    const [selectedWard, setSelectedWard] = useState("");
    const [role, setRole] = useState("");
    const [startDate, setStartDate] = useState("");
    const [endDate, setEndDate] = useState("");
    const [startTime, setStartTime] = useState("");
    const [endTime, setEndTime] = useState("");
    const [shiftNotes, setShiftNotes] = useState("");
    const [isLoading, setIsLoading] = useState(false);
    const [isSubmitting, setIsSubmitting] = useState(false);
    const { calendarType, setCalendarType } = useCalendar();

    const t = (key: string) => {
      const keys = key.split('.');
      let value: any = dashboardTranslations[language as keyof typeof dashboardTranslations];
      for (const k of keys) {
        value = value?.[k];
      }
      return value || key;
    };

    useEffect(() => {
      const fetchData = async () => {
        setIsLoading(true);
        try {
          // Fetch users
          const usersRes = await fetch("/api/users");
          if (usersRes.ok) {
            const usersData: User[] = await usersRes.json();
            setUsers(usersData || []);
          } else {
            console.error("Failed to fetch users:", usersRes.status, usersRes.statusText);
            setUsers([]);
          }

          // Fetch departments
          const deptsRes = await fetch("/api/departments");
          if (deptsRes.ok) {
            const deptsData: Department[] = await deptsRes.json();
            setDepartments(deptsData || []);
          } else {
            console.error("Failed to fetch departments:", deptsRes.status, deptsRes.statusText);
            setDepartments([]);
          }
        } catch (error) {
          console.error("Failed to fetch data:", error);
          setUsers([]);
          setDepartments([]);
        } finally {
          setIsLoading(false);
        }
      };
      if (isOpen) {
        fetchData();
      }
    }, [isOpen]);

    // Fetch wards when department changes
    useEffect(() => {
      const fetchWards = async () => {
        if (selectedDepartment) {
          try {
            const res = await fetch(`/api/wards?department=${selectedDepartment}`);
            if (res.ok) {
              const data: Ward[] = await res.json();
              setWards(data || []);
            } else {
              console.error("Failed to fetch wards:", res.status, res.statusText);
              setWards([]);
            }
          } catch (error) {
            console.error("Failed to fetch wards:", error);
            setWards([]);
          }
        } else {
          setWards([]);
        }
      };
      fetchWards();
    }, [selectedDepartment]);

    // Auto-populate role and image when user is selected
    useEffect(() => {
      if (selectedUser) {
        const user = users.find(u => u._id === selectedUser);
        if (user) {
          setRole(user.role || '');
          setSelectedUserImage(user.image || '');
        }
      } else {
        setRole('');
        setSelectedUserImage('');
      }
    }, [selectedUser, users]);

    const handleSubmit = async () => {
      if (!selectedUser || !role || !startDate || !endDate || !startTime || !endTime) return;

      setIsSubmitting(true);
      try {
        const res = await fetch("/api/shift-tracking", {
          method: "POST",
          headers: { "Content-Type": "application/json" },
          body: JSON.stringify({
            userId: selectedUser,
            userImage: selectedUserImage || undefined,
            shiftDate: startDate,
            startTime: startTime,
            endDate: endDate,
            endTime: endTime,
            department: selectedDepartment || undefined,
            ward: selectedWard || undefined,
            role,
            shiftNotes: shiftNotes.trim() || undefined,
          }),
        });

        if (res.ok) {
          onShiftAdded();
          setIsOpen(false);
          // Reset form
          setSelectedUser("");
          setSelectedUserImage("");
          setSelectedDepartment("");
          setSelectedWard("");
          setRole("");
          setStartDate("");
          setEndDate("");
          setStartTime("");
          setEndTime("");
          setShiftNotes("");
        }
      } catch (error) {
        console.error("Failed to add shift:", error);
      } finally {
        setIsSubmitting(false);
      }
    };

    const isFormValid = selectedUser && role && startDate && endDate && startTime && endTime && new Date(startDate) <= new Date(endDate);

    return (
      <Dialog open={isOpen} onOpenChange={setIsOpen}>
        <DialogTrigger asChild>{children}</DialogTrigger>
        <DialogContent className="bg-white/80 dark:bg-gray-950/80 backdrop-blur-lg max-w-md sm:max-w-lg lg:mx-4 p-0 max-h-[90vh] overflow-y-auto">
          <DialogHeader className="p-4 md:p-6 pb-3 md:pb-4">
            <DialogTitle className="text-lg md:text-xl font-bold text-gray-800 dark:text-gray-100 flex items-center">
              <div className="flex items-center justify-center w-8 h-8 md:w-9 md:h-9 rounded-lg bg-blue-500/10 border border-blue-500/20 mr-2 md:mr-3">
                <Calendar className="h-4 w-4 md:h-5 md:w-5 text-blue-500 dark:text-blue-400" />
              </div>
              <span className="text-sm md:text-base">{t('addShiftModal.title')}</span>
            </DialogTitle>
          </DialogHeader>

          <div className="px-4 md:px-6 pb-4 md:pb-6 space-y-4 md:space-y-5">
            <div className="space-y-2">
              <Label
                htmlFor="user"
                className="text-sm font-semibold text-gray-700 dark:text-gray-300 flex items-center"
              >
                <User className="h-4 w-4 mr-2 text-gray-500 dark:text-gray-400" />
                {t('addShiftModal.assignToUser')}
              </Label>
              <Select value={selectedUser} onValueChange={setSelectedUser} disabled={isLoading}>
                <SelectTrigger className="w-full bg-gray-50/80 dark:bg-gray-900/80 border-gray-300/70 dark:border-gray-700/60">
                  <SelectValue
                    placeholder={
                      isLoading ? t('addShiftModal.loadingUsers') : t('addShiftModal.selectUser')
                    }
                  />
                </SelectTrigger>
                <SelectContent className="bg-white dark:bg-gray-950">
                  {users.map((user) => (
                    <SelectItem key={user._id} value={user._id}>
                      <div className="flex items-center gap-3">
                        <Avatar className="h-6 w-6">
                          <AvatarImage src={user.image} />
                          <AvatarFallback className="text-xs">
                            {user.fullName
                              .split(" ")
                              .map((n) => n[0])
                              .join("")}
                          </AvatarFallback>
                        </Avatar>
                        {user.fullName}
                      </div>
                    </SelectItem>
                  ))}
                </SelectContent>
              </Select>
            </div>

            <div className="space-y-2">
              <Label
                htmlFor="role"
                className="text-sm font-semibold text-gray-700 dark:text-gray-300 flex items-center"
              >
                <Briefcase className="h-4 w-4 mr-2 text-gray-500 dark:text-gray-400" />
                {t('addShiftModal.role')}
              </Label>
              <Input
                id="role"
                type="text"
                value={role}
                onChange={(e) => setRole(e.target.value)}
                placeholder={t('addShiftModal.rolePlaceholder')}
                className="bg-gray-50/80 dark:bg-gray-900/80 border-gray-300/70 dark:border-gray-700/60"
                readOnly
              />
            </div>

            <div className="space-y-2">
              <Label
                htmlFor="department"
                className="text-sm font-semibold text-gray-700 dark:text-gray-300 flex items-center"
              >
                <User className="h-4 w-4 mr-2 text-gray-500 dark:text-gray-400" />
                {t('addShiftModal.department')}
              </Label>
              <Select value={selectedDepartment} onValueChange={setSelectedDepartment}>
                <SelectTrigger className="w-full bg-gray-50/80 dark:bg-gray-900/80 border-gray-300/70 dark:border-gray-700/60">
                  <SelectValue placeholder={t('addShiftModal.selectDepartment')} />
                </SelectTrigger>
                <SelectContent className="bg-white dark:bg-gray-950">
                  {departments.map((dept) => (
                    <SelectItem key={dept._id} value={dept._id}>
                      {dept.name}
                    </SelectItem>
                  ))}
                </SelectContent>
              </Select>
            </div>

            <div className="space-y-2">
              <Label
                htmlFor="ward"
                className="text-sm font-semibold text-gray-700 dark:text-gray-300 flex items-center"
              >
                <User className="h-4 w-4 mr-2 text-gray-500 dark:text-gray-400" />
                {t('addShiftModal.ward')}
              </Label>
              <Select value={selectedWard} onValueChange={setSelectedWard} disabled={!selectedDepartment}>
                <SelectTrigger className="w-full bg-gray-50/80 dark:bg-gray-900/80 border-gray-300/70 dark:border-gray-700/60">
                  <SelectValue placeholder={selectedDepartment ? t('addShiftModal.selectWard') : t('addShiftModal.selectDepartmentFirst')} />
                </SelectTrigger>
                <SelectContent className="bg-white dark:bg-gray-950">
                  {wards.map((ward) => (
                    <SelectItem key={ward._id} value={ward._id}>
                      {ward.name} ({ward.wardNumber})
                    </SelectItem>
                  ))}
                </SelectContent>
              </Select>
            </div>

            <div className="space-y-4">

              <div className="grid grid-cols-1 md:grid-cols-2 gap-6 md:gap-3">
                <div className="space-y-2">
                  <Label className="text-sm font-semibold text-gray-700 dark:text-gray-300 flex items-center">
                    <Calendar className="h-4 w-4 mr-2 text-gray-500 dark:text-gray-400" />
                    {t('addShiftModal.startDate')}
                  </Label>
                  <HijriCalendar
                    selectedDate={startDate ? new Date(startDate) : undefined}
                    onDateSelect={(date) => setStartDate(date.toISOString().split('T')[0])}
                    calendarType={calendarType}
                    onCalendarTypeChange={setCalendarType}
                    highlightedDays={[]}
                  />
                </div>

                <div className="space-y-2">
                  <Label className="text-sm font-semibold text-gray-700 dark:text-gray-300 flex items-center">
                    <Calendar className="h-4 w-4 mr-2 text-gray-500 dark:text-gray-400" />
                    {t('addShiftModal.endDate')}
                  </Label>
                  <HijriCalendar
                    selectedDate={endDate ? new Date(endDate) : undefined}
                    onDateSelect={(date) => setEndDate(date.toISOString().split('T')[0])}
                    calendarType={calendarType}
                    onCalendarTypeChange={setCalendarType}
                    highlightedDays={[]}
                  />
                </div>
              </div>

              {startDate && endDate && new Date(startDate).getTime() !== new Date(endDate).getTime() && (
                <div className="bg-blue-50 dark:bg-blue-900/20 border border-blue-200 dark:border-blue-800 rounded-lg p-3">
                  <p className="text-sm text-blue-700 dark:text-blue-300">
                    📅 {t('addShiftModal.multiDayShift').replace('{days}', Math.ceil((new Date(endDate).getTime() - new Date(startDate).getTime()) / (1000 * 60 * 60 * 24)).toString())}
                  </p>
                </div>
              )}

              <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                <div className="space-y-2">
                  <Label className="text-sm font-semibold text-gray-700 dark:text-gray-300 flex items-center">
                    <Clock className="h-4 w-4 mr-2 text-gray-500 dark:text-gray-400" />
                    {t('addShiftModal.startTime')}
                  </Label>
                  <Input
                    type="time"
                    value={startTime}
                    onChange={(e) => setStartTime(e.target.value)}
                    className="bg-gray-50/80 dark:bg-gray-900/80 border-gray-300/70 dark:border-gray-700/60"
                  />
                </div>

                <div className="space-y-2">
                  <Label className="text-sm font-semibold text-gray-700 dark:text-gray-300 flex items-center">
                    <Clock className="h-4 w-4 mr-2 text-gray-500 dark:text-gray-400" />
                    {t('addShiftModal.endTime')}
                  </Label>
                  <Input
                    type="time"
                    value={endTime}
                    onChange={(e) => setEndTime(e.target.value)}
                    className="bg-gray-50/80 dark:bg-gray-900/80 border-gray-300/70 dark:border-gray-700/60"
                  />
                </div>
              </div>

              <div className="space-y-2">
                <Label
                  htmlFor="shiftNotes"
                  className="text-sm font-semibold text-gray-700 dark:text-gray-300 flex items-center"
                >
                  <FileText className="h-4 w-4 mr-2 text-gray-500 dark:text-gray-400" />
                  {t('addShiftModal.shiftNotes')}
                </Label>
                <Input
                  id="shiftNotes"
                  type="text"
                  value={shiftNotes}
                  onChange={(e) => setShiftNotes(e.target.value)}
                  placeholder={t('addShiftModal.shiftNotesPlaceholder')}
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
              {t('addShiftModal.cancel')}
            </Button>
            <Button
              onClick={handleSubmit}
              disabled={!isFormValid || isSubmitting}
              className="bg-blue-500 hover:bg-blue-600 dark:bg-blue-600 dark:hover:bg-blue-700 text-white shadow-lg hover:shadow-xl transition-all duration-300 disabled:opacity-50 w-full sm:w-auto order-1 sm:order-2"
            >
              {isSubmitting ? (
                <>
                  <Loader2 className="h-4 w-4 mr-2 animate-spin" /> {t('addShiftModal.adding')}
                </>
              ) : (
                <>
                  <Plus className="h-4 w-4 mr-2" />
                  <span>{t('addShiftModal.addShift')}</span>
                </>
              )}
            </Button>
          </DialogFooter>
        </DialogContent>
      </Dialog>
    );
  }
);

AddShiftModal.displayName = "AddShiftModal";

export default AddShiftModal;
