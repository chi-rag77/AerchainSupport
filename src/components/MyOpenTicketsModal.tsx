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
import TicketTable from './TicketTable';
import { Ticket } from '@/types';

interface MyOpenTicketsModalProps {
  isOpen: boolean;
  onClose: () => void;
  tickets: Ticket[];
}

const MyOpenTicketsModal = ({ isOpen, onClose, tickets }: MyOpenTicketsModalProps) => {
  const handleTicketRowClick = (ticket: Ticket) => {
    // For this modal, clicking a row will just close the modal.
    // In a more complex scenario, it could open a ticket detail modal.
    console.log("Ticket clicked in 'All Open Tickets' modal:", ticket.id);
    onClose(); 
  };

  return (
    <Dialog open={isOpen} onOpenChange={onClose}>
      <DialogContent className="sm:max-w-[90vw] max-h-[90vh] flex flex-col">
        <DialogHeader>
          <DialogTitle className="text-2xl font-bold">All Open Tickets</DialogTitle>
          <DialogDescription className="text-sm text-gray-500 dark:text-gray-400">
            All tickets currently in an 'Open' or active status.
          </DialogDescription>
        </DialogHeader>

        <div className="flex-grow overflow-y-auto py-4">
          {tickets.length > 0 ? (
            <TicketTable tickets={tickets} onRowClick={handleTicketRowClick} />
          ) : (
            <p className="text-center text-gray-500 dark:text-gray-400 py-10">
              No open tickets found.
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

export default MyOpenTicketsModal;