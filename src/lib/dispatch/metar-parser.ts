export interface ParsedMetar {
  raw: string;
  station: string;
  temperature: number | null;
  dewpoint: number | null;
  altimeter: number | null;
  windDirection: number | null;
  windSpeed: number | null;
  windGust: number | null;
  visibility: number | null;
  ceiling: number | null;
  cloudLayers: Array<{ cover: string; altitude: number }>;
  flightCategory: string;
  densityAltitude: number | null;
  observationTime: string;
}

export function parseMetarJson(data: any): ParsedMetar | null {
  if (!data || !Array.isArray(data) || data.length === 0) return null;
  const m = data[0];

  const cloudLayers: Array<{ cover: string; altitude: number }> = [];
  if (m.clouds) {
    for (const c of m.clouds) {
      cloudLayers.push({ cover: c.cover, altitude: (c.base ?? 0) });
    }
  }

  let ceiling: number | null = null;
  for (const layer of cloudLayers) {
    if (layer.cover === "BKN" || layer.cover === "OVC") {
      ceiling = layer.altitude;
      break;
    }
  }

  const temp = m.temp ?? null;
  const altimeter = m.altim ? parseFloat((m.altim * 0.02953).toFixed(2)) : null;
  const elev = m.elev ?? 0;

  let densityAltitude: number | null = null;
  if (temp !== null && altimeter !== null) {
    const pressureAltitude = (29.92 - altimeter) * 1000 + elev * 3.28084;
    const isaTemp = 15 - (pressureAltitude / 1000) * 2;
    densityAltitude = Math.round(pressureAltitude + 120 * (temp - isaTemp));
  }

  let flightCategory = "VFR";
  const vis = m.visib ?? 10;
  if (vis < 1 || (ceiling !== null && ceiling < 500)) flightCategory = "LIFR";
  else if (vis < 3 || (ceiling !== null && ceiling < 1000)) flightCategory = "IFR";
  else if (vis <= 5 || (ceiling !== null && ceiling <= 3000)) flightCategory = "MVFR";

  return {
    raw: m.rawOb ?? "",
    station: m.icaoId ?? "",
    temperature: temp,
    dewpoint: m.dewp ?? null,
    altimeter,
    windDirection: m.wdir ?? null,
    windSpeed: m.wspd ?? null,
    windGust: m.wgst ?? null,
    visibility: vis,
    ceiling,
    cloudLayers,
    flightCategory,
    densityAltitude,
    observationTime: m.reportTime ?? "",
  };
}
