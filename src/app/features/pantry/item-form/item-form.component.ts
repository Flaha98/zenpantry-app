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
    <!-- Backdrop -->
    <div
      class="fixed inset-0 z-50 flex items-end sm:items-center justify-center bg-black/40 backdrop-blur-sm"
      (click)="onBackdropClick($event)"
      role="dialog"
      aria-modal="true"
    >
      <!-- Sheet -->
      <div
        class="w-full sm:max-w-md bg-white dark:bg-dark-card rounded-t-3xl sm:rounded-3xl
               shadow-2xl animate-slide-up sm:animate-pop-in overflow-hidden"
        (click)="$event.stopPropagation()"
      >
        <!-- Handle (mobile only) -->
        <div class="flex justify-center pt-3 pb-1 sm:hidden">
          <div class="w-10 h-1 bg-gray-200 dark:bg-gray-700 rounded-full"></div>
        </div>

        <!-- Header -->
        <div class="flex items-center justify-between px-6 pt-4 pb-2">
          <h2 class="text-lg font-bold text-charcoal dark:text-white">
            {{ (item ? 'item.edit' : 'item.add') | translate }}
          </h2>
          <button
            class="w-8 h-8 rounded-full flex items-center justify-center
                   bg-gray-100 dark:bg-gray-700 text-gray-500 dark:text-gray-400
                   hover:bg-gray-200 dark:hover:bg-gray-600 active:scale-90 transition-all"
            (click)="close.emit()"
            aria-label="Close"
          >✕</button>
        </div>

        <!-- Form -->
        <form [formGroup]="form" (ngSubmit)="submit()" class="px-6 pt-2 pb-8 space-y-4">

          <!-- Name -->
          <div>
            <label class="block text-xs font-semibold text-gray-500 dark:text-gray-400 mb-1.5 uppercase tracking-wide">
              {{ 'item.name' | translate }}
            </label>
            <input
              formControlName="name"
              type="text"
              class="w-full px-4 py-3 rounded-xl border text-sm transition-colors
                     bg-gray-50 dark:bg-gray-800 border-gray-200 dark:border-gray-700
                     text-charcoal dark:text-white placeholder-gray-400
                     focus:outline-none focus:border-forest dark:focus:border-sage focus:ring-2 focus:ring-forest/10 dark:focus:ring-sage/10"
              [placeholder]="'item.name.placeholder' | translate"
              autocomplete="off"
            >
            @if (form.get('name')?.invalid && form.get('name')?.touched) {
              <p class="text-red-500 text-xs mt-1">Name is required</p>
            }
          </div>

          <!-- Quantity + Unit (side-by-side) -->
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
                class="w-full px-4 py-3 rounded-xl border text-sm transition-colors
                       bg-gray-50 dark:bg-gray-800 border-gray-200 dark:border-gray-700
                       text-charcoal dark:text-white placeholder-gray-400
                       focus:outline-none focus:border-forest dark:focus:border-sage focus:ring-2 focus:ring-forest/10"
                [placeholder]="'item.quantity.placeholder' | translate"
              >
            </div>
            <div class="w-28">
              <label class="block text-xs font-semibold text-gray-500 dark:text-gray-400 mb-1.5 uppercase tracking-wide">
                {{ 'item.unit' | translate }}
              </label>
              <select
                formControlName="unit"
                class="w-full px-3 py-3 rounded-xl border text-sm transition-colors
                       bg-gray-50 dark:bg-gray-800 border-gray-200 dark:border-gray-700
                       text-charcoal dark:text-white
                       focus:outline-none focus:border-forest dark:focus:border-sage focus:ring-2 focus:ring-forest/10"
              >
                @for (u of units; track u) {
                  <option [value]="u">{{ 'units.' + u | translate }}</option>
                }
              </select>
            </div>
          </div>

          <!-- Category -->
          <div>
            <label class="block text-xs font-semibold text-gray-500 dark:text-gray-400 mb-2 uppercase tracking-wide">
              {{ 'item.category' | translate }}
            </label>
            <div class="grid grid-cols-4 gap-2">
              @for (cat of categories; track cat) {
                <button
                  type="button"
                  class="flex flex-col items-center gap-1 py-2.5 rounded-xl border text-xs font-medium transition-all duration-150 active:scale-95"
                  [class]="form.get('category')?.value === cat
                    ? 'bg-forest border-forest text-white shadow-sm'
                    : 'bg-gray-50 dark:bg-gray-800 border-gray-200 dark:border-gray-700 text-gray-600 dark:text-gray-400 hover:border-forest dark:hover:border-sage'"
                  (click)="form.patchValue({ category: cat })"
                >
                  <span class="text-xl leading-none">{{ catEmoji(cat) }}</span>
                  <span class="truncate w-full text-center">{{ 'categories.' + cat | translate }}</span>
                </button>
              }
            </div>
          </div>

          <!-- Status -->
          <div>
            <label class="block text-xs font-semibold text-gray-500 dark:text-gray-400 mb-2 uppercase tracking-wide">
              {{ 'item.status' | translate }}
            </label>
            <div class="flex gap-2">
              @for (s of statusOptions; track s.value) {
                <button
                  type="button"
                  class="flex-1 py-2.5 rounded-xl border text-xs font-semibold transition-all duration-150 active:scale-95"
                  [class]="form.get('status')?.value === s.value
                    ? 'bg-forest border-forest text-white shadow-sm'
                    : 'bg-gray-50 dark:bg-gray-800 border-gray-200 dark:border-gray-700 text-gray-600 dark:text-gray-400 hover:border-forest dark:hover:border-sage'"
                  (click)="form.patchValue({ status: s.value })"
                >{{ s.labelKey | translate }}</button>
              }
            </div>
          </div>

          <!-- Actions -->
          <div class="flex gap-3 pt-2">
            <button
              type="button"
              class="flex-1 py-3 rounded-xl border border-gray-200 dark:border-gray-700
                     text-sm font-semibold text-gray-600 dark:text-gray-400
                     hover:bg-gray-50 dark:hover:bg-gray-800 active:scale-95 transition-all"
              (click)="close.emit()"
            >{{ 'item.cancel' | translate }}</button>

            <button
              type="submit"
              [disabled]="form.invalid"
              class="flex-1 py-3 rounded-xl text-sm font-semibold text-white transition-all active:scale-95
                     disabled:opacity-50 disabled:cursor-not-allowed"
              [class]="form.invalid ? 'bg-gray-400' : 'bg-forest hover:bg-forest/90 shadow-md shadow-forest/30'"
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
