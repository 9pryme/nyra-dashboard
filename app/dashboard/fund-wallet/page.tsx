"use client";

import { useState, useEffect } from "react";
import axios from "axios";
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
import { AlertCircle, CheckCircle2, Search, ChevronDown, ReceiptText, PlusCircle } from "lucide-react";
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

interface User {
  user_id: string;
  first_name: string;
  last_name: string;
  email: string;
  phone_number: string;
  wallet_id: string;
  wallet_balance?: string;
}

export default function FundWalletPage() {
  const [users, setUsers] = useState<User[]>([]);
  const [filteredUsers, setFilteredUsers] = useState<User[]>([]);
  const [searchValue, setSearchValue] = useState("");
  const [selectedUser, setSelectedUser] = useState<User | null>(null);
  const [amount, setAmount] = useState("");
  const [description, setDescription] = useState("Wallet credit");
  const [isSubmitting, setIsSubmitting] = useState(false);
  const [formSuccess, setFormSuccess] = useState<string | null>(null);
  const [formError, setFormError] = useState<string | null>(null);
  const [loadingUsers, setLoadingUsers] = useState(true);
  const [open, setOpen] = useState(false);
  
  const { toast } = useToast();

  useEffect(() => {
    const fetchData = async () => {
      try {
        const token = localStorage.getItem('token');
        if (!token) {
          throw new Error('No authentication token found');
        }

        // Fetch users
        const usersResponse = await axios.get(
          `${process.env.NEXT_PUBLIC_API_URL}/user-admin/list?page_size=100000`, 
          {
            headers: { Authorization: `Bearer ${token}` }
          }
        );
        
        if (usersResponse.data.success) {
          setUsers(usersResponse.data.data);
          setFilteredUsers(usersResponse.data.data);
        }
      } catch (err) {
        if (axios.isAxiosError(err)) {
          setFormError(err.response?.data?.message || 'Failed to load data');
        } else {
          setFormError(err instanceof Error ? err.message : 'An error occurred');
        }
      } finally {
        setLoadingUsers(false);
      }
    };

    fetchData();
  }, []);

  // Filter users based on search input
  useEffect(() => {
    if (!searchValue.trim()) {
      setFilteredUsers(users);
      return;
    }
    
    const query = searchValue.toLowerCase();
    const filtered = users.filter(user => 
      (user.first_name?.toLowerCase() || '').includes(query) ||
      (user.last_name?.toLowerCase() || '').includes(query) ||
      (user.email?.toLowerCase() || '').includes(query) ||
      (user.phone_number || '').includes(query)
    );
    
    setFilteredUsers(filtered);
  }, [searchValue, users]);

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    
    if (!selectedUser) {
      setFormError("Please select a user");
      return;
    }
    
    if (!amount || parseFloat(amount) <= 0) {
      setFormError("Please enter a valid amount");
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
      
      const response = await axios.post(
        `${process.env.NEXT_PUBLIC_API_URL}/admin/wallet/user/${selectedUser.user_id}/credit`,
        {
          amount: parseFloat(amount),
          description: description || "Wallet credit"
        },
        {
          headers: {
            Authorization: `Bearer ${token}`,
            'Content-Type': 'application/json'
          }
        }
      );
      
      if (response.data.success) {
        setFormSuccess("Wallet credited successfully");
        toast({
          title: "Success",
          description: "Wallet has been credited successfully",
        });
        
        // Reset form
        setSelectedUser(null);
        setAmount("");
        setDescription("Wallet credit");
      } else {
        throw new Error(response.data.message || 'Failed to credit wallet');
      }
    } catch (err) {
      if (axios.isAxiosError(err)) {
        setFormError(err.response?.data?.message || 'Failed to credit wallet');
      } else {
        setFormError(err instanceof Error ? err.message : 'An error occurred');
      }
      
      toast({
        title: "Error",
        description: err instanceof Error ? err.message : 'Failed to credit wallet',
        variant: "destructive",
      });
    } finally {
      setIsSubmitting(false);
    }
  };
  
  const formatCurrency = (amount: string) => {
    return new Intl.NumberFormat('en-NG', {
      style: 'currency',
      currency: 'NGN',
      minimumFractionDigits: 2
    }).format(parseFloat(amount));
  };

  return (
    <div className="p-6 space-y-6">
      <motion.div
        initial={{ opacity: 0, y: 20 }}
        animate={{ opacity: 1, y: 0 }}
        transition={{ duration: 0.5 }}
      >
        <h1 className="text-2xl font-bold tracking-[-0.02em]">Fund Wallet</h1>
        <p className="text-muted-foreground">Add funds to a user's wallet and view transaction history.</p>
      </motion.div>
      
      <div className="flex flex-col lg:flex-row gap-6">
        {/* Left side - Credit Form */}
        <motion.div 
          className="w-full lg:w-1/3"
          initial={{ opacity: 0, y: 20 }}
          animate={{ opacity: 1, y: 0 }}
          transition={{ duration: 0.5, delay: 0.2 }}
        >
          <Card>
            <CardHeader>
              <CardTitle className="flex items-center gap-2">
                <PlusCircle className="h-5 w-5" />
                Fund User Wallet
              </CardTitle>
              <CardDescription>
                Enter user details and amount to credit to their wallet.
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
                        {selectedUser ? `${selectedUser.first_name} ${selectedUser.last_name}` : "Select user..."}
                        <ChevronDown className="ml-2 h-4 w-4 shrink-0 opacity-50" />
                      </Button>
                    </PopoverTrigger>
                    <PopoverContent className="w-[300px] p-0">
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
                                  {user.first_name} {user.last_name}
                                </div>
                                <div className="text-xs text-muted-foreground">
                                  {user.email || 'No email'} • {user.phone_number || 'No phone'}
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
                      {selectedUser.first_name} {selectedUser.last_name}
                    </div>
                    <div className="text-sm text-muted-foreground">
                      {selectedUser.email} • {selectedUser.phone_number}
                    </div>
                    {selectedUser.wallet_balance && (
                      <div className="text-sm mt-1">
                        Balance: {formatCurrency(selectedUser.wallet_balance)}
                      </div>
                    )}
                  </div>
                )}
                
                <div className="space-y-2">
                  <Label htmlFor="amount">Amount (NGN)</Label>
                  <Input
                    id="amount"
                    type="number"
                    placeholder="Enter amount to credit"
                    value={amount}
                    onChange={(e) => setAmount(e.target.value)}
                  />
                </div>
                
                <div className="space-y-2">
                  <Label htmlFor="description">Description</Label>
                  <Textarea
                    id="description"
                    placeholder="Reason for credit"
                    value={description}
                    onChange={(e) => setDescription(e.target.value)}
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
            </CardContent>
            <CardFooter>
              <Button 
                type="submit" 
                className="w-full" 
                disabled={isSubmitting || !selectedUser}
                onClick={handleSubmit}
              >
                {isSubmitting ? "Processing..." : "Fund Wallet"}
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
              <CardTitle>Credit Transaction History</CardTitle>
              <CardDescription>
                Recent wallet credits performed by administrators.
              </CardDescription>
            </CardHeader>
            <CardContent>
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
                    {/* Empty state - no rows */}
                  </TableBody>
                </Table>
              </div>
              
              <div className="flex flex-col items-center justify-center py-12 text-center">
                <ReceiptText className="h-12 w-12 text-muted-foreground mb-4 opacity-30" />
                <h3 className="text-lg font-medium mb-1">No transaction history</h3>
                <p className="text-sm text-muted-foreground max-w-sm">
                  Transaction history will be available once the logging system is implemented.
                </p>
              </div>
            </CardContent>
          </Card>
        </motion.div>
      </div>
    </div>
  );
} 