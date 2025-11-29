"use client";
import { useState, useEffect } from "react";
import { useSession } from "next-auth/react";
import { io } from "socket.io-client";
import { toast } from "sonner";
import { useLanguage } from '@/contexts/LanguageContext';
import { dashboardTranslations } from '@/lib/dashboard-translations';

const LabTechnicianDashboard = () => {
  const { data: session } = useSession();
  const { language } = useLanguage();
  const t = (key: string) => {
    const keys = key.split('.');
    let value: any = dashboardTranslations[language as keyof typeof dashboardTranslations];
    for (const k of keys) {
      value = value?.[k];
    }
    return value || key;
  };

  useEffect(() => {
    const socket = io();

    const handleConnect = () => {
      console.log("connected to socket");
      if (session?.user?.organizationId) {
        socket.emit("join_org", session.user.organizationId);
      }
    };

    const handleNewLabOrder = (data) => {
      if (session?.user?.role === 'lab_technician') {
        toast.success(t('labTechnicianDashboard.newLabOrderRequest'), {
          description: t('labTechnicianDashboard.newLabOrderDescription').replace('{patientId}', data.labOrder.patientId),
        });
      }
    };

    socket.on("connect", handleConnect);
    socket.on("new_lab_order", handleNewLabOrder);

    return () => {
      socket.off("connect", handleConnect);
      socket.off("new_lab_order", handleNewLabOrder);
      socket.disconnect();
    };
  }, [session, toast]);

  return null; // This component does not render anything
};

export default LabTechnicianDashboard;