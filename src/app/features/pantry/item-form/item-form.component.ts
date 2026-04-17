import {
  ChangeDetectionStrategy, Component, effect, inject, input, output,
} from '@angular/core';
import { toSignal } from '@angular/core/rxjs-interop';
import { AbstractControl, FormBuilder, ReactiveFormsModule, ValidationErrors, Validators } from '@angular/forms';
import { TranslatePipe } from '@ngx-translate/core';
import {
  Item, ItemCategory, ItemStatus, ItemUnit, CATEGORIES, CATEGORY_CONFIG,
} from '../../../core/models/item.model';

export type ItemFormPayload = Omit<Item, 'id' | 'createdAt'>;

/** Units that represent countable items — only whole numbers make sense. */
const INTEGER_UNITS = new Set<ItemUnit>(['unit', 'pack', 'box', 'bag']);

/** Valid units per category — drives both the selector filter and auto-reset. */
const UNITS_BY_CATEGORY: Record<ItemCategory, ItemUnit[]> = {
  fruits:        ['unit', 'kg', 'g', 'bag', 'pack'],
  vegetables:    ['unit', 'kg', 'g', 'bag', 'pack'],
  dairy:         ['unit', 'kg', 'g', 'l', 'ml', 'pack', 'box'],
  meat:          ['unit', 'kg', 'g'],
  bakery:        ['unit', 'pack', 'box', 'bag'],
  frozen:        ['unit', 'kg', 'g', 'bag', 'pack', 'box'],
  pantry:        ['unit', 'kg', 'g', 'l', 'ml', 'pack', 'box', 'bag'],
  snacks:        ['unit', 'g', 'pack', 'box', 'bag'],
  beverages:     ['unit', 'l', 'ml', 'pack', 'box'],
  cleaning:      ['unit', 'l', 'ml', 'pack', 'box', 'kg', 'g'],
  personal_care: ['unit', 'l', 'ml', 'pack', 'box'],
  other:         ['unit', 'kg', 'g', 'l', 'ml', 'pack', 'box', 'bag'],
};

function integerValidator(control: AbstractControl<number | null>): ValidationErrors | null {
  const v = control.value;
  if (v === null) return null;
  return Number.isInteger(v) ? null : { notInteger: true };
}

@Component({
  selector: 'app-item-form',
  standalone: true,
  imports: [ReactiveFormsModule, TranslatePipe],
  changeDetection: ChangeDetectionStrategy.OnPush,
  template: `
    <div
      class="fixed inset-0 z-50 flex items-end sm:items-center justify-center bg-black/40 backdrop-blur-sm"
      (click)="onBackdropClick($event)"
      role="dialog"
      aria-modal="true"
    >
      <div
        class="w-full sm:max-w-md bg-white dark:bg-dark-card rounded-t-3xl sm:rounded-3xl
               shadow-2xl animate-slide-up sm:animate-pop-in overflow-hidden"
        (click)="$event.stopPropagation()"
      >
        <div class="flex justify-center pt-3 pb-1 sm:hidden">
          <div class="w-10 h-1 bg-gray-200 dark:bg-gray-700 rounded-full"></div>
        </div>

        <div class="flex items-center justify-between px-6 pt-4 pb-2">
          <h2 class="text-lg font-bold text-charcoal dark:text-white">
            {{ (item() ? 'item.edit' : 'item.add') | translate }}
          </h2>
          <button
            class="w-8 h-8 rounded-full flex items-center justify-center cursor-pointer
                   bg-gray-100 dark:bg-gray-700 text-gray-500 dark:text-gray-400
                   hover:bg-gray-200 dark:hover:bg-gray-600 active:scale-90 transition-all"
            (click)="close.emit()"
            [attr.aria-label]="'item.cancel' | translate"
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
              class="w-full px-4 py-3 rounded-xl border text-sm transition-colors
                     bg-gray-50 dark:bg-gray-800 border-gray-200 dark:border-gray-700
                     text-charcoal dark:text-white placeholder-gray-400
                     focus:outline-none focus:border-forest dark:focus:border-sage focus:ring-2 focus:ring-forest/10 dark:focus:ring-sage/10"
              [placeholder]="'item.name.placeholder' | translate"
              autocomplete="off"
            >
            @if (form.get('name')?.invalid && form.get('name')?.touched) {
              <p class="text-red-500 text-xs mt-1">{{ 'validation.name_required' | translate }}</p>
            }
          </div>

          <div class="grid grid-cols-2 gap-3">
            <div>
              <label class="block text-xs font-semibold text-gray-500 dark:text-gray-400 mb-1.5 uppercase tracking-wide">
                {{ 'item.quantity' | translate }}
              </label>
              <input
                formControlName="quantity"
                type="number"
                [min]="isIntegerUnit ? 1 : 0.1"
                [step]="isIntegerUnit ? 1 : 0.1"
                class="w-full px-4 py-3 rounded-xl border text-sm transition-colors
                       bg-gray-50 dark:bg-gray-800 border-gray-200 dark:border-gray-700
                       text-charcoal dark:text-white placeholder-gray-400
                       focus:outline-none focus:border-forest dark:focus:border-sage focus:ring-2 focus:ring-forest/10"
                [placeholder]="'item.quantity.placeholder' | translate"
              >
              @if (form.controls.quantity.touched) {
                @if (form.controls.quantity.errors?.['notInteger']) {
                  <p class="text-red-500 text-xs mt-1">{{ 'validation.integer_required' | translate }}</p>
                } @else if (form.controls.quantity.errors?.['min']) {
                  <p class="text-red-500 text-xs mt-1">{{ 'validation.min_value' | translate }}</p>
                }
              }
            </div>
            <div>
              <label class="block text-xs font-semibold text-gray-500 dark:text-gray-400 mb-1.5 uppercase tracking-wide">
                {{ 'item.unit' | translate }}
              </label>
              <select
                formControlName="unit"
                class="w-full px-4 py-3 rounded-xl border text-sm transition-colors
                       bg-gray-50 dark:bg-gray-800 border-gray-200 dark:border-gray-700
                       text-charcoal dark:text-white
                       focus:outline-none focus:border-forest dark:focus:border-sage focus:ring-2 focus:ring-forest/10"
              >
                @for (u of availableUnits; track u) {
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
                  class="flex flex-col items-center gap-1 py-2.5 rounded-xl border text-xs font-medium cursor-pointer transition-all duration-150 active:scale-95"
                  [class]="form.get('category')?.value === cat
                    ? 'bg-forest border-forest text-white shadow-sm'
                    : 'bg-gray-50 dark:bg-gray-800 border-gray-200 dark:border-gray-700 text-gray-600 dark:text-gray-400 hover:border-forest dark:hover:border-sage'"
                  (click)="form.patchValue({ category: cat })"
                >
                  <span class="text-xl leading-none">{{ catEmoji(cat) }}</span>
                  <span class="w-full text-center leading-tight line-clamp-2">{{ 'categories.' + cat | translate }}</span>
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
                  class="flex-1 py-2.5 rounded-xl border text-xs font-semibold cursor-pointer transition-all duration-150 active:scale-95"
                  [class]="form.get('status')?.value === s.value
                    ? 'bg-forest border-forest text-white shadow-sm'
                    : 'bg-gray-50 dark:bg-gray-800 border-gray-200 dark:border-gray-700 text-gray-600 dark:text-gray-400 hover:border-forest dark:hover:border-sage'"
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
                     cursor-pointer hover:bg-gray-50 dark:hover:bg-gray-800 active:scale-95 transition-all"
              (click)="close.emit()"
            >{{ 'item.cancel' | translate }}</button>

            <button
              type="submit"
              [disabled]="form.invalid"
              class="flex-1 py-3 rounded-xl text-sm font-semibold text-white transition-all active:scale-95
                     cursor-pointer disabled:opacity-50 disabled:cursor-not-allowed
                     hover:scale-[1.02] hover:shadow-lg"
              [class]="form.invalid ? 'bg-gray-400' : 'bg-forest hover:bg-forest/90 shadow-md shadow-forest/30 hover:shadow-forest/40'"
            >{{ 'item.save' | translate }}</button>
          </div>
        </form>
      </div>
    </div>
  `,
})
export class ItemFormComponent {
  readonly item            = input<Item | null>(null);
  readonly defaultCategory = input<ItemCategory | null>(null);
  readonly save            = output<ItemFormPayload>();
  readonly close           = output<void>();

  private readonly fb = inject(FormBuilder);

  readonly categories = CATEGORIES;

  readonly statusOptions: Array<{ value: ItemStatus; labelKey: string }> = [
    { value: 'pending',   labelKey: 'filters.pending'   },
    { value: 'in_cart',   labelKey: 'filters.in_cart'   },
    { value: 'purchased', labelKey: 'filters.purchased' },
  ];

  readonly form = this.fb.nonNullable.group({
    name:     ['',       Validators.required],
    quantity: [1,        [Validators.required, Validators.min(1), integerValidator]],
    unit:     ['unit'    as ItemUnit],
    category: ['fruits'  as ItemCategory],
    status:   ['pending' as ItemStatus],
  });

  // Convert control observables to signals so effects can track them reactively.
  private readonly unitSignal = toSignal(
    this.form.controls.unit.valueChanges,
    { initialValue: this.form.controls.unit.value }
  );

  private readonly categorySignal = toSignal(
    this.form.controls.category.valueChanges,
    { initialValue: this.form.controls.category.value }
  );

  /** Units the selector should show for the currently selected category. */
  get availableUnits(): ItemUnit[] {
    return UNITS_BY_CATEGORY[this.categorySignal()];
  }

  get isIntegerUnit(): boolean {
    return INTEGER_UNITS.has(this.unitSignal());
  }

  constructor() {
    // When category changes, reset the unit if it is incompatible.
    effect(() => {
      const allowed = UNITS_BY_CATEGORY[this.categorySignal()];
      const uCtrl = this.form.controls.unit;
      if (!allowed.includes(uCtrl.value)) {
        uCtrl.setValue(allowed[0]);
      }
    });

    // Re-evaluate quantity validators whenever the unit changes.
    effect(() => {
      const unit  = this.unitSignal();
      const qCtrl = this.form.controls.quantity;
      const isInteger = INTEGER_UNITS.has(unit);

      qCtrl.setValidators(
        isInteger
          ? [Validators.required, Validators.min(1), integerValidator]
          : [Validators.required, Validators.min(0.1)]
      );

      // Round up any decimal value when switching to a countable unit.
      if (isInteger && !Number.isInteger(qCtrl.value)) {
        qCtrl.setValue(Math.ceil(qCtrl.value), { emitEvent: false });
      }

      qCtrl.updateValueAndValidity();
    });

    // Patch the form when editing an existing item, or apply the pre-selected
    // category when adding a new one (e.g. user had a category filter active).
    // unit is patched before category so the category effect sees the correct
    // unit already in place and does not trigger a spurious reset.
    effect(() => {
      const currentItem = this.item();
      if (currentItem) {
        this.form.patchValue({
          name:     currentItem.name,
          quantity: currentItem.quantity,
          unit:     currentItem.unit,
          category: currentItem.category,
          status:   currentItem.status,
        });
      } else {
        const cat = this.defaultCategory();
        if (cat) this.form.patchValue({ category: cat });
      }
    });
  }

  catEmoji(cat: ItemCategory): string {
    return CATEGORY_CONFIG[cat].emoji;
  }

  submit(): void {
    if (this.form.invalid) return;
    this.save.emit(this.form.getRawValue() as ItemFormPayload);
  }

  onBackdropClick(event: MouseEvent): void {
    if (event.target === event.currentTarget) this.close.emit();
  }
}
