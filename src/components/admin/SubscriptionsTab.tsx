import { useState } from 'react';
import { useSubscriptionPlans, useMemberSubscriptions } from '@/hooks/useAdminData';
import { supabase } from '@/integrations/supabase/client';
import { useQueryClient } from '@tanstack/react-query';
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card';
import { Button } from '@/components/ui/button';
import { Input } from '@/components/ui/input';
import { Label } from '@/components/ui/label';
import { Textarea } from '@/components/ui/textarea';
import { Dialog, DialogContent, DialogHeader, DialogTitle, DialogTrigger } from '@/components/ui/dialog';
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from '@/components/ui/select';
import { Badge } from '@/components/ui/badge';
import { Tooltip, TooltipContent, TooltipTrigger } from '@/components/ui/tooltip';
import { Plus, CreditCard, Trash2 } from 'lucide-react';
import { toast } from 'sonner';
import { format } from 'date-fns';

export default function SubscriptionsTab() {
  const { data: plans } = useSubscriptionPlans();
  const { data: subs } = useMemberSubscriptions();
  const qc = useQueryClient();
  const [openPlan, setOpenPlan] = useState(false);
  const [openAssign, setOpenAssign] = useState(false);

  return (
    <div className="grid grid-cols-1 lg:grid-cols-2 gap-4 mt-4">
      <Card>
        <CardHeader className="flex flex-row items-center justify-between">
          <CardTitle className="text-base">Plans</CardTitle>
          <Dialog open={openPlan} onOpenChange={setOpenPlan}>
            <DialogTrigger asChild><Button size="sm" variant="outline" className="gap-1"><Plus className="h-3.5 w-3.5" /> New plan</Button></DialogTrigger>
            <PlanDialog onClose={() => { setOpenPlan(false); qc.invalidateQueries({ queryKey: ['subscription-plans'] }); }} />
          </Dialog>
        </CardHeader>
        <CardContent className="space-y-2">
          {!plans?.length ? <p className="text-sm text-muted-foreground">No plans defined.</p> :
            plans.map((p) => (
              <div key={p.id} className="flex items-center justify-between p-3 border rounded-lg">
                <div>
                  <p className="font-medium text-sm">{p.name}</p>
                  <p className="text-xs text-muted-foreground">${Number(p.price).toFixed(2)} / {p.interval}</p>
                </div>
                <Badge variant={p.active ? 'default' : 'outline'}>{p.active ? 'Active' : 'Inactive'}</Badge>
              </div>
            ))
          }
        </CardContent>
      </Card>

      <Card>
        <CardHeader className="flex flex-row items-center justify-between">
          <CardTitle className="text-base">Member subscriptions</CardTitle>
          <Dialog open={openAssign} onOpenChange={setOpenAssign}>
            <DialogTrigger asChild><Button size="sm" variant="outline" className="gap-1"><Plus className="h-3.5 w-3.5" /> Assign plan</Button></DialogTrigger>
            <AssignDialog onClose={() => { setOpenAssign(false); qc.invalidateQueries({ queryKey: ['member-subscriptions'] }); }} />
          </Dialog>
        </CardHeader>
        <CardContent className="space-y-2">
          {!subs?.length ? <p className="text-sm text-muted-foreground">No subscriptions yet.</p> :
            subs.map((s: any) => (
              <div key={s.id} className="flex items-center justify-between p-3 border rounded-lg">
                <div className="min-w-0">
                  <p className="font-medium text-sm truncate">{s.subscription_plans?.name}</p>
                  <p className="text-xs text-muted-foreground truncate">User: {s.user_id.slice(0, 8)}… · Renews {s.current_period_end ? format(new Date(s.current_period_end), 'PP') : '—'}</p>
                </div>
                <div className="flex items-center gap-2 shrink-0">
                  <Badge variant={s.status === 'active' ? 'default' : 'outline'}>{s.status}</Badge>
                  <Tooltip>
                    <TooltipTrigger asChild>
                      <span><Button size="sm" variant="outline" disabled className="gap-1"><CreditCard className="h-3.5 w-3.5" /> Send link</Button></span>
                    </TooltipTrigger>
                    <TooltipContent>Payments coming soon</TooltipContent>
                  </Tooltip>
                  <Button size="icon" variant="ghost" className="h-8 w-8" onClick={async () => {
                    await supabase.from('member_subscriptions').delete().eq('id', s.id);
                    qc.invalidateQueries({ queryKey: ['member-subscriptions'] });
                    toast.success('Subscription removed.');
                  }}><Trash2 className="h-4 w-4" /></Button>
                </div>
              </div>
            ))
          }
        </CardContent>
      </Card>
    </div>
  );
}

function PlanDialog({ onClose }: { onClose: () => void }) {
  const [form, setForm] = useState({ name: '', description: '', price: '0', interval: 'month' });
  return (
    <DialogContent>
      <DialogHeader><DialogTitle>New subscription plan</DialogTitle></DialogHeader>
      <div className="space-y-3">
        <div><Label>Name</Label><Input value={form.name} maxLength={120} onChange={(e) => setForm({ ...form, name: e.target.value })} /></div>
        <div><Label>Description</Label><Textarea value={form.description} maxLength={500} onChange={(e) => setForm({ ...form, description: e.target.value })} /></div>
        <div className="grid grid-cols-2 gap-3">
          <div><Label>Price (USD)</Label><Input type="number" value={form.price} onChange={(e) => setForm({ ...form, price: e.target.value })} /></div>
          <div><Label>Interval</Label>
            <Select value={form.interval} onValueChange={(v) => setForm({ ...form, interval: v })}>
              <SelectTrigger><SelectValue /></SelectTrigger>
              <SelectContent>
                <SelectItem value="month">Monthly</SelectItem>
                <SelectItem value="year">Yearly</SelectItem>
                <SelectItem value="one_time">One-time</SelectItem>
              </SelectContent>
            </Select>
          </div>
        </div>
        <Button onClick={async () => {
          if (!form.name.trim()) { toast.error('Name required'); return; }
          const { error } = await supabase.from('subscription_plans').insert({ ...form, price: Number(form.price) });
          if (error) { toast.error(error.message); return; }
          toast.success('Plan created.');
          onClose();
        }}>Create plan</Button>
      </div>
    </DialogContent>
  );
}

function AssignDialog({ onClose }: { onClose: () => void }) {
  const { data: plans } = useSubscriptionPlans();
  const [planId, setPlanId] = useState('');
  const [userId, setUserId] = useState('');
  const [renewal, setRenewal] = useState('');
  return (
    <DialogContent>
      <DialogHeader><DialogTitle>Assign plan to member</DialogTitle></DialogHeader>
      <div className="space-y-3">
        <div><Label>Member ID</Label><Input value={userId} placeholder="user UUID" onChange={(e) => setUserId(e.target.value)} /></div>
        <div><Label>Plan</Label>
          <Select value={planId} onValueChange={setPlanId}>
            <SelectTrigger><SelectValue placeholder="Select a plan" /></SelectTrigger>
            <SelectContent>{plans?.map((p) => <SelectItem key={p.id} value={p.id}>{p.name}</SelectItem>)}</SelectContent>
          </Select>
        </div>
        <div><Label>Renewal date</Label><Input type="date" value={renewal} onChange={(e) => setRenewal(e.target.value)} /></div>
        <Button onClick={async () => {
          if (!planId || !userId) { toast.error('Member and plan required'); return; }
          const { error } = await supabase.from('member_subscriptions').insert({
            user_id: userId, plan_id: planId,
            current_period_end: renewal ? new Date(renewal).toISOString() : null,
          });
          if (error) { toast.error(error.message); return; }
          toast.success('Subscription assigned.');
          onClose();
        }}>Assign</Button>
      </div>
    </DialogContent>
  );
}
