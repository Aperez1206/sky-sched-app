import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card';
import { Button } from '@/components/ui/button';
import { DollarSign, Plus } from 'lucide-react';
import { useBalance } from '@/hooks/useAccountData';

interface BalanceCardProps {
  userId: string;
  isOwnDashboard?: boolean;
}

export default function BalanceCard({ userId, isOwnDashboard }: BalanceCardProps) {
  const { data: balance, isLoading } = useBalance(userId);

  return (
    <Card>
      <CardHeader className="flex flex-row items-center justify-between pb-2">
        <CardTitle className="text-sm font-medium">Account Balance</CardTitle>
        <DollarSign className="h-4 w-4 text-muted-foreground" />
      </CardHeader>
      <CardContent>
        <div className="text-2xl font-bold">
          {isLoading ? '—' : `$${(balance ?? 0).toFixed(2)}`}
        </div>
        <p className="text-xs text-muted-foreground mt-1">
          {(balance ?? 0) >= 0 ? 'Available balance' : 'Outstanding balance'}
        </p>
        {isOwnDashboard && (
          <Button size="sm" className="mt-3 gap-1" variant="outline" disabled>
            <Plus className="h-3.5 w-3.5" /> Add Funds
          </Button>
        )}
      </CardContent>
    </Card>
  );
}
