import {
  ChangeDetectionStrategy, Component, HostListener, computed, output, signal,
} from '@angular/core';
import { TranslatePipe } from '@ngx-translate/core';

interface HelpSlide {
  heroBg: string; // full literal — Tailwind JIT scans these at build time
  titleKey: string;
  descKey: string;
}

const SLIDES: HelpSlide[] = [
  {
    heroBg: 'bg-gradient-to-br from-orange-100 to-amber-50 dark:from-orange-900/40 dark:to-amber-800/20',
    titleKey: 'help.step1.title',
    descKey:  'help.step1.desc',
  },
  {
    heroBg: 'bg-gradient-to-br from-emerald-100 to-green-50 dark:from-emerald-900/40 dark:to-green-800/20',
    titleKey: 'help.step2.title',
    descKey:  'help.step2.desc',
  },
  {
    heroBg: 'bg-gradient-to-br from-blue-100 to-indigo-50 dark:from-blue-900/40 dark:to-indigo-800/20',
    titleKey: 'help.step3.title',
    descKey:  'help.step3.desc',
  },
  {
    heroBg: 'bg-gradient-to-br from-violet-100 to-purple-50 dark:from-violet-900/40 dark:to-purple-800/20',
    titleKey: 'help.step4.title',
    descKey:  'help.step4.desc',
  },
  {
    heroBg: 'bg-gradient-to-br from-amber-100 to-yellow-50 dark:from-amber-900/40 dark:to-yellow-800/20',
    titleKey: 'help.step5.title',
    descKey:  'help.step5.desc',
  },
  {
    heroBg: 'bg-gradient-to-br from-teal-100 to-emerald-50 dark:from-teal-900/40 dark:to-emerald-800/20',
    titleKey: 'help.step6.title',
    descKey:  'help.step6.desc',
  },
];

@Component({
  selector: 'app-help-tour',
  standalone: true,
  imports: [TranslatePipe],
  changeDetection: ChangeDetectionStrategy.OnPush,
  templateUrl: './help-tour.component.html',
})
export class HelpTourComponent {
  readonly close = output<void>();

  readonly slides = SLIDES;
  readonly currentIndex = signal(0);
  readonly isLast       = computed(() => this.currentIndex() === this.slides.length - 1);
  readonly progressPct  = computed(() =>
    ((this.currentIndex() + 1) / this.slides.length) * 100
  );

  private touchStartX = 0;

  next(): void {
    if (!this.isLast()) this.currentIndex.update(i => i + 1);
  }

  prev(): void {
    if (this.currentIndex() > 0) this.currentIndex.update(i => i - 1);
  }

  goTo(index: number): void {
    this.currentIndex.set(index);
  }

  onTouchStart(e: TouchEvent): void {
    this.touchStartX = e.touches[0].clientX;
  }

  onTouchEnd(e: TouchEvent): void {
    const delta = e.changedTouches[0].clientX - this.touchStartX;
    if (delta < -50) this.next();
    else if (delta > 50) this.prev();
  }

  @HostListener('document:keydown', ['$event'])
  onKeyDown(e: KeyboardEvent): void {
    if (e.key === 'Escape')     this.close.emit();
    if (e.key === 'ArrowRight') this.next();
    if (e.key === 'ArrowLeft')  this.prev();
  }
}
