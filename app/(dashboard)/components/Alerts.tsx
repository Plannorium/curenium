import React, { useState, useEffect, useCallback } from 'react';
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card';
import { BellIcon, ArrowRightIcon, Loader2, Plus } from 'lucide-react';
import { Button } from '@/components/ui/button';
import { SendAlertModal } from './SendAlertModal';
import { AlertDetailsModal } from './AlertDetailsModal';

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
}

interface User {
  _id: string;
  fullName: string;
  image?: string;
}

interface Channel {
  id: string;
  name: string;
}

interface AlertsApiResponse {
  alerts: Alert[];
}

interface UsersApiResponse {
  users: User[];
}

const timeSince = (date: Date): string => {
  const seconds = Math.floor((new Date().getTime() - date.getTime()) / 1000);
  let interval = seconds / 31536000;
  if (interval > 1) return Math.floor(interval) + "y ago";
  interval = seconds / 2592000;
  if (interval > 1) return Math.floor(interval) + "mo ago";
  interval = seconds / 86400;
  if (interval > 1) return Math.floor(interval) + "d ago";
  interval = seconds / 3600;
  if (interval > 1) return Math.floor(interval) + "h ago";
  interval = seconds / 60;
  if (interval > 1) return Math.floor(interval) + "m ago";
  return Math.floor(seconds) + "s ago";
};

const alertLevelStyles = {
  critical: {
    container: 'bg-red-500/10 border-red-500/30 hover:bg-red-500/15 hover:border-red-500/40 dark:bg-red-900/20 dark:border-red-500/20 dark:hover:bg-red-900/30 dark:hover:border-red-500/30',
    indicator: 'bg-red-500 shadow-red-500/50',
    ping: 'bg-red-500',
    badge: 'bg-red-500/20 text-red-500 dark:text-red-400 border border-red-500/30'
  },
  urgent: {
    container: 'bg-amber-500/10 border-amber-500/30 hover:bg-amber-500/15 hover:border-amber-500/40 dark:bg-amber-900/20 dark:border-amber-500/20 dark:hover:bg-amber-900/30 dark:hover:border-amber-500/30',
    indicator: 'bg-amber-500 shadow-amber-500/50',
    ping: '',
    badge: 'bg-amber-500/20 text-amber-500 dark:text-amber-400 border border-amber-500/30'
  },
  info: {
    container: 'bg-blue-500/10 border-blue-500/30 hover:bg-blue-500/15 hover:border-blue-500/40 dark:bg-blue-900/20 dark:border-blue-500/20 dark:hover:bg-blue-900/30 dark:hover:border-blue-500/30',
    indicator: 'bg-blue-500 shadow-blue-500/50',
    ping: '',
    badge: 'bg-blue-500/20 text-blue-500 dark:text-blue-400 border border-blue-500/30'
  }
};

const Alerts = () => {
  const [alerts, setAlerts] = useState<Alert[]>([]);
  const [isLoading, setIsLoading] = useState(true);
  const [showAlertModal, setShowAlertModal] = useState(false);
  const [selectedAlert, setSelectedAlert] = useState<Alert | null>(null);
  const [allUsers, setAllUsers] = useState<User[]>([]);
  
  const allChannels: Channel[] = [
    { name: 'Emergency Ward', id: 'emergency' },
    { name: 'Cardiology', id: 'cardiology' },
    { name: 'Pediatrics', id: 'pediatrics' },
  ];

  const fetchAlerts = useCallback(async () => {
    setIsLoading(true);
    const res = await fetch('/api/alerts');
    const data: AlertsApiResponse = await res.json();
    setAlerts(data.alerts || []);
    setIsLoading(false);
  }, []);

  useEffect(() => { 
    fetchAlerts();
    
    const fetchUsers = async () => {
      try {
        const res = await fetch('/api/users');
        const data: UsersApiResponse = await res.json();
        setAllUsers(data.users || []);
      } catch (error) {
        console.error('Failed to fetch users for alerts modal:', error);
      }
    };
    fetchUsers();
  }, [fetchAlerts]);

  return (
    <>
      <Card className="backdrop-blur-sm bg-white/80 dark:bg-gray-950/80 border border-gray-200 dark:border-gray-800/50 shadow-lg hover:shadow-xl transition-all duration-300">
        <CardHeader className="pb-4 border-b border-gray-200 dark:border-gray-800/50">
          <CardTitle className="flex items-center text-lg font-semibold text-gray-800 dark:text-gray-100">
            <div className="relative">
              <BellIcon className="mr-3 h-5 w-5 text-primary" />
              <div className="absolute -top-1 -right-1 h-2 w-2 bg-red-500 rounded-full animate-pulse"></div>
            </div>
            Active Alerts
            <div className="ml-auto">
              <span className="inline-flex items-center px-2.5 py-0.5 rounded-full text-xs font-medium bg-primary/10 text-primary border border-primary/20">
                {alerts.length}
              </span>
            </div>
          </CardTitle>
        </CardHeader>
        <CardContent className="space-y-3 px-6 pb-6">
          {isLoading ? (
            <div className="flex items-center justify-center h-32">
              <Loader2 className="h-6 w-6 animate-spin text-gray-500 dark:text-gray-400" />
              <span className="ml-2 text-sm text-gray-500 dark:text-gray-400">Loading alerts...</span>
            </div>
          ) : alerts.length === 0 ? (
            <div className="flex flex-col items-center justify-center h-32 text-center">
              <BellIcon className="h-8 w-8 text-gray-400 dark:text-gray-600 mb-2" />
              <p className="text-sm text-gray-500 dark:text-gray-400">No active alerts</p>
              <p className="text-xs text-gray-500/70 dark:text-gray-400/70">Everything is quiet for now.</p>
            </div>
          ) : (
            alerts.map((alert) => {
              const styles = alertLevelStyles[alert.level];
              return (
                <div 
                  key={alert._id}
                  onClick={() => setSelectedAlert(alert)}
                  className={`
                    group relative flex items-center p-4 rounded-xl transition-all duration-300 cursor-pointer
                    backdrop-blur-sm border shadow-sm hover:shadow-md hover:scale-[1.02] hover:-translate-y-0.5
                    ${styles.container}
                  `}
                >
                  <div className="relative mr-4 flex-shrink-0">
                    <div className={`
                      h-3 w-3 rounded-full shadow-sm transition-all duration-300 group-hover:scale-110
                      ${styles.indicator}
                    `}>
                    </div>
                    {alert.level === 'critical' && styles.ping && (
                      <div className={`
                        absolute inset-0 h-3 w-3 rounded-full ${styles.ping} animate-ping opacity-30
                      `}></div>
                    )}
                  </div>

                  <div className="flex-1 min-w-0">
                    <p className="text-sm font-medium text-gray-900 dark:text-gray-100 group-hover:text-gray-800 dark:group-hover:text-gray-50 transition-colors duration-200">
                      {alert.message}
                    </p>
                    <div className="flex items-center mt-1">
                      <span className={`
                        inline-flex items-center px-2 py-0.5 rounded-md text-xs font-medium capitalize
                        ${styles.badge}
                      `}>
                        {alert.level}
                      </span>
                    </div>
                  </div>

                  <div className="flex flex-col items-end space-y-2 ml-4">
                    <span className="text-xs text-gray-500 dark:text-gray-400 font-medium">
                      {timeSince(new Date(alert.createdAt))}
                    </span>
                    <ArrowRightIcon className="h-4 w-4 text-gray-400 dark:text-gray-500/60 group-hover:text-primary group-hover:translate-x-0.5 transition-all duration-200" />
                  </div>

                  <div className="absolute inset-0 rounded-xl bg-gradient-to-r from-transparent via-white/[0.02] dark:via-white/[0.01] to-transparent opacity-0 group-hover:opacity-100 transition-opacity duration-300 pointer-events-none"></div>
                </div>
              );
            })
          )}

          <div className="flex items-center justify-between pt-4 mt-6 border-t border-gray-200 dark:border-gray-800/50">
            <Button 
              variant="ghost" 
              size="sm" 
              className="text-gray-500 dark:text-gray-400 hover:text-gray-900 dark:hover:text-white transition-colors duration-200 cursor-pointer"
              onClick={() => setShowAlertModal(true)}
            >
              <Plus className="h-4 w-4 mr-2" />
              New Alert
            </Button>
            <Button 
              variant="ghost" 
              size="sm" 
              className="text-gray-500 dark:text-gray-400 hover:text-gray-900 dark:hover:text-white transition-colors duration-200"
            >
              View All
            </Button>
          </div>
        </CardContent>
      </Card>
      <SendAlertModal 
        isOpen={showAlertModal}
        onClose={() => setShowAlertModal(false)}
        onAlertSent={fetchAlerts}
        allUsers={allUsers}
        allChannels={allChannels}
      />
      {selectedAlert && (
        <AlertDetailsModal
          alert={selectedAlert}
          onClose={() => setSelectedAlert(null)}
        />
      )}
    </>
  );
};

export default Alerts;