"use client";
import React, { useState } from "react";
import { ChevronDownIcon, Users } from "lucide-react";
import { Stethoscope } from "lucide-react";
import Link from "next/link";
import { usePathname } from "next/navigation";
import { cn } from "@/lib/utils";

const EHRLayout = ({ children }: { children: React.ReactNode }) => {
  const [isMenuOpen, setIsMenuOpen] = useState(true);
  const pathname = usePathname();

  const menuItems = [
    { href: "/dashboard/ehr/patients", label: "All Patients" },
    { href: "/dashboard/ehr/appointments", label: "Appointments" },
    { href: "/dashboard/ehr/audit-logs", label: "Audit Logs" },
  ];

  const renderSidebarContent = () => (
    <>
      <div className="px-3 pb-2 pt-4">
        <button
          onClick={() => setIsMenuOpen(!isMenuOpen)}
          className="flex items-center justify-between w-full px-3 py-2 text-xs font-bold text-muted-foreground uppercase tracking-wider"
        >
          <h3 className="flex items-center">
            <Stethoscope className="h-3 w-3 mr-2" />
            EHR Menu
          </h3>
          <ChevronDownIcon
            size={16}
            className={`transform transition-transform duration-200 ${
              isMenuOpen ? "rotate-180" : ""
            }`}
          />
        </button>
        {isMenuOpen && (
          <div className="mt-2 space-y-1">
            {menuItems.map((item) => {
              const isActive = pathname === item.href;
              return (
                <Link
                  key={item.href}
                  href={item.href}
                  className={cn(
                    "group flex items-center w-full px-2 py-1.5 md:px-3 md:py-2.5 text-sm rounded-xl font-medium transition-all duration-200",
                    isActive ? "bg-primary/10 text-primary" : "hover:bg-accent/50 dark:hover:bg-gray-800/50 text-muted-foreground hover:text-foreground"
                  )}
                >
                  {item.label}
                </Link>
              );
            })}
          </div>
        )}
      </div>
    </>
  );


  return (
    <div className="flex h-full flex-col md:flex-row">
      {/* Desktop Sidebar */}
      <div className="hidden md:block w-64 backdrop-blur-lg bg-card/80 dark:bg-gray-900/80 border-r border-border/50 dark:border-gray-700/50 flex-shrink-0">
        {renderSidebarContent()}
      </div>

      <div className="flex flex-1 flex-col">
        {/* Main Content */}
        <div className="flex-1 bg-background overflow-y-auto">
          <div className="h-full">{children}</div>
        </div>
      </div>
    </div>
  );
};

export default EHRLayout;