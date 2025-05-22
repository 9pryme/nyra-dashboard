"use client";

import { useState } from "react";
import { Bell, Mail, Users, MessageSquare } from "lucide-react";
import { motion } from "framer-motion";
import MetricCard from "@/components/dashboard/MetricCard";
import { Tabs, TabsContent, TabsList, TabsTrigger } from "@/components/ui/tabs";
import PushNotifications from "@/components/notifications/PushNotifications";
import EmailNotifications from "@/components/notifications/EmailNotifications";

export default function NotificationsPage() {
  return (
    <motion.div 
      initial={{ opacity: 0, y: 20 }}
      animate={{ opacity: 1, y: 0 }}
      transition={{ duration: 0.5 }}
      className="p-6 space-y-6"
    >
      <div>
        <h1 className="text-2xl font-bold tracking-[-0.02em]">Notifications</h1>
        <p className="text-muted-foreground">Send notifications and promotional emails to users</p>
      </div>

      <motion.div 
        initial={{ opacity: 0, y: 20 }}
        animate={{ opacity: 1, y: 0 }}
        transition={{ duration: 0.5, delay: 0.2 }}
        className="grid grid-cols-1 md:grid-cols-4 gap-6"
      >
        <MetricCard 
          title="Total Notifications" 
          value="1,250" 
          icon={<Bell className="h-5 w-5" />}
          change={12.5}
          changeType="increase"
        />
        <MetricCard 
          title="Total Emails" 
          value="850" 
          icon={<Mail className="h-5 w-5" />}
          change={8.3}
          changeType="increase"
        />
        <MetricCard 
          title="Active Users" 
          value="2,500" 
          icon={<Users className="h-5 w-5" />}
          change={5.2}
          changeType="increase"
        />
        <MetricCard 
          title="Engagement Rate" 
          value="68%" 
          icon={<MessageSquare className="h-5 w-5" />}
          change={3.1}
          changeType="increase"
        />
      </motion.div>

      <motion.div
        initial={{ opacity: 0, y: 20 }}
        animate={{ opacity: 1, y: 0 }}
        transition={{ duration: 0.5, delay: 0.4 }}
      >
        <Tabs defaultValue="push" className="space-y-6">
          <TabsList>
            <TabsTrigger value="push">Push Notifications</TabsTrigger>
            <TabsTrigger value="email">Email Notifications</TabsTrigger>
          </TabsList>
          <TabsContent value="push">
            <PushNotifications />
          </TabsContent>
          <TabsContent value="email">
            <EmailNotifications />
          </TabsContent>
        </Tabs>
      </motion.div>
    </motion.div>
  );
}