import { useState, useEffect } from 'react';
import { useMetar, AIRPORT_OPTIONS } from '@/hooks/useMetar';
import { RefreshCw, Cloud, Wind, Eye, Thermometer, Gauge, ChevronDown } from 'lucide-react';
import { Button } from '@/components/ui/button';
import { Badge } from '@/components/ui/badge';
import { Collapsible, CollapsibleContent, CollapsibleTrigger } from '@/components/ui/collapsible';
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from '@/components/ui/select';
import { format } from 'date-fns';

const CAT_STYLES: Record<string, string> = {
  VFR: 'bg-emerald-100 text-emerald-800 border-emerald-300',
  MVFR: 'bg-sky-100 text-sky-800 border-sky-300',
  IFR: 'bg-red-100 text-red-800 border-red-300',
  LIFR: 'bg-purple-100 text-purple-800 border-purple-300',
};

function useMetarAge(lastUpdated: Date | undefined) {
  const [age, setAge] = useState('');
  const [isStale, setIsStale] = useState(false);

  useEffect(() => {
    if (!lastUpdated) return;
    const update = () => {
      const mins = Math.floor((Date.now() - lastUpdated.getTime()) / 60000);
      setAge(mins < 1 ? 'just now' : `${mins} min ago`);
      setIsStale(mins >= 60);
    };
    update();
    const id = setInterval(update, 30000);
    return () => clearInterval(id);
  }, [lastUpdated]);

  return { age, isStale };
}

export default function MetarRibbon() {
  const [airport, setAirport] = useState('KOPF');
  const [rawOpen, setRawOpen] = useState(false);
  const { data, loading, refresh } = useMetar(airport);
  const { age, isStale } = useMetarAge(data?.lastUpdated);

  if (!data) return null;

  const isProxy = data.station !== airport;

  return (
    <div className="rounded-xl bg-secondary/60 px-4 py-2.5 text-xs">
      <div className="flex items-center gap-4">
        {/* Airport selector */}
        <Select value={airport} onValueChange={setAirport}>
          <SelectTrigger className="h-7 w-[180px] text-xs border-none bg-transparent font-semibold gap-1 px-1">
            <Cloud className="h-3.5 w-3.5 text-muted-foreground flex-shrink-0" />
            <SelectValue />
          </SelectTrigger>
          <SelectContent>
            {AIRPORT_OPTIONS.map(ap => (
              <SelectItem key={ap.id} value={ap.id} className="text-xs">{ap.label}</SelectItem>
            ))}
          </SelectContent>
        </Select>

        <Badge variant="outline" className={`text-[10px] font-bold px-2 py-0 ${CAT_STYLES[data.category]}`}>
          {data.category}
        </Badge>

        {isProxy && (
          <span className="text-[10px] text-muted-foreground italic">via {data.station}</span>
        )}

        <div className="flex items-center gap-3 text-muted-foreground">
          <span className="flex items-center gap-1"><Wind className="h-3 w-3" /> {data.wind}</span>
          <span className="flex items-center gap-1"><Eye className="h-3 w-3" /> {data.visibility}</span>
          <span className="flex items-center gap-1"><Thermometer className="h-3 w-3" /> {data.temperature} / {data.dewpoint}</span>
          <span className="flex items-center gap-1"><Gauge className="h-3 w-3" /> {data.altimeter}"</span>
        </div>

        <div className="ml-auto flex items-center gap-2">
          <Collapsible open={rawOpen} onOpenChange={setRawOpen}>
            <CollapsibleTrigger asChild>
              <Button variant="ghost" size="sm" className="h-6 text-[10px] text-muted-foreground px-2 gap-1 hover:text-foreground">
                METAR
                <ChevronDown className={`h-3 w-3 transition-transform ${rawOpen ? 'rotate-180' : ''}`} />
              </Button>
            </CollapsibleTrigger>
          </Collapsible>

          <span className={`text-[10px] font-medium ${isStale ? 'text-amber-600' : 'text-emerald-600'}`}>
            {age}
          </span>
          <span className="text-[10px] text-muted-foreground">
            {format(data.lastUpdated, 'HH:mm')}
          </span>
          <Button variant="ghost" size="icon" className="h-6 w-6" onClick={refresh} disabled={loading}>
            <RefreshCw className={`h-3 w-3 ${loading ? 'animate-spin' : ''}`} />
          </Button>
        </div>
      </div>

      {/* Collapsible raw METAR text */}
      <Collapsible open={rawOpen} onOpenChange={setRawOpen}>
        <CollapsibleContent>
          <div className="mt-2 rounded-lg bg-background/60 px-3 py-2 font-mono text-[11px] text-foreground/80 leading-relaxed">
            {data.raw}
          </div>
        </CollapsibleContent>
      </Collapsible>
    </div>
  );
}
