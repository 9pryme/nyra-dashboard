"use client";

import { useState, useEffect } from "react";
import { Button } from "@/components/ui/button";
import { Badge } from "@/components/ui/badge";
import { Copy, Check, ArrowUpRight, X } from "lucide-react";
import axios from "axios";
import { format } from "date-fns";
import Link from "next/link";
import { TransactionTableSkeleton } from "@/components/ui/skeleton-loader";
import {
  Dialog,
  DialogContent,
  DialogHeader,
  DialogTitle,
} from "@/components/ui/dialog";
import { transactionCache } from "@/lib/cache";

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
  const [transactions, setTransactions] = useState<Transaction[]>([]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState<string | null>(null);
  const [copiedRef, setCopiedRef] = useState<string | null>(null);
  const [selectedTransaction, setSelectedTransaction] = useState<Transaction | null>(null);

    useEffect(() => {
    const fetchTransactions = async () => {
      const token = localStorage.getItem('token');
      if (!token) {
        setError('No authentication token found');
        setLoading(false);
        return;
      }

      try {
        const response = await transactionCache.getOrFetch<ApiResponse>(
          'recent_transactions',
          async () => {
            const axiosResponse = await axios.get<ApiResponse>(`${process.env.NEXT_PUBLIC_API_URL}/admin/transactions/list?page_size=5`, {
              headers: {
                Authorization: `Bearer ${token}`
              }
            });
            return axiosResponse.data;
          }
        );

        if (response.success && Array.isArray(response.data)) {
          // Get only the first 5 most recent transactions
          setTransactions(response.data.slice(0, 5));
          setError(null);
        } else {
          throw new Error(response.message || 'Failed to fetch transactions');
        }
      } catch (err: any) {
        console.error('TransactionList fetch error:', err);
        setError(err.message || 'Failed to fetch transactions');
      } finally {
        setLoading(false);
      }
    };

    fetchTransactions();
  }, []);

  const getStatusColor = (status: string) => {
    switch (status.toLowerCase()) {
      case "successful":
        return "bg-green-100 text-green-700";
      case "failed":
        return "bg-red-100 text-red-700";
      case "pending":
        return "bg-amber-100 text-amber-700";
      default:
        return "bg-gray-100 text-gray-700";
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

  const shortenReference = (ref: string) => {
    if (ref.length <= 16) return ref;
    return `${ref.slice(0, 6)}...${ref.slice(-6)}`;
  };

  const copyToClipboard = async (text: string) => {
    try {
      await navigator.clipboard.writeText(text);
    setCopiedRef(text);
    setTimeout(() => setCopiedRef(null), 2000);
    } catch (err) {
      console.error('Failed to copy text: ', err);
    }
  };

  if (loading) {
    return <TransactionTableSkeleton />;
  }

  if (error) {
    return (
      <div className="bg-card rounded-md shadow-sm border border-border/40">
        <div className="p-4">
          <h3 className="text-base font-semibold mb-2">Recent Transactions</h3>
          <div className="text-red-500 text-sm">{error}</div>
        </div>
      </div>
    );
  }

  return (
    <div className="bg-card rounded-md shadow-sm border border-border/40">
      <div className="p-4">
        <h3 className="text-base font-semibold mb-4">Recent Transactions</h3>
        
        {transactions.length === 0 ? (
          <div className="text-center py-8 text-muted-foreground">
            <p className="text-sm">No transactions found</p>
          </div>
        ) : (
          <div className="space-y-3">
            {transactions.map((transaction) => (
                             <div
                 key={transaction.transaction_id}
                 className="flex items-center justify-between p-2 border rounded-md hover:bg-muted/50 transition-colors cursor-pointer"
                 onClick={() => setSelectedTransaction(transaction)}
               >
                                 {/* Left side - User/Date and Reference/Description */}
                 <div className="flex items-center gap-2 min-w-0 flex-1">
                   {/* User and Date stacked */}
                   <div className="min-w-0 w-24 sm:w-28">
                     <p className="text-xs font-medium text-foreground truncate">
                       {(transaction.wallet?.owners_fullname || 'Unknown User').split(' ')[0]}
                     </p>
                     <p className="text-xs text-muted-foreground">
                       {format(new Date(transaction.created_at), 'MMM dd')}
                     </p>
          </div>

                   {/* Reference and Description stacked */}
                   <div className="min-w-0 flex-1">
                     <div className="flex items-center gap-1">
                       <p className="text-xs text-muted-foreground font-mono truncate max-w-[80px]">
                         {shortenReference(transaction.transaction_reference)}
                       </p>
                              <Button
                                variant="ghost"
                         size="sm"
                         className="h-3 w-3 p-0 hover:bg-muted flex-shrink-0"
                                onClick={() => copyToClipboard(transaction.transaction_reference)}
                              >
                                {copiedRef === transaction.transaction_reference ? (
                           <Check className="h-2.5 w-2.5 text-green-600" />
                                ) : (
                           <Copy className="h-2.5 w-2.5 text-muted-foreground" />
                                )}
                              </Button>
                     </div>
                     <p className="text-xs font-medium text-foreground truncate">
                       {transaction.description.length > 25 ? transaction.description.substring(0, 25) + '...' : transaction.description}
                     </p>
                      </div>
          </div>

                                 {/* Right side - Amount and Status */}
                 <div className="text-right min-w-0">
                   <p className={`text-xs font-semibold ${getTypeColor(transaction.transaction_type)}`}>
                     {transaction.transaction_type.toUpperCase() === 'CREDIT' ? '+' : '-'}
                     ₦{parseFloat(transaction.amount).toLocaleString()}
                   </p>
                   <Badge 
                     className={`text-[10px] px-1.5 py-0.5 ${getStatusColor(transaction.transaction_status)}`}
                     variant="secondary"
                   >
                     {transaction.transaction_status}
                   </Badge>
                 </div>
            </div>
            ))}
          </div>
        )}

        {/* View More Button */}
        <div className="mt-4 text-center">
          <Link href="/dashboard/transactions">
            <Button variant="outline" size="sm">
              View All Transactions
              <ArrowUpRight className="ml-2 h-3 w-3" />
            </Button>
          </Link>
        </div>
      </div>

      {/* Transaction Details Modal */}
      <Dialog open={!!selectedTransaction} onOpenChange={() => setSelectedTransaction(null)}>
        <DialogContent className="max-w-md">
          <DialogHeader>
            <DialogTitle>Transaction Details</DialogTitle>
          </DialogHeader>
          {selectedTransaction && (
            <div className="space-y-4">
              <div className="grid grid-cols-2 gap-4">
                <div>
                  <p className="text-sm font-medium text-muted-foreground">User</p>
                  <p className="text-sm">{selectedTransaction.wallet?.owners_fullname || 'Unknown User'}</p>
                </div>
                <div>
                  <p className="text-sm font-medium text-muted-foreground">Date</p>
                  <p className="text-sm">{format(new Date(selectedTransaction.created_at), 'MMM dd, yyyy HH:mm')}</p>
                </div>
              </div>

              <div>
                <p className="text-sm font-medium text-muted-foreground">Amount</p>
                <p className={`text-lg font-semibold ${getTypeColor(selectedTransaction.transaction_type)}`}>
                  {selectedTransaction.transaction_type.toUpperCase() === 'CREDIT' ? '+' : '-'}
                  ₦{parseFloat(selectedTransaction.amount).toLocaleString()}
                </p>
              </div>

              <div>
                <p className="text-sm font-medium text-muted-foreground">Status</p>
                <Badge className={`${getStatusColor(selectedTransaction.transaction_status)}`} variant="secondary">
                  {selectedTransaction.transaction_status}
                </Badge>
              </div>

              <div>
                <p className="text-sm font-medium text-muted-foreground">Reference</p>
                <div className="flex items-center gap-2">
                  <p className="text-sm font-mono bg-muted p-2 rounded flex-1 break-all">
                    {selectedTransaction.transaction_reference}
                  </p>
                  <Button
                    variant="outline"
                    size="sm"
                    onClick={() => copyToClipboard(selectedTransaction.transaction_reference)}
                  >
                    {copiedRef === selectedTransaction.transaction_reference ? (
                      <Check className="h-3 w-3 text-green-600" />
                    ) : (
                      <Copy className="h-3 w-3" />
                    )}
                  </Button>
                </div>
              </div>

              <div>
                <p className="text-sm font-medium text-muted-foreground">Description</p>
                <p className="text-sm bg-muted p-2 rounded">{selectedTransaction.description}</p>
              </div>

              <div className="grid grid-cols-2 gap-4">
                <div>
                  <p className="text-sm font-medium text-muted-foreground">Type</p>
                  <p className="text-sm">{selectedTransaction.transaction_type}</p>
                </div>
                <div>
                  <p className="text-sm font-medium text-muted-foreground">Provider</p>
                  <p className="text-sm">{selectedTransaction.payment_provider}</p>
                </div>
              </div>

              {selectedTransaction.wallet?.bank && (
                <div>
                  <p className="text-sm font-medium text-muted-foreground">Bank</p>
                  <p className="text-sm">{selectedTransaction.wallet.bank}</p>
                </div>
              )}
            </div>
          )}
        </DialogContent>
      </Dialog>
    </div>
  );
}