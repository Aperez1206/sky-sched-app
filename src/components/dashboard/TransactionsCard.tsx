import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card';
import { ArrowDownLeft, ArrowUpRight } from 'lucide-react';
import { useTransactions } from '@/hooks/useAccountData';
import { format } from 'date-fns';

interface TransactionsCardProps {
  userId: string;
}

export default function TransactionsCard({ userId }: TransactionsCardProps) {
  const { data: transactions, isLoading } = useTransactions(userId);

  return (
    <Card>
      <CardHeader className="pb-2">
        <CardTitle className="text-sm font-medium">Recent Transactions</CardTitle>
      </CardHeader>
      <CardContent>
        {isLoading ? (
          <p className="text-sm text-muted-foreground">Loading…</p>
        ) : !transactions?.length ? (
          <p className="text-sm text-muted-foreground">No transactions yet.</p>
        ) : (
          <div className="space-y-3">
            {transactions.slice(0, 5).map((t) => {
              const amt = Number(t.amount);
              const isCredit = amt > 0;
              return (
                <div key={t.id} className="flex items-center justify-between text-sm">
                  <div className="flex items-center gap-2">
                    {isCredit ? (
                      <ArrowDownLeft className="h-3.5 w-3.5 text-green-600" />
                    ) : (
                      <ArrowUpRight className="h-3.5 w-3.5 text-destructive" />
                    )}
                    <div>
                      <p className="font-medium leading-tight">{t.description}</p>
                      <p className="text-xs text-muted-foreground">
                        {t.created_at ? format(new Date(t.created_at), 'MMM d, yyyy') : '—'}
                      </p>
                    </div>
                  </div>
                  <span className={`font-mono font-semibold ${isCredit ? 'text-green-600' : 'text-destructive'}`}>
                    {isCredit ? '+' : ''}${amt.toFixed(2)}
                  </span>
                </div>
              );
            })}
          </div>
        )}
      </CardContent>
    </Card>
  );
}
