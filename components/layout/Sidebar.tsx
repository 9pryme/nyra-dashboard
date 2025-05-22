"use client";

import React from "react";
import Link from "next/link";
import { usePathname } from "next/navigation";
import { cn } from "@/lib/utils";
import {
  LayoutDashboard,
  ScrollText,
  Settings,
  Users,
  Mail,
  Wrench,
  Shield,
  CircleUserRound,
  CircleDollarSign,
  LogOut,
  X,
  HelpCircle,
  CreditCard,
  ChevronDown,
  Users2,
  Wallet,
  ArrowRightLeft,
  Receipt,
  Circle,
} from "lucide-react";
import { Button } from "@/components/ui/button";
import {
  Collapsible,
  CollapsibleContent,
  CollapsibleTrigger,
} from "@/components/ui/collapsible";

interface SidebarProps {
  isMobile?: boolean;
  onCloseMobile?: () => void;
}

export default function Sidebar({ isMobile, onCloseMobile }: SidebarProps) {
  const pathname = usePathname();

  const menuItems = [
    { label: "Dashboard", icon: LayoutDashboard, href: "/dashboard" },
    { label: "Manage Users", icon: CircleUserRound, href: "/dashboard/users" },
    { label: "Joint Accounts", icon: Users2, href: "/dashboard/joint-accounts" },
    { label: "Transactions", icon: ScrollText, href: "/dashboard/transactions" },
    { label: "Manage Wallets", icon: CircleDollarSign, href: "/dashboard/manage-wallets" },
    { label: "Email & Notif", icon: Mail, href: "/dashboard/notifications" },
  ];

  const moneyItems = [
    { label: "Fund Wallet", icon: Wallet, href: "/dashboard/fund-wallet" },
    { label: "Move Funds", icon: ArrowRightLeft, href: "/dashboard/move-funds" },
    { label: "Debit Wallet", icon: Receipt, href: "/dashboard/debit-wallet" },
    { label: "Evacuate Funds", icon: Circle, href: "/dashboard/evacuate" },
  ];

  const cardItems = [
    { label: "USD Virtual Cards", href: "/dashboard/cards/usd-virtual" },
    { label: "NGN Virtual Cards", href: "/dashboard/cards/ngn-virtual" },
    { label: "NGN Physical Cards", href: "/dashboard/cards/ngn-physical" },
  ];

  const otherItems = [
    { label: "Config", icon: Wrench, href: "/dashboard/config" },
    { label: "Settings", icon: Settings, href: "/dashboard/settings" },
    { label: "Roles & Permissions", icon: Shield, href: "/dashboard/roles" },
    { label: "Manage Providers", icon: Users, href: "/dashboard/providers" },
    { label: "Help", icon: HelpCircle, href: "/dashboard/help" },
  ];

  return (
    <div className={cn(
      "flex flex-col bg-card border-r border-border h-full w-64",
      isMobile && "rounded-r-lg shadow-xl"
    )}>
      {isMobile && (
        <div className="flex justify-end p-2">
          <Button 
            variant="ghost" 
            size="icon" 
            onClick={onCloseMobile}
            className="h-8 w-8"
          >
            <X className="h-4 w-4" />
          </Button>
        </div>
      )}
      
      <div className="p-6">
        <div className="flex items-center gap-2 mb-12">
          <span className="text-xl font-bold">Nyra Wallet</span>
        </div>

        <div className="space-y-8">
          <div>
            <p className="text-xs font-medium text-muted-foreground mb-4">
              MENU
            </p>
            <nav className="space-y-2">
              {menuItems.map((item) => (
                <Link
                  key={item.href}
                  href={item.href}
                  className={cn(
                    "flex items-center gap-3 px-3 py-2.5 rounded-md text-sm font-medium transition-colors",
                    pathname === item.href
                      ? "bg-primary/10 text-primary"
                      : "text-muted-foreground hover:bg-primary/5 hover:text-foreground"
                  )}
                >
                  <item.icon className="h-5 w-5" />
                  {item.label}
                </Link>
              ))}

              <Collapsible>
                <CollapsibleTrigger className="flex items-center gap-3 px-3 py-2.5 rounded-md text-sm font-medium transition-colors w-full text-muted-foreground hover:bg-primary/5 hover:text-foreground">
                  <CreditCard className="h-5 w-5" />
                  <span className="flex-1 text-left">Cards</span>
                  <ChevronDown className="h-4 w-4" />
                </CollapsibleTrigger>
                <CollapsibleContent>
                  {cardItems.map((item) => (
                    <Link
                      key={item.href}
                      href={item.href}
                      className={cn(
                        "flex items-center gap-3 px-3 py-2.5 rounded-md text-sm font-medium transition-colors pl-10",
                        pathname === item.href
                          ? "bg-primary/10 text-primary"
                          : "text-muted-foreground hover:bg-primary/5 hover:text-foreground"
                      )}
                    >
                      {item.label}
                    </Link>
                  ))}
                </CollapsibleContent>
              </Collapsible>
            </nav>
          </div>

          <div>
            <p className="text-xs font-medium text-muted-foreground mb-4">
              MONEY
            </p>
            <nav className="space-y-2">
              {moneyItems.map((item) => (
                <Link
                  key={item.href}
                  href={item.href}
                  className={cn(
                    "flex items-center gap-3 px-3 py-2.5 rounded-md text-sm font-medium transition-colors",
                    pathname === item.href
                      ? "bg-primary/10 text-primary"
                      : "text-muted-foreground hover:bg-primary/5 hover:text-foreground"
                  )}
                >
                  <item.icon className="h-5 w-5" />
                  {item.label}
                </Link>
              ))}
            </nav>
          </div>

          <div>
            <p className="text-xs font-medium text-muted-foreground mb-4">
              OTHERS
            </p>
            <nav className="space-y-2">
              {otherItems.map((item) => (
                <Link
                  key={item.href}
                  href={item.href}
                  className={cn(
                    "flex items-center gap-3 px-3 py-2.5 rounded-md text-sm font-medium transition-colors",
                    pathname === item.href
                      ? "bg-primary/10 text-primary"
                      : "text-muted-foreground hover:bg-primary/5 hover:text-foreground"
                  )}
                >
                  <item.icon className="h-5 w-5" />
                  {item.label}
                </Link>
              ))}
            </nav>
          </div>
        </div>
      </div>

      <div className="mt-auto p-6">
        <Button
          variant="outline"
          className="w-full justify-start text-destructive hover:text-destructive hover:bg-destructive/10"
        >
          <LogOut className="mr-2 h-4 w-4" />
          Logout
        </Button>
      </div>
    </div>
  );
}