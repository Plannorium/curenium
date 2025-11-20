'use client';

import { SessionProvider, useSession } from "next-auth/react"
import { ChatProvider } from '@/contexts/ChatContext';
import LabTechnicianDashboard from "./components/lab/LabTechnicianDashboard";

const ConditionalLabDashboard = () => {
    const { data: session } = useSession();

    if (session?.user?.role === 'lab_technician') {
        return <LabTechnicianDashboard />;
    }

    return null;
}

export default function DashboardLayout({ children }: { children: React.ReactNode }) {
    return (
        <SessionProvider>
            <ChatProvider>
                {children}
                <ConditionalLabDashboard />
            </ChatProvider>
        </SessionProvider>
    )
}