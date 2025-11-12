import { useState, useEffect } from "react";
import { useDebounce } from "use-debounce";
import { Input } from "@/components/ui/input";
import { Patient } from "@/types/patient";
import { Loader2, UserPlus, SearchIcon } from "lucide-react";
import { Button } from "@/components/ui/button";

interface PatientSearchProps {
  onSelectPatient: (patient: Patient) => void;
  onCreateNew: () => void;
}

export default function PatientSearch({ onSelectPatient, onCreateNew }: PatientSearchProps) {
  const [query, setQuery] = useState("");
  const [debouncedQuery] = useDebounce(query, 300);
  const [results, setResults] = useState<Patient[]>([]);
  const [loading, setLoading] = useState(false);
  const [isFocused, setIsFocused] = useState(false);

  useEffect(() => {
    if (debouncedQuery) {
      setLoading(true);
      fetch(`/api/patients?q=${debouncedQuery}`)
        .then((res) => res.json() as Promise<Patient[]>)
        .then((data) => {
          setResults(data);
          setLoading(false);
        });
    } else {
      setResults([]);
    }
  }, [debouncedQuery]);

  return (
    <div className="relative w-full max-w-md mx-auto">
      <div className="flex items-center bg-white dark:bg-gray-950 rounded-lg shadow-md border border-gray-200 dark:border-gray-800">
        <div className="pl-4 pr-2 py-3">
          <SearchIcon className="h-5 w-5 text-gray-400 dark:text-gray-500" />
        </div>
        <Input 
          placeholder="Search for a patient by name or MRN..." 
          value={query} 
          onChange={(e) => setQuery(e.target.value)} 
          onFocus={() => setIsFocused(true)}
          onBlur={() => setTimeout(() => setIsFocused(false), 100)} // Delay to allow click on results
          className="flex-1 bg-transparent border-none focus:outline-none focus:ring-0 text-gray-900 dark:text-white placeholder:text-gray-500 dark:placeholder:text-gray-400 text-sm"
        />
        {loading && <Loader2 className="h-5 w-5 animate-spin text-primary mr-3" />} 
      </div>

      {isFocused && (
        <div className="absolute z-20 w-full mt-2 rounded-lg shadow-lg bg-white dark:bg-gray-950 border border-gray-200 dark:border-gray-800 overflow-hidden">
          {results.length > 0 ? (
            <ul className="py-1 text-sm text-gray-700 dark:text-gray-200 divide-y divide-gray-100 dark:divide-gray-800">
              {results.map((patient) => ( 
                <li 
                  key={patient._id} 
                  className="px-4 py-3 cursor-pointer hover:bg-gray-100 dark:hover:bg-gray-800 transition-colors duration-150" 
                  onClick={() => {
                    onSelectPatient(patient);
                    setQuery('');
                  }} 
                > 
                  <p className="font-semibold text-gray-900 dark:text-white">{patient.firstName} {patient.lastName}</p> 
                  <p className="text-xs text-gray-500 dark:text-gray-400">MRN: {patient.mrn}</p> 
                </li> 
              ))} 
            </ul>
          ) : (
            <div className="p-4 text-center text-sm text-gray-500 dark:text-gray-400">
              {loading ? 'Searching...' : (debouncedQuery ? 'No patients found.' : 'Start typing to search.')}
            </div>
          )}
          <div className="border-t border-gray-100 dark:border-gray-800 p-2">
            <Button 
              variant="ghost"
              className="w-full justify-start text-sm" 
              onClick={onCreateNew}
            >
              <UserPlus className="h-4 w-4 mr-2" />
              Create New Patient
            </Button>
          </div>
        </div> 
      )}
    </div>
  );
}