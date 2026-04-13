import {
  ChangeDetectionStrategy, Component, inject, signal,
} from '@angular/core';
import { DataService } from '../../../core/services/data.service';
import { Item } from '../../../core/models/item.model';
import { ItemListComponent } from '../item-list/item-list.component';
import { ItemFormComponent, ItemFormPayload } from '../item-form/item-form.component';

@Component({
  selector: 'app-pantry-page',
  standalone: true,
  imports: [ItemListComponent, ItemFormComponent],
  changeDetection: ChangeDetectionStrategy.OnPush,
  template: `
    <div class="min-h-screen bg-gray-50">

      <!-- Stats strip -->
      <div class="px-4 py-3 flex items-center gap-2 text-sm overflow-x-auto">
        <span class="font-semibold text-gray-800">
          {{ dataService.stats().total }}
        </span>
        <span class="text-gray-400">items</span>

        @if (dataService.stats().pending > 0) {
          <span class="w-1 h-1 bg-gray-300 rounded-full flex-shrink-0"></span>
          <span class="font-medium text-amber-600">
            {{ dataService.stats().pending }} pending
          </span>
        }
      </div>

      <!-- Item list -->
      <div class="px-4 pb-28 space-y-3">
        <app-item-list
          [items]="dataService.items()"
          (edit)="openForm($event)"
          (delete)="onDelete($event)"
          (statusChange)="onStatusChange($event)"
        />
      </div>

      <!-- FAB -->
      <button
        class="fixed bottom-6 right-5 w-14 h-14 rounded-full
               bg-orange-500 hover:bg-orange-600 active:scale-90
               text-white shadow-lg shadow-orange-500/40
               flex items-center justify-center
               transition-all duration-200 z-40"
        (click)="openForm(null)"
        aria-label="Add item"
      >
        <svg xmlns="http://www.w3.org/2000/svg" class="w-7 h-7" fill="none" viewBox="0 0 24 24" stroke="currentColor" stroke-width="2.5">
          <path stroke-linecap="round" stroke-linejoin="round" d="M12 4v16m8-8H4" />
        </svg>
      </button>

      <!-- Form modal / bottom sheet -->
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

  // Form state
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

  // CRUD handlers
  onSave(payload: ItemFormPayload): void {
    const editing = this.editingItem();
    if (editing) {
      this.dataService.updateItem(editing.id, payload);
    } else {
      this.dataService.addItem(payload);
    }
    this.closeForm();
  }

  onDelete(id: string): void {
    this.dataService.deleteItem(id);
  }

  onStatusChange(id: string): void {
    this.dataService.cycleStatus(id);
  }
}
