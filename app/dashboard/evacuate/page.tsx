"use client";

import { useState, useEffect } from "react";
import axios from "axios";
import { motion } from "framer-motion";
import { Button } from "@/components/ui/button";
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from "@/components/ui/card";
import {
  Table,
  TableBody,
  TableCell,
  TableHead,
  TableHeader,
  TableRow,
} from "@/components/ui/table";
import {
  Select,
  SelectContent,
  SelectItem,
  SelectTrigger,
  SelectValue,
} from "@/components/ui/select";
import { Input } from "@/components/ui/input";
import { Alert, AlertDescription, AlertTitle } from "@/components/ui/alert";
import { Badge } from "@/components/ui/badge";
import { Label } from "@/components/ui/label";
import { Calendar } from "@/components/ui/calendar";
import {
  Popover,
  PopoverContent,
  PopoverTrigger,
} from "@/components/ui/popover";
import { 
  AlertCircle, 
  CheckCircle2, 
  ArrowLeftRight, 
  RefreshCw,
  Loader2,
  Filter,
  CalendarIcon,
  ChevronLeft,
  ChevronRight
} from "lucide-react";
import { useToast } from "@/hooks/use-toast";
import MetricCard from "@/components/dashboard/MetricCard";
// Removed date-fns import - using native Date methods instead
import { 
  evacuationService, 
  EvacuationRecord, 
  EvacuationAnalytics 
} from "@/lib/services/evacuation";
import EvacuationDetailsModal from "@/components/dashboard/EvacuationDetailsModal";
import { cn } from "@/lib/utils";

type TimeFilter = 'today' | 'weekly' | 'monthly' | 'yearly' | 'custom';

// Date utility functions to replace date-fns
const formatDate = (date: Date, formatStr: string) => {
  if (formatStr === 'yyyy-MM-dd') {
    return date.toISOString().split('T')[0];
  }
  if (formatStr === 'MMM d, yyyy') {
    return date.toLocaleDateString('en-US', { 
      month: 'short', 
      day: 'numeric', 
      year: 'numeric' 
    });
  }
  return date.toLocaleDateString();
};

const subMonths = (date: Date, months: number) => {
  const result = new Date(date);
  result.setMonth(result.getMonth() - months);
  return result;
};

const subWeeks = (date: Date, weeks: number) => {
  const result = new Date(date);
  result.setDate(result.getDate() - (weeks * 7));
  return result;
};

const subYears = (date: Date, years: number) => {
  const result = new Date(date);
  result.setFullYear(result.getFullYear() - years);
  return result;
};

const startOfDay = (date: Date) => {
  const result = new Date(date);
  result.setHours(0, 0, 0, 0);
  return result;
};

const endOfDay = (date: Date) => {
  const result = new Date(date);
  result.setHours(23, 59, 59, 999);
  return result;
};

export default function EvacuatePage() {
  const [isLoading, setIsLoading] = useState(false);
  const [isEvacuating, setIsEvacuating] = useState(false);
  const [success, setSuccess] = useState<string | null>(null);
  const [error, setError] = useState<string | null>(null);
  const [evacuations, setEvacuations] = useState<EvacuationRecord[]>([]);
  const [filteredEvacuations, setFilteredEvacuations] = useState<EvacuationRecord[]>([]);
  const [analytics, setAnalytics] = useState<EvacuationAnalytics | null>(null);
  const [selectedEvacuation, setSelectedEvacuation] = useState<EvacuationRecord | null>(null);
  const [showModal, setShowModal] = useState(false);
  
  // Filter states
  const [timeFilter, setTimeFilter] = useState<TimeFilter>('monthly');
  const [startDate, setStartDate] = useState<Date | undefined>();
  const [endDate, setEndDate] = useState<Date | undefined>();
  const [statusFilter, setStatusFilter] = useState<string>('all');
  
  // Pagination states
  const [currentPage, setCurrentPage] = useState(1);
  const [itemsPerPage] = useState(10);
  
  const { toast } = useToast();

  useEffect(() => {
    // Set default date range to recent month
    const now = new Date();
    const monthAgo = subMonths(now, 1);
    setStartDate(monthAgo);
    setEndDate(now);
  }, []);

  useEffect(() => {
    if (startDate && endDate) {
      fetchEvacuationHistory();
    }
  }, [startDate, endDate]);

  useEffect(() => {
    applyFilters();
  }, [evacuations, statusFilter, currentPage]);

  const handleTimeFilterChange = (filter: TimeFilter) => {
    setTimeFilter(filter);
    const now = new Date();
    
    switch (filter) {
      case 'today':
        setStartDate(startOfDay(now));
        setEndDate(endOfDay(now));
        break;
      case 'weekly':
        setStartDate(subWeeks(now, 1));
        setEndDate(now);
        break;
      case 'monthly':
        setStartDate(subMonths(now, 1));
        setEndDate(now);
        break;
      case 'yearly':
        setStartDate(subYears(now, 1));
        setEndDate(now);
        break;
      case 'custom':
        // Keep existing dates for custom
        break;
    }
  };

  const fetchEvacuationHistory = async () => {
    if (!startDate || !endDate) return;
    
    setIsLoading(true);
    setError(null);

    try {
      const fromDate = formatDate(startDate, 'yyyy-MM-dd');
      const toDate = formatDate(endDate, 'yyyy-MM-dd');
      
      const historyData = await evacuationService.fetchEvacuationHistory('9psb', fromDate, toDate);
      setEvacuations(historyData);
      
      const analyticsData = evacuationService.calculateAnalytics(historyData);
      setAnalytics(analyticsData);
      
      // Reset to first page when data changes
      setCurrentPage(1);
    } catch (err: any) {
      console.error('Failed to fetch evacuation history:', err);
      setError(err.message || 'Failed to load evacuation history');
      toast({
        title: "Error",
        description: "Failed to load evacuation history",
        variant: "destructive",
      });
    } finally {
      setIsLoading(false);
    }
  };

  const applyFilters = () => {
    let filtered = [...evacuations];
    
    // Apply status filter
    if (statusFilter !== 'all') {
      filtered = filtered.filter(evacuation => {
        if (statusFilter === 'success') return evacuation.total_failures === 0;
        if (statusFilter === 'partial') return evacuation.total_failures > 0 && evacuation.total_failures < evacuation.total_accounts_processed / 2;
        if (statusFilter === 'failed') return evacuation.total_failures >= evacuation.total_accounts_processed / 2;
        return true;
      });
    }
    
    setFilteredEvacuations(filtered);
  };

  const handleEvacuateFunds = async () => {
    setIsEvacuating(true);
    setSuccess(null);
    setError(null);
    
    try {
      const token = localStorage.getItem('token');
      if (!token) {
        throw new Error('No authentication token found');
      }

      const response = await axios.post(
        `${process.env.NEXT_PUBLIC_API_URL}/funds/evacuate`,
        { from: "9psb" },
        {
          headers: {
            Authorization: `Bearer ${token}`,
            'Content-Type': 'application/json'
          }
        }
      );

      if (response.data.success) {
        setSuccess(response.data.data || "Funds evacuation initiated successfully");
        toast({
          title: "Success",
          description: "Funds evacuation process started",
          variant: "default",
        });
        
        // Refresh history after successful evacuation
        setTimeout(() => {
          fetchEvacuationHistory();
        }, 2000);
      } else {
        throw new Error(response.data.message || 'Failed to initiate funds evacuation');
      }
    } catch (err) {
      if (axios.isAxiosError(err)) {
        setError(err.response?.data?.message || 'Failed to initiate funds evacuation');
      } else {
        setError(err instanceof Error ? err.message : 'Failed to initiate funds evacuation');
      }
      toast({
        title: "Error",
        description: err instanceof Error ? err.message : 'Failed to evacuate funds',
        variant: "destructive",
      });
    } finally {
      setIsEvacuating(false);
    }
  };

  const handleRowClick = (evacuation: EvacuationRecord) => {
    setSelectedEvacuation(evacuation);
    setShowModal(true);
  };

  const getStatusBadge = (evacuation: EvacuationRecord) => {
    if (evacuation.total_failures === 0) {
      return <Badge className="bg-green-100 text-green-800 border-green-200">Success</Badge>;
    } else if (evacuation.total_failures < evacuation.total_accounts_processed / 2) {
      return <Badge variant="secondary" className="bg-yellow-100 text-yellow-800 border-yellow-200">Partial</Badge>;
    } else {
      return <Badge variant="destructive">Failed</Badge>;
    }
  };

  // Pagination logic
  const totalPages = Math.ceil(filteredEvacuations.length / itemsPerPage);
  const startIndex = (currentPage - 1) * itemsPerPage;
  const endIndex = startIndex + itemsPerPage;
  const currentEvacuations = filteredEvacuations.slice(startIndex, endIndex);

  const goToPage = (page: number) => {
    setCurrentPage(Math.max(1, Math.min(page, totalPages)));
  };

  return (
    <div className="space-y-6">
      {/* Header with title and action buttons */}
      <motion.div
        initial={{ opacity: 0, y: 20 }}
        animate={{ opacity: 1, y: 0 }}
        transition={{ duration: 0.5 }}
      >
        <div className="flex justify-between items-center">
          <div>
            <h1 className="text-xl lg:text-2xl">Funds Evacuation</h1>
            <p className="text-muted-foreground mt-1 text-sm">View evacuation history and analytics from 9PSB.</p>
          </div>
          <div className="flex items-center gap-2">
            <Button
              variant="outline"
              size="sm"
              onClick={fetchEvacuationHistory}
              disabled={isLoading}
            >
              <RefreshCw className={`h-4 w-4 mr-2 ${isLoading ? 'animate-spin' : ''}`} />
              Refresh
            </Button>
            <Button
              onClick={handleEvacuateFunds}
              disabled={isEvacuating}
              size="sm"
            >
              {isEvacuating ? (
                <>
                  <Loader2 className="h-4 w-4 mr-2 animate-spin" />
                  Processing...
                </>
              ) : (
                <>
                  <ArrowLeftRight className="h-4 w-4 mr-2" />
                  Evacuate Funds
                </>
              )}
            </Button>
          </div>
        </div>
      </motion.div>

      {/* Success/Error Alerts */}
      {error && (
        <Alert variant="destructive">
          <AlertCircle className="h-4 w-4" />
          <AlertTitle>Error</AlertTitle>
          <AlertDescription>{error}</AlertDescription>
        </Alert>
      )}

      {success && (
        <Alert variant="default" className="bg-green-50 text-green-800 border-green-200">
          <CheckCircle2 className="h-4 w-4 text-green-600" />
          <AlertTitle>Success</AlertTitle>
          <AlertDescription>{success}</AlertDescription>
        </Alert>
      )}

      {/* Analytics Cards */}
      {analytics && (
        <motion.div 
          className="grid grid-cols-2 lg:grid-cols-4 gap-2"
          initial={{ opacity: 0, y: 20 }}
          animate={{ opacity: 1, y: 0 }}
          transition={{ duration: 0.5, delay: 0.2 }}
        >
          <MetricCard 
            title="Total Evacuated" 
            value={evacuationService.formatAmount(analytics.totalAmountEvacuated)} 
            change={0}
            changeType="increase"
          />
          <MetricCard 
            title="Total Evacuations" 
            value={evacuationService.formatCount(analytics.totalEvacuations)} 
            change={0}
            changeType="increase"
          />
          <MetricCard 
            title="Success Rate" 
            value={`${analytics.successRate.toFixed(1)}%`} 
            change={0}
            changeType="increase"
          />
          <MetricCard 
            title="Accounts Processed" 
            value={evacuationService.formatCount(analytics.totalAccountsProcessed)} 
            change={0}
            changeType="increase"
          />
        </motion.div>
      )}
      
      {/* Evacuation History Table */}
      <motion.div 
        initial={{ opacity: 0, y: 20 }}
        animate={{ opacity: 1, y: 0 }}
        transition={{ duration: 0.5, delay: 0.4 }}
      >
        <Card>
          <CardHeader>
            <div className="flex justify-between items-center">
              <div>
                <CardTitle>Evacuation History</CardTitle>
                <CardDescription>
                  Recent evacuation operations from 9PSB.
                </CardDescription>
              </div>
              
              {/* Filters */}
              <div className="flex items-center gap-2">
                <Filter className="h-4 w-4 text-muted-foreground" />
                
                {/* Time Filter */}
                <Select value={timeFilter} onValueChange={(value: TimeFilter) => handleTimeFilterChange(value)}>
                  <SelectTrigger className="w-[120px]">
                    <SelectValue />
                  </SelectTrigger>
                  <SelectContent>
                    <SelectItem value="today">Today</SelectItem>
                    <SelectItem value="weekly">Weekly</SelectItem>
                    <SelectItem value="monthly">Monthly</SelectItem>
                    <SelectItem value="yearly">Yearly</SelectItem>
                    <SelectItem value="custom">Custom</SelectItem>
                  </SelectContent>
                </Select>

                {/* Date Range Selectors - Always Visible */}
                <Popover>
                  <PopoverTrigger asChild>
                    <Button
                      variant="outline"
                      className={cn(
                        "w-[130px] justify-start text-left font-normal",
                        !startDate && "text-muted-foreground"
                      )}
                    >
                      <CalendarIcon className="mr-2 h-4 w-4" />
                      {startDate ? formatDate(startDate, "MMM d, yyyy") : "Start Date"}
                    </Button>
                  </PopoverTrigger>
                  <PopoverContent className="w-auto p-0">
                    <Calendar
                      mode="single"
                      selected={startDate}
                      onSelect={setStartDate}
                      initialFocus
                    />
                  </PopoverContent>
                </Popover>

                <Popover>
                  <PopoverTrigger asChild>
                    <Button
                      variant="outline"
                      className={cn(
                        "w-[130px] justify-start text-left font-normal",
                        !endDate && "text-muted-foreground"
                      )}
                    >
                      <CalendarIcon className="mr-2 h-4 w-4" />
                      {endDate ? formatDate(endDate, "MMM d, yyyy") : "End Date"}
                    </Button>
                  </PopoverTrigger>
                  <PopoverContent className="w-auto p-0">
                    <Calendar
                      mode="single"
                      selected={endDate}
                      onSelect={setEndDate}
                      initialFocus
                    />
                  </PopoverContent>
                </Popover>

                {/* Status Filter */}
                <Select value={statusFilter} onValueChange={setStatusFilter}>
                  <SelectTrigger className="w-[120px]">
                    <SelectValue />
                  </SelectTrigger>
                  <SelectContent>
                    <SelectItem value="all">All Status</SelectItem>
                    <SelectItem value="success">Success</SelectItem>
                    <SelectItem value="partial">Partial</SelectItem>
                    <SelectItem value="failed">Failed</SelectItem>
                  </SelectContent>
                </Select>
              </div>
            </div>
          </CardHeader>
          <CardContent>
            {isLoading ? (
              <div className="flex items-center justify-center py-12">
                <div className="text-center space-y-4">
                  <Loader2 className="h-8 w-8 animate-spin mx-auto text-muted-foreground" />
                  <p className="text-sm text-muted-foreground">Loading evacuation history...</p>
                </div>
              </div>
            ) : currentEvacuations.length === 0 ? (
              <div className="flex flex-col items-center justify-center py-12 text-center">
                <ArrowLeftRight className="h-12 w-12 text-muted-foreground mb-4 opacity-30" />
                <h3 className="text-lg font-medium mb-1">No evacuation history</h3>
                <p className="text-sm text-muted-foreground max-w-sm">
                  No evacuation operations found for the selected filters.
                </p>
              </div>
            ) : (
              <>
                <div className="rounded-md border">
                  <Table>
                    <TableHeader>
                      <TableRow>
                        <TableHead>Date</TableHead>
                        <TableHead>Amount Moved</TableHead>
                        <TableHead>Accounts</TableHead>
                        <TableHead>Status</TableHead>
                      </TableRow>
                    </TableHeader>
                    <TableBody>
                      {currentEvacuations.map((evacuation) => (
                        <TableRow 
                          key={evacuation.id}
                          className="cursor-pointer hover:bg-muted/50"
                          onClick={() => handleRowClick(evacuation)}
                        >
                          <TableCell>
                            <div className="flex flex-col">
                              <span className="text-sm font-medium">
                                {evacuationService.formatDate(evacuation.created_at).split(',')[0]}
                              </span>
                              <span className="text-xs text-muted-foreground">
                                {evacuationService.formatDate(evacuation.created_at).split(',')[1]}
                              </span>
                            </div>
                          </TableCell>
                          <TableCell>
                            <div className="flex flex-col">
                              <span className="text-sm font-medium">
                                {evacuationService.formatAmount(parseFloat(evacuation.total_amount_moved))}
                              </span>
                              <span className="text-xs text-muted-foreground">
                                -{evacuationService.formatAmount(parseFloat(evacuation.total_charges_incured))} fees
                              </span>
                            </div>
                          </TableCell>
                          <TableCell>
                            <div className="flex flex-col">
                              <span className="text-sm font-medium">
                                {evacuationService.formatCount(evacuation.total_accounts_processed)}
                              </span>
                              <span className="text-xs text-muted-foreground">
                                {evacuation.total_failures} failed
                              </span>
                            </div>
                          </TableCell>
                          <TableCell>
                            {getStatusBadge(evacuation)}
                          </TableCell>
                        </TableRow>
                      ))}
                    </TableBody>
                  </Table>
                </div>

                {/* Pagination */}
                {totalPages > 1 && (
                  <div className="flex items-center justify-between mt-4">
                    <div className="text-sm text-muted-foreground">
                      Showing {startIndex + 1} to {Math.min(endIndex, filteredEvacuations.length)} of {filteredEvacuations.length} results
                    </div>
                    <div className="flex items-center gap-2">
                      <Button
                        variant="outline"
                        size="sm"
                        onClick={() => goToPage(currentPage - 1)}
                        disabled={currentPage === 1}
                      >
                        <ChevronLeft className="h-4 w-4" />
                        Previous
                      </Button>
                      
                      <div className="flex items-center gap-1">
                        {Array.from({ length: Math.min(5, totalPages) }, (_, i) => {
                          const pageNum = Math.max(1, Math.min(currentPage - 2 + i, totalPages - 4 + i));
                          return (
                            <Button
                              key={pageNum}
                              variant={currentPage === pageNum ? "default" : "outline"}
                              size="sm"
                              className="w-8 h-8 p-0"
                              onClick={() => goToPage(pageNum)}
                            >
                              {pageNum}
                            </Button>
                          );
                        })}
                      </div>
                      
                      <Button
                        variant="outline"
                        size="sm"
                        onClick={() => goToPage(currentPage + 1)}
                        disabled={currentPage === totalPages}
                      >
                        Next
                        <ChevronRight className="h-4 w-4" />
                      </Button>
                    </div>
                  </div>
                )}
              </>
            )}
          </CardContent>
        </Card>
      </motion.div>

      {/* Evacuation Details Modal */}
      <EvacuationDetailsModal
        isOpen={showModal}
        onClose={() => setShowModal(false)}
        evacuation={selectedEvacuation}
      />
    </div>
  );
} 