import { Injectable, computed, signal } from '@angular/core';
import { Item, ItemUnit, ItemCategory, ItemStatus, STATUS_CYCLE } from '../models/item.model';
import { STORAGE_KEYS } from '../constants/storage-keys';

@Injectable({ providedIn: 'root' })
export class DataService {
  private readonly _items = signal<Item[]>(this.loadFromStorage());

  readonly items = this._items.asReadonly();

  readonly stats = computed(() => {
    const items = this._items();
    return {
      total: items.length,
      pending: items.filter(i => i.status === 'pending').length,
      inCart: items.filter(i => i.status === 'in_cart').length,
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
    } catch {
      // Silently fail if localStorage is unavailable
    }
  }

  private loadFromStorage(): Item[] {
    try {
      const raw = localStorage.getItem(STORAGE_KEYS.items);
      if (raw) return JSON.parse(raw) as Item[];
    } catch {
      // Corrupted data → start fresh with sample items
    }
    return this.getSampleItems();
  }

  private getSampleItems(): Item[] {
    const now = new Date().toISOString();
    return [
      { id: '1', name: 'Apples',       quantity: 6, unit: 'unit' as ItemUnit, category: 'fruits'     as ItemCategory, status: 'pending'   as ItemStatus, createdAt: now },
      { id: '2', name: 'Whole Milk',   quantity: 2, unit: 'l'    as ItemUnit, category: 'dairy'      as ItemCategory, status: 'pending'   as ItemStatus, createdAt: now },
      { id: '3', name: 'Sourdough',    quantity: 1, unit: 'pack' as ItemUnit, category: 'bakery'     as ItemCategory, status: 'in_cart'   as ItemStatus, createdAt: now },
      { id: '4', name: 'Chicken',      quantity: 1, unit: 'kg'   as ItemUnit, category: 'meat'       as ItemCategory, status: 'pending'   as ItemStatus, createdAt: now },
      { id: '5', name: 'Spinach',      quantity: 2, unit: 'bag'  as ItemUnit, category: 'vegetables' as ItemCategory, status: 'in_cart'   as ItemStatus, createdAt: now },
      { id: '6', name: 'Orange Juice', quantity: 1, unit: 'l'    as ItemUnit, category: 'beverages'  as ItemCategory, status: 'pending'   as ItemStatus, createdAt: now },
      { id: '7', name: 'Yoghurt',      quantity: 4, unit: 'unit' as ItemUnit, category: 'dairy'      as ItemCategory, status: 'purchased' as ItemStatus, createdAt: now },
    ];
  }
}
