"use client";

import { useState, useEffect } from "react";
import axios from "axios";
import { motion } from "framer-motion";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import {
  Card,
  CardContent,
  CardDescription,
  CardFooter,
  CardHeader,
  CardTitle,
} from "@/components/ui/card";
import {
  Table,
  TableBody,
  TableCell,
  TableHead,
  TableHeader,
  TableRow,
} from "@/components/ui/table";
import {
  Select,
  SelectContent,
  SelectItem,
  SelectTrigger,
  SelectValue,
} from "@/components/ui/select";
import { Badge } from "@/components/ui/badge";
import { Alert, AlertDescription, AlertTitle } from "@/components/ui/alert";
import { AlertCircle, CheckCircle2, ArrowRightLeft, LockKeyhole, ReceiptText } from "lucide-react";
import { Label } from "@/components/ui/label";
import { useToast } from "@/hooks/use-toast";
import NyraLoading from "@/components/ui/nyra-loading";
import { apiCache } from "@/lib/cache";

interface Account {
  provider: string;
  account_id: string;
  isBank: boolean;
  bankCode: string;
}

export default function MoveFundsPage() {
  const [accounts, setAccounts] = useState<Account[]>([]);
  const [sourceAccount, setSourceAccount] = useState<string>("");
  const [destinationAccount, setDestinationAccount] = useState<string>("");
  const [destinationBankCode, setDestinationBankCode] = useState<string>("");
  const [amount, setAmount] = useState<string>("");
  const [password, setPassword] = useState<string>("");
  const [isSubmitting, setIsSubmitting] = useState(false);
  const [formSuccess, setFormSuccess] = useState<string | null>(null);
  const [formError, setFormError] = useState<string | null>(null);
  const [loadingAccounts, setLoadingAccounts] = useState(true);
  
  const { toast } = useToast();

  useEffect(() => {
    const fetchAccounts = async () => {
      const token = localStorage.getItem('token');
      if (!token) {
        setFormError('No authentication token found');
        setLoadingAccounts(false);
        return;
      }

      try {
        const response = await apiCache.getOrFetch<any>(
          'global_accounts',
          async () => {
            const axiosResponse = await axios.get(
              `${process.env.NEXT_PUBLIC_API_URL}/global/accounts`, 
              {
                headers: { Authorization: `Bearer ${token}` }
              }
            );
            return axiosResponse.data;
          }
        );
        
        console.log('Accounts API Response:', response);
        
        if (response.success && response.data.accounts) {
          setAccounts(response.data.accounts);
          setFormError(null);
        } else {
          throw new Error(response.message || 'Failed to fetch accounts');
        }
      } catch (err: any) {
        console.error('Move-funds accounts fetch error:', err);
        setFormError(err.message || 'Failed to load accounts');
      } finally {
        setLoadingAccounts(false);
      }
    };

    fetchAccounts();
  }, []);

  const handleSourceAccountChange = (value: string) => {
    setSourceAccount(value);
    
    // Re-evaluate destination bank code if destination is already selected
    if (destinationAccount) {
      const selectedDestAccount = accounts.find(account => account.account_id === destinationAccount);
      const newSourceAccountData = accounts.find(account => account.account_id === value);
      
      if (selectedDestAccount) {
        // Special case: Polaris to Kuda transfer uses bank code 981
        if (newSourceAccountData?.provider.toLowerCase() === 'polaris' && 
            selectedDestAccount.provider.toLowerCase() === 'kuda') {
          console.log('Applying special rule: Polaris to Kuda - using bank code 981');
          setDestinationBankCode('981');
        } else {
          console.log(`Using default bank code: ${selectedDestAccount.bankCode} for ${selectedDestAccount.provider}`);
          setDestinationBankCode(selectedDestAccount.bankCode);
        }
      }
    }
  };

  const handleDestinationAccountChange = (value: string) => {
    const selectedAccount = accounts.find(account => account.account_id === value);
    const sourceAccountData = accounts.find(account => account.account_id === sourceAccount);
    
    if (selectedAccount) {
      setDestinationAccount(value);
      
      // Special case: Polaris to Kuda transfer uses bank code 981
      if (sourceAccountData?.provider.toLowerCase() === 'polaris' && 
          selectedAccount.provider.toLowerCase() === 'kuda') {
        console.log('Applying special rule: Polaris to Kuda - using bank code 981');
        setDestinationBankCode('981');
      } else {
        console.log(`Using default bank code: ${selectedAccount.bankCode} for ${selectedAccount.provider}`);
        setDestinationBankCode(selectedAccount.bankCode);
      }
    }
  };

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    
    // Form validation
    if (!sourceAccount) {
      setFormError("Please select a source account");
      return;
    }
    
    if (!destinationAccount || !destinationBankCode) {
      setFormError("Please select a destination account");
      return;
    }
    
    if (!amount || parseFloat(amount) <= 0) {
      setFormError("Please enter a valid amount");
      return;
    }
    
    if (!password) {
      setFormError("Please enter your password");
      return;
    }

    // Front-end password verification
    if (password !== "I396rN4gEehj5Bu64oCdr9W4T") {
      setFormError("Incorrect password");
      return;
    }
    
    setIsSubmitting(true);
    setFormSuccess(null);
    setFormError(null);
    
    try {
      const token = localStorage.getItem('token');
      if (!token) {
        throw new Error('No authentication token found');
      }
      
      const requestPayload = {
        password: process.env.NEXT_PUBLIC_API_PASSWORD,
        source_account_number: sourceAccount,
        destination_account_number: destinationAccount,
        destination_bank_code: destinationBankCode,
        amount: amount
      };
      
      console.log('Transfer Request Payload:', requestPayload);
      console.log('Transfer Request URL:', `${process.env.NEXT_PUBLIC_API_URL}/admin/transfer`);
      console.log('Source Account Selected:', sourceAccount);
      console.log('Destination Account Selected:', destinationAccount);
      console.log('Destination Bank Code:', destinationBankCode);
      console.log('Amount:', amount, typeof amount);
      console.log('API Password defined:', !!process.env.NEXT_PUBLIC_API_PASSWORD);
      
      const response = await axios.post(
        `${process.env.NEXT_PUBLIC_API_URL}/admin/transfer`,
        requestPayload,
        {
          headers: {
            Authorization: `Bearer ${token}`,
            'Content-Type': 'application/json'
          }
        }
      );
      
      console.log('Transfer API Response:', response.data);
      
      if (response.data.success) {
        setFormSuccess("Funds transferred successfully");
        toast({
          title: "Success",
          description: "Funds have been transferred successfully",
        });
        
        // Reset form
        setSourceAccount("");
        setDestinationAccount("");
        setDestinationBankCode("");
        setAmount("");
        setPassword("");
      } else {
        throw new Error(response.data.message || 'Failed to transfer funds');
      }
    } catch (err) {
      console.log('Transfer API Error:', err);
      if (axios.isAxiosError(err)) {
        console.log('Transfer API Error Response:', err.response?.data);
        setFormError(err.response?.data?.message || 'Failed to transfer funds');
      } else {
        setFormError(err instanceof Error ? err.message : 'An error occurred');
      }
      
      toast({
        title: "Error",
        description: err instanceof Error ? err.message : 'Failed to transfer funds',
        variant: "destructive",
      });
    } finally {
      setIsSubmitting(false);
    }
  };
  
  const formatAccountOption = (account: Account) => {
    return `${account.provider} - ${account.account_id}`;
  };

  return (
    <div className="space-y-6">
      <motion.div
        initial={{ opacity: 0, y: 20 }}
        animate={{ opacity: 1, y: 0 }}
        transition={{ duration: 0.5 }}
        className="mb-4"
      >
        <h1 className="text-xl lg:text-2xl">Move Funds</h1>
        <p className="text-muted-foreground mt-1 text-sm">Transfer funds between accounts and view transaction history.</p>
      </motion.div>
      
      <div className="flex flex-col xl:flex-row gap-3 lg:gap-4 min-w-0">
        {/* Left side - Transfer Form */}
        <motion.div 
          className="w-full xl:w-1/3 min-w-0"
          initial={{ opacity: 0, y: 20 }}
          animate={{ opacity: 1, y: 0 }}
          transition={{ duration: 0.5, delay: 0.2 }}
        >
          <Card>
            <CardHeader>
              <CardTitle>
                Transfer Funds
              </CardTitle>
              <CardDescription>
                Move funds between company accounts.
              </CardDescription>
            </CardHeader>
            <CardContent>
              {loadingAccounts ? (
                <NyraLoading size="sm" className="min-h-[200px]" />
              ) : (
                <form onSubmit={handleSubmit} className="space-y-4">
                  <div className="space-y-2">
                    <Label htmlFor="sourceAccount">From Account</Label>
                    <Select value={sourceAccount} onValueChange={handleSourceAccountChange}>
                      <SelectTrigger id="sourceAccount">
                        <SelectValue placeholder="Select source account" />
                      </SelectTrigger>
                      <SelectContent>
                        {accounts.map((account) => (
                          <SelectItem key={account.account_id} value={account.account_id}>
                            {formatAccountOption(account)}
                          </SelectItem>
                        ))}
                      </SelectContent>
                    </Select>
                  </div>
                  
                  <div className="space-y-2">
                    <Label htmlFor="destinationAccount">To Account</Label>
                    <Select value={destinationAccount} onValueChange={handleDestinationAccountChange}>
                      <SelectTrigger id="destinationAccount">
                        <SelectValue placeholder="Select destination account" />
                      </SelectTrigger>
                      <SelectContent>
                        {accounts.map((account) => (
                          <SelectItem 
                            key={account.account_id} 
                            value={account.account_id}
                            disabled={account.account_id === sourceAccount}
                          >
                            {formatAccountOption(account)}
                          </SelectItem>
                        ))}
                      </SelectContent>
                    </Select>
                  </div>
                  
                  <div className="space-y-2">
                    <Label htmlFor="amount">Amount (NGN)</Label>
                    <Input
                      id="amount"
                      type="number"
                      placeholder="Enter amount to transfer"
                      value={amount}
                      onChange={(e) => setAmount(e.target.value)}
                    />
                  </div>
                  
                  <div className="space-y-2">
                    <Label htmlFor="password" className="flex items-center gap-1">
                      <LockKeyhole className="h-4 w-4" />
                      Password
                    </Label>
                    <Input
                      id="password"
                      type="password"
                      placeholder="Enter your password"
                      value={password}
                      onChange={(e) => setPassword(e.target.value)}
                    />
                  </div>
                  
                  {formError && (
                    <Alert variant="destructive">
                      <AlertCircle className="h-4 w-4" />
                      <AlertTitle>Error</AlertTitle>
                      <AlertDescription>{formError}</AlertDescription>
                    </Alert>
                  )}
                  
                  {formSuccess && (
                    <Alert variant="default" className="bg-green-50 text-green-800 border-green-200">
                      <CheckCircle2 className="h-4 w-4 text-green-600" />
                      <AlertTitle>Success</AlertTitle>
                      <AlertDescription>{formSuccess}</AlertDescription>
                    </Alert>
                  )}
                </form>
              )}
            </CardContent>
            <CardFooter>
              <Button 
                type="submit" 
                className="w-full" 
                disabled={isSubmitting || !sourceAccount || !destinationAccount || !amount || !password}
                onClick={handleSubmit}
              >
                {isSubmitting ? "Processing..." : "Transfer Funds"}
              </Button>
            </CardFooter>
          </Card>
        </motion.div>
        
        {/* Right side - Transaction History */}
        <motion.div 
          className="w-full xl:w-2/3 min-w-0"
          initial={{ opacity: 0, y: 20 }}
          animate={{ opacity: 1, y: 0 }}
          transition={{ duration: 0.5, delay: 0.3 }}
        >
          <Card className="h-full">
            <CardHeader>
              <CardTitle>Transfer History</CardTitle>
              <CardDescription>
                Recent transfers between accounts.
              </CardDescription>
            </CardHeader>
            <CardContent>
              <div className="rounded-md border">
                <Table>
                  <TableHeader>
                    <TableRow>
                      <TableHead>Date</TableHead>
                      <TableHead>From</TableHead>
                      <TableHead>To</TableHead>
                      <TableHead>Amount</TableHead>
                      <TableHead>Status</TableHead>
                    </TableRow>
                  </TableHeader>
                  <TableBody>
                    {/* Empty state - no rows */}
                  </TableBody>
                </Table>
              </div>
              
              <div className="flex flex-col items-center justify-center py-12 text-center">
                <ReceiptText className="h-12 w-12 text-muted-foreground mb-4 opacity-30" />
                <h3 className="text-lg font-medium mb-1">No transfer history</h3>
                <p className="text-sm text-muted-foreground max-w-sm">
                  Transfer history will be available once the logging system is implemented.
                </p>
              </div>
            </CardContent>
          </Card>
        </motion.div>
      </div>
    </div>
  );
} 