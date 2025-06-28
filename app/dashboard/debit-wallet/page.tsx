"use client";

import { useState, useEffect } from "react";
import { motion } from "framer-motion";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Textarea } from "@/components/ui/textarea";
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
import { Badge } from "@/components/ui/badge";
import { Alert, AlertDescription, AlertTitle } from "@/components/ui/alert";
import { AlertCircle, CheckCircle2, ChevronDown, ReceiptText, MinusCircle, Copy, Check, RefreshCw } from "lucide-react";
import { Label } from "@/components/ui/label";
import { useToast } from "@/hooks/use-toast";
import {
  Command,
  CommandEmpty,
  CommandGroup,
  CommandInput,
  CommandItem,
} from "@/components/ui/command";
import {
  Popover,
  PopoverContent,
  PopoverTrigger,
} from "@/components/ui/popover";
import { userService, User, UserBalance } from "@/lib/services/user";
import { apiCache } from "@/lib/cache";

interface DebitTransaction {
  id: string;
  user_id: string;
  user_name: string;
  amount: number;
  description: string;
  status: string;
  created_at: string;
  admin_id?: string;
}

export default function DebitWalletPage() {
  const [users, setUsers] = useState<User[]>([]);
  const [filteredUsers, setFilteredUsers] = useState<User[]>([]);
  const [searchValue, setSearchValue] = useState("");
  const [selectedUser, setSelectedUser] = useState<User | null>(null);
  const [userBalance, setUserBalance] = useState<UserBalance | null>(null);
  const [amount, setAmount] = useState("");
  const [description, setDescription] = useState("Wallet debit");
  const [isSubmitting, setIsSubmitting] = useState(false);
  const [formSuccess, setFormSuccess] = useState<string | null>(null);
  const [formError, setFormError] = useState<string | null>(null);
  const [loadingUsers, setLoadingUsers] = useState(true);
  const [loadingHistory, setLoadingHistory] = useState(true);
  const [loadingBalance, setLoadingBalance] = useState(false);
  const [open, setOpen] = useState(false);
  const [debitHistory, setDebitHistory] = useState<DebitTransaction[]>([]);
  const [copiedUserId, setCopiedUserId] = useState<string | null>(null);
  
  const { toast } = useToast();

  const fetchUsers = async () => {
    try {
      setLoadingUsers(true);
      const usersList = await userService.getAllUsers();
      setUsers(usersList);
      setFilteredUsers(usersList);
    } catch (err) {
      setFormError(err instanceof Error ? err.message : 'Failed to load users');
    } finally {
      setLoadingUsers(false);
    }
  };

  const fetchUserBalance = async (userId: string) => {
    try {
      setLoadingBalance(true);
      const balance = await userService.getUserBalance(userId);
      setUserBalance(balance);
    } catch (err) {
      console.error('Failed to fetch user balance:', err);
      setUserBalance(null);
    } finally {
      setLoadingBalance(false);
    }
  };

  const fetchDebitHistory = async () => {
    try {
      const token = localStorage.getItem('token');
      if (!token) return;

      // Simple caching with fallback
      let response;
      try {
        response = await apiCache?.getOrFetch(
          'wallet-debit-history',
          async () => {
            const res = await fetch(
              `${process.env.NEXT_PUBLIC_API_URL}/admin/wallet/debits/history?limit=50`,
              {
                headers: { Authorization: `Bearer ${token}` }
              }
            );
            return res.json();
          },
          2 * 60 * 1000 // 2 minutes
        );
      } catch (cacheError) {
        // Fallback to direct API call if cache fails
        console.warn('Cache failed, using direct API call:', cacheError);
        const res = await fetch(
          `${process.env.NEXT_PUBLIC_API_URL}/admin/wallet/debits/history?limit=50`,
          {
            headers: { Authorization: `Bearer ${token}` }
          }
        );
        response = await res.json();
      }

      if (response?.success) {
        setDebitHistory(response.data || []);
      }
    } catch (err) {
      console.error('Failed to fetch debit history:', err);
    } finally {
      setLoadingHistory(false);
    }
  };

  useEffect(() => {
    fetchUsers();
    fetchDebitHistory();
  }, []);

  useEffect(() => {
    if (selectedUser) {
      fetchUserBalance(selectedUser.user_id);
    } else {
      setUserBalance(null);
    }
  }, [selectedUser]);

  // Filter users based on search input
  useEffect(() => {
    if (!searchValue.trim()) {
      setFilteredUsers(users);
      return;
    }
    
    const query = searchValue.toLowerCase();
    const filtered = users.filter(user => 
      (user.firstname?.toLowerCase() || '').includes(query) ||
      (user.lastname?.toLowerCase() || '').includes(query) ||
      (user.email?.toLowerCase() || '').includes(query) ||
      (user.phone_number || '').includes(query) ||
      (user.user_id?.toLowerCase() || '').includes(query)
    );
    
    setFilteredUsers(filtered);
  }, [searchValue, users]);

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    
    if (!selectedUser) {
      setFormError("Please select a user");
      return;
    }
    
    const amountNum = parseFloat(amount);
    if (!amount || amountNum <= 0) {
      setFormError("Please enter a valid amount greater than 0");
      return;
    }

    // Check if user has sufficient balance
    if (userBalance && amountNum > userBalance.balance) {
      setFormError(`Insufficient balance. Available: ₦${userBalance.balance.toLocaleString()}`);
      return;
    }

    if (amountNum > 1000000) {
      setFormError("Amount cannot exceed ₦1,000,000");
      return;
    }
    
    setIsSubmitting(true);
    setFormSuccess(null);
    setFormError(null);
    
    try {
      await userService.debitUserWallet(selectedUser.user_id, amountNum, description || "Wallet debit");
      
      setFormSuccess(`Successfully debited ₦${amountNum.toLocaleString()} from ${userService.getUserDisplayName(selectedUser)}'s wallet`);
      toast({
        title: "Success",
        description: `Wallet debited with ₦${amountNum.toLocaleString()}`,
      });
      
      // Reset form
      setSelectedUser(null);
      setUserBalance(null);
      setAmount("");
      setDescription("Wallet debit");
      
      // Refresh history
      fetchDebitHistory();
    } catch (err) {
      const errorMessage = err instanceof Error ? err.message : 'Failed to debit wallet';
      setFormError(errorMessage);
      
      toast({
        title: "Error",
        description: errorMessage,
        variant: "destructive",
      });
    } finally {
      setIsSubmitting(false);
    }
  };

  const handleRefreshHistory = async () => {
    setLoadingHistory(true);
    try {
      apiCache?.invalidate('wallet-debit-history');
    } catch (cacheError) {
      console.warn('Cache invalidation failed:', cacheError);
    }
    await fetchDebitHistory();
  };

  const copyUserId = (userId: string) => {
    navigator.clipboard.writeText(userId);
    setCopiedUserId(userId);
    setTimeout(() => setCopiedUserId(null), 2000);
  };
  
  const formatCurrency = (amount: string | number) => {
    return new Intl.NumberFormat('en-NG', {
      style: 'currency',
      currency: 'NGN',
      minimumFractionDigits: 2
    }).format(typeof amount === 'string' ? parseFloat(amount) : amount);
  };

  const formatDate = (dateString: string) => {
    return new Date(dateString).toLocaleDateString('en-US', {
      year: 'numeric',
      month: 'short',
      day: 'numeric',
      hour: '2-digit',
      minute: '2-digit'
    });
  };

  const getStatusBadge = (status: string) => {
    switch (status.toLowerCase()) {
      case 'success':
      case 'completed':
        return <Badge variant="secondary" className="bg-green-100 text-green-800">Success</Badge>;
      case 'failed':
        return <Badge variant="destructive">Failed</Badge>;
      case 'pending':
        return <Badge variant="outline">Pending</Badge>;
      default:
        return <Badge variant="outline">{status}</Badge>;
    }
  };

  return (
    <div className="p-6 space-y-6">
      <motion.div
        initial={{ opacity: 0, y: 20 }}
        animate={{ opacity: 1, y: 0 }}
        transition={{ duration: 0.5 }}
      >
        <h1 className="text-2xl font-bold tracking-[-0.02em]">Debit Wallet</h1>
        <p className="text-muted-foreground">Debit funds from a user's wallet and view transaction history.</p>
      </motion.div>
      
      <div className="flex flex-col lg:flex-row gap-6">
        {/* Left side - Debit Form */}
        <motion.div 
          className="w-full lg:w-1/3"
          initial={{ opacity: 0, y: 20 }}
          animate={{ opacity: 1, y: 0 }}
          transition={{ duration: 0.5, delay: 0.2 }}
        >
          <Card>
            <CardHeader>
              <CardTitle className="flex items-center gap-2">
                <MinusCircle className="h-5 w-5" />
                Debit User Wallet
              </CardTitle>
              <CardDescription>
                Enter user details and amount to debit from their wallet.
              </CardDescription>
            </CardHeader>
            <CardContent>
              <form onSubmit={handleSubmit} className="space-y-4">
                <div className="space-y-2">
                  <Label htmlFor="user">Select User</Label>
                  <Popover open={open} onOpenChange={setOpen}>
                    <PopoverTrigger asChild>
                      <Button
                        variant="outline"
                        role="combobox"
                        aria-expanded={open}
                        className="w-full justify-between"
                      >
                        {selectedUser ? userService.getUserDisplayName(selectedUser) : "Select user..."}
                        <ChevronDown className="ml-2 h-4 w-4 shrink-0 opacity-50" />
                      </Button>
                    </PopoverTrigger>
                    <PopoverContent className="w-[350px] p-0">
                      <Command>
                        <CommandInput 
                          placeholder="Search users..." 
                          value={searchValue}
                          onValueChange={setSearchValue}
                        />
                        <CommandEmpty>
                          {loadingUsers ? "Loading users..." : "No user found."}
                        </CommandEmpty>
                        <CommandGroup className="max-h-[250px] overflow-y-auto">
                          {loadingUsers ? (
                            <div className="p-2 text-center text-sm text-muted-foreground">
                              Loading users...
                            </div>
                          ) : (
                            filteredUsers.map((user) => (
                              <CommandItem
                                key={user.user_id}
                                onSelect={() => {
                                  setSelectedUser(user);
                                  setOpen(false);
                                }}
                                className="flex flex-col items-start py-2"
                              >
                                <div className="font-medium">
                                  {userService.getUserDisplayName(user)}
                                </div>
                                <div className="text-xs text-muted-foreground">
                                  {user.email || 'No email'} • {user.phone_number || 'No phone'}
                                </div>
                                <div className="text-xs text-muted-foreground">
                                  ID: {user.user_id}
                                </div>
                              </CommandItem>
                            ))
                          )}
                        </CommandGroup>
                      </Command>
                    </PopoverContent>
                  </Popover>
                </div>
                
                {selectedUser && (
                  <div className="p-3 border rounded-md bg-muted/50">
                    <div className="font-medium">
                      {userService.getUserDisplayName(selectedUser)}
                    </div>
                    <div className="text-sm text-muted-foreground">
                      {selectedUser.email} • {selectedUser.phone_number}
                    </div>
                    <div className="flex items-center gap-2 text-sm text-muted-foreground mt-1">
                      <span>ID: {selectedUser.user_id}</span>
                      <Button
                        variant="ghost"
                        size="sm"
                        className="h-4 w-4 p-0"
                        onClick={() => copyUserId(selectedUser.user_id)}
                      >
                        {copiedUserId === selectedUser.user_id ? (
                          <Check className="h-3 w-3 text-green-600" />
                        ) : (
                          <Copy className="h-3 w-3" />
                        )}
                      </Button>
                    </div>
                    {loadingBalance ? (
                      <div className="text-sm mt-1 text-muted-foreground">Loading balance...</div>
                    ) : userBalance ? (
                      <div className="text-sm mt-1 font-medium">
                        Available Balance: {formatCurrency(userBalance.balance)}
                      </div>
                    ) : (
                      <div className="text-sm mt-1 text-muted-foreground">Balance: Not available</div>
                    )}
                  </div>
                )}
                
                <div className="space-y-2">
                  <Label htmlFor="amount">Amount (NGN)</Label>
                  <Input
                    id="amount"
                    type="number"
                    placeholder="Enter amount to debit"
                    value={amount}
                    onChange={(e) => setAmount(e.target.value)}
                    min="1"
                    max={userBalance ? userBalance.balance.toString() : "1000000"}
                    step="0.01"
                  />
                  <div className="flex justify-between text-xs text-muted-foreground">
                    <span>Maximum amount: ₦1,000,000</span>
                    {userBalance && (
                      <span>Available: ₦{userBalance.balance.toLocaleString()}</span>
                    )}
                  </div>
                </div>
                
                <div className="space-y-2">
                  <Label htmlFor="description">Description</Label>
                  <Textarea
                    id="description"
                    placeholder="Reason for debit"
                    value={description}
                    onChange={(e) => setDescription(e.target.value)}
                    maxLength={200}
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
                  <Alert variant="default" className="bg-green-50 text-green-800 border-green-200 dark:bg-green-900/20 dark:text-green-400 dark:border-green-800">
                    <CheckCircle2 className="h-4 w-4 text-green-600 dark:text-green-400" />
                    <AlertTitle>Success</AlertTitle>
                    <AlertDescription>{formSuccess}</AlertDescription>
                  </Alert>
                )}
              </form>
            </CardContent>
            <CardFooter>
              <Button 
                type="submit" 
                className="w-full" 
                disabled={isSubmitting || !selectedUser || !amount}
                onClick={handleSubmit}
              >
                {isSubmitting ? "Processing..." : "Debit Wallet"}
              </Button>
            </CardFooter>
          </Card>
        </motion.div>
        
        {/* Right side - Transaction History */}
        <motion.div 
          className="w-full lg:w-2/3"
          initial={{ opacity: 0, y: 20 }}
          animate={{ opacity: 1, y: 0 }}
          transition={{ duration: 0.5, delay: 0.3 }}
        >
          <Card className="h-full">
            <CardHeader>
              <div className="flex items-center justify-between">
                <div>
                  <CardTitle>Debit Transaction History</CardTitle>
                  <CardDescription>
                    Recent wallet debits performed by administrators.
                  </CardDescription>
                </div>
                <Button
                  variant="outline"
                  size="sm"
                  onClick={handleRefreshHistory}
                  disabled={loadingHistory}
                >
                  <RefreshCw className={`h-4 w-4 ${loadingHistory ? 'animate-spin' : ''}`} />
                </Button>
              </div>
            </CardHeader>
            <CardContent>
              {loadingHistory ? (
                <div className="flex items-center justify-center py-12">
                  <div className="text-center">
                    <RefreshCw className="h-8 w-8 animate-spin mx-auto mb-4 text-muted-foreground" />
                    <p className="text-sm text-muted-foreground">Loading transaction history...</p>
                  </div>
                </div>
              ) : debitHistory.length > 0 ? (
                <div className="rounded-md border">
                  <Table>
                    <TableHeader>
                      <TableRow>
                        <TableHead>Date</TableHead>
                        <TableHead>User</TableHead>
                        <TableHead>Amount</TableHead>
                        <TableHead>Description</TableHead>
                        <TableHead>Status</TableHead>
                      </TableRow>
                    </TableHeader>
                    <TableBody>
                      {debitHistory.map((transaction) => (
                        <TableRow key={transaction.id}>
                          <TableCell className="text-sm">
                            {formatDate(transaction.created_at)}
                          </TableCell>
                          <TableCell>
                            <div className="font-medium">{transaction.user_name}</div>
                            <div className="text-xs text-muted-foreground">
                              {transaction.user_id}
                            </div>
                          </TableCell>
                          <TableCell className="font-medium text-red-600">
                            -{formatCurrency(transaction.amount)}
                          </TableCell>
                          <TableCell className="max-w-[200px] truncate">
                            {transaction.description}
                          </TableCell>
                          <TableCell>
                            {getStatusBadge(transaction.status)}
                          </TableCell>
                        </TableRow>
                      ))}
                    </TableBody>
                  </Table>
                </div>
              ) : (
                <div className="flex flex-col items-center justify-center py-12 text-center">
                  <ReceiptText className="h-12 w-12 text-muted-foreground mb-4 opacity-30" />
                  <h3 className="text-lg font-medium mb-1">No transaction history</h3>
                  <p className="text-sm text-muted-foreground max-w-sm">
                    Debit transactions will appear here once you start debiting user wallets.
                  </p>
                </div>
              )}
            </CardContent>
          </Card>
        </motion.div>
      </div>
    </div>
  );
} 