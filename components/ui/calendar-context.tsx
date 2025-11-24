"use client";

import React, { createContext, useContext, useState, useEffect, ReactNode } from 'react';

type CalendarType = 'gregorian' | 'hijri';

interface CalendarContextType {
  calendarType: CalendarType;
  setCalendarType: (type: CalendarType) => void;
}

const CalendarContext = createContext<CalendarContextType | undefined>(undefined);

export const CalendarProvider: React.FC<{ children: ReactNode }> = ({ children }) => {
  const [calendarType, setCalendarType] = useState<CalendarType>('gregorian');

  useEffect(() => {
    // Fetch user's calendar preference from display settings
    const fetchCalendarType = async () => {
      try {
        const response = await fetch('/api/settings/display');
        if (response.ok) {
          const data = await response.json() as { calendarType?: CalendarType };
          if (data.calendarType) {
            setCalendarType(data.calendarType);
          }
        }
      } catch (error) {
        console.error('Failed to fetch calendar type:', error);
      }
    };

    fetchCalendarType();

    // Refetch when window gets focus to sync across tabs
    const handleFocus = () => fetchCalendarType();
    window.addEventListener('focus', handleFocus);

    return () => window.removeEventListener('focus', handleFocus);
  }, []);

  const updateCalendarType = async (type: CalendarType) => {
    setCalendarType(type);
    // Fetch existing settings and update only the calendarType
    try {
      const response = await fetch('/api/settings/display');
      if (response.ok) {
        const settings = await response.json() as object;
        await fetch('/api/settings/display', {
          method: 'POST',
          headers: { 'Content-Type': 'application/json' },
          body: JSON.stringify({ ...settings, calendarType: type }),
        });
      } else {
        await fetch('/api/settings/display', {
          method: 'POST',
          headers: { 'Content-Type': 'application/json' },
          body: JSON.stringify({ calendarType: type }),
        });
      }
    } catch (error) {
      console.error('Failed to update calendar type:', error);
    }
  };

  return (
    <CalendarContext.Provider value={{ calendarType, setCalendarType: updateCalendarType }}>
      {children}
    </CalendarContext.Provider>
  );
};

export const useCalendar = (): CalendarContextType => {
  const context = useContext(CalendarContext);
  if (context === undefined) {
    throw new Error('useCalendar must be used within a CalendarProvider');
  }
  return context;
};