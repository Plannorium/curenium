import dayjs from 'dayjs';
import hijri from 'dayjs-hijri';

// Extend dayjs with Hijri plugin
dayjs.extend(hijri);

export const formatDate = (date: Date | string, format: 'gregorian' | 'hijri' | 'both' = 'gregorian') => {
  const d = dayjs(date);

  switch (format) {
    case 'gregorian':
      return d.format('DD/MM/YYYY');
    case 'hijri':
      // For now, show Gregorian date with AH indicator
      // TODO: Implement proper Hijri conversion when dayjs-hijri is working
      return d.format('DD/MM/YYYY') + ' AH';
    case 'both':
      const gregorian = d.format('DD/MM/YYYY');
      // TODO: Add proper Hijri date when conversion is working
      return `${gregorian} (Hijri: Coming Soon)`;
    default:
      return d.format('DD/MM/YYYY');
  }
};

export const formatDateTime = (date: Date | string, format: 'gregorian' | 'hijri' | 'both' = 'gregorian') => {
  const d = dayjs(date);

  switch (format) {
    case 'gregorian':
      return d.format('DD/MM/YYYY HH:mm');
    case 'hijri':
      // For now, show Gregorian datetime with AH indicator
      return d.format('DD/MM/YYYY HH:mm') + ' AH';
    case 'both':
      const gregorian = d.format('DD/MM/YYYY HH:mm');
      return `${gregorian} (Hijri: Coming Soon)`;
    default:
      return d.format('DD/MM/YYYY HH:mm');
  }
};

export const toHijri = (date: Date | string) => {
  return dayjs(date);
};

export const fromHijri = (hijriDate: string) => {
  // Parse Hijri date string and convert to Gregorian
  // This is a simplified implementation - in production you'd want more robust parsing
  try {
    // For now, just return the original date since proper Hijri parsing is complex
    // In a full implementation, you'd use proper Hijri date parsing
    return new Date(hijriDate);
  } catch (error) {
    console.error('Error parsing Hijri date:', error);
    return new Date(hijriDate);
  }
};

import { useCalendar } from '@/components/ui/calendar-context';

// Hook for calendar-aware date formatting
export const useDateFormatter = () => {
  const { calendarType } = useCalendar();

  const formatDateWithCalendar = (date: Date | string) => {
    return formatDate(date, calendarType);
  };

  const formatDateTimeWithCalendar = (date: Date | string) => {
    return formatDateTime(date, calendarType);
  };

  return {
    formatDate: formatDateWithCalendar,
    formatDateTime: formatDateTimeWithCalendar,
    calendarType,
  };
};