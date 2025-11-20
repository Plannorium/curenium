
"use client";

import { useState, useEffect } from 'react';
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card';
import { Zap, Shield, Info, Plus } from 'lucide-react';
import { AlertDetailsModal } from '../../components/AlertDetailsModal';
import { useAlerts } from '@/hooks/useAlerts';
import { SendAlertModal } from '../../components/SendAlertModal';
import { Button } from '@/components/ui/button';

interface User {
  _id: string;
  fullName: string;
  image?: string;
}

interface Alert {
  _id: string;
  level: 'critical' | 'urgent' | 'info';
  message: string;
  createdAt: string;
  createdBy: {
    _id: string;
    fullName: string;
    image: string;
  };
  patientId?: string;
}

const levelConfig = {
  critical: { icon: Zap, color: 'text-red-500' },
  urgent: { icon: Shield, color: 'text-amber-500' },
  info: { icon: Info, color: 'text-blue-500' },
};

export default function AlertsPage() {
  const { alerts } = useAlerts();
  const [selectedAlert, setSelectedAlert] = useState<Alert | null>(null);
  const [isModalOpen, setIsModalOpen] = useState(false);
  const [allUsers, setAllUsers] = useState<User[]>([]);

  useEffect(() => {
    const fetchUsers = async () => {
      try {
        const response = await fetch('/api/users');
        if (response.ok) {
          const users = await response.json();
          setAllUsers(users as User[]);
        } else {
          console.error('Failed to fetch users');
        }
      } catch (error) {
        console.error('Error fetching users:', error);
      }
    };

    fetchUsers();
  }, []);

  return (
    <div className="p-4 sm:p-6 lg:p-8">
      <div className="flex justify-between items-center mb-6">
        <h1 className="text-2xl font-bold">Alerts</h1>
        <Button onClick={() => setIsModalOpen(true)}>
          <Plus className="mr-2 h-4 w-4" /> Send Alert
        </Button>
      </div>

      <div className="grid gap-4 md:grid-cols-2 lg:grid-cols-3">
        {alerts.map((alert) => {
          const { icon: Icon, color } = levelConfig[alert.level];
          return (
            <Card
              key={alert._id}
              className="hover:shadow-lg transition-shadow cursor-pointer"
              onClick={() => setSelectedAlert(alert)}
            >
              <CardHeader className="flex flex-row items-center justify-between space-y-0 pb-2">
                <CardTitle className="text-sm font-medium">{alert.level.toUpperCase()}</CardTitle>
                <Icon className={`h-5 w-5 ${color}`} />
              </CardHeader>
              <CardContent>
                <p className="text-lg font-semibold">{alert.message}</p>
                <p className="text-xs text-muted-foreground mt-2">
                  {new Date(alert.createdAt).toLocaleString()}
                </p>
              </CardContent>
            </Card>
          );
        })}
      </div>

      <AlertDetailsModal
        alert={selectedAlert}
        onClose={() => setSelectedAlert(null)}
      />
      <SendAlertModal
        isOpen={isModalOpen}
        onClose={() => setIsModalOpen(false)}
        onAlertSent={() => {
          // No need to manually add the alert here, 
          // the useAlerts hook will receive it via WebSocket
        }}
        allUsers={allUsers}
      />
    </div>
  );
}