import { Table, TableHeader, TableBody, TableRow, TableHead, TableCell } from '@/components/ui/table';
import { Badge } from '@/components/ui/badge';
import { AIRCRAFT } from '@/data/aeroplan';
import { Plane } from 'lucide-react';

const statusStyles: Record<string, string> = {
  flying: 'bg-sky-100 text-sky-700 border-sky-200',
  ground: 'bg-emerald-100 text-emerald-700 border-emerald-200',
  maintenance: 'bg-amber-100 text-amber-700 border-amber-200',
  refueling: 'bg-violet-100 text-violet-700 border-violet-200',
};

export default function AircraftPage() {
  return (
    <div className="flex flex-col h-screen bg-background">
      <header className="flex items-center gap-3 bg-card px-5 py-3 shadow-sm" style={{ borderRadius: '0 0 14px 14px' }}>
        <div className="flex h-10 w-10 items-center justify-center rounded-lg bg-primary text-primary-foreground">
          <Plane className="h-5 w-5" />
        </div>
        <div>
          <h1 className="text-base font-bold leading-tight text-foreground">Aircraft</h1>
          <p className="text-xs text-muted-foreground">Fleet overview</p>
        </div>
      </header>

      <div className="flex-1 mx-3 mt-2 mb-1">
        <div className="bg-card rounded-xl shadow-sm p-4 h-full overflow-auto">
          <Table>
            <TableHeader>
              <TableRow>
                <TableHead>Tail Number</TableHead>
                <TableHead>Model</TableHead>
                <TableHead>Status</TableHead>
                <TableHead>Last Airport</TableHead>
              </TableRow>
            </TableHeader>
            <TableBody>
              {AIRCRAFT.map((ac) => (
                <TableRow key={ac.tailNumber}>
                  <TableCell className="font-medium">{ac.tailNumber}</TableCell>
                  <TableCell>{ac.model}</TableCell>
                  <TableCell>
                    <Badge variant="outline" className={statusStyles[ac.status] || ''}>
                      {ac.status.charAt(0).toUpperCase() + ac.status.slice(1)}
                    </Badge>
                  </TableCell>
                  <TableCell>{ac.lastAirport}</TableCell>
                </TableRow>
              ))}
            </TableBody>
          </Table>
        </div>
      </div>
    </div>
  );
}
