import { format } from 'date-fns';
import { toHijri, toGregorian } from 'hijri-converter';

export const formatDate = (date: Date | string, formatType: 'gregorian' | 'hijri' | 'both' = 'gregorian') => {
  const d = new Date(date);

  switch (formatType) {
    case 'gregorian':
      return format(d, 'dd/MM/yyyy');
    case 'hijri':
      try {
        const hijri = toHijri(d.getFullYear(), d.getMonth() + 1, d.getDate());
        return `${hijri.hd}/${hijri.hm}/${hijri.hy} AH`;
      } catch (error) {
        console.error('Error converting to Hijri:', error);
        return format(d, 'dd/MM/yyyy') + ' AH';
      }
    case 'both':
      const gregorian = format(d, 'dd/MM/yyyy');
      try {
        const hijri = toHijri(d.getFullYear(), d.getMonth() + 1, d.getDate());
        return `${gregorian} (${hijri.hd}/${hijri.hm}/${hijri.hy} AH)`;
      } catch (error) {
        return `${gregorian} (Hijri: Error)`;
      }
    default:
      return format(d, 'dd/MM/yyyy');
  }
};

export const formatDateTime = (date: Date | string, formatType: 'gregorian' | 'hijri' | 'both' = 'gregorian') => {
  const d = new Date(date);

  switch (formatType) {
    case 'gregorian':
      return format(d, 'dd/MM/yyyy HH:mm');
    case 'hijri':
      try {
        const hijri = toHijri(d.getFullYear(), d.getMonth() + 1, d.getDate());
        return `${hijri.hd}/${hijri.hm}/${hijri.hy} AH ${format(d, 'HH:mm')}`;
      } catch (error) {
        return format(d, 'dd/MM/yyyy HH:mm') + ' AH';
      }
    case 'both':
      const gregorian = format(d, 'dd/MM/yyyy HH:mm');
      try {
        const hijri = toHijri(d.getFullYear(), d.getMonth() + 1, d.getDate());
        return `${gregorian} (${hijri.hd}/${hijri.hm}/${hijri.hy} AH)`;
      } catch (error) {
        return `${gregorian} (Hijri: Error)`;
      }
    default:
      return format(d, 'dd/MM/yyyy HH:mm');
  }
};

export const convertToHijri = (date: Date | string) => {
  const d = new Date(date);
  return toHijri(d.getFullYear(), d.getMonth() + 1, d.getDate());
};

export const convertFromHijri = (hy: number, hm: number, hd: number) => {
  return toGregorian(hy, hm, hd);
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