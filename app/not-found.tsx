import Link from "next/link";
import { Button } from "@/components/ui/button";
import { Card, CardContent } from "@/components/ui/card";
import { Badge } from "@/components/ui/badge";
import { ArrowLeft, Home, Search, AlertTriangle } from "lucide-react";

export default function NotFound() {
  return (
    <div className="min-h-screen bg-gradient-to-br from-background via-background to-muted/20 flex items-center justify-center p-4">
      <div className="w-full max-w-2xl mx-auto text-center space-y-8">
        
        {/* 404 Badge */}
        <div className="flex justify-center">
          <Badge variant="destructive" className="text-lg px-4 py-2 bg-red-100 text-red-800 dark:bg-red-900 dark:text-red-200">
            <AlertTriangle className="mr-2 h-5 w-5" />
            404 Error
          </Badge>
        </div>

        {/* Main Content Card */}
        <Card className="border-2 shadow-lg bg-card/50 backdrop-blur-sm">
          <CardContent className="p-12 space-y-8">
            
            {/* Large 404 Number */}
            <div className="space-y-4">
              <h1 className="font-clash-display text-8xl md:text-9xl font-bold text-primary/80 leading-none">
                404
              </h1>
              <div className="h-1 w-24 bg-primary mx-auto rounded-full"></div>
            </div>

            {/* Error Message */}
            <div className="space-y-4">
              <h2 className="font-clash-display text-3xl md:text-4xl font-semibold text-foreground tracking-tight">
                Page Not Found
              </h2>
              <p className="text-lg text-muted-foreground max-w-md mx-auto leading-relaxed">
                Oops! The page you're looking for seems to have wandered off into the digital void. 
                Let's get you back on track.
              </p>
            </div>

            {/* Action Buttons */}
            <div className="flex flex-col sm:flex-row gap-4 justify-center pt-4">
              <Button asChild size="lg" className="font-medium">
                <Link href="/dashboard">
                  <Home className="mr-2 h-5 w-5" />
                  Back to Dashboard
                </Link>
              </Button>
              
              <Button asChild variant="outline" size="lg" className="font-medium">
                <Link href="/dashboard/users">
                  <Search className="mr-2 h-5 w-5" />
                  Browse Users
                </Link>
              </Button>
            </div>

            {/* Additional Info */}
            <div className="pt-8 border-t border-border/50">
              <p className="text-sm text-muted-foreground">
                If you believe this is an error, please{" "}
                <Link href="/dashboard/help" className="text-primary hover:underline font-medium">
                  contact support
                </Link>
                {" "}or go back to the previous page.
              </p>
            </div>

          </CardContent>
        </Card>

        {/* Footer Links */}
        <div className="flex flex-wrap justify-center gap-6 text-sm text-muted-foreground">
          <Link href="/dashboard" className="hover:text-primary transition-colors flex items-center gap-2">
            <ArrowLeft className="h-4 w-4" />
            Dashboard
          </Link>
          <Link href="/dashboard/users" className="hover:text-primary transition-colors">
            Users
          </Link>
          <Link href="/dashboard/transactions" className="hover:text-primary transition-colors">
            Transactions
          </Link>
          <Link href="/dashboard/help" className="hover:text-primary transition-colors">
            Help Center
          </Link>
        </div>

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
  );
} 