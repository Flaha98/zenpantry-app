import {
  ChangeDetectionStrategy, Component, computed, inject, signal,
} from '@angular/core';
import { TranslatePipe } from '@ngx-translate/core';
import { DataService } from '../../../core/services/data.service';
import { ToastService } from '../../../core/services/toast.service';
import { Item, ItemCategory, ItemStatus } from '../../../core/models/item.model';
import { ItemListComponent } from '../item-list/item-list.component';
import { ItemFormComponent, ItemFormPayload } from '../item-form/item-form.component';
import { FilterBarComponent, FilterState } from '../filter-bar/filter-bar.component';

@Component({
  selector: 'app-pantry-page',
  standalone: true,
  imports: [ItemListComponent, ItemFormComponent, FilterBarComponent,TranslatePipe],
  changeDetection: ChangeDetectionStrategy.OnPush,
  template: `
    <div class="min-h-screen bg-gray-50 dark:bg-dark-bg">
      <div class="sticky top-16 z-30 bg-gray-50/95 dark:bg-dark-bg/95 backdrop-blur-sm border-b border-gray-100 dark:border-gray-800/60 px-4 py-3">
        <app-filter-bar
          [filters]="filters()"
          (filtersChange)="filters.set($event)"
        />
      </div>

      <div class="px-4 py-3 flex items-center gap-2 text-sm overflow-x-auto">
        <span class="font-semibold text-gray-800 dark:text-white">{{ dataService.stats().total }}</span>
        <span class="text-gray-400 dark:text-gray-500">{{ 'stats.items' | translate }}</span>
        @if (dataService.stats().pending > 0) {
          <span class="w-1 h-1 bg-gray-300 dark:bg-gray-600 rounded-full flex-shrink-0"></span>
          <span class="font-medium text-amber-600 dark:text-amber-400">
            {{ dataService.stats().pending }} {{ 'stats.pending' | translate }}
          </span>
        }
      </div>

      <div class="px-4 pb-28 space-y-3">
        <app-item-list
          [items]="filteredItems()"
          (edit)="openForm($event)"
          (delete)="onDelete($event)"
          (statusChange)="onStatusChange($event)"
        />
      </div>

      <button
        class="fixed bottom-6 right-5 w-14 h-14 rounded-full bg-orange-500 hover:bg-orange-600 active:scale-90 text-white shadow-lg shadow-orange-500/40 flex items-center justify-center transition-all duration-200 z-40"
        (click)="openForm(null)"
        [attr.aria-label]="'item.add' | translate"
      >
        <svg xmlns="http://www.w3.org/2000/svg" class="w-7 h-7" fill="none" viewBox="0 0 24 24" stroke="currentColor" stroke-width="2.5">
          <path stroke-linecap="round" stroke-linejoin="round" d="M12 4v16m8-8H4" />
        </svg>
      </button>

      @if (showForm()) {
        <app-item-form
          [item]="editingItem()"
          (save)="onSave($event)"
          (close)="closeForm()"
        />
      }
    </div>
  `,
})
export class PantryPageComponent {
  readonly dataService = inject(DataService);
  private readonly toast = inject(ToastService);
  readonly filters = signal<FilterState>({ category: 'all', status: 'all' });
  readonly filteredItems = computed<Item[]>(() => {
    const { category, status } = this.filters();
    return this.dataService.items().filter(item => {
      if (category !== 'all' && item.category !== (category as ItemCategory)) return false;
      if (status  !== 'all' && item.status   !== (status  as ItemStatus))   return false;
      return true;
    });
  });
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
      this.dataService.updateItem(editing.id, payload);
      this.toast.show('toast.updated');
    } else {
      this.dataService.addItem(payload);
      this.toast.show('toast.added');
    }
    this.closeForm();
  }
  onDelete(id: string): void {
    this.dataService.deleteItem(id);
    this.toast.show('toast.deleted', 'info');
  }
  onStatusChange(id: string): void {
    this.dataService.cycleStatus(id);
  }
}
