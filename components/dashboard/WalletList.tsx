"use client";

import { useState } from "react";
import { MoreVertical, Eye, Snowflake, Archive, ChevronLeft, ChevronRight } from "lucide-react";
import { Input } from "@/components/ui/input";
import { Button } from "@/components/ui/button";
import {
  DropdownMenu,
  DropdownMenuContent,
  DropdownMenuItem,
  DropdownMenuTrigger,
} from "@/components/ui/dropdown-menu";
import {
  Table,
  TableBody,
  TableCell,
  TableHead,
  TableHeader,
  TableRow,
} from "@/components/ui/table";
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
import {
  Select,
  SelectContent,
  SelectItem,
  SelectTrigger,
  SelectValue,
} from "@/components/ui/select";
import { Badge } from "@/components/ui/badge";
import {
  Dialog,
  DialogContent,
  DialogDescription,
  DialogHeader,
  DialogTitle,
} from "@/components/ui/dialog";

interface WalletOwner {
  user_id: string;
  email: string;
  phone_number: string;
  username: string;
  firstname: string;
  lastname: string;
  middlename?: string;
  active_status: string;
  account_tier?: number;
  role?: string;
  email_verified?: boolean;
  phone_verified?: boolean;
}

interface WalletData {
  wallet_id: string;
  balance: string;
  total_credit: string;
  total_debit: string;
  frozen: boolean;
  wallet_pin_changed?: boolean;
  owner: WalletOwner;
  created_at: string;
  updated_at?: string;
}

interface WalletListProps {
  wallets: WalletData[];
}

export default function WalletList({ wallets }: WalletListProps) {
  const [search, setSearch] = useState("");
  const [statusFilter, setStatusFilter] = useState<string>("all");
  const [minAmount, setMinAmount] = useState<string>("");
  const [maxAmount, setMaxAmount] = useState<string>("");
  const [showFreezeConfirm, setShowFreezeConfirm] = useState(false);
  const [showArchiveConfirm, setShowArchiveConfirm] = useState(false);
  const [selectedWallet, setSelectedWallet] = useState<string | null>(null);
  const [currentPage, setCurrentPage] = useState(1);
  const [showWalletDetails, setShowWalletDetails] = useState(false);
  const [selectedWalletData, setSelectedWalletData] = useState<WalletData | null>(null);
  const itemsPerPage = 10;

  const formatCurrency = (amount: string) => {
    const numAmount = parseFloat(amount);
    return new Intl.NumberFormat('en-NG', {
      style: 'currency',
      currency: 'NGN',
      minimumFractionDigits: 2,
      maximumFractionDigits: 2,
    }).format(numAmount);
  };

  const filteredWallets = wallets.filter(wallet => {
    const matchesSearch = 
      wallet.wallet_id?.toLowerCase().includes(search.toLowerCase()) ||
      `${wallet.owner?.firstname || ''} ${wallet.owner?.lastname || ''}`.toLowerCase().includes(search.toLowerCase()) ||
      wallet.owner?.email?.toLowerCase().includes(search.toLowerCase()) ||
      wallet.owner?.username?.toLowerCase().includes(search.toLowerCase()) ||
      false;
    
    const matchesStatus = 
      statusFilter === "all" || 
      (statusFilter === "frozen" && wallet.frozen) || 
      (statusFilter === "active" && !wallet.frozen);

    // Amount filters
    const balance = parseFloat(wallet.balance || '0');
    const matchesMinAmount = !minAmount || balance >= parseFloat(minAmount);
    const matchesMaxAmount = !maxAmount || balance <= parseFloat(maxAmount);

    return matchesSearch && matchesStatus && matchesMinAmount && matchesMaxAmount;
  });

  const totalPages = Math.ceil(filteredWallets.length / itemsPerPage);
  const startIndex = (currentPage - 1) * itemsPerPage;
  const paginatedWallets = filteredWallets.slice(startIndex, startIndex + itemsPerPage);

  const handleFreeze = (walletId: string) => {
    setSelectedWallet(walletId);
    setShowFreezeConfirm(true);
  };

  const handleArchive = (walletId: string) => {
    setSelectedWallet(walletId);
    setShowArchiveConfirm(true);
  };

  const handleViewDetails = (wallet: WalletData) => {
    setSelectedWalletData(wallet);
    setShowWalletDetails(true);
  };

  const confirmFreeze = () => {
    // Add your freeze wallet logic here
    console.log("Freezing wallet:", selectedWallet);
    setShowFreezeConfirm(false);
    setSelectedWallet(null);
  };

  const confirmArchive = () => {
    // Add your archive wallet logic here
    console.log("Archiving wallet:", selectedWallet);
    setShowArchiveConfirm(false);
    setSelectedWallet(null);
  };

  const formatDate = (dateString: string) => {
    return new Date(dateString).toLocaleString('en-US', {
      year: 'numeric',
      month: 'short',
      day: 'numeric',
      hour: '2-digit',
      minute: '2-digit'
    });
  };

  return (
    <div className="space-y-4">
      <div className="flex items-center justify-between">
        <Input
          placeholder="Search wallets..."
          value={search}
          onChange={(e) => setSearch(e.target.value)}
          className="w-[300px]"
        />
        <div className="flex items-center gap-4">
          <Select value={statusFilter} onValueChange={setStatusFilter}>
            <SelectTrigger className="w-[150px]">
              <SelectValue placeholder="Filter by status" />
            </SelectTrigger>
            <SelectContent>
              <SelectItem value="all">All Status</SelectItem>
              <SelectItem value="active">Active</SelectItem>
              <SelectItem value="frozen">Frozen</SelectItem>
            </SelectContent>
          </Select>
          <Input
            type="number"
            placeholder="Min Amount"
            value={minAmount}
            onChange={(e) => setMinAmount(e.target.value)}
            className="w-[120px]"
          />
          <Input
            type="number"
            placeholder="Max Amount"
            value={maxAmount}
            onChange={(e) => setMaxAmount(e.target.value)}
            className="w-[120px]"
          />
          <Button 
            variant="outline" 
            onClick={() => {
              setMinAmount("");
              setMaxAmount("");
              setSearch("");
              setStatusFilter("all");
            }}
            className="text-sm"
          >
            Clear Filters
          </Button>
        </div>
      </div>

      <div className="border rounded-lg">
        <Table>
          <TableHeader>
            <TableRow>
              <TableHead>Wallet ID</TableHead>
              <TableHead>Owner</TableHead>
              <TableHead>Balance</TableHead>
              <TableHead>Total Credit</TableHead>
              <TableHead>Total Debit</TableHead>
              <TableHead>Status</TableHead>
              <TableHead className="w-[100px]">Actions</TableHead>
            </TableRow>
          </TableHeader>
          <TableBody>
            {paginatedWallets.length > 0 ? (
              paginatedWallets.map((wallet) => (
                <TableRow key={wallet.wallet_id}>
                  <TableCell className="font-medium">{wallet.wallet_id}</TableCell>
                  <TableCell>{`${wallet.owner.firstname} ${wallet.owner.lastname}`}</TableCell>
                  <TableCell>{formatCurrency(wallet.balance)}</TableCell>
                  <TableCell>{formatCurrency(wallet.total_credit)}</TableCell>
                  <TableCell>{formatCurrency(wallet.total_debit)}</TableCell>
                  <TableCell>
                    <Badge 
                      className={wallet.frozen 
                        ? "bg-red-100 text-red-800 hover:bg-red-200" 
                        : "bg-green-100 text-green-800 hover:bg-green-200"
                      }
                    >
                      {wallet.frozen ? 'Inactive' : 'Active'}
                    </Badge>
                  </TableCell>
                  <TableCell>
                    <DropdownMenu>
                      <DropdownMenuTrigger asChild>
                        <Button variant="ghost" size="icon">
                          <MoreVertical className="h-4 w-4" />
                        </Button>
                      </DropdownMenuTrigger>
                      <DropdownMenuContent align="end">
                        <DropdownMenuItem onClick={() => handleViewDetails(wallet)}>
                          <Eye className="mr-2 h-4 w-4" />
                          View
                        </DropdownMenuItem>
                        <DropdownMenuItem onClick={() => handleFreeze(wallet.wallet_id)}>
                          <Snowflake className="mr-2 h-4 w-4" />
                          {wallet.frozen ? 'Unfreeze' : 'Freeze'}
                        </DropdownMenuItem>
                        <DropdownMenuItem onClick={() => handleArchive(wallet.wallet_id)}>
                          <Archive className="mr-2 h-4 w-4" />
                          Archive
                        </DropdownMenuItem>
                      </DropdownMenuContent>
                    </DropdownMenu>
                  </TableCell>
                </TableRow>
              ))
            ) : (
              <TableRow>
                <TableCell colSpan={7} className="text-center py-6">
                  No wallets found
                </TableCell>
              </TableRow>
            )}
          </TableBody>
        </Table>
      </div>

      {/* Pagination */}
      {filteredWallets.length > 0 && (
        <div className="flex items-center justify-between">
          <p className="text-sm text-muted-foreground">
            Showing {startIndex + 1} to {Math.min(startIndex + itemsPerPage, filteredWallets.length)} of {filteredWallets.length} wallets
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
      )}

      <AlertDialog open={showFreezeConfirm} onOpenChange={setShowFreezeConfirm}>
        <AlertDialogContent>
          <AlertDialogHeader>
            <AlertDialogTitle>Freeze Wallet</AlertDialogTitle>
            <AlertDialogDescription>
              Are you sure you want to freeze this wallet? This will prevent any transactions from being processed.
            </AlertDialogDescription>
          </AlertDialogHeader>
          <AlertDialogFooter>
            <AlertDialogCancel>Cancel</AlertDialogCancel>
            <AlertDialogAction onClick={confirmFreeze}>Freeze</AlertDialogAction>
          </AlertDialogFooter>
        </AlertDialogContent>
      </AlertDialog>

      <AlertDialog open={showArchiveConfirm} onOpenChange={setShowArchiveConfirm}>
        <AlertDialogContent>
          <AlertDialogHeader>
            <AlertDialogTitle>Archive Wallet</AlertDialogTitle>
            <AlertDialogDescription>
              Are you sure you want to archive this wallet? This action cannot be undone.
            </AlertDialogDescription>
          </AlertDialogHeader>
          <AlertDialogFooter>
            <AlertDialogCancel>Cancel</AlertDialogCancel>
            <AlertDialogAction onClick={confirmArchive}>Archive</AlertDialogAction>
          </AlertDialogFooter>
        </AlertDialogContent>
      </AlertDialog>

      {/* Wallet Details Modal */}
      <Dialog open={showWalletDetails} onOpenChange={setShowWalletDetails}>
        <DialogContent className="max-w-md md:max-w-2xl">
          <DialogHeader>
            <DialogTitle>Wallet Details</DialogTitle>
            <DialogDescription>
              Complete information about this wallet
            </DialogDescription>
          </DialogHeader>
          
          {selectedWalletData && (
            <div className="space-y-6">
              <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                <div className="space-y-1">
                  <p className="text-sm font-medium text-muted-foreground">Wallet ID</p>
                  <p className="font-semibold">{selectedWalletData.wallet_id}</p>
                </div>
                <div className="space-y-1">
                  <p className="text-sm font-medium text-muted-foreground">Balance</p>
                  <p className="font-semibold">{formatCurrency(selectedWalletData.balance)}</p>
                </div>
                <div className="space-y-1">
                  <p className="text-sm font-medium text-muted-foreground">Total Credit</p>
                  <p className="font-semibold">{formatCurrency(selectedWalletData.total_credit)}</p>
                </div>
                <div className="space-y-1">
                  <p className="text-sm font-medium text-muted-foreground">Total Debit</p>
                  <p className="font-semibold">{formatCurrency(selectedWalletData.total_debit)}</p>
                </div>
                <div className="space-y-1">
                  <p className="text-sm font-medium text-muted-foreground">Status</p>
                  <Badge 
                    className={selectedWalletData.frozen 
                      ? "bg-red-100 text-red-800 hover:bg-red-200" 
                      : "bg-green-100 text-green-800 hover:bg-green-200"
                    }
                  >
                    {selectedWalletData.frozen ? 'Inactive' : 'Active'}
                  </Badge>
                </div>
                <div className="space-y-1">
                  <p className="text-sm font-medium text-muted-foreground">PIN Changed</p>
                  <Badge variant={selectedWalletData.wallet_pin_changed ? 'default' : 'outline'}>
                    {selectedWalletData.wallet_pin_changed ? 'Yes' : 'No'}
                  </Badge>
                </div>
                <div className="space-y-1">
                  <p className="text-sm font-medium text-muted-foreground">Created At</p>
                  <p>{formatDate(selectedWalletData.created_at)}</p>
                </div>
                <div className="space-y-1">
                  <p className="text-sm font-medium text-muted-foreground">Last Updated</p>
                  <p>{selectedWalletData.updated_at ? formatDate(selectedWalletData.updated_at) : 'N/A'}</p>
                </div>
              </div>
              
              <div className="border-t pt-4">
                <h3 className="font-semibold mb-3">Owner Information</h3>
                <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                  <div className="space-y-1">
                    <p className="text-sm font-medium text-muted-foreground">User ID</p>
                    <p>{selectedWalletData.owner.user_id}</p>
                  </div>
                  <div className="space-y-1">
                    <p className="text-sm font-medium text-muted-foreground">Name</p>
                    <p>{`${selectedWalletData.owner.firstname} ${selectedWalletData.owner.middlename || ''} ${selectedWalletData.owner.lastname}`}</p>
                  </div>
                  <div className="space-y-1">
                    <p className="text-sm font-medium text-muted-foreground">Username</p>
                    <p>{selectedWalletData.owner.username}</p>
                  </div>
                  <div className="space-y-1">
                    <p className="text-sm font-medium text-muted-foreground">Email</p>
                    <p>{selectedWalletData.owner.email}</p>
                  </div>
                  <div className="space-y-1">
                    <p className="text-sm font-medium text-muted-foreground">Phone</p>
                    <p>{selectedWalletData.owner.phone_number}</p>
                  </div>
                  <div className="space-y-1">
                    <p className="text-sm font-medium text-muted-foreground">Status</p>
                    <Badge 
                      className={selectedWalletData.owner.active_status !== 'ACTIVE'
                        ? "bg-red-100 text-red-800 hover:bg-red-200" 
                        : "bg-green-100 text-green-800 hover:bg-green-200"
                      }
                    >
                      {selectedWalletData.owner.active_status}
                    </Badge>
                  </div>
                  {selectedWalletData.owner.account_tier && (
                    <div className="space-y-1">
                      <p className="text-sm font-medium text-muted-foreground">Account Tier</p>
                      <p>Tier {selectedWalletData.owner.account_tier}</p>
                    </div>
                  )}
                  {selectedWalletData.owner.role && (
                    <div className="space-y-1">
                      <p className="text-sm font-medium text-muted-foreground">Role</p>
                      <p>{selectedWalletData.owner.role}</p>
                    </div>
                  )}
                </div>
              </div>
              
              <div className="grid grid-cols-2 gap-2">
                <div className="space-y-1">
                  <p className="text-sm font-medium text-muted-foreground">Email Verified</p>
                  <Badge 
                    className={!selectedWalletData.owner.email_verified
                      ? "bg-red-100 text-red-800 hover:bg-red-200" 
                      : "bg-green-100 text-green-800 hover:bg-green-200"
                    }
                  >
                    {selectedWalletData.owner.email_verified ? 'Yes' : 'No'}
                  </Badge>
                </div>
                <div className="space-y-1">
                  <p className="text-sm font-medium text-muted-foreground">Phone Verified</p>
                  <Badge 
                    className={!selectedWalletData.owner.phone_verified
                      ? "bg-red-100 text-red-800 hover:bg-red-200" 
                      : "bg-green-100 text-green-800 hover:bg-green-200"
                    }
                  >
                    {selectedWalletData.owner.phone_verified ? 'Yes' : 'No'}
                  </Badge>
                </div>
              </div>
            </div>
          )}
        </DialogContent>
      </Dialog>
    </div>
  );
}