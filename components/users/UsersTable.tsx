"use client";

import { useState, useMemo, useEffect } from "react";
import { useRouter } from "next/navigation";
import Link from "next/link";
import {
  Table,
  TableBody,
  TableCell,
  TableHead,
  TableHeader,
  TableRow,
} from "@/components/ui/table";
import {
  DropdownMenu,
  DropdownMenuContent,
  DropdownMenuItem,
  DropdownMenuSeparator,
  DropdownMenuTrigger,
} from "@/components/ui/dropdown-menu";
import {
  AlertDialog,
  AlertDialogAction,
  AlertDialogCancel,
  AlertDialogContent,
  AlertDialogDescription,
  AlertDialogFooter,
  AlertDialogHeader,
  AlertDialogTitle,
} from "@/components/ui/alert-dialog";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Copy, MoreVertical, Search, ChevronLeft, ChevronRight } from "lucide-react";
import { Badge } from "@/components/ui/badge";
import { cn } from "@/lib/utils";
import {
  Select,
  SelectContent,
  SelectItem,
  SelectTrigger,
  SelectValue,
} from "@/components/ui/select";
import axios from "axios";
import { format } from "date-fns";
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

const ITEMS_PER_PAGE = 10;

interface UsersTableProps {
  loading?: boolean;
}

export default function UsersTable({ loading }: UsersTableProps) {
  const router = useRouter();
  const [searchTerm, setSearchTerm] = useState("");
  const [currentPage, setCurrentPage] = useState(1);
  const [statusFilter, setStatusFilter] = useState<string>("all");
  const [users, setUsers] = useState<User[]>([]);
  const [error, setError] = useState<string | null>(null);
  const [showRestrictDialog, setShowRestrictDialog] = useState(false);
  const [selectedUser, setSelectedUser] = useState<User | null>(null);

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
          setUsers(response.data.data);
        } else {
          throw new Error(response.data.message || 'Failed to fetch users');
        }
      } catch (err) {
        if (axios.isAxiosError(err)) {
          setError(err.response?.data?.message || 'Failed to fetch users');
        } else {
          setError(err instanceof Error ? err.message : 'Failed to fetch users');
        }
      }
    };

    fetchUsers();
  }, []);

  const handleRestrictUser = (user: User) => {
    setSelectedUser(user);
    setShowRestrictDialog(true);
  };

  const onConfirmRestrict = async () => {
    if (!selectedUser) return;

    try {
      const token = localStorage.getItem('token');
      if (!token) {
        throw new Error('No authentication token found');
      }

      const newStatus = selectedUser.active_status === "ACTIVE" ? "INACTIVE" : "ACTIVE";

      const response = await axios.post(
        `${process.env.NEXT_PUBLIC_API_URL}/user-admin/set-active-status`,
        {
          user_id: selectedUser.user_id,
          active_status: newStatus
        },
        {
          headers: {
            Authorization: `Bearer ${token}`
          }
        }
      );

      if (response.data.success) {
        // Update the user in the local state
        setUsers(users.map(user => 
          user.user_id === selectedUser.user_id 
            ? { ...user, active_status: newStatus }
            : user
        ));
      }
    } catch (err) {
      if (axios.isAxiosError(err)) {
        setError(err.response?.data?.message || 'Failed to update user status');
      } else {
        setError(err instanceof Error ? err.message : 'Failed to update user status');
      }
    } finally {
      setShowRestrictDialog(false);
      setSelectedUser(null);
    }
  };

  const filteredUsers = useMemo(() => {
    return users.filter(user => {
      const fullName = `${user.firstname} ${user.lastname}`.toLowerCase();
      const matchesSearch = 
        fullName.includes(searchTerm.toLowerCase()) ||
        user.email.toLowerCase().includes(searchTerm.toLowerCase()) ||
        user.user_id.toLowerCase().includes(searchTerm.toLowerCase());
      
      const matchesStatus = statusFilter === "all" || user.active_status === statusFilter;
      
      return matchesSearch && matchesStatus;
    });
  }, [searchTerm, statusFilter, users]);

  const totalPages = Math.ceil(filteredUsers.length / ITEMS_PER_PAGE);
  
  const paginatedUsers = useMemo(() => {
    const startIndex = (currentPage - 1) * ITEMS_PER_PAGE;
    return filteredUsers.slice(startIndex, startIndex + ITEMS_PER_PAGE);
  }, [currentPage, filteredUsers]);

  const getStatusColor = (status: string) => {
    switch (status) {
      case "ACTIVE":
        return "bg-green-100 text-green-800";
      case "RESTRICTED":
        return "bg-amber-100 text-amber-800";
      case "ARCHIVED":
        return "bg-gray-100 text-gray-800";
      default:
        return "bg-gray-100 text-gray-800";
    }
  };

  const formatUserId = (id: string) => {
    const cleanId = id.replace('USER-', '');
    return `${cleanId.slice(0, 5)}...${cleanId.slice(-4)}`;
  };

  const copyToClipboard = (text: string) => {
    navigator.clipboard.writeText(text);
  };

  if (loading) {
    return (
      <div className="bg-card rounded-lg shadow-sm overflow-hidden border border-border/40">
        <div className="p-6">
          <div className="flex flex-col sm:flex-row justify-between items-start sm:items-center mb-6 gap-4">
            <Skeleton className="h-8 w-32" />
            <div className="flex items-center gap-2 w-full sm:w-auto">
              <Skeleton className="h-9 w-[140px]" />
              <Skeleton className="h-9 w-64" />
            </div>
          </div>

          <div className="rounded-md border">
            <div className="p-4">
              <div className="space-y-4">
                {[...Array(5)].map((_, i) => (
                  <div key={i} className="flex items-center space-x-4">
                    <Skeleton className="h-12 w-full" />
                  </div>
                ))}
              </div>
            </div>
          </div>

          <div className="flex items-center justify-between mt-4">
            <Skeleton className="h-4 w-48" />
            <div className="flex items-center space-x-2">
              <Skeleton className="h-8 w-8" />
              <Skeleton className="h-8 w-8" />
            </div>
          </div>
        </div>
      </div>
    );
  }

  if (error) {
    return (
      <div className="bg-card rounded-lg shadow-sm overflow-hidden border border-border/40 p-6">
        <div className="flex items-center justify-center h-32">
          <p className="text-destructive">{error}</p>
        </div>
      </div>
    );
  }

  return (
    <div className="bg-card rounded-lg shadow-sm overflow-hidden border border-border/40">
      <AlertDialog open={showRestrictDialog} onOpenChange={setShowRestrictDialog}>
        <AlertDialogContent>
          <AlertDialogHeader>
            <AlertDialogTitle>
              {selectedUser?.active_status === "ACTIVE" ? "Restrict User" : "Unrestrict User"}
            </AlertDialogTitle>
            <AlertDialogDescription>
              {selectedUser?.active_status === "ACTIVE" 
                ? `Are you sure you want to restrict ${selectedUser?.firstname} ${selectedUser?.lastname}? They will have limited access to the platform.`
                : `Are you sure you want to unrestrict ${selectedUser?.firstname} ${selectedUser?.lastname}? They will regain full access to the platform.`
              }
            </AlertDialogDescription>
          </AlertDialogHeader>
          <AlertDialogFooter>
            <AlertDialogCancel>Cancel</AlertDialogCancel>
            <AlertDialogAction onClick={onConfirmRestrict}>Confirm</AlertDialogAction>
          </AlertDialogFooter>
        </AlertDialogContent>
      </AlertDialog>

      <div className="p-6">
        <div className="flex flex-col sm:flex-row justify-between items-start sm:items-center mb-6 gap-4">
          <h2 className="text-xl font-semibold">Users</h2>
          <div className="flex items-center gap-2 w-full sm:w-auto">
            <Select value={statusFilter} onValueChange={setStatusFilter}>
              <SelectTrigger className="w-[140px]">
                <SelectValue placeholder="Filter by status" />
              </SelectTrigger>
              <SelectContent>
                <SelectItem value="all">All Status</SelectItem>
                <SelectItem value="ACTIVE">Active</SelectItem>
                <SelectItem value="RESTRICTED">Restricted</SelectItem>
                <SelectItem value="ARCHIVED">Archived</SelectItem>
              </SelectContent>
            </Select>
            <div className="relative flex-1 sm:w-64">
              <Search className="absolute left-2.5 top-2.5 h-4 w-4 text-muted-foreground" />
              <Input
                type="search"
                placeholder="Search users..."
                className="pl-9 h-9"
                value={searchTerm}
                onChange={(e) => setSearchTerm(e.target.value)}
              />
            </div>
          </div>
        </div>

        <div className="rounded-md border">
          <Table>
            <TableHeader>
              <TableRow>
                <TableHead>Name</TableHead>
                <TableHead>Email</TableHead>
                <TableHead>User ID</TableHead>
                <TableHead>Phone</TableHead>
                <TableHead>Date Joined</TableHead>
                <TableHead>Status</TableHead>
                <TableHead className="w-[50px]"></TableHead>
              </TableRow>
            </TableHeader>
            <TableBody>
              {paginatedUsers.map((user) => (
                <TableRow key={user.user_id}>
                  <TableCell className="font-medium">{`${user.firstname} ${user.lastname}`}</TableCell>
                  <TableCell>{user.email}</TableCell>
                  <TableCell>
                    <div className="flex items-center gap-2">
                      <Link 
                        href={`/dashboard/users/${user.user_id}`}
                        className="text-blue-600 hover:text-blue-800 transition-colors"
                      >
                        {formatUserId(user.user_id)}
                      </Link>
                      <Button
                        variant="ghost"
                        size="icon"
                        className="h-6 w-6"
                        onClick={() => copyToClipboard(user.user_id)}
                      >
                        <Copy className="h-3 w-3" />
                      </Button>
                    </div>
                  </TableCell>
                  <TableCell>{user.phone_number}</TableCell>
                  <TableCell>{format(new Date(user.created_at), 'MMM d, yyyy')}</TableCell>
                  <TableCell>
                    <Badge className={getStatusColor(user.active_status)}>
                      {user.active_status}
                    </Badge>
                  </TableCell>
                  <TableCell>
                    <DropdownMenu>
                      <DropdownMenuTrigger asChild>
                        <Button variant="ghost" size="icon" className="h-8 w-8">
                          <MoreVertical className="h-4 w-4" />
                        </Button>
                      </DropdownMenuTrigger>
                      <DropdownMenuContent align="end">
                        <DropdownMenuItem onClick={() => router.push(`/dashboard/users/${user.user_id}`)}>
                          View user
                        </DropdownMenuItem>
                        <DropdownMenuSeparator />
                        <DropdownMenuItem 
                          className={user.active_status === "ACTIVE" ? "text-amber-600" : "text-green-600"}
                          onClick={() => handleRestrictUser(user)}
                        >
                          {user.active_status === "ACTIVE" ? "Restrict user" : "Unrestrict user"}
                        </DropdownMenuItem>
                        <DropdownMenuItem className="text-destructive">
                          Archive user
                        </DropdownMenuItem>
                      </DropdownMenuContent>
                    </DropdownMenu>
                  </TableCell>
                </TableRow>
              ))}
            </TableBody>
          </Table>
        </div>

        <div className="flex items-center justify-between mt-4">
          <p className="text-sm text-muted-foreground">
            Showing {((currentPage - 1) * ITEMS_PER_PAGE) + 1} to {Math.min(currentPage * ITEMS_PER_PAGE, filteredUsers.length)} of {filteredUsers.length} users
          </p>
          <div className="flex items-center space-x-2">
            <Button
              variant="outline"
              size="sm"
              onClick={() => setCurrentPage(page => Math.max(1, page - 1))}
              disabled={currentPage === 1}
            >
              <ChevronLeft className="h-4 w-4" />
            </Button>
            <Button
              variant="outline"
              size="sm"
              onClick={() => setCurrentPage(page => Math.min(totalPages, page + 1))}
              disabled={currentPage === totalPages}
            >
              <ChevronRight className="h-4 w-4" />
            </Button>
          </div>
        </div>
      </div>
    </div>
  );
}