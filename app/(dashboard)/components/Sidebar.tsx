import React, {useState, useEffect} from 'react';
import Link from 'next/link';
import Image from 'next/image';
import { usePathname, useSearchParams } from 'next/navigation';
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
  Briefcase,
  PencilIcon
} from 'lucide-react';
import { useSession } from 'next-auth/react';
import { useRole } from '@/components/auth/RoleProvider';
import { Avatar, AvatarImage, AvatarFallback } from '@/components/ui/avatar';

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

interface Channel {
  _id: string;
  name: string;
}

interface User {
  _id: string;
  fullName: string;
  image?: string;
}

interface DirectMessage {
  _id: string;
  text: string;
  sender: User;
  receiver: User;
}

export const Sidebar: React.FC<SidebarProps> = ({
  isOpen,
  isCollapsed,
  toggleCollapse,
  toggleSidebar,
}) => {
  const { data: session } = useSession();
  const { role } = useRole();
  const pathname = usePathname();
  const searchParams = useSearchParams();
  const activeRoom = searchParams.get('room');
  const [channels, setChannels] = useState<Channel[]>([]);
  const [directMessages, setDirectMessages] = useState<DirectMessage[]>([]);
  const [currentUser, setCurrentUser] = useState<User | null>(null);

  const getInitials = (name: string | undefined) => {
    if (!name) return '';
    const names = name.split(' ').filter(Boolean);
    if (names.length === 0) return '';
    let initials = names[0][0];
    if (names.length > 1) {
      initials += names[names.length - 1][0];
    }
    return initials.toUpperCase();
  };

  useEffect(() => {
    const fetchChannels = async () => {
      if (session?.user?.id) {
        try {
          const res = await fetch(`/api/users/${session.user.id}/channels`);
          if (res.ok) {
            const data = await res.json() as { channels: Channel[] };
            setChannels(data.channels);
          }
        } catch (error) {
          console.error('Failed to fetch channels', error);
        }
      }
    };

    const fetchDirectMessages = async () => {
      if (session?.user?.id) {
        try {
          const res = await fetch(`/api/users/${session.user.id}/dms`);
          if (res.ok) {
            const data = await res.json() as { dms: DirectMessage[] };
            setDirectMessages(data.dms);
          }
        } catch (error) {
          console.error('Failed to fetch direct messages', error);
        }
      }
    };

    fetchChannels();
    fetchDirectMessages();

    const fetchCurrentUser = async () => {
      if (session?.user?.id) {
        try {
          const res = await fetch(`/api/users/current`);
          if (res.ok) {
            const data: { user: User } = await res.json();
            setCurrentUser(data.user as User);
            console.log(data, "c-user")
          }
        } catch (error) {
          console.error('Failed to fetch current user', error);
        }
      }
    };

    fetchCurrentUser();
  }, [session]);

  const navItems: NavItem[] = [
    { name: 'Home', icon: <HomeIcon size={20} />, path: '/dashboard' },
    { name: 'Chat', icon: <MessageSquareIcon size={20} />, path: '/dashboard/chat' },
    { name: 'Alerts', icon: <BellIcon size={20} />, path: '/dashboard/alerts' },
    { name: 'Shifts', icon: <CalendarIcon size={20} />, path: '/dashboard/shifts' },
    { name: 'EHR', icon: <UsersIcon size={20} />, path: '/dashboard/ehr/patients' },
  ];

  if (role === 'admin') {
    navItems.push({ name: 'Admin', icon: <Briefcase size={20} />, path: '/dashboard/admin' });
  }

  let teamsContent = null;

  if (pathname.startsWith('/dashboard/ehr')) {
    teamsContent = (
      <>
        <h3 className={`px-3 py-2 text-xs font-bold text-gray-400 dark:text-gray-500 uppercase tracking-wider ${isCollapsed ? 'lg:hidden' : ''}`}>
          EHR Menu
        </h3>
        <div className="mt-3 space-y-1">
          <Link
            href="/dashboard/ehr/patients"
            className={`group flex items-center w-full px-3 py-2.5 text-sm font-medium rounded-lg hover:bg-gray-100 dark:hover:bg-gray-800 transition-all duration-200 ${isCollapsed ? 'lg:justify-center' : ''}`}
          >
            <span className="text-gray-500 dark:text-gray-400 group-hover:text-gray-900 dark:group-hover:text-white truncate whitespace-nowrap transition-colors duration-200">
              Patients
            </span>
          </Link>
          {/* Additional role-based navigation items will go here */}
        </div>
      </>
    );
  } else if (pathname.startsWith('/dashboard/chat')) {
    teamsContent = (
      <>
        <h3 className={`px-4 pt-4 pb-2 text-xs font-bold text-gray-400 dark:text-gray-500 uppercase tracking-wider ${isCollapsed ? 'lg:text-center' : ''}`}>
          Channels
        </h3>
        <div className="mt-1 space-y-1 px-2">
          <Link
            key="general"
            href={`/dashboard/chat?room=general`}
            className={`group flex items-center w-full px-3 py-2.5 text-sm font-medium rounded-lg transition-all duration-200 ${
              activeRoom === 'general'
                ? 'bg-primary/10 text-primary'
                : 'text-gray-500 dark:text-gray-400 hover:bg-gray-100 dark:hover:bg-gray-800'
            } ${isCollapsed ? 'lg:justify-center' : ''}`}
          >
            <span className={`font-bold ${isCollapsed ? 'lg:hidden' : ''}`}>#</span>
            <span className={`ml-2 text-gray-500 dark:text-gray-400 truncate whitespace-nowrap ${isCollapsed ? 'lg:hidden' : ''}`}>General</span>
          </Link>
          {channels.map(channel => (
            <Link
              key={channel._id}
              href={`/dashboard/chat?room=${channel.name.toLowerCase().replace(/\s/g, '')}`}
              className={`group flex items-center w-full px-3 py-2.5 text-sm font-medium rounded-lg transition-all duration-200 ${
                activeRoom === `${channel.name.toLowerCase().replace(/\s/g, '')}`
                  ? 'bg-primary/10 text-primary'
                  : 'text-gray-500 dark:text-gray-400 hover:bg-gray-100 dark:hover:bg-gray-800'
              } ${isCollapsed ? 'lg:justify-center' : ''}`}
            >
              <span className={`font-bold ${isCollapsed ? 'lg:hidden' : ''}`}>#</span>
              <span className={`ml-2 text-gray-500 dark:text-gray-400 truncate whitespace-nowrap ${isCollapsed ? 'lg:hidden' : ''}`}>{channel.name}</span>
            </Link>
          ))}
        </div>
        <h3 className={`px-4 pt-4 pb-2 text-xs font-bold text-gray-400 dark:text-gray-500 uppercase tracking-wider ${isCollapsed ? 'lg:text-center' : ''}`}>
          Direct Messages
        </h3>
        <div className="mt-1 space-y-1 px-2">
          <Link
            key="notes-to-self"
            href={`/dashboard/chat?room=${session?.user?.id}-${session?.user?.id}`}
            className={`group flex items-center w-full px-3 py-2.5 text-sm font-medium rounded-lg transition-all duration-200 ${
              activeRoom === `${session?.user?.id}-${session?.user?.id}`
                ? 'bg-primary/10'
                : 'hover:bg-gray-100 dark:hover:bg-gray-800'
            } ${isCollapsed ? 'lg:justify-center' : ''}`}
          >
            <div className="relative">
              <Avatar className="w-8 h-8">
                <AvatarImage src={currentUser?.image || undefined} alt="Your avatar" />
                <AvatarFallback>{getInitials(currentUser?.fullName)}</AvatarFallback>
              </Avatar>
              <span className="absolute bottom-0 right-0 block h-2 w-2 rounded-full bg-green-500 ring-2 ring-white dark:ring-gray-950"></span>
            </div>
            <div className={`ml-3 overflow-hidden ${isCollapsed ? 'lg:hidden' : ''}`}>
              <p className={`font-semibold truncate ${activeRoom === `${session?.user?.id}-${session?.user?.id}` ? 'text-primary' : 'text-gray-700 dark:text-gray-200'}`}>Notes to self</p>
              <p className="text-xs text-gray-500 dark:text-gray-400 truncate">Personal space</p>
            </div>
          </Link>
          {directMessages.map(dm => {
            const otherUser = dm.sender._id === session?.user?.id ? dm.receiver : dm.sender;
            const isActive = activeRoom === otherUser._id;
            return (
              <Link
                key={dm._id}
                href={`/dashboard/chat?room=${otherUser._id}`}
                className={`group flex items-center w-full px-3 py-2.5 text-sm font-medium rounded-lg transition-all duration-200 ${
                  isActive
                    ? 'bg-primary/10'
                    : 'hover:bg-gray-100 dark:hover:bg-gray-800'
                } ${isCollapsed ? 'lg:justify-center' : ''}`}
              >
                <div className="relative">
                  <Avatar className="w-8 h-8">
                    <AvatarImage src={otherUser.image || undefined} alt={otherUser.fullName} />
                    <AvatarFallback>{getInitials(otherUser.fullName)}</AvatarFallback>
                  </Avatar>
                  <span className="absolute bottom-0 right-0 block h-2 w-2 rounded-full bg-green-500 ring-2 ring-white dark:ring-gray-950"></span>
                </div>
                <div className={`ml-3 overflow-hidden ${isCollapsed ? 'lg:hidden' : ''}`}>
                  <p className={`font-semibold truncate ${isActive ? 'text-primary' : 'text-gray-700 dark:text-gray-200'}`}>{otherUser.fullName}</p>
                  <p className="text-xs text-gray-500 dark:text-gray-400 truncate">{dm.text}</p>
                </div>
              </Link>
            );
          })}
        </div>
      </>
    );
  } else {
    const teams = [
      { name: 'Clinical Team', color: 'bg-blue-500' },
      { name: 'Cardiology', color: 'bg-red-500' },
      { name: 'Pediatrics', color: 'bg-purple-500' },
    ];
    teamsContent = (
      <>
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
      </>
    );
  }

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

        <div className={`mt-8 px-2 lg:hidden`}>
          {teamsContent}
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