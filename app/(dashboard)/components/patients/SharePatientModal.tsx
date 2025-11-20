"use client";

import { useState, useEffect } from "react";
import {
  Dialog,
  DialogContent,
  DialogHeader,
  DialogTitle,
  DialogFooter,
  DialogDescription,
} from "@/components/ui/dialog";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import { useSession } from "next-auth/react";
import { toast } from "sonner";
import { Loader2, Users, User, Search, X, Check, Copy } from "lucide-react";
import { Avatar, AvatarFallback, AvatarImage } from "@/components/ui/avatar";
import { Badge } from "@/components/ui/badge";
import { ScrollArea } from "@/components/ui/scroll-area";
import { AnimatePresence, motion } from "framer-motion";

interface User {
  _id: string;
  fullName: string;
  email: string;
  role: string;
  image?: string;
}

interface SharePatientModalProps {
  patientId: string;
  patientName: string;
  isOpen: boolean;
  onClose: () => void;
}

export const SharePatientModal: React.FC<SharePatientModalProps> = ({
  patientId,
  patientName,
  isOpen,
  onClose,
}) => {
  const { data: session } = useSession();
  const [isLoading, setIsLoading] = useState(false);
  const [users, setUsers] = useState<User[]>([]);
  const [filteredUsers, setFilteredUsers] = useState<User[]>([]);
  const [selectedUsers, setSelectedUsers] = useState<User[]>([]);
  const [searchQuery, setSearchQuery] = useState("");
  const [message, setMessage] = useState(`Please review patient ${patientName}'s profile.`);

  useEffect(() => {
    if (isOpen) {
      fetchUsers();
      setMessage(`Please review patient ${patientName}'s profile.`);
      setSelectedUsers([]);
      setSearchQuery("");
    }
  }, [isOpen, patientName]);

  useEffect(() => {
    const filtered = users.filter(user =>
      user.fullName?.toLowerCase().includes(searchQuery.toLowerCase()) ||
      user.email?.toLowerCase().includes(searchQuery.toLowerCase()) ||
      user.role?.toLowerCase().includes(searchQuery.toLowerCase())
    );
    setFilteredUsers(filtered);
  }, [users, searchQuery]);

  const fetchUsers = async () => {
    try {
      const res = await fetch("/api/users");
      if (res.ok) {
        const data: User[] = await res.json();
        // const filteredData = data.filter((user: User) => user._id !== session?.user?.id);
        const filteredData = data;
        setUsers(filteredData);
        setFilteredUsers(filteredData);
      }
    } catch (error) {
      console.error("Failed to fetch users:", error);
      toast.error("Failed to load users");
    }
  };

  const handleUserSelect = (user: User) => {
    setSelectedUsers(prev => {
      const isSelected = prev.some(u => u._id === user._id);
      if (isSelected) {
        return prev.filter(u => u._id !== user._id);
      } else {
        return [...prev, user];
      }
    });
  };

  const handleCopyToClipboard = async () => {
    const patientUrl = `${window.location.origin}/dashboard/ehr/patients/${patientId}`;

    try {
      await navigator.clipboard.writeText(patientUrl);
      toast.success("Patient profile link copied to clipboard!");
    } catch (error) {
      console.error("Failed to copy to clipboard:", error);
      toast.error("Failed to copy to clipboard");
    }
  };

  const handleShare = async () => {
    if (selectedUsers.length === 0) {
      toast.error("Please select at least one user to share with");
      return;
    }

    if (!session?.user?.id) {
      toast.error("User session not found. Please log in again.");
      return;
    }

    setIsLoading(true);
    try {
      const notification = {
        title: `Patient Profile Shared: ${patientName}`,
        message: message,
        type: "share.request",
        relatedId: patientId,
        link: `/patients/${patientId}`,
        sender: {
          _id: session.user.id,
          fullName: session.user.name || "Unknown",
          image: session.user.image,
        },
      };

      const res = await fetch("/api/notifications/send", {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({
          userIds: selectedUsers.map(u => u._id),
          notification,
        }),
      });

      if (res.ok) {
        toast.success(`Patient profile shared with ${selectedUsers.length} user(s)`);
        onClose();
      } else {
        toast.error("Failed to share patient profile");
      }
    } catch (error) {
      console.error("Failed to share patient profile:", error);
      toast.error("An unexpected error occurred");
    } finally {
      setIsLoading(false);
    }
  };

  return (
    <Dialog open={isOpen} onOpenChange={onClose}>
      <DialogContent className="max-w-2xl bg-card text-card-foreground p-0">
        <DialogHeader className="p-6 pb-4">
          <div className="flex items-center justify-between">
            <DialogTitle className="flex items-center text-2xl font-bold">
              <Users className="mr-3 h-6 w-6 text-primary" />
              Share: <span className="font-normal ml-2">{patientName}</span>
            </DialogTitle>
            <Button
              variant="ghost"
              size="sm"
              onClick={handleCopyToClipboard}
              className="h-8 w-8 p-0 hover:bg-muted cursor-pointer"
              title="Copy patient information to clipboard"
            >
              <Copy className="h-4 w-4" />
            </Button>
          </div>
          <DialogDescription className="mt-1 text-muted-foreground">
            Select users to share this patient's profile with. They will receive an immediate notification.
          </DialogDescription>
        </DialogHeader>

        <div className="px-6 pb-6 space-y-6">
          <div className="relative">
            <Search className="absolute left-3.5 top-1/2 -translate-y-1/2 h-5 w-5 text-muted-foreground" />
            <Input
              placeholder="Search by name, email, or role..."
              value={searchQuery}
              onChange={(e) => setSearchQuery(e.target.value)}
              className="pl-12 h-11 text-base rounded-md"
            />
          </div>

          <AnimatePresence>
            {selectedUsers.length > 0 && (
              <motion.div
                initial={{ opacity: 0, height: 0 }}
                animate={{ opacity: 1, height: 'auto' }}
                exit={{ opacity: 0, height: 0 }}
                className="space-y-3"
              >
                <Label className="text-base font-semibold">Selected ({selectedUsers.length})</Label>
                <div className="flex flex-wrap gap-2">
                  {selectedUsers.map(user => (
                    <motion.div
                      key={user._id}
                      layout
                      initial={{ opacity: 0, scale: 0.5 }}
                      animate={{ opacity: 1, scale: 1 }}
                      exit={{ opacity: 0, scale: 0.5 }}
                      className="flex items-center gap-2 bg-primary/15 text-primary-foreground px-3 py-1.5 rounded-full text-sm font-medium"
                    >
                      <Avatar className="h-6 w-6">
                        <AvatarImage src={user.image} />
                        <AvatarFallback className="text-xs bg-primary/30">
                          {user.fullName.split(' ').map(n => n[0]).join('').slice(0, 2)}
                        </AvatarFallback>
                      </Avatar>
                      <span className="text-primary">{user.fullName}</span>
                      <button
                        onClick={() => handleUserSelect(user)}
                        className="ml-1 text-primary hover:bg-primary/20 rounded-full p-0.5 transition-colors"
                      >
                        <X className="h-4 w-4" />
                      </button>
                    </motion.div>
                  ))}
                </div>
              </motion.div>
            )}
          </AnimatePresence>

          <div className="space-y-3">
            <Label htmlFor="message" className="text-base font-semibold">Message</Label>
            <Input
              id="message"
              value={message}
              onChange={(e) => setMessage(e.target.value)}
              placeholder="Add a custom message..."
              className="h-11 text-base rounded-md"
            />
          </div>

          <div className="space-y-3">
            <Label className="text-base font-semibold">Available Users</Label>
            <ScrollArea className="h-64 pr-4">
              <div className="space-y-2">
                {filteredUsers.map(user => {
                  const isSelected = selectedUsers.some(u => u._id === user._id);
                  return (
                    <motion.div
                      key={user._id}
                      layout
                      onClick={() => handleUserSelect(user)}
                      className={`flex items-center gap-4 p-3 rounded-lg border cursor-pointer transition-all duration-200 ${
                        isSelected
                          ? "bg-primary/10 border-primary shadow-md"
                          : "hover:bg-muted/50 hover:border-muted-foreground/50 border-border"
                      }`}
                    >
                      <Avatar className="h-11 w-11 border-2 border-transparent">
                        <AvatarImage src={user.image} />
                        <AvatarFallback className="text-base">
                          {user.fullName.split(' ').map(n => n[0]).join('').slice(0, 2)}
                        </AvatarFallback>
                      </Avatar>
                      <div className="flex-1">
                        <p className="font-semibold text-base text-card-foreground">{user.fullName}</p>
                        <p className="text-sm text-muted-foreground">{user.email || 'No email'}</p>
                      </div>
                      <div className="text-right">
                        <Badge variant={isSelected ? "default" : "outline"} className="text-xs font-medium">
                          {user.role}
                        </Badge>
                      </div>
                      <div className={`w-6 h-6 rounded-md border-2 flex items-center justify-center transition-all duration-200 ${
                        isSelected ? "bg-primary border-primary" : "border-muted-foreground/50"
                      }`}>
                        {isSelected && <Check className="text-primary-foreground h-4 w-4" />}
                      </div>
                    </motion.div>
                  );
                })}
                {filteredUsers.length === 0 && (
                  <div className="text-center py-12 text-muted-foreground">
                    <p className="font-semibold">No users found</p>
                    <p className="text-sm">Try adjusting your search query.</p>
                  </div>
                )}
              </div>
            </ScrollArea>
          </div>
        </div>

        <DialogFooter className="p-6 pt-4 bg-muted/50 border-t">
          <Button variant="ghost" onClick={onClose}>
            Cancel
          </Button>
          <Button onClick={handleShare} disabled={isLoading || selectedUsers.length === 0} className="min-w-[150px]">
            {isLoading ? (
              <Loader2 className="mr-2 h-4 w-4 animate-spin" />
            ) : (
              `Share with ${selectedUsers.length} user${selectedUsers.length !== 1 ? 's' : ''}`
            )}
          </Button>
        </DialogFooter>
      </DialogContent>
    </Dialog>
  );
};