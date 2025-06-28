"use client";

import { ArrowUpRight, ArrowDownRight } from "lucide-react";
import { cn } from "@/lib/utils";

interface MetricCardProps {
  title: string;
  value: string;
  change?: number;
  changeType?: "increase" | "decrease";
}

export default function MetricCard({
  title,
  value,
  change,
  changeType = "increase"
}: MetricCardProps) {
  return (
    <div className="bg-card rounded-md p-2.5 sm:p-3 shadow-sm border border-border/40">
      <div className="mb-1.5 sm:mb-2">
        <p className="text-muted-foreground text-[10px] sm:text-xs">{title}</p>
        <h3 className="text-base sm:text-lg font-semibold mt-0.5">{value}</h3>
      </div>
      
      {change !== undefined && (
        <div className="flex items-center gap-1">
          <div
            className={cn(
              "text-[10px] font-medium flex items-center gap-0.5 rounded-full px-1.5 py-0.5",
              changeType === "increase"
                ? "text-green-700 bg-green-100"
                : "text-red-700 bg-red-100"
            )}
          >
            {changeType === "increase" ? (
              <ArrowUpRight className="h-2.5 w-2.5" />
            ) : (
              <ArrowDownRight className="h-2.5 w-2.5" />
            )}
            {change}%
          </div>
          <span className="text-[10px] text-muted-foreground">vs last month</span>
        </div>
      )}
    </div>
  );
}