import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { Badge } from "@/components/ui/badge";
import { PeriodAnalytics } from "@/lib/services/analytics";
import { TrendingUp, Wallet, Zap, Phone } from "lucide-react";

interface TransactionCategoriesCardProps {
  title: string;
  periodData: PeriodAnalytics;
  className?: string;
}

export default function TransactionCategoriesCard({
  title,
  periodData,
  className = ""
}: TransactionCategoriesCardProps) {
  const getCategoryIcon = (category: string) => {
    const lowerCategory = category.toLowerCase();
    if (lowerCategory.includes('wallet transfer')) return <Wallet className="h-4 w-4" />;
    if (lowerCategory.includes('wallet funding')) return <TrendingUp className="h-4 w-4" />;
    if (lowerCategory.includes('airtime')) return <Phone className="h-4 w-4" />;
    if (lowerCategory.includes('data')) return <Zap className="h-4 w-4" />;
    return <Wallet className="h-4 w-4" />;
  };

  const formatCurrency = (amount: number) => {
    if (amount >= 1000000) {
      return `₦${(amount / 1000000).toFixed(1)}M`;
    } else if (amount >= 1000) {
      return `₦${(amount / 1000).toFixed(1)}K`;
    }
    return new Intl.NumberFormat('en-NG', {
      style: 'currency',
      currency: 'NGN',
      minimumFractionDigits: 0,
      maximumFractionDigits: 0,
    }).format(amount);
  };

  const totalAmount = Object.values(periodData.categories).reduce((sum, amount) => sum + amount, 0);
  
  const sortedCategories = Object.entries(periodData.categories)
    .map(([category, amount]) => ({ category, amount }))
    .sort((a, b) => b.amount - a.amount);

  const getPercentage = (amount: number) => {
    if (totalAmount === 0) return 0;
    return ((amount / totalAmount) * 100).toFixed(1);
  };

  return (
    <Card className={className}>
      <CardHeader className="pb-3">
        <CardTitle className="text-lg font-semibold">{title}</CardTitle>
        <div className="flex items-center gap-2 text-sm text-muted-foreground">
          <span>{periodData.electronic} transactions</span>
          <Badge variant="outline" className="text-xs">
            {formatCurrency(totalAmount)} total
          </Badge>
        </div>
      </CardHeader>
      <CardContent className="space-y-3">
        {sortedCategories.length === 0 ? (
          <div className="text-center py-8 text-muted-foreground">
            <Wallet className="h-8 w-8 mx-auto mb-2 opacity-50" />
            <p className="text-sm">No transactions yet</p>
          </div>
        ) : (
          sortedCategories.map(({ category, amount }, index) => {
            const percentage = getPercentage(amount);
            
            return (
              <div key={category} className="space-y-2">
                <div className="flex items-center justify-between">
                  <div className="flex items-center gap-2">
                    <div className="text-muted-foreground">
                      {getCategoryIcon(category)}
                    </div>
                    <span className="text-sm font-medium capitalize">
                      {category.replace(/_/g, ' ')}
                    </span>
                  </div>
                  <div className="text-right">
                    <div className="text-sm font-semibold">
                      {formatCurrency(amount)}
                    </div>
                    <div className="text-xs text-muted-foreground">
                      {percentage}%
                    </div>
                  </div>
                </div>
                
                {/* Progress bar */}
                <div className="w-full bg-muted rounded-full h-1.5">
                  <div 
                    className="bg-primary rounded-full h-1.5 transition-all duration-300" 
                    style={{ width: `${percentage}%` }}
                  />
                </div>
              </div>
            );
          })
        )}
        
        {/* Summary */}
        <div className="pt-3 border-t border-border/50">
          <div className="flex justify-between items-center text-sm">
            <span className="text-muted-foreground">Total Credit:</span>
            <span className="font-medium text-green-600 dark:text-green-400">
              {formatCurrency(periodData.total_credit)}
            </span>
          </div>
          <div className="flex justify-between items-center text-sm">
            <span className="text-muted-foreground">Total Debit:</span>
            <span className="font-medium text-red-600 dark:text-red-400">
              {formatCurrency(periodData.total_debit)}
            </span>
          </div>
        </div>
      </CardContent>
    </Card>
  );
} 