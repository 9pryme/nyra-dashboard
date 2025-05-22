"use client";

import {
  Dialog,
  DialogContent,
  DialogHeader,
  DialogTitle,
} from "@/components/ui/dialog";
import { Badge } from "@/components/ui/badge";
import { format } from "date-fns";
import { Tabs, TabsContent, TabsList, TabsTrigger } from "@/components/ui/tabs";

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

interface TransactionDetailsModalProps {
  isOpen: boolean;
  onClose: () => void;
  transaction: Transaction | null;
  style?: React.CSSProperties;
}

export default function TransactionDetailsModal({
  isOpen,
  onClose,
  transaction,
  style,
}: TransactionDetailsModalProps) {
  if (!transaction) return null;

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

  return (
    <Dialog open={isOpen} onOpenChange={onClose}>
      <DialogContent className="max-w-2xl" style={style}>
        <DialogHeader>
          <DialogTitle>Transaction Details</DialogTitle>
        </DialogHeader>

        <div className="flex items-center justify-between mb-6">
          <div className="text-left">
            <p className={`text-3xl font-bold ${getTypeColor(transaction.transaction_type)}`}>
              ₦{parseFloat(transaction.amount).toLocaleString()}
            </p>
            <p className="mt-1 text-sm text-muted-foreground capitalize">
              {transaction.transaction_type.toLowerCase()} Transaction
            </p>
          </div>
          <Badge className={getStatusColor(transaction.transaction_status)}>
            {transaction.transaction_status}
          </Badge>
        </div>

        <Tabs defaultValue="transaction" className="w-full">
          <TabsList className="grid w-full grid-cols-3">
            <TabsTrigger value="transaction">Transaction Info</TabsTrigger>
            <TabsTrigger value="wallet" disabled={!transaction.wallet}>Wallet Info</TabsTrigger>
            <TabsTrigger value="sender" disabled={!transaction.meta?.data?.sender}>Sender Info</TabsTrigger>
          </TabsList>

          <TabsContent value="transaction" className="space-y-6">
            <div className="grid grid-cols-2 gap-6">
              <div className="p-4 bg-muted/30 rounded-lg">
                <h3 className="text-sm font-medium text-muted-foreground mb-2">Balance Before</h3>
                <p className="text-lg font-semibold">₦{parseFloat(transaction.balance_before).toLocaleString()}</p>
              </div>
              <div className="p-4 bg-muted/30 rounded-lg">
                <h3 className="text-sm font-medium text-muted-foreground mb-2">Balance After</h3>
                <p className="text-lg font-semibold">₦{parseFloat(transaction.balance_after).toLocaleString()}</p>
              </div>
            </div>

            <div className="p-4 bg-muted/30 rounded-lg">
              <div className="grid grid-cols-2 gap-6">
                <div className="space-y-4">
                  <div>
                    <h3 className="text-sm font-medium text-muted-foreground">Transaction ID</h3>
                    <p className="mt-1 font-mono text-sm">{transaction.transaction_id}</p>
                  </div>
                  <div>
                    <h3 className="text-sm font-medium text-muted-foreground">Reference</h3>
                    <p className="mt-1 font-mono text-sm">{transaction.transaction_reference}</p>
                  </div>
                  <div>
                    <h3 className="text-sm font-medium text-muted-foreground">Provider Reference</h3>
                    <p className="mt-1 font-mono text-sm">{transaction.transaction_reference_provider}</p>
                  </div>
                </div>
                <div className="space-y-4">
                  <div>
                    <h3 className="text-sm font-medium text-muted-foreground">Date</h3>
                    <p className="mt-1">May 16, 2025 23:26:30</p>
                  </div>
                  <div>
                    <h3 className="text-sm font-medium text-muted-foreground">Category</h3>
                    <p className="mt-1 capitalize">wallet funding</p>
                  </div>
                  <div>
                    <h3 className="text-sm font-medium text-muted-foreground">Payment Provider</h3>
                    <p className="mt-1 capitalize">9psb</p>
                  </div>
                  <div>
                    <h3 className="text-sm font-medium text-muted-foreground">Charges</h3>
                    <div className="mt-1 space-y-1">
                      <p>Platform: ₦0</p>
                      <p>Provider: ₦0</p>
                    </div>
                  </div>
                </div>
              </div>
            </div>

            <div className="p-4 bg-muted/30 rounded-lg">
              <h3 className="text-sm font-medium text-muted-foreground mb-2">Description</h3>
              <p className="text-sm">{transaction.description}</p>
            </div>
          </TabsContent>

          <TabsContent value="wallet">
            {transaction.wallet && (
              <div className="grid grid-cols-2 gap-6 p-4 bg-muted/30 rounded-lg">
                <div>
                  <h4 className="text-sm font-medium text-muted-foreground">Wallet ID</h4>
                  <p className="mt-1 font-mono text-sm">{transaction.wallet.wallet_id}</p>
                </div>
                <div>
                  <h4 className="text-sm font-medium text-muted-foreground">Account Number</h4>
                  <p className="mt-1 font-mono text-sm">{transaction.wallet.account_number}</p>
                </div>
                <div>
                  <h4 className="text-sm font-medium text-muted-foreground">Owner</h4>
                  <p className="mt-1 capitalize">{transaction.wallet.owners_fullname}</p>
                </div>
                <div>
                  <h4 className="text-sm font-medium text-muted-foreground">Bank</h4>
                  <p className="mt-1 capitalize">{transaction.wallet.bank}</p>
                </div>
              </div>
            )}
          </TabsContent>

          <TabsContent value="sender">
            {transaction.meta?.data?.sender && (
              <div className="grid grid-cols-2 gap-6 p-4 bg-muted/30 rounded-lg">
                <div>
                  <h4 className="text-sm font-medium text-muted-foreground">Name</h4>
                  <p className="mt-1 capitalize">{transaction.meta.data.sender.name}</p>
                </div>
                <div>
                  <h4 className="text-sm font-medium text-muted-foreground">Bank</h4>
                  <p className="mt-1 capitalize">{transaction.meta.data.sender.bank_name}</p>
                </div>
                <div>
                  <h4 className="text-sm font-medium text-muted-foreground">Merchant</h4>
                  <p className="mt-1 capitalize">{transaction.meta.data.sender.merchant}</p>
                </div>
                {transaction.meta.data.sender.account_no && (
                  <div>
                    <h4 className="text-sm font-medium text-muted-foreground">Account Number</h4>
                    <p className="mt-1 font-mono text-sm">{transaction.meta.data.sender.account_no}</p>
                  </div>
                )}
              </div>
            )}
          </TabsContent>
        </Tabs>
      </DialogContent>
    </Dialog>
  );
}