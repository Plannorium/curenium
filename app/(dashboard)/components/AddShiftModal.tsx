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
import { Plus, Calendar, Clock, User, Briefcase, Loader2 } from "lucide-react";
import HijriCalendar from "@/components/ui/hijri-calendar";
import { useCalendar } from "@/components/ui/calendar-context";

// ... (interfaces and roles remain the same)
interface User {
  _id: string;
  fullName: string;
  image?: string;
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
    const [isOpen, setIsOpen] = useState(false);
    const [users, setUsers] = useState<User[]>([]);
    const [selectedUser, setSelectedUser] = useState("");
    const [role, setRole] = useState("");
    const [startTime, setStartTime] = useState("");
    const [endTime, setEndTime] = useState("");
    const [status, setStatus] = useState("on-shift");
    const [isLoading, setIsLoading] = useState(false);
    const [isSubmitting, setIsSubmitting] = useState(false);
    const { calendarType, setCalendarType } = useCalendar();

    useEffect(() => {
      const fetchUsers = async () => {
        setIsLoading(true);
        try {
          const res = await fetch("/api/users");
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
      if (!selectedUser || !role || !startTime || !endTime) return;

      setIsSubmitting(true);
      try {
        const res = await fetch("/api/shifts", {
          method: "POST",
          headers: { "Content-Type": "application/json" },
          body: JSON.stringify({
            user: selectedUser,
            role,
            startTime: new Date(startTime).toISOString(),
            endTime: new Date(endTime).toISOString(),
            status,
          }),
        });

        if (res.ok) {
          onShiftAdded();
          setIsOpen(false);
          setSelectedUser("");
          setRole("");
          setStartTime("");
          setEndTime("");
        }
      } catch (error) {
        console.error("Failed to add shift:", error);
      } finally {
        setIsSubmitting(false);
      }
    };

    const isFormValid = selectedUser && role && startTime && endTime;

    return (
      <Dialog open={isOpen} onOpenChange={setIsOpen}>
        <DialogTrigger asChild>{children}</DialogTrigger>
        <DialogContent className="bg-white/80 dark:bg-gray-950/80 backdrop-blur-lg sm:max-w-lg p-0">
          <DialogHeader className="p-6 pb-4">
            <DialogTitle className="text-xl font-bold text-gray-800 dark:text-gray-100 flex items-center">
              <div className="flex items-center justify-center w-9 h-9 rounded-lg bg-blue-500/10 border border-blue-500/20 mr-3">
                <Calendar className="h-5 w-5 text-blue-500 dark:text-blue-400" />
              </div>
              Add New Shift
            </DialogTitle>
          </DialogHeader>

          <div className="px-6 pb-6 space-y-5">
            <div className="space-y-2">
              <Label
                htmlFor="user"
                className="text-sm font-semibold text-gray-700 dark:text-gray-300 flex items-center"
              >
                <User className="h-4 w-4 mr-2 text-gray-500 dark:text-gray-400" />
                Assign to User
              </Label>
              <Select value={selectedUser} onValueChange={setSelectedUser} disabled={isLoading}>
                <SelectTrigger className="w-full bg-gray-50/80 dark:bg-gray-900/80 border-gray-300/70 dark:border-gray-700/60">
                  <SelectValue
                    placeholder={
                      isLoading ? "Loading users..." : "Select a user"
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
                Role
              </Label>
              <Select onValueChange={setRole}>
                <SelectTrigger className="w-full bg-gray-50/80 dark:bg-gray-900/80 border-gray-300/70 dark:border-gray-700/60">
                  <SelectValue placeholder="Select a role" />
                </SelectTrigger>
                <SelectContent className="bg-white/80 dark:bg-gray-950/80 backdrop-blur-lg">
                  {Object.entries(roles).map(([value, label]) => (
                    <SelectItem key={value} value={value}>
                      {label}
                    </SelectItem>
                  ))}
                </SelectContent>
              </Select>
            </div>

            <div className="space-y-4">
              <div className="flex items-center justify-center space-x-4">
                <Button
                  variant={calendarType === 'gregorian' ? 'default' : 'outline'}
                  size="sm"
                  onClick={() => setCalendarType('gregorian')}
                >
                  Gregorian (AD)
                </Button>
                <Button
                  variant={calendarType === 'hijri' ? 'default' : 'outline'}
                  size="sm"
                  onClick={() => setCalendarType('hijri')}
                >
                  Hijri (AH)
                </Button>
              </div>

              <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                <div className="space-y-2">
                  <Label className="text-sm font-semibold text-gray-700 dark:text-gray-300 flex items-center">
                    <Clock className="h-4 w-4 mr-2 text-gray-500 dark:text-gray-400" />
                    Start Time
                  </Label>
                  <Input
                    type="datetime-local"
                    value={startTime}
                    onChange={(e) => setStartTime(e.target.value)}
                    className="bg-gray-50/80 dark:bg-gray-900/80 border-gray-300/70 dark:border-gray-700/60"
                  />
                </div>

                <div className="space-y-2">
                  <Label className="text-sm font-semibold text-gray-700 dark:text-gray-300 flex items-center">
                    <Clock className="h-4 w-4 mr-2 text-gray-500 dark:text-gray-400" />
                    End Time
                  </Label>
                  <Input
                    type="datetime-local"
                    value={endTime}
                    onChange={(e) => setEndTime(e.target.value)}
                    className="bg-gray-50/80 dark:bg-gray-900/80 border-gray-300/70 dark:border-gray-700/60"
                  />
                </div>
              </div>
            </div>

            <div className="space-y-2">
              <Label
                htmlFor="status"
                className="text-sm font-semibold text-gray-700 dark:text-gray-300 flex items-center"
              >
                <Briefcase className="h-4 w-4 mr-2 text-gray-500 dark:text-gray-400" />
                Status
              </Label>
              <Select onValueChange={setStatus} value={status}>
                <SelectTrigger className="w-full bg-gray-50/80 dark:bg-gray-900/80 border-gray-300/70 dark:border-gray-700/60">
                  <SelectValue placeholder="Select status" />
                </SelectTrigger>
                <SelectContent className="bg-white/80 dark:bg-gray-950/80 backdrop-blur-lg">
                  <SelectItem value="on-shift">On-shift</SelectItem>
                  <SelectItem value="on-call">On-call</SelectItem>
                  <SelectItem value="upcoming">Upcoming</SelectItem>
                </SelectContent>
              </Select>
            </div>
          </div>

          <DialogFooter className="px-6 py-4 bg-gray-50 dark:bg-gray-900/70 border-t border-gray-200 dark:border-gray-800/60">
            <Button
              variant="ghost"
              onClick={() => setIsOpen(false)}
              disabled={isSubmitting}
            >
              Cancel
            </Button>
            <Button
              onClick={handleSubmit}
              disabled={!isFormValid || isSubmitting}
              className="bg-blue-500 hover:bg-blue-600 dark:bg-blue-600 dark:hover:bg-blue-700 text-white shadow-lg hover:shadow-xl transition-all duration-300 disabled:opacity-50"
            >
              {isSubmitting ? (
                <>
                  <Loader2 className="h-4 w-4 lg:mr-2 animate-spin" /> Adding...
                </>
              ) : (
                <>
                  <Plus className="h-4 w-4 lg:mr-2" />
                  <span className="hidden md:block">Add Shift</span>{" "}
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
