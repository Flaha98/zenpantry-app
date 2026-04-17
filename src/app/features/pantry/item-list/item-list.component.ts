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
  templateUrl: './item-list.component.html',
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
