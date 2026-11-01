export interface TimeWindow { start: string; end: string }
export interface Parana {
  date: string;
  window?: TimeWindow;
  after?: string;
  hariVasaraEnd?: string;
  dwadashiEnd?: string;
  reason: string;
  status: 'calculated' | 'review-required' | 'reference-checked';
}
export interface Observance {
  id: string;
  name: string;
  date: string;
  kind: 'festival' | 'fast' | 'lunar' | 'solar';
  tradition?: string;
  rule: string;
  source: string;
  status: 'calculated' | 'review-required' | 'reference-checked';
  window?: TimeWindow;
  tithiWindow?: TimeWindow;
  parana?: Parana;
  notes?: string;
}
