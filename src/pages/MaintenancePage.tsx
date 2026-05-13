import { useMemo, useState, useEffect } from 'react';
import { LayoutDashboard, Plane, Boxes, Wrench, BarChart3, Play, Square, Clock, Search, AlertTriangle, Plus, CheckCircle2 } from 'lucide-react';
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card';
import { Badge } from '@/components/ui/badge';
import { Button } from '@/components/ui/button';
import { Input } from '@/components/ui/input';
import { Label } from '@/components/ui/label';
import { Textarea } from '@/components/ui/textarea';
import { Table, TableBody, TableCell, TableHead, TableHeader, TableRow } from '@/components/ui/table';
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from '@/components/ui/select';
import { Dialog, DialogContent, DialogFooter, DialogHeader, DialogTitle, DialogTrigger } from '@/components/ui/dialog';
import { useCurrentUser } from '@/hooks/useCurrentUser';
import {
  useAircraftMaintenance, useWorkOrders, useWorkOrderParts, useInventory,
  useActiveTimeLog, useTimeLogs, useClockIn, useClockOut,
  useCreateWorkOrder, useUpdateWorkOrderStatus, useAddWorkOrderPart, useUpsertInventoryPart,
  type AircraftMaintenance, type WorkOrder,
} from '@/hooks/useMaintenanceData';
import { toast } from 'sonner';
import { cn } from '@/lib/utils';

type Section = 'dashboard' | 'fleet' | 'inventory' | 'work_orders' | 'reports';

const NAV: { id: Section; label: string; icon: typeof LayoutDashboard }[] = [
  { id: 'dashboard', label: 'Dashboard', icon: LayoutDashboard },
  { id: 'fleet', label: 'Fleet', icon: Plane },
  { id: 'inventory', label: 'Inventory', icon: Boxes },
  { id: 'work_orders', label: 'Work Orders', icon: Wrench },
  { id: 'reports', label: 'Reports', icon: BarChart3 },
];

function statusBadge(status: string) {
  const map: Record<string, { label: string; cls: string }> = {
    airworthy: { label: 'Airworthy', cls: 'bg-emerald-100 text-emerald-700 border-emerald-200' },
    aog: { label: 'AOG', cls: 'bg-red-100 text-red-700 border-red-200' },
    maintenance: { label: 'In Maintenance', cls: 'bg-amber-100 text-amber-700 border-amber-200' },
    inspection_due: { label: 'Inspection Due', cls: 'bg-orange-100 text-orange-700 border-orange-200' },
  };
  const m = map[status] ?? { label: status, cls: 'bg-slate-100 text-slate-700 border-slate-200' };
  return <Badge variant="outline" className={cn('font-semibold', m.cls)}>{m.label}</Badge>;
}

function woStatusBadge(status: string) {
  const map: Record<string, string> = {
    open: 'bg-blue-100 text-blue-700 border-blue-200',
    in_progress: 'bg-amber-100 text-amber-700 border-amber-200',
    completed: 'bg-emerald-100 text-emerald-700 border-emerald-200',
    cancelled: 'bg-slate-100 text-slate-600 border-slate-200',
  };
  return <Badge variant="outline" className={cn('font-medium capitalize', map[status] ?? '')}>{status.replace('_', ' ')}</Badge>;
}

function GlobalTimer() {
  const { user } = useCurrentUser();
  const userId = user?.id;
  const { data: active } = useActiveTimeLog(userId);
  const clockIn = useClockIn();
  const clockOut = useClockOut();
  const [task, setTask] = useState('');
  const [now, setNow] = useState(Date.now());

  useEffect(() => {
    if (!active) return;
    const t = setInterval(() => setNow(Date.now()), 1000);
    return () => clearInterval(t);
  }, [active]);

  const elapsed = useMemo(() => {
    if (!active) return '00:00:00';
    const ms = now - new Date(active.clock_in).getTime();
    const h = Math.floor(ms / 3600000).toString().padStart(2, '0');
    const m = Math.floor((ms % 3600000) / 60000).toString().padStart(2, '0');
    const s = Math.floor((ms % 60000) / 1000).toString().padStart(2, '0');
    return `${h}:${m}:${s}`;
  }, [active, now]);

  const handleStart = () => {
    if (!userId) { toast.error('Sign in to use the timer'); return; }
    if (!task.trim()) { toast.error('Enter a task name'); return; }
    clockIn.mutate({ user_id: userId, task_label: task.trim() }, {
      onSuccess: () => { setTask(''); toast.success('Clocked in'); },
      onError: (e: Error) => toast.error(e.message),
    });
  };

  const handleStop = () => {
    if (!active) return;
    clockOut.mutate(active.id, { onSuccess: () => toast.success('Clocked out') });
  };

  return (
    <Card className="rounded-2xl border-slate-200">
      <CardContent className="p-4 flex items-center gap-4">
        <div className="flex items-center gap-3">
          <div className={cn(
            'h-10 w-10 rounded-xl flex items-center justify-center',
            active ? 'bg-emerald-100 text-emerald-700' : 'bg-slate-100 text-slate-500'
          )}>
            <Clock className="h-5 w-5" />
          </div>
          <div>
            <div className="text-xs text-muted-foreground">Global Timer</div>
            <div className="font-mono text-xl font-semibold tabular-nums">{elapsed}</div>
          </div>
        </div>
        <div className="flex-1 min-w-0">
          {active ? (
            <div className="text-sm">
              <div className="text-muted-foreground">Tracking</div>
              <div className="font-medium truncate">{active.task_label || 'Task'}</div>
            </div>
          ) : (
            <Input
              value={task}
              onChange={(e) => setTask(e.target.value)}
              placeholder="What are you working on?"
              className="rounded-xl"
            />
          )}
        </div>
        {active ? (
          <Button onClick={handleStop} variant="destructive" className="rounded-xl">
            <Square className="h-4 w-4 mr-2" /> Clock Out
          </Button>
        ) : (
          <Button onClick={handleStart} className="rounded-xl">
            <Play className="h-4 w-4 mr-2" /> Clock In
          </Button>
        )}
      </CardContent>
    </Card>
  );
}

function CountdownPill({ aircraft }: { aircraft: AircraftMaintenance }) {
  const hoursLeft = aircraft.next_inspection_hobbs != null && aircraft.current_hobbs != null
    ? aircraft.next_inspection_hobbs - aircraft.current_hobbs
    : null;
  const daysLeft = aircraft.next_inspection_date
    ? Math.ceil((new Date(aircraft.next_inspection_date).getTime() - Date.now()) / 86400000)
    : null;
  const overdue = (hoursLeft != null && hoursLeft <= 0) || (daysLeft != null && daysLeft < 0);
  const warning = (hoursLeft != null && hoursLeft <= 10) || (daysLeft != null && daysLeft <= 7);
  const tone = overdue ? 'bg-red-50 text-red-700 ring-red-200'
    : warning ? 'bg-orange-50 text-orange-700 ring-orange-200'
    : 'bg-emerald-50 text-emerald-700 ring-emerald-200';

  return (
    <div className={cn('rounded-xl px-3 py-2 ring-1 text-sm', tone)}>
      <div className="text-xs uppercase tracking-wide opacity-70">Next Maintenance</div>
      <div className="font-semibold tabular-nums">
        {hoursLeft != null ? `${hoursLeft.toFixed(1)} hrs` : '—'}
        {' • '}
        {daysLeft != null ? `${daysLeft} days` : '—'}
      </div>
    </div>
  );
}

function AircraftCard({ a }: { a: AircraftMaintenance }) {
  return (
    <Card className="rounded-2xl border-slate-200 hover:shadow-md transition-shadow">
      <CardHeader className="pb-3">
        <div className="flex items-start justify-between gap-2">
          <div>
            <CardTitle className="text-lg font-bold">{a.aircraft_tail}</CardTitle>
            <div className="text-xs text-muted-foreground mt-0.5">Cessna 182R</div>
          </div>
          {statusBadge(a.airworthy_status)}
        </div>
      </CardHeader>
      <CardContent className="space-y-3">
        <div className="grid grid-cols-2 gap-2">
          <div className="rounded-xl bg-slate-50 p-3">
            <div className="text-xs text-muted-foreground">Hobbs</div>
            <div className="font-mono text-lg font-semibold tabular-nums">{a.current_hobbs?.toFixed(1) ?? '—'}</div>
          </div>
          <div className="rounded-xl bg-slate-50 p-3">
            <div className="text-xs text-muted-foreground">Tach</div>
            <div className="font-mono text-lg font-semibold tabular-nums">{a.current_tach?.toFixed(1) ?? '—'}</div>
          </div>
        </div>
        <CountdownPill aircraft={a} />
      </CardContent>
    </Card>
  );
}

function DashboardSection() {
  const { data: fleet } = useAircraftMaintenance();
  const { data: workOrders } = useWorkOrders();
  const { data: inventory } = useInventory();

  const aogCount = fleet?.filter(f => f.airworthy_status === 'aog').length ?? 0;
  const dueCount = fleet?.filter(f => f.airworthy_status === 'inspection_due').length ?? 0;
  const openWO = workOrders?.filter(w => w.status === 'open' || w.status === 'in_progress').length ?? 0;
  const lowStock = inventory?.filter(i => i.quantity <= i.min_quantity).length ?? 0;

  const stats = [
    { label: 'AOG Aircraft', value: aogCount, icon: AlertTriangle, tone: 'text-red-600 bg-red-50' },
    { label: 'Inspections Due', value: dueCount, icon: Clock, tone: 'text-orange-600 bg-orange-50' },
    { label: 'Open Work Orders', value: openWO, icon: Wrench, tone: 'text-blue-600 bg-blue-50' },
    { label: 'Low Stock Items', value: lowStock, icon: Boxes, tone: 'text-amber-600 bg-amber-50' },
  ];

  return (
    <div className="space-y-6">
      <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-4 gap-4">
        {stats.map(s => (
          <Card key={s.label} className="rounded-2xl border-slate-200">
            <CardContent className="p-5 flex items-center gap-4">
              <div className={cn('h-12 w-12 rounded-xl flex items-center justify-center', s.tone)}>
                <s.icon className="h-6 w-6" />
              </div>
              <div>
                <div className="text-2xl font-bold tabular-nums">{s.value}</div>
                <div className="text-xs text-muted-foreground">{s.label}</div>
              </div>
            </CardContent>
          </Card>
        ))}
      </div>

      <div>
        <h3 className="text-sm font-semibold text-muted-foreground uppercase tracking-wide mb-3">Aircraft Status</h3>
        <div className="grid grid-cols-1 md:grid-cols-2 xl:grid-cols-3 gap-4">
          {fleet?.map(a => <AircraftCard key={a.id} a={a} />)}
        </div>
      </div>
    </div>
  );
}

function FleetSection() {
  const { data: fleet } = useAircraftMaintenance();
  return (
    <div className="grid grid-cols-1 md:grid-cols-2 xl:grid-cols-3 gap-4">
      {fleet?.map(a => <AircraftCard key={a.id} a={a} />)}
    </div>
  );
}

function InventorySection() {
  const { data: inventory } = useInventory();
  const upsert = useUpsertInventoryPart();
  const [search, setSearch] = useState('');
  const [open, setOpen] = useState(false);
  const [form, setForm] = useState({ part_number: '', description: '', quantity: 0, min_quantity: 1, condition: 'new', location: '', expires_at: '' });

  const filtered = useMemo(() => {
    const q = search.toLowerCase();
    return inventory?.filter(i =>
      i.part_number.toLowerCase().includes(q) ||
      i.description.toLowerCase().includes(q) ||
      (i.location ?? '').toLowerCase().includes(q)
    ) ?? [];
  }, [inventory, search]);

  const handleAdd = () => {
    if (!form.part_number || !form.description) { toast.error('Part number and description required'); return; }
    upsert.mutate({
      part_number: form.part_number,
      description: form.description,
      quantity: Number(form.quantity),
      min_quantity: Number(form.min_quantity),
      condition: form.condition,
      location: form.location || null,
      expires_at: form.expires_at || null,
    } as never, {
      onSuccess: () => { toast.success('Part added'); setOpen(false); setForm({ part_number: '', description: '', quantity: 0, min_quantity: 1, condition: 'new', location: '', expires_at: '' }); },
      onError: (e: Error) => toast.error(e.message),
    });
  };

  return (
    <Card className="rounded-2xl border-slate-200">
      <CardHeader className="flex flex-row items-center justify-between gap-3">
        <div className="flex-1 max-w-md relative">
          <Search className="h-4 w-4 absolute left-3 top-1/2 -translate-y-1/2 text-muted-foreground" />
          <Input value={search} onChange={(e) => setSearch(e.target.value)} placeholder="Search parts, descriptions, locations…" className="pl-9 rounded-xl" />
        </div>
        <Dialog open={open} onOpenChange={setOpen}>
          <DialogTrigger asChild>
            <Button className="rounded-xl"><Plus className="h-4 w-4 mr-2" /> Add Part</Button>
          </DialogTrigger>
          <DialogContent>
            <DialogHeader><DialogTitle>Add Inventory Part</DialogTitle></DialogHeader>
            <div className="grid grid-cols-2 gap-3">
              <div className="col-span-2"><Label>Part Number</Label><Input value={form.part_number} onChange={(e) => setForm({ ...form, part_number: e.target.value })} /></div>
              <div className="col-span-2"><Label>Description</Label><Input value={form.description} onChange={(e) => setForm({ ...form, description: e.target.value })} /></div>
              <div><Label>Quantity</Label><Input type="number" value={form.quantity} onChange={(e) => setForm({ ...form, quantity: Number(e.target.value) })} /></div>
              <div><Label>Min Quantity</Label><Input type="number" value={form.min_quantity} onChange={(e) => setForm({ ...form, min_quantity: Number(e.target.value) })} /></div>
              <div>
                <Label>Condition</Label>
                <Select value={form.condition} onValueChange={(v) => setForm({ ...form, condition: v })}>
                  <SelectTrigger><SelectValue /></SelectTrigger>
                  <SelectContent>
                    <SelectItem value="new">New</SelectItem>
                    <SelectItem value="serviceable">Serviceable</SelectItem>
                    <SelectItem value="overhauled">Overhauled</SelectItem>
                    <SelectItem value="repair">Needs Repair</SelectItem>
                    <SelectItem value="scrap">Scrap</SelectItem>
                  </SelectContent>
                </Select>
              </div>
              <div><Label>Location</Label><Input value={form.location} onChange={(e) => setForm({ ...form, location: e.target.value })} /></div>
              <div className="col-span-2"><Label>Expires</Label><Input type="date" value={form.expires_at} onChange={(e) => setForm({ ...form, expires_at: e.target.value })} /></div>
            </div>
            <DialogFooter><Button onClick={handleAdd}>Save</Button></DialogFooter>
          </DialogContent>
        </Dialog>
      </CardHeader>
      <CardContent>
        <Table>
          <TableHeader>
            <TableRow>
              <TableHead>Part Number</TableHead>
              <TableHead>Description</TableHead>
              <TableHead className="text-right">Qty</TableHead>
              <TableHead>Condition</TableHead>
              <TableHead>Location</TableHead>
              <TableHead>Expires</TableHead>
              <TableHead>Alerts</TableHead>
            </TableRow>
          </TableHeader>
          <TableBody>
            {filtered.map(p => {
              const low = p.quantity <= p.min_quantity;
              const expSoon = p.expires_at && (new Date(p.expires_at).getTime() - Date.now()) / 86400000 <= 30;
              return (
                <TableRow key={p.id}>
                  <TableCell className="font-mono font-semibold">{p.part_number}</TableCell>
                  <TableCell>{p.description}</TableCell>
                  <TableCell className="text-right font-mono tabular-nums">{p.quantity}</TableCell>
                  <TableCell><Badge variant="outline" className="capitalize">{p.condition}</Badge></TableCell>
                  <TableCell>{p.location ?? '—'}</TableCell>
                  <TableCell>{p.expires_at ?? '—'}</TableCell>
                  <TableCell className="space-x-1">
                    {low && <Badge className="bg-red-100 text-red-700 hover:bg-red-100 border-red-200" variant="outline">Low Stock</Badge>}
                    {expSoon && <Badge className="bg-orange-100 text-orange-700 hover:bg-orange-100 border-orange-200" variant="outline">Expiring</Badge>}
                  </TableCell>
                </TableRow>
              );
            })}
            {filtered.length === 0 && (
              <TableRow><TableCell colSpan={7} className="text-center text-muted-foreground py-8">No parts found</TableCell></TableRow>
            )}
          </TableBody>
        </Table>
      </CardContent>
    </Card>
  );
}

function WorkOrdersSection() {
  const { data: workOrders } = useWorkOrders();
  const { data: parts } = useWorkOrderParts();
  const { data: fleet } = useAircraftMaintenance();
  const create = useCreateWorkOrder();
  const setStatus = useUpdateWorkOrderStatus();
  const addPart = useAddWorkOrderPart();

  const [selectedId, setSelectedId] = useState<string | null>(null);
  const selected = workOrders?.find(w => w.id === selectedId) ?? workOrders?.[0] ?? null;
  const woParts = useMemo(() => parts?.filter(p => p.work_order_id === selected?.id) ?? [], [parts, selected]);

  const [createOpen, setCreateOpen] = useState(false);
  const [woForm, setWoForm] = useState({ aircraft_tail: '', title: '', description: '', hobbs_at_open: '' });

  const [partOpen, setPartOpen] = useState(false);
  const [partForm, setPartForm] = useState({ part_number: '', serial_number: '', description: '', action: 'add' as 'add' | 'remove', meter_hobbs: '', meter_tach: '' });

  const handleCreate = () => {
    if (!woForm.aircraft_tail || !woForm.title) { toast.error('Aircraft and title required'); return; }
    create.mutate({
      aircraft_tail: woForm.aircraft_tail,
      title: woForm.title,
      description: woForm.description || undefined,
      hobbs_at_open: woForm.hobbs_at_open ? Number(woForm.hobbs_at_open) : null,
    }, {
      onSuccess: () => { toast.success('Work order created'); setCreateOpen(false); setWoForm({ aircraft_tail: '', title: '', description: '', hobbs_at_open: '' }); },
      onError: (e: Error) => toast.error(e.message),
    });
  };

  const handleAddPart = () => {
    if (!selected) return;
    if (!partForm.part_number) { toast.error('Part number required'); return; }
    addPart.mutate({
      work_order_id: selected.id,
      part_number: partForm.part_number,
      serial_number: partForm.serial_number || null,
      description: partForm.description || null,
      action: partForm.action,
      meter_hobbs: partForm.meter_hobbs ? Number(partForm.meter_hobbs) : null,
      meter_tach: partForm.meter_tach ? Number(partForm.meter_tach) : null,
    }, {
      onSuccess: () => { toast.success('Part recorded'); setPartOpen(false); setPartForm({ part_number: '', serial_number: '', description: '', action: 'add', meter_hobbs: '', meter_tach: '' }); },
      onError: (e: Error) => toast.error(e.message),
    });
  };

  return (
    <div className="grid grid-cols-1 lg:grid-cols-3 gap-4">
      <Card className="rounded-2xl border-slate-200 lg:col-span-1">
        <CardHeader className="flex flex-row items-center justify-between">
          <CardTitle className="text-base">Work Orders</CardTitle>
          <Dialog open={createOpen} onOpenChange={setCreateOpen}>
            <DialogTrigger asChild>
              <Button size="sm" className="rounded-xl"><Plus className="h-4 w-4 mr-1" /> New</Button>
            </DialogTrigger>
            <DialogContent>
              <DialogHeader><DialogTitle>New Work Order</DialogTitle></DialogHeader>
              <div className="space-y-3">
                <div>
                  <Label>Aircraft</Label>
                  <Select value={woForm.aircraft_tail} onValueChange={(v) => setWoForm({ ...woForm, aircraft_tail: v })}>
                    <SelectTrigger><SelectValue placeholder="Select aircraft" /></SelectTrigger>
                    <SelectContent>
                      {fleet?.map(a => <SelectItem key={a.aircraft_tail} value={a.aircraft_tail}>{a.aircraft_tail}</SelectItem>)}
                    </SelectContent>
                  </Select>
                </div>
                <div><Label>Title</Label><Input value={woForm.title} onChange={(e) => setWoForm({ ...woForm, title: e.target.value })} /></div>
                <div><Label>Description</Label><Textarea value={woForm.description} onChange={(e) => setWoForm({ ...woForm, description: e.target.value })} /></div>
                <div><Label>Hobbs at Open</Label><Input type="number" step="0.1" value={woForm.hobbs_at_open} onChange={(e) => setWoForm({ ...woForm, hobbs_at_open: e.target.value })} /></div>
              </div>
              <DialogFooter><Button onClick={handleCreate}>Create</Button></DialogFooter>
            </DialogContent>
          </Dialog>
        </CardHeader>
        <CardContent className="space-y-2 max-h-[60vh] overflow-y-auto">
          {workOrders?.length ? workOrders.map(w => (
            <button
              key={w.id}
              onClick={() => setSelectedId(w.id)}
              className={cn(
                'w-full text-left rounded-xl border p-3 transition-colors',
                (selected?.id === w.id) ? 'border-primary bg-slate-50' : 'border-slate-200 hover:bg-slate-50'
              )}
            >
              <div className="flex items-center justify-between">
                <div className="font-mono text-xs text-muted-foreground">{w.wo_number}</div>
                {woStatusBadge(w.status)}
              </div>
              <div className="font-semibold mt-1 truncate">{w.title}</div>
              <div className="text-xs text-muted-foreground mt-0.5">{w.aircraft_tail}</div>
            </button>
          )) : (
            <div className="text-sm text-muted-foreground text-center py-6">No work orders yet</div>
          )}
        </CardContent>
      </Card>

      <Card className="rounded-2xl border-slate-200 lg:col-span-2">
        {selected ? (
          <>
            <CardHeader className="flex flex-row items-start justify-between gap-3">
              <div>
                <div className="flex items-center gap-2">
                  <span className="font-mono text-xs text-muted-foreground">{selected.wo_number}</span>
                  {woStatusBadge(selected.status)}
                </div>
                <CardTitle className="text-lg mt-1">{selected.title}</CardTitle>
                <div className="text-sm text-muted-foreground mt-1">
                  {selected.aircraft_tail} · Opened {new Date(selected.opened_at).toLocaleDateString()}
                  {selected.hobbs_at_open != null && ` · Hobbs ${selected.hobbs_at_open.toFixed(1)}`}
                </div>
              </div>
              <div className="flex gap-2">
                {selected.status !== 'completed' && (
                  <>
                    <Select value={selected.status} onValueChange={(v) => setStatus.mutate({ id: selected.id, status: v })}>
                      <SelectTrigger className="w-[150px] rounded-xl"><SelectValue /></SelectTrigger>
                      <SelectContent>
                        <SelectItem value="open">Open</SelectItem>
                        <SelectItem value="in_progress">In Progress</SelectItem>
                        <SelectItem value="completed">Completed</SelectItem>
                        <SelectItem value="cancelled">Cancelled</SelectItem>
                      </SelectContent>
                    </Select>
                  </>
                )}
                {selected.status === 'completed' && (
                  <Badge className="bg-emerald-100 text-emerald-700 border-emerald-200" variant="outline">
                    <CheckCircle2 className="h-3.5 w-3.5 mr-1" /> Closed
                  </Badge>
                )}
              </div>
            </CardHeader>
            <CardContent className="space-y-4">
              {selected.description && <p className="text-sm">{selected.description}</p>}
              <div className="flex items-center justify-between">
                <h4 className="text-sm font-semibold">Parts Log</h4>
                <Dialog open={partOpen} onOpenChange={setPartOpen}>
                  <DialogTrigger asChild>
                    <Button size="sm" variant="outline" className="rounded-xl"><Plus className="h-4 w-4 mr-1" /> Record Part</Button>
                  </DialogTrigger>
                  <DialogContent>
                    <DialogHeader><DialogTitle>Record Part Action</DialogTitle></DialogHeader>
                    <div className="grid grid-cols-2 gap-3">
                      <div><Label>Part Number</Label><Input value={partForm.part_number} onChange={(e) => setPartForm({ ...partForm, part_number: e.target.value })} /></div>
                      <div><Label>Serial Number</Label><Input value={partForm.serial_number} onChange={(e) => setPartForm({ ...partForm, serial_number: e.target.value })} /></div>
                      <div className="col-span-2"><Label>Description</Label><Input value={partForm.description} onChange={(e) => setPartForm({ ...partForm, description: e.target.value })} /></div>
                      <div>
                        <Label>Action</Label>
                        <Select value={partForm.action} onValueChange={(v: 'add' | 'remove') => setPartForm({ ...partForm, action: v })}>
                          <SelectTrigger><SelectValue /></SelectTrigger>
                          <SelectContent>
                            <SelectItem value="add">Add (Install)</SelectItem>
                            <SelectItem value="remove">Remove</SelectItem>
                          </SelectContent>
                        </Select>
                      </div>
                      <div><Label>Meter Hobbs</Label><Input type="number" step="0.1" value={partForm.meter_hobbs} onChange={(e) => setPartForm({ ...partForm, meter_hobbs: e.target.value })} /></div>
                      <div><Label>Meter Tach</Label><Input type="number" step="0.1" value={partForm.meter_tach} onChange={(e) => setPartForm({ ...partForm, meter_tach: e.target.value })} /></div>
                    </div>
                    <DialogFooter><Button onClick={handleAddPart}>Save</Button></DialogFooter>
                  </DialogContent>
                </Dialog>
              </div>
              <Table>
                <TableHeader>
                  <TableRow>
                    <TableHead>Part Number</TableHead>
                    <TableHead>Serial</TableHead>
                    <TableHead>WO ID</TableHead>
                    <TableHead>Action</TableHead>
                    <TableHead className="text-right">Hobbs</TableHead>
                    <TableHead className="text-right">Tach</TableHead>
                  </TableRow>
                </TableHeader>
                <TableBody>
                  {woParts.map(p => (
                    <TableRow key={p.id}>
                      <TableCell className="font-mono font-semibold">{p.part_number}</TableCell>
                      <TableCell className="font-mono">{p.serial_number ?? '—'}</TableCell>
                      <TableCell className="font-mono text-xs">{selected.wo_number}</TableCell>
                      <TableCell>
                        <Badge variant="outline" className={p.action === 'add'
                          ? 'bg-emerald-100 text-emerald-700 border-emerald-200'
                          : 'bg-red-100 text-red-700 border-red-200'}>
                          {p.action === 'add' ? 'Add' : 'Remove'}
                        </Badge>
                      </TableCell>
                      <TableCell className="text-right font-mono tabular-nums">{p.meter_hobbs?.toFixed(1) ?? '—'}</TableCell>
                      <TableCell className="text-right font-mono tabular-nums">{p.meter_tach?.toFixed(1) ?? '—'}</TableCell>
                    </TableRow>
                  ))}
                  {woParts.length === 0 && (
                    <TableRow><TableCell colSpan={6} className="text-center text-muted-foreground py-6">No parts logged yet</TableCell></TableRow>
                  )}
                </TableBody>
              </Table>
            </CardContent>
          </>
        ) : (
          <CardContent className="py-12 text-center text-muted-foreground">Select or create a work order</CardContent>
        )}
      </Card>
    </div>
  );
}

function ReportsSection() {
  const { data: workOrders } = useWorkOrders();
  const { data: parts } = useWorkOrderParts();
  const { data: logs } = useTimeLogs();

  const completed = workOrders?.filter(w => w.status === 'completed').length ?? 0;
  const totalParts = parts?.length ?? 0;
  const totalLaborHours = logs?.reduce((acc, l) => {
    if (!l.clock_out) return acc;
    return acc + (new Date(l.clock_out).getTime() - new Date(l.clock_in).getTime()) / 3600000;
  }, 0) ?? 0;

  return (
    <div className="grid grid-cols-1 md:grid-cols-3 gap-4">
      <Card className="rounded-2xl border-slate-200">
        <CardHeader><CardTitle className="text-sm text-muted-foreground">Completed Work Orders</CardTitle></CardHeader>
        <CardContent><div className="text-3xl font-bold tabular-nums">{completed}</div></CardContent>
      </Card>
      <Card className="rounded-2xl border-slate-200">
        <CardHeader><CardTitle className="text-sm text-muted-foreground">Parts Transactions</CardTitle></CardHeader>
        <CardContent><div className="text-3xl font-bold tabular-nums">{totalParts}</div></CardContent>
      </Card>
      <Card className="rounded-2xl border-slate-200">
        <CardHeader><CardTitle className="text-sm text-muted-foreground">Total Labor Hours</CardTitle></CardHeader>
        <CardContent><div className="text-3xl font-bold tabular-nums">{totalLaborHours.toFixed(1)}</div></CardContent>
      </Card>

      <Card className="rounded-2xl border-slate-200 md:col-span-3">
        <CardHeader><CardTitle className="text-base">Recent Labor Logs</CardTitle></CardHeader>
        <CardContent>
          <Table>
            <TableHeader>
              <TableRow>
                <TableHead>Task</TableHead>
                <TableHead>Clock In</TableHead>
                <TableHead>Clock Out</TableHead>
                <TableHead className="text-right">Duration</TableHead>
              </TableRow>
            </TableHeader>
            <TableBody>
              {logs?.slice(0, 20).map(l => {
                const dur = l.clock_out ? ((new Date(l.clock_out).getTime() - new Date(l.clock_in).getTime()) / 3600000).toFixed(2) : '—';
                return (
                  <TableRow key={l.id}>
                    <TableCell>{l.task_label || '—'}</TableCell>
                    <TableCell>{new Date(l.clock_in).toLocaleString()}</TableCell>
                    <TableCell>{l.clock_out ? new Date(l.clock_out).toLocaleString() : 'Active'}</TableCell>
                    <TableCell className="text-right font-mono tabular-nums">{dur} h</TableCell>
                  </TableRow>
                );
              })}
              {!logs?.length && <TableRow><TableCell colSpan={4} className="text-center text-muted-foreground py-6">No logs yet</TableCell></TableRow>}
            </TableBody>
          </Table>
        </CardContent>
      </Card>
    </div>
  );
}

export default function MaintenancePage() {
  const [section, setSection] = useState<Section>('dashboard');
  const { user, loading } = useCurrentUser();

  // Role gate: admin or maintenance. Allow when auth is disabled (no user).
  const allowed = !user || user.role === 'admin' || user.role === 'maintenance';

  if (loading) return <div className="p-6">Loading…</div>;
  if (!allowed) {
    return (
      <div className="p-8 text-center">
        <h2 className="text-xl font-semibold">Access restricted</h2>
        <p className="text-muted-foreground mt-2">The Maintenance Hub is for maintenance staff and administrators.</p>
      </div>
    );
  }

  return (
    <div className="h-full flex bg-slate-100">
      {/* Internal sub-sidebar */}
      <aside className="w-56 shrink-0 border-r border-slate-200 bg-white p-3 flex flex-col gap-1">
        <div className="px-2 py-3">
          <div className="text-xs uppercase tracking-wider text-muted-foreground">Aircraft</div>
          <div className="font-bold text-base">Maintenance Hub</div>
        </div>
        {NAV.map(n => (
          <button
            key={n.id}
            onClick={() => setSection(n.id)}
            className={cn(
              'flex items-center gap-2 px-3 py-2 rounded-xl text-sm font-medium transition-colors',
              section === n.id ? 'bg-slate-900 text-white' : 'text-slate-600 hover:bg-slate-100'
            )}
          >
            <n.icon className="h-4 w-4" />
            {n.label}
          </button>
        ))}
      </aside>

      {/* Main */}
      <main className="flex-1 min-w-0 overflow-y-auto">
        <div className="max-w-[1400px] mx-auto p-6 space-y-5">
          <div className="flex items-center justify-between gap-4">
            <div>
              <h1 className="text-2xl font-bold">{NAV.find(n => n.id === section)?.label}</h1>
              <p className="text-sm text-muted-foreground">Digital Hangar — every part tracked, every minute logged.</p>
            </div>
          </div>
          <GlobalTimer />
          {section === 'dashboard' && <DashboardSection />}
          {section === 'fleet' && <FleetSection />}
          {section === 'inventory' && <InventorySection />}
          {section === 'work_orders' && <WorkOrdersSection />}
          {section === 'reports' && <ReportsSection />}
        </div>
      </main>
    </div>
  );
}
