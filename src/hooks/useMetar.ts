import { useState, useEffect, useCallback } from 'react';

export interface MetarData {
  raw: string;
  category: 'VFR' | 'MVFR' | 'IFR' | 'LIFR';
  wind: string;
  visibility: string;
  temperature: string;
  dewpoint: string;
  altimeter: string;
  lastUpdated: Date;
}

function parseCategory(raw: string): 'VFR' | 'MVFR' | 'IFR' | 'LIFR' {
  // Simple heuristic based on visibility and ceiling
  const visMatch = raw.match(/(\d+)SM/);
  const vis = visMatch ? parseInt(visMatch[1]) : 10;
  
  // Check for ceiling (BKN or OVC)
  const ceilingMatch = raw.match(/(BKN|OVC)(\d{3})/);
  const ceiling = ceilingMatch ? parseInt(ceilingMatch[2]) * 100 : 99999;
  
  if (vis >= 5 && ceiling >= 3000) return 'VFR';
  if (vis >= 3 && ceiling >= 1000) return 'MVFR';
  if (vis >= 1 && ceiling >= 500) return 'IFR';
  return 'LIFR';
}

function parseWind(raw: string): string {
  const m = raw.match(/(\d{3}|VRB)(\d{2,3})(G(\d{2,3}))?KT/);
  if (!m) return 'Calm';
  const dir = m[1] === 'VRB' ? 'VRB' : `${m[1]}°`;
  const spd = m[2];
  const gust = m[4] ? `G${m[4]}` : '';
  return `${dir} ${spd}${gust}kt`;
}

function parseVisibility(raw: string): string {
  const m = raw.match(/(\d+)\s*SM/);
  return m ? `${m[1]} SM` : 'N/A';
}

function parseTempDew(raw: string): { temp: string; dew: string } {
  const m = raw.match(/(M?\d{2})\/(M?\d{2})/);
  if (!m) return { temp: 'N/A', dew: 'N/A' };
  const format = (v: string) => v.startsWith('M') ? `-${v.slice(1)}°C` : `${v}°C`;
  return { temp: format(m[1]), dew: format(m[2]) };
}

function parseAltimeter(raw: string): string {
  const m = raw.match(/A(\d{4})/);
  return m ? `${m[1].slice(0, 2)}.${m[1].slice(2)}` : 'N/A';
}

export function useMetar() {
  const [data, setData] = useState<MetarData | null>(null);
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState<string | null>(null);

  const fetchMetar = useCallback(async () => {
    setLoading(true);
    setError(null);
    try {
      const directUrl = 'https://aviationweather.gov/api/data/metar?ids=KOPF&format=raw&taf=false';
      const proxyUrl = `https://api.allorigins.win/raw?url=${encodeURIComponent(directUrl)}`;
      
      let raw = '';
      try {
        const res = await fetch(directUrl);
        if (!res.ok) throw new Error('Direct fetch failed');
        raw = (await res.text()).trim();
      } catch {
        const res = await fetch(proxyUrl);
        if (!res.ok) throw new Error('Proxy fetch failed');
        raw = (await res.text()).trim();
      }
      if (!raw) throw new Error('Empty response');
      
      const { temp, dew } = parseTempDew(raw);
      setData({
        raw,
        category: parseCategory(raw),
        wind: parseWind(raw),
        visibility: parseVisibility(raw),
        temperature: temp,
        dewpoint: dew,
        altimeter: parseAltimeter(raw),
        lastUpdated: new Date(),
      });
    } catch (e: any) {
      setError(e.message);
      // Set fallback data
      if (!data) {
        setData({
          raw: 'KOPF — METAR unavailable',
          category: 'VFR',
          wind: 'N/A',
          visibility: 'N/A',
          temperature: 'N/A',
          dewpoint: 'N/A',
          altimeter: 'N/A',
          lastUpdated: new Date(),
        });
      }
    } finally {
      setLoading(false);
    }
  }, []);

  useEffect(() => {
    fetchMetar();
    const interval = setInterval(fetchMetar, 5 * 60 * 1000);
    return () => clearInterval(interval);
  }, [fetchMetar]);

  return { data, loading, error, refresh: fetchMetar };
}
