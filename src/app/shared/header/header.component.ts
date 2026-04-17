import { ChangeDetectionStrategy, Component, computed, inject, signal } from '@angular/core';
import { TitleCasePipe } from '@angular/common';
import { TranslatePipe } from '@ngx-translate/core';
import { ThemeService } from '../../core/services/theme.service';
import { ToastService } from '../../core/services/toast.service';
import { DataService } from '../../core/services/data.service';
import { Item, CATEGORY_CONFIG } from '../../core/models/item.model';
import { LanguageSwitcherComponent } from '../components/language-switcher/language-switcher.component';

@Component({
  selector: 'app-header',
  standalone: true,
  imports: [TranslatePipe, TitleCasePipe, LanguageSwitcherComponent],
  changeDetection: ChangeDetectionStrategy.OnPush,
  templateUrl: './header.component.html',
})
export class HeaderComponent {
  readonly theme = inject(ThemeService);
  private readonly data  = inject(DataService);
  private readonly toast = inject(ToastService);

  readonly stats             = this.data.stats;
  readonly showNotifications = signal(false);
  readonly pendingItems      = computed<Item[]>(() =>
    this.data.items().filter(i => i.status === 'pending')
  );

  toggleNotifications(): void { this.showNotifications.update(v => !v); }
  closeNotifications(): void  { this.showNotifications.set(false); }

  moveToCart(id: string): void {
    this.data.cycleStatus(id);
  }

  markAllInCart(): void {
    this.pendingItems().forEach(item => this.data.cycleStatus(item.id));
    this.closeNotifications();
    this.toast.show('toast.all_in_cart');
  }

  categoryEmoji(item: Item): string {
    return CATEGORY_CONFIG[item.category].emoji;
  }

  categoryIconBg(item: Item): string {
    return CATEGORY_CONFIG[item.category].iconBg;
  }
}
