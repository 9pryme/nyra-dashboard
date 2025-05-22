"use client";

import { useState, useEffect } from "react";
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
import { Button } from "@/components/ui/button";
import { Badge } from "@/components/ui/badge";
import { Input } from "@/components/ui/input";
import { Search, ChevronLeft, ChevronRight, MoreVertical, Copy, Check } from "lucide-react";
import {
  Select,
  SelectContent,
  SelectItem,
  SelectTrigger,
  SelectValue,
} from "@/components/ui/select";
import TransactionDetailsModal from "./TransactionDetailsModal";
import axios from "axios";
import { format } from "date-fns";
import { Skeleton } from "@/components/ui/skeleton";
import {
  Tooltip,
  TooltipContent,
  TooltipProvider,
  TooltipTrigger,
} from "@/components/ui/tooltip";

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
    data: {
      sender: {
        name: string;
        merchant: string;
        bank_name: string;
        account_no: string;
      }
    }
  };
  wallet: {
    wallet_id: string;
    account_number: string;
    owners_fullname: string;
    bank: string;
  };
}

interface ApiResponse {
  statusCode: number;
  status: string;
  success: boolean;
  error: string;
  message: string;
  data: Transaction[];
}

export default function TransactionList() {
  const [search, setSearch] = useState("");
  const [statusFilter, setStatusFilter] = useState("all");
  const [typeFilter, setTypeFilter] = useState("all");
  const [currentPage, setCurrentPage] = useState(1);
  const [selectedTransaction, setSelectedTransaction] = useState<Transaction | null>(null);
  const [transactions, setTransactions] = useState<Transaction[]>([]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState<string | null>(null);
  const [copiedRef, setCopiedRef] = useState<string | null>(null);
  const itemsPerPage = 10;

  useEffect(() => {
    const fetchTransactions = async () => {
      try {
        const token = localStorage.getItem('token');
        if (!token) {
          throw new Error('No authentication token found');
        }

        const response = await axios.get<ApiResponse>(`${process.env.NEXT_PUBLIC_API_URL}/admin/transactions/list?page_size=10000000000000`, {
          headers: {
            Authorization: `Bearer ${token}`
          }
        });

        if (response.data.success && Array.isArray(response.data.data)) {
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
  }, []);

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

  const filteredTransactions = transactions.filter((transaction) => {
    const matchesSearch = 
      (transaction.transaction_reference?.toLowerCase() || '').includes(search.toLowerCase()) ||
      (transaction.description?.toLowerCase() || '').includes(search.toLowerCase()) ||
      (transaction.wallet?.owners_fullname?.toLowerCase() || '').includes(search.toLowerCase());
    
    const matchesStatus = statusFilter === "all" || transaction.transaction_status.toLowerCase() === statusFilter.toLowerCase();
    const matchesType = typeFilter === "all" || transaction.transaction_type.toLowerCase() === typeFilter.toLowerCase();

    return matchesSearch && matchesStatus && matchesType;
  });

  const totalPages = Math.ceil(filteredTransactions.length / itemsPerPage);
  const startIndex = (currentPage - 1) * itemsPerPage;
  const paginatedTransactions = filteredTransactions.slice(startIndex, startIndex + itemsPerPage);

  const shortenReference = (ref: string) => {
    if (ref.length <= 12) return ref;
    return `${ref.slice(0, 4)}.....${ref.slice(-4)}`;
  };

  const copyToClipboard = (text: string) => {
    navigator.clipboard.writeText(text);
    setCopiedRef(text);
    setTimeout(() => setCopiedRef(null), 2000);
  };

  if (loading) {
    return (
      <div className="bg-card rounded-lg shadow-sm overflow-hidden border border-border/40">
        <div className="p-6">
          <div className="flex flex-col sm:flex-row gap-4 mb-6">
            <Skeleton className="h-10 flex-1" />
            <Skeleton className="h-10 w-[180px]" />
            <Skeleton className="h-10 w-[180px]" />
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
    <>
      <div className="bg-card rounded-lg shadow-sm overflow-hidden border border-border/40">
        <div className="p-6">
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
                <SelectItem value="credit">Credit</SelectItem>
                <SelectItem value="debit">Debit</SelectItem>
              </SelectContent>
            </Select>
          </div>

          <div className="rounded-md border">
            <Table>
              <TableHeader>
                <TableRow>
                  <TableHead>Date</TableHead>
                  <TableHead>User</TableHead>
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
                    <TableCell>{format(new Date(transaction.created_at), 'MMM d, yyyy HH:mm')}</TableCell>
                    <TableCell>{transaction.wallet?.owners_fullname || 'N/A'}</TableCell>
                    <TableCell className="font-mono text-sm">
                      <div className="flex items-center gap-2">
                        <TooltipProvider>
                          <Tooltip>
                            <TooltipTrigger asChild>
                              <span>{shortenReference(transaction.transaction_reference)}</span>
                            </TooltipTrigger>
                            <TooltipContent>
                              <p>{transaction.transaction_reference}</p>
                            </TooltipContent>
                          </Tooltip>
                        </TooltipProvider>
                        <TooltipProvider>
                          <Tooltip>
                            <TooltipTrigger asChild>
                              <Button
                                variant="ghost"
                                size="icon"
                                className="h-6 w-6"
                                onClick={() => copyToClipboard(transaction.transaction_reference)}
                              >
                                {copiedRef === transaction.transaction_reference ? (
                                  <Check className="h-3 w-3 text-green-500" />
                                ) : (
                                  <Copy className="h-3 w-3" />
                                )}
                              </Button>
                            </TooltipTrigger>
                            <TooltipContent>
                              <p>{copiedRef === transaction.transaction_reference ? 'Copied!' : 'Copy reference'}</p>
                            </TooltipContent>
                          </Tooltip>
                        </TooltipProvider>
                      </div>
                    </TableCell>
                    <TableCell>
                      <TooltipProvider>
                        <Tooltip>
                          <TooltipTrigger asChild>
                            <span className="truncate max-w-[200px] block">
                              {transaction.description}
                            </span>
                          </TooltipTrigger>
                          <TooltipContent>
                            <p>{transaction.description}</p>
                          </TooltipContent>
                        </Tooltip>
                      </TooltipProvider>
                    </TableCell>
                    <TableCell className={getTypeColor(transaction.transaction_type)}>
                      ₦{parseFloat(transaction.amount).toLocaleString()}
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

      <TransactionDetailsModal
        isOpen={!!selectedTransaction}
        onClose={() => setSelectedTransaction(null)}
        transaction={selectedTransaction}
        style={{ margin: '40px 20px 40px 40px' }}
      />
    </>
  );
}