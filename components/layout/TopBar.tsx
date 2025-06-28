"use client";

import React from "react";
import { Bell, Search, Menu, RotateCcw } from "lucide-react";
import { Input } from "@/components/ui/input";
import { Avatar, AvatarFallback, AvatarImage } from "@/components/ui/avatar";
import { Button } from "@/components/ui/button";
import {
  DropdownMenu,
  DropdownMenuContent,
  DropdownMenuItem,
  DropdownMenuLabel,
  DropdownMenuSeparator,
  DropdownMenuTrigger,
} from "@/components/ui/dropdown-menu";
import { cn } from "@/lib/utils";
import { ThemeToggle } from "@/components/ui/theme-toggle";
import { dashboardCache, walletCache, transactionCache } from "@/lib/cache";

interface TopBarProps {
  onMobileMenuClick: () => void;
  className?: string;
}

export default function TopBar({ onMobileMenuClick, className }: TopBarProps) {
  const handleRefresh = () => {
    // Clear all caches to force fresh data
    dashboardCache.clear();
    walletCache.clear();
    transactionCache.clear();
    
    // Reload the page
    window.location.reload();
  };

  return (
    <header className={cn("bg-background/95 backdrop-blur supports-[backdrop-filter]:bg-background/60 border-b border-border h-14 flex items-center px-4 lg:px-6", className)}>
      <div className="flex-1 flex items-center">
        {/* Mobile menu button and logo */}
        <div className="flex items-center gap-3">
          <Button 
            variant="ghost" 
            size="icon" 
            className="lg:hidden" 
            onClick={onMobileMenuClick}
          >
            <Menu className="h-5 w-5" />
          </Button>
          
          {/* Mobile logo - only show on mobile when sidebar is hidden */}
          <span className="lg:hidden font-clash font-bold text-lg text-foreground">
            Nyra
          </span>
        </div>
        
        {/* Search - hide on mobile, show on larger screens */}
        <div className="hidden md:flex relative w-full max-w-md ml-6">
          <Search className="absolute left-2.5 top-2.5 h-4 w-4 text-muted-foreground" />
          <Input
            type="search"
            placeholder="Search anything..."
            className="w-full pl-9 bg-muted/40 border-none"
          />
        </div>
      </div>
      
      <div className="flex items-center gap-3">
        {/* Theme Toggle */}
        <ThemeToggle />
        
        {/* Refresh Button */}
        <Button 
          variant="ghost" 
          size="sm" 
          className="h-8 w-8 p-0"
          onClick={handleRefresh}
          title="Refresh page"
        >
          <RotateCcw className="h-4 w-4" />
        </Button>
        
        {/* Notifications */}
        <DropdownMenu>
          <DropdownMenuTrigger asChild>
            <Button variant="ghost" size="sm" className="relative h-8 w-8 p-0">
              <Bell className="h-4 w-4" />
              <span className="absolute top-0 right-0 h-2 w-2 rounded-full bg-destructive"></span>
            </Button>
          </DropdownMenuTrigger>
          <DropdownMenuContent align="end" className="w-80">
            <DropdownMenuLabel>Notifications</DropdownMenuLabel>
            <DropdownMenuSeparator />
            <div className="max-h-96 overflow-auto">
              {[1, 2, 3].map((i) => (
                <DropdownMenuItem key={i} className="cursor-pointer py-3">
                  <div className="flex gap-4">
                    <div className="h-9 w-9 rounded-full bg-primary/10 flex items-center justify-center shrink-0">
                      <Bell className="h-4 w-4 text-primary" />
                    </div>
                    <div className="space-y-1">
                      <p className="text-sm font-medium">Transaction completed</p>
                      <p className="text-xs text-muted-foreground">
                        Your transfer of ₦25,000 to Alex Johnson was successful.
                      </p>
                      <p className="text-xs text-muted-foreground">
                        2 hours ago
                      </p>
                    </div>
                  </div>
                </DropdownMenuItem>
              ))}
            </div>
          </DropdownMenuContent>
        </DropdownMenu>
        
        {/* User menu */}
        <DropdownMenu>
          <DropdownMenuTrigger asChild>
            <Button variant="ghost" className="relative h-8 w-8 rounded-full p-0">
              <Avatar className="h-8 w-8">
                <AvatarImage src="/placeholder-avatar.jpg" alt="Maryam Mahmud" />
                <AvatarFallback className="text-xs">MM</AvatarFallback>
              </Avatar>
            </Button>
          </DropdownMenuTrigger>
          <DropdownMenuContent align="end">
            <DropdownMenuLabel>My Account</DropdownMenuLabel>
            <DropdownMenuSeparator />
            <DropdownMenuItem>Profile</DropdownMenuItem>
            <DropdownMenuItem>Settings</DropdownMenuItem>
            <DropdownMenuSeparator />
            <DropdownMenuItem className="text-destructive">Logout</DropdownMenuItem>
          </DropdownMenuContent>
        </DropdownMenu>
      </div>
    </header>
  );
}