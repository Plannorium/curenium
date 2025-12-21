import React, { useState, useEffect, useMemo } from "react";
import Link from "next/link";
import dynamic from "next/dynamic";
const Image = dynamic(() => import("next/image"), { ssr: false });
import { usePathname, useSearchParams, useRouter } from "next/navigation";
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
  SearchIcon,
  Search,
  Users,
  Plus,
} from "lucide-react";
import { useSession } from "next-auth/react";
import { useRole } from "@/components/auth/RoleProvider";
import { Avatar, AvatarImage, AvatarFallback } from "@/components/ui/avatar";
import { useChatContext } from "@/contexts/ChatContext";
import { useTheme } from "@/components/ThemeProvider";
import { dashboardTranslations } from "@/lib/dashboard-translations";
import useSWR from 'swr';
import { useLanguage } from '@/contexts/LanguageContext';
import { generateRoomId } from "@/lib/roomIdGenerator";
import type { IUser } from "@/models/User";
import { CreateChannelModal } from "./CreateChannelModal";
import { ManageChannelModal } from "./ManageChannelModal";
import {
  Dialog,
  DialogContent,
  DialogDescription,
  DialogHeader,
  DialogTitle,
} from "@/components/ui/dialog";
import { Input } from "@/components/ui/input";
import { Button } from "@/components/ui/button";

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
  id: string; // for compatibility if used elsewhere
  name: string;
  members: string[];
  roomId: string;
}

interface User {
  _id: string;
  fullName: string;
  image?: string;
  online?: boolean;
  email?: string;
}

interface DM {
  _id: string;
  participants: IUser[];
  room: string;
  messages: any[]; // You might want to type this more strictly
}

interface DMRoom {
  dm: DM;
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
  const { language } = useLanguage();
  const pathname = usePathname();
  const searchParams = useSearchParams();
  const router = useRouter();
  const activeRoom = searchParams?.get("room");
  const [channels, setChannels] = useState<Channel[]>([]);
  const { recentDms } = useChatContext();
  const [searchQuery, setSearchQuery] = useState("");
  const [dialogSearchQuery, setDialogSearchQuery] = useState("");
  const [managingChannel, setManagingChannel] = useState<Channel | null>(null);
  const [isCreateChannelModalOpen, setCreateChannelModalOpen] = useState(false);
  const [isNewChatDialogOpen, setIsNewChatDialogOpen] = useState(false);

  const handleRoomChange = (room: string) => {
    router.push(`${pathname}?room=${room}`);
  };

  const sidebarT = dashboardTranslations[language as keyof typeof dashboardTranslations] || dashboardTranslations.en;

  const t = (key: string) => {
    const keys = key.split(".");
    let value: any = dashboardTranslations[language as keyof typeof dashboardTranslations];
    for (const k of keys) {
      value = value?.[k];
    }
    return value || key;
  };

  const [users, setUsers] = useState<User[]>([]);

  const currentUser = useMemo(() => {
    if (!session?.user?._id || !users.length) return null;
    return users.find((u) => u._id === session?.user?._id);
  }, [session?.user?._id, users]);

  const filteredUsers = useMemo(() => {
    return users.filter(user =>
      user.fullName.toLowerCase().includes(dialogSearchQuery.toLowerCase()) ||
      (user.email && user.email.toLowerCase().includes(dialogSearchQuery.toLowerCase()))
    );
  }, [users, dialogSearchQuery]);

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

  const fetchChannels = async () => {
    try {
      const response = await fetch("/api/channels");
      if (response.ok) {
        const data = (await response.json()) as { channels: Channel[] };
        setChannels(data.channels || []);
      }
    } catch (error) {
      console.error("Failed to fetch channels:", error);
    }
  };

  // Refresh users online status periodically
  useEffect(() => {
    const refreshUsersOnlineStatus = async () => {
      try {
        const response = await fetch("/api/users");
        if (response.ok) {
          const data: User[] = await response.json();
          setUsers(data);
        }
      } catch (error) {
        console.error("Failed to refresh users online status:", error);
      }
    };

    // Cleanup stale online statuses (run every 5 minutes)
    const cleanupOnlineStatus = async () => {
      try {
        await fetch("/api/users/cleanup", { method: "POST" });
      } catch (error) {
        console.error("Failed to cleanup online status:", error);
      }
    };

    // Refresh immediately and then every 60 seconds
    refreshUsersOnlineStatus();
    const refreshInterval = setInterval(refreshUsersOnlineStatus, 60000);

    // Cleanup every 5 minutes
    const cleanupInterval = setInterval(cleanupOnlineStatus, 300000);

    return () => {
      clearInterval(refreshInterval);
      clearInterval(cleanupInterval);
    };
  }, []);

  useEffect(() => {
    fetchChannels();
  }, []);

  const navItems: NavItem[] = [
    { name: sidebarT.sidebar.home, icon: <HomeIcon size={20} />, path: "/dashboard" },
    {
      name: sidebarT.sidebar.chat,
      icon: <MessageSquareIcon size={20} />,
      path: "/dashboard/chat",
    },
    { name: sidebarT.sidebar.alerts, icon: <BellIcon size={20} />, path: "/dashboard/alerts" },
    {
      name: sidebarT.sidebar.shifts,
      icon: <CalendarIcon size={20} />,
      path: "/dashboard/shifts",
    },
    {
      name: sidebarT.sidebar.ehr,
      icon: <Stethoscope size={20} />,
      path: "/dashboard/ehr/patients",
    },
  ];

  if (role === "admin") {
    navItems.push({
      name: sidebarT.sidebar.admin,
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
          {sidebarT.sidebar.ehrMenu}
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
              {sidebarT.sidebar.patients}
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
              {sidebarT.sidebar.appointments}
            </span>
          </Link>
          {(role === "doctor" || role === "admin" || role === "nurse") && (
            <Link
              href="/dashboard/ehr/lab"
              className={`group flex items-center w-full px-2 py-1.5 md:px-3 md:py-2.5 text-sm font-medium rounded-lg hover:bg-gray-100 dark:hover:bg-gray-800 transition-all duration-200 ${
                pathname === "/dashboard/ehr/lab"
                  ? "bg-primary/10 text-primary"
                  : "text-gray-500 dark:text-gray-400 group-hover:text-gray-900 dark:group-hover:text-white"
              } ${isCollapsed ? "lg:justify-center" : ""}`}
            >
              <span className="truncate whitespace-nowrap transition-colors duration-200">
                {sidebarT.sidebar.lab}
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
              {sidebarT.sidebar.auditLogs}
            </span>
          </Link>
          {/* Hospital Management Routes */}
          {(role === "doctor" || role === "matron_nurse" || role === "admin") && (
            <Link
              href="/dashboard/ehr/admissions"
              className={`group flex items-center w-full px-2 py-1.5 md:px-3 md:py-2.5 text-sm font-medium rounded-lg hover:bg-gray-100 dark:hover:bg-gray-800 transition-all duration-200 ${
                pathname === "/dashboard/ehr/admissions"
                  ? "bg-primary/10 text-primary"
                  : "text-gray-500 dark:text-gray-400 group-hover:text-gray-900 dark:group-hover:text-white"
              } ${isCollapsed ? "lg:justify-center" : ""}`}
            >
              <span className="truncate whitespace-nowrap transition-colors duration-200">
                {sidebarT.sidebar.admissions}
              </span>
            </Link>
          )}
          {(role === "matron_nurse" || role === "admin") && (
            <Link
              href="/dashboard/ehr/discharges"
              className={`group flex items-center w-full px-2 py-1.5 md:px-3 md:py-2.5 text-sm font-medium rounded-lg hover:bg-gray-100 dark:hover:bg-gray-800 transition-all duration-200 ${
                pathname === "/dashboard/ehr/discharges"
                  ? "bg-primary/10 text-primary"
                  : "text-gray-500 dark:text-gray-400 group-hover:text-gray-900 dark:group-hover:text-white"
              } ${isCollapsed ? "lg:justify-center" : ""}`}
            >
              <span className="truncate whitespace-nowrap transition-colors duration-200">
                {sidebarT.sidebar.discharges}
              </span>
            </Link>
          )}
          {(role === "matron_nurse" || role === "admin") && (
            <Link
              href="/dashboard/ehr/shift-tracking"
              className={`group flex items-center w-full px-2 py-1.5 md:px-3 md:py-2.5 text-sm font-medium rounded-lg hover:bg-gray-100 dark:hover:bg-gray-800 transition-all duration-200 ${
                pathname === "/dashboard/ehr/shift-tracking"
                  ? "bg-primary/10 text-primary"
                  : "text-gray-500 dark:text-gray-400 group-hover:text-gray-900 dark:group-hover:text-white"
              } ${isCollapsed ? "lg:justify-center" : ""}`}
            >
              <span className="truncate whitespace-nowrap transition-colors duration-200">
                {sidebarT.sidebar.shiftTracking}
              </span>
            </Link>
          )}
          {role === "admin" && (
            <Link
              href="/dashboard/ehr/hospital-management"
              className={`group flex items-center w-full px-2 py-1.5 md:px-3 md:py-2.5 text-sm font-medium rounded-lg hover:bg-gray-100 dark:hover:bg-gray-800 transition-all duration-200 ${
                pathname === "/dashboard/admin/hospital-management"
                  ? "bg-primary/10 text-primary"
                  : "text-gray-500 dark:text-gray-400 group-hover:text-gray-900 dark:group-hover:text-white"
              } ${isCollapsed ? "lg:justify-center" : ""}`}
            >
              <span className="truncate whitespace-nowrap transition-colors duration-200">
                {sidebarT.sidebar.hospitalMgmt}
              </span>
            </Link>
          )}
          {/* Role-based navigation items */}
          {role === "doctor" ||
            (role === "admin" && (
              <Link
                href="/dashboard/ehr/doctor-dashboard"
                className={`group flex items-center w-full px-2 py-1.5 md:px-3 md:py-2.5 text-sm font-medium rounded-lg hover:bg-gray-100 dark:hover:bg-gray-800 transition-all duration-200 ${
                  pathname === "/dashboard/ehr/doctor-dashboard"
                    ? "bg-primary/10 text-primary"
                    : "text-gray-500 dark:text-gray-400 group-hover:text-gray-900 dark:group-hover:text-white"
                } ${isCollapsed ? "lg:justify-center" : ""}`}
              >
                <span className="truncate whitespace-nowrap transition-colors duration-200">
                  {sidebarT.sidebar.doctorDashboard}
                </span>
              </Link>
            ))}
          {role === "nurse" ||
            (role === "admin" && (
            <Link
              href="/dashboard/ehr/nurses-dashboard"
              className={`group flex items-center w-full px-2 py-1.5 md:px-3 md:py-2.5 text-sm font-medium rounded-lg hover:bg-gray-100 dark:hover:bg-gray-800 transition-all duration-200 ${
                pathname === "/dashboard/ehr/nurse-dashboard"
                  ? "bg-primary/10 text-primary"
                  : "text-gray-500 dark:text-gray-400 group-hover:text-gray-900 dark:group-hover:text-white"
              } ${isCollapsed ? "lg:justify-center" : ""}`}
            >
              <span className="truncate whitespace-nowrap transition-colors duration-200">
                {sidebarT.sidebar.nurseDashboard}
              </span>
            </Link>)
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
                {sidebarT.sidebar.pharmacy}
              </span>
            </Link>
          )}
        </div>
      </>
    );
  } else if (pathname && pathname.startsWith("/dashboard/chat")) {
    const organizationId = session?.user?.organizationId;
    const generalRoomName = organizationId ? `general-${generateRoomId(organizationId)}` : 'general';
    teamsContent = (
      <>
        <div className="px-4 py-1.5">
          <div className="relative">
            <input
              type="text"
              placeholder={t("chat.searchConversations")}
              className="backdrop-blur-sm bg-background/50 dark:bg-gray-800/50 border border-border/60 dark:border-gray-700/60 rounded-full w-full pl-10 pr-4 py-2.5 text-sm text-foreground placeholder:text-muted-foreground focus:border-primary/50 focus:ring-2 focus:ring-primary/10 transition-all duration-200"
              value={searchQuery}
              onChange={(e) => setSearchQuery(e.target.value)}
            />
            <div className="absolute inset-y-0 left-0 pl-3 flex items-center pointer-events-none">
              <SearchIcon size={16} className="text-muted-foreground" />
            </div>
          </div>
        </div>
        <h3
          className={`px-4 pt-2 pb-2 text-xs font-bold text-gray-400 dark:text-gray-500 tracking-wider ${isCollapsed ? "lg:text-center" : ""}`}
        >
          {sidebarT.sidebar.channels}
        </h3>
        <div className="mt-1 space-y-1 px-2">
          <div
            className={`group flex items-center w-full px-3 py-2.5 text-sm rounded-xl font-medium transition-all duration-200 hover:bg-accent/50 dark:hover:bg-gray-800/50 ${
              activeRoom === generalRoomName || (!activeRoom && pathname.startsWith('/dashboard/chat'))
                ? "bg-primary/10 text-primary"
                : "text-muted-foreground hover:text-foreground"
            }`}
          >
            <button
              className="flex cursor-pointer items-center flex-1 text-left"
              onClick={() => handleRoomChange(generalRoomName)}
            >
              <span
                className={`w-2.5 h-2.5 rounded-full ${language === "ar" ? "ml-3" : "mr-3"} shadow-sm ${
                  activeRoom === generalRoomName || (!activeRoom && pathname.startsWith('/dashboard/chat'))
                    ? "bg-primary"
                    : "bg-green-500 opacity-60 group-hover:opacity-100 transition-opacity"
                }`}
              ></span>
              {sidebarT.sidebar.general}
            </button>
          </div>
          {channels
            .filter((channel) =>
              channel.name
                .toLowerCase()
                .includes(searchQuery.toLowerCase())
            )
            .map((channel) => (
              <div
                key={channel._id}
                className={`group flex items-center w-full px-3 py-2.5 text-sm rounded-xl font-medium transition-all duration-200 hover:bg-accent/50 dark:hover:bg-gray-800/50 ${
                  activeRoom === channel.roomId
                    ? "bg-primary/10 text-primary"
                    : "text-muted-foreground hover:text-foreground"
                }`}
              >
                <button
                  className="flex cursor-pointer items-center flex-1 text-left"
                  onClick={() =>
                    handleRoomChange(channel.roomId)
                  }
                >
                  <span
                    className={`w-2.5 h-2.5 rounded-full ${language === "ar" ? "ml-3" : "mr-3"} shadow-sm ${
                      activeRoom === channel.roomId
                        ? "bg-primary"
                        : "bg-blue-500 opacity-60 group-hover:opacity-100 transition-opacity"
                    }`}
                  ></span>
                  {channel.name}
                </button>
                <button
                  onClick={(e) => {
                    e.stopPropagation();
                    setManagingChannel(channel);
                  }}
                  className="opacity-0 group-hover:opacity-100 text-muted-foreground hover:text-foreground p-1 rounded-md"
                >
                  <Users size={14} />
                </button>
              </div>
            ))}
          <div className="px-3 cursor-pointer mt-3 mb-1.5">
            <button
              onClick={() => setCreateChannelModalOpen(true)}
              className="group flex items-center justify-center w-full px-3 py-2.5 text-sm rounded-xl font-medium transition-all duration-300 border border-dashed border-border/50 hover:border-primary/50 bg-background/20 hover:bg-accent/50 dark:border-gray-700/50 dark:hover:border-primary/50 dark:bg-gray-800/20 dark:hover:bg-gray-800/50 text-muted-foreground hover:text-foreground shadow-sm hover:shadow-md transform hover:-translate-y-0.5 cursor-pointer"
            >
              <Plus
                size={16}
                className="mr-2 text-muted-foreground group-hover:text-primary transition-colors"
              />
              {t("chat.addChannel")}
            </button>
          </div>
        </div>
        <h3
          className={`px-4 pt-3 pb-1 text-xs font-bold text-gray-400 dark:text-gray-500 tracking-wider ${isCollapsed ? "lg:text-center" : ""}`}
        >
          {sidebarT.sidebar.directMessages}
        </h3>
        <div className="mt-1 space-y-1 px-2">
          {currentUser && (
            <button
              onClick={() =>
                handleRoomChange(
                  `${currentUser._id}--${currentUser._id}`
                )
              }
              className={`group cursor-pointer flex items-center w-full px-3 py-2.5 text-sm rounded-xl font-medium transition-all duration-200 hover:scale-[1.01] ${
                activeRoom === `${currentUser._id}--${currentUser._id}`
                  ? "bg-primary/10 text-primary border border-primary/20 shadow-sm hover:shadow-md"
                  : "hover:bg-accent/50 dark:hover:bg-gray-800/50 text-muted-foreground hover:text-foreground"
              }`}
            >
              <div
                className={`relative ${language === "ar" ? "ml-3" : "mr-3"}`}
              >
                <Avatar className="h-6 w-6 ring-2 ring-border/20 dark:ring-gray-700/20 group-hover:ring-primary/30 transition-all duration-200">
                  <AvatarImage src={currentUser.image || undefined} />
                  <AvatarFallback className="bg-primary/10 text-primary font-semibold text-xs">
                    {currentUser.fullName
                      ?.split(" ")
                      .map((n) => n[0])
                      .join("")
                      .slice(0, 2)}
                  </AvatarFallback>
                </Avatar>
                {currentUser.online && (
                  <span className="absolute -bottom-0.5 -right-0.5 w-2.5 h-2.5 bg-green-500 rounded-full border-2 border-background shadow-sm"></span>
                )}
              </div>
              <div className="flex flex-col items-start">
                <span className="text-xs text-muted-foreground -mt-1">
                  {sidebarT.sidebar.notesToSelf}
                </span>
              </div>
            </button>
          )}
          {recentDms
            .slice(0, 5)
            .reduce(
              (acc, dm) => {
                // Find the other user in the DM
                const otherUser = dm.participants.find(
                  (p) => p._id.toString() !== session?.user?._id
                );

                if (otherUser) {
                  acc.push({
                    ...dm,
                    user: otherUser,
                    room: dm.room,
                  } as DM & { user: IUser; room: string });
                }
                return acc;
              },
              [] as Array<DM & { user: IUser; room: string }>
            )
            .filter(
              (dm) =>
                !searchQuery ||
                (dm.user &&
                  dm.user.fullName
                    .toLowerCase()
                    .includes(searchQuery.toLowerCase()))
            )
            .map((dm) => {
              const room = dm.room;

              const user = dm.user;

              return (
                <button
                  key={(dm as any)._id}
                  onClick={() => handleRoomChange(room)}
                  className={`group cursor-pointer flex items-center w-full px-3 py-2.5 text-sm rounded-xl font-medium transition-all duration-200 hover:scale-[1.01] ${
                    activeRoom === room
                      ? "bg-primary/10 text-primary border border-primary/20 shadow-sm hover:shadow-md"
                      : "hover:bg-accent/50 dark:hover:bg-gray-800/50 text-muted-foreground hover:text-foreground"
                  }`}
                >
                  <div
                    className={`relative ${language === "ar" ? "ml-3" : "mr-3"}`}
                  >
                    <Avatar className="h-6 w-6 ring-2 ring-border/20 dark:ring-gray-700/20 group-hover:ring-primary/30 transition-all duration-200">
                      <AvatarImage src={user.image || undefined} />
                      <AvatarFallback className="bg-primary/10 text-primary font-semibold text-xs">
                        {user.fullName
                          .split(" ")
                          .map((n) => n[0])
                          .join("")
                          .slice(0, 2)}
                      </AvatarFallback>
                    </Avatar>
                    {user.online && (
                      <span className="absolute -bottom-0.5 -right-0.5 w-2.5 h-2.5 bg-green-500 rounded-full border-2 border-background shadow-sm"></span>
                    )}
                  </div>
                  {user.fullName}
                </button>
              );
            })}
          <button
            onClick={() => setIsNewChatDialogOpen(true)}
            className="group cursor-pointer flex items-center w-full px-3 py-2.5 text-sm rounded-xl font-medium transition-all duration-200 hover:scale-[1.01] hover:bg-accent/50 dark:hover:bg-gray-800/50 text-muted-foreground hover:text-foreground"
          >
            <div
              className={`relative ${language === "ar" ? "ml-3" : "mr-3"}`}
            >
              <div className="h-6 w-6 rounded-lg flex items-center justify-center bg-primary/10 text-primary">
                <Plus className="h-4 w-4" />
              </div>
            </div>
            {t("chat.startNewChat")}
          </button>
        </div>
      </>
    );
  }

  return (
    <div>
      <aside
      className={`fixed inset-y-0 left-0 z-50 bg-white dark:bg-gray-950 border-r border-gray-200 dark:border-gray-800 shadow-lg transition-all duration-300 ease-in-out flex flex-col
      ${isCollapsed ? "lg:w-24" : "lg:w-64"}
      ${isOpen ? "translate-x-0 w-64" : "-translate-x-full"} lg:translate-x-0
    `}
    >
      <div className="flex-1 overflow-y-auto overflow-x-hidden p-4">
        <div
          className={`mb-4 flex items-center ${isCollapsed ? "lg:justify-center" : "justify-between"}`}
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
            className={`hidden lg:flex items-center justify-center p-0 rounded-lg hover:bg-gray-100 dark:hover:bg-gray-800 ${isCollapsed ? "relative left-[12]" : ""} ${language === 'ar' ? "right-[12] left-0" : ""} transition-all duration-200`}
          >
            <ChevronLeftIcon
              size={18}
              className={`text-gray-500 dark:text-gray-400 transition-all duration-300 ${isCollapsed ? "rotate-180" : ""}`}
            />
          </button>
          <button
            onClick={toggleSidebar}
            className="lg:hidden ml-auto flex items-center justify-center p-2 rounded-lg hover:bg-red-50 dark:hover:bg-red-950/20 transition-all duration-200"
          >
            <XIcon
              size={20}
              className={`text-gray-500 dark:text-gray-400 hover:text-red-500 dark:hover:text-red-400 transition-colors duration-200`}
            />
          </button>
        </div>

        <nav className="space-y-1.5 px-2">
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
                  className={`${language === 'ar' ? 'mr-3' : 'ml-3'} whitespace-nowrap transition-all duration-200 ${isCollapsed ? "lg:hidden" : ""}`}
                >
                  {item.name}
                </span>
              </Link>
            );
          })}
        </nav>

        <div className={`mt-0 px-2 lg:hidden`}>{teamsContent}</div>
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
              className={`${language === 'ar' ? 'mr-3' : 'ml-3'} whitespace-nowrap transition-all duration-200 ${isCollapsed ? "lg:hidden" : ""}`}
            >
              {sidebarT.sidebar.settings}
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
              className={`${language === 'ar' ? 'mr-3' : 'ml-3'} whitespace-nowrap transition-all duration-200 ${isCollapsed ? "lg:hidden" : ""}`}
            >
              {sidebarT.sidebar.logout}
            </span>
          </button>
        </div>
      </div>
    </aside>

    <CreateChannelModal
      isOpen={isCreateChannelModalOpen}
      onClose={() => setCreateChannelModalOpen(false)}
      onChannelCreated={fetchChannels}
    />

    <ManageChannelModal
      isOpen={!!managingChannel}
      onClose={() => setManagingChannel(null)}
      channel={managingChannel}
      allUsers={users}
      onChannelUpdated={fetchChannels}
    />

    <Dialog
      open={isNewChatDialogOpen}
      onOpenChange={(isOpen) => {
        setIsNewChatDialogOpen(isOpen);
        if (!isOpen) {
          setDialogSearchQuery("");
        }
      }}
    >
      <DialogContent className="max-w-md bg-background/80 dark:bg-slate-900/95 border-border/30 shadow-2xl rounded-2xl">
        <DialogHeader className="text-left">
          <DialogTitle className="text-xl font-bold">
            {t("chat.newMessage")}
          </DialogTitle>
          <DialogDescription className="text-muted-foreground">
            {t("chat.searchPeople")}
          </DialogDescription>
        </DialogHeader>

        <div className="px-1 pt-0">
          <div className="relative">
            <Search className="absolute left-3.5 top-1/2 -translate-y-1/2 h-4 w-4 text-muted-foreground" />
            <Input
              placeholder="Search by name..."
              className="w-full bg-transparent border-2 border-border/30 focus:border-primary/50 transition-all duration-300 rounded-xl pl-10 pr-4 py-2.5 text-base"
              value={dialogSearchQuery}
              onChange={(e) => setDialogSearchQuery(e.target.value)}
            />
          </div>

          <div className="mt-4 space-y-1.5 max-h-[50vh] overflow-y-auto no-scrollbar">
            {filteredUsers.length > 0 ? (
              filteredUsers.map((user) => (
                <button
                  key={user._id}
                  onClick={() => {
                    const room = [session?.user?._id, user._id]
                      .sort()
                      .join("--");
                    handleRoomChange(room);
                    setIsNewChatDialogOpen(false);
                  }}
                  className="w-full flex items-center p-2.5 rounded-xl hover:bg-accent/50 dark:hover:bg-gray-800/50 transition-all duration-200 text-left cursor-pointer"
                >
                  <div
                    className={`relative ${language === "ar" ? "ml-3" : "mr-3"}`}
                  >
                    <Avatar className="h-9 w-9 border-2 border-border/20 dark:border-gray-700/50">
                      <AvatarImage src={user.image || undefined} />
                      <AvatarFallback className="bg-primary/10 text-primary font-semibold text-sm">
                        {user.fullName
                          .split(" ")
                          .map((n) => n[0])
                          .join("")
                          .slice(0, 2)}
                      </AvatarFallback>
                    </Avatar>
                    {user.online && (
                      <span className="absolute bottom-0 right-0 w-2.5 h-2.5 bg-green-500 rounded-full border-2 border-background shadow-sm"></span>
                    )}
                  </div>
                  <div className="flex-1">
                    <p className="font-semibold text-base text-foreground">
                      {user.fullName}
                    </p>
                    <p className="text-xs text-muted-foreground">
                      {user.email}
                    </p>
                  </div>
                </button>
              ))
            ) : (
              <div className="text-center py-12">
                <Users className="mx-auto h-12 w-12 text-muted-foreground/50" />
                <h3 className="mt-4 text-lg font-semibold text-foreground">
                  {t("chat.noUsersFound")}
                </h3>
                <p className="mt-1 text-sm text-muted-foreground">
                  {t("chat.adjustSearchOrInvite")}
                </p>
              </div>
            )}
          </div>
        </div>
      </DialogContent>
    </Dialog>
    </div>
  );
};
