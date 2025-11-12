import React from 'react';
import Link from 'next/link';
import Image from 'next/image';
import { usePathname } from 'next/navigation';
import {
  HomeIcon,
  MessageSquareIcon,
  BellIcon,
  CalendarIcon,
  UsersIcon,
  SettingsIcon,
  LogOutIcon,
  ChevronLeftIcon,
  XIcon,
  Briefcase
} from 'lucide-react';
import { useRole } from '@/components/auth/RoleProvider';

interface SidebarProps {
  isOpen: boolean;
  isCollapsed: boolean;
  toggleCollapse: () => void;
  toggleSidebar: () => void;
}

interface NavItem {
  name: string;
  icon: React.ReactNode;
  path: string;
}

export const Sidebar: React.FC<SidebarProps> = ({
  isOpen,
  isCollapsed,
  toggleCollapse,
  toggleSidebar,
}) => {
  const { role } = useRole();
  const pathname = usePathname();

  const navItems: NavItem[] = [
    { name: 'Home', icon: <HomeIcon size={20} />, path: '/dashboard' },
    { name: 'Chat', icon: <MessageSquareIcon size={20} />, path: '/dashboard/chat' },
    { name: 'Alerts', icon: <BellIcon size={20} />, path: '/dashboard/alerts' },
    { name: 'Shifts', icon: <CalendarIcon size={20} />, path: '/dashboard/shifts' },
    { name: 'Patients', icon: <UsersIcon size={20} />, path: '/dashboard/patients' },
  ];

  if (role === 'admin') {
    navItems.push({ name: 'Admin', icon: <Briefcase size={20} />, path: '/dashboard/admin' });
  }

  const teams = [
    { name: 'Clinical Team', color: 'bg-blue-500' },
    { name: 'Cardiology', color: 'bg-red-500' },
    { name: 'Pediatrics', color: 'bg-purple-500' },
  ];

  return (
    <aside 
      className={`fixed inset-y-0 left-0 z-50 bg-white dark:bg-gray-950 border-r border-gray-200 dark:border-gray-800 shadow-lg transition-all duration-300 ease-in-out flex flex-col
      ${isCollapsed ? 'lg:w-24' : 'lg:w-64'}
      ${isOpen ? 'translate-x-0 w-64' : '-translate-x-full'} lg:translate-x-0
    `}>
      <div className="flex-1 overflow-y-auto overflow-x-hidden p-4">
        <div className={`mb-8 flex items-center ${isCollapsed ? 'lg:justify-center' : 'justify-between'}`}>
          <div className="flex items-center">
            <Image
              src="/curenium-logo-bg-none.png"
              alt="Curenium Logo"
              width={32}
              height={32}
              className={`transition-all duration-300 h-8 ${isCollapsed ? 'w-8' : 'w-auto'}`}
            />
          </div>
          <button 
            onClick={toggleCollapse} 
            className="hidden lg:flex items-center justify-center p-2 rounded-lg hover:bg-gray-100 dark:hover:bg-gray-800"
          >
            <ChevronLeftIcon 
              size={18} 
              className={`text-gray-500 dark:text-gray-400 transition-all duration-300 ${isCollapsed ? 'rotate-180' : ''}`} 
            />
          </button>
          <button 
            onClick={toggleSidebar} 
            className="lg:hidden items-center justify-center p-2 rounded-lg hover:bg-gray-100 dark:hover:bg-gray-800"
          >
            <XIcon 
              size={18} 
              className={`text-gray-500 dark:text-gray-400 transition-all duration-300`} 
            />
          </button>
        </div>
        
        <nav className="space-y-2 px-2">
          {navItems.map(item => {
            const isActive = pathname === item.path;
            return (
              <Link
                key={item.name} 
                href={item.path}
                className={`group flex items-center px-4 py-3 text-sm font-medium rounded-lg transition-all duration-200 ${isCollapsed ? 'lg:justify-center' : ''} ${
                  isActive 
                    ? 'bg-primary/10 text-primary' 
                    : 'text-gray-500 dark:text-gray-400 hover:bg-gray-100 dark:hover:bg-gray-800 hover:text-gray-900 dark:hover:text-white'
                }`}
              >
                <span className={`${isActive ? 'text-primary' : 'text-gray-400 dark:text-gray-500 group-hover:text-gray-500 dark:group-hover:text-gray-400'}`}>
                  {item.icon}
                </span>
                <span className={`ml-3 whitespace-nowrap transition-all duration-200 ${isCollapsed ? 'lg:hidden' : ''}`}>
                  {item.name}
                </span>
              </Link>
            );
          })}
        </nav>

        <div className={`mt-8 px-2`}>
          <h3 className={`px-3 py-2 text-xs font-bold text-gray-400 dark:text-gray-500 uppercase tracking-wider ${isCollapsed ? 'lg:hidden' : ''}`}>
            Teams
          </h3>
          <div className="mt-3 space-y-1">
            {teams.map(team => (
              <button 
                key={team.name} 
                className={`group flex items-center w-full px-3 py-2.5 text-sm font-medium rounded-lg hover:bg-gray-100 dark:hover:bg-gray-800 transition-all duration-200 ${isCollapsed ? 'lg:justify-center' : ''}`}
              >
                <span className={`w-2 h-2 rounded-full ${team.color} ${isCollapsed ? '' : 'mr-3'}`}></span>
                <span className={`text-gray-500 dark:text-gray-400 group-hover:text-gray-900 dark:group-hover:text-white truncate whitespace-nowrap transition-colors duration-200 ${isCollapsed ? 'lg:hidden' : ''}`}>
                  {team.name}
                </span>
              </button>
            ))}
          </div>
        </div>
      </div>

      <div className="p-4 border-t border-gray-200 dark:border-gray-800">
        <div className="space-y-1">
          <Link 
            href="/dashboard/settings" 
            className={`group flex items-center px-4 py-3 text-sm font-medium text-gray-500 dark:text-gray-400 rounded-lg hover:bg-gray-100 dark:hover:bg-gray-800 hover:text-gray-900 dark:hover:text-white transition-all duration-200 ${isCollapsed ? 'lg:justify-center' : ''}`}
          >
            <SettingsIcon size={18} className="text-gray-400 dark:text-gray-500 group-hover:text-gray-500 dark:group-hover:text-gray-400" />
            <span className={`ml-3 whitespace-nowrap transition-all duration-200 ${isCollapsed ? 'lg:hidden' : ''}`}>
              Settings
            </span>
          </Link>
          
          <button 
            className={`group flex w-full items-center px-4 py-3 text-sm font-medium text-gray-500 dark:text-gray-400 rounded-lg hover:bg-red-500/10 hover:text-red-500 transition-all duration-200 ${isCollapsed ? 'lg:justify-center' : ''}`}
          >
            <LogOutIcon size={18} className="text-gray-400 dark:text-gray-500 group-hover:text-red-500" />
            <span className={`ml-3 whitespace-nowrap transition-all duration-200 ${isCollapsed ? 'lg:hidden' : ''}`}>
              Logout
            </span>
          </button>
        </div>
      </div>
    </aside>
  );
};