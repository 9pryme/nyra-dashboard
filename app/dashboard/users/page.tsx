"use client";

import { useState, useEffect } from "react";
import { motion } from "framer-motion";
import MetricCard from "@/components/dashboard/MetricCard";
import { Users, UserCheck, UsersRound } from "lucide-react";
import UsersTable from "@/components/users/UsersTable";
import axios from "axios";
import { Skeleton } from "@/components/ui/skeleton";

interface User {
  created_at: string;
  updated_at: string;
  user_id: string;
  email: string;
  phone_number: string;
  firstname: string;
  lastname: string;
  role: string;
  active_status: string;
}

interface ApiResponse {
  statusCode: number;
  status: string;
  success: boolean;
  error: string;
  message: string;
  data: User[];
}

export default function UsersPage() {
  const [metrics, setMetrics] = useState({
    totalUsers: 0,
    activeUsers: 0,
    inactiveUsers: 0
  });
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    const fetchUsers = async () => {
      try {
        const token = localStorage.getItem('token');
        if (!token) {
          throw new Error('No authentication token found');
        }

        const response = await axios.get<ApiResponse>(`${process.env.NEXT_PUBLIC_API_URL}/user-admin/list?page_size=100000`, {
          headers: {
            Authorization: `Bearer ${token}`
          }
        });

        if (response.data.success && Array.isArray(response.data.data)) {
          const users = response.data.data;
          const activeUsers = users.filter((user: User) => user.active_status === "ACTIVE").length;
          
          setMetrics({
            totalUsers: users.length,
            activeUsers,
            inactiveUsers: users.length - activeUsers
          });
        }
      } catch (err) {
        console.error('Failed to fetch users:', err);
      } finally {
        setLoading(false);
      }
    };

    fetchUsers();
  }, []);

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
        {loading ? (
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
              icon={<Users className="h-5 w-5" />}
              change={12.5}
              changeType="increase"
            />
            <MetricCard 
              title="Active Users" 
              value={metrics.activeUsers.toLocaleString()} 
              icon={<UserCheck className="h-5 w-5" />}
              change={8.2}
              changeType="increase"
            />
            <MetricCard 
              title="Inactive Users" 
              value={metrics.inactiveUsers.toLocaleString()} 
              icon={<UsersRound className="h-5 w-5" />}
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
        <UsersTable loading={loading} />
      </motion.div>
    </motion.div>
  );
}