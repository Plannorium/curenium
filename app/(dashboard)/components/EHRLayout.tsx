
"use client";
import React, { useState } from "react";
import {
  ChevronDownIcon,
  MessageCircle,
  Plus,
  SearchIcon,
  Users,
} from "lucide-react";

const EHRLayout = ({ children }: { children: React.ReactNode }) => {
  const [isChannelsOpen, setIsChannelsOpen] = useState(true);
  const [isDmsOpen, setIsDmsOpen] = useState(true);
  const [searchQuery, setSearchQuery] = useState("");

  return (
    <div className="flex h-full">
      <div className="hidden md:block w-64 backdrop-blur-lg bg-card/80 dark:bg-gray-900/80 border-r border-border/50 dark:border-gray-700/50 flex-shrink-0">
        <div className="p-4">
          <div className="relative">
            <input
              type="text"
              placeholder="Search..."
              className="backdrop-blur-sm bg-background/50 dark:bg-gray-800/50 border border-border/60 dark:border-gray-700/60 rounded-full w-full pl-10 pr-4 py-2.5 text-sm text-foreground placeholder:text-muted-foreground focus:border-primary/50 focus:ring-2 focus:ring-primary/10 transition-all duration-200"
              value={searchQuery}
              onChange={(e) => setSearchQuery(e.target.value)}
            />
            <div className="absolute inset-y-0 left-0 pl-3 flex items-center pointer-events-none">
              <SearchIcon size={16} className="text-muted-foreground" />
            </div>
          </div>
        </div>
        <div className="px-3 pb-2">
          <button
            onClick={() => setIsChannelsOpen(!isChannelsOpen)}
            className="flex items-center justify-between w-full px-3 py-2 text-xs font-bold text-muted-foreground uppercase tracking-wider"
          >
            <h3 className="flex items-center">
              <Users className="h-3 w-3 mr-2" />
              Menu
            </h3>
            <ChevronDownIcon
              size={16}
              className={`transform transition-transform duration-200 ${
                isChannelsOpen ? "rotate-180" : ""
              }`}
            />
          </button>
          {isChannelsOpen && (
            <div className="mt-2 space-y-1">
              <a
                href="/dashboard/ehr/patients"
                className="group flex items-center w-full px-3 py-2.5 text-sm rounded-xl font-medium transition-all duration-200 hover:bg-accent/50 dark:hover:bg-gray-800/50 text-muted-foreground hover:text-foreground"
              >
                Patients
              </a>
              {/* Additional role-based navigation items will go here */}
            </div>
          )}
        </div>
      </div>
      <div className="flex-1 bg-background">{children}</div>
    </div>
  );
};

export default EHRLayout;