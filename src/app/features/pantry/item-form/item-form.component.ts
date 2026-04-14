import {
  ChangeDetectionStrategy, Component, EventEmitter, inject, Input, OnInit, Output,
} from '@angular/core';
import { FormBuilder, ReactiveFormsModule, Validators } from '@angular/forms';
import { TranslatePipe } from '@ngx-translate/core';
import {
  Item, ItemCategory, ItemStatus, ItemUnit, CATEGORIES, UNITS,
} from '../../../core/models/item.model';

export type ItemFormPayload = Omit<Item, 'id' | 'createdAt'>;

@Component({
  selector: 'app-item-form',
  standalone: true,
  imports: [ReactiveFormsModule, TranslatePipe],
  changeDetection: ChangeDetectionStrategy.OnPush,
  template: `
    <div
      class="fixed inset-0 z-50 flex items-end sm:items-center justify-center bg-black/40"
      (click)="onBackdropClick($event)"
      role="dialog"
      aria-modal="true"
    >
      <div
        class="w-full sm:max-w-md bg-white dark:bg-dark-card rounded-t-3xl sm:rounded-3xl shadow-lg overflow-hidden"
        (click)="$event.stopPropagation()"
      >
        <div class="flex justify-center pt-3 pb-1 sm:hidden">
          <div class="w-10 h-1 bg-gray-200 dark:bg-gray-700 rounded-full"></div>
        </div>

        <div class="flex items-center justify-between px-6 pt-4 pb-2">
          <h2 class="text-lg font-bold text-charcoal dark:text-white">
            {{ (item ? 'item.edit' : 'item.add') | translate }}
          </h2>
          <button
            class="w-8 h-8 rounded-full flex items-center justify-center
                   bg-gray-100 dark:bg-gray-700 text-gray-500 dark:text-gray-400
                   hover:bg-gray-200 dark:hover:bg-gray-600"
            (click)="close.emit()"
            aria-label="Close"
          >✕</button>
        </div>

        <form [formGroup]="form" (ngSubmit)="submit()" class="px-6 pt-2 pb-8 space-y-4">

          <div>
            <label class="block text-xs font-semibold text-gray-500 dark:text-gray-400 mb-1.5 uppercase tracking-wide">
              {{ 'item.name' | translate }}
            </label>
            <input
              formControlName="name"
              type="text"
              class="w-full px-4 py-3 rounded-xl border text-sm
                     bg-gray-50 dark:bg-gray-800 border-gray-200 dark:border-gray-700
                     text-charcoal dark:text-white placeholder-gray-400
                     focus:outline-none focus:border-gray-400 dark:focus:border-gray-500"
              [placeholder]="'item.name.placeholder' | translate"
              autocomplete="off"
            >
            @if (form.get('name')?.invalid && form.get('name')?.touched) {
              <p class="text-red-500 text-xs mt-1">Name is required</p>
            }
          </div>

          <div class="flex gap-3">
            <div class="flex-1">
              <label class="block text-xs font-semibold text-gray-500 dark:text-gray-400 mb-1.5 uppercase tracking-wide">
                {{ 'item.quantity' | translate }}
              </label>
              <input
                formControlName="quantity"
                type="number"
                min="0.1"
                step="any"
                class="w-full px-4 py-3 rounded-xl border text-sm
                       bg-gray-50 dark:bg-gray-800 border-gray-200 dark:border-gray-700
                       text-charcoal dark:text-white placeholder-gray-400
                       focus:outline-none focus:border-gray-400 dark:focus:border-gray-500"
                [placeholder]="'item.quantity.placeholder' | translate"
              >
            </div>
            <div class="w-28">
              <label class="block text-xs font-semibold text-gray-500 dark:text-gray-400 mb-1.5 uppercase tracking-wide">
                {{ 'item.unit' | translate }}
              </label>
              <select
                formControlName="unit"
                class="w-full px-3 py-3 rounded-xl border text-sm
                       bg-gray-50 dark:bg-gray-800 border-gray-200 dark:border-gray-700
                       text-charcoal dark:text-white
                       focus:outline-none focus:border-gray-400 dark:focus:border-gray-500"
              >
                @for (u of units; track u) {
                  <option [value]="u">{{ 'units.' + u | translate }}</option>
                }
              </select>
            </div>
          </div>

          <div>
            <label class="block text-xs font-semibold text-gray-500 dark:text-gray-400 mb-2 uppercase tracking-wide">
              {{ 'item.category' | translate }}
            </label>
            <div class="grid grid-cols-4 gap-2">
              @for (cat of categories; track cat) {
                <button
                  type="button"
                  class="flex flex-col items-center gap-1 py-2.5 rounded-xl border text-xs font-medium"
                  [class]="form.get('category')?.value === cat
                    ? 'bg-green-600 border-green-600 text-white'
                    : 'bg-gray-50 dark:bg-gray-800 border-gray-200 dark:border-gray-700 text-gray-600 dark:text-gray-400 hover:border-gray-400 dark:hover:border-gray-500'"
                  (click)="form.patchValue({ category: cat })"
                >
                  <span class="text-xl leading-none">{{ catEmoji(cat) }}</span>
                  <span class="truncate w-full text-center">{{ 'categories.' + cat | translate }}</span>
                </button>
              }
            </div>
          </div>

          <div>
            <label class="block text-xs font-semibold text-gray-500 dark:text-gray-400 mb-2 uppercase tracking-wide">
              {{ 'item.status' | translate }}
            </label>
            <div class="flex gap-2">
              @for (s of statusOptions; track s.value) {
                <button
                  type="button"
                  class="flex-1 py-2.5 rounded-xl border text-xs font-semibold"
                  [class]="form.get('status')?.value === s.value
                    ? 'bg-green-600 border-green-600 text-white'
                    : 'bg-gray-50 dark:bg-gray-800 border-gray-200 dark:border-gray-700 text-gray-600 dark:text-gray-400 hover:border-gray-400 dark:hover:border-gray-500'"
                  (click)="form.patchValue({ status: s.value })"
                >{{ s.labelKey | translate }}</button>
              }
            </div>
          </div>

          <div class="flex gap-3 pt-2">
            <button
              type="button"
              class="flex-1 py-3 rounded-xl border border-gray-200 dark:border-gray-700
                     text-sm font-semibold text-gray-600 dark:text-gray-400
                     hover:bg-gray-50 dark:hover:bg-gray-800"
              (click)="close.emit()"
            >{{ 'item.cancel' | translate }}</button>

            <button
              type="submit"
              [disabled]="form.invalid"
              class="flex-1 py-3 rounded-xl text-sm font-semibold text-white
                     disabled:opacity-50 disabled:cursor-not-allowed"
              [class]="form.invalid ? 'bg-gray-400' : 'bg-green-600 hover:bg-green-700'"
            >{{ 'item.save' | translate }}</button>
          </div>
        </form>
      </div>
    </div>
  `,
})
export class ItemFormComponent implements OnInit {
  @Input() item: Item | null = null;
  @Output() save  = new EventEmitter<ItemFormPayload>();
  @Output() close = new EventEmitter<void>();

  private readonly fb = inject(FormBuilder);

  readonly categories = CATEGORIES;
  readonly units       = UNITS;

  readonly statusOptions: Array<{ value: ItemStatus; labelKey: string }> = [
    { value: 'pending',   labelKey: 'filters.pending'   },
    { value: 'in_cart',   labelKey: 'filters.in_cart'   },
    { value: 'purchased', labelKey: 'filters.purchased' },
  ];

  form = this.fb.nonNullable.group({
    name:     ['',        Validators.required],
    quantity: [1,         [Validators.required, Validators.min(0.1)]],
    unit:     ['unit' as ItemUnit],
    category: ['fruits'   as ItemCategory],
    status:   ['pending'  as ItemStatus],
  });

  private readonly emojiMap: Record<ItemCategory, string> = {
    fruits: '🍎', vegetables: '🥦', dairy: '🥛', meat: '🥩',
    bakery: '🍞', beverages: '🥤', cleaning: '🧹', other: '📦',
  };

  ngOnInit(): void {
    if (this.item) {
      this.form.patchValue({
        name:     this.item.name,
        quantity: this.item.quantity,
        unit:     this.item.unit,
        category: this.item.category,
        status:   this.item.status,
      });
    }
  }

  catEmoji(cat: ItemCategory): string {
    return this.emojiMap[cat];
  }

  submit(): void {
    if (this.form.invalid) return;
    this.save.emit(this.form.getRawValue() as ItemFormPayload);
  }

  onBackdropClick(event: MouseEvent): void {
    if (event.target === event.currentTarget) this.close.emit();
  }
}
