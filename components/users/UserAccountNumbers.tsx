"use client";

import { useState } from "react";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { Input } from "@/components/ui/input";
import { Button } from "@/components/ui/button";
import { Copy, Check } from "lucide-react";
import { toast } from "sonner";

interface UserAccountNumbersProps {
  userId: string;
  accountNumbers: Record<string, string[]>;
}

export default function UserAccountNumbers({ 
  userId, 
  accountNumbers
}: UserAccountNumbersProps) {
  const [copiedItems, setCopiedItems] = useState<Set<string>>(new Set());

  const copyToClipboard = (text: string, bank: string, accountNumber: string) => {
    navigator.clipboard.writeText(text);
    toast.success(`${bank} account number copied to clipboard`);
    
    const itemKey = `${bank}-${accountNumber}`;
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

  return (
    <Card>
      <CardHeader>
        <CardTitle className="text-lg font-semibold">Account Numbers</CardTitle>
      </CardHeader>
      <CardContent className="space-y-4">
        {Object.entries(accountNumbers).map(([bank, numbers]) => (
          <div key={bank} className="space-y-3">
            <label className="text-sm font-medium text-muted-foreground">
              {bank}
            </label>
            <div className="space-y-2">
              {numbers.map((number, index) => {
                const itemKey = `${bank}-${number}`;
                const isCopied = copiedItems.has(itemKey);
                
                return (
                  <div key={`${bank}-${index}`} className="flex gap-2">
                    <Input
                      value={number}
                      disabled
                      className="font-mono"
                    />
                    <Button
                      variant="outline"
                      size="icon"
                      onClick={() => copyToClipboard(number, bank, number)}
                      className={`shrink-0 transition-colors ${
                        isCopied 
                          ? 'bg-green-50 border-green-200 hover:bg-green-100 dark:bg-green-950 dark:border-green-800' 
                          : ''
                      }`}
                    >
                      {isCopied ? (
                        <Check className="h-4 w-4 text-green-600 dark:text-green-400" />
                      ) : (
                        <Copy className="h-4 w-4" />
                      )}
                    </Button>
                  </div>
                );
              })}
            </div>
          </div>
        ))}
      </CardContent>
    </Card>
  );
} 