"use client";

import { motion } from "framer-motion";
import { Badge } from "@/components/ui/badge";
import { Button } from "@/components/ui/button";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import {
  Sheet,
  SheetContent,
  SheetDescription,
  SheetHeader,
  SheetTitle,
} from "@/components/ui/sheet";
import { Tabs, TabsContent, TabsList, TabsTrigger } from "@/components/ui/tabs";
import { Separator } from "@/components/ui/separator";
import { 
  Receipt, 
  Copy,
  Check,
  Wallet,
  ArrowUpRight,
  ArrowDownRight,
  CreditCard,
  Building2,
  Clock,
  User
} from "lucide-react";
import { format } from "date-fns";
import { useState } from "react";
import { useToast } from "@/hooks/use-toast";

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
}

export default function TransactionDetailsModal({ isOpen, onClose, transaction }: TransactionDetailsModalProps) {
  const [copiedItems, setCopiedItems] = useState<Set<string>>(new Set());
  const { toast } = useToast();

  const copyToClipboard = (text: string, label: string) => {
    navigator.clipboard.writeText(text);
    toast({
      title: "Copied",
      description: `${label} copied to clipboard`,
    });
    
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
      case "successful":
        return "bg-green-100 text-green-700 dark:bg-green-900/20 dark:text-green-400";
      case "failed":
        return "bg-red-100 text-red-700 dark:bg-red-900/20 dark:text-red-400";
      case "pending":
        return "bg-amber-100 text-amber-700 dark:bg-amber-900/20 dark:text-amber-400";
      default:
        return "bg-gray-100 text-gray-700 dark:bg-gray-800 dark:text-gray-300";
    }
  };

  const getTypeColor = (type: string) => {
    switch (type.toUpperCase()) {
      case "CREDIT":
        return "text-green-600 dark:text-green-400";
      case "DEBIT":
        return "text-red-600 dark:text-red-400";
      default:
        return "text-foreground";
    }
  };

  const formatCurrency = (amount: string) => {
    const numAmount = parseFloat(amount);
    return new Intl.NumberFormat('en-NG', {
      style: 'currency',
      currency: 'NGN',
      minimumFractionDigits: 2,
    }).format(numAmount);
  };

  const getTypeIcon = (type: string) => {
    return type.toUpperCase() === 'CREDIT' ? 
      <ArrowDownRight className="h-4 w-4" /> : 
      <ArrowUpRight className="h-4 w-4" />;
  };

  if (!transaction) return null;

  return (
    <Sheet open={isOpen} onOpenChange={onClose}>
      <SheetContent className="w-[600px] sm:max-w-[600px] overflow-y-auto">
        <SheetHeader className="space-y-3">
          <SheetTitle className="flex items-center gap-2">
            <Receipt className="h-5 w-5" />
            Transaction Details
          </SheetTitle>
          <SheetDescription>
            Complete transaction information and audit trail
          </SheetDescription>
        </SheetHeader>

        <div className="mt-6 space-y-6">
          {/* Transaction Overview */}
          <motion.div
            initial={{ opacity: 0, y: 20 }}
            animate={{ opacity: 1, y: 0 }}
            transition={{ duration: 0.3 }}
          >
            <Card className="border-[#64D600]/20">
              <CardContent className="p-6">
                <div className="flex items-center justify-between mb-4">
                  <div className="flex items-center gap-2">
                    <div className={`p-2 rounded-full ${transaction.transaction_type.toUpperCase() === 'CREDIT' ? 'bg-green-100 dark:bg-green-900/20' : 'bg-red-100 dark:bg-red-900/20'}`}>
                      {getTypeIcon(transaction.transaction_type)}
                    </div>
                    <div>
                      <p className="font-medium text-sm text-muted-foreground">
                        {transaction.transaction_type.toUpperCase()}
                      </p>
                      <p className="text-xs text-muted-foreground">
                        {format(new Date(transaction.created_at), 'MMM dd, yyyy HH:mm')}
                      </p>
                    </div>
                  </div>
                  <Badge variant="secondary" className={`${getStatusColor(transaction.transaction_status)}`}>
                    {transaction.transaction_status}
                  </Badge>
                </div>
                
                <div className="text-center">
                  <p className={`text-3xl font-bold ${getTypeColor(transaction.transaction_type)}`}>
                    {transaction.transaction_type.toUpperCase() === 'CREDIT' ? '+' : '-'}
                    {formatCurrency(transaction.amount)}
                  </p>
                  <p className="text-sm text-muted-foreground mt-1">Transaction Amount</p>
                </div>
              </CardContent>
            </Card>
          </motion.div>

          <Separator />

          {/* Tabs Section */}
          <Tabs defaultValue="details" className="w-full">
            <TabsList className="grid w-full grid-cols-3">
              <TabsTrigger value="details" className="data-[state=active]:bg-[#64D600] data-[state=active]:text-black">
                Details
              </TabsTrigger>
              <TabsTrigger value="wallet" className="data-[state=active]:bg-[#64D600] data-[state=active]:text-black">
                Wallet
              </TabsTrigger>
              <TabsTrigger value="provider" className="data-[state=active]:bg-[#64D600] data-[state=active]:text-black">
                Provider
              </TabsTrigger>
            </TabsList>

            <TabsContent value="details" className="mt-6 space-y-4">
              {/* Transaction Information */}
              <Card>
                <CardHeader>
                  <CardTitle className="text-base flex items-center gap-2">
                    <Receipt className="h-4 w-4" />
                    Transaction Information
                  </CardTitle>
                </CardHeader>
                <CardContent className="space-y-4">
                  <div className="grid grid-cols-1 gap-4">
                    {/* Transaction ID */}
                    <div>
                      <label className="text-xs font-medium text-muted-foreground uppercase tracking-wide">
                        Transaction ID
                      </label>
                      <div className="flex items-center gap-2 mt-2">
                        <code className="flex-1 text-sm bg-muted px-3 py-2 rounded-md font-mono">
                          {transaction.transaction_id}
                        </code>
                        <Button
                          variant="ghost"
                          size="sm"
                          onClick={() => copyToClipboard(transaction.transaction_id, "Transaction ID")}
                          className="h-8 w-8 p-0"
                        >
                          {copiedItems.has(`Transaction ID-${transaction.transaction_id}`) ? (
                            <Check className="h-4 w-4 text-green-600" />
                          ) : (
                            <Copy className="h-4 w-4" />
                          )}
                        </Button>
                      </div>
                    </div>

                    {/* Reference */}
                    <div>
                      <label className="text-xs font-medium text-muted-foreground uppercase tracking-wide">
                        Reference Number
                      </label>
                      <div className="flex items-center gap-2 mt-2">
                        <code className="flex-1 text-sm bg-muted px-3 py-2 rounded-md font-mono">
                          {transaction.transaction_reference}
                        </code>
                        <Button
                          variant="ghost"
                          size="sm"
                          onClick={() => copyToClipboard(transaction.transaction_reference, "Reference")}
                          className="h-8 w-8 p-0"
                        >
                          {copiedItems.has(`Reference-${transaction.transaction_reference}`) ? (
                            <Check className="h-4 w-4 text-green-600" />
                          ) : (
                            <Copy className="h-4 w-4" />
                          )}
                        </Button>
                      </div>
                    </div>

                    {/* Description */}
                    <div>
                      <label className="text-xs font-medium text-muted-foreground uppercase tracking-wide">
                        Description
                      </label>
                      <p className="mt-2 text-sm p-3 bg-muted rounded-md">
                        {transaction.description || 'No description provided'}
                      </p>
                    </div>

                    {/* Category and Charges */}
                    <div className="grid grid-cols-2 gap-4">
                      <div>
                        <label className="text-xs font-medium text-muted-foreground uppercase tracking-wide">
                          Category
                        </label>
                        <p className="mt-2 font-medium">{transaction.transaction_category}</p>
                      </div>
                      <div>
                        <label className="text-xs font-medium text-muted-foreground uppercase tracking-wide">
                          Service Charge
                        </label>
                        <p className="mt-2 font-medium">{formatCurrency(transaction.charge)}</p>
                      </div>
                    </div>

                    {/* Timestamps */}
                    <div className="grid grid-cols-2 gap-4">
                      <div>
                        <label className="text-xs font-medium text-muted-foreground uppercase tracking-wide">
                          Created At
                        </label>
                        <p className="mt-2 text-sm">{format(new Date(transaction.created_at), 'PPpp')}</p>
                      </div>
                      <div>
                        <label className="text-xs font-medium text-muted-foreground uppercase tracking-wide">
                          Updated At
                        </label>
                        <p className="mt-2 text-sm">{format(new Date(transaction.updated_at), 'PPpp')}</p>
                      </div>
                    </div>
                  </div>
                </CardContent>
              </Card>
            </TabsContent>

            <TabsContent value="wallet" className="mt-6 space-y-4">
              {/* Account Holder */}
              <Card>
                <CardHeader>
                  <CardTitle className="text-base flex items-center gap-2">
                    <User className="h-4 w-4" />
                    Account Holder
                  </CardTitle>
                </CardHeader>
                <CardContent>
                  <div className="space-y-4">
                    <div>
                      <label className="text-xs font-medium text-muted-foreground uppercase tracking-wide">
                        Full Name
                      </label>
                      <p className="mt-2 text-lg font-semibold">{transaction.wallet?.owners_fullname || 'N/A'}</p>
                    </div>
                    <div>
                      <label className="text-xs font-medium text-muted-foreground uppercase tracking-wide">
                        Bank
                      </label>
                      <p className="mt-2 font-medium">{transaction.wallet?.bank || 'N/A'}</p>
                    </div>
                  </div>
                </CardContent>
              </Card>

              {/* Account Details */}
              <Card>
                <CardHeader>
                  <CardTitle className="text-base flex items-center gap-2">
                    <Wallet className="h-4 w-4" />
                    Account Details
                  </CardTitle>
                </CardHeader>
                <CardContent className="space-y-4">
                  {/* Account Number */}
                  <div>
                    <label className="text-xs font-medium text-muted-foreground uppercase tracking-wide">
                      Account Number
                    </label>
                    <div className="flex items-center gap-2 mt-2">
                      <code className="flex-1 text-lg bg-muted px-4 py-3 rounded-md font-mono font-bold">
                        {transaction.wallet?.account_number || 'N/A'}
                      </code>
                      {transaction.wallet?.account_number && (
                        <Button
                          variant="ghost"
                          size="sm"
                          onClick={() => copyToClipboard(transaction.wallet.account_number, "Account Number")}
                          className="h-12 w-12 p-0"
                        >
                          {copiedItems.has(`Account Number-${transaction.wallet.account_number}`) ? (
                            <Check className="h-5 w-5 text-green-600" />
                          ) : (
                            <Copy className="h-5 w-5" />
                          )}
                        </Button>
                      )}
                    </div>
                  </div>

                  {/* Wallet ID */}
                  <div>
                    <label className="text-xs font-medium text-muted-foreground uppercase tracking-wide">
                      Wallet ID
                    </label>
                    <div className="flex items-center gap-2 mt-2">
                      <code className="flex-1 text-sm bg-muted px-3 py-2 rounded-md font-mono">
                        {transaction.wallet?.wallet_id || 'N/A'}
                      </code>
                      {transaction.wallet?.wallet_id && (
                        <Button
                          variant="ghost"
                          size="sm"
                          onClick={() => copyToClipboard(transaction.wallet.wallet_id, "Wallet ID")}
                          className="h-8 w-8 p-0"
                        >
                          {copiedItems.has(`Wallet ID-${transaction.wallet.wallet_id}`) ? (
                            <Check className="h-4 w-4 text-green-600" />
                          ) : (
                            <Copy className="h-4 w-4" />
                          )}
                        </Button>
                      )}
                    </div>
                  </div>
                </CardContent>
              </Card>

              {/* Balance Impact */}
              <Card>
                <CardHeader>
                  <CardTitle className="text-base flex items-center gap-2">
                    <CreditCard className="h-4 w-4" />
                    Balance Impact
                  </CardTitle>
                </CardHeader>
                <CardContent>
                  <div className="grid grid-cols-2 gap-4">
                    <div className="text-center p-4 bg-red-50 dark:bg-red-950/20 rounded-lg">
                      <p className="text-xs font-medium text-muted-foreground uppercase tracking-wide mb-2">
                        Balance Before
                      </p>
                      <p className="text-xl font-bold text-gray-700 dark:text-gray-300">
                        {formatCurrency(transaction.balance_before)}
                      </p>
                    </div>
                    <div className="text-center p-4 bg-green-50 dark:bg-green-950/20 rounded-lg">
                      <p className="text-xs font-medium text-muted-foreground uppercase tracking-wide mb-2">
                        Balance After
                      </p>
                      <p className="text-xl font-bold text-green-700 dark:text-green-400">
                        {formatCurrency(transaction.balance_after)}
                      </p>
                    </div>
                  </div>
                </CardContent>
              </Card>
            </TabsContent>

            <TabsContent value="provider" className="mt-6 space-y-4">
              {/* Provider Information */}
              <Card>
                <CardHeader>
                  <CardTitle className="text-base flex items-center gap-2">
                    <Building2 className="h-4 w-4" />
                    Payment Provider
                  </CardTitle>
                </CardHeader>
                <CardContent>
                  <div className="grid grid-cols-2 gap-4">
                    <div>
                      <label className="text-xs font-medium text-muted-foreground uppercase tracking-wide">
                        Provider Name
                      </label>
                      <p className="mt-2 text-lg font-semibold">{transaction.payment_provider}</p>
                    </div>
                    <div>
                      <label className="text-xs font-medium text-muted-foreground uppercase tracking-wide">
                        Provider Charge
                      </label>
                      <p className="mt-2 font-medium">{formatCurrency(transaction.provider_charge)}</p>
                    </div>
                  </div>
                </CardContent>
              </Card>

              {/* Provider References */}
              <Card>
                <CardHeader>
                  <CardTitle className="text-base flex items-center gap-2">
                    <Receipt className="h-4 w-4" />
                    Provider References
                  </CardTitle>
                </CardHeader>
                <CardContent className="space-y-4">
                  {/* Provider Reference */}
                  <div>
                    <label className="text-xs font-medium text-muted-foreground uppercase tracking-wide">
                      Provider Reference
                    </label>
                    <div className="flex items-center gap-2 mt-2">
                      <code className="flex-1 text-sm bg-muted px-3 py-2 rounded-md font-mono">
                        {transaction.transaction_reference_provider || 'N/A'}
                      </code>
                      {transaction.transaction_reference_provider && (
                        <Button
                          variant="ghost"
                          size="sm"
                          onClick={() => copyToClipboard(transaction.transaction_reference_provider, "Provider Reference")}
                          className="h-8 w-8 p-0"
                        >
                          {copiedItems.has(`Provider Reference-${transaction.transaction_reference_provider}`) ? (
                            <Check className="h-4 w-4 text-green-600" />
                          ) : (
                            <Copy className="h-4 w-4" />
                          )}
                        </Button>
                      )}
                    </div>
                  </div>

                  {/* Provider Transaction ID */}
                  <div>
                    <label className="text-xs font-medium text-muted-foreground uppercase tracking-wide">
                      Provider Transaction ID
                    </label>
                    <div className="flex items-center gap-2 mt-2">
                      <code className="flex-1 text-sm bg-muted px-3 py-2 rounded-md font-mono">
                        {transaction.transaction_id_provider || 'N/A'}
                      </code>
                      {transaction.transaction_id_provider && (
                        <Button
                          variant="ghost"
                          size="sm"
                          onClick={() => copyToClipboard(transaction.transaction_id_provider, "Provider Transaction ID")}
                          className="h-8 w-8 p-0"
                        >
                          {copiedItems.has(`Provider Transaction ID-${transaction.transaction_id_provider}`) ? (
                            <Check className="h-4 w-4 text-green-600" />
                          ) : (
                            <Copy className="h-4 w-4" />
                          )}
                        </Button>
                      )}
                    </div>
                  </div>
                </CardContent>
              </Card>

              {/* Sender Information */}
              {transaction.meta?.data?.sender && (
                <Card>
                  <CardHeader>
                    <CardTitle className="text-base flex items-center gap-2">
                      <User className="h-4 w-4" />
                      Sender Information
                    </CardTitle>
                  </CardHeader>
                  <CardContent>
                    <div className="grid grid-cols-2 gap-4">
                      <div>
                        <label className="text-xs font-medium text-muted-foreground uppercase tracking-wide">
                          Sender Name
                        </label>
                        <p className="mt-2 font-medium">{transaction.meta.data.sender.name || 'N/A'}</p>
                      </div>
                      <div>
                        <label className="text-xs font-medium text-muted-foreground uppercase tracking-wide">
                          Merchant
                        </label>
                        <p className="mt-2 font-medium">{transaction.meta.data.sender.merchant || 'N/A'}</p>
                      </div>
                      <div>
                        <label className="text-xs font-medium text-muted-foreground uppercase tracking-wide">
                          Bank Name
                        </label>
                        <p className="mt-2 font-medium">{transaction.meta.data.sender.bank_name || 'N/A'}</p>
                      </div>
                      <div>
                        <label className="text-xs font-medium text-muted-foreground uppercase tracking-wide">
                          Account Number
                        </label>
                        <div className="flex items-center gap-2 mt-2">
                          <code className="flex-1 text-sm bg-muted px-3 py-2 rounded-md font-mono">
                            {transaction.meta.data.sender.account_no || 'N/A'}
                          </code>
                          {transaction.meta.data.sender.account_no && (
                            <Button
                              variant="ghost"
                              size="sm"
                              onClick={() => copyToClipboard(transaction.meta.data.sender.account_no, "Sender Account")}
                              className="h-8 w-8 p-0"
                            >
                              {copiedItems.has(`Sender Account-${transaction.meta.data.sender.account_no}`) ? (
                                <Check className="h-4 w-4 text-green-600" />
                              ) : (
                                <Copy className="h-4 w-4" />
                              )}
                            </Button>
                          )}
                        </div>
                      </div>
                    </div>
                  </CardContent>
                </Card>
              )}
            </TabsContent>
          </Tabs>
        </div>
      </SheetContent>
    </Sheet>
  );
}