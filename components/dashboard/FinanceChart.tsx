"use client";

import { useState } from "react";
import { TrendingUp } from "lucide-react";
import { CartesianGrid, Line, LineChart, XAxis, YAxis, Tooltip, ResponsiveContainer, ReferenceDot } from "recharts";
import { Button } from "@/components/ui/button";
import {
  Card,
  CardContent,
  CardDescription,
  CardHeader,
  CardTitle,
} from "@/components/ui/card";

// Sample data - in a real app, this would come from an API
const data = [
  { name: "Apr 14", deposits: 10, withdrawals: 800, users: 100, referrals: 125 },
  { name: "Apr 15", deposits: 1500, withdrawals: 1200, users: 190, referrals: 8 },
  { name: "Apr 16", deposits: 1300, withdrawals: 900, users: 115, referrals: 126 },
  { name: "Apr 17", deposits: 1800, withdrawals: 1500, users: 140, referrals: 12 },
  { name: "Apr 18", deposits: 1600, withdrawals: 10, users: 135, referrals: 200 },
  { name: "Apr 19", deposits: 2000, withdrawals: 1800, users: 60, referrals: 15 },
  { name: "Apr 20", deposits: 200, withdrawals: 20, users: 180, referrals: 148 },
];

const timeRanges = [
  { value: '1D', label: '1D' },
  { value: '3D', label: '3D' },
  { value: '1W', label: '1W' },
  { value: '1M', label: '1M' },
  { value: '3M', label: '3M' },
  { value: '6M', label: '6M' },
  { value: '1Y', label: '1Y' },
];

const customTooltip = ({ active, payload, label }: any) => {
  if (active && payload && payload.length) {
    return (
      <div className="bg-white p-2 border border-gray-200 rounded shadow-sm text-xs">
        <p className="font-medium text-gray-900 mb-1">{label}</p>
        <p className="text-green-800">
          <span className="inline-block w-2 h-2 rounded-full bg-green-400 mr-1"></span>
          Deposits: ₦{payload[0].value.toLocaleString()}
        </p>
        <p className="text-amber-800">
          <span className="inline-block w-2 h-2 rounded-full bg-amber-400 mr-1"></span>
          Withdrawals: ₦{payload[1].value.toLocaleString()}
        </p>
        <p className="text-blue-800">
          <span className="inline-block w-2 h-2 rounded-full bg-blue-400 mr-1"></span>
          Users: {payload[2].value}
        </p>
        <p className="text-purple-800">
          <span className="inline-block w-2 h-2 rounded-full bg-purple-400 mr-1"></span>
          Referrals: {payload[3].value}
        </p>
      </div>
    );
  }
  return null;
};

interface FinanceChartProps {
  legendItems?: {
    label: string;
    color: string;
    indicator: string;
  }[];
}

const FinanceChart = ({ legendItems }: FinanceChartProps) => {
  const [timeRange, setTimeRange] = useState('1W');
  
  // Find the highest value point for the reference dot
  const peakPoint = data.reduce(
    (max, point) => {
      if (point.deposits > max.value) {
        return { value: point.deposits, name: point.name, dataKey: 'deposits' };
      }
      if (point.withdrawals > max.value) {
        return { value: point.withdrawals, name: point.name, dataKey: 'withdrawals' };
      }
      return max;
    },
    { value: 0, name: '', dataKey: 'deposits' }
  );

  return (
    <Card>
      <CardHeader className="flex flex-row items-center justify-between space-y-0 pb-2">
        <div className="flex gap-2">
          {timeRanges.map((range) => (
            <Button
              key={range.value}
              variant={timeRange === range.value ? "default" : "ghost"}
              size="sm"
              onClick={() => setTimeRange(range.value)}
              className="px-3 py-1 h-8"
            >
              {range.label}
            </Button>
          ))}
        </div>
      </CardHeader>
      <CardContent>
        <div className="h-[280px] mt-4">
          <ResponsiveContainer width="100%" height="100%">
            <LineChart
              data={data}
              margin={{ top: 10, right: 10, left: -20, bottom: 0 }}
            >
              <CartesianGrid strokeDasharray="3 3" stroke="#f1f1f1" vertical={false} />
              <XAxis 
                dataKey="name" 
                axisLine={false}
                tickLine={false}
                tick={{ fontSize: 12, fill: '#98A2B3' }}
              />
              <YAxis 
                axisLine={false}
                tickLine={false}
                tick={{ fontSize: 12, fill: '#98A2B3' }}
                tickFormatter={(value) => value === 0 ? '₦0' : `₦${Math.floor(value / 1000)}K`}
              />
              <YAxis 
                yAxisId="users"
                orientation="right"
                axisLine={false}
                tickLine={false}
                tick={{ fontSize: 12, fill: '#98A2B3' }}
              />
              <Tooltip content={customTooltip} />
              <Line
                type="monotone"
                dataKey="deposits"
                stroke="#4ADE80"
                strokeWidth={2}
                dot={false}
                activeDot={{ r: 6, fill: '#4ADE80', stroke: '#fff', strokeWidth: 2 }}
              />
              <Line
                type="monotone"
                dataKey="withdrawals"
                stroke="#FBB344"
                strokeWidth={2}
                dot={false}
                activeDot={{ r: 6, fill: '#FBB344', stroke: '#fff', strokeWidth: 2 }}
              />
              <Line
                yAxisId="users"
                type="monotone"
                dataKey="users"
                stroke="#60A5FA"
                strokeWidth={2}
                dot={false}
                activeDot={{ r: 6, fill: '#60A5FA', stroke: '#fff', strokeWidth: 2 }}
              />
              <Line
                yAxisId="users"
                type="monotone"
                dataKey="referrals"
                stroke="#A855F7"
                strokeWidth={2}
                dot={false}
                activeDot={{ r: 6, fill: '#A855F7', stroke: '#fff', strokeWidth: 2 }}
              />
              <ReferenceDot
                x={peakPoint.name}
                y={peakPoint.value}
                r={4}
                fill="#fff"
                stroke={peakPoint.dataKey === 'deposits' ? '#4ADE80' : '#FBB344'}
                strokeWidth={2}
                label={{
                  value: `₦${peakPoint.value.toLocaleString()}`,
                  position: 'top',
                  fill: '#333',
                  fontSize: 12
                }}
              />
            </LineChart>
          </ResponsiveContainer>
        </div>
      </CardContent>
    </Card>
  );
};

export default FinanceChart;