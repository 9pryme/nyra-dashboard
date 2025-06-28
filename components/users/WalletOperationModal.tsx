import { useState, useEffect } from "react";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Textarea } from "@/components/ui/textarea";
import { Label } from "@/components/ui/label";
import { Badge } from "@/components/ui/badge";
import {
  Dialog,
  DialogContent,
  DialogDescription,
  DialogFooter,
  DialogHeader,
  DialogTitle,
} from "@/components/ui/dialog";
import {
  Tabs,
  TabsContent,
  TabsList,
  TabsTrigger,
} from "@/components/ui/tabs";
import { Alert, AlertDescription, AlertTitle } from "@/components/ui/alert";
import { AlertCircle, CheckCircle2, ArrowUp, ArrowDown, Copy, Check } from "lucide-react";
import { useToast } from "@/hooks/use-toast";

interface WalletOperationModalProps {
  isOpen: boolean;
  onClose: () => void;
  userId: string;
  userName: string;
  currentBalance?: number;
  onSuccess?: () => void;
  initialTab?: "credit" | "debit";
}

interface ApiResponse {
  statusCode: number;
  status: string;
  success: boolean;
  error: string;
  message: string;
  data: any;
}

export default function WalletOperationModal({
  isOpen,
  onClose,
  userId,
  userName,
  currentBalance = 0,
  onSuccess,
  initialTab = "credit"
}: WalletOperationModalProps) {
  const [activeTab, setActiveTab] = useState<"credit" | "debit">(initialTab);
  const [amount, setAmount] = useState("");
  const [description, setDescription] = useState("");
  const [isSubmitting, setIsSubmitting] = useState(false);
  const [formError, setFormError] = useState<string | null>(null);
  const [formSuccess, setFormSuccess] = useState<string | null>(null);
  const [apiResponse, setApiResponse] = useState<ApiResponse | null>(null);
  const [copiedResponse, setCopiedResponse] = useState(false);

  const { toast } = useToast();

  // Reset tab to initialTab when modal opens
  useEffect(() => {
    if (isOpen) {
      setActiveTab(initialTab);
      setDescription(initialTab === "credit" ? "Wallet credit" : "Wallet debit");
    }
  }, [isOpen, initialTab]);

  const handleTabChange = (value: string) => {
    setActiveTab(value as "credit" | "debit");
    setFormError(null);
    setFormSuccess(null);
    setApiResponse(null);
    setDescription(value === "credit" ? "Wallet credit" : "Wallet debit");
  };

  const validateForm = () => {
    if (!amount || parseFloat(amount) <= 0) {
      setFormError("Please enter a valid amount greater than 0");
      return false;
    }

    const amountNum = parseFloat(amount);
    if (amountNum > 1000000) {
      setFormError("Amount cannot exceed ₦1,000,000");
      return false;
    }

    if (activeTab === "debit" && amountNum > currentBalance) {
      setFormError(`Insufficient balance. Available: ₦${currentBalance.toLocaleString()}`);
      return false;
    }

    if (!description.trim()) {
      setFormError("Please provide a description");
      return false;
    }

    return true;
  };

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    
    if (!validateForm()) {
      return;
    }

    setIsSubmitting(true);
    setFormSuccess(null);
    setFormError(null);
    setApiResponse(null);

    try {
      const token = localStorage.getItem('token');
      if (!token) {
        throw new Error('No authentication token found');
      }

      const endpoint = `${process.env.NEXT_PUBLIC_API_URL}/admin/wallet/user/${userId}/${activeTab}`;
      const payload = {
        amount: parseFloat(amount),
        description: description.trim()
      };

      const response = await fetch(endpoint, {
        method: 'POST',
        headers: {
          'Authorization': `Bearer ${token}`,
          'Content-Type': 'application/json'
        },
        body: JSON.stringify(payload)
      });

      const data: ApiResponse = await response.json();
      setApiResponse(data);

      if (data.success) {
        const operation = activeTab === "credit" ? "credited" : "debited";
        const successMessage = `Successfully ${operation} ₦${parseFloat(amount).toLocaleString()} ${activeTab === "credit" ? "to" : "from"} ${userName}'s wallet`;
        
        setFormSuccess(successMessage);
        toast({
          title: "Success",
          description: successMessage,
        });

        // Reset form
        setAmount("");
        setDescription(activeTab === "credit" ? "Wallet credit" : "Wallet debit");
        
        // Call success callback to refresh data
        if (onSuccess) {
          onSuccess();
        }
      } else {
        throw new Error(data.message || `Failed to ${activeTab} wallet`);
      }
    } catch (err) {
      const errorMessage = err instanceof Error ? err.message : `Failed to ${activeTab} wallet`;
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

  const copyResponse = () => {
    if (apiResponse) {
      navigator.clipboard.writeText(JSON.stringify(apiResponse, null, 2));
      setCopiedResponse(true);
      setTimeout(() => setCopiedResponse(false), 2000);
      toast({
        title: "Copied",
        description: "API response copied to clipboard",
      });
    }
  };

  const formatCurrency = (amount: number) => {
    return new Intl.NumberFormat('en-NG', {
      style: 'currency',
      currency: 'NGN',
      minimumFractionDigits: 2
    }).format(amount);
  };

  const handleClose = () => {
    setAmount("");
    setDescription("");
    setFormError(null);
    setFormSuccess(null);
    setApiResponse(null);
    setActiveTab(initialTab);
    onClose();
  };

  return (
    <Dialog open={isOpen} onOpenChange={handleClose}>
      <DialogContent className="sm:max-w-md">
        <DialogHeader>
          <DialogTitle>Wallet Operations</DialogTitle>
          <DialogDescription>
            Credit or debit {userName}'s wallet
          </DialogDescription>
        </DialogHeader>

        <Tabs value={activeTab} onValueChange={handleTabChange} className="w-full">
          <TabsList className="grid w-full grid-cols-2">
            <TabsTrigger value="credit" className="flex items-center gap-2">
              <ArrowUp className="h-4 w-4" />
              Credit
            </TabsTrigger>
            <TabsTrigger value="debit" className="flex items-center gap-2">
              <ArrowDown className="h-4 w-4" />
              Debit
            </TabsTrigger>
          </TabsList>

          <TabsContent value="credit" className="space-y-4 mt-4">
            <div className="p-3 border rounded-md bg-green-50 dark:bg-green-900/20">
              <div className="text-sm font-medium text-green-800 dark:text-green-400">
                Credit Funds to {userName}
              </div>
              <div className="text-xs text-green-600 dark:text-green-300">
                Add money to the user's wallet
              </div>
            </div>
          </TabsContent>

          <TabsContent value="debit" className="space-y-4 mt-4">
            <div className="p-3 border rounded-md bg-red-50 dark:bg-red-900/20">
              <div className="text-sm font-medium text-red-800 dark:text-red-400">
                Debit Funds from {userName}
              </div>
              <div className="text-xs text-red-600 dark:text-red-300">
                Remove money from the user's wallet
              </div>
              <div className="text-xs text-muted-foreground mt-1">
                Available Balance: {formatCurrency(currentBalance)}
              </div>
            </div>
          </TabsContent>
        </Tabs>

        <form onSubmit={handleSubmit} className="space-y-4">
          <div className="space-y-2">
            <Label htmlFor="amount">Amount (NGN)</Label>
            <Input
              id="amount"
              type="number"
              placeholder="Enter amount"
              value={amount}
              onChange={(e) => setAmount(e.target.value)}
              min="1"
              max={activeTab === "debit" ? currentBalance.toString() : "1000000"}
              step="0.01"
              required
            />
            <div className="flex justify-between text-xs text-muted-foreground">
              <span>Maximum: ₦1,000,000</span>
              {activeTab === "debit" && (
                <span>Available: ₦{currentBalance.toLocaleString()}</span>
              )}
            </div>
          </div>

          <div className="space-y-2">
            <Label htmlFor="description">Description</Label>
            <Textarea
              id="description"
              placeholder="Reason for transaction"
              value={description}
              onChange={(e) => setDescription(e.target.value)}
              maxLength={200}
              required
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

          {apiResponse && (
            <Alert variant="default" className="bg-blue-50 text-blue-800 border-blue-200 dark:bg-blue-900/20 dark:text-blue-400 dark:border-blue-800">
              <div className="flex items-start justify-between">
                <div className="flex-1">
                  <AlertTitle className="flex items-center gap-2">
                    API Response
                    <Badge variant={apiResponse.success ? "secondary" : "destructive"}>
                      {apiResponse.statusCode}
                    </Badge>
                  </AlertTitle>
                  <AlertDescription className="mt-2">
                    <div className="bg-gray-900 text-gray-100 p-3 rounded text-xs font-mono overflow-auto max-h-32">
                      <pre>{JSON.stringify(apiResponse, null, 2)}</pre>
                    </div>
                  </AlertDescription>
                </div>
                <Button
                  variant="ghost"
                  size="sm"
                  className="h-6 w-6 p-0 ml-2"
                  onClick={copyResponse}
                >
                  {copiedResponse ? (
                    <Check className="h-3 w-3 text-green-600" />
                  ) : (
                    <Copy className="h-3 w-3" />
                  )}
                </Button>
              </div>
            </Alert>
          )}
        </form>

        <DialogFooter className="flex gap-2">
          <Button type="button" variant="outline" onClick={handleClose}>
            Cancel
          </Button>
          <Button 
            type="submit" 
            disabled={isSubmitting || !amount}
            onClick={handleSubmit}
            className={activeTab === "debit" ? "bg-red-600 hover:bg-red-700" : ""}
          >
            {isSubmitting ? "Processing..." : `${activeTab === "credit" ? "Credit" : "Debit"} Wallet`}
          </Button>
        </DialogFooter>
      </DialogContent>
    </Dialog>
  );
} 