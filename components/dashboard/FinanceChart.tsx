"use client";

import { useState } from "react";
import { CartesianGrid, Area, AreaChart, XAxis, YAxis, Tooltip, ResponsiveContainer } from "recharts";
import { Button } from "@/components/ui/button";
import {
  Select,
  SelectContent,
  SelectItem,
  SelectTrigger,
  SelectValue,
} from "@/components/ui/select";
import {
  Card,
  CardContent,
  CardHeader,
  CardTitle,
} from "@/components/ui/card";

// Sample data - in a real app, this would come from an API
const data = [
  { name: "Apr 14", balance: 2400000, deposits: 150000, withdrawals: 80000, users: 100, referrals: 125 },
  { name: "Apr 15", balance: 2650000, deposits: 250000, withdrawals: 120000, users: 190, referrals: 8 },
  { name: "Apr 16", balance: 2580000, deposits: 130000, withdrawals: 200000, users: 115, referrals: 126 },
  { name: "Apr 17", balance: 2780000, deposits: 380000, withdrawals: 180000, users: 140, referrals: 12 },
  { name: "Apr 18", balance: 2950000, deposits: 320000, withdrawals: 150000, users: 135, referrals: 200 },
  { name: "Apr 19", balance: 3200000, deposits: 450000, withdrawals: 200000, users: 160, referrals: 15 },
  { name: "Apr 20", balance: 3150000, deposits: 200000, withdrawals: 250000, users: 180, referrals: 148 },
];

const timeRanges = [
  { value: '1W', label: '7D' },
  { value: '1M', label: '1M' },
  { value: '3M', label: '3M' },
  { value: '6M', label: '6M' },
  { value: '1Y', label: '1Y' },
];

const chartMetrics = [
  { 
    value: 'balance', 
    label: 'Wallet Balance', 
    dataKey: 'balance',
    formatValue: (value: number) => `₦${(value / 1000000).toFixed(1)}M`,
    tooltipLabel: 'Total Balance'
  },
  { 
    value: 'deposits', 
    label: 'Deposits', 
    dataKey: 'deposits',
    formatValue: (value: number) => `₦${(value / 1000).toFixed(0)}K`,
    tooltipLabel: 'Deposits'
  },
  { 
    value: 'withdrawals', 
    label: 'Withdrawals', 
    dataKey: 'withdrawals',
    formatValue: (value: number) => `₦${(value / 1000).toFixed(0)}K`,
    tooltipLabel: 'Withdrawals'
  },
  { 
    value: 'users', 
    label: 'Active Users', 
    dataKey: 'users',
    formatValue: (value: number) => value.toString(),
    tooltipLabel: 'Users'
  },
  { 
    value: 'referrals', 
    label: 'Referrals', 
    dataKey: 'referrals',
    formatValue: (value: number) => value.toString(),
    tooltipLabel: 'Referrals'
  },
];

interface FinanceChartProps {
  legendItems?: {
    label: string;
    color: string;
    indicator: string;
  }[];
}

const FinanceChart = ({ legendItems }: FinanceChartProps) => {
  const [timeRange, setTimeRange] = useState('1W');
  const [selectedMetric, setSelectedMetric] = useState('balance');

  const currentMetric = chartMetrics.find(metric => metric.value === selectedMetric) || chartMetrics[0];

  const customTooltip = ({ active, payload, label }: any) => {
    if (active && payload && payload.length) {
      const value = payload[0].value;
      return (
        <div className="bg-background border border-border rounded-lg shadow-lg p-3">
          <p className="font-medium text-foreground mb-1 text-sm">{label}</p>
          <p className="text-[#64D600] font-semibold text-sm">
            <span className="inline-block w-2 h-2 rounded-full bg-[#64D600] mr-2"></span>
            {currentMetric.tooltipLabel}: {currentMetric.formatValue(value)}
          </p>
        </div>
      );
    }
    return null;
  };

  return (
    <Card>
      <CardHeader className="pb-3">
        <div className="flex flex-col sm:flex-row sm:items-center sm:justify-between gap-3">
          <CardTitle className="text-lg font-semibold">Financial Overview</CardTitle>
          
          <div className="flex items-center gap-3">
            {/* Metric Selector Dropdown */}
            <Select value={selectedMetric} onValueChange={setSelectedMetric}>
              <SelectTrigger className="w-[140px] h-8 text-xs">
                <SelectValue />
              </SelectTrigger>
              <SelectContent>
                {chartMetrics.map((metric) => (
                  <SelectItem key={metric.value} value={metric.value} className="text-xs">
                    {metric.label}
                  </SelectItem>
                ))}
              </SelectContent>
            </Select>
            
            {/* Time Range Buttons */}
            <div className="flex gap-1">
              {timeRanges.map((range) => (
                <Button
                  key={range.value}
                  variant={timeRange === range.value ? "default" : "ghost"}
                  size="sm"
                  onClick={() => setTimeRange(range.value)}
                  className="px-2 py-1 h-7 text-xs"
                >
                  {range.label}
                </Button>
              ))}
            </div>
          </div>
        </div>
      </CardHeader>
      
      <CardContent>
        <div className="h-[200px]">
          <ResponsiveContainer width="100%" height="100%">
            <AreaChart
              data={data}
              margin={{ top: 5, right: 5, left: 0, bottom: 5 }}
            >
              <defs>
                <linearGradient id="primaryGradient" x1="0" y1="0" x2="0" y2="1">
                  <stop offset="5%" stopColor="#64D600" stopOpacity={0.4}/>
                  <stop offset="95%" stopColor="#64D600" stopOpacity={0.05}/>
                </linearGradient>
              </defs>
              <CartesianGrid strokeDasharray="3 3" stroke="#e2e8f0" vertical={false} />
              <XAxis 
                dataKey="name" 
                axisLine={false}
                tickLine={false}
                tick={{ fontSize: 11, fill: '#64748b' }}
              />
              <YAxis 
                axisLine={false}
                tickLine={false}
                tick={{ fontSize: 11, fill: '#64748b' }}
                tickFormatter={currentMetric.formatValue}
                width={60}
              />
              <Tooltip content={customTooltip} />
              <Area
                type="monotone"
                dataKey={currentMetric.dataKey}
                stroke="#64D600"
                strokeWidth={2.5}
                fill="url(#primaryGradient)"
                dot={false}
                activeDot={{ 
                  r: 5, 
                  fill: '#64D600', 
                  stroke: '#fff', 
                  strokeWidth: 2 
                }}
              />
            </AreaChart>
          </ResponsiveContainer>
        </div>
      </CardContent>
    </Card>
  );
};

export default FinanceChart;