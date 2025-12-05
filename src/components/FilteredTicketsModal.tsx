"use client";

import React from 'react';
import {
  Dialog,
  DialogContent,
  DialogHeader,
  DialogTitle,
  DialogDescription,
} from "@/components/ui/dialog";
import { Button } from "@/components/ui/button";
import TicketTable from './TicketTable'; // Reusing the existing TicketTable
import { Ticket } from '@/types';
import { Download } from 'lucide-react';
import { exportToCsv } from '@/utils/export';
import { format } from 'date-fns';

interface FilteredTicketsModalProps {
  isOpen: boolean;
  onClose: () => void;
  title: string;
  description: string;
  tickets: Ticket[];
  onViewTicketDetails: (ticket: Ticket) => void;
}

const FilteredTicketsModal = ({ isOpen, onClose, title, description, tickets, onViewTicketDetails }: FilteredTicketsModalProps) => {
  const handleExport = () => {
    exportToCsv(tickets, `${title.replace(/\s/g, '_').toLowerCase()}_${format(new Date(), 'yyyyMMdd_HHmmss')}`);
  };

  // Pagination for the modal's ticket table
  const [currentPage, setCurrentPage] = React.useState(1);
  const itemsPerPage = 10; // Fixed items per page for modal
  const totalPages = Math.ceil(tickets.length / itemsPerPage);

  const indexOfLastItem = currentPage * itemsPerPage;
  const indexOfFirstItem = indexOfLastItem - itemsPerPage;
  const currentTicketsForTable = tickets.slice(indexOfFirstItem, indexOfLastItem);

  const handlePageChange = (pageNumber: number) => {
    setCurrentPage(pageNumber);
  };

  React.useEffect(() => {
    if (isOpen) {
      setCurrentPage(1); // Reset to first page when modal opens
    }
  }, [isOpen]);

  return (
    <Dialog open={isOpen} onOpenChange={onClose}>
      <DialogContent className="sm:max-w-[90vw] max-h-[90vh] flex flex-col">
        <DialogHeader>
          <DialogTitle className="text-2xl font-bold">{title}</DialogTitle>
          <DialogDescription className="text-sm text-gray-500 dark:text-gray-400">
            {description}
          </DialogDescription>
        </DialogHeader>

        <div className="flex justify-end mb-4">
          <Button variant="outline" onClick={handleExport} className="flex items-center gap-2">
            <Download className="h-4 w-4" /> Export CSV
          </Button>
        </div>

        <div className="flex-grow overflow-y-auto py-4">
          {tickets.length > 0 ? (
            <TicketTable
              tickets={currentTicketsForTable}
              onRowClick={onViewTicketDetails}
              currentPage={currentPage}
              totalPages={totalPages}
              onPageChange={handlePageChange}
            />
          ) : (
            <p className="text-center text-gray-500 dark:text-gray-400 py-10">
              No tickets found for this metric.
            </p>
          )}
        </div>

        <div className="flex justify-end pt-4">
          <Button onClick={onClose}>Close</Button>
        </div>
      </DialogContent>
    </Dialog>
  );
};

export default FilteredTicketsModal;