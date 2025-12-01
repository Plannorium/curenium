"use client";

import React, { useState } from "react";
import { Bell } from "lucide-react";
import {
  DropdownMenu,
  DropdownMenuContent,
  DropdownMenuTrigger,
} from "@/components/ui/dropdown-menu";
import { Button } from "@/components/ui/button";
import NotificationItem from "./NotificationItem";
import { useNotifications } from "@/hooks/use-notifications";
import Link from "next/link";
import { useMediaQuery } from "@/hooks/use-media-query";
import { useLanguage } from "@/contexts/LanguageContext";
import { dashboardTranslations } from "@/lib/dashboard-translations";

const Notifications = () => {
  const { language } = useLanguage();
  const { notifications, markAsRead, markAllAsRead } = useNotifications();
  const isDesktop = useMediaQuery("(min-width: 768px)");

  const t = (key: string) => {
    const keys = key.split('.');
    let value: any = dashboardTranslations[language as keyof typeof dashboardTranslations];
    for (const k of keys) {
      value = value?.[k];
    }
    return value || key;
  };

  const unreadCount = notifications.filter((n) => !n.read).length;
  const displayedNotifications = notifications.slice(0, isDesktop ? 7 : 5);

  return (
    <DropdownMenu>
      <DropdownMenuTrigger asChild>
        <Button
          variant="ghost"
          size="icon"
          className="relative rounded-lg hover:bg-gray-100 dark:hover:bg-gray-800"
        >
          <Bell className="h-5 w-5 text-gray-500 dark:text-gray-400" />
          {unreadCount > 0 && (
            <span className="absolute top-1.5 right-1.5 flex h-4 w-4 items-center justify-center rounded-full bg-red-500 text-xs font-bold text-white">
              {unreadCount}
            </span>
          )}
        </Button>
      </DropdownMenuTrigger>
      <DropdownMenuContent
        className={`w-80 bg-white dark:bg-gray-950 border-gray-200 dark:border-gray-800 shadow-lg max-h-[70vh] overflow-y-auto ${language==="ar"?"ml-3.5 lg:ml-5":"ml-0"}`}
        align="end"
      >
        <div className="p-4 font-semibold border-b border-gray-200 dark:border-gray-800 flex justify-between items-center sticky top-0 bg-white dark:bg-gray-950 z-10">
          <span>{t('notifications.title')}</span>
          {unreadCount > 0 && (
            <span className="text-xs font-normal text-gray-500 dark:text-gray-400">
              {unreadCount} {t('notifications.new')}
            </span>
          )}
        </div>
        <div>
          {displayedNotifications.length > 0 ? (
            displayedNotifications.map((notification) => (
              <NotificationItem
                key={notification.id}
                notification={notification}
                onClick={markAsRead}
              />
            ))
          ) : (
            <div className="p-4 text-center text-gray-500 dark:text-gray-400">
              {t('notifications.noNotifications')}
            </div>
          )}
        </div>
        <div className="p-2 text-center border-t border-gray-200 dark:border-gray-800 flex justify-between items-center">
          <Button variant="link" className="text-sm" onClick={markAllAsRead}>
            {t('notifications.markAllRead')}
          </Button>
          <Link href="/dashboard/notifications">
            <Button variant="link" className="text-sm">
              {t('notifications.viewDetails')}
            </Button>
          </Link>
        </div>
      </DropdownMenuContent>
    </DropdownMenu>
  );
};

export default Notifications;