"use client";

import { Button } from "@/components/ui/button";
import { Badge } from "@/components/ui/badge";
import { Copy } from "lucide-react";

interface UserProfileProps {
  userId: string;
  userData: {
    firstName: string;
    lastName: string;
    email: string;
    phone: string;
    dateJoined: string;
    status: string;
  };
}

export default function UserProfile({ userId, userData }: UserProfileProps) {
  const copyToClipboard = (text: string) => {
    navigator.clipboard.writeText(text);
  };

  const getStatusColor = (status: string) => {
    switch (status) {
      case "Active":
        return "bg-green-100 text-green-800";
      case "Restricted":
        return "bg-amber-100 text-amber-800";
      case "Archived":
        return "bg-gray-100 text-gray-800";
      default:
        return "bg-gray-100 text-gray-800";
    }
  };

  return (
    <div className="w-full bg-card rounded-lg p-6 border border-border/40">
      <div className="bg-gray-50 rounded-lg p-4 mb-6">
        <div className="flex items-center gap-4">
          <div className="w-16 h-16 rounded-full bg-primary/10 flex items-center justify-center">
            <span className="text-2xl font-semibold">{userData.firstName[0]}</span>
          </div>
          <div className="flex-1">
            <div className="flex items-center justify-between">
              <h1 className="text-2xl font-bold tracking-[-0.02em]">
                {userData.firstName} {userData.lastName}
              </h1>
              <Badge className={getStatusColor(userData.status)}>
                {userData.status}
              </Badge>
            </div>
          </div>
        </div>
      </div>

      <div className="space-y-4 divide-y divide-gray-200">
        <div className="pb-4">
          <p className="text-sm text-muted-foreground">User ID</p>
          <div className="flex items-center gap-2">
            <p className="font-medium">{userId}</p>
            <Button
              variant="ghost"
              size="icon"
              className="h-6 w-6"
              onClick={() => copyToClipboard(userId)}
            >
              <Copy className="h-3 w-3" />
            </Button>
          </div>
        </div>
        <div className="py-4">
          <p className="text-sm text-muted-foreground">Email</p>
          <p className="font-medium">{userData.email}</p>
        </div>
        <div className="py-4">
          <p className="text-sm text-muted-foreground">Phone Number</p>
          <p className="font-medium">{userData.phone}</p>
        </div>
        <div className="pt-4">
          <p className="text-sm text-muted-foreground">Date Joined</p>
          <p className="font-medium">{userData.dateJoined}</p>
        </div>
      </div>

      <div className="grid grid-cols-2 gap-3 mt-6">
        <Button variant="outline">Edit User</Button>
        <Button variant="outline">Reset Password</Button>
      </div>
    </div>
  );
}