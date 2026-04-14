import {
  ChangeDetectionStrategy, Component, EventEmitter, Input, Output,
} from '@angular/core';
import { TranslatePipe } from '@ngx-translate/core';
import { Item, CATEGORY_CONFIG, STATUS_CONFIG } from '../../../core/models/item.model';

@Component({
  selector: 'app-item-list',
  standalone: true,
  imports: [TranslatePipe],
  changeDetection: ChangeDetectionStrategy.OnPush,
  template: `
    @if (items.length === 0) {
      <div class="flex flex-col items-center justify-center py-20 gap-4">
        <div class="w-24 h-24 rounded-full bg-gray-100 dark:bg-gray-800 flex items-center justify-center text-5xl">
          🛒
        </div>
        <div class="text-center">
          <p class="font-semibold text-gray-700 dark:text-gray-300 text-lg">
            {{ 'empty.title' | translate }}
          </p>
          <p class="text-gray-400 dark:text-gray-500 text-sm mt-1">
            {{ 'empty.subtitle' | translate }}
          </p>
        </div>
      </div>
    }

    @for (item of items; track item.id) {
      <div
        class="rounded-2xl shadow-sm border overflow-hidden"
        [class]="cardClass(item)"
      >
        <div class="flex items-center gap-3 p-4">

          <button
            class="w-12 h-12 rounded-xl flex items-center justify-center text-2xl flex-shrink-0"
            [class]="iconBg(item)"
            (click)="statusChange.emit(item.id)"
            [attr.aria-label]="'Cycle status for ' + item.name"
          >
            {{ catEmoji(item) }}
          </button>

          <div class="flex-1 min-w-0">
            <p
              class="font-semibold text-base leading-tight"
              [class]="item.status === 'purchased' ? 'line-through opacity-50' : 'text-charcoal dark:text-white'"
            >{{ item.name }}</p>
            <div class="flex items-center gap-2 mt-0.5 flex-wrap">
              <span class="text-sm text-gray-500 dark:text-gray-400">
                {{ item.quantity }}&nbsp;{{ 'units.' + item.unit | translate }}
              </span>
              <span class="w-1 h-1 bg-gray-300 dark:bg-gray-600 rounded-full flex-shrink-0"></span>
              <span class="text-xs text-gray-400 dark:text-gray-500">
                {{ 'categories.' + item.category | translate }}
              </span>
            </div>
          </div>

          <div class="flex items-center gap-1.5 flex-shrink-0">
            <span
              class="hidden sm:inline-flex px-2 py-0.5 rounded-full text-xs font-semibold"
              [class]="statusPill(item)"
            >{{ statusLabel(item) | translate }}</span>

            <button
              class="w-8 h-8 rounded-lg flex items-center justify-center
                     text-gray-400 dark:text-gray-500
                     hover:bg-gray-100 dark:hover:bg-gray-700 hover:text-gray-700 dark:hover:text-gray-200"
              (click)="edit.emit(item)"
              aria-label="Edit"
            >
              <svg xmlns="http://www.w3.org/2000/svg" class="w-4 h-4" fill="none" viewBox="0 0 24 24" stroke="currentColor" stroke-width="2">
                <path stroke-linecap="round" stroke-linejoin="round"
                  d="M16.862 4.487a2.1 2.1 0 113 3L7.5 19.851l-4 1 1-4 12.362-12.364z" />
              </svg>
            </button>

            <button
              class="w-8 h-8 rounded-lg flex items-center justify-center
                     text-gray-400 dark:text-gray-500
                     hover:bg-red-50 dark:hover:bg-red-900/20 hover:text-red-500 dark:hover:text-red-400"
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
      return 'bg-forest border-forest/10 dark:border-forest/30';
    }
    if (item.status === 'purchased') {
      return 'bg-white dark:bg-dark-card border-gray-100 dark:border-gray-800 opacity-60';
    }
    return 'bg-white dark:bg-dark-card border-gray-100 dark:border-gray-800';
  }

  iconBg(item: Item): string {
    if (item.status === 'in_cart') return 'bg-white/15';
    const cfg = CATEGORY_CONFIG[item.category];
    return `${cfg.iconBg}`;
  }

  catEmoji(item: Item): string {
    return CATEGORY_CONFIG[item.category].emoji;
  }

  statusPill(item: Item): string {
    return STATUS_CONFIG[item.status].pillClass;
  }

  statusLabel(item: Item): string {
    return STATUS_CONFIG[item.status].label;
  }
}
