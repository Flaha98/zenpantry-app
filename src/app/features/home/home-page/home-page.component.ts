import {
  ChangeDetectionStrategy, Component, computed, inject, signal,
} from '@angular/core';
import { TitleCasePipe } from '@angular/common';
import { TranslatePipe } from '@ngx-translate/core';
import { DataService } from '../../../core/services/data.service';
import { ToastService } from '../../../core/services/toast.service';
import { STORAGE_KEYS } from '../../../core/constants/storage-keys';
import { Item, ItemCategory, CATEGORIES, CATEGORY_CONFIG } from '../../../core/models/item.model';
import { ItemListComponent } from '../../pantry/item-list/item-list.component';
import { ItemFormComponent, ItemFormPayload } from '../../pantry/item-form/item-form.component';
import { HelpTourComponent } from '../../../shared/components/help-tour/help-tour.component';

interface CategoryStat {
  key: ItemCategory;
  emoji: string;
  count: number;
  pendingCount: number;
}

@Component({
  selector: 'app-home-page',
  standalone: true,
  imports: [TranslatePipe, TitleCasePipe, ItemListComponent, ItemFormComponent, HelpTourComponent],
  changeDetection: ChangeDetectionStrategy.OnPush,
  template: `
    <div class="min-h-screen bg-cream dark:bg-dark-bg">

      <!-- ── HERO ───────────────────────────────────────────────────────── -->
      <section class="px-4 pt-6 pb-2 animate-fade-in">

        <div class="flex items-start justify-between mb-5">
          <div>
            <p class="text-sm text-gray-400 dark:text-gray-500 flex items-center gap-1.5">
              <span class="text-base leading-none">{{ greeting().emoji }}</span>
              {{ greeting().text }}
            </p>
            <h1 class="text-2xl font-bold text-charcoal dark:text-white mt-0.5 tracking-tight">
              {{ 'home.title' | translate }}
            </h1>
          </div>

          <!-- Bell button + notification panel -->
          <div class="relative">

            <button
              class="relative w-11 h-11 rounded-2xl flex items-center justify-center
                     bg-white dark:bg-dark-card shadow-sm
                     active:scale-90 transition-all duration-200"
              [attr.aria-label]="'home.notifications' | translate"
              (click)="toggleNotifications()"
            >
              <svg class="w-5 h-5 text-charcoal dark:text-white" fill="none" viewBox="0 0 24 24"
                   stroke="currentColor" stroke-width="1.8">
                <path stroke-linecap="round" stroke-linejoin="round"
                  d="M15 17h5l-1.405-1.405A2.032 2.032 0 0118 14.158V11a6.002 6.002 0 00-4-5.659V5a2 2 0 10-4 0v.341C7.67 6.165 6 8.388 6 11v3.159c0 .538-.214 1.055-.595 1.436L4 17h5m6 0v1a3 3 0 11-6 0v-1m6 0H9" />
              </svg>
              @if (stats().pending > 0) {
                <span
                  class="absolute -top-1 -right-1 min-w-[18px] h-[18px] px-1
                         bg-orange-500 rounded-full text-white text-[10px] font-bold
                         flex items-center justify-center animate-pop-in">
                  {{ stats().pending > 9 ? '9+' : stats().pending }}
                </span>
              }
            </button>

            @if (showNotifications()) {
              <!-- Backdrop: click fuera cierra el panel -->
              <div
                class="fixed inset-0 z-40"
                (click)="closeNotifications()">
              </div>

              <!-- Notification panel -->
              <div
                class="absolute top-full mt-2 right-0 w-72 z-50
                       bg-white dark:bg-dark-card rounded-2xl
                       shadow-xl shadow-black/10 dark:shadow-black/40
                       border border-gray-100 dark:border-gray-800/60
                       animate-fade-in overflow-hidden">

                <!-- Panel header -->
                <div class="flex items-center justify-between px-4 py-3
                            border-b border-gray-100 dark:border-gray-800/60">
                  <span class="text-sm font-bold text-charcoal dark:text-white flex items-center gap-2">
                    🔔 {{ 'stats.pending' | translate }}
                    @if (pendingItems().length > 0) {
                      <span class="min-w-[20px] h-5 px-1 bg-orange-500 rounded-full
                                   text-white text-[10px] font-bold
                                   flex items-center justify-center">
                        {{ pendingItems().length }}
                      </span>
                    }
                  </span>
                  <button
                    class="w-6 h-6 rounded-full flex items-center justify-center
                           text-gray-400 hover:text-charcoal dark:hover:text-white
                           hover:bg-gray-100 dark:hover:bg-gray-700
                           active:scale-90 transition-all duration-150"
                    (click)="closeNotifications()"
                    aria-label="Close">
                    <svg class="w-3.5 h-3.5" fill="none" viewBox="0 0 24 24"
                         stroke="currentColor" stroke-width="2.5">
                      <path stroke-linecap="round" stroke-linejoin="round" d="M6 18L18 6M6 6l12 12" />
                    </svg>
                  </button>
                </div>

                <!-- Empty state -->
                @if (pendingItems().length === 0) {
                  <div class="py-8 flex flex-col items-center gap-2">
                    <span class="text-3xl">🎉</span>
                    <p class="text-sm text-gray-400 dark:text-gray-500">
                      {{ 'home.notif.empty' | translate }}
                    </p>
                  </div>

                } @else {
                  <!-- Pending items list -->
                  <div class="max-h-52 overflow-y-auto">
                    @for (item of pendingItems(); track item.id) {
                      <button
                        class="w-full flex items-center gap-3 px-4 py-3 text-left
                               hover:bg-gray-50 dark:hover:bg-gray-700/50
                               active:bg-gray-100 dark:active:bg-gray-700
                               transition-colors duration-150"
                        (click)="moveToCart(item.id)">
                        <span class="text-xl leading-none flex-shrink-0">
                          {{ categoryEmoji(item) }}
                        </span>
                        <div class="flex-1 min-w-0">
                          <p class="text-sm font-medium text-charcoal dark:text-white truncate">
                            {{ item.name }}
                          </p>
                          <p class="text-xs text-gray-400">
                            {{ item.quantity }}&nbsp;{{ 'units.' + item.unit | translate }}
                          </p>
                        </div>
                        <!-- Cart icon: tap to move to cart -->
                        <svg class="w-4 h-4 text-sage flex-shrink-0" fill="none"
                             viewBox="0 0 24 24" stroke="currentColor" stroke-width="1.8">
                          <path stroke-linecap="round" stroke-linejoin="round"
                            d="M3 3h2l.4 2M7 13h10l4-8H5.4M7 13L5.4 5M7 13l-2.293 2.293c-.63.63-.184 1.707.707 1.707H17m0 0a2 2 0 100 4 2 2 0 000-4zm-8 2a2 2 0 11-4 0 2 2 0 014 0z" />
                        </svg>
                      </button>
                    }
                  </div>

                  <!-- Mark all footer -->
                  <div class="px-4 py-3 border-t border-gray-100 dark:border-gray-800/60">
                    <button
                      class="w-full py-2.5 rounded-xl bg-forest hover:bg-forest/90
                             text-white text-sm font-semibold
                             active:scale-95 transition-all duration-150
                             shadow-sm shadow-forest/25"
                      (click)="markAllInCart()">
                      {{ 'home.notif.mark_all' | translate }}
                    </button>
                  </div>
                }
              </div>
            }
          </div>
        </div>

        <!-- Progress card -->
        @if (stats().total > 0) {
          <div class="bg-white dark:bg-dark-card rounded-2xl p-4 shadow-sm mb-4
                      border border-gray-100/80 dark:border-gray-800/60">
            <div class="flex items-center justify-between mb-2.5">
              <span class="text-sm font-semibold text-charcoal dark:text-white">
                {{ 'home.progress' | translate }}
              </span>
              <span
                class="text-sm font-bold tabular-nums"
                [class]="completionPct() === 100
                  ? 'text-forest dark:text-sage'
                  : 'text-orange-500'">
                {{ completionPct() }}%
              </span>
            </div>
            <div class="h-2.5 bg-gray-100 dark:bg-gray-700/80 rounded-full overflow-hidden">
              <div
                class="h-full rounded-full transition-all duration-700 ease-out"
                [class]="completionPct() === 100
                  ? 'bg-gradient-to-r from-forest to-sage'
                  : 'bg-gradient-to-r from-orange-400 to-orange-500'"
                [style.width.%]="completionPct()">
              </div>
            </div>
            <p class="mt-2 text-xs text-gray-400 dark:text-gray-500">
              {{ stats().purchased }}&nbsp;{{ 'home.of' | translate }}&nbsp;{{ stats().total }}&nbsp;{{ 'stats.items' | translate }}&nbsp;{{ 'home.purchased' | translate }}
            </p>
          </div>
        }

        <!-- Stat cards -->
        <div class="grid grid-cols-3 gap-3">
          <!-- Total -->
          <div
            class="bg-forest rounded-2xl p-3.5 text-center shadow-md shadow-forest/20
                   transition-transform duration-150 active:scale-95 animate-pop-in"
            style="animation-delay: 0ms">
            <p class="text-2xl font-bold text-white tabular-nums">{{ stats().total }}</p>
            <p class="text-[11px] text-white/70 mt-0.5 font-medium">{{ 'stats.items' | translate }}</p>
          </div>

          <!-- Pending -->
          <div
            class="bg-amber-50 dark:bg-amber-900/20 rounded-2xl p-3.5 text-center shadow-sm
                   border border-amber-100/80 dark:border-amber-800/30
                   transition-transform duration-150 active:scale-95 animate-pop-in"
            style="animation-delay: 60ms">
            <p class="text-2xl font-bold text-amber-600 dark:text-amber-400 tabular-nums">{{ stats().pending }}</p>
            <p class="text-[11px] text-amber-500/80 dark:text-amber-500/70 mt-0.5 font-medium">{{ 'stats.pending' | translate }}</p>
          </div>

          <!-- In Cart -->
          <div
            class="bg-sage/10 dark:bg-sage/15 rounded-2xl p-3.5 text-center shadow-sm
                   border border-sage/20 dark:border-sage/20
                   transition-transform duration-150 active:scale-95 animate-pop-in"
            style="animation-delay: 120ms">
            <p class="text-2xl font-bold text-sage tabular-nums">{{ stats().inCart }}</p>
            <p class="text-[11px] text-sage/70 mt-0.5 font-medium">{{ 'stats.in_cart' | translate }}</p>
          </div>
        </div>
      </section>

      <!-- ── CATEGORY GRID ──────────────────────────────────────────────── -->
      <section class="px-4 pt-5 pb-2">

        <div class="flex items-center justify-between mb-3">
          <h2 class="font-bold text-charcoal dark:text-white text-base">
            {{ 'home.categories' | translate }}
          </h2>
          @if (selectedCategory() !== 'all') {
            <button
              class="text-xs font-semibold text-orange-500 active:opacity-70 transition-opacity"
              (click)="selectCategory('all')">
              {{ 'home.clear_filter' | translate }}
            </button>
          }
        </div>

        <div class="grid grid-cols-4 gap-2">
          @for (cat of categoryStats(); track cat.key; let i = $index) {
            <button
              class="relative flex flex-col items-center justify-center gap-1 py-3 px-1 rounded-2xl
                     transition-all duration-200 active:scale-90 focus:outline-none focus-visible:ring-2
                     focus-visible:ring-forest/40 animate-pop-in"
              [class]="catCardClass(cat.key)"
              [style.animationDelay]="(i * 30) + 'ms'"
              (click)="selectCategory(cat.key)"
            >
              <span class="text-2xl leading-none">{{ cat.emoji }}</span>
              <span class="text-[10px] font-semibold leading-tight text-center truncate w-full px-0.5 capitalize">
                {{ 'categories.' + cat.key | translate }}
              </span>
              @if (cat.count > 0) {
                <span
                  class="absolute -top-1 -right-1 min-w-[16px] h-4 px-1 rounded-full
                         text-[9px] font-bold flex items-center justify-center"
                  [class]="catBadgeClass(cat.key)">
                  {{ cat.count }}
                </span>
              }
            </button>
          }
        </div>
      </section>

      <!-- ── ITEMS LIST ──────────────────────────────────────────────────── -->
      <section class="px-4 pt-4 pb-28">

        <div class="flex items-center justify-between mb-3">
          <h2 class="font-bold text-charcoal dark:text-white text-base flex items-center gap-2">
            @if (selectedCategory() !== 'all') {
              <span class="text-lg leading-none">{{ activeCategoryEmoji() }}</span>
            }
            {{ activeLabel() | titlecase }}
          </h2>
          <span class="text-xs font-medium text-gray-400 dark:text-gray-500 tabular-nums">
            {{ filteredItems().length }}&nbsp;{{ 'stats.items' | translate }}
          </span>
        </div>

        <app-item-list
          [items]="filteredItems()"
          (edit)="openForm($event)"
          (delete)="onDelete($event)"
          (statusChange)="onStatusChange($event)"
        />
      </section>

      <!-- ── HELP BUTTON ───────────────────────────────────────────────── -->
      <button
        class="fixed bottom-6 left-5 w-11 h-11 rounded-full z-40
               bg-white dark:bg-dark-card shadow-md
               text-gray-400 dark:text-gray-500
               hover:text-forest dark:hover:text-sage hover:shadow-lg
               flex items-center justify-center
               active:scale-90 transition-all duration-200"
        (click)="openHelp()"
        [attr.aria-label]="'help.open' | translate"
      >
        <svg class="w-5 h-5" fill="none" viewBox="0 0 24 24" stroke="currentColor" stroke-width="1.8">
          <path stroke-linecap="round" stroke-linejoin="round"
            d="M8.228 9c.549-1.165 2.03-2 3.772-2 2.21 0 4 1.343 4 3 0 1.4-1.278 2.575-3.006 2.907-.542.104-.994.54-.994 1.093m0 3h.01M21 12a9 9 0 11-18 0 9 9 0 0118 0z" />
        </svg>
      </button>

      <!-- ── FAB ───────────────────────────────────────────────────────── -->
      <button
        class="fixed bottom-6 right-5 w-14 h-14 rounded-full
               bg-orange-500 hover:bg-orange-600 active:scale-90
               text-white shadow-lg shadow-orange-500/40
               flex items-center justify-center
               transition-all duration-200 z-40 group"
        (click)="openForm(null)"
        [attr.aria-label]="'item.add' | translate"
      >
        <svg
          class="w-7 h-7 transition-transform duration-300 group-active:rotate-45"
          fill="none" viewBox="0 0 24 24" stroke="currentColor" stroke-width="2.5">
          <path stroke-linecap="round" stroke-linejoin="round" d="M12 4v16m8-8H4" />
        </svg>
      </button>

      <!-- ── ITEM FORM MODAL ────────────────────────────────────────────── -->
      @if (showForm()) {
        <app-item-form
          [item]="editingItem()"
          (save)="onSave($event)"
          (close)="closeForm()"
        />
      }

      <!-- ── HELP TOUR ─────────────────────────────────────────────────── -->
      @if (showHelp()) {
        <app-help-tour (close)="closeHelp()" />
      }
    </div>
  `,
})
export class HomePageComponent {
  private readonly data  = inject(DataService);
  private readonly toast = inject(ToastService);

  // ── Data ──────────────────────────────────────────────────────────────────

  // Expose the service's computed stats signal directly — no local copy needed.
  readonly stats = this.data.stats;

  readonly greeting = computed(() => {
    const h = new Date().getHours();
    if (h < 12) return { text: 'Good morning', emoji: '☀️' };
    if (h < 18) return { text: 'Good afternoon', emoji: '🌤️' };
    return { text: 'Good evening', emoji: '🌙' };
  });

  readonly completionPct = computed(() => {
    const { total, purchased } = this.stats();
    return total === 0 ? 0 : Math.round((purchased / total) * 100);
  });

  readonly categoryStats = computed<CategoryStat[]>(() => {
    const items = this.data.items();
    return CATEGORIES.map(key => ({
      key,
      emoji: CATEGORY_CONFIG[key].emoji,
      count: items.filter(i => i.category === key).length,
      pendingCount: items.filter(i => i.category === key && i.status === 'pending').length,
    }));
  });

  // ── Notifications ─────────────────────────────────────────────────────────

  readonly showNotifications = signal(false);

  // Derived from the global items signal — updates reactively whenever an
  // item's status changes, keeping the panel list in sync without extra state.
  readonly pendingItems = computed<Item[]>(() =>
    this.data.items().filter(i => i.status === 'pending')
  );

  toggleNotifications(): void {
    this.showNotifications.update(v => !v);
  }

  closeNotifications(): void {
    this.showNotifications.set(false);
  }

  moveToCart(id: string): void {
    this.data.cycleStatus(id); // pending → in_cart (first step of STATUS_CYCLE)
  }

  markAllInCart(): void {
    // Snapshot the pending list before cycling — cycleStatus mutates the signal,
    // which would shorten the array mid-iteration if we iterated over the live
    // computed. The forEach here iterates over the captured array, not the signal.
    this.pendingItems().forEach(item => this.data.cycleStatus(item.id));
    this.closeNotifications();
    this.toast.show('toast.all_in_cart');
  }

  categoryEmoji(item: Item): string {
    return CATEGORY_CONFIG[item.category].emoji;
  }

  // ── Category filter ───────────────────────────────────────────────────────

  readonly selectedCategory = signal<ItemCategory | 'all'>('all');

  readonly filteredItems = computed<Item[]>(() => {
    const cat = this.selectedCategory();
    const items = this.data.items();
    return cat === 'all' ? items : items.filter(i => i.category === cat);
  });

  readonly activeLabel = computed(() => {
    const cat = this.selectedCategory();
    return cat === 'all' ? 'All items' : cat;
  });

  readonly activeCategoryEmoji = computed(() => {
    const cat = this.selectedCategory();
    return cat !== 'all' ? CATEGORY_CONFIG[cat].emoji : '';
  });

  /**
   * Tapping the already-active category deselects it (shows all items).
   * This toggle behaviour avoids needing a separate "clear filter" tap for
   * the common case of undoing the last selection.
   */
  selectCategory(key: ItemCategory | 'all'): void {
    this.selectedCategory.set(this.selectedCategory() === key ? 'all' : key);
  }

  // ── Category card classes ─────────────────────────────────────────────────

  catCardClass(key: ItemCategory): string {
    return this.selectedCategory() === key
      ? 'bg-forest text-white shadow-lg shadow-forest/25'
      : 'bg-white dark:bg-dark-card text-charcoal dark:text-white shadow-sm hover:shadow-md';
  }

  catBadgeClass(key: ItemCategory): string {
    return this.selectedCategory() === key
      ? 'bg-orange-400 text-white'
      : 'bg-forest text-white';
  }

  // ── Form ──────────────────────────────────────────────────────────────────

  readonly showForm    = signal(false);
  readonly editingItem = signal<Item | null>(null);

  openForm(item: Item | null): void {
    this.editingItem.set(item);
    this.showForm.set(true);
  }

  closeForm(): void {
    this.showForm.set(false);
    this.editingItem.set(null);
  }

  onSave(payload: ItemFormPayload): void {
    const editing = this.editingItem();
    if (editing) {
      this.data.updateItem(editing.id, payload);
      this.toast.show('toast.updated');
    } else {
      this.data.addItem(payload);
      this.toast.show('toast.added');
    }
    this.closeForm();
  }

  onDelete(id: string): void {
    this.data.deleteItem(id);
    this.toast.show('toast.deleted', 'info');
  }

  onStatusChange(id: string): void {
    this.data.cycleStatus(id);
  }

  // ── Help tour ─────────────────────────────────────────────────────────────

  readonly showHelp = signal(false);

  constructor() {
    // Show the tour automatically on the first visit only.
    // The 700 ms delay lets the home screen finish its entrance animations
    // before the overlay appears, avoiding a jarring simultaneous render.
    if (!localStorage.getItem(STORAGE_KEYS.helpSeen)) {
      setTimeout(() => this.showHelp.set(true), 700);
    }
  }

  openHelp(): void {
    this.showHelp.set(true);
  }

  closeHelp(): void {
    // Persist the flag regardless of whether the user finished or skipped —
    // we only want the auto-show to fire once, never on subsequent visits.
    localStorage.setItem(STORAGE_KEYS.helpSeen, '1');
    this.showHelp.set(false);
  }
}
