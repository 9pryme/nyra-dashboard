"use client";

import { useState } from "react";
import { Button } from "@/components/ui/button";
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
import { AlertCircle, CheckCircle2, LogOut } from "lucide-react";
import { Label } from "@/components/ui/label";
import { useToast } from "@/hooks/use-toast";

interface BankAccount {
  provider: string;
  account_id: string;
  balance: number;
}

interface EvacuateFundsModalProps {
  open: boolean;
  onOpenChange: (open: boolean) => void;
  accounts: BankAccount[];
}

export default function EvacuateFundsModal({ open, onOpenChange, accounts }: EvacuateFundsModalProps) {
  const [selectedProvider, setSelectedProvider] = useState<string>("");
  const [isSubmitting, setIsSubmitting] = useState(false);
  const [formSuccess, setFormSuccess] = useState<string | null>(null);
  const [formError, setFormError] = useState<string | null>(null);
  
  const { toast } = useToast();

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    
    // Form validation
    if (!selectedProvider) {
      setFormError("Please select a provider");
      return;
    }
    
    setIsSubmitting(true);
    setFormSuccess(null);
    setFormError(null);
    
    try {
      // TODO: Implement actual evacuation logic
      // This is a placeholder for the evacuation API call
      await new Promise(resolve => setTimeout(resolve, 2000)); // Simulate API call
      
      setFormSuccess(`Funds evacuation initiated for ${selectedProvider}`);
      toast({
        title: "Success",
        description: `Funds evacuation initiated for ${selectedProvider}`,
      });
      
      // Reset form and close modal after short delay
      setTimeout(() => {
        setSelectedProvider("");
        setFormSuccess(null);
        onOpenChange(false);
      }, 2000);
      
    } catch (err) {
      console.log('Evacuate funds error:', err);
      setFormError(err instanceof Error ? err.message : 'Failed to evacuate funds');
      
      toast({
        title: "Error",
        description: err instanceof Error ? err.message : 'Failed to evacuate funds',
        variant: "destructive",
      });
    } finally {
      setIsSubmitting(false);
    }
  };

  const resetForm = () => {
    setSelectedProvider("");
    setFormSuccess(null);
    setFormError(null);
  };

  const handleOpenChange = (newOpen: boolean) => {
    if (!newOpen) {
      resetForm();
    }
    onOpenChange(newOpen);
  };

  // Get unique providers from accounts
  const uniqueProviders = Array.from(
    new Set(accounts.map(account => account.provider))
  ).map(provider => {
    const account = accounts.find(acc => acc.provider === provider);
    return {
      provider,
      totalBalance: accounts
        .filter(acc => acc.provider === provider)
        .reduce((sum, acc) => sum + acc.balance, 0)
    };
  });

  return (
    <Dialog open={open} onOpenChange={handleOpenChange}>
      <DialogContent className="sm:max-w-[425px]">
        <DialogHeader>
          <DialogTitle>Evacuate Funds</DialogTitle>
          <DialogDescription>
            Select a provider to evacuate all funds from their accounts.
          </DialogDescription>
        </DialogHeader>
        
        <div className="space-y-4">
          <form onSubmit={handleSubmit} className="space-y-4">
            <div className="space-y-2">
              <Label htmlFor="provider">Select Provider</Label>
              <Select value={selectedProvider} onValueChange={setSelectedProvider}>
                <SelectTrigger>
                  <SelectValue placeholder="Choose provider to evacuate" />
                </SelectTrigger>
                <SelectContent>
                  {uniqueProviders.map(({ provider, totalBalance }) => (
                    <SelectItem key={provider} value={provider}>
                      <div className="flex justify-between items-center w-full">
                        <span>{provider}</span>
                        <span className="text-sm text-muted-foreground ml-2">
                          ₦{totalBalance.toLocaleString()}
                        </span>
                      </div>
                    </SelectItem>
                  ))}
                </SelectContent>
              </Select>
              {selectedProvider && (
                <p className="text-sm text-muted-foreground">
                  This will evacuate all funds from {selectedProvider} accounts.
                </p>
              )}
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
        </div>
        
        <DialogFooter>
          <Button variant="outline" onClick={() => handleOpenChange(false)}>
            Cancel
          </Button>
          <Button 
            type="submit" 
            variant="destructive"
            disabled={isSubmitting || !selectedProvider}
            onClick={handleSubmit}
          >
            <LogOut className="h-4 w-4 mr-2" />
            {isSubmitting ? "Evacuating..." : "Evacuate Funds"}
          </Button>
        </DialogFooter>
      </DialogContent>
    </Dialog>
  );
} 