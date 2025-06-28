"use client";

import { useState, useEffect } from "react";
import { Wallet, CircleDollarSign, ArrowUpRight, ArrowDownRight } from "lucide-react";
import { motion } from "framer-motion";
import MetricCard from "@/components/dashboard/MetricCard";
import WalletList from "@/components/dashboard/WalletList";
import { walletService, WalletData, WalletSummary, WalletAnalytics } from "@/lib/services/wallet";

export default function ManageWalletsPage() {
  const [walletSummary, setWalletSummary] = useState<WalletSummary | null>(null);
  const [wallets, setWallets] = useState<WalletData[]>([]);
  const [walletAnalytics, setWalletAnalytics] = useState<WalletAnalytics | null>(null);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState<string | null>(null);

  useEffect(() => {
    const fetchWalletData = async () => {
      try {
        // Fetch wallet summary and wallets using the service
        const [summary, walletsData] = await Promise.all([
          walletService.fetchWalletSummary(),
          walletService.fetchWallets()
        ]);

        setWalletSummary(summary);
        setWallets(walletsData);
        
        // Calculate analytics from the actual wallet data
        const analytics = walletService.calculateWalletAnalytics(walletsData);
        setWalletAnalytics(analytics);
        
      } catch (err) {
        console.error('Error fetching wallet data:', err);
        setError(err instanceof Error ? err.message : 'An error occurred');
      } finally {
        setLoading(false);
      }
    };

    fetchWalletData();
  }, []);



  if (loading) {
    return (
      <div className="p-6 space-y-6">
        <div className="animate-pulse">
          <div className="h-8 w-64 bg-gray-200 rounded mb-2"></div>
          <div className="h-4 w-48 bg-gray-200 rounded"></div>
        </div>
        <div className="grid grid-cols-1 md:grid-cols-4 gap-6">
          {[...Array(4)].map((_, i) => (
            <div key={i} className="bg-card rounded-lg p-6 shadow-sm animate-pulse">
              <div className="h-5 w-24 bg-gray-200 rounded mb-4"></div>
              <div className="h-8 w-32 bg-gray-200 rounded"></div>
            </div>
          ))}
        </div>
      </div>
    );
  }

  if (error) {
    return (
      <div className="p-6">
        <div className="text-red-500">{error}</div>
      </div>
    );
  }

  return (
    <motion.div 
      initial={{ opacity: 0, y: 20 }}
      animate={{ opacity: 1, y: 0 }}
      transition={{ duration: 0.5 }}
      className="p-6 space-y-6"
    >
      <div>
        <h1 className="text-2xl font-bold tracking-[-0.02em]">Manage Wallets</h1>
        <p className="text-muted-foreground">View and manage all user wallets</p>
      </div>

      <motion.div 
        initial={{ opacity: 0, y: 20 }}
        animate={{ opacity: 1, y: 0 }}
        transition={{ duration: 0.5, delay: 0.2 }}
        className="grid grid-cols-1 md:grid-cols-4 gap-6"
      >
        <MetricCard 
          title="Total Wallets" 
          value={walletAnalytics ? walletAnalytics.totalWallets.toString() : "0"} 
          change={walletAnalytics ? walletAnalytics.weeklyChanges.totalWalletsChange : 0}
          changeType={walletAnalytics && walletAnalytics.weeklyChanges.totalWalletsChange >= 0 ? "increase" : "decrease"}
        />
        <MetricCard 
          title="Calculated Total Balance" 
          value={walletAnalytics ? walletService.formatVolume(walletAnalytics.calculatedTotalBalance) : "₦0.00"} 
          change={walletAnalytics ? walletAnalytics.weeklyChanges.balanceChange : 0}
          changeType={walletAnalytics && walletAnalytics.weeklyChanges.balanceChange >= 0 ? "increase" : "decrease"}
        />
        <MetricCard 
          title="Active Wallets" 
          value={walletAnalytics ? walletAnalytics.activeWallets.toString() : "0"} 
          change={walletAnalytics ? walletAnalytics.weeklyChanges.activeWalletsChange : 0}
          changeType={walletAnalytics && walletAnalytics.weeklyChanges.activeWalletsChange >= 0 ? "increase" : "decrease"}
        />
        <MetricCard 
          title="Frozen Wallets" 
          value={walletAnalytics ? walletAnalytics.frozenWallets.toString() : "0"} 
          change={walletAnalytics ? Math.abs(walletAnalytics.weeklyChanges.frozenWalletsChange) : 0}
          changeType={walletAnalytics && walletAnalytics.weeklyChanges.frozenWalletsChange <= 0 ? "increase" : "decrease"}
        />
      </motion.div>

      <motion.div
        initial={{ opacity: 0, y: 20 }}
        animate={{ opacity: 1, y: 0 }}
        transition={{ duration: 0.5, delay: 0.4 }}
      >
        <WalletList wallets={wallets} />
      </motion.div>
    </motion.div>
  );
}