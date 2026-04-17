import { ChangeDetectionStrategy, Component, inject } from '@angular/core';
import { TranslatePipe } from '@ngx-translate/core';
import { ToastService, Toast } from '../../../core/services/toast.service';

@Component({
  selector: 'app-toast',
  standalone: true,
  imports: [TranslatePipe],
  changeDetection: ChangeDetectionStrategy.OnPush,
  templateUrl: './toast.component.html',
})
export class ToastComponent {
  readonly toastService = inject(ToastService);

  iconBubbleClass(type: Toast['type']): string {
    const map: Record<Toast['type'], string> = {
      success: 'bg-forest/10 dark:bg-forest/30 text-forest dark:text-sage',
      error:   'bg-red-50 dark:bg-red-900/30 text-red-600 dark:text-red-400',
      info:    'bg-blue-50 dark:bg-blue-900/30 text-blue-600 dark:text-blue-400',
    };
    return map[type];
  }

  accentClass(type: Toast['type']): string {
    const map: Record<Toast['type'], string> = {
      success: 'bg-forest',
      error:   'bg-red-500',
      info:    'bg-blue-500',
    };
    return map[type];
  }

  toastIcon(type: Toast['type']): string {
    const map: Record<Toast['type'], string> = {
      success: '✓',
      error:   '✕',
      info:    'ℹ',
    };
    return map[type];
  }

  runAction(toast: Toast): void {
    toast.action?.fn();
    this.toastService.dismiss(toast.id);
  }
}
