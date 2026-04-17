import {
  ChangeDetectionStrategy, Component, computed, inject, signal,
} from '@angular/core';
import { TranslatePipe } from '@ngx-translate/core';
import { DataService } from '../../../core/services/data.service';
import { ToastService } from '../../../core/services/toast.service';
import { Item } from '../../../core/models/item.model';
import { FilterBarComponent, FilterState } from '../filter-bar/filter-bar.component';
import { ItemListComponent } from '../item-list/item-list.component';
import { ItemFormComponent, ItemFormPayload } from '../item-form/item-form.component';

@Component({
  selector: 'app-pantry-page',
  standalone: true,
  imports: [TranslatePipe, FilterBarComponent, ItemListComponent, ItemFormComponent],
  changeDetection: ChangeDetectionStrategy.OnPush,
  templateUrl: './pantry-page.component.html',
})
export class PantryPageComponent {
  private readonly _data = inject(DataService);
  private readonly toast = inject(ToastService);

  readonly stats = this._data.stats;

  readonly filters = signal<FilterState>({ category: 'all', status: 'all' });

  readonly filteredItems = computed<Item[]>(() => {
    const { category, status } = this.filters();
    return this._data.items().filter(item => {
      const matchesCategory = category === 'all' || item.category === category;
      const matchesStatus   = status   === 'all' || item.status   === status;
      return matchesCategory && matchesStatus;
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
      this._data.updateItem(editing.id, payload);
      this.toast.show('toast.updated');
    } else {
      this._data.addItem(payload);
      this.toast.show('toast.added');
    }
    this.closeForm();
  }

  onDelete(id: string): void {
    this._data.deleteItem(id);
    this.toast.show('toast.deleted', 'info');
  }

  onStatusChange(id: string): void {
    this._data.cycleStatus(id);
  }
}
