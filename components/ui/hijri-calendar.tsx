"use client";

import React, { useState, useEffect } from 'react';
import { Button } from './button';
import { Card, CardContent, CardHeader, CardTitle } from './card';
import { ChevronLeft, ChevronRight, Calendar as CalendarIcon } from 'lucide-react';
import dayjs from 'dayjs';
import { formatDate } from '@/lib/date-utils';
import { toHijri } from 'hijri-converter';

interface HijriCalendarProps {
  selectedDate?: Date;
  onDateSelect?: (date: Date) => void;
  calendarType?: 'gregorian' | 'hijri';
  onCalendarTypeChange?: (type: 'gregorian' | 'hijri') => void;
  highlightedDays?: Date[];
}

const HijriCalendar: React.FC<HijriCalendarProps> = ({
  selectedDate,
  onDateSelect,
  calendarType = 'gregorian',
  onCalendarTypeChange,
  highlightedDays = []
}) => {
  const [currentDate, setCurrentDate] = useState(dayjs());
  const [selected, setSelected] = useState(dayjs(selectedDate));

  useEffect(() => {
    if (selectedDate) {
      setSelected(dayjs(selectedDate));
    }
  }, [selectedDate]);

  const getDaysInMonth = () => {
    const daysInMonth = currentDate.daysInMonth();
    const firstDay = currentDate.date(1).day();
    const days: (number | null)[] = [];

    // Add empty cells for days before the first day of the month
    for (let i = 0; i < firstDay; i++) {
      days.push(null);
    }

    // Add days of the month
    for (let day = 1; day <= daysInMonth; day++) {
      days.push(day);
    }

    return days;
  };

  const handleDateClick = (day: number) => {
    const gregorianDate = currentDate.date(day);
    setSelected(gregorianDate);
    onDateSelect?.(gregorianDate.toDate());
  };

  const navigateMonth = (direction: 'prev' | 'next') => {
    setCurrentDate(prev =>
      direction === 'next'
        ? prev.add(1, 'month')
        : prev.subtract(1, 'month')
    );
  };

  const arabicMonths = [
    'محرم', 'صفر', 'ربيع الأول', 'ربيع الآخر', 'جمادى الأولى',
    'جمادى الآخرة', 'رجب', 'شعبان', 'رمضان', 'شوال', 'ذو القعدة', 'ذو الحجة'
  ];

  const getMonthName = () => {
    if (calendarType === 'hijri') {
      try {
        const hijri = toHijri(currentDate.year(), currentDate.month() + 1, 1);
        return `${arabicMonths[hijri.hm - 1]} ${hijri.hy} هـ`;
      } catch (error) {
        console.error('Error converting month to Hijri:', error);
        const gregorian = currentDate.format('MMMM YYYY');
        return `${gregorian} AH`;
      }
    } else {
      return currentDate.format('MMMM YYYY');
    }
  };

  const isSelected = (day: number) => {
    return selected.isSame(currentDate.date(day), 'day');
  };

  const isToday = (day: number) => {
    return dayjs().isSame(currentDate.date(day), 'day');
  };

  const isHighlighted = (day: number) => {
    const date = currentDate.date(day);
    return highlightedDays.some(highlightedDay =>
      dayjs(highlightedDay).isSame(date, 'day')
    );
  };
  return (
    <Card className="w-full max-w-md dark:bg-slate-900/80">
      <CardHeader className="pb-4">
        <div className="flex items-center justify-between">
          <CardTitle className="flex items-center gap-2">
            <CalendarIcon className="h-5 w-5" />
            {getMonthName()}
          </CardTitle>
          <div className="flex items-center gap-2">
            <Button
              variant={calendarType === 'gregorian' ? 'default' : 'outline'}
              size="sm"
              onClick={() => onCalendarTypeChange?.('gregorian')}
            >
              AD
            </Button>
            <Button
              variant={calendarType === 'hijri' ? 'default' : 'outline'}
              size="sm"
              onClick={() => onCalendarTypeChange?.('hijri')}
            >
              AH
            </Button>
          </div>
        </div>
        <div className="flex items-center justify-between">
          <Button variant="ghost" size="sm" onClick={() => navigateMonth('prev')}>
            <ChevronLeft className="h-4 w-4" />
          </Button>
          <Button variant="ghost" size="sm" onClick={() => navigateMonth('next')}>
            <ChevronRight className="h-4 w-4" />
          </Button>
        </div>
      </CardHeader>
      <CardContent>
        <div className="grid grid-cols-7 gap-1 mb-2">
          {['Sun', 'Mon', 'Tue', 'Wed', 'Thu', 'Fri', 'Sat'].map(day => (
            <div key={day} className="text-center text-sm font-medium text-muted-foreground py-2">
              {day}
            </div>
          ))}
        </div>
        <div className="grid grid-cols-7 gap-1">
          {getDaysInMonth().map((day, index) => {
            let displayDay = day;
            let hijriInfo = '';

            if (day) {
              const gregorianDate = currentDate.date(day);
              if (calendarType === 'hijri') {
                try {
                  const hijri = toHijri(gregorianDate.year(), gregorianDate.month() + 1, gregorianDate.date());
                  displayDay = hijri.hd;
                  hijriInfo = `${hijri.hd}/${hijri.hm}/${hijri.hy} AH`;
                } catch (error) {
                  console.error('Error converting to Hijri:', error);
                  displayDay = day;
                  hijriInfo = formatDate(gregorianDate.toDate(), 'hijri');
                }
              } else {
                hijriInfo = formatDate(gregorianDate.toDate(), 'hijri');
              }
            }

            return (
              <Button
                key={index}
                variant={day && isSelected(day) ? 'default' : 'ghost'}
                size="sm"
                className={`h-8 w-8 p-0 text-xs ${
                  day && isToday(day) && !isSelected(day)
                    ? 'bg-accent text-accent-foreground'
                    : ''
                } ${
                  day && isHighlighted(day) && !isSelected(day)
                    ? 'relative after:content-[""] after:absolute after:bottom-1 after:left-1/2 after:-translate-x-1/2 after:w-1 after:h-1 after:rounded-full after:bg-primary' : ''
                }`}
                onClick={() => day && handleDateClick(day)}
                disabled={!day}
                title={day ? (calendarType === 'hijri' ? `Gregorian: ${day}, Hijri: ${hijriInfo}` : `Gregorian: ${day}, Hijri: ${hijriInfo}`) : undefined}
              >
                {displayDay || day}
              </Button>
            );
          })}
        </div>
      </CardContent>
    </Card>
  );
};

export default HijriCalendar;