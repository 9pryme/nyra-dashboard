"use client";

import { useState, useEffect } from "react";
import axios from "axios";
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
  Dialog,
  DialogContent,
  DialogHeader,
  DialogTitle,
} from "@/components/ui/dialog";
import { Button } from "@/components/ui/button";
import { Badge } from "@/components/ui/badge";
import { Input } from "@/components/ui/input";
import { Search, ChevronLeft, ChevronRight, MoreVertical } from "lucide-react";
import {
  Select,
  SelectContent,
  SelectItem,
  SelectTrigger,
  SelectValue,
} from "@/components/ui/select";
import { format } from "date-fns";

interface Transaction {
  created_at: string;
  updated_at: string;
  transaction_id: string;
  transaction_type: string;
  transaction_category: string;
  transaction_status: string;
  balance_before: string;
  balance_after: string;
  transaction_reference: string;
  transaction_reference_provider: string;
  transaction_id_provider: string;
  description: string;
  amount: string;
  payment_provider: string;
  charge: string;
  provider_charge: string;
  meta: {
    data: Record<string, any>;
  };
  wallet: any;
}

interface ApiResponse {
  statusCode: number;
  status: string;
  success: boolean;
  error: string;
  message: string;
  data: Transaction[];
}

interface UserTransactionsProps {
  userId: string;
}

export default function UserTransactions({ userId }: UserTransactionsProps) {
  const [search, setSearch] = useState("");
  const [statusFilter, setStatusFilter] = useState("all");
  const [typeFilter, setTypeFilter] = useState("all");
  const [currentPage, setCurrentPage] = useState(1);
  const [transactions, setTransactions] = useState<Transaction[]>([]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState<string | null>(null);
  const [selectedTransaction, setSelectedTransaction] = useState<Transaction | null>(null);
  const itemsPerPage = 5;

  useEffect(() => {
    const fetchTransactions = async () => {
      try {
        const token = localStorage.getItem('token');
        if (!token) {
          throw new Error('No authentication token found');
        }

        const response = await axios.get<ApiResponse>(
          `${process.env.NEXT_PUBLIC_API_URL}/admin/transactions/list?page_size=10000000000000&owner=${userId}`,
          {
            headers: {
              Authorization: `Bearer ${token}`
            }
          }
        );

        if (response.data.success) {
          setTransactions(response.data.data);
        } else {
          throw new Error(response.data.message || 'Failed to fetch transactions');
        }
      } catch (err) {
        if (axios.isAxiosError(err)) {
          setError(err.response?.data?.message || 'Failed to fetch transactions');
        } else {
          setError(err instanceof Error ? err.message : 'Failed to fetch transactions');
        }
      } finally {
        setLoading(false);
      }
    };

    fetchTransactions();
  }, [userId]);

  const getStatusColor = (status: string) => {
    switch (status.toLowerCase()) {
      case "successful":
        return "bg-green-100 text-green-800";
      case "failed":
        return "bg-red-100 text-red-800";
      case "pending":
        return "bg-amber-100 text-amber-800";
      default:
        return "bg-gray-100 text-gray-800";
    }
  };

  const getTypeColor = (type: string) => {
    switch (type.toUpperCase()) {
      case "CREDIT":
        return "text-green-600";
      case "DEBIT":
        return "text-red-600";
      default:
        return "text-foreground";
    }
  };

  const formatAmount = (amount: string) => {
    const numAmount = parseFloat(amount);
    return new Intl.NumberFormat('en-NG', {
      style: 'currency',
      currency: 'NGN',
      minimumFractionDigits: 2,
      maximumFractionDigits: 2,
    }).format(Math.abs(numAmount));
  };

  const truncateText = (text: string, maxLength: number = 30) => {
    if (!text) return '';
    return text.length > maxLength ? `${text.substring(0, maxLength)}...` : text;
  };

  // Filter transactions based on search and filters
  const filteredTransactions = transactions.filter((transaction) => {
    const matchesSearch = 
      (transaction.transaction_reference?.toLowerCase() || '').includes(search.toLowerCase()) ||
      (transaction.description?.toLowerCase() || '').includes(search.toLowerCase()) ||
      (transaction.wallet?.owners_fullname?.toLowerCase() || '').includes(search.toLowerCase());
    
    const matchesStatus = statusFilter === "all" || transaction.transaction_status.toLowerCase() === statusFilter.toLowerCase();
    const matchesType = typeFilter === "all" || transaction.transaction_type.toLowerCase() === typeFilter.toLowerCase();

    return matchesSearch && matchesStatus && matchesType;
  });

  // Calculate pagination
  const totalPages = Math.ceil(filteredTransactions.length / itemsPerPage);
  const startIndex = (currentPage - 1) * itemsPerPage;
  const paginatedTransactions = filteredTransactions.slice(startIndex, startIndex + itemsPerPage);

  if (loading) {
    return (
      <div className="bg-card rounded-lg shadow-sm overflow-hidden border border-border/40">
        <div className="p-6">
          <h2 className="text-xl font-semibold mb-6">Transaction History</h2>
          <div className="text-center text-muted-foreground">Loading transactions...</div>
        </div>
      </div>
    );
  }

  if (error) {
    return (
      <div className="bg-card rounded-lg shadow-sm overflow-hidden border border-border/40">
        <div className="p-6">
          <h2 className="text-xl font-semibold mb-6">Transaction History</h2>
          <div className="text-center text-red-500">{error}</div>
        </div>
      </div>
    );
  }

  return (
    <>
      <div className="bg-card rounded-lg shadow-sm overflow-hidden border border-border/40">
        <div className="p-6">
          <h2 className="text-xl font-semibold mb-6">Transaction History</h2>

          {/* Search and Filters */}
          <div className="flex flex-col sm:flex-row gap-4 mb-6">
            <div className="flex-1">
              <div className="relative">
                <Search className="absolute left-2 top-2.5 h-4 w-4 text-muted-foreground" />
                <Input
                  placeholder="Search transactions..."
                  value={search}
                  onChange={(e) => setSearch(e.target.value)}
                  className="pl-8"
                />
              </div>
            </div>
            <Select value={statusFilter} onValueChange={setStatusFilter}>
              <SelectTrigger className="w-[180px]">
                <SelectValue placeholder="Filter by status" />
              </SelectTrigger>
              <SelectContent>
                <SelectItem value="all">All Status</SelectItem>
                <SelectItem value="successful">Successful</SelectItem>
                <SelectItem value="failed">Failed</SelectItem>
                <SelectItem value="pending">Pending</SelectItem>
              </SelectContent>
            </Select>
            <Select value={typeFilter} onValueChange={setTypeFilter}>
              <SelectTrigger className="w-[180px]">
                <SelectValue placeholder="Filter by type" />
              </SelectTrigger>
              <SelectContent>
                <SelectItem value="all">All Types</SelectItem>
                <SelectItem value="debit">Debit</SelectItem>
                <SelectItem value="credit">Credit</SelectItem>
                <SelectItem value="airtime">Airtime</SelectItem>
                <SelectItem value="data">Data</SelectItem>
                <SelectItem value="airtimeToCash">Airtime to Cash</SelectItem>
                <SelectItem value="tv">TV</SelectItem>
                <SelectItem value="betting">Betting</SelectItem>
                <SelectItem value="electricity">Electricity</SelectItem>
                <SelectItem value="other">Other</SelectItem>
              </SelectContent>
            </Select>
          </div>

          <div className="rounded-md border">
            <Table>
              <TableHeader>
                <TableRow>
                  <TableHead>Date</TableHead>
                  <TableHead>Reference</TableHead>
                  <TableHead>Description</TableHead>
                  <TableHead>Amount</TableHead>
                  <TableHead>Status</TableHead>
                  <TableHead className="w-[50px]"></TableHead>
                </TableRow>
              </TableHeader>
              <TableBody>
                {paginatedTransactions.map((transaction) => (
                  <TableRow key={transaction.transaction_id}>
                    <TableCell>
                      {format(new Date(transaction.created_at), 'MMM d, yyyy HH:mm')}
                    </TableCell>
                    <TableCell className="font-mono text-sm">
                      {truncateText(transaction.transaction_reference, 15)}
                    </TableCell>
                    <TableCell>{truncateText(transaction.description)}</TableCell>
                    <TableCell className={getTypeColor(transaction.transaction_type)}>
                      {formatAmount(transaction.amount)}
                    </TableCell>
                    <TableCell>
                      <Badge className={getStatusColor(transaction.transaction_status)}>
                        {transaction.transaction_status}
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
                          <DropdownMenuItem onClick={() => setSelectedTransaction(transaction)}>
                            View details
                          </DropdownMenuItem>
                          <DropdownMenuSeparator />
                          <DropdownMenuItem>Reverse transaction</DropdownMenuItem>
                          <DropdownMenuItem>Generate receipt</DropdownMenuItem>
                        </DropdownMenuContent>
                      </DropdownMenu>
                    </TableCell>
                  </TableRow>
                ))}
              </TableBody>
            </Table>
          </div>

          {/* Pagination */}
          <div className="flex items-center justify-between mt-4">
            <p className="text-sm text-muted-foreground">
              Showing {startIndex + 1} to {Math.min(startIndex + itemsPerPage, filteredTransactions.length)} of {filteredTransactions.length} transactions
            </p>
            <div className="flex items-center gap-2">
              <Button
                variant="outline"
                size="icon"
                onClick={() => setCurrentPage(p => Math.max(1, p - 1))}
                disabled={currentPage === 1}
              >
                <ChevronLeft className="h-4 w-4" />
              </Button>
              <Button
                variant="outline"
                size="icon"
                onClick={() => setCurrentPage(p => Math.min(totalPages, p + 1))}
                disabled={currentPage === totalPages}
              >
                <ChevronRight className="h-4 w-4" />
              </Button>
            </div>
          </div>
        </div>
      </div>

      {/* Transaction Details Modal */}
      <Dialog open={!!selectedTransaction} onOpenChange={() => setSelectedTransaction(null)}>
        <DialogContent className="max-w-2xl">
          <DialogHeader>
            <DialogTitle>Transaction Details</DialogTitle>
          </DialogHeader>
          {selectedTransaction && (
            <div className="grid grid-cols-2 gap-4">
              <div className="space-y-2">
                <p className="text-sm font-medium">Transaction ID</p>
                <p className="text-sm text-muted-foreground">{selectedTransaction.transaction_id}</p>
              </div>
              <div className="space-y-2">
                <p className="text-sm font-medium">Reference</p>
                <p className="text-sm text-muted-foreground">{selectedTransaction.transaction_reference}</p>
              </div>
              <div className="space-y-2">
                <p className="text-sm font-medium">Provider Reference</p>
                <p className="text-sm text-muted-foreground">{selectedTransaction.transaction_reference_provider}</p>
              </div>
              <div className="space-y-2">
                <p className="text-sm font-medium">Provider ID</p>
                <p className="text-sm text-muted-foreground">{selectedTransaction.transaction_id_provider}</p>
              </div>
              <div className="space-y-2">
                <p className="text-sm font-medium">Type</p>
                <p className="text-sm text-muted-foreground">{selectedTransaction.transaction_type}</p>
              </div>
              <div className="space-y-2">
                <p className="text-sm font-medium">Category</p>
                <p className="text-sm text-muted-foreground">{selectedTransaction.transaction_category}</p>
              </div>
              <div className="space-y-2">
                <p className="text-sm font-medium">Status</p>
                <p className="text-sm text-muted-foreground">{selectedTransaction.transaction_status}</p>
              </div>
              <div className="space-y-2">
                <p className="text-sm font-medium">Amount</p>
                <p className="text-sm text-muted-foreground">{formatAmount(selectedTransaction.amount)}</p>
              </div>
              <div className="space-y-2">
                <p className="text-sm font-medium">Balance Before</p>
                <p className="text-sm text-muted-foreground">{formatAmount(selectedTransaction.balance_before)}</p>
              </div>
              <div className="space-y-2">
                <p className="text-sm font-medium">Balance After</p>
                <p className="text-sm text-muted-foreground">{formatAmount(selectedTransaction.balance_after)}</p>
              </div>
              <div className="space-y-2">
                <p className="text-sm font-medium">Charge</p>
                <p className="text-sm text-muted-foreground">{formatAmount(selectedTransaction.charge)}</p>
              </div>
              <div className="space-y-2">
                <p className="text-sm font-medium">Provider Charge</p>
                <p className="text-sm text-muted-foreground">{formatAmount(selectedTransaction.provider_charge)}</p>
              </div>
              <div className="space-y-2">
                <p className="text-sm font-medium">Payment Provider</p>
                <p className="text-sm text-muted-foreground">{selectedTransaction.payment_provider}</p>
              </div>
              <div className="space-y-2">
                <p className="text-sm font-medium">Description</p>
                <p className="text-sm text-muted-foreground">{selectedTransaction.description}</p>
              </div>
              <div className="space-y-2 col-span-2">
                <p className="text-sm font-medium">Meta Data</p>
                <pre className="text-sm text-muted-foreground bg-muted p-2 rounded-md overflow-auto">
                  {JSON.stringify(selectedTransaction.meta?.data || {}, null, 2)}
                </pre>
              </div>
            </div>
          )}
        </DialogContent>
      </Dialog>
    </>
  );
}