"use client";

import React from "react";
import { Avatar, AvatarFallback, AvatarImage } from "@/components/ui/avatar";
import { formatDistanceToNow } from "date-fns";
import Link from "next/link";

export interface Notification {
  id: string;
  type: "new_message" | "system_alert" | "new_patient";
  title: string;
  message: string;
  createdAt: string;
  read: boolean;
  link?: string;
  image?: string;
  sender?: {
    _id: string;
    fullName: string;
    image?: string;
  };
}

interface NotificationItemProps {
  notification: Notification;
  onClick: (id: string) => void;
}

const NotificationItem: React.FC<NotificationItemProps> = ({ notification, onClick }) => {
  console.log("Rendering NotificationItem:", notification);

  const content = (
    <div
      className={`p-3 flex items-start gap-3 border-b border-gray-200 dark:border-gray-800 last:border-b-0 hover:bg-gray-50 dark:hover:bg-gray-900 cursor-pointer ${
        notification.read ? "" : "bg-sky-500/10"
      }`}>
      <Avatar className="h-9 w-9">
        <AvatarImage src={notification.image || notification.sender?.image} />
        <AvatarFallback>{notification.sender?.fullName?.[0] || "S"}</AvatarFallback>
      </Avatar>
      <div className="flex-1">
        <p className="font-semibold text-sm text-gray-900 dark:text-white">
          {notification.title}
        </p>
        <p className="text-sm text-gray-500 dark:text-gray-400">
          {notification.message}
        </p>
        <p className="text-xs text-gray-400 dark:text-gray-500 mt-1">
          {formatDistanceToNow(new Date(notification.createdAt), { addSuffix: true })}
        </p>
      </div>
    </div>
  );

  if (notification.link) {
    return <Link href={notification.link} onClick={() => onClick(notification.id)}>{content}</Link>;
  }

  return <div onClick={() => onClick(notification.id)}>{content}</div>;
};

export default NotificationItem;