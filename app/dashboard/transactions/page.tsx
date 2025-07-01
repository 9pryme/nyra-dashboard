"use client";

import { useState, useEffect } from "react";
import axios from "axios";
import MetricCard from "@/components/dashboard/MetricCard";
import DetailedTransactionsTable from "@/components/dashboard/DetailedTransactionsTable";
import { Tabs, TabsContent, TabsList, TabsTrigger } from "@/components/ui/tabs";
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from "@/components/ui/select";
import { ArrowUpRight, ArrowDownRight, CircleDollarSign, Clock } from "lucide-react";
import { motion } from "framer-motion";
import { transactionCache } from "@/lib/cache";
import { useAnalyticsMetrics } from "@/hooks/use-analytics";
import { analyticsService, TimePeriod } from "@/lib/services/analytics";

interface Transaction {
  transaction_id: string;
  transaction_type: string;
  transaction_status: string;
  amount: string;
  created_at: string;
}

interface ApiResponse {
  statusCode: number;
  status: string;
  success: boolean;
  error: string;
  message: string;
  data: Transaction[];
}

export default function TransactionsPage() {
  const [transactions, setTransactions] = useState<Transaction[]>([]);
  const [loading, setLoading] = useState(true);
  const [selectedPeriod, setSelectedPeriod] = useState<TimePeriod>('current_month');
  
  // Use React Query for analytics with automatic retry and caching
  const { analytics, monthlyChanges, timePeriodOptions, isLoading: analyticsLoading } = useAnalyticsMetrics();

  useEffect(() => {
    const fetchData = async () => {
      const token = localStorage.getItem('token');
      if (!token) {
        setLoading(false);
        return;
      }

      try {
        // Fetch transactions first (critical data)
        const transactionResponse = await transactionCache.getOrFetch<ApiResponse>(
          'all_transactions_max',
          async () => {
            const axiosResponse = await axios.get<ApiResponse>(`${process.env.NEXT_PUBLIC_API_URL}/admin/transactions/list?page_size=50000000`, {
              headers: {
                Authorization: `Bearer ${token}`
              }
            });
            return axiosResponse.data;
          }
        );

        if (transactionResponse.success && Array.isArray(transactionResponse.data)) {
          setTransactions(transactionResponse.data);
        }

        // Analytics are now handled by React Query hook - no manual fetching needed
      } catch (err: any) {
        console.error('TransactionsPage fetch error:', err);
      } finally {
        setLoading(false);
      }
    };

    fetchData();
  }, []);

  // Get current period data
  const currentPeriodData = analyticsService.getPeriodData(analytics || null, selectedPeriod);
  const periodSummary = analyticsService.getPeriodSummary(currentPeriodData);
  
  // Process category data for the selected period
  const categoryMetrics = analyticsService.processCategoryData(currentPeriodData);

  // Get the label for selected period
  const selectedPeriodLabel = timePeriodOptions.find(option => option.value === selectedPeriod)?.label || 'Current Period';

  return (
    <div className="space-y-4 lg:space-y-6">
      <motion.div
        initial={{ opacity: 0, y: 20 }}
        animate={{ opacity: 1, y: 0 }}
        transition={{ duration: 0.5 }}
      >
        <h1 className="text-xl lg:text-2xl">Transactions</h1>
        <p className="text-muted-foreground mt-1 text-sm">View and manage all transactions</p>
      </motion.div>

      <motion.div 
        className="grid grid-cols-2 lg:grid-cols-4 gap-3 lg:gap-4"
        initial={{ opacity: 0, y: 20 }}
        animate={{ opacity: 1, y: 0 }}
        transition={{ duration: 0.5, delay: 0.2 }}
      >
        <MetricCard 
          title="Monthly Transactions" 
          value={analyticsLoading ? "..." : analytics?.current_month ? analyticsService.formatCount(analytics.current_month.electronic || 0) : '0'} 
          change={analyticsLoading ? 0 : Math.abs(monthlyChanges.transactionCountChange)}
          changeType={monthlyChanges.transactionCountChange >= 0 ? "increase" : "decrease"}
        />
        <MetricCard 
          title="Monthly Volume" 
          value={analyticsLoading ? "..." : analytics?.current_month ? analyticsService.formatVolume((analytics.current_month.total_credit || 0) + (analytics.current_month.total_debit || 0)) : '₦0'} 
          change={analyticsLoading ? 0 : Math.abs(monthlyChanges.volumeChange)}
          changeType={monthlyChanges.volumeChange >= 0 ? "increase" : "decrease"}
        />
        <MetricCard 
          title="Monthly Credit" 
          value={analyticsLoading ? "..." : analytics?.current_month ? analyticsService.formatVolume(analytics.current_month.total_credit || 0) : '₦0'} 
          change={analyticsLoading ? 0 : Math.abs(monthlyChanges.creditChange)}
          changeType={monthlyChanges.creditChange >= 0 ? "increase" : "decrease"}
        />
        <MetricCard 
          title="Monthly Debit" 
          value={analyticsLoading ? "..." : analytics?.current_month ? analyticsService.formatVolume(analytics.current_month.total_debit || 0) : '₦0'} 
          change={analyticsLoading ? 0 : Math.abs(monthlyChanges.debitChange)}
          changeType={monthlyChanges.debitChange >= 0 ? "increase" : "decrease"}
        />
      </motion.div>

      <motion.div
        initial={{ opacity: 0, y: 20 }}
        animate={{ opacity: 1, y: 0 }}
        transition={{ duration: 0.5, delay: 0.4 }}
      >
        <Tabs defaultValue="transactions" className="w-full">
          <TabsList className="grid w-full grid-cols-2 mb-6">
            <TabsTrigger value="transactions">Transactions</TabsTrigger>
            <TabsTrigger value="metrics">Metrics</TabsTrigger>
          </TabsList>

          <TabsContent value="transactions">
            <DetailedTransactionsTable />
          </TabsContent>

          <TabsContent value="metrics" className="space-y-4">
            <div className="flex flex-col sm:flex-row sm:items-center sm:justify-between gap-4 mb-6">
              <div>
                <h3 className="text-lg font-semibold mb-2">{selectedPeriodLabel} Categories</h3>
                <div className="flex items-center gap-2 text-sm text-muted-foreground">
                  <span>{periodSummary.totalTransactions} transactions</span>
                  <span>•</span>
                  <span>{periodSummary.formattedVolume} total</span>
                </div>
              </div>
              
              <div className="flex items-center gap-2">
                <Select value={selectedPeriod} onValueChange={(value: TimePeriod) => setSelectedPeriod(value)}>
                  <SelectTrigger className="w-[180px]">
                    <SelectValue placeholder="Select period" />
                  </SelectTrigger>
                  <SelectContent>
                    {timePeriodOptions.map((option) => (
                      <SelectItem 
                        key={option.value} 
                        value={option.value}
                        disabled={!option.available}
                      >
                        {option.label}
                        {!option.available && ' (No data)'}
                      </SelectItem>
                    ))}
                  </SelectContent>
                </Select>
              </div>
            </div>
            
            <div className={`grid gap-3 lg:gap-4 ${
              categoryMetrics.length === 1 ? 'grid-cols-1 max-w-sm' :
              categoryMetrics.length === 2 ? 'grid-cols-1 sm:grid-cols-2 max-w-2xl' :
              categoryMetrics.length === 3 ? 'grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 max-w-4xl' :
              'grid-cols-2 lg:grid-cols-3 xl:grid-cols-4'
            }`}>
              {categoryMetrics.map((metric, index) => (
                <motion.div
                  key={metric.category}
                  initial={{ opacity: 0, y: 20 }}
                  animate={{ opacity: 1, y: 0 }}
                  transition={{ duration: 0.3, delay: index * 0.1 }}
                >
                  <MetricCard
                    title={metric.category.charAt(0).toUpperCase() + metric.category.slice(1)}
                    value={`${metric.formattedAmount}`}
                    change={parseFloat(metric.percentage.toFixed(1))}
                    changeType="increase"
                  />
                </motion.div>
              ))}
              
              {categoryMetrics.length === 0 && !loading && (
                <div className="col-span-full text-center py-12 text-muted-foreground">
                  <CircleDollarSign className="h-12 w-12 mx-auto mb-4 opacity-50" />
                  <p>No transaction categories available for {selectedPeriodLabel.toLowerCase()}</p>
                </div>
              )}
            </div>
          </TabsContent>
        </Tabs>
      </motion.div>
    </div>
  );
}