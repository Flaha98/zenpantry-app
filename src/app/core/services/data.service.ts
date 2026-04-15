import { Injectable, computed, signal } from '@angular/core';
import { Item, ItemStatus, STATUS_CYCLE } from '../models/item.model';
import { STORAGE_KEYS } from '../constants/storage-keys';

const VALID_STATUSES = new Set<ItemStatus>(['pending', 'in_cart', 'purchased']);

function isValidItem(obj: unknown): obj is Item {
  if (!obj || typeof obj !== 'object') return false;
  const item = obj as Record<string, unknown>;
  return (
    typeof item['id']        === 'string' &&
    typeof item['name']      === 'string' &&
    typeof item['quantity']  === 'number' &&
    typeof item['unit']      === 'string' &&
    typeof item['category']  === 'string' &&
    typeof item['createdAt'] === 'string' &&
    VALID_STATUSES.has(item['status'] as ItemStatus)
  );
}

@Injectable({ providedIn: 'root' })
export class DataService {
  private readonly _items = signal<Item[]>(this.loadFromStorage());

  readonly items = this._items.asReadonly();

  readonly stats = computed(() => {
    const items = this._items();
    return {
      total:     items.length,
      pending:   items.filter(i => i.status === 'pending').length,
      inCart:    items.filter(i => i.status === 'in_cart').length,
      purchased: items.filter(i => i.status === 'purchased').length,
    };
  });

  addItem(data: Omit<Item, 'id' | 'createdAt'>): Item {
    const newItem: Item = {
      ...data,
      id: crypto.randomUUID(),
      createdAt: new Date().toISOString(),
    };
    this.mutate(items => [newItem, ...items]);
    return newItem;
  }

  updateItem(id: string, changes: Partial<Omit<Item, 'id' | 'createdAt'>>): void {
    this.mutate(items =>
      items.map(item => item.id === id ? { ...item, ...changes } : item)
    );
  }

  deleteItem(id: string): void {
    this.mutate(items => items.filter(item => item.id !== id));
  }

  cycleStatus(id: string): void {
    const item = this._items().find(i => i.id === id);
    if (!item) return;
    this.updateItem(id, { status: STATUS_CYCLE[item.status] });
  }

  private mutate(fn: (current: Item[]) => Item[]): void {
    const updated = fn(this._items());
    this._items.set(updated);
    this.persist(updated);
  }

  private persist(items: Item[]): void {
    try {
      localStorage.setItem(STORAGE_KEYS.items, JSON.stringify(items));
    } catch { /* localStorage unavailable (private mode) */ }
  }

  private loadFromStorage(): Item[] {
    try {
      const raw = localStorage.getItem(STORAGE_KEYS.items);
      // null → first visit: show samples. '[]' → user cleared all: show empty list.
      if (raw === null) return this.getSampleItems();
      const parsed: unknown = JSON.parse(raw);
      if (!Array.isArray(parsed)) return this.getSampleItems();
      return parsed.filter(isValidItem);
    } catch {
      return this.getSampleItems();
    }
  }

  private getSampleItems(): Item[] {
    const now = new Date().toISOString();
    const items: Item[] = [
      { id: crypto.randomUUID(), name: 'Apples',       quantity: 6, unit: 'unit', category: 'fruits',     status: 'pending',   createdAt: now },
      { id: crypto.randomUUID(), name: 'Whole Milk',   quantity: 2, unit: 'l',    category: 'dairy',      status: 'pending',   createdAt: now },
      { id: crypto.randomUUID(), name: 'Sourdough',    quantity: 1, unit: 'pack', category: 'bakery',     status: 'in_cart',   createdAt: now },
      { id: crypto.randomUUID(), name: 'Chicken',      quantity: 1, unit: 'kg',   category: 'meat',       status: 'pending',   createdAt: now },
      { id: crypto.randomUUID(), name: 'Spinach',      quantity: 2, unit: 'bag',  category: 'vegetables', status: 'in_cart',   createdAt: now },
      { id: crypto.randomUUID(), name: 'Orange Juice', quantity: 1, unit: 'l',    category: 'beverages',  status: 'pending',   createdAt: now },
      { id: crypto.randomUUID(), name: 'Yoghurt',      quantity: 4, unit: 'unit', category: 'dairy',      status: 'purchased', createdAt: now },
    ];
    return items;
  }
}
