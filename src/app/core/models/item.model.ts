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

/**
 * Visual config for each category.
 * Full class strings are listed here so Tailwind JIT includes them at build time.
 */
export const CATEGORY_CONFIG: Record<ItemCategory, { iconBg: string; iconText: string; emoji: string }> = {
  fruits:     { iconBg: 'bg-green-100 dark:bg-green-900/40',   iconText: 'text-green-700 dark:text-green-300',   emoji: '🍎' },
  vegetables: { iconBg: 'bg-emerald-100 dark:bg-emerald-900/40', iconText: 'text-emerald-700 dark:text-emerald-300', emoji: '🥦' },
  dairy:      { iconBg: 'bg-blue-100 dark:bg-blue-900/40',     iconText: 'text-blue-700 dark:text-blue-300',     emoji: '🥛' },
  meat:       { iconBg: 'bg-red-100 dark:bg-red-900/40',       iconText: 'text-red-700 dark:text-red-300',       emoji: '🥩' },
  bakery:     { iconBg: 'bg-amber-100 dark:bg-amber-900/40',   iconText: 'text-amber-700 dark:text-amber-300',   emoji: '🍞' },
  beverages:  { iconBg: 'bg-cyan-100 dark:bg-cyan-900/40',     iconText: 'text-cyan-700 dark:text-cyan-300',     emoji: '🥤' },
  cleaning:   { iconBg: 'bg-purple-100 dark:bg-purple-900/40', iconText: 'text-purple-700 dark:text-purple-300', emoji: '🧹' },
  other:      { iconBg: 'bg-gray-100 dark:bg-gray-700',        iconText: 'text-gray-600 dark:text-gray-300',     emoji: '📦' },
};

export const STATUS_CONFIG: Record<ItemStatus, { label: string; pillClass: string }> = {
  pending:   { label: 'filters.pending',   pillClass: 'bg-amber-100 text-amber-700 dark:bg-amber-900/40 dark:text-amber-300' },
  in_cart:   { label: 'filters.in_cart',   pillClass: 'bg-forest text-white dark:bg-forest/80' },
  purchased: { label: 'filters.purchased', pillClass: 'bg-gray-200 text-gray-500 dark:bg-gray-700 dark:text-gray-400' },
};

/** Cycle: pending → in_cart → purchased → pending */
export const STATUS_CYCLE: Record<ItemStatus, ItemStatus> = {
  pending:   'in_cart',
  in_cart:   'purchased',
  purchased: 'pending',
};
