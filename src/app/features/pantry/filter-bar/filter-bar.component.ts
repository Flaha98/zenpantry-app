import {
  ChangeDetectionStrategy, Component, input, output,
} from '@angular/core';
import { TranslatePipe } from '@ngx-translate/core';
import { ItemCategory, ItemStatus, CATEGORIES, CATEGORY_CONFIG } from '../../../core/models/item.model';

export interface FilterState {
  category: ItemCategory | 'all';
  status: ItemStatus | 'all';
}

@Component({
  selector: 'app-filter-bar',
  standalone: true,
  imports: [TranslatePipe],
  changeDetection: ChangeDetectionStrategy.OnPush,
  templateUrl: './filter-bar.component.html',
})
/**
 * Stateless filter bar — owns no mutable state of its own.
 * It receives the current FilterState as an input and emits a complete new
 * FilterState object on every change, following unidirectional data flow.
 * The parent is responsible for storing and applying the filter.
 */
export class FilterBarComponent {
  readonly filters       = input<FilterState>({ category: 'all', status: 'all' });
  readonly filtersChange = output<FilterState>();

  readonly categories = CATEGORIES;

  readonly statusOptions: Array<{ value: ItemStatus | 'all'; labelKey: string }> = [
    { value: 'all',       labelKey: 'filters.all'       },
    { value: 'pending',   labelKey: 'filters.pending'   },
    { value: 'in_cart',   labelKey: 'filters.in_cart'   },
    { value: 'purchased', labelKey: 'filters.purchased' },
  ];

  catEmoji(cat: ItemCategory): string {
    return CATEGORY_CONFIG[cat].emoji;
  }

  setStatus(value: ItemStatus | 'all'): void {
    this.filtersChange.emit({ ...this.filters(), status: value });
  }

  setCategory(value: ItemCategory | 'all'): void {
    this.filtersChange.emit({ ...this.filters(), category: value });
  }
}
