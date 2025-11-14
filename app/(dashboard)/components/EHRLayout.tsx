"use client";
import React, { useState, useMemo } from "react";
import {
  ChevronDownIcon,
  SearchIcon,
  Users,
} from "lucide-react";
import { Avatar, AvatarFallback, AvatarImage } from "@/components/ui/avatar";

interface Patient {
  id: string;
  name: string;
  mrn: string;
  avatar?: string;
}

const mockPatients: Patient[] = [
  { id: '1', name: 'John Doe', mrn: 'MRN12345' },
  { id: '2', name: 'Jane Smith', mrn: 'MRN67890' },
  { id: '3', name: 'Peter Jones', mrn: 'MRN11223' },
];

const EHRLayout = ({ children }: { children: React.ReactNode }) => {
  const [isChannelsOpen, setIsChannelsOpen] = useState(true);
  const [isDmsOpen, setIsDmsOpen] = useState(true);
  const [searchQuery, setSearchQuery] = useState("");
  const [patientSearchQuery, setPatientSearchQuery] = useState('');

  const filteredPatients = useMemo(() => {
    if (!patientSearchQuery) {
      return mockPatients;
    }
    return mockPatients.filter(patient =>
      patient.name.toLowerCase().includes(patientSearchQuery.toLowerCase()) ||
      patient.mrn.toLowerCase().includes(patientSearchQuery.toLowerCase())
    );
  }, [patientSearchQuery]);

  const handlePatientSearch = (e: React.ChangeEvent<HTMLInputElement>) => {
    setPatientSearchQuery(e.target.value);
  };



  const renderSidebarContent = () => (
    <>
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