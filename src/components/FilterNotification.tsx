"use client";

import React from 'react';
import { Ticket } from '@/types';
import { Info } from 'lucide-react';
import { cn } from '@/lib/utils';

interface FilterNotificationProps {
  filteredCount: number;
  totalCount: number;
  searchTerm: string;
  filterStatus: string;
  filterPriority: string;
  filterAssignee: string;
  filterCompany: string;
  filterType: string;
  filterDependency: string;
  className?: string; // Added className prop
}

const FilterNotification = ({
  filteredCount,
  totalCount,
  searchTerm,
  filterStatus,
  filterPriority,
  filterAssignee,
  filterCompany,
  filterType,
  filterDependency,
  className, // Destructure className
}: FilterNotificationProps) => {
  const activeFilters: string[] = [];

  if (searchTerm) {
    activeFilters.push(`matching "${searchTerm}"`);
  }
  if (filterStatus !== "All") {
    activeFilters.push(`status "${filterStatus}"`);
  }
  if (filterPriority !== "All") {
    activeFilters.push(`priority "${filterPriority}"`);
  }
  if (filterAssignee !== "All") {
    activeFilters.push(`assigned to "${filterAssignee}"`);
  }
  if (filterCompany !== "All") {
    activeFilters.push(`for company "${filterCompany}"`);
  }
  if (filterType !== "All") {
    activeFilters.push(`of type "${filterType}"`);
  }
  if (filterDependency !== "All") {
    activeFilters.push(`with dependency "${filterDependency}"`);
  }

  let message: React.ReactNode;
  let icon = <Info className="h-4 w-4 mr-2" />;
  let bgColor = "bg-blue-50 dark:bg-blue-950";
  let textColor = "text-blue-800 dark:text-blue-200";

  if (filteredCount === 0) {
    message = "No tickets match the selected filters.";
    bgColor = "bg-red-50 dark:bg-red-950";
    textColor = "text-red-800 dark:text-red-200";
  } else if (activeFilters.length === 0) {
    message = `Showing all ${totalCount} tickets.`;
  } else {
    const filterDescription = activeFilters.join(", ");
    message = `${filteredCount} tickets ${filterDescription}.`;
  }

  return (
    <div className={cn(
      "flex items-center p-3 rounded-md text-sm font-medium mb-4",
      bgColor,
      textColor,
      className // Apply external className
    )}>
      {icon}
      {message}
    </div>
  );
};

export default FilterNotification;