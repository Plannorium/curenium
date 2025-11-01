'use client';
import React, { useState, useEffect } from 'react';
import { Avatar, AvatarFallback, AvatarImage } from '@/components/ui/avatar';
import { Button } from '@/components/ui/button';
import { Dialog, DialogContent, DialogHeader, DialogTitle, DialogTrigger } from '@/components/ui/dialog';
import { Input } from '@/components/ui/input';
import { Label } from '@/components/ui/label';
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from '@/components/ui/select';
import { Plus, Calendar, Clock, User, Briefcase, Loader2 } from 'lucide-react';

interface User {
  _id: string;
  fullName: string;
  image?: string;
}

interface UsersApiResponse {
  users: User[];
}

interface AddShiftModalProps {
  onShiftAdded: () => void;
  children: React.ReactNode;
}

const roles = {
  doctor: 'Doctor',
  nurse: 'Nurse',
  manager: 'Manager',
  staff: 'Staff',
  labtech: 'Lab Tech',
  reception: 'Reception',
};

const AddShiftModal: React.FC<AddShiftModalProps> = React.memo(({ onShiftAdded, children }) => {
  const [isOpen, setIsOpen] = useState(false);
  const [users, setUsers] = useState<User[]>([]);
  const [selectedUser, setSelectedUser] = useState('');
  const [role, setRole] = useState('');
  const [startTime, setStartTime] = useState('');
  const [endTime, setEndTime] = useState('');
  const [status, setStatus] = useState('on-shift');
  const [isLoading, setIsLoading] = useState(false);
  const [isSubmitting, setIsSubmitting] = useState(false);

  useEffect(() => {
    const fetchUsers = async () => {
      setIsLoading(true);
      try {
        const res = await fetch('/api/users');
        const data: UsersApiResponse = await res.json();
        setUsers(data.users || []);
      } catch (error) {
        console.error('Failed to fetch users:', error);
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
      const res = await fetch('/api/shifts', {
        method: 'POST',
        headers: {
          'Content-Type': 'application/json',
        },
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
        // Reset form
        setSelectedUser('');
        setRole('');
        setStartTime('');
        setEndTime('');
      }
    } catch (error) {
      console.error('Failed to add shift:', error);
    } finally {
      setIsSubmitting(false);
    }
  };

  const isFormValid = selectedUser && role && startTime && endTime;

  return (
    <Dialog open={isOpen} onOpenChange={setIsOpen}>
      <DialogTrigger asChild>
        {children}
      </DialogTrigger>
      <DialogContent className="backdrop-blur-xl bg-background/95 border-border/50 shadow-2xl max-w-lg">
        {/* Background gradient overlay */}
        <div className="absolute inset-0 bg-gradient-to-br from-primary/5 via-transparent to-accent/5 rounded-lg pointer-events-none"></div>
        
        <DialogHeader className="relative pb-6">
          <DialogTitle className="text-xl font-semibold text-foreground flex items-center">
            <div className="flex items-center justify-center w-8 h-8 rounded-lg bg-primary/10 border border-primary/20 mr-3">
              <Calendar className="h-4 w-4 text-primary" />
            </div>
            Add New Shift
          </DialogTitle>
        </DialogHeader>
        
        <div className="relative space-y-6 py-2">
          {/* User Selection */}
          <div className="space-y-2">
            <Label htmlFor="user" className="text-sm font-medium text-foreground flex items-center">
              <User className="h-4 w-4 mr-2 text-muted-foreground" />
              Assign to User
            </Label>
            <Select onValueChange={setSelectedUser} disabled={isLoading}>
              <SelectTrigger className="backdrop-blur-sm bg-background/50 border-border/60 hover:border-border transition-all duration-200 focus:ring-2 focus:ring-primary/20">
                <SelectValue placeholder={isLoading ? "Loading users..." : "Select a user"} />
              </SelectTrigger>
              <SelectContent className="backdrop-blur-xl bg-popover/95 border-border/50">
                {users.map(user => (
                  <SelectItem 
                    key={user._id} 
                    value={user._id}
                    className="hover:bg-accent/50 focus:bg-accent/50 transition-colors duration-150"
                  >
                    <div className="flex items-center gap-3">
                      <Avatar className="h-6 w-6">
                        <AvatarImage src={user.image} />
                        <AvatarFallback className="text-xs">
                          {user.fullName.split(' ').map(n => n[0]).join('')}
                        </AvatarFallback>
                      </Avatar>
                      {user.fullName}
                    </div>
                  </SelectItem>
                ))}
              </SelectContent>
            </Select>
          </div>

          {/* Role Selection */}
          <div className="space-y-2">
            <Label htmlFor="role" className="text-sm font-medium text-foreground flex items-center">
              <Briefcase className="h-4 w-4 mr-2 text-muted-foreground" />
              Role
            </Label>
            <Select onValueChange={setRole}>
              <SelectTrigger className="backdrop-blur-sm bg-background/50 border-border/60 hover:border-border transition-all duration-200 focus:ring-2 focus:ring-primary/20">
                <SelectValue placeholder="Select a role" />
              </SelectTrigger>
              <SelectContent className="backdrop-blur-xl bg-popover/95 border-border/50">
                {Object.entries(roles).map(([value, label]) => (
                  <SelectItem 
                    key={value} 
                    value={value}
                    className="hover:bg-accent/50 focus:bg-accent/50 transition-colors duration-150"
                  >
                    {label}
                  </SelectItem>
                ))}
              </SelectContent>
            </Select>
          </div>

          {/* Time Selection */}
          <div className="grid grid-cols-1 gap-4">
            <div className="space-y-2">
              <Label htmlFor="startTime" className="text-sm font-medium text-foreground flex items-center">
                <Clock className="h-4 w-4 mr-2 text-muted-foreground" />
                Start Time
              </Label>
              <Input 
                id="startTime" 
                type="datetime-local" 
                value={startTime} 
                onChange={e => setStartTime(e.target.value)} 
                className="backdrop-blur-sm bg-background/50 border-border/60 hover:border-border focus:border-primary transition-all duration-200 focus:ring-2 focus:ring-primary/20"
              />
            </div>
            
            <div className="space-y-2">
              <Label htmlFor="endTime" className="text-sm font-medium text-foreground flex items-center">
                <Clock className="h-4 w-4 mr-2 text-muted-foreground" />
                End Time
              </Label>
              <Input 
                id="endTime" 
                type="datetime-local" 
                value={endTime} 
                onChange={e => setEndTime(e.target.value)} 
                className="backdrop-blur-sm bg-background/50 border-border/60 hover:border-border focus:border-primary transition-all duration-200 focus:ring-2 focus:ring-primary/20"
              />
            </div>
          </div>

          {/* Status Selection */}
          <div className="space-y-2 mt-2">
            <Label htmlFor="status" className="text-sm font-medium text-foreground flex items-center">
              <Briefcase className="h-4 w-4 mr-2 text-muted-foreground" />
              Status
            </Label>
            <Select onValueChange={setStatus} value={status}>
              <SelectTrigger className="backdrop-blur-sm bg-background/50 border-border/60 hover:border-border transition-all duration-200 focus:ring-2 focus:ring-primary/20">
                <SelectValue placeholder="Select status" />
              </SelectTrigger>
              <SelectContent className="backdrop-blur-xl bg-popover/95 border-border/50">
                <SelectItem value="on-shift">On-shift</SelectItem>
                <SelectItem value="on-call">On-call</SelectItem>
                <SelectItem value="upcoming">Upcoming</SelectItem>
              </SelectContent>
            </Select>
          </div>
        </div>

        {/* Action Buttons */}
        <div className="flex gap-3 pt-6 border-t border-border/30">
          <Button 
            variant="outline" 
            onClick={() => setIsOpen(false)}
            className="flex-1 backdrop-blur-sm bg-background/50 border-border/60 hover:bg-accent/50 transition-all duration-200"
            disabled={isSubmitting}
          >
            Cancel
          </Button>
          <Button 
            onClick={handleSubmit}
            disabled={!isFormValid || isSubmitting}
            className="flex-1 bg-primary hover:bg-primary/90 text-primary-foreground shadow-lg hover:shadow-xl transition-all duration-300 disabled:opacity-50 disabled:cursor-not-allowed"
          >
            {isSubmitting ? (
              <>
                <Loader2 className="h-4 w-4 mr-2 animate-spin" />
                Adding...
              </>
            ) : (
              <>
                <Plus className="h-4 w-4 mr-2" />
                Add Shift
              </>
            )}
          </Button>
        </div>
      </DialogContent>
    </Dialog>
  );
});

AddShiftModal.displayName = 'AddShiftModal';

export default AddShiftModal;