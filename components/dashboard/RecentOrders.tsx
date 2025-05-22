"use client";

import { useRouter } from "next/navigation";
import { Clock, Eye, Package, Package2 } from "lucide-react";
import { Button } from "@/components/ui/button";
import { Badge } from "@/components/ui/badge";
import { cn } from "@/lib/utils";

// Sample order data - would come from an API in a real app
const orders = [
  {
    id: "1",
    orderNumber: "#902013457G",
    date: "Today, 4:00 PM",
    destination: "123 Main St, Brooklyn",
    items: 3,
    status: "Pending"
  },
  {
    id: "2",
    orderNumber: "#902013456G",
    date: "Today, 3:30 PM",
    destination: "456 Park Ave, Manhattan",
    items: 5,
    status: "Processing"
  },
  {
    id: "3",
    orderNumber: "#902013455G",
    date: "Today, 2:15 PM",
    destination: "789 Broadway, Queens",
    items: 2,
    status: "Delivered"
  },
  {
    id: "4",
    orderNumber: "#902013454G",
    date: "Today, 11:40 AM",
    destination: "321 Fifth Ave, Bronx",
    items: 4,
    status: "Cancelled"
  },
  {
    id: "5",
    orderNumber: "#902013453G",
    date: "Today, 10:05 AM",
    destination: "555 Ocean Dr, Staten Island",
    items: 1,
    status: "Delivered"
  },
  {
    id: "6",
    orderNumber: "#902013452G",
    date: "Yesterday, 5:30 PM",
    destination: "888 West St, Brooklyn",
    items: 3,
    status: "Delivered"
  },
];

export default function RecentOrders() {
  const router = useRouter();
  
  const getStatusColor = (status: string) => {
    switch (status) {
      case "Delivered":
        return "bg-green-100 text-green-800";
      case "Processing":
        return "bg-blue-100 text-blue-800";
      case "Pending":
        return "bg-amber-100 text-amber-800";
      case "Cancelled":
        return "bg-red-100 text-red-800";
      default:
        return "bg-gray-100 text-gray-800";
    }
  };
  
  const getStatusIcon = (status: string) => {
    switch (status) {
      case "Delivered":
        return <Package2 className="h-3 w-3" />;
      case "Processing":
        return <Package className="h-3 w-3" />;
      case "Pending":
        return <Clock className="h-3 w-3" />;
      default:
        return <Package className="h-3 w-3" />;
    }
  };
  
  return (
    <div className="bg-card rounded-lg shadow-sm overflow-hidden border border-border/40">
      <div className="p-6">
        <div className="flex justify-between items-center mb-6">
          <h2 className="text-xl font-semibold">Recent Orders</h2>
          <Button variant="ghost" size="sm" className="text-primary">
            View all
          </Button>
        </div>
        
        <div className="space-y-4">
          {orders.map((order) => (
            <div key={order.id} className="p-3 hover:bg-muted/50 rounded-lg transition-colors">
              <div className="flex justify-between items-start mb-2">
                <div>
                  <p className="font-medium">{order.orderNumber}</p>
                  <p className="text-sm text-muted-foreground">{order.date}</p>
                </div>
                <Badge className={cn("ml-auto", getStatusColor(order.status))}>
                  <span className="flex items-center gap-1">
                    {getStatusIcon(order.status)}
                    {order.status}
                  </span>
                </Badge>
              </div>
              <p className="text-sm text-muted-foreground mb-3 truncate">
                {order.destination}
              </p>
              <div className="flex justify-between items-center">
                <div className="flex items-center text-sm">
                  <span className="font-medium">{order.items} Items</span>
                </div>
                <Button variant="ghost" size="sm" className="h-8 px-2">
                  <Eye className="h-3.5 w-3.5 mr-1" />
                  Details
                </Button>
              </div>
            </div>
          ))}
        </div>
      </div>
    </div>
  );
}