import {
  ChangeDetectionStrategy, Component, EventEmitter, Input, Output,
} from '@angular/core';
import { Item, CATEGORY_CONFIG } from '../../../core/models/item.model';

@Component({
  selector: 'app-item-list',
  standalone: true,
  imports: [],
  changeDetection: ChangeDetectionStrategy.OnPush,
  template: `
    <!-- Empty state -->
    @if (items.length === 0) {
      <div class="flex flex-col items-center justify-center py-20 gap-4">
        <div class="w-24 h-24 rounded-full bg-gray-100 flex items-center justify-center text-5xl">
          🛒
        </div>
        <div class="text-center">
          <p class="font-semibold text-gray-700 text-lg">
            Your pantry is empty
          </p>
          <p class="text-gray-400 text-sm mt-1">
            Tap the + button to add your first item
          </p>
        </div>
      </div>
    }

    <!-- Item cards -->
    @for (item of items; track item.id) {
      <div
        class="rounded-2xl shadow-sm border transition-all duration-300 overflow-hidden"
        [class]="cardClass(item)"
      >
        <div class="flex items-center gap-3 p-4">

          <!-- Category icon (click to cycle status) -->
          <button
            class="w-12 h-12 rounded-xl flex items-center justify-center text-2xl flex-shrink-0 transition-transform duration-150 active:scale-90"
            [class]="iconBgClass(item)"
            (click)="statusChange.emit(item.id)"
            [attr.aria-label]="'Cycle status for ' + item.name"
          >
            {{ catEmoji(item) }}
          </button>

          <!-- Item info -->
          <div class="flex-1 min-w-0">
            <p
              class="font-semibold text-base leading-tight transition-all duration-300"
              [class]="item.status === 'purchased' ? 'line-through opacity-50' : 'text-charcoal'"
            >{{ item.name }}</p>
            <div class="flex items-center gap-2 mt-0.5 flex-wrap">
              <span class="text-sm text-gray-500">
                {{ item.quantity }}&nbsp;{{ unitLabel(item.unit) }}
              </span>
              <span class="w-1 h-1 bg-gray-300 rounded-full flex-shrink-0"></span>
              <span class="text-xs text-gray-400">
                {{ categoryLabel(item.category) }}
              </span>
            </div>
          </div>

          <!-- Status badge + actions -->
          <div class="flex items-center gap-1.5 flex-shrink-0">
            <!-- Status pill -->
            <span
              class="hidden sm:inline-flex px-2 py-0.5 rounded-full text-xs font-semibold"
              [class]="statusPillClass(item)"
            >{{ statusLabel(item) }}</span>

            <!-- Edit -->
            <button
              class="w-8 h-8 rounded-lg flex items-center justify-center transition-all duration-150
                     text-gray-400 hover:bg-gray-100 hover:text-gray-700 active:scale-90"
              (click)="edit.emit(item)"
              aria-label="Edit"
            >
              <svg xmlns="http://www.w3.org/2000/svg" class="w-4 h-4" fill="none" viewBox="0 0 24 24" stroke="currentColor" stroke-width="2">
                <path stroke-linecap="round" stroke-linejoin="round"
                  d="M16.862 4.487a2.1 2.1 0 113 3L7.5 19.851l-4 1 1-4 12.362-12.364z" />
              </svg>
            </button>

            <!-- Delete -->
            <button
              class="w-8 h-8 rounded-lg flex items-center justify-center transition-all duration-150
                     text-gray-400 hover:bg-red-50 hover:text-red-500 active:scale-90"
              (click)="delete.emit(item.id)"
              aria-label="Delete"
            >
              <svg xmlns="http://www.w3.org/2000/svg" class="w-4 h-4" fill="none" viewBox="0 0 24 24" stroke="currentColor" stroke-width="2">
                <path stroke-linecap="round" stroke-linejoin="round"
                  d="M19 7l-.867 12.142A2 2 0 0116.138 21H7.862a2 2 0 01-1.995-1.858L5 7m5 4v6m4-6v6M9 7h6m-7 0a1 1 0 00-1 1v0m9-1a1 1 0 011 1v0M9 7V4a1 1 0 011-1h4a1 1 0 011 1v3" />
              </svg>
            </button>
          </div>
        </div>

        <!-- In-cart status bar at bottom -->
        @if (item.status === 'in_cart') {
          <div class="h-0.5 bg-sage/30">
            <div class="h-full bg-sage w-2/3 rounded-full"></div>
          </div>
        }
      </div>
    }
  `,
})
export class ItemListComponent {
  @Input() items: Item[] = [];
  @Output() edit         = new EventEmitter<Item>();
  @Output() delete       = new EventEmitter<string>();
  @Output() statusChange = new EventEmitter<string>();

  cardClass(item: Item): string {
    if (item.status === 'in_cart') {
      return 'bg-forest border-forest/10';
    }
    if (item.status === 'purchased') {
      return 'bg-white border-gray-100 opacity-60';
    }
    return 'bg-white border-gray-100';
  }

  // Simple background for category icon (no dark mode)
  iconBgClass(item: Item): string {
    if (item.status === 'in_cart') return 'bg-white/15';
    // Return a light background based on category (just for visual variety)
    const lightBgMap: Record<string, string> = {
      fruits: 'bg-green-100',
      vegetables: 'bg-emerald-100',
      dairy: 'bg-blue-100',
      meat: 'bg-red-100',
      bakery: 'bg-amber-100',
      beverages: 'bg-cyan-100',
      cleaning: 'bg-purple-100',
      other: 'bg-gray-100',
    };
    return lightBgMap[item.category] || 'bg-gray-100';
  }

  catEmoji(item: Item): string {
    return CATEGORY_CONFIG[item.category].emoji;
  }

  statusPillClass(item: Item): string {
    switch (item.status) {
      case 'pending':   return 'bg-amber-100 text-amber-700';
      case 'in_cart':   return 'bg-forest text-white';
      case 'purchased': return 'bg-gray-200 text-gray-500';
      default:          return 'bg-gray-100 text-gray-600';
    }
  }

  statusLabel(item: Item): string {
    switch (item.status) {
      case 'pending':   return 'Pending';
      case 'in_cart':   return 'In Cart';
      case 'purchased': return 'Purchased';
      default:          return '';
    }
  }

  unitLabel(unit: string): string {
    const map: Record<string, string> = {
      unit: 'unit', kg: 'kg', g: 'g', l: 'l', ml: 'ml', pack: 'pack', box: 'box', bag: 'bag'
    };
    return map[unit] || unit;
  }

  categoryLabel(category: string): string {
    const map: Record<string, string> = {
      fruits: 'Fruits', vegetables: 'Vegetables', dairy: 'Dairy', meat: 'Meat',
      bakery: 'Bakery', beverages: 'Beverages', cleaning: 'Cleaning', other: 'Other'
    };
    return map[category] || category;
  }
}
