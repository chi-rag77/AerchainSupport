"use client";

import React from 'react';
import TicketTable from './TicketTable';
import { Ticket } from '@/types';
import TicketDetailModal from './TicketDetailModal';
import { useState } from 'react';

interface CustomerTicketsTableProps {
  tickets: Ticket[];
}

const CustomerTicketsTable = ({ tickets }: CustomerTicketsTableProps) => {
  const [selectedTicket, setSelectedTicket] = useState<Ticket | null>(null);
  const [isModalOpen, setIsModalOpen] = useState(false);

  const handleRowClick = (ticket: Ticket) => {
    setSelectedTicket(ticket);
    setIsModalOpen(true);
  };

  const handleCloseModal = () => {
    setIsModalOpen(false);
    setSelectedTicket(null);
  };

  return (
    <div className="w-full">
      <TicketTable tickets={tickets} onRowClick={handleRowClick} />
      {selectedTicket && (
        <TicketDetailModal
          isOpen={isModalOpen}
          onClose={handleCloseModal}
          ticket={selectedTicket}
        />
      )}
    </div>
  );
};

export default CustomerTicketsTable;