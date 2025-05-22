"use client";

import { ArrowUpRight, ArrowDownRight } from "lucide-react";
import { cn } from "@/lib/utils";

interface MetricCardProps {
  title: string;
  value: string;
  icon: React.ReactNode;
  change?: number;
  changeType?: "increase" | "decrease";
}

export default function MetricCard({
  title,
  value,
  icon,
  change,
  changeType = "increase"
}: MetricCardProps) {
  return (
    <div className="bg-card rounded-lg p-6 shadow-sm border border-border/40">
      <div className="flex justify-between items-start mb-4">
        <div className="flex flex-col">
          <p className="text-muted-foreground text-sm">{title}</p>
          <h3 className="text-2xl font-bold mt-1">{value}</h3>
        </div>
        <div className="h-10 w-10 rounded-full bg-primary/10 flex items-center justify-center">
          {icon}
        </div>
      </div>
      
      {change !== undefined && (
        <div className="flex items-center">
          <div
            className={cn(
              "text-xs font-medium flex items-center gap-1 rounded-full px-2 py-1",
              changeType === "increase"
                ? "text-green-700 bg-green-100"
                : "text-red-700 bg-red-100"
            )}
          >
            {changeType === "increase" ? (
              <ArrowUpRight className="h-3 w-3" />
            ) : (
              <ArrowDownRight className="h-3 w-3" />
            )}
            {change}%
          </div>
          <span className="text-xs text-muted-foreground ml-2">vs last month</span>
        </div>
      )}
    </div>
  );
}