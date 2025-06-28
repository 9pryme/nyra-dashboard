"use client";

import { useState, useEffect } from "react";
import axios from "axios";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import {
  Dialog,
  DialogContent,
  DialogDescription,
  DialogFooter,
  DialogHeader,
  DialogTitle,
} from "@/components/ui/dialog";
import {
  Select,
  SelectContent,
  SelectItem,
  SelectTrigger,
  SelectValue,
} from "@/components/ui/select";
import { Alert, AlertDescription, AlertTitle } from "@/components/ui/alert";
import { AlertCircle, CheckCircle2, LockKeyhole } from "lucide-react";
import { Label } from "@/components/ui/label";
import { useToast } from "@/hooks/use-toast";
import { apiCache } from "@/lib/cache";

interface BankAccount {
  provider: string;
  account_id: string;
  isBank: boolean;
  bankCode: string;
}

interface MoveFundsModalProps {
  open: boolean;
  onOpenChange: (open: boolean) => void;
  accounts?: BankAccount[];
}

export default function MoveFundsModal({ open, onOpenChange }: MoveFundsModalProps) {
  const [accounts, setAccounts] = useState<BankAccount[]>([]);
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
    if (open) {
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
    }
  }, [open]);

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
        
        // Reset form and close modal after short delay
        setTimeout(() => {
          setSourceAccount("");
          setDestinationAccount("");
          setDestinationBankCode("");
          setAmount("");
          setPassword("");
          setFormSuccess(null);
          onOpenChange(false);
        }, 2000);
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

  const formatAccountOption = (account: BankAccount) => {
    return `${account.provider} - ${account.account_id}`;
  };

  const resetForm = () => {
    setSourceAccount("");
    setDestinationAccount("");
    setDestinationBankCode("");
    setAmount("");
    setPassword("");
    setFormSuccess(null);
    setFormError(null);
  };

  const handleOpenChange = (newOpen: boolean) => {
    if (!newOpen) {
      resetForm();
    }
    onOpenChange(newOpen);
  };

  return (
    <Dialog open={open} onOpenChange={handleOpenChange}>
      <DialogContent className="sm:max-w-[425px]">
        <DialogHeader>
          <DialogTitle>Move Funds</DialogTitle>
          <DialogDescription>
            Transfer funds between company accounts.
          </DialogDescription>
        </DialogHeader>
        
        <div className="space-y-4">
          {loadingAccounts ? (
            <div className="space-y-4">
              <div className="h-4 bg-gray-200 rounded animate-pulse"></div>
              <div className="h-4 bg-gray-200 rounded animate-pulse"></div>
              <div className="h-4 bg-gray-200 rounded animate-pulse"></div>
            </div>
          ) : (
            <form onSubmit={handleSubmit} className="space-y-4">
              <div className="space-y-2">
                <Label htmlFor="sourceAccount">From Account</Label>
                <Select value={sourceAccount} onValueChange={handleSourceAccountChange}>
                  <SelectTrigger>
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
                  <SelectTrigger>
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
        </div>
        
        <DialogFooter>
          <Button 
            type="submit" 
            disabled={isSubmitting || !sourceAccount || !destinationAccount || !amount || !password}
            onClick={handleSubmit}
          >
            {isSubmitting ? "Processing..." : "Transfer Funds"}
          </Button>
        </DialogFooter>
      </DialogContent>
    </Dialog>
  );
} 