"use client";
import { useState, useEffect } from "react";
import { useSession } from "next-auth/react";
import { io } from "socket.io-client";
import { toast } from "sonner";

const LabTechnicianDashboard = () => {
  const { data: session } = useSession();

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
        toast.success("New Lab Order Request", {
          description: `A new lab order has been created for patient ${data.labOrder.patientId}`,
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