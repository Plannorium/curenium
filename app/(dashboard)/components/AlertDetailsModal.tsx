"use client";

import React from 'react';
import { Dialog, DialogContent, DialogHeader, DialogTitle, DialogFooter } from '@/components/ui/dialog';
import { Button } from '@/components/ui/button';
import { X, User, Clock, MessageSquare, Tag, Users, Building, ArrowUpRight } from 'lucide-react';
import { Avatar, AvatarFallback, AvatarImage } from '@/components/ui/avatar';
import Link from 'next/link';

interface Alert {
  _id: string;
  level: 'critical' | 'urgent' | 'info';
  message: string;
  createdAt: string;
  patientId?: string;
  createdBy: {
    _id: string;
    fullName: string;
    image?: string;
  };
  // Assuming these fields might be available in the future
  acknowledgedBy?: string[]; 
  assignedTo?: string[];
  channel?: string;
}

interface AlertDetailsModalProps {
  alert: Alert | null;
  onClose: () => void;
}

const alertLevelConfig = {
  critical: {
    bgColor: 'bg-red-500/10 dark:bg-red-900/20',
    textColor: 'text-red-500 dark:text-red-400',
    borderColor: 'border-red-500/20 dark:border-red-500/30',
    badge: 'bg-red-500/20 text-red-500 dark:text-red-400 border border-red-500/30',
  },
  urgent: {
    bgColor: 'bg-amber-500/10 dark:bg-amber-900/20',
    textColor: 'text-amber-500 dark:text-amber-400',
    borderColor: 'border-amber-500/20 dark:border-amber-500/30',
    badge: 'bg-amber-500/20 text-amber-500 dark:text-amber-400 border border-amber-500/30',
  },
  info: {
    bgColor: 'bg-blue-500/10 dark:bg-blue-900/20',
    textColor: 'text-blue-500 dark:text-blue-400',
    borderColor: 'border-blue-500/20 dark:border-blue-500/30',
    badge: 'bg-blue-500/20 text-blue-500 dark:text-blue-400 border border-blue-500/30',
  },
};

const DetailItem = ({ icon: Icon, label, value }: { icon: React.ElementType, label: string, value: string | React.ReactNode }) => (
  <div className="flex items-start space-x-3">
    <Icon className="h-5 w-5 text-gray-400 dark:text-gray-500 mt-1 flex-shrink-0" />
    <div className="flex-1">
      <p className="text-xs text-gray-500 dark:text-gray-400 font-medium">{label}</p>
      <p className="text-sm text-gray-800 dark:text-gray-100 font-semibold">{value}</p>
    </div>
  </div>
);

export const AlertDetailsModal = ({ alert, onClose }: AlertDetailsModalProps) => {
  if (!alert) return null;

  const config = alertLevelConfig[alert.level];
  const createdDate = new Date(alert.createdAt);

  return (
    <Dialog open={!!alert} onOpenChange={(isOpen) => !isOpen && onClose()}>
      <DialogContent className={`
        sm:max-w-lg p-0 border-t-4 transition-colors duration-300
        ${config.borderColor} ${config.bgColor}
        bg-white/80 dark:bg-gray-950/80 backdrop-blur-lg
      `}>
        <DialogHeader className="p-6 pb-4">
          <DialogTitle className={`flex items-center text-xl font-bold ${config.textColor}`}>
            Alert Details
          </DialogTitle>
          <button onClick={onClose} className="absolute top-4 right-4 text-gray-400 hover:text-gray-600 dark:text-gray-500 dark:hover:text-gray-300 transition-colors">
            <X className="h-5 w-5" />
          </button>
        </DialogHeader>

        <div className="px-6 pb-6 space-y-6">
          <div className="p-4 rounded-lg bg-gray-100/50 dark:bg-gray-900/50 border border-gray-200 dark:border-gray-800/60">
            <DetailItem 
              icon={MessageSquare} 
              label="Message" 
              value={alert.message} 
            />
          </div>

          <div className="grid grid-cols-1 sm:grid-cols-2 gap-6">
            <DetailItem 
              icon={Tag} 
              label="Level" 
              value={
                <span className={`px-2 py-1 rounded-md text-xs font-semibold capitalize ${config.badge}`}>
                  {alert.level}
                </span>
              } 
            />
            <DetailItem 
              icon={Clock} 
              label="Timestamp" 
              value={`${createdDate.toLocaleDateString()} ${createdDate.toLocaleTimeString()}`} 
            />
            <DetailItem 
              icon={User} 
              label="Created By" 
              value={
                <div className="flex items-center space-x-2">
                  <Avatar className="h-6 w-6">
                    <AvatarImage src={alert.createdBy.image} alt={alert.createdBy.fullName} />
                    <AvatarFallback>{alert.createdBy.fullName.charAt(0)}</AvatarFallback>
                  </Avatar>
                  <span>{alert.createdBy.fullName}</span>
                </div>
              } 
            />
            {alert.channel && (
              <DetailItem 
                icon={Building} 
                label="Channel" 
                value={alert.channel} 
              />
            )}
            {alert.assignedTo && (
              <DetailItem 
                icon={Users} 
                label="Assigned To" 
                value={alert.assignedTo.join(', ')} 
              />
            )}
          </div>
        </div>

        <DialogFooter className="px-6 py-4 bg-gray-50 dark:bg-gray-900/50 border-t border-gray-200 dark:border-gray-800/60">
          <Button onClick={onClose} variant="outline" className="w-full sm:w-auto">
            Close
          </Button>
          {alert.patientId && (
            <Link href={`/dashboard/ehr/patients/${alert.patientId}`} passHref>
              <Button className="w-full sm:w-auto">
                <ArrowUpRight className="h-4 w-4 mr-2" />
                View Patient
              </Button>
            </Link>
          )}
        </DialogFooter>
      </DialogContent>
    </Dialog>
  );
};