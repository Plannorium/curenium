"use client";
import Alerts from '../../components/Alerts';

export default function AlertsPage() {
  return <Alerts />;
}
import { SendAlertModal } from "@/app/(dashboard)/components/SendAlertModal";
import { AlertDetailsModal } from "@/app/(dashboard)/components/AlertDetailsModal";

interface Alert {
  _id: string;
}