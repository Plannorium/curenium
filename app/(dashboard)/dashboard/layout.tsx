"use client";
import { Navbar } from '@/app/(dashboard)/components/Navbar';
import { Sidebar } from '@/app/(dashboard)/components/Sidebar';
import React, { useState } from 'react';
import Chat from '@/app/(dashboard)/components/Chat';
import Alerts from '@/app/(dashboard)/components/Alerts';
import ShiftView from '@/app/(dashboard)/components/ShiftView';


export default function DashboardLayout({ 
  children 
}: { 
  children: React.ReactNode 
}) {
  const [isSidebarOpen, setSidebarOpen] = useState(false);
  const [isCollapsed, setCollapsed] = useState(false);
  const [currentView, setCurrentView] = useState('dashboard');

  const toggleSidebar = () => {
    setSidebarOpen(!isSidebarOpen);
  };

  const toggleCollapse = () => {
    setCollapsed(!isCollapsed);
  };

  const handleViewChange = (view: string) => {
    setCurrentView(view);
  };

  const renderView = () => {
    switch (currentView) {
      case 'chat':
        return <Chat />;
      case 'alerts':
        return <Alerts />;
      case 'shifts':
        return <ShiftView />;
      default:
        return children;
    }
  };

  return (
    <div className="flex h-screen bg-dark-100 dark:bg-dark-900">
      <Sidebar 
        isOpen={isSidebarOpen} 
        isCollapsed={isCollapsed} 
        toggleCollapse={toggleCollapse} 
        currentView={currentView}
        onViewChange={handleViewChange}
      />
      <div className={`flex-1 flex flex-col overflow-hidden transition-all duration-300 ease-in-out ${isCollapsed ? 'lg:ml-20' : 'lg:ml-64'}`}>
        <Navbar toggleSidebar={toggleSidebar} />
        <main className="flex-1 overflow-x-hidden overflow-y-auto bg-dark-100 dark:bg-dark-900 p-6">
          {renderView()}
        </main>
      </div>
    </div>
  );
}