"use client";

import { useState } from "react";
import { Button } from "@/components/ui/button";
import { Badge } from "@/components/ui/badge";
import { Copy, Check, Loader2 } from "lucide-react";
import ResetPasswordModal from "./ResetPasswordModal";
import axios from "axios";
import { Alert, AlertDescription } from "@/components/ui/alert";

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
  onStatusUpdate?: (newStatus: string) => void;
}

export default function UserProfile({ userId, userData, onStatusUpdate }: UserProfileProps) {
  const [copiedItems, setCopiedItems] = useState<Set<string>>(new Set());
  const [resetPasswordModalOpen, setResetPasswordModalOpen] = useState(false);
  const [currentStatus, setCurrentStatus] = useState(userData.status);
  const [statusLoading, setStatusLoading] = useState(false);
  const [statusError, setStatusError] = useState<string | null>(null);

  const copyToClipboard = (text: string, label: string) => {
    navigator.clipboard.writeText(text);
    
    const itemKey = `${label}-${text}`;
    setCopiedItems(prev => new Set(prev).add(itemKey));
    
    // Revert back to copy icon after 2 seconds
    setTimeout(() => {
      setCopiedItems(prev => {
        const newSet = new Set(prev);
        newSet.delete(itemKey);
        return newSet;
      });
    }, 2000);
  };

  const getStatusColor = (status: string) => {
    switch (status.toLowerCase()) {
      case "active":
        return "bg-green-100 text-green-800 dark:bg-green-900 dark:text-green-200";
      case "inactive":
        return "bg-red-100 text-red-800 dark:bg-red-900 dark:text-red-200";
      case "restricted":
        return "bg-amber-100 text-amber-800 dark:bg-amber-900 dark:text-amber-200";
      case "archived":
        return "bg-gray-100 text-gray-800 dark:bg-gray-800 dark:text-gray-200";
      default:
        return "bg-gray-100 text-gray-800 dark:bg-gray-800 dark:text-gray-200";
    }
  };

  const truncateUserId = (id: string) => {
    if (id.length <= 12) return id;
    return `${id.slice(0, 6)}.....${id.slice(-6)}`;
  };

  const handleStatusToggle = async () => {
    const newStatus = currentStatus.toLowerCase() === 'active' ? 'INACTIVE' : 'ACTIVE';
    
    setStatusLoading(true);
    setStatusError(null);

    try {
      const token = localStorage.getItem('token');
      if (!token) {
        throw new Error('No authentication token found');
      }

      const response = await axios.post(
        `${process.env.NEXT_PUBLIC_API_URL}/user-admin/set-active-status`,
        {
          user_id: userId,
          active_status: newStatus
        },
        {
          headers: {
            Authorization: `Bearer ${token}`,
            'Content-Type': 'application/json'
          }
        }
      );

      if (response.data.success) {
        setCurrentStatus(response.data.data.active_status);
        if (onStatusUpdate) {
          onStatusUpdate(response.data.data.active_status);
        }
      } else {
        throw new Error(response.data.message || 'Failed to update status');
      }

    } catch (err: any) {
      console.error('Status toggle error:', err);
      setStatusError(err.response?.data?.message || 'Failed to update user status');
    } finally {
      setStatusLoading(false);
    }
  };

  const userIdCopied = copiedItems.has(`User ID-${userId}`);

  return (
    <div className="w-full bg-card rounded-lg p-6 border border-border/40">
      <div className="bg-muted/30 dark:bg-muted/20 rounded-lg p-4 mb-6 border border-border/20">
        <div className="flex items-center gap-4">
          <div className="w-16 h-16 rounded-full bg-primary/10 dark:bg-primary/20 flex items-center justify-center border border-border/30">
            <span className="text-2xl font-semibold text-foreground">{userData.firstName[0]}</span>
          </div>
          <div className="flex-1 min-w-0">
            <h1 className="text-2xl font-bold tracking-[-0.02em] text-foreground truncate">
              {userData.firstName} {userData.lastName}
            </h1>
            <div className="mt-2">
              <Badge className={getStatusColor(currentStatus)}>
                {currentStatus}
              </Badge>
            </div>
          </div>
        </div>
      </div>

      <div className="space-y-4 divide-y divide-border/40">
        <div className="pb-4">
          <p className="text-sm text-muted-foreground">User ID</p>
          <div className="flex items-center gap-2">
            <p className="font-medium text-foreground truncate">{truncateUserId(userId)}</p>
            <Button
              variant="ghost"
              size="icon"
              className={`h-6 w-6 hover:bg-muted transition-colors ${
                userIdCopied 
                  ? 'bg-green-50 border-green-200 hover:bg-green-100 dark:bg-green-950 dark:border-green-800' 
                  : ''
              }`}
              onClick={() => copyToClipboard(userId, 'User ID')}
            >
              {userIdCopied ? (
                <Check className="h-3 w-3 text-green-600 dark:text-green-400" />
              ) : (
                <Copy className="h-3 w-3 text-muted-foreground" />
              )}
            </Button>
          </div>
        </div>
        <div className="py-4">
          <p className="text-sm text-muted-foreground">Email</p>
          <p className="font-medium text-foreground">{userData.email}</p>
        </div>
        <div className="py-4">
          <p className="text-sm text-muted-foreground">Phone Number</p>
          <p className="font-medium text-foreground">{userData.phone}</p>
        </div>
        <div className="pt-4">
          <p className="text-sm text-muted-foreground">Date Joined</p>
          <p className="font-medium text-foreground">{userData.dateJoined}</p>
        </div>
      </div>

      {statusError && (
        <Alert variant="destructive" className="mt-4">
          <AlertDescription>{statusError}</AlertDescription>
        </Alert>
      )}

      <div className="grid grid-cols-2 gap-3 mt-6">
        <Button 
          variant="outline"
          onClick={handleStatusToggle}
          disabled={statusLoading}
          className={currentStatus.toLowerCase() === 'active' 
            ? 'border-red-200 text-red-700 hover:bg-red-50 dark:border-red-800 dark:text-red-400 dark:hover:bg-red-950' 
            : 'border-green-200 text-green-700 hover:bg-green-50 dark:border-green-800 dark:text-green-400 dark:hover:bg-green-950'
          }
        >
          {statusLoading ? (
            <Loader2 className="mr-2 h-4 w-4 animate-spin" />
          ) : null}
          {currentStatus.toLowerCase() === 'active' ? 'Deactivate Account' : 'Activate Account'}
        </Button>
        <Button 
          variant="outline"
          onClick={() => setResetPasswordModalOpen(true)}
        >
          Reset Password
        </Button>
      </div>

      <ResetPasswordModal
        isOpen={resetPasswordModalOpen}
        onClose={() => setResetPasswordModalOpen(false)}
        userId={userId}
        userName={`${userData.firstName} ${userData.lastName}`}
      />
    </div>
  );
}