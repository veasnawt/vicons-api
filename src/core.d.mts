export interface IconOptions { name: string; color: string; size: number; stroke: number }
export function parseIconRequest(url: string): IconOptions | { error: string; status: number };
export function renderSvg(source: string, options: IconOptions): string;
