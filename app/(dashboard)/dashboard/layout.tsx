"use client";
import { Navbar } from '@/app/(dashboard)/components/Navbar';
import { Sidebar } from '@/app/(dashboard)/components/Sidebar';
import React, { useState, useRef, Suspense } from 'react';
import Chat from '@/app/(dashboard)/components/Chat';
import Alerts from '@/app/(dashboard)/components/Alerts';
import ShiftView from '@/app/(dashboard)/components/ShiftView';
import { useOnClickOutside } from '@/hooks/useOnClickOutside';
import { Loader } from '@/components/ui/Loader';


export default function DashboardLayout({ 
  children 
}: { 
  children: React.ReactNode 
}) {
  const [isSidebarOpen, setSidebarOpen] = useState(false);
  const [isCollapsed, setCollapsed] = useState(true);
  const [currentView, setCurrentView] = useState('dashboard');
  const sidebarRef = useRef<HTMLDivElement>(null);


  const toggleSidebar = () => {
    setSidebarOpen(!isSidebarOpen);
  };

  const toggleCollapse = () => {
    setCollapsed(!isCollapsed);
  };

  const handleViewChange = (view: string) => {
    setCurrentView(view);
  };

  useOnClickOutside(sidebarRef as React.RefObject<HTMLElement>, () => {
    if (isSidebarOpen) {
      setSidebarOpen(false);
    }
  });

  const views: { [key: string]: React.ReactNode } = {
    chat: <Chat />,
    alerts: <Alerts />,
    shifts: <ShiftView />,
    dashboard: children,
  };

  return (
    <div className="flex h-screen bg-dark-100 dark:bg-dark-900">
      <div ref={sidebarRef}>
       <Suspense fallback={<Loader variant="minimal" />}>
          <Sidebar
            isOpen={isSidebarOpen} 
            isCollapsed={isCollapsed} 
            toggleCollapse={toggleCollapse} 
            toggleSidebar={toggleSidebar}
          />
        </Suspense>
      </div>
      <div className={`flex-1 flex flex-col overflow-hidden transition-all duration-300 ease-in-out ${isCollapsed ? 'lg:ml-20' : 'lg:ml-64'}`}>
        <Navbar toggleSidebar={toggleSidebar} />
        <main className="flex-1 overflow-x-hidden overflow-y-auto bg-dark-100 dark:bg-dark-900 px-2 py-1 md:px-4 md:pl-7 md:py-3">
           <Suspense fallback={<Loader variant="fullscreen" text="Loading Curenium..." />}>
             {views[currentView] || children}
           </Suspense>
         </main>
      </div>
    </div>
  );
}
