"use client";

import { motion } from "framer-motion";
import MetricCard from "@/components/dashboard/MetricCard";
import { Users, UserCheck, UsersRound } from "lucide-react";
import UsersTable from "@/components/users/UsersTable";
import { Skeleton } from "@/components/ui/skeleton";
import { useUserMetrics } from "@/hooks/use-users";

export default function UsersPage() {
  // Use React Query to get user metrics
  const { metrics, isLoading } = useUserMetrics();

  return (
    <motion.div 
      initial={{ opacity: 0, y: 20 }}
      animate={{ opacity: 1, y: 0 }}
      transition={{ duration: 0.5 }}
      className="p-6 space-y-6"
    >
      <div>
        <h1 className="text-2xl font-bold tracking-[-0.02em]">User Management</h1>
        <p className="text-muted-foreground">Manage and monitor user activities</p>
      </div>
      
      <motion.div 
        initial={{ opacity: 0, y: 20 }}
        animate={{ opacity: 1, y: 0 }}
        transition={{ duration: 0.5, delay: 0.2 }}
        className="grid grid-cols-1 md:grid-cols-3 gap-6"
      >
        {isLoading ? (
          <>
            <div className="bg-card rounded-lg shadow-sm overflow-hidden border border-border/40 p-6">
              <div className="flex items-center justify-between mb-4">
                <Skeleton className="h-4 w-24" />
                <Skeleton className="h-8 w-8 rounded-full" />
              </div>
              <Skeleton className="h-8 w-32 mb-2" />
              <Skeleton className="h-4 w-20" />
            </div>
            <div className="bg-card rounded-lg shadow-sm overflow-hidden border border-border/40 p-6">
              <div className="flex items-center justify-between mb-4">
                <Skeleton className="h-4 w-24" />
                <Skeleton className="h-8 w-8 rounded-full" />
              </div>
              <Skeleton className="h-8 w-32 mb-2" />
              <Skeleton className="h-4 w-20" />
            </div>
            <div className="bg-card rounded-lg shadow-sm overflow-hidden border border-border/40 p-6">
              <div className="flex items-center justify-between mb-4">
                <Skeleton className="h-4 w-24" />
                <Skeleton className="h-8 w-8 rounded-full" />
              </div>
              <Skeleton className="h-8 w-32 mb-2" />
              <Skeleton className="h-4 w-20" />
            </div>
          </>
        ) : (
          <>
            <MetricCard 
              title="Total Users" 
              value={metrics.totalUsers.toLocaleString()} 
              change={12.5}
              changeType="increase"
            />
            <MetricCard 
              title="Active Users" 
              value={metrics.activeUsers.toLocaleString()} 
              change={8.2}
              changeType="increase"
            />
            <MetricCard 
              title="Inactive Users" 
              value={metrics.inactiveUsers.toLocaleString()} 
              change={15.3}
              changeType="increase"
            />
          </>
        )}
      </motion.div>
      
      <motion.div
        initial={{ opacity: 0, y: 20 }}
        animate={{ opacity: 1, y: 0 }}
        transition={{ duration: 0.5, delay: 0.4 }}
      >
        <UsersTable />
      </motion.div>
    </motion.div>
  );
}