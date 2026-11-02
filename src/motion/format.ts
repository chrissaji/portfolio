export interface CountFormat {
  decimals?: number;
  prefix?: string;
  suffix?: string;
}

export function formatCount(value: number, f: CountFormat = {}): string {
  const d = f.decimals ?? 0;
  const body = value.toLocaleString('en-US', { minimumFractionDigits: d, maximumFractionDigits: d });
  return `${f.prefix ?? ''}${body}${f.suffix ?? ''}`;
}

export function readCountFormat(data: DOMStringMap): { target: number; format: CountFormat } | null {
  const target = Number(data.count);
  if (data.count === undefined || !Number.isFinite(target)) return null;
  return { target, format: { decimals: Number(data.decimals ?? 0), prefix: data.prefix ?? '', suffix: data.suffix ?? '' } };
}
