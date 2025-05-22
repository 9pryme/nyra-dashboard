"use client";

import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { Input } from "@/components/ui/input";
import { Button } from "@/components/ui/button";
import { Copy } from "lucide-react";
import { toast } from "sonner";

interface UserAccountNumbersProps {
  userId: string;
  accountNumbers: Record<string, string>;
}

export default function UserAccountNumbers({ 
  userId, 
  accountNumbers
}: UserAccountNumbersProps) {
  const copyToClipboard = (text: string, bank: string) => {
    navigator.clipboard.writeText(text);
    toast.success(`${bank} account number copied to clipboard`);
  };

  return (
    <Card>
      <CardHeader>
        <CardTitle className="text-lg font-semibold">Account Numbers</CardTitle>
      </CardHeader>
      <CardContent className="space-y-4">
        {Object.entries(accountNumbers).map(([bank, number]) => (
          <div key={bank} className="space-y-2">
            <label className="text-sm font-medium text-muted-foreground">
              {bank}
            </label>
            <div className="flex gap-2">
              <Input
                value={number}
                disabled
                className="font-mono"
              />
              <Button
                variant="outline"
                size="icon"
                onClick={() => copyToClipboard(number, bank)}
                className="shrink-0"
              >
                <Copy className="h-4 w-4" />
              </Button>
            </div>
          </div>
        ))}
      </CardContent>
    </Card>
  );
} 