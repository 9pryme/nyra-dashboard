"use client";

import { useState } from "react";
import axios from "axios";
import { Button } from "@/components/ui/button";
import { Card, CardContent, CardDescription, CardFooter, CardHeader, CardTitle } from "@/components/ui/card";
import { Alert, AlertDescription, AlertTitle } from "@/components/ui/alert";
import { AlertCircle, CheckCircle2, ArrowLeftRight } from "lucide-react";
import { motion } from "framer-motion";
import { useToast } from "@/hooks/use-toast";

export default function EvacuatePage() {
  const [isLoading, setIsLoading] = useState(false);
  const [success, setSuccess] = useState<string | null>(null);
  const [error, setError] = useState<string | null>(null);
  const { toast } = useToast();

  const handleEvacuateFunds = async () => {
    setIsLoading(true);
    setSuccess(null);
    setError(null);
    
    try {
      const token = localStorage.getItem('token');
      if (!token) {
        throw new Error('No authentication token found');
      }

      const response = await axios.post(
        `${process.env.NEXT_PUBLIC_API_URL}/funds/evacuate`,
        { from: "9psb" },
        {
          headers: {
            Authorization: `Bearer ${token}`,
            'Content-Type': 'application/json'
          }
        }
      );

      if (response.data.success) {
        setSuccess(response.data.data || "Funds evacuation initiated successfully");
        toast({
          title: "Success",
          description: "Funds evacuation process started",
          variant: "default",
        });
      } else {
        throw new Error(response.data.message || 'Failed to initiate funds evacuation');
      }
    } catch (err) {
      if (axios.isAxiosError(err)) {
        setError(err.response?.data?.message || 'Failed to initiate funds evacuation');
      } else {
        setError(err instanceof Error ? err.message : 'Failed to initiate funds evacuation');
      }
      toast({
        title: "Error",
        description: err instanceof Error ? err.message : 'Failed to evacuate funds',
        variant: "destructive",
      });
    } finally {
      setIsLoading(false);
    }
  };

  return (
    <div className="p-6 space-y-6">
      <motion.div
        initial={{ opacity: 0, y: 20 }}
        animate={{ opacity: 1, y: 0 }}
        transition={{ duration: 0.5 }}
      >
        <h1 className="text-2xl font-bold tracking-[-0.02em]">Funds Evacuation</h1>
        <p className="text-muted-foreground">Initiate the funds evacuation process from 9PSB.</p>
      </motion.div>

      <motion.div
        initial={{ opacity: 0, y: 20 }}
        animate={{ opacity: 1, y: 0 }}
        transition={{ duration: 0.5, delay: 0.2 }}
      >
        <Card>
          <CardHeader>
            <CardTitle className="flex items-center gap-2">
              <ArrowLeftRight className="h-5 w-5" />
              Evacuate Funds
            </CardTitle>
            <CardDescription>
              This will initiate the process to evacuate funds from 9PSB to your designated account.
            </CardDescription>
          </CardHeader>
          <CardContent>
            <div className="space-y-4">
              <div className="rounded-lg bg-muted p-4">
                <div className="text-sm font-medium">Important Information</div>
                <div className="text-sm text-muted-foreground mt-1">
                  <ul className="list-disc list-inside space-y-1">
                    <li>Funds evacuation may take some time to complete</li>
                    <li>You will receive a notification once the process is complete</li>
                    <li>The process cannot be cancelled once initiated</li>
                  </ul>
                </div>
              </div>

              {error && (
                <Alert variant="destructive">
                  <AlertCircle className="h-4 w-4" />
                  <AlertTitle>Error</AlertTitle>
                  <AlertDescription>{error}</AlertDescription>
                </Alert>
              )}

              {success && (
                <Alert variant="default" className="bg-green-50 text-green-800 border-green-200">
                  <CheckCircle2 className="h-4 w-4 text-green-600" />
                  <AlertTitle>Success</AlertTitle>
                  <AlertDescription>{success}</AlertDescription>
                </Alert>
              )}
            </div>
          </CardContent>
          <CardFooter>
            <Button 
              onClick={handleEvacuateFunds} 
              disabled={isLoading}
              className="w-full"
            >
              {isLoading ? "Processing..." : "Evacuate Funds"}
            </Button>
          </CardFooter>
        </Card>
      </motion.div>
    </div>
  );
} 