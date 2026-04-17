import {
  ChangeDetectionStrategy, Component, computed, inject, signal,
} from '@angular/core';
import { toSignal } from '@angular/core/rxjs-interop';
import { map } from 'rxjs';
import { TitleCasePipe } from '@angular/common';
import { TranslatePipe, TranslateService } from '@ngx-translate/core';
import { DataService } from '../../../core/services/data.service';
import { ToastService } from '../../../core/services/toast.service';
import { STORAGE_KEYS } from '../../../core/constants/storage-keys';
import { Item, ItemCategory, ItemStatus, CATEGORIES, CATEGORY_CONFIG } from '../../../core/models/item.model';
import { ItemListComponent } from '../../pantry/item-list/item-list.component';
import { ItemFormComponent, ItemFormPayload } from '../../pantry/item-form/item-form.component';
import { HelpTourComponent } from '../../../shared/components/help-tour/help-tour.component';
import { ConfirmDialogComponent } from '../../../shared/components/confirm-dialog/confirm-dialog.component';

interface CategoryStat {
  key: ItemCategory;
  emoji: string;
  count: number;
  pendingCount: number;
}

type PendingDelete =
  | { type: 'item'; id: string; name: string }
  | { type: 'clear'; count: number };

@Component({
  selector: 'app-home-page',
  standalone: true,
  imports: [TranslatePipe, TitleCasePipe, ItemListComponent, ItemFormComponent, HelpTourComponent, ConfirmDialogComponent],
  changeDetection: ChangeDetectionStrategy.OnPush,
  templateUrl: './home-page.component.html',
})
export class HomePageComponent {
  private readonly data      = inject(DataService);
  private readonly toast     = inject(ToastService);
  private readonly translate = inject(TranslateService);

  // Drives re-evaluation of computed signals that call translate.instant()
  // whenever the active language changes.
  private readonly lang = toSignal(
    this.translate.onLangChange.pipe(map(e => e.lang)),
    { initialValue: this.translate.currentLang ?? 'en' },
  );

  // ── Data ──────────────────────────────────────────────────────────────────

  // Expose the service's computed stats signal directly — no local copy needed.
  readonly stats = this.data.stats;

  readonly greeting = computed(() => {
    const h = new Date().getHours();
    if (h < 12) return {
      key: 'home.greeting.morning',
      emoji: '☀️',
      bgClass:   'bg-amber-100 dark:bg-amber-900/30',
      glowClass: 'bg-amber-400 dark:bg-amber-500',
    };
    if (h < 18) return {
      key: 'home.greeting.afternoon',
      emoji: '🌤️',
      bgClass:   'bg-sky-100 dark:bg-sky-900/30',
      glowClass: 'bg-sky-400 dark:bg-sky-500',
    };
    return {
      key: 'home.greeting.evening',
      emoji: '🌙',
      bgClass:   'bg-indigo-100 dark:bg-indigo-900/30',
      glowClass: 'bg-indigo-400 dark:bg-indigo-500',
    };
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

  // Only categories that actually have items — avoids cluttering the sidebar
  // with empty slots that add no value as filters.
  readonly nonEmptyCategoryStats = computed(() =>
    this.categoryStats().filter(c => c.count > 0)
  );

  // ── Filters & sort ────────────────────────────────────────────────────────

  readonly selectedCategory = signal<ItemCategory | 'all'>('all');
  readonly selectedStatus   = signal<ItemStatus | 'all'>('all');
  readonly sortBy           = signal<'default' | 'name' | 'category'>('default');
  readonly searchQuery      = signal('');
  readonly isCompact        = signal(false);

  readonly filteredItems = computed<Item[]>(() => {
    const cat    = this.selectedCategory();
    const status = this.selectedStatus();
    const sort   = this.sortBy();
    const query  = this.searchQuery().trim().toLowerCase();

    let items = this.data.items().filter(i =>
      (cat    === 'all' || i.category === cat) &&
      (status === 'all' || i.status   === status) &&
      (query  === ''    || i.name.toLowerCase().includes(query))
    );

    if (sort === 'name')     items = [...items].sort((a, b) => a.name.localeCompare(b.name));
    if (sort === 'category') items = [...items].sort((a, b) => a.category.localeCompare(b.category));

    return items;
  });

  readonly activeLabel = computed(() => {
    this.lang(); // reactive dependency — re-runs on language change
    const cat    = this.selectedCategory();
    const status = this.selectedStatus();
    const catLabel    = cat    !== 'all' ? this.translate.instant('categories.' + cat)    : null;
    const statusLabel = status !== 'all' ? this.translate.instant('filters.' + status)    : null;
    if (catLabel && statusLabel) return `${catLabel} · ${statusLabel}`;
    return catLabel ?? statusLabel ?? this.translate.instant('home.title');
  });

  readonly activeCategoryEmoji = computed(() => {
    const cat = this.selectedCategory();
    return cat !== 'all' ? CATEGORY_CONFIG[cat].emoji : '';
  });

  /** Returns the active category filter, or null if none is selected. */
  readonly activeFilterCategory = computed<ItemCategory | null>(() => {
    const cat = this.selectedCategory();
    return cat !== 'all' ? cat : null;
  });

  /** Tapping the active category again deselects it (toggle). */
  selectCategory(key: ItemCategory | 'all'): void {
    this.selectedCategory.set(this.selectedCategory() === key ? 'all' : key);
  }

  /** Tapping the active status card again deselects it (toggle). */
  selectStatus(status: ItemStatus | 'all'): void {
    this.selectedStatus.set(this.selectedStatus() === status ? 'all' : status);
  }

  clearFilters(): void {
    this.selectedCategory.set('all');
    this.selectedStatus.set('all');
  }

  cycleSortBy(): void {
    const order = ['default', 'name', 'category'] as const;
    const next = order[(order.indexOf(this.sortBy()) + 1) % order.length];
    this.sortBy.set(next);
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

  // ── Stat card classes ─────────────────────────────────────────────────────

  statTotalClass(): string {
    return this.selectedStatus() === 'all'
      ? 'bg-forest shadow-md shadow-forest/20'
      : 'bg-forest/50 dark:bg-forest/40 shadow-sm';
  }

  statPendingClass(): string {
    const sel = this.selectedStatus();
    if (sel === 'pending')
      return 'bg-amber-400 shadow-md shadow-amber-400/25';
    if (sel === 'all')
      return 'bg-amber-50 dark:bg-amber-900/20 border border-amber-100/80 dark:border-amber-800/30 shadow-sm';
    return 'bg-amber-50/50 dark:bg-amber-900/10 border border-amber-100/40 dark:border-amber-800/10 shadow-sm opacity-50 scale-95';
  }

  statInCartClass(): string {
    const sel = this.selectedStatus();
    if (sel === 'in_cart')
      return 'bg-sage shadow-md shadow-sage/25';
    if (sel === 'all')
      return 'bg-sage/10 dark:bg-sage/15 border border-sage/20 shadow-sm';
    return 'bg-sage/5 dark:bg-sage/10 border border-sage/10 shadow-sm opacity-50 scale-95';
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

  onStatusChange(id: string): void {
    this.data.cycleStatus(id);
  }

  // ── Confirm delete ────────────────────────────────────────────────────────

  readonly pendingDelete = signal<PendingDelete | null>(null);

  readonly confirmTitleKey = computed(() =>
    this.pendingDelete()?.type === 'clear' ? 'confirm.title_clear' : 'confirm.title_delete'
  );

  readonly confirmMsgKey = computed(() =>
    this.pendingDelete()?.type === 'clear' ? 'confirm.msg_clear' : 'confirm.msg_delete'
  );

  readonly confirmMsgParams = computed<Record<string, unknown>>(() => {
    const p = this.pendingDelete();
    if (!p) return {};
    return p.type === 'item' ? { name: p.name } : { count: p.count };
  });

  readonly confirmActionKey = computed(() =>
    this.pendingDelete()?.type === 'clear' ? 'confirm.clear' : 'confirm.delete'
  );

  onDelete(id: string): void {
    const item = this.data.items().find(i => i.id === id);
    if (!item) return;
    this.pendingDelete.set({ type: 'item', id, name: item.name });
  }

  onClearPurchased(): void {
    const count = this.data.items().filter(i => i.status === 'purchased').length;
    if (count === 0) return;
    this.pendingDelete.set({ type: 'clear', count });
  }

  confirmDelete(): void {
    const p = this.pendingDelete();
    if (!p) return;
    if (p.type === 'item') {
      const item = this.data.items().find(i => i.id === p.id);
      if (item) {
        this.data.deleteItem(p.id);
        this.toast.show('toast.deleted', 'info', {
          action: { label: 'item.undo', fn: () => this.data.restoreItem(item) },
        });
      }
    } else {
      const purchased = this.data.items().filter(i => i.status === 'purchased');
      this.data.clearPurchased();
      this.toast.show('toast.purchased_cleared', 'info', {
        action: { label: 'item.undo', fn: () => this.data.restoreItems(purchased) },
      });
    }
    this.pendingDelete.set(null);
  }

  cancelDelete(): void {
    this.pendingDelete.set(null);
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
