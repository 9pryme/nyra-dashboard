import { Button } from "@/components/ui/button";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { FileText, Shield, Wallet, History } from "lucide-react";

interface UserActionsProps {
  userId: string;
}

export default function UserActions({ userId }: UserActionsProps) {
  return (
    <Card>
      <CardHeader>
        <CardTitle className="text-lg font-semibold">Actions</CardTitle>
      </CardHeader>
      <CardContent>
        <div className="flex flex-col gap-3">
          <Button variant="outline" className="justify-start bg-blue-50 hover:bg-blue-100">
            <FileText className="mr-2 h-4 w-4 text-blue-600" />
            View KYC Docs
          </Button>
          <Button variant="outline" className="justify-start bg-red-50 hover:bg-red-100">
            <Shield className="mr-2 h-4 w-4 text-red-600" />
            PND
          </Button>
          <Button variant="outline" className="justify-start bg-green-50 hover:bg-green-100">
            <Wallet className="mr-2 h-4 w-4 text-green-600" />
            Upgrade Wallet
          </Button>
          <Button variant="outline" className="justify-start bg-purple-50 hover:bg-purple-100">
            <History className="mr-2 h-4 w-4 text-purple-600" />
            Audit Log
          </Button>
        </div>
      </CardContent>
    </Card>
  );
}