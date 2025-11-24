import React, { useState, useEffect } from "react";
import Link from "next/link";
import dynamic from "next/dynamic";
const Image = dynamic(() => import("next/image"), { ssr: false });
import { usePathname, useSearchParams } from "next/navigation";
import {
  HomeIcon,
  MessageSquareIcon,
  BellIcon,
  CalendarIcon,
  Stethoscope,
  SettingsIcon,
  LogOutIcon,
  ChevronLeftIcon,
  XIcon,
  Briefcase,
  PencilIcon,
} from "lucide-react";
import { useSession } from "next-auth/react";
import { useRole } from "@/components/auth/RoleProvider";
import { Avatar, AvatarImage, AvatarFallback } from "@/components/ui/avatar";
import { useChatContext } from "@/contexts/ChatContext";
import { useTheme } from "@/components/ThemeProvider";

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
  online?: boolean;
}

export const Sidebar: React.FC<SidebarProps> = ({
  isOpen,
  isCollapsed,
  toggleCollapse,
  toggleSidebar,
}) => {
  const { data: session } = useSession();
  const { role } = useRole();
  const { theme } = useTheme();
  const pathname = usePathname();
  const searchParams = useSearchParams();
  const activeRoom = searchParams?.get("room");
  const [channels, setChannels] = useState<Channel[]>([]);
  const { recentDms } = useChatContext();

  const [currentUser, setCurrentUser] = useState<User | null>(null);

  const getInitials = (name: string | undefined) => {
    if (!name) return "";
    const names = name.split(" ").filter(Boolean);
    if (names.length === 0) return "";
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
            const data = (await res.json()) as { channels: Channel[] };
            setChannels(data.channels);
          }
        } catch (error) {
          console.error("Failed to fetch channels", error);
        }
      }
    };

    const fetchCurrentUser = async () => {
      if (session?.user?.id) {
        try {
          const res = await fetch(`/api/users/current`);
          if (res.ok) {
            const data: { user: User } = await res.json();
            setCurrentUser(data.user as User);
          }
        } catch (error) {
          console.error("Failed to fetch current user", error);
        }
      }
    };

    fetchChannels();
    fetchCurrentUser();
  }, [session]);

  const navItems: NavItem[] = [
    { name: "Home", icon: <HomeIcon size={20} />, path: "/dashboard" },
    {
      name: "Chat",
      icon: <MessageSquareIcon size={20} />,
      path: "/dashboard/chat",
    },
    { name: "Alerts", icon: <BellIcon size={20} />, path: "/dashboard/alerts" },
    {
      name: "Shifts",
      icon: <CalendarIcon size={20} />,
      path: "/dashboard/shifts",
    },
    {
      name: "EHR",
      icon: <Stethoscope size={20} />,
      path: "/dashboard/ehr/patients",
    },
  ];

  if (role === "admin") {
    navItems.push({
      name: "Admin",
      icon: <Briefcase size={20} />,
      path: "/dashboard/admin",
    });
  }

  let teamsContent: React.ReactNode = null;

  if (pathname && pathname.startsWith("/dashboard/ehr")) {
    teamsContent = (
      <>
        <h3
          className={`px-3 py-2 text-xs font-bold text-gray-400 dark:text-gray-500 uppercase tracking-wider ${isCollapsed ? "lg:hidden" : ""}`}
        >
          EHR Menu
        </h3>
        <div className="mt-3 space-y-1">
          <Link
            href="/dashboard/ehr/patients"
            className={`group flex items-center w-full px-2 py-1.5 md:px-3 md:py-2.5 text-sm font-medium rounded-lg hover:bg-gray-100 dark:hover:bg-gray-800 transition-all duration-200 ${
              pathname === "/dashboard/ehr/patients"
                ? "bg-primary/10 text-primary"
                : "text-gray-500 dark:text-gray-400 group-hover:text-gray-900 dark:group-hover:text-white"
            } ${isCollapsed ? "lg:justify-center" : ""}`}
          >
            <span className="truncate whitespace-nowrap transition-colors duration-200">
              Patients
            </span>
          </Link>
          <Link
            href="/dashboard/ehr/appointments"
            className={`group flex items-center w-full px-2 py-1.5 md:px-3 md:py-2.5 text-sm font-medium rounded-lg hover:bg-gray-100 dark:hover:bg-gray-800 transition-all duration-200 ${
              pathname === "/dashboard/ehr/appointments"
                ? "bg-primary/10 text-primary"
                : "text-gray-500 dark:text-gray-400 group-hover:text-gray-900 dark:group-hover:text-white"
            } ${isCollapsed ? "lg:justify-center" : ""}`}
          >
            <span className="truncate whitespace-nowrap transition-colors duration-200">
              Appointments
            </span>
          </Link>
          {(role === "pharmacist" ||
            role === "doctor" ||
            role === "admin" ||
            role === "nurse") && (
            <Link
              href="/dashboard/ehr/lab"
              className={`group flex items-center w-full px-2 py-1.5 md:px-3 md:py-2.5 text-sm font-medium rounded-lg hover:bg-gray-100 dark:hover:bg-gray-800 transition-all duration-200 ${
                pathname === "/dashboard/ehr/lab"
                  ? "bg-primary/10 text-primary"
                  : "text-gray-500 dark:text-gray-400 group-hover:text-gray-900 dark:group-hover:text-white"
              } ${isCollapsed ? "lg:justify-center" : ""}`}
            >
              <span className="truncate whitespace-nowrap transition-colors duration-200">
                Lab
              </span>
            </Link>
          )}
          <Link
            href="/dashboard/ehr/audit-logs"
            className={`group flex items-center w-full px-2 py-1.5 md:px-3 md:py-2.5 text-sm font-medium rounded-lg hover:bg-gray-100 dark:hover:bg-gray-800 transition-all duration-200 ${
              pathname === "/dashboard/ehr/audit-logs"
                ? "bg-primary/10 text-primary"
                : "text-gray-500 dark:text-gray-400 group-hover:text-gray-900 dark:group-hover:text-white"
            } ${isCollapsed ? "lg:justify-center" : ""}`}
          >
            <span className="truncate whitespace-nowrap transition-colors duration-200">
              Audit Logs
            </span>
          </Link>
          {/* Role-based navigation items */}
          {role === "doctor" && (
            <Link
              href="/dashboard/ehr/doctor-dashboard"
              className={`group flex items-center w-full px-2 py-1.5 md:px-3 md:py-2.5 text-sm font-medium rounded-lg hover:bg-gray-100 dark:hover:bg-gray-800 transition-all duration-200 ${
                pathname === "/dashboard/ehr/doctor-dashboard"
                  ? "bg-primary/10 text-primary"
                  : "text-gray-500 dark:text-gray-400 group-hover:text-gray-900 dark:group-hover:text-white"
              } ${isCollapsed ? "lg:justify-center" : ""}`}
            >
              <span className="truncate whitespace-nowrap transition-colors duration-200">
                Doctor Dashboard
              </span>
            </Link>
          )}
          {role === "nurse" && (
            <Link
              href="/dashboard/ehr/nurses-dashboard"
              className={`group flex items-center w-full px-2 py-1.5 md:px-3 md:py-2.5 text-sm font-medium rounded-lg hover:bg-gray-100 dark:hover:bg-gray-800 transition-all duration-200 ${
                pathname === "/dashboard/ehr/nurse-dashboard"
                  ? "bg-primary/10 text-primary"
                  : "text-gray-500 dark:text-gray-400 group-hover:text-gray-900 dark:group-hover:text-white"
              } ${isCollapsed ? "lg:justify-center" : ""}`}
            >
              <span className="truncate whitespace-nowrap transition-colors duration-200">
                Nurse Dashboard
              </span>
            </Link>
          )}
          {(role === "pharmacist" ||
            role === "doctor" ||
            role === "admin" ||
            role === "nurse") && (
            <Link
              href="/dashboard/ehr/pharmacy"
              className={`group flex items-center w-full px-2 py-1.5 md:px-3 md:py-2.5 text-sm font-medium rounded-lg hover:bg-gray-100 dark:hover:bg-gray-800 transition-all duration-200 ${
                pathname === "/dashboard/ehr/pharmacy"
                  ? "bg-primary/10 text-primary"
                  : "text-gray-500 dark:text-gray-400 group-hover:text-gray-900 dark:group-hover:text-white"
              } ${isCollapsed ? "lg:justify-center" : ""}`}
            >
              <span className="truncate whitespace-nowrap transition-colors duration-200">
                Pharmacy
              </span>
            </Link>
          )}
        </div>
      </>
    );
  } else if (pathname && pathname.startsWith("/dashboard/chat")) {
    teamsContent = (
      <>
        <h3
          className={`px-4 pt-4 pb-2 text-xs font-bold text-gray-400 dark:text-gray-500 tracking-wider ${isCollapsed ? "lg:text-center" : ""}`}
        >
          Channels
        </h3>
        <div className="mt-1 space-y-1 px-2">
          <Link
            key="general"
            href={`/dashboard/chat?room=general`}
            className={`group flex items-center w-full px-2 py-1.5 md:px-3 md:py-2.5 text-base md:text-sm font-medium rounded-xl transition-all duration-200 backdrop-blur-sm border border-transparent hover:border-primary/20 hover:shadow-lg hover:shadow-primary/5 ${
              activeRoom === "general" || !activeRoom
                ? "bg-primary/10 text-primary"
                : "text-gray-500 dark:text-gray-400 hover:bg-gray-100 dark:hover:bg-gray-800"
            } ${isCollapsed ? "lg:justify-center" : ""}`}
          >
            <span className={`font-bold ${isCollapsed ? "lg:hidden" : ""}`}>
              #
            </span>
            <span
              className={`ml-2 truncate whitespace-nowrap ${isCollapsed ? "lg:hidden" : ""}`}
            >
              General
            </span>
          </Link>
          {channels.map((channel) => (
            <Link
              key={channel._id}
              href={`/dashboard/chat?room=${channel.name.toLowerCase().replace(/\s/g, "")}`}
              className={`group flex items-center w-full px-3 py-2.5 md:px-3 md:py-2.5 text-base md:text-sm font-medium rounded-xl transition-all duration-200 backdrop-blur-sm border border-transparent hover:border-primary/20 hover:shadow-lg hover:shadow-primary/5 ${
                activeRoom ===
                `${channel.name.toLowerCase().replace(/\s/g, "")}`
                  ? "bg-primary/10 text-primary border-primary/30 shadow-md shadow-primary/10"
                  : "text-gray-500 dark:text-gray-400 hover:bg-gradient-to-r hover:from-primary/5 hover:to-accent/5 hover:text-gray-900 dark:hover:text-white"
              } ${isCollapsed ? "lg:justify-center" : ""}`}
            >
              <span
                className={`font-bold text-primary ${isCollapsed ? "lg:hidden" : ""}`}
              >
                #
              </span>
              <span
                className={`ml-2 truncate whitespace-nowrap ${isCollapsed ? "lg:hidden" : ""}`}
              >
                {channel.name}
              </span>
            </Link>
          ))}
        </div>
        <h3
          className={`px-4 pt-4 pb-2 text-xs font-bold text-gray-400 dark:text-gray-500 tracking-wider ${isCollapsed ? "lg:text-center" : ""}`}
        >
          Direct Messages
        </h3>
        <div className="mt-1 space-y-1 px-2">
          <Link
            key="notes-to-self"
            href={`/dashboard/chat?room=${session?.user?.id}-${session?.user?.id}`}
            className={`group flex items-center w-full px-2 py-1.5 md:px-3 md:py-2.5 text-sm font-medium rounded-lg transition-all duration-200 ${
              activeRoom === `${session?.user?.id}-${session?.user?.id}`
                ? "bg-primary/10 text-primary"
                : "text-gray-700 dark:text-gray-200 hover:bg-gray-100 dark:hover:bg-gray-800"
            } ${isCollapsed ? "lg:justify-center" : ""}`}
          >
            <div className="relative">
              <Avatar className="w-8 h-8">
                <AvatarImage
                  src={currentUser?.image || undefined}
                  alt="Your avatar"
                />
                <AvatarFallback>
                  {getInitials(currentUser?.fullName)}
                </AvatarFallback>
              </Avatar>
              {currentUser?.online && (
                <span className="absolute bottom-0 right-0 block h-2 w-2 rounded-full bg-green-500 ring-2 ring-white dark:ring-gray-950" />
              )}
            </div>
            <div
              className={`ml-3 overflow-hidden ${isCollapsed ? "lg:hidden" : ""}`}
            >
              <p className={`font-semibold truncate`}>Notes to self</p>
              <p className="text-xs text-gray-500 dark:text-gray-400 truncate">
                Personal space
              </p>
            </div>
          </Link>
          {recentDms.slice(0, 3).map((dm) => {
            const otherUser = dm.participants.find(
              (p) => p._id.toString() !== session?.user?.id
            );

            if (!otherUser) {
              console.warn(
                "Could not determine other user for DM, skipping render:",
                dm
              );
              return null;
            }

            const roomHref =
              dm.room || [session?.user?.id, otherUser._id].sort().join("--");
            const isActive = activeRoom === roomHref;

            return (
              <Link
                key={dm._id}
                href={`/dashboard/chat?room=${roomHref}`}
                className={`group flex items-center w-full px-2 py-1.5 md:px-3 md:py-2.5 text-sm font-medium rounded-lg transition-all duration-200 ${
                  isActive
                    ? "bg-primary/10 text-primary"
                    : "text-gray-700 dark:text-gray-200 hover:bg-gray-100 dark:hover:bg-gray-800"
                } ${isCollapsed ? "lg:justify-center" : ""}`}
              >
                <div className="relative">
                  <Avatar className="w-7 h-7 md:w-8 md:h-8">
                    <AvatarImage
                      src={otherUser.image || undefined}
                      alt={otherUser.fullName}
                    />
                    <AvatarFallback>
                      {getInitials(otherUser.fullName)}
                    </AvatarFallback>
                  </Avatar>
                  {otherUser.online && (
                    <span className="absolute bottom-0 right-0 block h-1.5 w-1.5 md:h-2 md:w-2 rounded-full bg-green-500 ring-2 ring-white dark:ring-gray-950" />
                  )}
                </div>
                <div
                  className={`ml-3 overflow-hidden ${isCollapsed ? "lg:hidden" : ""}`}
                >
                  <p
                    className={`text-[0.925rem] md:text-base font-semibold truncate`}
                  >
                    {otherUser.fullName}
                  </p>
                  <p className="text-[0.7rem] md:text-xs text-gray-500 dark:text-gray-400 truncate">
                    {dm.text}
                  </p>
                </div>
              </Link>
            );
          })}
        </div>
      </>
    );
  }

  return (
    <aside
      className={`fixed inset-y-0 left-0 z-50 bg-white dark:bg-gray-950 border-r border-gray-200 dark:border-gray-800 shadow-lg transition-all duration-300 ease-in-out flex flex-col
      ${isCollapsed ? "lg:w-24" : "lg:w-64"}
      ${isOpen ? "translate-x-0 w-64" : "-translate-x-full"} lg:translate-x-0
    `}
    >
      <div className="flex-1 overflow-y-auto overflow-x-hidden p-4">
        <div
          className={`mb-8 flex items-center ${isCollapsed ? "lg:justify-center" : "justify-between"}`}
        >
          <Link href={"/"} className="flex items-center">
            <Image
              src={
                theme === "dark" ? "/curenium-logo-d.png" : "/curenium-logo.png"
              }
              alt="Curenium Logo"
              width={32}
              height={32}
              className={`transition-all duration-300 h-8 ${isCollapsed ? "w-8" : "w-auto"}`}
            />
          </Link>
          <button
            onClick={toggleCollapse}
            className={`hidden lg:flex items-center justify-center p-0 rounded-lg hover:bg-gray-100 dark:hover:bg-gray-800 ${isCollapsed ? "relative left-[12]" : ""}`}
          >
            <ChevronLeftIcon
              size={18}
              className={`text-gray-500 dark:text-gray-400 transition-all duration-300 ${isCollapsed ? "rotate-180" : ""}`}
            />
          </button>
          <button
            onClick={toggleSidebar}
            className="lg:hidden ml-auto flex items-center justify-center p-2 rounded-lg hover:bg-gray-100 dark:hover:bg-gray-800 hover:bg-red-50 dark:hover:bg-red-950/20 transition-all duration-200"
          >
            <XIcon
              size={20}
              className={`text-gray-500 dark:text-gray-400 hover:text-red-500 dark:hover:text-red-400 transition-colors duration-200`}
            />
          </button>
        </div>

        <nav className="space-y-2 px-2">
          {navItems.map((item) => {
            const isActive = pathname === item.path;
            return (
              <Link
                key={item.name}
                href={item.path}
                className={`group flex items-center px-4 py-3 text-sm font-medium rounded-lg transition-all duration-200 ${isCollapsed ? "lg:justify-center" : ""} ${
                  isActive
                    ? "bg-primary/10 text-primary"
                    : "text-gray-500 dark:text-gray-400 hover:bg-gray-100 dark:hover:bg-gray-800 hover:text-gray-900 dark:hover:text-white"
                }`}
              >
                <span
                  className={`${isActive ? "text-primary" : "text-gray-400 dark:text-gray-500 group-hover:text-gray-500 dark:group-hover:text-gray-400"}`}
                >
                  {item.icon}
                </span>
                <span
                  className={`ml-3 whitespace-nowrap transition-all duration-200 ${isCollapsed ? "lg:hidden" : ""}`}
                >
                  {item.name}
                </span>
              </Link>
            );
          })}
        </nav>

        <div className={`mt-8 px-2 lg:hidden`}>{teamsContent}</div>
      </div>

      <div className="p-4 border-t border-gray-200 dark:border-gray-800">
        <div className="space-y-1">
          <Link
            href="/dashboard/settings"
            className={`group flex items-center px-4 py-3 text-sm font-medium text-gray-500 dark:text-gray-400 rounded-lg hover:bg-gray-100 dark:hover:bg-gray-800 hover:text-gray-900 dark:hover:text-white transition-all duration-200 ${isCollapsed ? "lg:justify-center" : ""}`}
          >
            <SettingsIcon
              size={18}
              className="text-gray-400 dark:text-gray-500 group-hover:text-gray-500 dark:group-hover:text-gray-400"
            />
            <span
              className={`ml-3 whitespace-nowrap transition-all duration-200 ${isCollapsed ? "lg:hidden" : ""}`}
            >
              Settings
            </span>
          </Link>

          <button
            className={`group flex w-full items-center px-4 py-3 text-sm font-medium text-gray-500 dark:text-gray-400 rounded-lg hover:bg-red-500/10 hover:text-red-500 transition-all duration-200 ${isCollapsed ? "lg:justify-center" : ""}`}
          >
            <LogOutIcon
              size={18}
              className="text-gray-400 dark:text-gray-500 group-hover:text-red-500"
            />
            <span
              className={`ml-3 whitespace-nowrap transition-all duration-200 ${isCollapsed ? "lg:hidden" : ""}`}
            >
              Logout
            </span>
          </button>
        </div>
      </div>
    </aside>
  );
};
