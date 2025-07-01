import { Button } from "@/components/ui/button";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { FileText, Shield, Wallet, History, Lock, Unlock } from "lucide-react";
import { useState } from "react";
import UserKycModal from "./UserKycModal";
import { useFreezeWallet } from "@/hooks/use-users";

interface UserActionsProps {
  userId: string;
  frozen: boolean;
  onFrozenUpdate?: (frozen: boolean) => void;
  userName?: string;
}

export default function UserActions({ userId, frozen, onFrozenUpdate, userName }: UserActionsProps) {
  const [isKycModalOpen, setIsKycModalOpen] = useState(false);
  const freezeWallet = useFreezeWallet();

  // If currently frozen, we want to unfreeze (freeze=false)
  // If currently not frozen, we want to freeze (freeze=true)
  const shouldFreeze = !frozen;

  const handleFreezeUnfreeze = () => {
    freezeWallet.mutate(
      { userId, freeze: shouldFreeze },
      {
        onSuccess: () => {
          // Update the frozen status based on the action taken
          onFrozenUpdate?.(shouldFreeze);
        }
      }
    );
  };

  return (
    <>
      <Card>
        <CardHeader>
          <CardTitle className="text-lg font-semibold">Actions</CardTitle>
        </CardHeader>
        <CardContent>
          <div className="flex flex-col gap-3">
            <Button 
              variant="outline" 
              className="justify-start bg-blue-50 hover:bg-blue-100 dark:bg-blue-950 dark:hover:bg-blue-900 dark:text-blue-300 dark:border-blue-800"
              onClick={() => setIsKycModalOpen(true)}
            >
              <FileText className="mr-2 h-4 w-4 text-blue-600 dark:text-blue-400" />
              <span className="text-blue-700 dark:text-blue-300">View KYC Docs</span>
            </Button>
            
            <Button 
              variant="outline" 
              className={`justify-start ${
                frozen 
                  ? 'bg-green-50 hover:bg-green-100 dark:bg-green-950 dark:hover:bg-green-900 dark:border-green-800' 
                  : 'bg-red-50 hover:bg-red-100 dark:bg-red-950 dark:hover:bg-red-900 dark:border-red-800'
              }`}
              onClick={handleFreezeUnfreeze}
              disabled={freezeWallet.isPending}
            >
              {frozen ? (
                <>
                  <Unlock className="mr-2 h-4 w-4 text-green-600 dark:text-green-400" />
                  <span className="text-green-700 dark:text-green-300">
                    {freezeWallet.isPending ? 'Unfreezing...' : 'Unfreeze Wallet'}
                  </span>
                </>
              ) : (
                <>
                  <Lock className="mr-2 h-4 w-4 text-red-600 dark:text-red-400" />
                  <span className="text-red-700 dark:text-red-300">
                    {freezeWallet.isPending ? 'Freezing...' : 'Freeze Wallet'}
                  </span>
                </>
              )}
            </Button>
            
            <Button 
              variant="outline" 
              className="justify-start bg-green-50 hover:bg-green-100 dark:bg-green-950 dark:hover:bg-green-900 dark:text-green-300 dark:border-green-800"
            >
              <Wallet className="mr-2 h-4 w-4 text-green-600 dark:text-green-400" />
              <span className="text-green-700 dark:text-green-300">Upgrade Wallet</span>
            </Button>
            
            <Button 
              variant="outline" 
              className="justify-start bg-purple-50 hover:bg-purple-100 dark:bg-purple-950 dark:hover:bg-purple-900 dark:text-purple-300 dark:border-purple-800"
            >
              <History className="mr-2 h-4 w-4 text-purple-600 dark:text-purple-400" />
              <span className="text-purple-700 dark:text-purple-300">Audit Log</span>
            </Button>
          </div>
        </CardContent>
      </Card>

      <UserKycModal
        isOpen={isKycModalOpen}
        onClose={() => setIsKycModalOpen(false)}
        userId={userId}
        userName={userName || 'User'}
      />
    </>
  );
}