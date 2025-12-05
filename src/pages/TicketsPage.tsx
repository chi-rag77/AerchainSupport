"use client";

import React, { useState, useMemo } from "react";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from "@/components/ui/select";
import { useSupabase } from "@/components/SupabaseProvider";
import TicketTable from "@/components/TicketTable";
import TicketDetailModal from "@/components/TicketDetailModal";
import DashboardMetricCard from "@/components/DashboardMetricCard";
import { Ticket, ConversationMessage } from "@/types";
import {
  Search, RefreshCw, Filter, ChevronLeft, ChevronRight, TicketIcon, Hourglass, CheckCircle, XCircle, AlertCircle, Bug, Loader2, Download, LayoutDashboard, Eraser, ListFilter, PlusCircle, ArrowUpDown, Settings, Inbox, Clock,
  SlidersHorizontal, Zap, User, CalendarX, Flag, Users, Building2, Tag, GitFork, CalendarDays, Trash2
} from "lucide-react";
import { Tooltip, TooltipContent, TooltipTrigger } from "@/components/ui/tooltip";
import { useQuery, useQueryClient, UseQueryOptions } from "@tanstack/react-query";
import { supabase } from "@/integrations/supabase/client";
import { toast } from 'sonner';
import { exportCsvTemplate } from '@/utils/export';
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { Separator } from "@/components/ui/separator";
import { MultiSelect } from "@/components/MultiSelect";
import { Tabs, TabsContent, TabsList, TabsTrigger } from "@/components/ui/tabs";
import { Sheet, SheetContent, SheetHeader, SheetTitle, SheetDescription, SheetTrigger } from "@/components/ui/sheet";
import { Accordion, AccordionContent, AccordionItem, AccordionTrigger } from "@/components/ui/accordion";
import { Popover, PopoverContent, PopoverTrigger } from "@/components/ui/popover";
import { Calendar } from "@/components/ui/calendar";
import { DateRange } from "react-day-picker";
import { format, parseISO, isPast, isWithinInterval, addDays } from 'date-fns';
import { Badge } from "@/components/ui/badge";
import { ScrollArea } from "@/components/ui/scroll-area"; // Corrected: Added missing import for ScrollArea

const TicketsPage = () => {
  const { session } = useSupabase();
  const user = session?.user;
  const fullName = user?.user_metadata?.full_name || user?.email?.split('@')[0] || 'User';

  const [selectedTicket, setSelectedTicket] = useState<Ticket | null>(null);
  const [isModalOpen, setIsModalOpen] = useState(false);
  const [searchTerm, setSearchTerm] = useState("");
  const [filterStatus, setFilterStatus] = useState<string>("All");
  const [filterPriority, setFilterPriority] = useState<string>("All");
  const [selectedAssignees, setSelectedAssignees] = useState<string[]>([]);
  const [selectedCompanies, setSelectedCompanies] = useState<string[]>([]);
  const [selectedTypes, setSelectedTypes] = useState<string[]>([]);
  const [selectedDependencies, setSelectedDependencies] = useState<string[]>([]);
  const [activeTab, setActiveTab] = useState<string>("all");
  const [isFilterSheetOpen, setIsFilterSheetOpen] = useState(false);
  
  const [filterMyTickets, setFilterMyTickets] = useState(false);
  const [filterHighPriority, setFilterHighPriority] = useState(false);
  const [filterSLABreached, setFilterSLABreached] = useState(false);

  const [dateField, setDateField] = useState<'created_at' | 'updated_at'>('created_at');
  const [dateRange, setDateRange] = useState<DateRange | undefined>(undefined);
  
  const [currentPage, setCurrentPage] = useState(1);
  const [itemsPerPage, setItemsPerPage] = useState(20);

  const queryClient = useQueryClient();

  const { data: freshdeskTickets, isLoading, error, isFetching } = useQuery<Ticket[], Error>({
    queryKey: ["freshdeskTickets"],
    queryFn: async () => {
      const { data, error } = await supabase.from('freshdesk_tickets').select('*').order('updated_at', { ascending: false }).limit(10000);
      if (error) throw error;
      return data.map(ticket => ({ ...ticket, id: ticket.freshdesk_id })) as Ticket[];
    },
    onSuccess: () => {
      toast.success("Tickets loaded from Supabase successfully!");
    },
    onError: (err) => {
      toast.error(`Failed to load tickets from Supabase: ${err.message}`);
    },
  } as UseQueryOptions<Ticket[], Error>);

  const handleSyncTickets = async () => {
    toast.loading("Syncing latest tickets from Freshdesk...", { id: "sync-tickets" });
    try {
      const { data, error } = await supabase.functions.invoke('fetch-freshdesk-tickets', {
        method: 'POST',
        body: { action: 'syncTickets', user_id: user?.id },
      });

      if (error) {
        let errorMessage = `Failed to sync tickets: ${error.message}`;
        if (error.message.includes("Freshdesk API error: 401") || error.message.includes("Freshdesk API key or domain not set")) {
          errorMessage += ". Please ensure FRESHDESK_API_KEY and FRESHDESK_DOMAIN are correctly set as Supabase secrets for the 'fetch-freshdesk-tickets' Edge Function.";
        } else if (error.message.includes("non-2xx status code")) {
          errorMessage += ". This often indicates an issue with the Freshdesk API or its credentials. Please check your Supabase secrets (FRESHDESK_API_KEY, FRESHDESK_DOMAIN).";
        }
        throw new Error(errorMessage); // Re-throw to be caught by the outer catch
      }

      toast.success("Tickets synced successfully!", { id: "sync-tickets" });
      queryClient.invalidateQueries({ queryKey: ["freshdeskTickets"] });
    } catch (err: any) {
      toast.error(err.message, { id: "sync-tickets" }); // Display the enhanced error message
    }
  };

  const handleRowClick = (ticket: Ticket) => {
    setSelectedTicket(ticket);
    setIsModalOpen(true);
  };

  const handleCloseModal = () => {
    setIsModalOpen(false);
    setSelectedTicket(null);
  };

  const handleClearFilters = () => {
    setSearchTerm("");
    setFilterStatus("All");
    setFilterPriority("All");
    setSelectedAssignees([]);
    setSelectedCompanies([]);
    setSelectedTypes([]);
    setSelectedDependencies([]);
    setFilterMyTickets(false);
    setFilterHighPriority(false);
    setFilterSLABreached(false);
    setDateField('created_at');
    setDateRange(undefined);
    setIsFilterSheetOpen(false);
    setCurrentPage(1);
  };

  const allFilteredTickets = useMemo(() => {
    if (!freshdeskTickets) return [];

    let currentTickets: Ticket[] = freshdeskTickets;

    if (filterMyTickets && user?.email) {
      currentTickets = currentTickets.filter(ticket => ticket.requester_email === user.email || ticket.assignee?.toLowerCase().includes(fullName.toLowerCase()));
    }
    if (filterHighPriority) {
      currentTickets = currentTickets.filter(ticket => ticket.priority.toLowerCase() === 'high' || ticket.priority.toLowerCase() === 'urgent');
    }
    if (filterSLABreached) {
      currentTickets = currentTickets.filter(ticket => {
        if (ticket.due_by) {
          const dueDate = parseISO(ticket.due_by);
          const now = new Date();
          const statusLower = ticket.status.toLowerCase();
          return isPast(dueDate) && statusLower !== 'resolved' && statusLower !== 'closed';
        }
        return false;
      });
    }

    currentTickets = currentTickets.filter(ticket => {
      const matchesSearch = searchTerm === "" ||
        ticket.subject.toLowerCase().includes(searchTerm.toLowerCase()) ||
        ticket.requester_email.toLowerCase().includes(searchTerm.toLowerCase()) ||
        (ticket.assignee && ticket.assignee.toLowerCase().includes(searchTerm.toLowerCase())) ||
        ticket.id.toLowerCase().includes(searchTerm.toLowerCase());
      return matchesSearch;
    });

    currentTickets = currentTickets.filter(ticket => {
      const matchesStatus = filterStatus === "All" || ticket.status.toLowerCase().includes(filterStatus.toLowerCase());
      const matchesPriority = filterPriority === "All" || ticket.priority.toLowerCase() === filterPriority.toLowerCase();
      const matchesAssignee = selectedAssignees.length === 0 || (ticket.assignee && selectedAssignees.includes(ticket.assignee));
      const matchesCompany = selectedCompanies.length === 0 || (ticket.cf_company && selectedCompanies.includes(ticket.cf_company));
      const matchesType = selectedTypes.length === 0 || (ticket.type && selectedTypes.includes(ticket.type));
      const matchesDependency = selectedDependencies.length === 0 || (ticket.cf_dependency && selectedDependencies.includes(ticket.cf_dependency));
      return matchesStatus && matchesPriority && matchesAssignee && matchesCompany && matchesType && matchesDependency;
    });

    if (dateRange?.from) {
      currentTickets = currentTickets.filter(ticket => {
        const dateToCheck = dateField === 'created_at' ? parseISO(ticket.created_at) : parseISO(ticket.updated_at);
        const start = dateRange.from;
        const end = dateRange.to || start;

        const effectiveStart = new Date(start.getFullYear(), start.getMonth(), start.getDate(), 0, 0, 0, 0);
        const effectiveEnd = new Date(end.getFullYear(), end.getMonth(), end.getDate(), 23, 59, 59, 999);

        return isWithinInterval(dateToCheck, { start: effectiveStart, end: effectiveEnd });
      });
    }

    return currentTickets;
  }, [freshdeskTickets, searchTerm, filterStatus, filterPriority, selectedAssignees, selectedCompanies, selectedTypes, selectedDependencies, filterMyTickets, filterHighPriority, filterSLABreached, dateField, dateRange, user?.email, fullName]);

  const indexOfLastItem = currentPage * itemsPerPage;
  const indexOfFirstItem = indexOfLastItem - itemsPerPage;
  const currentTicketsForTable = allFilteredTickets.slice(indexOfFirstItem, indexOfLastItem);
  const totalPages = Math.ceil(allFilteredTickets.length / itemsPerPage);

  const handlePageChange = (pageNumber: number) => {
    setCurrentPage(pageNumber);
  };

  const metrics = useMemo(() => {
    if (!freshdeskTickets) {
      return {
        totalTicketsOverall: 0,
        totalActiveTickets: 0,
        openTicketsSpecific: 0,
        bugsReceivedOverall: 0,
      };
    }

    const totalTicketsOverall = freshdeskTickets.length;
    const totalActiveTickets = freshdeskTickets.filter(t =>
      t.status.toLowerCase() !== 'resolved' && t.status.toLowerCase() !== 'closed'
    ).length;
    const openTicketsSpecific = freshdeskTickets.filter(t => t.status.toLowerCase() === 'open (being processed)').length;
    const bugsReceivedOverall = freshdeskTickets.filter(t => t.type?.toLowerCase() === 'bug').length;

    return {
      totalTicketsOverall,
      totalActiveTickets,
      openTicketsSpecific,
      bugsReceivedOverall,
    };
  }, [freshdeskTickets]);

  const uniqueAssignees = useMemo(() => {
    const assignees = new Set<string>();
    (freshdeskTickets || []).forEach(ticket => {
      if (ticket.assignee && ticket.assignee !== "Unassigned") {
        assignees.add(ticket.assignee);
      }
    });
    return Array.from(assignees).sort();
  }, [freshdeskTickets]);

  const uniqueStatuses = useMemo(() => {
    const statuses = new Set<string>();
    (freshdeskTickets || []).forEach(ticket => {
      statuses.add(ticket.status);
    });
    return ["All", ...Array.from(statuses).sort()];
  }, [freshdeskTickets]);

  const uniquePriorities = useMemo(() => {
    const priorities = new Set<string>();
    (freshdeskTickets || []).forEach(ticket => {
      priorities.add(ticket.priority);
    });
    return ["All", ...Array.from(priorities).sort()];
  }, [freshdeskTickets]);

  const uniqueCompanies = useMemo(() => {
    const companies = new Set<string>();
    (freshdeskTickets || []).forEach(ticket => {
      if (ticket.cf_company) {
        companies.add(ticket.cf_company);
      }
    });
    return Array.from(companies).sort();
  }, [freshdeskTickets]);

  const uniqueTypes = useMemo(() => {
    const types = new Set<string>();
    (freshdeskTickets || []).forEach(ticket => {
      if (ticket.type) {
        types.add(ticket.type);
      }
    });
    return Array.from(types).sort();
  }, [freshdeskTickets]);

  const uniqueDependencies = useMemo(() => {
    const dependencies = new Set<string>();
    (freshdeskTickets || []).forEach(ticket => {
      if (ticket.cf_dependency) {
        dependencies.add(ticket.cf_dependency);
      }
    });
    return Array.from(dependencies).sort();
  }, [freshdeskTickets]);

  const activeFilterCount = useMemo(() => {
    let count = 0;
    if (searchTerm) count++;
    if (filterStatus !== "All") count++;
    if (filterPriority !== "All") count++;
    if (selectedAssignees.length > 0) count++;
    if (selectedCompanies.length > 0) count++;
    if (selectedTypes.length > 0) count++;
    if (selectedDependencies.length > 0) count++;
    if (filterMyTickets) count++;
    if (filterHighPriority) count++;
    if (filterSLABreached) count++;
    if (dateRange?.from) count++;
    return count;
  }, [searchTerm, filterStatus, filterPriority, selectedAssignees, selectedCompanies, selectedTypes, selectedDependencies, filterMyTickets, filterHighPriority, filterSLABreached, dateRange]);


  if (error) {
    return (
      <div className="min-h-screen flex items-center justify-center bg-gray-100 dark:bg-gray-900">
        <p className="text-red-500">Error loading tickets: {error.message}</p>
        <p className="text-red-500">Please ensure FRESHDESK_API_KEY and FRESHDESK_DOMAIN are set as Supabase secrets.</p>
      </div>
    );
  }

  return (
    <div className="flex-1 flex flex-col p-6 overflow-y-auto bg-background">
      <Card className="flex flex-col h-full p-0 overflow-hidden border-none shadow-xl">
        {/* Header Section */}
        <div className="p-6 pb-4 bg-gradient-to-br from-blue-500/5 to-purple-500/5 border-b border-border shadow-sm">
          <div className="flex justify-between items-center mb-4">
            <div className="flex flex-col items-start">
              <h1 className="text-3xl font-bold text-gray-900 dark:text-white">Support & Ticketing Queue</h1>
              <p className="text-sm text-gray-600 dark:text-gray-400 mt-1">
                Manage and track customer support tickets efficiently.
              </p>
            </div>
            <div className="flex items-center gap-3">
              <Button onClick={handleSyncTickets} className="flex items-center gap-2 bg-blue-600 hover:bg-blue-700 text-white">
                <RefreshCw className="h-5 w-5" /> Sync Tickets
              </Button>
            </div>
          </div>
          {/* Search Input */}
          <div className="flex items-center gap-3 p-4 bg-gray-50 dark:bg-gray-700 rounded-b-xl shadow-inner">
            <Search className="h-5 w-5 text-gray-500" />
            <Input
              type="text"
              placeholder="Search tickets by subject, ID, requester, or assignee..."
              value={searchTerm}
              onChange={(e) => {
                setSearchTerm(e.target.value);
                setCurrentPage(1);
              }}
              className="flex-grow bg-card"
            />
            <Sheet open={isFilterSheetOpen} onOpenChange={setIsFilterSheetOpen}>
              <SheetTrigger asChild>
                <Button variant="outline" className="flex items-center gap-2 bg-card relative">
                  <ListFilter className="h-5 w-5" /> Filters
                  {activeFilterCount > 0 && (
                    <Badge className="absolute -top-2 -right-2 h-5 w-5 flex items-center justify-center p-0 rounded-full bg-primary text-primary-foreground text-xs">
                      {activeFilterCount}
                    </Badge>
                  )}
                </Button>
              </SheetTrigger>
              <SheetContent side="right" className="w-full sm:max-w-md flex flex-col">
                <SheetHeader className="pb-4">
                  <SheetTitle className="text-2xl font-bold flex items-center gap-2">
                    <SlidersHorizontal className="h-6 w-6 text-primary" /> Advanced Ticket Filters
                  </SheetTitle>
                  <SheetDescription>
                    Refine your ticket view with powerful filtering options.
                  </SheetDescription>
                </SheetHeader>

                {/* Active Filters Display */}
                {activeFilterCount > 0 && (
                  <div className="p-4 bg-blue-50/20 dark:bg-blue-950/20 rounded-lg border border-blue-200 dark:border-blue-800 mb-4">
                    <h4 className="text-sm font-semibold text-blue-800 dark:text-blue-200 mb-2">Active Filters ({activeFilterCount}):</h4>
                    <div className="flex flex-wrap gap-2">
                      {searchTerm && (
                        <Badge variant="secondary" className="flex items-center bg-blue-100 text-blue-800 dark:bg-blue-900 dark:text-blue-200">
                          Search: "{searchTerm}"
                          <XCircle className="ml-1 h-3 w-3 cursor-pointer text-blue-600 dark:text-blue-300" onClick={() => setSearchTerm("")} />
                        </Badge>
                      )}
                      {filterStatus !== "All" && (
                        <Badge variant="secondary" className="flex items-center bg-blue-100 text-blue-800 dark:bg-blue-900 dark:text-blue-200">
                          Status: {filterStatus}
                          <XCircle className="ml-1 h-3 w-3 cursor-pointer text-blue-600 dark:text-blue-300" onClick={() => setFilterStatus("All")} />
                        </Badge>
                      )}
                      {filterPriority !== "All" && (
                        <Badge variant="secondary" className="flex items-center bg-blue-100 text-blue-800 dark:bg-blue-900 dark:text-blue-200">
                          Priority: {filterPriority}
                          <XCircle className="ml-1 h-3 w-3 cursor-pointer text-blue-600 dark:text-blue-300" onClick={() => setFilterPriority("All")} />
                        </Badge>
                      )}
                      {selectedAssignees.length > 0 && (
                        <Badge variant="secondary" className="flex items-center bg-blue-100 text-blue-800 dark:bg-blue-900 dark:text-blue-200">
                          Assignees: {selectedAssignees.join(', ')}
                          <XCircle className="ml-1 h-3 w-3 cursor-pointer text-blue-600 dark:text-blue-300" onClick={() => setSelectedAssignees([])} />
                        </Badge>
                      )}
                      {selectedCompanies.length > 0 && (
                        <Badge variant="secondary" className="flex items-center bg-blue-100 text-blue-800 dark:bg-blue-900 dark:text-blue-200">
                          Companies: {selectedCompanies.join(', ')}
                          <XCircle className="ml-1 h-3 w-3 cursor-pointer text-blue-600 dark:text-blue-300" onClick={() => setSelectedCompanies([])} />
                        </Badge>
                      )}
                      {selectedTypes.length > 0 && (
                        <Badge variant="secondary" className="flex items-center bg-blue-100 text-blue-800 dark:bg-blue-900 dark:text-blue-200">
                          Types: {selectedTypes.join(', ')}
                          <XCircle className="ml-1 h-3 w-3 cursor-pointer text-blue-600 dark:text-blue-300" onClick={() => setSelectedTypes([])} />
                        </Badge>
                      )}
                      {selectedDependencies.length > 0 && (
                        <Badge variant="secondary" className="flex items-center bg-blue-100 text-blue-800 dark:bg-blue-900 dark:text-blue-200">
                          Dependencies: {selectedDependencies.join(', ')}
                          <XCircle className="ml-1 h-3 w-3 cursor-pointer text-blue-600 dark:text-blue-300" onClick={() => setSelectedDependencies([])} />
                        </Badge>
                      )}
                      {filterMyTickets && (
                        <Badge variant="secondary" className="flex items-center bg-blue-100 text-blue-800 dark:bg-blue-900 dark:text-blue-200">
                          My Tickets
                          <XCircle className="ml-1 h-3 w-3 cursor-pointer text-blue-600 dark:text-blue-300" onClick={() => setFilterMyTickets(false)} />
                        </Badge>
                      )}
                      {filterHighPriority && (
                        <Badge variant="secondary" className="flex items-center bg-blue-100 text-blue-800 dark:bg-blue-900 dark:text-blue-200">
                          High Priority
                          <XCircle className="ml-1 h-3 w-3 cursor-pointer text-blue-600 dark:text-blue-300" onClick={() => setFilterHighPriority(false)} />
                        </Badge>
                      )}
                      {filterSLABreached && (
                        <Badge variant="secondary" className="flex items-center bg-blue-100 text-blue-800 dark:bg-blue-900 dark:text-blue-200">
                          SLA Breached
                          <XCircle className="ml-1 h-3 w-3 cursor-pointer text-blue-600 dark:text-blue-300" onClick={() => setFilterSLABreached(false)} />
                        </Badge>
                      )}
                      {dateRange?.from && (
                        <Badge variant="secondary" className="flex items-center bg-blue-100 text-blue-800 dark:bg-blue-900 dark:text-blue-200">
                          {dateField === 'created_at' ? 'Created' : 'Updated'}: {format(dateRange.from, "MMM dd")}
                          {dateRange.to && ` - ${format(dateRange.to, "MMM dd")}`}
                          <XCircle className="ml-1 h-3 w-3 cursor-pointer text-blue-600 dark:text-blue-300" onClick={() => setDateRange(undefined)} />
                        </Badge>
                      )}
                    </div>
                  </div>
                )}

                <ScrollArea className="flex-grow pr-4 -mr-4">
                  <Accordion type="multiple" className="w-full space-y-4">
                    {/* Quick Filters */}
                    <AccordionItem value="item-1" className="border-b border-border">
                      <AccordionTrigger className="flex items-center gap-2 text-base font-semibold text-foreground hover:no-underline">
                        <Zap className="h-5 w-5 text-yellow-500" /> Quick Filters
                      </AccordionTrigger>
                      <AccordionContent className="pt-4 pb-2 space-y-3">
                        <Button
                          variant={filterMyTickets ? "secondary" : "outline"}
                          onClick={() => {setFilterMyTickets(!filterMyTickets); setCurrentPage(1);}}
                          className="w-full justify-start flex items-center gap-2 bg-card"
                        >
                          <User className="h-4 w-4" /> My Tickets
                        </Button>
                        <Button
                          variant={filterHighPriority ? "secondary" : "outline"}
                          onClick={() => {setFilterHighPriority(!filterHighPriority); setCurrentPage(1);}}
                          className="w-full justify-start flex items-center gap-2 bg-card"
                        >
                          <AlertCircle className="h-4 w-4" /> High Priority
                        </Button>
                        <Button
                          variant={filterSLABreached ? "secondary" : "outline"}
                          onClick={() => {setFilterSLABreached(!filterSLABreached); setCurrentPage(1);}}
                          className="w-full justify-start flex items-center gap-2 bg-card"
                        >
                          <CalendarX className="h-4 w-4" /> SLA Breached
                        </Button>
                      </AccordionContent>
                    </AccordionItem>

                    {/* Core Filters */}
                    <AccordionItem value="item-2" className="border-b border-border">
                      <AccordionTrigger className="flex items-center gap-2 text-base font-semibold text-foreground hover:no-underline">
                        <Filter className="h-5 w-5 text-blue-500" /> Core Filters
                      </AccordionTrigger>
                      <AccordionContent className="pt-4 pb-2 space-y-4">
                        <Select value={filterStatus} onValueChange={(value) => {setFilterStatus(value); setCurrentPage(1);}}>
                          <SelectTrigger className="w-full bg-card">
                            <ListFilter className="h-4 w-4 mr-2 text-gray-500" />
                            <span className="text-sm font-medium">Status:</span>
                            <SelectValue placeholder="All" />
                          </SelectTrigger>
                          <SelectContent>
                            {uniqueStatuses.map(status => (
                              <SelectItem key={status} value={status}>
                                {status}
                              </SelectItem>
                            ))}
                          </SelectContent>
                        </Select>
                        <Select value={filterPriority} onValueChange={(value) => {setFilterPriority(value); setCurrentPage(1);}}>
                          <SelectTrigger className="w-full bg-card">
                            <Flag className="h-4 w-4 mr-2 text-gray-500" />
                            <span className="text-sm font-medium">Priority:</span>
                            <SelectValue placeholder="All" />
                          </SelectTrigger>
                          <SelectContent>
                            {uniquePriorities.map(priority => (
                              <SelectItem key={priority} value={priority}>
                                {priority}
                              </SelectItem>
                            ))}
                          </SelectContent>
                        </Select>
                        <MultiSelect
                          options={uniqueAssignees.map(assignee => ({ value: assignee, label: assignee }))}
                          selected={selectedAssignees}
                          onSelectedChange={(values) => {setSelectedAssignees(values); setCurrentPage(1);}}
                          placeholder="Filter by Assignee"
                          icon={Users}
                          className="w-full bg-card"
                        />
                      </AccordionContent>
                    </AccordionItem>

                    {/* Categorization Filters */}
                    <AccordionItem value="item-3" className="border-b border-border">
                      <AccordionTrigger className="flex items-center gap-2 text-base font-semibold text-foreground hover:no-underline">
                        <Tag className="h-5 w-5 text-green-500" /> Categorization
                      </AccordionTrigger>
                      <AccordionContent className="pt-4 pb-2 space-y-4">
                        <MultiSelect
                          options={uniqueCompanies.map(company => ({ value: company, label: company }))}
                          selected={selectedCompanies}
                          onSelectedChange={(values) => {setSelectedCompanies(values); setCurrentPage(1);}}
                          placeholder="Filter by Company"
                          icon={Building2}
                          className="w-full bg-card"
                        />
                        <MultiSelect
                          options={uniqueTypes.map(type => ({ value: type, label: type }))}
                          selected={selectedTypes}
                          onSelectedChange={(values) => {setSelectedTypes(values); setCurrentPage(1);}}
                          placeholder="Filter by Type"
                          icon={TicketIcon}
                          className="w-full bg-card"
                        />
                        <MultiSelect
                          options={uniqueDependencies.map(dependency => ({ value: dependency, label: dependency }))}
                          selected={selectedDependencies}
                          onSelectedChange={(values) => {setSelectedDependencies(values); setCurrentPage(1);}}
                          placeholder="Filter by Dependency"
                          icon={GitFork}
                          className="w-full bg-card"
                        />
                      </AccordionContent>
                    </AccordionItem>

                    {/* Date & Time Filters */}
                    <AccordionItem value="item-4" className="border-b border-border">
                      <AccordionTrigger className="flex items-center gap-2 text-base font-semibold text-foreground hover:no-underline">
                        <CalendarDays className="h-5 w-5 text-purple-500" /> Date & Time
                      </AccordionTrigger>
                      <AccordionContent className="pt-4 pb-2 space-y-4">
                        <Select value={dateField} onValueChange={(value: 'created_at' | 'updated_at') => {setDateField(value); setCurrentPage(1);}}>
                          <SelectTrigger className="w-full bg-card">
                            <Clock className="h-4 w-4 mr-2 text-gray-500" />
                            <span className="text-sm font-medium">Date Field:</span>
                            <SelectValue placeholder="Created At" />
                          </SelectTrigger>
                          <SelectContent>
                            <SelectItem value="created_at">Created At</SelectItem>
                            <SelectItem value="updated_at">Updated At</SelectItem>
                          </SelectContent>
                        </Select>
                        <Popover>
                          <PopoverTrigger asChild>
                            <Button
                              variant={"outline"}
                              className="w-full justify-start text-left font-normal bg-card"
                            >
                              <CalendarDays className="mr-2 h-4 w-4" />
                              {dateRange?.from ? (
                                dateRange.to ? (
                                  `${format(dateRange.from, "MMM dd, y")} - ${format(dateRange.to, "MMM dd, y")}`
                                ) : (
                                  format(dateRange.from, "MMM dd, y")
                                )
                              ) : (
                                <span>Pick a date range</span>
                              )}
                            </Button>
                          </PopoverTrigger>
                          <PopoverContent className="w-auto p-0" align="start">
                            <Calendar
                              initialFocus
                              mode="range"
                              defaultMonth={dateRange?.from}
                              selected={dateRange}
                              onSelect={(range) => {
                                setDateRange(range);
                                setCurrentPage(1);
                              }}
                              numberOfMonths={2}
                            />
                          </PopoverContent>
                        </Popover>
                      </AccordionContent>
                    </AccordionItem>
                  </Accordion>
                </ScrollArea>

                <div className="flex justify-between gap-2 pt-4 border-t border-border">
                  <Button variant="outline" onClick={handleClearFilters} className="flex items-center gap-2">
                    <Trash2 className="h-4 w-4" /> Clear All
                  </Button>
                  <Button onClick={() => setIsFilterSheetOpen(false)} className="flex items-center gap-2 bg-primary text-primary-foreground">
                    <CheckCircle className="h-4 w-4" /> Apply Filters
                  </Button>
                </div>
              </SheetContent>
            </Sheet>
          </div>
        </div>

        {/* Summary Metrics */}
        <section className="p-6 pb-4">
          <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-4 gap-4">
            <DashboardMetricCard
              title="Total Tickets"
              value={metrics.totalTicketsOverall}
              icon={TicketIcon}
              trend={12}
              description="The total number of support tickets in the system."
            />
            <DashboardMetricCard
              title="Total Open Tickets"
              value={metrics.totalActiveTickets}
              icon={Hourglass}
              trend={5}
              description="Total number of active tickets across all time, regardless of date filter."
            />
            <DashboardMetricCard
              title="Open Tickets"
              value={metrics.openTicketsSpecific}
              icon={Clock}
              trend={5}
              description="Tickets that are currently in 'Open (Being Processed)' status."
            />
            <DashboardMetricCard
              title="Bugs Received"
              value={metrics.bugsReceivedOverall}
              icon={Bug}
              trend={8}
              description="Number of tickets categorized as 'Bug' in the system."
            />
          </div>
        </section>

        <Separator className="mx-6" />

        {/* Main content area for filter notification and scrollable table */}
        <div className="flex-grow p-6 pt-4 flex flex-col">
          <div className="flex-grow rounded-lg border border-border shadow-md">
            {isLoading ? (
              <div className="flex flex-col items-center justify-center h-full text-gray-500 dark:text-gray-400">
                <Loader2 className="h-10 w-10 animate-spin text-primary mb-3" />
                <p className="text-lg font-medium">Loading tickets...</p>
              </div>
            ) : (
              <TicketTable 
                tickets={currentTicketsForTable} 
                onRowClick={handleRowClick} 
                currentPage={currentPage}
                totalPages={totalPages}
                onPageChange={handlePageChange}
              />
            )}
          </div>
        </div>
        
        {selectedTicket && (
          <TicketDetailModal
            isOpen={isModalOpen}
            onClose={handleCloseModal}
            ticket={selectedTicket}
          />
        )}
      </Card>
    </div>
  );
};

export default TicketsPage;