import {
  ChangeDetectionStrategy, Component, computed, input, output, signal,
} from '@angular/core';
import { TranslatePipe } from '@ngx-translate/core';
import { Item, CATEGORY_CONFIG, STATUS_CONFIG } from '../../../core/models/item.model';

@Component({
  selector: 'app-item-list',
  standalone: true,
  imports: [TranslatePipe],
  changeDetection: ChangeDetectionStrategy.OnPush,
  template: `
    @if (items().length === 0) {
      <div class="flex flex-col items-center justify-center py-20 gap-4 animate-fade-in">
        <div class="w-24 h-24 rounded-full bg-gray-100 dark:bg-gray-800 flex items-center justify-center text-5xl">
          🛒
        </div>
        <div class="text-center">
          <p class="font-semibold text-gray-700 dark:text-gray-300 text-lg">
            {{ 'empty.title' | translate }}
          </p>
          <p class="text-gray-500 dark:text-gray-400 text-sm mt-1">
            {{ 'empty.subtitle' | translate }}
          </p>
        </div>
      </div>
    }

    @if (hasMixedStatuses()) {

      <!-- Active items (pending + in_cart) -->
      <div class="grid grid-cols-1 lg:grid-cols-2 gap-3">
        @for (item of nonPurchasedItems(); track item.id) {
          <div
            class="rounded-2xl shadow-sm border transition-all duration-300 overflow-hidden animate-fade-in
                   hover:-translate-y-0.5 hover:shadow-md group cursor-pointer active:scale-[0.99]"
            [class]="cardClass(item)"
            (click)="statusChange.emit(item.id)"
            [attr.aria-label]="'item.cycle_status' | translate:{ name: item.name }"
            role="button" tabindex="0"
            (keydown.enter)="statusChange.emit(item.id)"
            (keydown.space)="statusChange.emit(item.id)"
          >
            <div class="flex items-center" [class]="innerClass()">
              <div class="rounded-xl flex items-center justify-center flex-shrink-0
                          transition-all duration-200 group-active:scale-90 hover:scale-110 hover:rotate-6"
                   [class]="iconClass(item)" aria-hidden="true">
                {{ catEmoji(item) }}
              </div>
              <div class="flex-1 min-w-0">
                <p class="font-semibold leading-tight transition-all duration-300 group-hover:translate-x-0.5"
                   [class]="nameClass(item)">{{ item.name }}</p>
                <div class="flex items-center gap-2 mt-0.5 flex-wrap">
                  <span [class]="subTextClass(item)">{{ item.quantity }}&nbsp;{{ 'units.' + item.unit | translate }}</span>
                  @if (!compact()) {
                    <span class="w-1 h-1 rounded-full flex-shrink-0" [class]="dotClass(item)"></span>
                    <span class="text-xs" [class]="metaTextClass(item)">{{ 'categories.' + item.category | translate }}</span>
                  }
                </div>
              </div>
              <!-- Right: edit/delete (hover on desktop, always on mobile) then status pill -->
              <div class="flex items-center gap-1.5 flex-shrink-0">
                <div class="flex items-center gap-1
                            lg:opacity-0 lg:translate-x-2
                            lg:group-hover:opacity-100 lg:group-hover:translate-x-0
                            transition-all duration-200 ease-out">
                  <button class="rounded-lg flex items-center justify-center cursor-pointer"
                          [class]="actionButtonClass(item)"
                          (click)="$event.stopPropagation(); edit.emit(item)"
                          [attr.aria-label]="'item.edit' | translate">
                    <svg class="w-4 h-4" fill="none" viewBox="0 0 24 24" stroke="currentColor" stroke-width="2">
                      <path stroke-linecap="round" stroke-linejoin="round" d="M16.862 4.487a2.1 2.1 0 113 3L7.5 19.851l-4 1 1-4 12.362-12.364z"/>
                    </svg>
                  </button>
                  <button class="rounded-lg flex items-center justify-center cursor-pointer"
                          [class]="actionButtonClass(item)"
                          (click)="$event.stopPropagation(); delete.emit(item.id)"
                          [attr.aria-label]="'item.delete' | translate">
                    <svg class="w-4 h-4" fill="none" viewBox="0 0 24 24" stroke="currentColor" stroke-width="2">
                      <path stroke-linecap="round" stroke-linejoin="round" d="M19 7l-.867 12.142A2 2 0 0116.138 21H7.862a2 2 0 01-1.995-1.858L5 7m5 4v6m4-6v6M9 7h6m-7 0a1 1 0 00-1 1v0m9-1a1 1 0 011 1v0M9 7V4a1 1 0 011-1h4a1 1 0 011 1v3"/>
                    </svg>
                  </button>
                </div>
                @if (!compact()) {
                  <span class="hidden sm:inline-flex px-2 py-0.5 rounded-full text-xs font-semibold"
                        [class]="statusPill(item)">{{ statusLabel(item) | translate }}</span>
                }
              </div>
            </div>
          </div>
        }
      </div>

      <!-- Purchased section toggle -->
      <button
        class="w-full flex items-center gap-3 mt-4 mb-2 cursor-pointer group"
        (click)="togglePurchased()"
        [attr.aria-expanded]="showPurchased()"
        [attr.aria-label]="'item.purchased_section' | translate:{ count: purchasedItems().length }"
      >
        <span class="h-px flex-1 bg-gray-200 dark:bg-gray-700"></span>
        <span class="flex items-center gap-1.5 text-xs font-semibold whitespace-nowrap
                     text-gray-500 dark:text-gray-400
                     group-hover:text-gray-700 dark:group-hover:text-gray-200
                     transition-colors duration-150">
          <svg class="w-3.5 h-3.5 transition-transform duration-200"
               [class]="showPurchased() ? 'rotate-0' : '-rotate-90'"
               fill="none" viewBox="0 0 24 24" stroke="currentColor" stroke-width="2.5">
            <path stroke-linecap="round" stroke-linejoin="round" d="M19 9l-7 7-7-7"/>
          </svg>
          {{ 'item.purchased_section' | translate:{ count: purchasedItems().length } }}
        </span>
        <span class="h-px flex-1 bg-gray-200 dark:bg-gray-700"></span>
      </button>

      <!-- Purchased items grid (collapsible) -->
      @if (showPurchased()) {
        <div class="grid grid-cols-1 lg:grid-cols-2 gap-3 animate-fade-in">
          @for (item of purchasedItems(); track item.id) {
            <div
              class="rounded-2xl shadow-sm border transition-all duration-300 overflow-hidden animate-fade-in
                     hover:-translate-y-0.5 hover:shadow-md group cursor-pointer active:scale-[0.99]"
              [class]="cardClass(item)"
              (click)="statusChange.emit(item.id)"
              [attr.aria-label]="'item.cycle_status' | translate:{ name: item.name }"
              role="button" tabindex="0"
              (keydown.enter)="statusChange.emit(item.id)"
              (keydown.space)="statusChange.emit(item.id)"
            >
              <div class="flex items-center" [class]="innerClass()">
                <div class="rounded-xl flex items-center justify-center flex-shrink-0
                            transition-all duration-200 group-active:scale-90 hover:scale-110 hover:rotate-6"
                     [class]="iconClass(item)" aria-hidden="true">
                  {{ catEmoji(item) }}
                </div>
                <div class="flex-1 min-w-0">
                  <p class="font-semibold leading-tight transition-all duration-300 group-hover:translate-x-0.5"
                     [class]="nameClass(item)">{{ item.name }}</p>
                  <div class="flex items-center gap-2 mt-0.5 flex-wrap">
                    <span [class]="subTextClass(item)">{{ item.quantity }}&nbsp;{{ 'units.' + item.unit | translate }}</span>
                    @if (!compact()) {
                      <span class="w-1 h-1 rounded-full flex-shrink-0" [class]="dotClass(item)"></span>
                      <span class="text-xs" [class]="metaTextClass(item)">{{ 'categories.' + item.category | translate }}</span>
                    }
                  </div>
                </div>
                <!-- Right: edit/delete (hover on desktop, always on mobile) then status pill -->
                <div class="flex items-center gap-1.5 flex-shrink-0">
                  <div class="flex items-center gap-1
                              lg:opacity-0 lg:translate-x-2
                              lg:group-hover:opacity-100 lg:group-hover:translate-x-0
                              transition-all duration-200 ease-out">
                    <button class="rounded-lg flex items-center justify-center cursor-pointer"
                            [class]="actionButtonClass(item)"
                            (click)="$event.stopPropagation(); edit.emit(item)"
                            [attr.aria-label]="'item.edit' | translate">
                      <svg class="w-4 h-4" fill="none" viewBox="0 0 24 24" stroke="currentColor" stroke-width="2">
                        <path stroke-linecap="round" stroke-linejoin="round" d="M16.862 4.487a2.1 2.1 0 113 3L7.5 19.851l-4 1 1-4 12.362-12.364z"/>
                      </svg>
                    </button>
                    <button class="rounded-lg flex items-center justify-center cursor-pointer"
                            [class]="actionButtonClass(item)"
                            (click)="$event.stopPropagation(); delete.emit(item.id)"
                            [attr.aria-label]="'item.delete' | translate">
                      <svg class="w-4 h-4" fill="none" viewBox="0 0 24 24" stroke="currentColor" stroke-width="2">
                        <path stroke-linecap="round" stroke-linejoin="round" d="M19 7l-.867 12.142A2 2 0 0116.138 21H7.862a2 2 0 01-1.995-1.858L5 7m5 4v6m4-6v6M9 7h6m-7 0a1 1 0 00-1 1v0m9-1a1 1 0 011 1v0M9 7V4a1 1 0 011-1h4a1 1 0 011 1v3"/>
                      </svg>
                    </button>
                  </div>
                  @if (!compact()) {
                    <span class="hidden sm:inline-flex px-2 py-0.5 rounded-full text-xs font-semibold"
                          [class]="statusPill(item)">{{ statusLabel(item) | translate }}</span>
                  }
                </div>
              </div>
            </div>
          }
        </div>
      }

    } @else {

      <!-- Flat list (single status or single category filtered) -->
      <div class="grid grid-cols-1 lg:grid-cols-2 gap-3">
        @for (item of items(); track item.id) {
          <div
            class="rounded-2xl shadow-sm border transition-all duration-300 overflow-hidden animate-fade-in
                   hover:-translate-y-0.5 hover:shadow-md group cursor-pointer active:scale-[0.99]"
            [class]="cardClass(item)"
            (click)="statusChange.emit(item.id)"
            [attr.aria-label]="'item.cycle_status' | translate:{ name: item.name }"
            role="button" tabindex="0"
            (keydown.enter)="statusChange.emit(item.id)"
            (keydown.space)="statusChange.emit(item.id)"
          >
            <div class="flex items-center" [class]="innerClass()">
              <div class="rounded-xl flex items-center justify-center flex-shrink-0
                          transition-all duration-200 group-active:scale-90 hover:scale-110 hover:rotate-6"
                   [class]="iconClass(item)" aria-hidden="true">
                {{ catEmoji(item) }}
              </div>
              <div class="flex-1 min-w-0">
                <p class="font-semibold leading-tight transition-all duration-300 group-hover:translate-x-0.5"
                   [class]="nameClass(item)">{{ item.name }}</p>
                <div class="flex items-center gap-2 mt-0.5 flex-wrap">
                  <span [class]="subTextClass(item)">{{ item.quantity }}&nbsp;{{ 'units.' + item.unit | translate }}</span>
                  @if (!compact()) {
                    <span class="w-1 h-1 rounded-full flex-shrink-0" [class]="dotClass(item)"></span>
                    <span class="text-xs" [class]="metaTextClass(item)">{{ 'categories.' + item.category | translate }}</span>
                  }
                </div>
              </div>
              <!-- Right: edit/delete (hover on desktop, always on mobile) then status pill -->
              <div class="flex items-center gap-1.5 flex-shrink-0">
                <div class="flex items-center gap-1
                            lg:opacity-0 lg:translate-x-2
                            lg:group-hover:opacity-100 lg:group-hover:translate-x-0
                            transition-all duration-200 ease-out">
                  <button class="rounded-lg flex items-center justify-center cursor-pointer"
                          [class]="actionButtonClass(item)"
                          (click)="$event.stopPropagation(); edit.emit(item)"
                          [attr.aria-label]="'item.edit' | translate">
                    <svg class="w-4 h-4" fill="none" viewBox="0 0 24 24" stroke="currentColor" stroke-width="2">
                      <path stroke-linecap="round" stroke-linejoin="round" d="M16.862 4.487a2.1 2.1 0 113 3L7.5 19.851l-4 1 1-4 12.362-12.364z"/>
                    </svg>
                  </button>
                  <button class="rounded-lg flex items-center justify-center cursor-pointer"
                          [class]="actionButtonClass(item)"
                          (click)="$event.stopPropagation(); delete.emit(item.id)"
                          [attr.aria-label]="'item.delete' | translate">
                    <svg class="w-4 h-4" fill="none" viewBox="0 0 24 24" stroke="currentColor" stroke-width="2">
                      <path stroke-linecap="round" stroke-linejoin="round" d="M19 7l-.867 12.142A2 2 0 0116.138 21H7.862a2 2 0 01-1.995-1.858L5 7m5 4v6m4-6v6M9 7h6m-7 0a1 1 0 00-1 1v0m9-1a1 1 0 011 1v0M9 7V4a1 1 0 011-1h4a1 1 0 011 1v3"/>
                    </svg>
                  </button>
                </div>
                @if (!compact()) {
                  <span class="hidden sm:inline-flex px-2 py-0.5 rounded-full text-xs font-semibold"
                        [class]="statusPill(item)">{{ statusLabel(item) | translate }}</span>
                }
              </div>
            </div>
          </div>
        }
      </div>

    }
  `,
})
export class ItemListComponent {
  readonly items        = input<Item[]>([]);
  readonly compact      = input(false);
  readonly edit         = output<Item>();
  readonly delete       = output<string>();
  readonly statusChange = output<string>();

  readonly showPurchased = signal(true);

  readonly nonPurchasedItems = computed(() => this.items().filter(i => i.status !== 'purchased'));
  readonly purchasedItems    = computed(() => this.items().filter(i => i.status === 'purchased'));
  readonly hasMixedStatuses  = computed(() =>
    this.nonPurchasedItems().length > 0 && this.purchasedItems().length > 0
  );

  togglePurchased(): void { this.showPurchased.update(v => !v); }

  // ── Tailwind class methods ────────────────────────────────────────────────
  //
  // All class strings are written as complete literals so Tailwind JIT can
  // find them during the static scan phase. No dynamic interpolation of
  // color or variant tokens.

  innerClass(): string {
    return this.compact()
      ? 'flex items-center gap-2.5 p-2.5'
      : 'flex items-center gap-3 p-4';
  }

  iconClass(item: Item): string {
    const size = this.compact() ? 'w-9 h-9 text-xl' : 'w-12 h-12 text-2xl';
    const bg   = item.status === 'in_cart' ? 'bg-white/20' : CATEGORY_CONFIG[item.category].iconBg;
    return `${size} ${bg}`;
  }

  nameClass(item: Item): string {
    const size = this.compact() ? 'text-sm' : 'text-base';
    if (item.status === 'purchased') return `${size} line-through text-gray-500 dark:text-gray-400`;
    if (item.status === 'in_cart')   return `${size} text-white`;
    return `${size} text-charcoal dark:text-white`;
  }

  cardClass(item: Item): string {
    if (item.status === 'in_cart')  return 'bg-sage border-sage/20 dark:border-sage/30';
    if (item.status === 'purchased') return 'bg-gray-50 dark:bg-dark-card border-gray-200 dark:border-gray-700/60';
    return 'bg-amber-50/60 dark:bg-amber-900/10 border border-amber-200/60 dark:border-amber-800/20';
  }

  actionButtonClass(item: Item): string {
    const size = this.compact() ? 'w-7 h-7' : 'w-8 h-8';
    return item.status === 'in_cart'
      ? `${size} text-white/80 hover:text-white hover:bg-white/15 hover:scale-110 active:scale-90 transition-all duration-150`
      : `${size} text-gray-500 dark:text-gray-400 hover:bg-gray-100 dark:hover:bg-gray-700 hover:text-gray-700 dark:hover:text-gray-200 hover:scale-110 active:scale-90 transition-all duration-150`;
  }

  subTextClass(item: Item): string {
    const size = this.compact() ? 'text-xs' : 'text-sm';
    return item.status === 'in_cart' ? `${size} text-white/90` : `${size} text-gray-500 dark:text-gray-400`;
  }

  metaTextClass(item: Item): string {
    return item.status === 'in_cart' ? 'text-white/90' : 'text-gray-500 dark:text-gray-400';
  }

  dotClass(item: Item): string {
    return item.status === 'in_cart' ? 'bg-white/60' : 'bg-gray-300 dark:bg-gray-600';
  }

  catEmoji(item: Item): string   { return CATEGORY_CONFIG[item.category].emoji; }
  statusPill(item: Item): string  { return STATUS_CONFIG[item.status].pillClass; }
  statusLabel(item: Item): string { return STATUS_CONFIG[item.status].label; }
}
