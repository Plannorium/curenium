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
          const contentType = response.headers.get('content-type');
          if (contentType && contentType.includes('application/json')) {
            const data = await response.json() as { calendarType?: CalendarType };
            if (data.calendarType) {
              setCalendarType(data.calendarType);
            }
          } else {
            // If response is not JSON (e.g., HTML error page), skip silently
            console.warn('Calendar settings API returned non-JSON response');
          }
        } else if (response.status === 401) {
          // User not authenticated, use default calendar type
          console.log('User not authenticated, using default calendar type');
        } else {
          console.error('Failed to fetch calendar type:', response.status);
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
        const contentType = response.headers.get('content-type');
        if (contentType && contentType.includes('application/json')) {
          const settings = await response.json() as object;
          await fetch('/api/settings/display', {
            method: 'POST',
            headers: { 'Content-Type': 'application/json' },
            body: JSON.stringify({ ...settings, calendarType: type }),
          });
        } else {
          // If response is not JSON, try to update with just calendarType
          await fetch('/api/settings/display', {
            method: 'POST',
            headers: { 'Content-Type': 'application/json' },
            body: JSON.stringify({ calendarType: type }),
          });
        }
      } else if (response.status === 401) {
        // User not authenticated, silently fail
        console.log('Cannot update calendar type: user not authenticated');
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