import { ChangeDetectionStrategy, Component, DestroyRef, inject, input, output } from '@angular/core';
import { TranslatePipe } from '@ngx-translate/core';

@Component({
  selector: 'app-confirm-dialog',
  standalone: true,
  imports: [TranslatePipe],
  changeDetection: ChangeDetectionStrategy.OnPush,
  templateUrl: './confirm-dialog.component.html',
})
export class ConfirmDialogComponent {
  readonly titleKey      = input.required<string>();
  readonly messageKey    = input<string | null>(null);
  readonly messageParams = input<Record<string, unknown>>({});
  readonly confirmKey    = input('confirm.delete');
  readonly cancelKey     = input('item.cancel');

  readonly confirm = output<void>();
  readonly cancel  = output<void>();

  constructor() {
    // Lock page scroll while the dialog is mounted so that mobile browser
    // overlay scrollbars (which composite above CSS z-index) disappear.
    const destroyRef = inject(DestroyRef);
    document.documentElement.classList.add('overflow-hidden');
    destroyRef.onDestroy(() => document.documentElement.classList.remove('overflow-hidden'));
  }
}
