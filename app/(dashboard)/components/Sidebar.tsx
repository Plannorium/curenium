import React from 'react';
import Link from 'next/link';
import Image from 'next/image';
import { HomeIcon, MessageSquareIcon, BellIcon, CalendarIcon, UsersIcon, SettingsIcon, HeartPulseIcon, ClipboardListIcon, LogOutIcon, ChevronLeftIcon, XIcon } from 'lucide-react';
import { useRole } from '@/components/auth/RoleProvider';

interface SidebarProps {
  isOpen: boolean;
  isCollapsed: boolean;
  toggleCollapse: () => void;
  toggleSidebar: () => void;
  currentView: string;
  onViewChange: (view: string) => void;
}

interface NavItem {
  name: string;
  icon: React.ReactNode;
  path?: string;
  view?: string;
}

export const Sidebar: React.FC<SidebarProps> = ({
  isOpen,
  isCollapsed,
  toggleCollapse,
  toggleSidebar,
  currentView,
  onViewChange
}) => {
  const { role } = useRole();

  const navItems: NavItem[] = [{
    name: 'Home',
    icon: <HomeIcon size={20} />,
    path: '/dashboard'
  }, {
    name: 'Chat',
    icon: <MessageSquareIcon size={20} />,
    view: 'chat'
  }, {
    name: 'Alerts',
    icon: <BellIcon size={20} />,
    view: 'alerts'
  }, {
    name: 'Shifts & Notes',
    icon: <CalendarIcon size={20} />,
    view: 'shifts'
  }];

  if (role === 'admin') {
    navItems.push({
      name: 'Admin',
      icon: <UsersIcon size={20} />,
      view: 'admin'
    });
  }

  const channels = [{
    name: 'Emergency Ward',
    icon: <HeartPulseIcon size={16} />,
    color: 'text-red-500'
  }, {
    name: 'Cardiology',
    icon: <HeartPulseIcon size={16} />,
    color: 'text-blue-500'
  }, {
    name: 'Pediatrics',
    icon: <HeartPulseIcon size={16} />,
    color: 'text-purple-500'
  }, {
    name: 'General',
    icon: <ClipboardListIcon size={16} />,
    color: 'text-green-500'
  }];

  return (
    <aside 
      className={`fixed inset-y-0 left-0 z-50 backdrop-blur-xl bg-background/95 border-r border-border/50 shadow-2xl transition-all duration-300 ease-in-out flex flex-col
      ${isCollapsed ? 'lg:w-20' : 'lg:w-64'}
      ${isOpen ? 'translate-x-0 w-64' : '-translate-x-full'} lg:translate-x-0
    `}>
      {/* Background gradient overlay */}
      <div className="absolute inset-0 bg-gradient-to-b from-primary/5 via-transparent to-accent/5 pointer-events-none"></div>
      
      <div className="relative flex-1 overflow-y-auto overflow-x-hidden p-4">
        {/* Header with Logo and Collapse Button */}
        <div className={`mb-8 flex items-center ${isCollapsed ? 'lg:justify-center' : 'justify-between'}`}>
          <div className="flex items-center">
            <Image
              src="/curenium-logo-bg-none.png"
              alt="Curenium Logo"
              width={32}
              height={32}
              className={`transition-all duration-300 h-8 ${isCollapsed ? 'w-8' : 'w-auto'}`}
            />
            {!isCollapsed && (
              <div className="ml-2 h-1 w-4 bg-gradient-to-r from-primary to-primary/70 rounded-full shadow-sm"></div>
            )}
          </div>
          <button 
            onClick={toggleCollapse} 
            className="hidden lg:flex items-center justify-center p-2 rounded-xl hover:bg-accent/50 backdrop-blur-sm transition-all duration-200 group"
          >
            <ChevronLeftIcon 
              size={18} 
              className={`text-muted-foreground group-hover:text-foreground transition-all duration-300 ${isCollapsed ? 'rotate-180' : ''}`} 
            />
          </button>
          <button 
            onClick={toggleSidebar} 
            className="lg:hidden items-center justify-center p-2 rounded-xl hover:bg-accent/50 backdrop-blur-sm transition-all duration-200 group"
          >
            <XIcon 
              size={18} 
              className={`text-muted-foreground group-hover:text-foreground transition-all duration-300`} 
            />
          </button>
        </div>
        
        {/* Main Navigation */}
        <nav className="space-y-2 px-2">
          {navItems.map(item => {
            const isActive = currentView === item.view;
            
            if (item.path) {
              return (
                <Link 
                  key={item.name} 
                  href={item.path} 
                  className={`group flex items-center px-4 py-3 text-sm font-medium rounded-xl transition-all duration-200 hover:scale-[1.02] ${isCollapsed ? 'lg:justify-center' : ''} ${
                    isActive 
                      ? 'bg-primary/10 text-primary border border-primary/20 shadow-lg backdrop-blur-sm' 
                      : 'text-muted-foreground hover:bg-accent/50 hover:text-foreground backdrop-blur-sm'
                  }`}
                >
                  <span className={`transition-colors duration-200 ${
                    isActive 
                      ? 'text-primary' 
                      : 'text-muted-foreground group-hover:text-primary'
                  }`}>
                    {item.icon}
                  </span>
                  <span className={`ml-3 whitespace-nowrap transition-all duration-200 ${isCollapsed ? 'lg:hidden' : ''}`}>
                    {item.name}
                  </span>
                  {isActive && !isCollapsed && (
                    <div className="ml-auto h-2 w-2 bg-primary rounded-full shadow-sm"></div>
                  )}
                </Link>
              );
            }
            
            return (
              <button 
                key={item.name} 
                onClick={() => item.view && onViewChange(item.view)}
                className={`group flex items-center w-full px-4 py-3 text-sm font-medium rounded-xl transition-all duration-200 hover:scale-[1.02] ${isCollapsed ? 'lg:justify-center' : ''} ${
                  isActive 
                    ? 'bg-primary/10 text-primary border border-primary/20 shadow-lg backdrop-blur-sm' 
                    : 'text-muted-foreground hover:bg-accent/50 hover:text-foreground backdrop-blur-sm'
                }`}
              >
                <span className={`transition-colors duration-200 ${
                  isActive 
                    ? 'text-primary' 
                    : 'text-muted-foreground group-hover:text-primary'
                }`}>
                  {item.icon}
                </span>
                <span className={`ml-3 whitespace-nowrap transition-all duration-200 ${isCollapsed ? 'lg:hidden' : ''}`}>
                  {item.name}
                </span>
                {isActive && !isCollapsed && (
                  <div className="ml-auto h-2 w-2 bg-primary rounded-full shadow-sm animate-pulse"></div>
                )}
              </button>
            );
          })}
        </nav>

        {/* Channels Section */}
        <div className={`mt-8 px-2`}>
          <h3 className={`px-3 py-2 text-xs font-bold text-muted-foreground uppercase tracking-wider ${isCollapsed ? 'lg:hidden' : ''}`}>
            Channels
          </h3>
          <div className="mt-3 space-y-1">
            {channels.map(channel => (
              <button 
                key={channel.name} 
                className={`group flex items-center w-full px-3 py-2.5 text-sm font-medium rounded-lg hover:bg-accent/50 backdrop-blur-sm transition-all duration-200 hover:scale-[1.01] ${isCollapsed ? 'lg:justify-center' : ''}`}
              >
                <span className={`${channel.color} transition-colors duration-200 group-hover:scale-110 ${isCollapsed ? '' : 'mr-3'}`}>
                  {channel.icon}
                </span>
                <span className={`text-muted-foreground group-hover:text-foreground truncate whitespace-nowrap transition-colors duration-200 ${isCollapsed ? 'lg:hidden' : ''}`}>
                  {channel.name}
                </span>
                {!isCollapsed && (
                  <div className="ml-auto flex items-center">
                    <div className={`h-1.5 w-1.5 ${channel.color.replace('text-', 'bg-')} rounded-full opacity-60 group-hover:opacity-100 transition-opacity`}></div>
                  </div>
                )}
              </button>
            ))}
          </div>
        </div>
      </div>

      {/* Footer Actions */}
      <div className="relative p-4 border-t border-border/30 backdrop-blur-sm">
        <div className="space-y-1">
          <Link 
            href="/settings" 
            className={`group flex items-center px-4 py-3 text-sm font-medium text-muted-foreground rounded-xl hover:bg-accent/50 hover:text-foreground backdrop-blur-sm transition-all duration-200 hover:scale-[1.02] ${isCollapsed ? 'lg:justify-center' : ''}`}
          >
            <SettingsIcon size={18} className="text-muted-foreground group-hover:text-foreground transition-colors duration-200" />
            <span className={`ml-3 whitespace-nowrap transition-all duration-200 ${isCollapsed ? 'lg:hidden' : ''}`}>
              Settings
            </span>
          </Link>
          
          <button 
            className={`group flex w-full items-center px-4 py-3 text-sm font-medium text-muted-foreground rounded-xl hover:bg-red-500/10 hover:text-red-500 backdrop-blur-sm transition-all duration-200 hover:scale-[1.02] ${isCollapsed ? 'lg:justify-center' : ''}`}
          >
            <LogOutIcon size={18} className="text-muted-foreground group-hover:text-red-500 transition-colors duration-200" />
            <span className={`ml-3 whitespace-nowrap transition-all duration-200 ${isCollapsed ? 'lg:hidden' : ''}`}>
              Logout
            </span>
          </button>
        </div>
      </div>
    </aside>
  );
};