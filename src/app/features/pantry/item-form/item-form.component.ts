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
  templateUrl: './item-form.component.html',
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
