"use client";

import { useState, useEffect } from "react";
import { useNotifications } from "@/hooks/use-notifications";
import NotificationItem from "../../components/NotificationItem";
import { Loader } from "@/components/ui/Loader";
import { Bell, CheckCircle, Clock, AlertTriangle, MessageSquare, Eye } from "lucide-react";
import { Button } from "@/components/ui/button";
import { Avatar, AvatarFallback, AvatarImage } from "@/components/ui/avatar";
import Link from "next/link";

export default function AllNotificationsPage() {
  const { notifications, markAsRead, markAllAsRead } = useNotifications();
  const [isLoading, setIsLoading] = useState(true);

  useEffect(() => {
    // Simulate loading time for better UX
    const timer = setTimeout(() => setIsLoading(false), 1000);
    return () => clearTimeout(timer);
  }, []);

  const unreadCount = notifications.filter(n => !n.read).length;

  const getTypeIcon = (type: string) => {
    switch (type) {
      case 'system_alert':
        return <AlertTriangle className="w-5 h-5 text-red-500" />;
      case 'new_message':
        return <MessageSquare className="w-5 h-5 text-blue-500" />;
      case 'new_patient':
        return <CheckCircle className="w-5 h-5 text-green-500" />;
      default:
        return <Bell className="w-5 h-5 text-gray-500" />;
    }
  };

  if (isLoading) {
    return (
      <div className="min-h-screen bg-gradient-to-br from-slate-50 via-blue-50 to-indigo-100 dark:from-gray-900 dark:via-slate-900 dark:to-gray-800 flex items-center justify-center">
        <div className="text-center">
          <Loader />
          <p className="mt-4 text-gray-600 dark:text-gray-400 font-medium">Loading notifications...</p>
        </div>
      </div>
    );
  }

  return (
    <div className="min-h-screen bg-gradient-to-br from-slate-50 via-blue-50 to-indigo-100 dark:from-gray-900 dark:via-slate-900 dark:to-gray-800">
      <div className="container mx-auto px-4 py-8 max-w-6xl">
        {/* Header */}
        <div className="mb-8">
          <div className="flex items-center justify-between">
            <div>
              <h1 className="text-4xl font-bold bg-gradient-to-r from-gray-900 to-gray-600 dark:from-white dark:to-gray-300 bg-clip-text text-transparent">
                Notifications
              </h1>
              <p className="text-lg text-gray-600 dark:text-gray-400 mt-2 font-medium">
                Stay updated with your latest activities and alerts
              </p>
            </div>
            {unreadCount > 0 && (
              <Button
                onClick={markAllAsRead}
                className="bg-gradient-to-r from-blue-600 to-indigo-600 hover:from-blue-700 hover:to-indigo-700 text-white shadow-lg hover:shadow-xl transition-all duration-300"
              >
                <CheckCircle className="w-4 h-4 mr-2" />
                Mark All Read
              </Button>
            )}
          </div>

          {/* Stats */}
          <div className="mt-6 grid grid-cols-1 md:grid-cols-3 gap-4">
            <div className="bg-white/70 dark:bg-gray-800/70 backdrop-blur-sm rounded-xl p-6 shadow-lg border border-white/20 dark:border-gray-700/20">
              <div className="flex items-center">
                <div className="p-3 bg-blue-100 dark:bg-blue-900/30 rounded-lg">
                  <Bell className="w-6 h-6 text-blue-600 dark:text-blue-400" />
                </div>
                <div className="ml-4">
                  <p className="text-sm font-medium text-gray-600 dark:text-gray-400">Total</p>
                  <p className="text-2xl font-bold text-gray-900 dark:text-white">{notifications.length}</p>
                </div>
              </div>
            </div>
            <div className="bg-white/70 dark:bg-gray-800/70 backdrop-blur-sm rounded-xl p-6 shadow-lg border border-white/20 dark:border-gray-700/20">
              <div className="flex items-center">
                <div className="p-3 bg-red-100 dark:bg-red-900/30 rounded-lg">
                  <Clock className="w-6 h-6 text-red-600 dark:text-red-400" />
                </div>
                <div className="ml-4">
                  <p className="text-sm font-medium text-gray-600 dark:text-gray-400">Unread</p>
                  <p className="text-2xl font-bold text-gray-900 dark:text-white">{unreadCount}</p>
                </div>
              </div>
            </div>
            <div className="bg-white/70 dark:bg-gray-800/70 backdrop-blur-sm rounded-xl p-6 shadow-lg border border-white/20 dark:border-gray-700/20">
              <div className="flex items-center">
                <div className="p-3 bg-green-100 dark:bg-green-900/30 rounded-lg">
                  <CheckCircle className="w-6 h-6 text-green-600 dark:text-green-400" />
                </div>
                <div className="ml-4">
                  <p className="text-sm font-medium text-gray-600 dark:text-gray-400">Read</p>
                  <p className="text-2xl font-bold text-gray-900 dark:text-white">{notifications.length - unreadCount}</p>
                </div>
              </div>
            </div>
          </div>
        </div>

        {/* Notifications List */}
        <div className="bg-white/80 dark:bg-gray-800/80 backdrop-blur-sm rounded-2xl shadow-xl border border-white/30 dark:border-gray-700/30 overflow-hidden">
          {notifications.length > 0 ? (
            <div className="divide-y divide-gray-100 dark:divide-gray-700">
              {notifications.map((notification, index) => (
                <div
                  key={notification.id}
                  className={`p-6 hover:bg-gray-50/50 dark:hover:bg-gray-700/30 transition-all duration-200 cursor-pointer group ${
                    !notification.read ? 'bg-blue-50/30 dark:bg-blue-900/10 border-l-4 border-l-blue-500' : ''
                  }`}
                  onClick={() => markAsRead(notification.id)}
                >
                  <div className="flex items-start space-x-4">
                    <div className="flex-shrink-0 mt-1">
                      {getTypeIcon(notification.type)}
                    </div>
                    <div className="flex-1 min-w-0">
                      <div className="flex items-center justify-between">
                        <h3 className={`text-lg font-semibold text-gray-900 dark:text-white group-hover:text-blue-600 dark:group-hover:text-blue-400 transition-colors ${
                          !notification.read ? 'font-bold' : ''
                        }`}>
                          {notification.title}
                        </h3>
                        <div className="flex items-center space-x-2 text-sm text-gray-500 dark:text-gray-400">
                          <Clock className="w-4 h-4" />
                          <span>{new Date(notification.createdAt).toLocaleDateString()}</span>
                        </div>
                      </div>
                      <p className={`mt-2 text-gray-700 dark:text-gray-300 leading-relaxed ${
                        !notification.read ? 'font-medium' : ''
                      }`}>
                        {notification.message}
                      </p>
                      {notification.link && (
                        <div className="mt-4">
                          <Link href={notification.link} passHref>
                            <Button 
                              variant="outline"
                              size="sm"
                              className="bg-transparent border-blue-500 text-blue-500 hover:bg-blue-500 hover:text-white dark:border-blue-400 dark:text-blue-400 dark:hover:bg-blue-400 dark:hover:text-gray-900 transition-all duration-300"
                            >
                              <Eye className="w-4 h-4 mr-2" />
                              View Details
                            </Button>
                          </Link>
                        </div>
                      )}
                      {notification.sender && (
                        <div className="mt-2 flex items-center space-x-2">
                          <span className="text-sm text-gray-500 dark:text-gray-400">From:</span>
                          <div className="flex items-center space-x-2">
                            <Avatar className="h-5 w-5">
                              <AvatarImage src={notification.sender.image} />
                              <AvatarFallback className="text-xs">{notification.sender.fullName[0]}</AvatarFallback>
                            </Avatar>
                            <span className="text-sm font-medium text-gray-900 dark:text-white">
                              {notification.sender.fullName}
                            </span>
                          </div>
                        </div>
                      )}
                      {!notification.read && (
                        <div className="mt-3 flex items-center">
                          <span className="inline-flex items-center px-2.5 py-0.5 rounded-full text-xs font-medium bg-blue-100 text-blue-800 dark:bg-blue-900 dark:text-blue-200">
                            New
                          </span>
                        </div>
                      )}
                    </div>
                  </div>
                </div>
              ))}
            </div>
          ) : (
            <div className="p-12 text-center">
              <div className="mx-auto w-24 h-24 bg-gradient-to-br from-gray-100 to-gray-200 dark:from-gray-700 dark:to-gray-600 rounded-full flex items-center justify-center mb-6">
                <Bell className="w-12 h-12 text-gray-400 dark:text-gray-500" />
              </div>
              <h3 className="text-xl font-semibold text-gray-900 dark:text-white mb-2">No notifications yet</h3>
              <p className="text-gray-600 dark:text-gray-400 max-w-md mx-auto">
                You're all caught up! We'll notify you when there's something new to see.
              </p>
            </div>
          )}
        </div>
      </div>
    </div>
  );
}