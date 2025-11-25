"use client";

import React, { useMemo, useState, useEffect } from "react";
import {
  Table,
  TableBody,
  TableCell,
  TableHead,
  TableHeader,
  TableRow,
} from "@/components/ui/table";
import { Button } from "@/components/ui/button";
import { Badge } from "@/components/ui/badge";
import { Avatar, AvatarFallback } from "@/components/ui/avatar";
import { Tooltip, TooltipContent, TooltipTrigger } from "@/components/ui/tooltip";
import { Pagination, PaginationContent, PaginationItem, PaginationLink, PaginationNext, PaginationPrevious, PaginationEllipsis } from "@/components/ui/pagination";
import { ChevronLeft, ChevronRight, ArrowUpDown, Filter as FilterIcon, SortAsc, SortDesc } from 'lucide-react';
import { Ticket } from '@/types';
import { format, formatDistanceToNowStrict, differenceInDays } from 'date-fns';
import { cn } from '@/lib/utils';

// Constants from user's provided component
const ROW_HEIGHT_PX = 56;
const DEFAULT_PAGE_SIZE = 20;

type SortColumn = 'id' | 'subject' | 'assignee' | 'status' | 'ageing' | 'created_at' | null;
type SortDirection = 'asc' | 'desc' | null;

interface TicketTableProps {
  tickets: Ticket[]; // array of ticket objects (client-side mode)
  serverCount?: number | null; // optional total count from server
  fetchPage?: ((page: number, pageSize: number, sortColumn: SortColumn, sortDirection: SortDirection) => Promise<{ rows: Ticket[]; total: number }>) | null; // optional async (page, pageSize) => { rows, total }
  initialPage?: number;
  pageSize?: number;
  onRowClick: (ticket: Ticket) => void;
}

export default function TicketTable({
  tickets = [],
  serverCount = null,
  fetchPage = null,
  initialPage = 1,
  pageSize = DEFAULT_PAGE_SIZE,
  onRowClick,
}: TicketTableProps) {
  const [page, setPage] = useState(initialPage);
  const [localRows, setLocalRows] = useState<Ticket[]>(tickets);
  const [loading, setLoading] = useState(false);
  const [sortColumn, setSortColumn] = useState<SortColumn>(null);
  const [sortDirection, setSortDirection] = useState<SortDirection>(null);

  const isServer = typeof fetchPage === "function";

  // If client-side and tickets change, refresh localRows
  useEffect(() => {
    if (!isServer) setLocalRows(tickets);
  }, [tickets, isServer]);

  // server-side page loader
  useEffect(() => {
    if (isServer) {
      let mounted = true;
      setLoading(true);
      fetchPage(page, pageSize, sortColumn, sortDirection)
        .then((res) => {
          if (!mounted) return;
          setLocalRows(res.rows || []);
          // Note: serverCount prop should be updated by parent if server returns total
        })
        .catch((err) => console.error(err))
        .finally(() => mounted && setLoading(false));
      return () => { mounted = false; };
    }
  }, [fetchPage, page, pageSize, isServer, sortColumn, sortDirection]);

  const sortedAndFilteredTickets = useMemo(() => {
    let currentTickets = isServer ? localRows : tickets;

    if (sortColumn && sortDirection) {
      currentTickets = [...currentTickets].sort((a, b) => {
        let valA: any;
        let valB: any;

        switch (sortColumn) {
          case 'id':
            valA = parseInt(a.id, 10);
            valB = parseInt(b.id, 10);
            break;
          case 'subject':
            valA = a.subject.toLowerCase();
            valB = b.subject.toLowerCase();
            break;
          case 'assignee':
            valA = (a.assignee || a.requester_email.split('@')[0] || '').toLowerCase();
            valB = (b.assignee || b.requester_email.split('@')[0] || '').toLowerCase();
            break;
          case 'status':
            valA = a.status.toLowerCase();
            valB = b.status.toLowerCase();
            break;
          case 'ageing':
            valA = calculateAgeing(a);
            valB = calculateAgeing(b);
            break;
          case 'created_at':
            valA = new Date(a.created_at).getTime();
            valB = new Date(b.created_at).getTime();
            break;
          default:
            return 0;
        }

        if (valA < valB) return sortDirection === 'asc' ? -1 : 1;
        if (valA > valB) return sortDirection === 'asc' ? 1 : -1;
        return 0;
      });
    }
    return currentTickets;
  }, [isServer, localRows, tickets, sortColumn, sortDirection]);

  // Compute visible rows depending on mode
  const { visibleRows, total } = useMemo(() => {
    const totalRows = sortedAndFilteredTickets.length;
    const start = (page - 1) * pageSize;
    const end = start + pageSize;
    return { visibleRows: sortedAndFilteredTickets.slice(start, end), total: totalRows };
  }, [sortedAndFilteredTickets, page, pageSize]);

  const totalPages = Math.max(1, Math.ceil(total / pageSize));

  const handleSort = (column: SortColumn) => {
    if (sortColumn === column) {
      setSortDirection(prev => {
        if (prev === 'asc') return 'desc';
        if (prev === 'desc') return null; // Cycle to no sort
        return 'asc';
      });
    } else {
      setSortColumn(column);
      setSortDirection('asc');
    }
    setPage(1); // Reset to first page on sort change
  };

  const getStatusBadgeClasses = (status: string) => {
    switch (status.toLowerCase()) {
      case 'open (being processed)': return 'bg-blue-100 text-blue-800 dark:bg-blue-900 dark:text-blue-200';
      case 'pending (awaiting your reply)': return 'bg-yellow-100 text-yellow-800 dark:bg-yellow-900 dark:text-yellow-200';
      case 'resolved': return 'bg-green-100 text-green-800 dark:bg-green-900 dark:text-green-200';
      case 'closed': return 'bg-gray-100 text-gray-800 dark:bg-gray-700 dark:text-gray-200';
      case 'escalated': return 'bg-red-100 text-red-800 dark:bg-red-900 dark:text-red-200';
      case 'waiting on customer': return 'bg-purple-100 text-purple-800 dark:bg-purple-900 dark:text-purple-200';
      case 'on tech': return 'bg-indigo-100 text-indigo-800 dark:bg-indigo-900 dark:text-indigo-200';
      case 'on product': return 'bg-pink-100 text-pink-800 dark:bg-pink-900 dark:text-pink-200';
      default: return 'bg-gray-100 text-gray-800 dark:bg-gray-700 dark:text-gray-200';
    }
  };

  const calculateAgeing = (ticket: Ticket) => {
    const createdAt = new Date(ticket.created_at);
    const now = new Date();
    const statusLower = ticket.status.toLowerCase();

    if (statusLower === 'resolved' || statusLower === 'closed') {
      const updatedAt = new Date(ticket.updated_at);
      return differenceInDays(updatedAt, createdAt);
    } else {
      return differenceInDays(now, createdAt);
    }
  };

  const formatTimeAgo = (dateString: string) => {
    const date = new Date(dateString);
    return formatDistanceToNowStrict(date, { addSuffix: true });
  };

  const getPageNumbers = (currentPage: number, totalPages: number, maxPageNumbersToShow: number = 5) => {
    const pageNumbers: (number | 'ellipsis')[] = [];
    const half = Math.floor(maxPageNumbersToShow / 2);

    let startPage = Math.max(1, currentPage - half);
    let endPage = Math.min(totalPages, currentPage + half);

    if (endPage - startPage + 1 < maxPageNumbersToShow) {
      if (startPage === 1) {
        endPage = Math.min(totalPages, startPage + maxPageNumbersToShow - 1);
      } else if (endPage === totalPages) {
        startPage = Math.max(1, totalPages - maxPageNumbersToShow + 1);
      }
    }

    if (startPage > 1) {
      pageNumbers.push(1);
      if (startPage > 2) {
        pageNumbers.push('ellipsis');
      }
    }

    for (let i = startPage; i <= endPage; i++) {
      pageNumbers.push(i);
    }

    if (endPage < totalPages) {
      if (endPage < totalPages - 1) {
        pageNumbers.push('ellipsis');
      }
      pageNumbers.push(totalPages);
    }

    return pageNumbers;
  };

  const displayedPageNumbers = getPageNumbers(page, totalPages);

  const renderSortAndFilterIcons = (column: SortColumn) => (
    <span className="ml-2 flex items-center text-muted-foreground">
      {sortColumn === column ? (
        sortDirection === 'asc' ? (
          <SortAsc className="h-3 w-3 text-primary" />
        ) : sortDirection === 'desc' ? (
          <SortDesc className="h-3 w-3 text-primary" />
        ) : (
          <ArrowUpDown className="h-3 w-3 opacity-50" />
        )
      ) : (
        <ArrowUpDown className="h-3 w-3 opacity-50 hover:opacity-100" />
      )}
      <FilterIcon className="h-3 w-3 opacity-50 hover:opacity-100 cursor-pointer ml-1" />
    </span>
  );

  return (
    <div className="w-full">
      <div className="overflow-hidden border rounded-md">
        <Table className="min-w-full">
          <TableHeader className="sticky top-0 z-10 bg-gray-100 dark:bg-gray-700">
            <TableRow>
              <TableHead className="w-[100px] py-2 whitespace-nowrap cursor-pointer" onClick={() => handleSort('id')}>
                <div className="flex items-center">Code {renderSortAndFilterIcons('id')}</div>
              </TableHead>
              <TableHead className="py-2 whitespace-nowrap cursor-pointer" onClick={() => handleSort('subject')}>
                <div className="flex items-center">Subject {renderSortAndFilterIcons('subject')}</div>
              </TableHead>
              <TableHead className="py-2 whitespace-nowrap cursor-pointer" onClick={() => handleSort('assignee')}>
                <div className="flex items-center">Created By {renderSortAndFilterIcons('assignee')}</div>
              </TableHead>
              <TableHead className="py-2 whitespace-nowrap cursor-pointer" onClick={() => handleSort('status')}>
                <div className="flex items-center">Status {renderSortAndFilterIcons('status')}</div>
              </TableHead>
              <TableHead className="py-2 whitespace-nowrap">
                <div className="flex items-center">Approver Role(s)</div>
              </TableHead>
              <TableHead className="py-2 whitespace-nowrap">
                <div className="flex items-center">Approver(s)</div>
              </TableHead>
              <TableHead className="py-2 text-right whitespace-nowrap cursor-pointer" onClick={() => handleSort('ageing')}>
                <div className="flex items-center justify-end">Ageing {renderSortAndFilterIcons('ageing')}</div>
              </TableHead>
              <TableHead className="py-2 text-right whitespace-nowrap cursor-pointer" onClick={() => handleSort('created_at')}>
                <div className="flex items-center justify-end">Created {renderSortAndFilterIcons('created_at')}</div>
              </TableHead>
            </TableRow>
          </TableHeader>

          {/* Scrollable table body */}
          <div
            className="overflow-y-auto"
            style={{ maxHeight: `calc(${pageSize * ROW_HEIGHT_PX}px + 8px)` }} // Dynamic height based on page size
            role="region"
            aria-label="tickets table body"
            tabIndex={0}
          >
            <TableBody>
              {loading ? (
                <TableRow>
                  <TableCell colSpan={8} className="h-24 text-center text-gray-500 dark:text-gray-400 py-3">
                    Loading...
                  </TableCell>
                </TableRow>
              ) : visibleRows.length === 0 ? (
                <TableRow>
                  <TableCell colSpan={8} className="h-24 text-center text-gray-500 dark:text-gray-400 py-3">
                    No tickets to show
                  </TableCell>
                </TableRow>
              ) : (
                visibleRows.map((ticket, index) => {
                  const createdBy = ticket.assignee || ticket.requester_email.split('@')[0] || 'Unknown';
                  const createdByInitials = createdBy.split(' ').map(n => n[0]).join('').substring(0, 2).toUpperCase();

                  return (
                    <TableRow
                      key={ticket.id}
                      onClick={() => onRowClick(ticket)}
                      className={cn(
                        `cursor-pointer transition-all duration-200 ease-in-out hover:bg-gray-50 dark:hover:bg-gray-700 hover:scale-[1.005]`,
                        index % 2 === 0 ? 'bg-white dark:bg-gray-800' : 'bg-gray-50 dark:bg-gray-750',
                        ticket.status.toLowerCase() === 'escalated' ? 'bg-red-50/50 dark:bg-red-950/30' : ''
                      )}
                      style={{ minHeight: `${ROW_HEIGHT_PX}px` }}
                    >
                      <TableCell className="font-medium py-2">
                        <Button variant="link" className="p-0 h-auto text-blue-600 dark:text-blue-400" onClick={(e) => { e.stopPropagation(); onRowClick(ticket); }}>
                          {ticket.id}
                        </Button>
                      </TableCell>
                      <TableCell className="py-2">{ticket.subject}</TableCell>
                      <TableCell className="py-2">
                        <Tooltip>
                          <TooltipTrigger asChild>
                            <div className="flex items-center">
                              <Avatar className="h-6 w-6 mr-2 border border-gray-200 dark:border-gray-600 shadow-sm">
                                <AvatarFallback className="text-xs bg-gray-200 dark:bg-gray-700">
                                  {createdByInitials}
                                </AvatarFallback>
                              </Avatar>
                              <span className="text-sm">{createdBy}</span>
                            </div>
                          </TooltipTrigger>
                          <TooltipContent>
                            {createdBy}
                          </TooltipContent>
                        </Tooltip>
                      </TableCell>
                      <TableCell className="py-2">
                        <Badge className={cn(`inline-flex items-center px-2.5 py-0.5 rounded-full text-xs font-semibold`, getStatusBadgeClasses(ticket.status))}>
                          {ticket.status === 'Pending (Awaiting your Reply)' ? 'In Progress' : ticket.status}
                        </Badge>
                      </TableCell>
                      <TableCell className="py-2 text-muted-foreground">N/A</TableCell> {/* Placeholder for Approver Role(s) */}
                      <TableCell className="py-2 text-muted-foreground">N/A</TableCell> {/* Placeholder for Approver(s) */}
                      <TableCell className="py-2 text-right font-semibold">
                        {calculateAgeing(ticket)} days
                      </TableCell>
                      <TableCell className="py-2 text-right text-xs text-muted-foreground">
                        <Tooltip>
                          <TooltipTrigger asChild>
                            <span>{format(new Date(ticket.created_at), 'dd MMM · hh:mm a')}</span>
                          </TooltipTrigger>
                          <TooltipContent>
                            {formatTimeAgo(ticket.created_at)}
                          </TooltipContent>
                        </Tooltip>
                      </TableCell>
                    </TableRow>
                  );
                })
              )}
            </TableBody>
          </div>
        </Table>
      </div>

      {/* Pagination controls */}
      {totalPages > 1 && (
        <Pagination className="mt-3">
          <PaginationContent className="rounded-lg shadow-md bg-white dark:bg-gray-800 p-2">
            <PaginationItem>
              <PaginationPrevious
                onClick={() => setPage((p) => Math.max(1, p - 1))}
                aria-disabled={page === 1}
                className={page === 1 ? "pointer-events-none opacity-50" : ""}
              >
                <ChevronLeft className="h-4 w-4 mr-1" /> Previous
              </PaginationPrevious>
            </PaginationItem>
            {displayedPageNumbers.map((pageNumber, index) => (
              pageNumber === 'ellipsis' ? (
                <PaginationItem key={`ellipsis-${index}`}>
                  <PaginationEllipsis />
                </PaginationItem>
              ) : (
                <PaginationItem key={pageNumber}>
                  <PaginationLink
                    onClick={() => setPage(pageNumber as number)}
                    isActive={page === pageNumber}
                    className={page === pageNumber ? "bg-primary text-primary-foreground rounded-full" : "rounded-full"}
                  >
                    {pageNumber}
                  </PaginationLink>
                </PaginationItem>
              )
            ))}
            <PaginationItem>
              <PaginationNext
                onClick={() => setPage((p) => Math.min(totalPages, p + 1))}
                aria-disabled={page === totalPages}
                className={page === totalPages ? "pointer-events-none opacity-50" : ""}
              >
                Next <ChevronRight className="h-4 w-4 ml-1" />
              </PaginationNext>
            </PaginationItem>
          </PaginationContent>
        </Pagination>
      )}
    </div>
  );
}