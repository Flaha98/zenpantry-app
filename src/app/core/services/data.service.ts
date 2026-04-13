import { Injectable, computed, signal } from '@angular/core';
import { Item, ItemUnit, ItemCategory, ItemStatus, STATUS_CYCLE } from '../models/item.model';

/**
 * DataService manages the items list using Angular Signals.
 */
@Injectable({ providedIn: 'root' })
export class DataService {
  private readonly _items = signal<Item[]>([
    {
      id: '1',
      name: 'Apples',
      quantity: 6,
      unit: 'unit' as ItemUnit,
      category: 'fruits' as ItemCategory,
      status: 'pending' as ItemStatus,
      createdAt: new Date().toISOString(),
    },
    {
      id: '2',
      name: 'Whole Milk',
      quantity: 2,
      unit: 'l' as ItemUnit,
      category: 'dairy' as ItemCategory,
      status: 'pending' as ItemStatus,
      createdAt: new Date().toISOString(),
    },
    {
      id: '3',
      name: 'Sourdough',
      quantity: 1,
      unit: 'pack' as ItemUnit,
      category: 'bakery' as ItemCategory,
      status: 'in_cart' as ItemStatus,
      createdAt: new Date().toISOString(),
    },
  ]);

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
    this._items.set(fn(this._items()));
  }
}
