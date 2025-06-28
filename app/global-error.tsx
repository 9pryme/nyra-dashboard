'use client';

import Link from "next/link";
import { Button } from "@/components/ui/button";
import { Card, CardContent } from "@/components/ui/card";
import { Badge } from "@/components/ui/badge";
import { RefreshCcw, Home, AlertTriangle } from "lucide-react";

export default function GlobalError({
  error,
  reset,
}: {
  error: Error & { digest?: string };
  reset: () => void;
}) {
  return (
    <html>
      <body className="font-sans antialiased">
        <div className="min-h-screen bg-gradient-to-br from-background via-background to-muted/20 flex items-center justify-center p-4">
          <div className="w-full max-w-2xl mx-auto text-center space-y-8">
            
            {/* Error Badge */}
            <div className="flex justify-center">
              <Badge variant="destructive" className="text-lg px-4 py-2 bg-red-100 text-red-800 dark:bg-red-900 dark:text-red-200">
                <AlertTriangle className="mr-2 h-5 w-5" />
                Application Error
              </Badge>
            </div>

            {/* Main Content Card */}
            <Card className="border-2 shadow-lg bg-card/50 backdrop-blur-sm">
              <CardContent className="p-12 space-y-8">
                
                {/* Error Icon and Title */}
                <div className="space-y-4">
                  <div className="w-20 h-20 bg-red-100 dark:bg-red-900/20 rounded-full flex items-center justify-center mx-auto">
                    <AlertTriangle className="w-10 h-10 text-red-600 dark:text-red-400" />
                  </div>
                  <div className="h-1 w-24 bg-red-500 mx-auto rounded-full"></div>
                </div>

                {/* Error Message */}
                <div className="space-y-4">
                  <h1 className="font-clash-display text-3xl md:text-4xl font-semibold text-foreground tracking-tight">
                    Something went wrong
                  </h1>
                  <p className="text-lg text-muted-foreground max-w-md mx-auto leading-relaxed">
                    We encountered an unexpected error. Our team has been notified and is working to fix this issue.
                  </p>
                  
                  {/* Error Details (only in development) */}
                  {process.env.NODE_ENV === 'development' && error.message && (
                    <div className="mt-6 p-4 bg-muted rounded-lg text-left">
                      <p className="text-sm font-mono text-muted-foreground break-all">
                        {error.message}
                      </p>
                      {error.digest && (
                        <p className="text-xs text-muted-foreground mt-2">
                          Error ID: {error.digest}
                        </p>
                      )}
                    </div>
                  )}
                </div>

                {/* Action Buttons */}
                <div className="flex flex-col sm:flex-row gap-4 justify-center pt-4">
                  <Button onClick={reset} size="lg" className="font-medium">
                    <RefreshCcw className="mr-2 h-5 w-5" />
                    Try Again
                  </Button>
                  
                  <Button asChild variant="outline" size="lg" className="font-medium">
                    <Link href="/dashboard">
                      <Home className="mr-2 h-5 w-5" />
                      Back to Dashboard
                    </Link>
                  </Button>
                </div>

                {/* Additional Info */}
                <div className="pt-8 border-t border-border/50">
                  <p className="text-sm text-muted-foreground">
                    If this problem persists, please{" "}
                    <Link href="/dashboard/help" className="text-primary hover:underline font-medium">
                      contact our support team
                    </Link>
                    {" "}with the error details above.
                  </p>
                </div>

              </CardContent>
            </Card>

            {/* Nyra Branding */}
            <div className="pt-8">
              <div className="flex items-center justify-center gap-2 text-muted-foreground">
                <div className="w-8 h-8 bg-primary rounded-full flex items-center justify-center">
                  <span className="text-primary-foreground font-bold text-sm">N</span>
                </div>
                <span className="font-clash-display text-lg font-semibold">Nyra Dashboard</span>
              </div>
              <p className="text-xs text-muted-foreground mt-2">
                © 2025 Nyra. All rights reserved.
              </p>
            </div>

          </div>
        </div>
      </body>
    </html>
  );
} 