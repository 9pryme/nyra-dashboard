"use client";

import { useState, useEffect } from "react";
import axios from "axios";
import MetricCard from "@/components/dashboard/MetricCard";
import WalletCard from "@/components/dashboard/WalletCard";
import FinanceChart from "@/components/dashboard/FinanceChart";
import TransactionList from "@/components/dashboard/TransactionList";
import ServiceManagement from "@/components/dashboard/ServiceManagement";
import { ArrowUpRight } from "lucide-react";
import { motion } from "framer-motion";
import Link from "next/link";
import { Button } from "@/components/ui/button";
import { DashboardSkeleton } from "@/components/ui/skeleton-loader";
import { dashboardCache } from "@/lib/cache";
import NyraLoading from "@/components/ui/nyra-loading";
import { apiCache } from "@/lib/cache";
import { useGlobalLoading } from "@/hooks/use-global-loading";
import { useAnalyticsMetrics } from "@/hooks/use-analytics";
import { walletService, WalletAnalytics } from "@/lib/services/wallet";
import { analyticsService } from "@/lib/services/analytics";

interface WalletSummary {
  total_balance: string;
  total_credit: string;
  total_debit: string;
  total_credit_count: string;
  total_debit_count: string;
}

export default function DashboardPage() {
  const [walletSummary, setWalletSummary] = useState<WalletSummary | null>(null);
  const [walletAnalytics, setWalletAnalytics] = useState<WalletAnalytics | null>(null);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState<string | null>(null);
  const { isLoading: globalLoading } = useGlobalLoading();
  
  // Use React Query for analytics with automatic retry and caching
  const { analytics: transactionAnalytics, dailyChanges, isLoading: analyticsLoading } = useAnalyticsMetrics();

  useEffect(() => {
    const fetchData = async () => {
      const token = localStorage.getItem('token');
      if (!token) {
        setError('No authentication token found');
        setLoading(false);
        return;
      }

      try {
        // Fetch wallet summary and wallets data first (critical)
        const [walletSummary, walletsData] = await Promise.all([
          dashboardCache.getOrFetch<any>(
            'wallet_summary',
            async () => {
              const response = await axios.get(`${process.env.NEXT_PUBLIC_API_URL}/wallet/summary`, {
                headers: { Authorization: `Bearer ${token}` }
              });
              return response.data;
            }
          ),
          dashboardCache.getOrFetch<any>(
            'dashboard_wallets',
            async () => {
              return await walletService.fetchWallets();
            }
          )
        ]);

        if (walletSummary.success) {
          setWalletSummary(walletSummary.data[0]);
        }

        // Calculate wallet analytics from actual wallet data
        if (walletsData) {
          const walletStats = walletService.calculateWalletAnalytics(walletsData);
          setWalletAnalytics(walletStats);
        }

        // Analytics are now handled by React Query hook - no manual fetching needed

        setError(null);
      } catch (err: any) {
        console.error('Dashboard fetch error:', err);
        setError(err.message || 'Failed to fetch dashboard data');
      } finally {
        setLoading(false);
      }
    };

    fetchData();
  }, []);

  // Don't show local loading if global loading is active
  if ((loading || analyticsLoading) && !globalLoading) {
    return <NyraLoading size="lg" className="min-h-[60vh]" />;
  }

  if (error) {
    return (
      <div className="max-w-full">
        <div className="text-red-500">{error}</div>
      </div>
    );
  }

  // dailyChanges is now provided by the useAnalyticsMetrics hook

  return (
    <div className="space-y-3 lg:space-y-4 max-w-full">
      <motion.div
        initial={{ opacity: 0, y: 20 }}
        animate={{ opacity: 1, y: 0 }}
        transition={{ duration: 0.5 }}
      >
        <h1 className="text-xl lg:text-2xl">Welcome to Nyra!</h1>
        <p className="text-muted-foreground mt-1 text-sm">Today is a great day to make money.</p>
      </motion.div>
      
      <div className="flex flex-col xl:flex-row gap-3 min-w-0">
        <div className="flex-1 space-y-3 lg:space-y-4 min-w-0">
          <motion.div 
            className="grid grid-cols-2 lg:grid-cols-4 gap-2"
            initial={{ opacity: 0, y: 20 }}
            animate={{ opacity: 1, y: 0 }}
            transition={{ duration: 0.5, delay: 0.2 }}
          >
            <MetricCard 
              title="All User Wallet Balance" 
              value={walletAnalytics ? walletService.formatVolume(walletAnalytics.calculatedTotalBalance) : '₦0.00'} 
              change={walletAnalytics ? walletAnalytics.weeklyChanges.balanceChange : 0}
              changeType={walletAnalytics && walletAnalytics.weeklyChanges.balanceChange >= 0 ? "increase" : "decrease"}
            />
            <MetricCard 
              title="Today's Volume" 
              value={transactionAnalytics?.today ? analyticsService.formatVolume((transactionAnalytics.today.total_credit || 0) + (transactionAnalytics.today.total_debit || 0)) : '₦0.00'} 
              change={Math.abs(dailyChanges.volumeChange)}
              changeType={dailyChanges.volumeChange >= 0 ? "increase" : "decrease"}
            />
            <MetricCard 
              title="Total Users" 
              value={walletAnalytics ? walletAnalytics.totalWallets.toString() : '0'} 
              change={walletAnalytics ? walletAnalytics.weeklyChanges.totalWalletsChange : 0}
              changeType={walletAnalytics && walletAnalytics.weeklyChanges.totalWalletsChange >= 0 ? "increase" : "decrease"}
            />
            <MetricCard 
              title="Today's Transactions" 
              value={transactionAnalytics?.today ? analyticsService.formatCount(transactionAnalytics.today.electronic || 0) : '0'} 
              change={Math.abs(dailyChanges.transactionCountChange)}
              changeType={dailyChanges.transactionCountChange >= 0 ? "increase" : "decrease"}
            />
          </motion.div>
          
          <motion.div
            initial={{ opacity: 0, y: 20 }}
            animate={{ opacity: 1, y: 0 }}
            transition={{ duration: 0.5, delay: 0.4 }}
          >
            <FinanceChart />
          </motion.div>
          
          <motion.div
            initial={{ opacity: 0, y: 20 }}
            animate={{ opacity: 1, y: 0 }}
            transition={{ duration: 0.5, delay: 0.6 }}
          >
            <TransactionList />
          </motion.div>
        </div>
        
        <motion.div 
          className="w-full xl:w-96 space-y-3 lg:space-y-4 min-w-0"
          initial={{ opacity: 0, x: 20 }}
          animate={{ opacity: 1, x: 0 }}
          transition={{ duration: 0.5, delay: 0.4 }}
        >
          <WalletCard />
          <ServiceManagement />
        </motion.div>
      </div>
    </div>
  );
}