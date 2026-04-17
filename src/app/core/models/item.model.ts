// ── Item domain model ───────────────────────────────────────────────────────

export type ItemCategory =
  | 'fruits'
  | 'vegetables'
  | 'dairy'
  | 'meat'
  | 'bakery'
  | 'frozen'
  | 'pantry'
  | 'snacks'
  | 'beverages'
  | 'cleaning'
  | 'personal_care'
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
  createdAt: string; // ISO 8601 — stored as a string for JSON serialisation compatibility
}

// ── Constants ────────────────────────────────────────────────────────────────

export const CATEGORIES: ItemCategory[] = [
  'fruits', 'vegetables', 'dairy', 'meat',
  'bakery', 'frozen', 'pantry', 'snacks',
  'beverages', 'cleaning', 'personal_care', 'other',
];

export const UNITS: ItemUnit[] = ['unit', 'kg', 'g', 'l', 'ml', 'pack', 'box', 'bag'];

/**
 * Visual configuration keyed by category.
 *
 * ⚠️  Tailwind JIT scanning: all class strings MUST be written as complete
 * literals here. The JIT compiler scans source files for full class names;
 * dynamically constructed strings (e.g. `bg-${color}-100`) are invisible to
 * it and will be purged from the production bundle.
 */
export const CATEGORY_CONFIG: Record<ItemCategory, { iconBg: string; iconText: string; emoji: string }> = {
  fruits:        { iconBg: 'bg-green-100 dark:bg-green-900/40',    iconText: 'text-green-700 dark:text-green-300',    emoji: '🍎' },
  vegetables:    { iconBg: 'bg-emerald-100 dark:bg-emerald-900/40', iconText: 'text-emerald-700 dark:text-emerald-300', emoji: '🥦' },
  dairy:         { iconBg: 'bg-blue-100 dark:bg-blue-900/40',      iconText: 'text-blue-700 dark:text-blue-300',      emoji: '🥛' },
  meat:          { iconBg: 'bg-red-100 dark:bg-red-900/40',        iconText: 'text-red-700 dark:text-red-300',        emoji: '🥩' },
  bakery:        { iconBg: 'bg-amber-100 dark:bg-amber-900/40',    iconText: 'text-amber-700 dark:text-amber-300',    emoji: '🍞' },
  frozen:        { iconBg: 'bg-sky-100 dark:bg-sky-900/40',        iconText: 'text-sky-700 dark:text-sky-300',        emoji: '🧊' },
  pantry:        { iconBg: 'bg-orange-100 dark:bg-orange-900/40',  iconText: 'text-orange-700 dark:text-orange-300',  emoji: '🫙' },
  snacks:        { iconBg: 'bg-yellow-100 dark:bg-yellow-900/40',  iconText: 'text-yellow-700 dark:text-yellow-300',  emoji: '🍿' },
  beverages:     { iconBg: 'bg-cyan-100 dark:bg-cyan-900/40',      iconText: 'text-cyan-700 dark:text-cyan-300',      emoji: '🥤' },
  cleaning:      { iconBg: 'bg-purple-100 dark:bg-purple-900/40',  iconText: 'text-purple-700 dark:text-purple-300',  emoji: '🧹' },
  personal_care: { iconBg: 'bg-rose-100 dark:bg-rose-900/40',      iconText: 'text-rose-700 dark:text-rose-300',      emoji: '🧴' },
  other:         { iconBg: 'bg-gray-100 dark:bg-gray-700',         iconText: 'text-gray-600 dark:text-gray-300',      emoji: '📦' },
};

export const STATUS_CONFIG: Record<ItemStatus, { label: string; pillClass: string }> = {
  pending:   { label: 'filters.pending',   pillClass: 'bg-amber-100 text-amber-700 dark:bg-amber-900/40 dark:text-amber-300' },
  in_cart:   { label: 'filters.in_cart',   pillClass: 'bg-white/90 text-forest' },
  purchased: { label: 'filters.purchased', pillClass: 'bg-gray-200 text-gray-600 dark:bg-gray-700 dark:text-gray-300' },
};

/**
 * Encodes the item status state machine as a lookup table.
 * Allowed cycle: pending → in_cart → purchased → pending.
 *
 * Keeping transitions here (rather than scattered across components) means
 * any component can advance an item's state without knowing what comes next —
 * it just calls DataService.cycleStatus() and this table does the rest.
 */
export const STATUS_CYCLE: Record<ItemStatus, ItemStatus> = {
  pending:   'in_cart',
  in_cart:   'purchased',
  purchased: 'pending',
};
