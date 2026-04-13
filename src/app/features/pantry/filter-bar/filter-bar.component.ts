import {
  ChangeDetectionStrategy, Component, EventEmitter, Input, Output,
} from '@angular/core';
import { TranslatePipe } from '@ngx-translate/core';
import { ItemCategory, ItemStatus, CATEGORIES } from '../../../core/models/item.model';

export interface FilterState {
  category: ItemCategory | 'all';
  status: ItemStatus | 'all';
}

@Component({
  selector: 'app-filter-bar',
  standalone: true,
  imports: [TranslatePipe],
  changeDetection: ChangeDetectionStrategy.OnPush,
  template: `
    <div class="space-y-2">

      <!-- Status pills -->
      <div class="flex gap-2 overflow-x-auto scrollbar-hide pb-0.5">
        @for (s of statusOptions; track s.value) {
          <button
            class="flex-shrink-0 px-3 py-1.5 rounded-full text-xs font-semibold transition-all duration-200 active:scale-95"
            [class]="filters.status === s.value
              ? 'bg-forest text-white shadow-sm'
              : 'bg-white dark:bg-dark-card text-gray-500 dark:text-gray-400 border border-gray-200 dark:border-gray-700 hover:border-forest dark:hover:border-sage'"
            (click)="setStatus(s.value)"
          >{{ s.labelKey | translate }}</button>
        }
      </div>

      <!-- Category pills -->
      <div class="flex gap-2 overflow-x-auto scrollbar-hide pb-0.5">
        <button
          class="flex-shrink-0 px-3 py-1.5 rounded-full text-xs font-semibold transition-all duration-200 active:scale-95"
          [class]="filters.category === 'all'
            ? 'bg-sage text-white shadow-sm'
            : 'bg-white dark:bg-dark-card text-gray-500 dark:text-gray-400 border border-gray-200 dark:border-gray-700 hover:border-sage'"
          (click)="setCategory('all')"
        >{{ 'filters.all' | translate }}</button>

        @for (cat of categories; track cat) {
          <button
            class="flex-shrink-0 px-3 py-1.5 rounded-full text-xs font-semibold transition-all duration-200 active:scale-95 flex items-center gap-1"
            [class]="filters.category === cat
              ? 'bg-sage text-white shadow-sm'
              : 'bg-white dark:bg-dark-card text-gray-500 dark:text-gray-400 border border-gray-200 dark:border-gray-700 hover:border-sage'"
            (click)="setCategory(cat)"
          >
            <span>{{ catEmoji(cat) }}</span>
            <span>{{ 'categories.' + cat | translate }}</span>
          </button>
        }
      </div>
    </div>
  `,
})
export class FilterBarComponent {
  @Input() filters: FilterState = { category: 'all', status: 'all' };
  @Output() filtersChange = new EventEmitter<FilterState>();

  readonly categories = CATEGORIES;

  readonly statusOptions: Array<{ value: ItemStatus | 'all'; labelKey: string }> = [
    { value: 'all',       labelKey: 'filters.all'       },
    { value: 'pending',   labelKey: 'filters.pending'   },
    { value: 'in_cart',   labelKey: 'filters.in_cart'   },
    { value: 'purchased', labelKey: 'filters.purchased' },
  ];

  private readonly emojiMap: Record<ItemCategory, string> = {
    fruits: '🍎', vegetables: '🥦', dairy: '🥛', meat: '🥩',
    bakery: '🍞', beverages: '🥤', cleaning: '🧹', other: '📦',
  };

  catEmoji(cat: ItemCategory): string {
    return this.emojiMap[cat];
  }

  setStatus(value: ItemStatus | 'all'): void {
    this.filtersChange.emit({ ...this.filters, status: value });
  }

  setCategory(value: ItemCategory | 'all'): void {
    this.filtersChange.emit({ ...this.filters, category: value });
  }
}
