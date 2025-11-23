"use client";

import React, { useMemo } from 'react';
import { Ticket } from '@/types';
import { format, startOfMonth, eachDayOfInterval, isSameDay, isToday, isWeekend, parseISO } from 'date-fns';
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card';
import { cn } from '@/lib/utils';
import { Bug, CalendarDays, MessageSquare } from 'lucide-react';

interface CustomerRoutineCalendarProps {
  tickets: Ticket[];
}

interface DayActivity {
  date: Date;
  totalTickets: number;
  bugTickets: number;
  isHighActivity: boolean;
  isBugHeavy: boolean;
}

const CustomerRoutineCalendar = ({ tickets }: CustomerRoutineCalendarProps) => {
  const calendarData = useMemo(() => {
    if (!tickets || tickets.length === 0) return [];

    const now = new Date();
    const startOfCurrentMonth = startOfMonth(now);
    const daysInMonth = eachDayOfInterval({
      start: startOfCurrentMonth,
      end: new Date(now.getFullYear(), now.getMonth() + 1, 0) // Last day of current month
    });

    const dailyActivityMap = new Map<string, { totalTickets: number; bugTickets: number }>();

    tickets.forEach(ticket => {
      const createdAt = parseISO(ticket.created_at);
      if (createdAt >= startOfCurrentMonth && createdAt <= now) { // Only consider tickets up to today in current month
        const formattedDate = format(createdAt, 'yyyy-MM-dd');
        const current = dailyActivityMap.get(formattedDate) || { totalTickets: 0, bugTickets: 0 };
        current.totalTickets++;
        if (ticket.type?.toLowerCase() === 'bug') {
          current.bugTickets++;
        }
        dailyActivityMap.set(formattedDate, current);
      }
    });

    const allDailyCounts = Array.from(dailyActivityMap.values()).map(d => d.totalTickets);
    const avgTickets = allDailyCounts.length > 0 ? allDailyCounts.reduce((sum, count) => sum + count, 0) / allDailyCounts.length : 0;
    const stdDevTickets = allDailyCounts.length > 1 ? Math.sqrt(allDailyCounts.map(x => Math.pow(x - avgTickets, 2)).reduce((a, b) => a + b) / (allDailyCounts.length - 1)) : 0;

    const allBugCounts = Array.from(dailyActivityMap.values()).map(d => d.bugTickets);
    const avgBugTickets = allBugCounts.length > 0 ? allBugCounts.reduce((sum, count) => sum + count, 0) / allBugCounts.length : 0;
    const stdDevBugTickets = allBugCounts.length > 1 ? Math.sqrt(allBugCounts.map(x => Math.pow(x - avgBugTickets, 2)).reduce((a, b) => a + b) / (allBugCounts.length - 1)) : 0;


    return daysInMonth.map(day => {
      const formattedDate = format(day, 'yyyy-MM-dd');
      const activity = dailyActivityMap.get(formattedDate) || { totalTickets: 0, bugTickets: 0 };

      const isHighActivity = activity.totalTickets > (avgTickets + stdDevTickets * 0.5); // Slightly lower threshold for "high"
      const isBugHeavy = activity.bugTickets > (avgBugTickets + stdDevBugTickets * 0.5) && activity.bugTickets > 0;

      return {
        date: day,
        totalTickets: activity.totalTickets,
        bugTickets: activity.bugTickets,
        isHighActivity,
        isBugHeavy,
      };
    });
  }, [tickets]);

  const daysOfWeek = ['Sun', 'Mon', 'Tue', 'Wed', 'Thu', 'Fri', 'Sat'];
  const firstDayOfMonth = calendarData.length > 0 ? calendarData[0].date.getDay() : 0; // 0 for Sunday, 1 for Monday, etc.

  return (
    <Card className="h-full flex flex-col">
      <CardHeader className="pb-2">
        <CardTitle className="text-lg font-semibold text-foreground flex items-center gap-2">
          <CalendarDays className="h-5 w-5 text-primary" /> Customer Routine Calendar ({format(new Date(), 'MMM yyyy')})
        </CardTitle>
      </CardHeader>
      <CardContent className="flex-grow p-4">
        <div className="grid grid-cols-7 gap-1 text-center text-xs font-medium text-muted-foreground mb-2">
          {daysOfWeek.map(day => <div key={day}>{day}</div>)}
        </div>
        <div className="grid grid-cols-7 gap-1">
          {Array.from({ length: firstDayOfMonth }).map((_, i) => (
            <div key={`empty-${i}`} className="h-10 w-full" />
          ))}
          {calendarData.map((dayActivity, index) => (
            <div
              key={index}
              className={cn(
                "relative h-10 w-full flex items-center justify-center rounded-md text-sm font-medium",
                isToday(dayActivity.date) ? "bg-primary text-primary-foreground" : "bg-gray-50 dark:bg-gray-700 text-foreground",
                isWeekend(dayActivity.date) && !isToday(dayActivity.date) ? "text-muted-foreground" : "",
                dayActivity.totalTickets > 0 && !isToday(dayActivity.date) ? "bg-blue-50 dark:bg-blue-950/30" : "",
              )}
            >
              {dayActivity.date.getDate()}
              {dayActivity.totalTickets > 0 && (
                <div className="absolute bottom-0.5 right-0.5 flex gap-0.5">
                  {dayActivity.isHighActivity && (
                    <span className="h-2 w-2 rounded-full bg-blue-500" title="High Activity Day" />
                  )}
                  {dayActivity.isBugHeavy && (
                    <span className="h-2 w-2 rounded-full bg-red-500" title="Bug Heavy Day" />
                  )}
                  {dayActivity.totalTickets > 0 && !dayActivity.isHighActivity && !dayActivity.isBugHeavy && (
                    <span className="h-2 w-2 rounded-full bg-gray-400" title="Activity Day" />
                  )}
                </div>
              )}
            </div>
          ))}
        </div>
        <div className="mt-4 text-xs text-muted-foreground space-y-1">
          <p className="flex items-center"><span className="h-3 w-3 rounded-full bg-blue-500 mr-2" /> High Activity Day (more tickets than average)</p>
          <p className="flex items-center"><span className="h-3 w-3 rounded-full bg-red-500 mr-2" /> Bug Heavy Day (more bug tickets than average)</p>
          <p className="flex items-center"><span className="h-3 w-3 rounded-full bg-gray-400 mr-2" /> Activity Day (some tickets)</p>
        </div>
      </CardContent>
    </Card>
  );
};

export default CustomerRoutineCalendar;