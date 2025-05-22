"use client";

import { useState, useEffect } from "react";
import axios from "axios";
import MetricCard from "@/components/dashboard/MetricCard";
import WalletCard from "@/components/dashboard/WalletCard";
import FinanceChart from "@/components/dashboard/FinanceChart";
import TransactionList from "@/components/dashboard/TransactionList";
import ServiceManagement from "@/components/dashboard/ServiceManagement";
import { ArrowUpRight, Wallet, CircleDollarSign, Users, ScrollText } from "lucide-react";
import { motion } from "framer-motion";
import Link from "next/link";
import { Button } from "@/components/ui/button";

interface WalletSummary {
  total_balance: string;
  total_credit: string;
  total_debit: string;
  total_credit_count: string;
  total_debit_count: string;
}

interface TransactionAnalytics {
  today: {
    categories: Record<string, number>;
    electronic: number;
    total_debit: number;
    total_credit: number;
    total_charges_external: number;
    total_charges_internal: number;
  };
  yesteday: {
    categories: Record<string, number>;
    electronic: number;
    total_debit: number;
    total_credit: number;
    total_charges_external: number;
    total_charges_internal: number;
  };
  current_month: {
    categories: Record<string, number>;
    electronic: number;
    total_debit: number;
    total_credit: number;
    total_charges_external: number;
    total_charges_internal: number;
  };
  last_month: {
    categories: Record<string, number>;
    electronic: number;
    total_debit: number;
    total_credit: number;
  };
  current_year: {
    categories: Record<string, number>;
    electronic: number;
    total_debit: number;
    total_credit: number;
    total_charges_external: number;
    total_charges_internal: number;
  };
  last_year: null;
}

export default function DashboardPage() {
  const [walletSummary, setWalletSummary] = useState<WalletSummary | null>(null);
  const [transactionAnalytics, setTransactionAnalytics] = useState<TransactionAnalytics | null>(null);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState<string | null>(null);

  useEffect(() => {
    const fetchData = async () => {
      try {
        const token = localStorage.getItem('token');
        if (!token) {
          throw new Error('No authentication token found');
        }

        const [walletResponse, analyticsResponse] = await Promise.all([
          axios.get(`${process.env.NEXT_PUBLIC_API_URL}/wallet/summary`, {
            headers: { Authorization: `Bearer ${token}` }
          }),
          axios.get(`${process.env.NEXT_PUBLIC_API_URL}/analytics/transactions/recent`, {
            headers: { Authorization: `Bearer ${token}` }
          })
        ]);

        if (walletResponse.data.success) {
          setWalletSummary(walletResponse.data.data[0]);
        }

        if (analyticsResponse.data.success) {
          setTransactionAnalytics(analyticsResponse.data.data);
        }
      } catch (err) {
        setError(err instanceof Error ? err.message : 'Failed to fetch dashboard data');
      } finally {
        setLoading(false);
      }
    };

    fetchData();
  }, []);

  const formatCurrency = (amount: string | number) => {
    const numAmount = typeof amount === 'string' ? parseFloat(amount) : amount;
    return new Intl.NumberFormat('en-NG', {
      style: 'currency',
      currency: 'NGN',
      minimumFractionDigits: 2,
      maximumFractionDigits: 2,
    }).format(numAmount);
  };

  const legendItems = [
    {
      label: "Deposits",
      color: "bg-green-400",
      indicator: "bg-green-100 text-green-800"
    },
    {
      label: "Withdrawals", 
      color: "bg-amber-400",
      indicator: "bg-amber-100 text-amber-800"
    },
    {
      label: "Users",
      color: "bg-blue-400",
      indicator: "bg-blue-100 text-blue-800"
    },
    {
      label: "Referrals",
      color: "bg-purple-400", 
      indicator: "bg-purple-100 text-purple-800"
    }
  ];

  if (loading) {
    return (
      <div className="p-6 space-y-6">
        <div className="animate-pulse">
          <div className="h-8 w-64 bg-gray-200 rounded mb-2"></div>
          <div className="h-4 w-48 bg-gray-200 rounded"></div>
        </div>
        {/* Add more loading skeletons as needed */}
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
    <div className="p-6 space-y-6">
      <motion.div
        initial={{ opacity: 0, y: 20 }}
        animate={{ opacity: 1, y: 0 }}
        transition={{ duration: 0.5 }}
      >
        <h1 className="text-2xl font-bold tracking-[-0.02em]">Welcome to Nyra!</h1>
        <p className="text-muted-foreground">Today is a great day to make money.</p>
      </motion.div>
      
      <div className="flex flex-col lg:flex-row gap-6">
        <div className="flex-1 space-y-6">
          <motion.div 
            className="grid grid-cols-1 md:grid-cols-4 gap-6"
            initial={{ opacity: 0, y: 20 }}
            animate={{ opacity: 1, y: 0 }}
            transition={{ duration: 0.5, delay: 0.2 }}
          >
            <MetricCard 
              title="All User Wallet Balance" 
              value={walletSummary ? formatCurrency(walletSummary.total_balance) : '₦0.00'} 
              icon={<Wallet className="h-5 w-5" />}
              change={12.5}
              changeType="increase"
            />
            <MetricCard 
              title="Total Fees" 
              value={transactionAnalytics ? formatCurrency(transactionAnalytics.current_month.total_charges_internal + transactionAnalytics.current_month.total_charges_external) : '₦0.00'} 
              icon={<CircleDollarSign className="h-5 w-5" />}
              change={5.2}
              changeType="increase"
            />
            <MetricCard 
              title="Total Users" 
              value={walletSummary ? (parseInt(walletSummary.total_credit_count) + parseInt(walletSummary.total_debit_count)).toString() : '0'} 
              icon={<Users className="h-5 w-5" />}
              change={15.8}
              changeType="increase"
            />
            <MetricCard 
              title="Total Transactions" 
              value={walletSummary ? (parseInt(walletSummary.total_credit_count) + parseInt(walletSummary.total_debit_count)).toString() : '0'} 
              icon={<ScrollText className="h-5 w-5" />}
              change={8.3}
              changeType="increase"
            />
          </motion.div>
          
          <motion.div
            initial={{ opacity: 0, y: 20 }}
            animate={{ opacity: 1, y: 0 }}
            transition={{ duration: 0.5, delay: 0.4 }}
          >
            <div className="flex justify-between items-center mb-6">
              <h2 className="text-xl font-semibold tracking-[-0.015em]">Account Activity</h2>
              <div className="flex items-center space-x-2">
                {legendItems.map((item) => (
                  <span key={item.label} className={`inline-flex items-center px-2.5 py-0.5 rounded-full text-xs font-medium ${item.indicator}`}>
                    <span className={`h-2 w-2 mr-1 rounded-full ${item.color}`}></span>
                    {item.label}
                  </span>
                ))}
              </div>
            </div>
            <FinanceChart legendItems={legendItems} />
          </motion.div>
          
          <motion.div
            initial={{ opacity: 0, y: 20 }}
            animate={{ opacity: 1, y: 0 }}
            transition={{ duration: 0.5, delay: 0.6 }}
          >
            <TransactionList />
            <div className="mt-4 text-center">
              <Link href="/dashboard/transactions">
                <Button variant="outline">
                  View All Transactions
                  <ArrowUpRight className="ml-2 h-4 w-4" />
                </Button>
              </Link>
            </div>
          </motion.div>
        </div>
        
        <motion.div 
          className="lg:w-96 space-y-6"
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