export interface WindComponent {
  runwayId: string;
  runwayHeading: number;
  headwind: number;
  crosswind: number;
  gustHeadwind?: number;
  gustCrosswind?: number;
  favorable: boolean;
}

export function calculateWindComponents(
  runwayHeading: number,
  windDirection: number,
  windSpeed: number,
  gustSpeed?: number
): { headwind: number; crosswind: number; gustHeadwind?: number; gustCrosswind?: number } {
  const angleDeg = windDirection - runwayHeading;
  const angleRad = (angleDeg * Math.PI) / 180;

  const headwind = Math.round(windSpeed * Math.cos(angleRad));
  const crosswind = Math.round(Math.abs(windSpeed * Math.sin(angleRad)));

  const result: any = { headwind, crosswind };

  if (gustSpeed !== undefined) {
    result.gustHeadwind = Math.round(gustSpeed * Math.cos(angleRad));
    result.gustCrosswind = Math.round(Math.abs(gustSpeed * Math.sin(angleRad)));
  }

  return result;
}

export function getWorstCrosswind(components: WindComponent[]): number {
  let worst = 0;
  for (const c of components) {
    worst = Math.max(worst, c.crosswind, c.gustCrosswind ?? 0);
  }
  return worst;
}

export function getWorstWind(windSpeed: number, gustSpeed?: number): number {
  return gustSpeed !== undefined ? Math.max(windSpeed, gustSpeed) : windSpeed;
}
