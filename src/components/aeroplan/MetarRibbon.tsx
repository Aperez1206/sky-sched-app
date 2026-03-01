import { useState, useEffect } from 'react';
import { useMetar } from '@/hooks/useMetar';
import { RefreshCw, Cloud, Wind, Eye, Thermometer, Gauge } from 'lucide-react';
import { Button } from '@/components/ui/button';
import { Badge } from '@/components/ui/badge';
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
  const { data, loading, refresh } = useMetar();
  const { age, isStale } = useMetarAge(data?.lastUpdated);

  if (!data) return null;

  return (
    <div className="flex items-center gap-4 rounded-xl bg-secondary/60 px-4 py-2.5 text-xs">
      <div className="flex items-center gap-1.5">
        <Cloud className="h-3.5 w-3.5 text-muted-foreground" />
        <span className="font-semibold text-foreground">METAR</span>
      </div>

      <Badge variant="outline" className={`text-[10px] font-bold px-2 py-0 ${CAT_STYLES[data.category]}`}>
        {data.category}
      </Badge>

      <div className="flex items-center gap-3 text-muted-foreground">
        <span className="flex items-center gap-1"><Wind className="h-3 w-3" /> {data.wind}</span>
        <span className="flex items-center gap-1"><Eye className="h-3 w-3" /> {data.visibility}</span>
        <span className="flex items-center gap-1"><Thermometer className="h-3 w-3" /> {data.temperature} / {data.dewpoint}</span>
        <span className="flex items-center gap-1"><Gauge className="h-3 w-3" /> {data.altimeter}"</span>
      </div>

      <div className="ml-auto flex items-center gap-3">
        <span className="font-mono text-[10px] text-muted-foreground max-w-[300px] truncate" title={data.raw}>
          {data.raw}
        </span>
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
  );
}
