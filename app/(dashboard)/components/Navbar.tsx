'use client';

import React from 'react';
import { useTheme } from '@/components/ThemeProvider';
import {
  SunIcon,
  MoonIcon,
  BellIcon,
  SearchIcon,
  MenuIcon,
  LogOut,
  User,
  CreditCard,
  Settings,
  Users as UsersIcon,
  PlusCircle
} from 'lucide-react';
import { useSession, signOut } from 'next-auth/react';
import {
  DropdownMenu,
  DropdownMenuContent,
  DropdownMenuItem,
  DropdownMenuLabel,
  DropdownMenuSeparator,
  DropdownMenuTrigger,
  DropdownMenuGroup,
} from "@/components/ui/dropdown-menu";
import { Avatar, AvatarFallback, AvatarImage } from "@/components/ui/avatar";
import { Button } from '@/components/ui/button';
import Link from 'next/link';
import { useEffect, useState } from 'react';

interface NavbarProps {
  toggleSidebar: () => void;
}

interface UserData {
  fullName: string;
  email: string;
  image?: string;
}

export const Navbar: React.FC<NavbarProps> = ({ toggleSidebar }) => {
  const { theme, toggleTheme } = useTheme();
  const { data: session } = useSession();
  const [userData, setUserData] = useState<UserData | null>(null);
  const [mounted, setMounted] = useState(false);

  useEffect(() => {
    setMounted(true);
  }, []);

  useEffect(() => {
    const fetchUserData = async () => {
      try {
        const response = await fetch('/api/users/current');
        if (response.ok) {
          const data = (await response.json()) as { user: UserData };
          setUserData(data.user);
        }
      } catch (error) {
        console.error('Error fetching user data:', error);
      }
    };

    if (session) {
      fetchUserData();
    }
  }, [session]);

  return (
    <header className="sticky top-0 z-40 bg-white dark:bg-gray-950 border-b border-gray-200 dark:border-gray-800 py-3 px-6 flex items-center justify-between shadow-sm">
      <div className="flex items-center">
        <Button
          variant="ghost"
          size="icon"
          onClick={toggleSidebar}
          className="mr-4 rounded-lg hover:bg-gray-100 dark:hover:bg-gray-800 lg:hidden"
        >
          <MenuIcon className="h-5 w-5 text-gray-500 dark:text-gray-400" />
        </Button>
        <div className="relative hidden md:flex items-center bg-gray-100 dark:bg-gray-900 border border-transparent rounded-lg px-4 py-2 flex-1 max-w-xs hover:border-gray-300 dark:hover:border-gray-700 focus-within:border-primary focus-within:ring-2 focus-within:ring-primary/20">
          <SearchIcon className="h-4 w-4 text-gray-500 dark:text-gray-400 mr-3" />
          <input
            type="text"
            placeholder="Search..."
            className="bg-transparent border-none focus:outline-none text-gray-900 dark:text-white placeholder:text-gray-500 dark:placeholder:text-gray-400 w-full text-sm font-medium"
          />
        </div>
      </div>

      <div className="flex items-center space-x-2">
        <DropdownMenu>
          <DropdownMenuTrigger asChild>
            <Button
              variant="ghost"
              size="icon"
              className="rounded-lg hover:bg-gray-100 dark:hover:bg-gray-800"
            >
              <PlusCircle className="h-5 w-5 text-gray-500 dark:text-gray-400" />
            </Button>
          </DropdownMenuTrigger>
          <DropdownMenuContent className="w-48 bg-white dark:bg-gray-950 border-gray-200 dark:border-gray-800 shadow-lg" align="end">
            <DropdownMenuItem>New Patient</DropdownMenuItem>
            <DropdownMenuItem>New Appointment</DropdownMenuItem>
            <DropdownMenuItem>New Task</DropdownMenuItem>
          </DropdownMenuContent>
        </DropdownMenu>

        <Button
          variant="ghost"
          size="icon"
          onClick={toggleTheme}
          className="rounded-lg hover:bg-gray-100 dark:hover:bg-gray-800"
        >
          {mounted && theme === 'dark' ? (
            <SunIcon className="h-5 w-5 text-gray-500 dark:text-gray-400" />
          ) : (
            <MoonIcon className="h-5 w-5 text-gray-500 dark:text-gray-400" />
          )}
        </Button>

        <Button
          variant="ghost"
          size="icon"
          className="relative rounded-lg hover:bg-gray-100 dark:hover:bg-gray-800"
        >
          <BellIcon className="h-5 w-5 text-gray-500 dark:text-gray-400" />
          <span className="absolute top-2 right-2 h-2 w-2 bg-red-500 rounded-full"></span>
        </Button>

        <DropdownMenu>
          <DropdownMenuTrigger asChild>
            <Button 
              variant="ghost" 
              className="relative h-10 w-10 rounded-full hover:bg-gray-100 dark:hover:bg-gray-800 p-0"
            >
              <Avatar className="h-9 w-9">
                <AvatarImage 
                  src={userData?.image ?? session?.user?.image ?? ''} 
                  alt={userData?.fullName ?? session?.user?.name ?? session?.user?.email ?? ''} 
                />
                <AvatarFallback className="bg-primary text-white">
                  {userData?.fullName?.[0] || session?.user?.name?.[0] || session?.user?.email?.[0]}
                </AvatarFallback>
              </Avatar>
            </Button>
          </DropdownMenuTrigger>
          <DropdownMenuContent 
            className="w-64 bg-white dark:bg-gray-950 border-gray-200 dark:border-gray-800 shadow-lg" 
            align="end"
          >
            <DropdownMenuLabel className="font-normal p-4">
              <div className="flex items-center space-x-3">
                <Avatar className="h-10 w-10">
                  <AvatarImage 
                    src={userData?.image ?? session?.user?.image ?? ''} 
                  />
                  <AvatarFallback className="bg-primary text-white">
                    {userData?.fullName?.[0] || session?.user?.name?.[0] || session?.user?.email?.[0]}
                  </AvatarFallback>
                </Avatar>
                <div className="flex flex-col space-y-1">
                  <p className="text-sm font-semibold text-gray-900 dark:text-white">
                    {userData?.fullName || session?.user?.name || session?.user?.email}
                  </p>
                  <p className="text-xs text-gray-500 dark:text-gray-400">
                    {userData?.email || session?.user?.email}
                  </p>
                </div>
              </div>
            </DropdownMenuLabel>
            
            <DropdownMenuSeparator className="bg-gray-200 dark:border-gray-800" />
            
            <DropdownMenuGroup className="p-1">
              <DropdownMenuItem asChild>
                <Link 
                  href="/dashboard/settings/account"
                  className="flex items-center px-3 py-2 rounded-lg hover:bg-gray-100 dark:hover:bg-gray-800 cursor-pointer"
                >
                  <User className="h-4 w-4 mr-3 text-gray-500 dark:text-gray-400" />
                  <span>Profile</span>
                </Link>
              </DropdownMenuItem>
              
              <DropdownMenuItem asChild>
                <Link 
                  href="/dashboard/settings/billing"
                  className="flex items-center px-3 py-2 rounded-lg hover:bg-gray-100 dark:hover:bg-gray-800 cursor-pointer"
                >
                  <CreditCard className="h-4 w-4 mr-3 text-gray-500 dark:text-gray-400" />
                  <span>Billing</span>
                </Link>
              </DropdownMenuItem>
              
              <DropdownMenuItem asChild>
                <Link 
                  href="/dashboard/settings"
                  className="flex items-center px-3 py-2 rounded-lg hover:bg-gray-100 dark:hover:bg-gray-800 cursor-pointer"
                >
                  <Settings className="h-4 w-4 mr-3 text-gray-500 dark:text-gray-400" />
                  <span>Settings</span>
                </Link>
              </DropdownMenuItem>
              
              <DropdownMenuItem asChild>
                <Link 
                  href="/dashboard/organization/team"
                  className="flex items-center px-3 py-2 rounded-lg hover:bg-gray-100 dark:hover:bg-gray-800 cursor-pointer"
                >
                  <UsersIcon className="h-4 w-4 mr-3 text-gray-500 dark:text-gray-400" />
                  <span>Team</span>
                </Link>
              </DropdownMenuItem>
            </DropdownMenuGroup>
            
            <DropdownMenuSeparator className="bg-gray-200 dark:border-gray-800" />
            
            <div className="p-1">
              <DropdownMenuItem 
                onClick={() => signOut()}
                className="flex items-center px-3 py-2 rounded-lg hover:bg-red-500/10 text-red-600 dark:text-red-500 cursor-pointer"
              >
                <LogOut className="h-4 w-4 mr-3" />
                <span>Log out</span>
              </DropdownMenuItem>
            </div>
          </DropdownMenuContent>
        </DropdownMenu>
      </div>
    </header>
  );
};