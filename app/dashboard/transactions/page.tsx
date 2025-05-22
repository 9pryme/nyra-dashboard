"use client";

import MetricCard from "@/components/dashboard/MetricCard";
import TransactionList from "@/components/dashboard/TransactionList";
import { ArrowUpRight, ArrowDownRight, CircleDollarSign, Clock } from "lucide-react";
import { motion } from "framer-motion";

export default function TransactionsPage() {
  return (
    <div className="p-6 space-y-6">
      <motion.div
        initial={{ opacity: 0, y: 20 }}
        animate={{ opacity: 1, y: 0 }}
        transition={{ duration: 0.5 }}
      >
        <h1 className="text-2xl font-bold tracking-[-0.02em]">Transactions</h1>
        <p className="text-muted-foreground">View and manage all transactions</p>
      </motion.div>

      <motion.div 
        className="grid grid-cols-1 md:grid-cols-4 gap-6"
        initial={{ opacity: 0, y: 20 }}
        animate={{ opacity: 1, y: 0 }}
        transition={{ duration: 0.5, delay: 0.2 }}
      >
        <MetricCard 
          title="Total Transactions" 
          value="2,530" 
          icon={<CircleDollarSign className="h-5 w-5" />}
          change={8.3}
          changeType="increase"
        />
        <MetricCard 
          title="Total Volume" 
          value="₦15.2M" 
          icon={<ArrowUpRight className="h-5 w-5" />}
          change={12.5}
          changeType="increase"
        />
        <MetricCard 
          title="Failed Transactions" 
          value="45" 
          icon={<ArrowDownRight className="h-5 w-5" />}
          change={-2.1}
          changeType="decrease"
        />
        <MetricCard 
          title="Pending Transactions" 
          value="12" 
          icon={<Clock className="h-5 w-5" />}
          change={0}
          changeType="decrease"
        />
      </motion.div>

      <motion.div
        initial={{ opacity: 0, y: 20 }}
        animate={{ opacity: 1, y: 0 }}
        transition={{ duration: 0.5, delay: 0.4 }}
      >
        <TransactionList />
      </motion.div>
    </div>
  );
}