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
  Users
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
    <header className="relative backdrop-blur-xl bg-background/95 border-b border-border/50 py-4 px-6 flex items-center justify-between shadow-lg">
      {/* Subtle gradient overlay */}
      <div className="absolute inset-0 bg-gradient-to-r from-primary/5 via-transparent to-accent/5 pointer-events-none"></div>
      
      <div className="relative flex items-center">
        <Button
          variant="ghost"
          size="sm"
          onClick={toggleSidebar}
          className="mr-4 p-2 rounded-lg hover:bg-accent/50 lg:hidden transition-all duration-200 backdrop-blur-sm"
        >
          <MenuIcon className="h-5 w-5 text-muted-foreground hover:text-foreground transition-colors" />
        </Button>
        <div className="flex items-center group">
          <span className="text-xl font-bold text-foreground tracking-tight">Curenium</span>
          <div className="h-1.5 w-6 bg-gradient-to-r from-primary to-primary/70 ml-2 rounded-full shadow-sm group-hover:shadow-primary/25 transition-all duration-300"></div>
        </div>
      </div>

      {/* Search Bar */}
      <div className="relative hidden md:flex items-center backdrop-blur-sm bg-background/50 border border-border/60 rounded-xl px-4 py-2.5 flex-1 max-w-lg mx-6 hover:border-border transition-all duration-200 focus-within:border-primary/50 focus-within:ring-2 focus-within:ring-primary/10">
        <SearchIcon className="h-4 w-4 text-muted-foreground mr-3 transition-colors" />
        <input
          type="text"
          placeholder="Search..."
          className="bg-transparent border-none focus:outline-none text-foreground placeholder:text-muted-foreground w-full text-sm font-medium"
        />
      </div>

      {/* Right Side Actions */}
      <div className="relative flex items-center space-x-2">
        {/* Theme Toggle */}
        <Button
          variant="ghost"
          size="sm"
          onClick={toggleTheme}
          className="p-2.5 rounded-xl hover:bg-accent/50 transition-all duration-200 backdrop-blur-sm group"
        >
          {theme === 'dark' ? (
            <SunIcon className="h-5 w-5 text-muted-foreground group-hover:text-amber-500 transition-colors duration-200" />
          ) : (
            <MoonIcon className="h-5 w-5 text-muted-foreground group-hover:text-blue-500 transition-colors duration-200" />
          )}
        </Button>

        {/* Notifications */}
        <Button
          variant="ghost"
          size="sm"
          className="relative p-2.5 rounded-xl hover:bg-accent/50 transition-all duration-200 backdrop-blur-sm group"
        >
          <BellIcon className="h-5 w-5 text-muted-foreground group-hover:text-foreground transition-colors duration-200" />
          <span className="absolute top-1.5 right-1.5 h-2.5 w-2.5 bg-red-500 rounded-full shadow-lg animate-pulse">
            <span className="absolute inset-0 h-2.5 w-2.5 bg-red-500 rounded-full animate-ping opacity-75"></span>
          </span>
        </Button>

        {/* User Menu */}
        <DropdownMenu>
          <DropdownMenuTrigger asChild>
            <Button 
              variant="ghost" 
              className="relative h-10 w-10 rounded-full hover:bg-accent/50 transition-all duration-200 backdrop-blur-sm ring-2 ring-transparent hover:ring-border/50"
            >
              <Avatar className="h-9 w-9 ring-2 ring-border/20 transition-all duration-200 hover:ring-primary/30">
                <AvatarImage 
                  src={userData?.image ?? session?.user?.image ?? ''} 
                  alt={userData?.fullName ?? session?.user?.name ?? session?.user?.email ?? ''} 
                  className="object-cover"
                />
                <AvatarFallback className="bg-primary/10 text-primary font-semibold text-sm border border-primary/20">
                  {userData?.fullName?.[0] || session?.user?.name?.[0] || session?.user?.email?.[0]}
                </AvatarFallback>
              </Avatar>
            </Button>
          </DropdownMenuTrigger>
          <DropdownMenuContent 
            className="w-64 backdrop-blur-xl bg-popover/95 border-border/50 shadow-2xl" 
            align="end" 
            forceMount
          >
            {/* User Info Header */}
            <DropdownMenuLabel className="font-normal p-4">
              <div className="flex items-center space-x-3">
                <Avatar className="h-10 w-10 ring-2 ring-border/20">
                  <AvatarImage 
                    src={userData?.image ?? session?.user?.image ?? ''} 
                    className="object-cover"
                  />
                  <AvatarFallback className="bg-primary/10 text-primary font-semibold">
                    {userData?.fullName?.[0] || session?.user?.name?.[0] || session?.user?.email?.[0]}
                  </AvatarFallback>
                </Avatar>
                <div className="flex flex-col space-y-1 min-w-0">
                  <p className="text-sm font-semibold leading-none text-foreground truncate">
                    {userData?.fullName || session?.user?.name || session?.user?.email}
                  </p>
                  {session?.user?.name && (
                    <p className="text-xs leading-none text-muted-foreground truncate">
                      {userData?.email || session?.user?.email}
                    </p>
                  )}
                  <div className="inline-flex items-center px-2 py-0.5 rounded-full text-xs font-medium bg-primary/10 text-primary border border-primary/20 w-fit">
                    Online
                  </div>
                </div>
              </div>
            </DropdownMenuLabel>
            
            <DropdownMenuSeparator className="bg-border/50" />
            
            <DropdownMenuGroup className="p-1">
              <DropdownMenuItem asChild>
                <Link 
                  href="/dashboard/settings/account"
                  className="flex items-center px-3 py-2.5 rounded-lg hover:bg-accent/50 transition-all duration-200 cursor-pointer group"
                >
                  <div className="p-1.5 bg-blue-500/10 rounded-md mr-3 group-hover:bg-blue-500/20 transition-colors">
                    <User className="h-4 w-4 text-blue-600 dark:text-blue-500" />
                  </div>
                  <span className="font-medium">Profile</span>
                </Link>
              </DropdownMenuItem>
              
              <DropdownMenuItem asChild>
                <Link 
                  href="/dashboard/settings/billing"
                  className="flex items-center px-3 py-2.5 rounded-lg hover:bg-accent/50 transition-all duration-200 cursor-pointer group"
                >
                  <div className="p-1.5 bg-green-500/10 rounded-md mr-3 group-hover:bg-green-500/20 transition-colors">
                    <CreditCard className="h-4 w-4 text-green-600 dark:text-green-500" />
                  </div>
                  <span className="font-medium">Billing</span>
                </Link>
              </DropdownMenuItem>
              
              <DropdownMenuItem asChild>
                <Link 
                  href="/dashboard/settings"
                  className="flex items-center px-3 py-2.5 rounded-lg hover:bg-accent/50 transition-all duration-200 cursor-pointer group"
                >
                  <div className="p-1.5 bg-purple-500/10 rounded-md mr-3 group-hover:bg-purple-500/20 transition-colors">
                    <Settings className="h-4 w-4 text-purple-600 dark:text-purple-500" />
                  </div>
                  <span className="font-medium">Settings</span>
                </Link>
              </DropdownMenuItem>
              
              <DropdownMenuItem asChild>
                <Link 
                  href="/dashboard/organization/team"
                  className="flex items-center px-3 py-2.5 rounded-lg hover:bg-accent/50 transition-all duration-200 cursor-pointer group"
                >
                  <div className="p-1.5 bg-amber-500/10 rounded-md mr-3 group-hover:bg-amber-500/20 transition-colors">
                    <Users className="h-4 w-4 text-amber-600 dark:text-amber-500" />
                  </div>
                  <span className="font-medium">Team</span>
                </Link>
              </DropdownMenuItem>
            </DropdownMenuGroup>
            
            <DropdownMenuSeparator className="bg-border/50" />
            
            <div className="p-1">
              <DropdownMenuItem 
                onClick={() => signOut()}
                className="flex items-center px-3 py-2.5 rounded-lg hover:bg-red-500/10 transition-all duration-200 cursor-pointer group text-red-600 dark:text-red-500"
              >
                <div className="p-1.5 bg-red-500/10 rounded-md mr-3 group-hover:bg-red-500/20 transition-colors">
                  <LogOut className="h-4 w-4" />
                </div>
                <span className="font-medium">Log out</span>
              </DropdownMenuItem>
            </div>
          </DropdownMenuContent>
        </DropdownMenu>
      </div>
    </header>
  );
};