// ── Item domain model ───────────────────────────────────────────────────────

export type ItemCategory =
  | 'fruits'
  | 'vegetables'
  | 'dairy'
  | 'meat'
  | 'bakery'
  | 'beverages'
  | 'cleaning'
  | 'other';

export type ItemStatus = 'pending' | 'in_cart' | 'purchased';

export type ItemUnit = 'unit' | 'kg' | 'g' | 'l' | 'ml' | 'pack' | 'box' | 'bag';

export interface Item {
  id: string;
  name: string;
  quantity: number;
  unit: ItemUnit;
  category: ItemCategory;
  status: ItemStatus;
  createdAt: string;
}

// ── Constants ────────────────────────────────────────────────────────────────

export const CATEGORIES: ItemCategory[] = [
  'fruits', 'vegetables', 'dairy', 'meat',
  'bakery', 'beverages', 'cleaning', 'other',
];

export const UNITS: ItemUnit[] = ['unit', 'kg', 'g', 'l', 'ml', 'pack', 'box', 'bag'];

