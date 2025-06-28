"use client";

import { motion } from "framer-motion";
import { Badge } from "@/components/ui/badge";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import {
  Sheet,
  SheetContent,
  SheetDescription,
  SheetHeader,
  SheetTitle,
} from "@/components/ui/sheet";
import { Separator } from "@/components/ui/separator";
import { 
  ArrowRightLeft,
  Calendar,
  DollarSign,
  Users,
  AlertTriangle,
  Clock,
  CheckCircle,
  XCircle,
  Copy,
  Check
} from "lucide-react";
import { Button } from "@/components/ui/button";
import { useToast } from "@/hooks/use-toast";
import { useState } from "react";
import { EvacuationRecord, evacuationService } from "@/lib/services/evacuation";

interface EvacuationDetailsModalProps {
  isOpen: boolean;
  onClose: () => void;
  evacuation: EvacuationRecord | null;
}

export default function EvacuationDetailsModal({ 
  isOpen, 
  onClose, 
  evacuation 
}: EvacuationDetailsModalProps) {
  const [copiedItems, setCopiedItems] = useState<Set<string>>(new Set());
  const { toast } = useToast();

  if (!evacuation) return null;

  const copyToClipboard = (text: string, label: string) => {
    navigator.clipboard.writeText(text);
    toast({
      title: "Copied",
      description: `${label} copied to clipboard`,
    });
    
    const itemKey = `${label}-${text}`;
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

  const getStatusBadge = () => {
    if (evacuation.total_failures === 0) {
      return (
        <Badge variant="default" className="bg-green-100 text-green-800 border-green-200">
          <CheckCircle className="h-3 w-3 mr-1" />
          Success
        </Badge>
      );
    } else if (evacuation.total_failures < evacuation.total_accounts_processed / 2) {
      return (
        <Badge variant="secondary" className="bg-yellow-100 text-yellow-800 border-yellow-200">
          <AlertTriangle className="h-3 w-3 mr-1" />
          Partial Success
        </Badge>
      );
    } else {
      return (
        <Badge variant="destructive">
          <XCircle className="h-3 w-3 mr-1" />
          High Failures
        </Badge>
      );
    }
  };

  return (
    <Sheet open={isOpen} onOpenChange={onClose}>
      <SheetContent className="w-[600px] sm:max-w-[600px] overflow-y-auto">
        <SheetHeader className="space-y-3">
          <SheetTitle className="flex items-center gap-2">
            <ArrowRightLeft className="h-5 w-5" />
            Evacuation Details
          </SheetTitle>
          <SheetDescription>
            Detailed information for evacuation {evacuation.id}
          </SheetDescription>
        </SheetHeader>

        <div className="mt-6 space-y-6">
          <motion.div
            initial={{ opacity: 0, y: 20 }}
            animate={{ opacity: 1, y: 0 }}
            transition={{ duration: 0.3 }}
            className="space-y-6"
          >
            {/* Status and Overview */}
            <Card>
              <CardHeader className="pb-4">
                <div className="flex items-center justify-between">
                  <CardTitle className="text-lg flex items-center gap-2">
                    <DollarSign className="h-5 w-5" />
                    Evacuation Overview
                  </CardTitle>
                  {getStatusBadge()}
                </div>
              </CardHeader>
              <CardContent className="space-y-4">
                {/* Evacuation ID */}
                <div className="flex items-center justify-between p-3 bg-muted/50 rounded-lg">
                  <div>
                    <p className="text-sm font-medium">Evacuation ID</p>
                    <p className="text-lg font-mono">{evacuation.id}</p>
                  </div>
                  <Button
                    variant="ghost"
                    size="sm"
                    onClick={() => copyToClipboard(evacuation.id, 'Evacuation ID')}
                  >
                    {copiedItems.has(`Evacuation ID-${evacuation.id}`) ? (
                      <Check className="h-4 w-4 text-green-600" />
                    ) : (
                      <Copy className="h-4 w-4" />
                    )}
                  </Button>
                </div>

                <Separator />

                {/* Date and Provider */}
                <div className="space-y-3">
                  <h4 className="font-medium flex items-center gap-2">
                    <Calendar className="h-4 w-4" />
                    Evacuation Information
                  </h4>
                  <div className="grid grid-cols-2 gap-4 text-sm">
                    <div>
                      <p className="text-muted-foreground">Date & Time</p>
                      <p className="font-medium">
                        {evacuationService.formatDate(evacuation.created_at)}
                      </p>
                    </div>
                    <div>
                      <p className="text-muted-foreground">Provider</p>
                      <p className="font-medium uppercase">{evacuation.from}</p>
                    </div>
                  </div>
                </div>
              </CardContent>
            </Card>

            {/* Financial Summary */}
            <Card>
              <CardHeader className="pb-4">
                <CardTitle className="text-lg flex items-center gap-2">
                  <DollarSign className="h-5 w-5" />
                  Financial Summary
                </CardTitle>
              </CardHeader>
              <CardContent className="space-y-4">
                <div className="grid grid-cols-2 gap-4 text-sm">
                  <div className="p-3 bg-green-50 rounded-lg border border-green-200">
                    <p className="text-green-700 font-medium">Amount Moved</p>
                    <p className="text-2xl font-bold text-green-800">
                      {evacuationService.formatAmount(parseFloat(evacuation.total_amount_moved))}
                    </p>
                  </div>
                  <div className="p-3 bg-red-50 rounded-lg border border-red-200">
                    <p className="text-red-700 font-medium">Charges Incurred</p>
                    <p className="text-2xl font-bold text-red-800">
                      {evacuationService.formatAmount(parseFloat(evacuation.total_charges_incured))}
                    </p>
                  </div>
                  <div className="p-3 bg-blue-50 rounded-lg border border-blue-200">
                    <p className="text-blue-700 font-medium">Amount Skipped</p>
                    <p className="text-2xl font-bold text-blue-800">
                      {evacuationService.formatAmount(parseFloat(evacuation.amount_skipped))}
                    </p>
                  </div>
                  <div className="p-3 bg-gray-50 rounded-lg border border-gray-200">
                    <p className="text-gray-700 font-medium">Net Amount</p>
                    <p className="text-2xl font-bold text-gray-800">
                      {evacuationService.formatAmount(
                        parseFloat(evacuation.total_amount_moved) - parseFloat(evacuation.total_charges_incured)
                      )}
                    </p>
                  </div>
                </div>
              </CardContent>
            </Card>

            {/* Account Processing */}
            <Card>
              <CardHeader className="pb-4">
                <CardTitle className="text-lg flex items-center gap-2">
                  <Users className="h-5 w-5" />
                  Account Processing
                </CardTitle>
              </CardHeader>
              <CardContent className="space-y-4">
                <div className="grid grid-cols-2 gap-4 text-sm">
                  <div>
                    <p className="text-muted-foreground">Total Accounts</p>
                    <p className="text-2xl font-bold">
                      {evacuationService.formatCount(evacuation.total_accounts_processed)}
                    </p>
                  </div>
                  <div>
                    <p className="text-muted-foreground">Successful</p>
                    <p className="text-2xl font-bold text-green-600">
                      {evacuationService.formatCount(
                        evacuation.total_accounts_processed - evacuation.total_failures
                      )}
                    </p>
                  </div>
                  <div>
                    <p className="text-muted-foreground">Failed</p>
                    <p className="text-2xl font-bold text-red-600">
                      {evacuationService.formatCount(evacuation.total_failures)}
                    </p>
                  </div>
                  <div>
                    <p className="text-muted-foreground">Skipped</p>
                    <p className="text-2xl font-bold text-yellow-600">
                      {evacuationService.formatCount(evacuation.skipped)}
                    </p>
                  </div>
                </div>

                <Separator />

                {/* Success Rate */}
                <div className="space-y-2">
                  <div className="flex justify-between text-sm">
                    <span className="text-muted-foreground">Success Rate</span>
                    <span className="font-medium">
                      {(
                        ((evacuation.total_accounts_processed - evacuation.total_failures) / 
                        evacuation.total_accounts_processed) * 100
                      ).toFixed(1)}%
                    </span>
                  </div>
                  <div className="w-full bg-gray-200 rounded-full h-2">
                    <div 
                      className="bg-green-600 h-2 rounded-full" 
                      style={{ 
                        width: `${((evacuation.total_accounts_processed - evacuation.total_failures) / 
                        evacuation.total_accounts_processed) * 100}%` 
                      }}
                    ></div>
                  </div>
                </div>
              </CardContent>
            </Card>

            {/* Performance Metrics */}
            <Card>
              <CardHeader className="pb-4">
                <CardTitle className="text-lg flex items-center gap-2">
                  <Clock className="h-5 w-5" />
                  Performance Metrics
                </CardTitle>
              </CardHeader>
              <CardContent className="space-y-4">
                <div className="grid grid-cols-1 gap-4 text-sm">
                  <div className="flex justify-between items-center p-3 bg-muted/50 rounded-lg">
                    <span className="text-muted-foreground">Average amount per account</span>
                    <span className="font-bold">
                      {evacuationService.formatAmount(
                        parseFloat(evacuation.total_amount_moved) / 
                        (evacuation.total_accounts_processed - evacuation.skipped)
                      )}
                    </span>
                  </div>
                  <div className="flex justify-between items-center p-3 bg-muted/50 rounded-lg">
                    <span className="text-muted-foreground">Charge rate</span>
                    <span className="font-bold">
                      {(
                        (parseFloat(evacuation.total_charges_incured) / 
                        parseFloat(evacuation.total_amount_moved)) * 100
                      ).toFixed(2)}%
                    </span>
                  </div>
                  <div className="flex justify-between items-center p-3 bg-muted/50 rounded-lg">
                    <span className="text-muted-foreground">Skip rate</span>
                    <span className="font-bold">
                      {((evacuation.skipped / evacuation.total_accounts_processed) * 100).toFixed(1)}%
                    </span>
                  </div>
                </div>
              </CardContent>
            </Card>
          </motion.div>
        </div>
      </SheetContent>
    </Sheet>
  );
} 