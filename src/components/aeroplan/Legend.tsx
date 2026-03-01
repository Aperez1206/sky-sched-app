import { FLIGHT_TYPES } from '@/data/aeroplan';

export default function Legend() {
  return (
    <footer className="flex items-center justify-between bg-card px-5 py-2.5 shadow-sm flex-shrink-0" style={{ borderRadius: '14px 14px 0 0' }}>
      <div className="flex items-center gap-4">
        {FLIGHT_TYPES.map(ft => (
          <div key={ft.id} className="flex items-center gap-1.5">
            <span className="inline-block h-3 w-6 rounded-sm border" style={{ backgroundColor: ft.color + '25', borderColor: ft.color }} />
            <span className="text-[10px] text-muted-foreground font-medium">{ft.label}</span>
          </div>
        ))}
        <div className="flex items-center gap-1.5">
          <span className="inline-block h-3 w-6 rounded-sm border-2 border-dashed border-muted-foreground/40 bg-muted/40" />
          <span className="text-[10px] text-muted-foreground font-medium">Pending Authorization</span>
        </div>
      </div>
      <span className="text-[10px] text-muted-foreground">Scroll ↕↔ for full 24h</span>
    </footer>
  );
}
