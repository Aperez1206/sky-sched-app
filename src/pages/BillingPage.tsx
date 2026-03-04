import { Construction, CreditCard } from 'lucide-react';

export default function BillingPage() {
  return (
    <div className="flex flex-col h-full bg-background">
      <header className="flex items-center gap-3 bg-card px-5 py-3 shadow-sm" style={{ borderRadius: '0 0 14px 14px' }}>
        <div className="flex h-10 w-10 items-center justify-center rounded-lg bg-primary text-primary-foreground">
          <CreditCard className="h-5 w-5" />
        </div>
        <div>
          <h1 className="text-base font-bold leading-tight text-foreground">Billing</h1>
          <p className="text-xs text-muted-foreground">Invoices & Payments</p>
        </div>
      </header>

      <div className="flex-1 flex items-center justify-center">
        <div className="text-center space-y-3">
          <Construction className="h-16 w-16 text-muted-foreground mx-auto" />
          <h2 className="text-lg font-bold text-foreground">Under Construction</h2>
          <p className="text-sm text-muted-foreground max-w-xs">
            The billing module is currently being built. Check back soon for invoicing, payments, and account management.
          </p>
        </div>
      </div>
    </div>
  );
}
