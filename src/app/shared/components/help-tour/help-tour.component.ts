import {
  ChangeDetectionStrategy, Component, HostListener, computed, output, signal,
} from '@angular/core';
import { TranslatePipe } from '@ngx-translate/core';

interface HelpSlide {
  emoji: string;
  iconBg: string; // full Tailwind class string — must be a literal for JIT scanning
  titleKey: string;
  descKey: string;
}

const SLIDES: HelpSlide[] = [
  {
    emoji: '🛒',
    iconBg: 'bg-orange-50 dark:bg-orange-900/25',
    titleKey: 'help.step1.title',
    descKey:  'help.step1.desc',
  },
  {
    emoji: '🏷️',
    iconBg: 'bg-forest/10 dark:bg-forest/25',
    titleKey: 'help.step2.title',
    descKey:  'help.step2.desc',
  },
  {
    emoji: '✅',
    iconBg: 'bg-green-50 dark:bg-green-900/25',
    titleKey: 'help.step3.title',
    descKey:  'help.step3.desc',
  },
  {
    emoji: '🔔',
    iconBg: 'bg-amber-50 dark:bg-amber-900/25',
    titleKey: 'help.step4.title',
    descKey:  'help.step4.desc',
  },
  {
    emoji: '🎨',
    iconBg: 'bg-purple-50 dark:bg-purple-900/25',
    titleKey: 'help.step5.title',
    descKey:  'help.step5.desc',
  },
];

@Component({
  selector: 'app-help-tour',
  standalone: true,
  imports: [TranslatePipe],
  changeDetection: ChangeDetectionStrategy.OnPush,
  template: `
    <!-- Backdrop: clicking outside the sheet closes the tour -->
    <div
      class="fixed inset-0 z-50 bg-black/50 backdrop-blur-sm animate-fade-in"
      (click)="close.emit()"
      role="dialog"
      aria-modal="true"
      [attr.aria-label]="'help.aria_label' | translate">
    </div>

    <!-- Bottom sheet (slides up on mobile; centered modal on sm+) -->
    <div
      class="fixed bottom-0 inset-x-0 z-50 animate-slide-up
             sm:bottom-6 sm:left-1/2 sm:-translate-x-1/2 sm:w-[400px]
             sm:rounded-3xl rounded-t-3xl
             bg-white dark:bg-dark-card shadow-2xl overflow-hidden"
      (click)="$event.stopPropagation()"
      (touchstart)="onTouchStart($event)"
      (touchend)="onTouchEnd($event)">

      <!-- Drag handle — visual affordance for swipe-to-dismiss on mobile -->
      <div class="flex justify-center pt-3 pb-1 sm:hidden">
        <div class="w-10 h-1 bg-gray-200 dark:bg-gray-700 rounded-full"></div>
      </div>

      <!-- Close button -->
      <button
        class="absolute top-4 right-4 w-8 h-8 rounded-full flex items-center justify-center
               bg-gray-100 dark:bg-gray-700 text-gray-500 dark:text-gray-400
               hover:bg-gray-200 dark:hover:bg-gray-600
               active:scale-90 transition-all duration-150 z-10"
        (click)="close.emit()"
        [attr.aria-label]="'help.close' | translate">
        <svg class="w-4 h-4" fill="none" viewBox="0 0 24 24" stroke="currentColor" stroke-width="2.5">
          <path stroke-linecap="round" stroke-linejoin="round" d="M6 18L18 6M6 6l12 12" />
        </svg>
      </button>

      <!--
        Slide content rendered via @for + @if rather than a single binding on
        currentSlide(). When currentIndex changes, the @if removes the old DOM
        node and inserts a new one — which re-triggers the animate-fade-in CSS
        animation. A simpler approach than managing animation state manually.
      -->
      @for (slide of slides; track slide.titleKey; let i = $index) {
        @if (i === currentIndex()) {
          <div class="px-8 pt-6 pb-2 flex flex-col items-center text-center animate-fade-in">

            <div
              class="w-24 h-24 rounded-3xl flex items-center justify-center text-5xl mb-5 shadow-sm"
              [class]="slide.iconBg">
              {{ slide.emoji }}
            </div>

            <p class="text-xs font-semibold text-gray-400 dark:text-gray-500 uppercase tracking-widest mb-2">
              {{ 'help.step_of' | translate:{ current: i + 1, total: slides.length } }}
            </p>

            <h3 class="text-xl font-bold text-charcoal dark:text-white mb-3 leading-tight">
              {{ slide.titleKey | translate }}
            </h3>

            <p class="text-sm text-gray-500 dark:text-gray-400 leading-relaxed max-w-[280px]">
              {{ slide.descKey | translate }}
            </p>
          </div>
        }
      }

      <!-- Dot indicators: active dot widens into a pill to signal current position -->
      <div class="flex items-center justify-center gap-2 py-5">
        @for (slide of slides; track slide.titleKey; let i = $index) {
          <button
            class="rounded-full transition-all duration-300"
            [class]="i === currentIndex()
              ? 'w-6 h-2 bg-forest dark:bg-sage'
              : 'w-2 h-2 bg-gray-200 dark:bg-gray-700 hover:bg-gray-300 dark:hover:bg-gray-600'"
            (click)="goTo(i)"
            [attr.aria-label]="'help.go_to_step' | translate:{ step: i + 1 }">
          </button>
        }
      </div>

      <!-- Action buttons adapt based on whether the user is on the last slide -->
      <div class="flex gap-3 px-6 pb-8">
        @if (isLast()) {
          <button
            class="flex-1 py-3.5 rounded-2xl bg-forest hover:bg-forest/90
                   text-white text-sm font-bold tracking-wide
                   active:scale-95 transition-all duration-150
                   shadow-md shadow-forest/30"
            (click)="close.emit()">
            {{ 'help.done' | translate }} ✓
          </button>
        } @else {
          <button
            class="flex-1 py-3.5 rounded-2xl border border-gray-200 dark:border-gray-700
                   text-sm font-semibold text-gray-400 dark:text-gray-500
                   hover:bg-gray-50 dark:hover:bg-gray-800
                   active:scale-95 transition-all duration-150"
            (click)="close.emit()">
            {{ 'help.skip' | translate }}
          </button>
          <button
            class="flex-[2] py-3.5 rounded-2xl bg-forest hover:bg-forest/90
                   text-white text-sm font-bold tracking-wide
                   active:scale-95 transition-all duration-150
                   shadow-md shadow-forest/30 flex items-center justify-center gap-2"
            (click)="next()">
            {{ 'help.next' | translate }}
            <svg class="w-4 h-4" fill="none" viewBox="0 0 24 24" stroke="currentColor" stroke-width="2.5">
              <path stroke-linecap="round" stroke-linejoin="round" d="M9 5l7 7-7 7" />
            </svg>
          </button>
        }
      </div>
    </div>
  `,
})
export class HelpTourComponent {
  readonly close = output<void>();

  readonly slides = SLIDES;

  readonly currentIndex = signal(0);
  readonly currentSlide = computed(() => this.slides[this.currentIndex()]);
  readonly isLast       = computed(() => this.currentIndex() === this.slides.length - 1);

  // Stores the X position where a touch gesture began; used to calculate
  // swipe direction and magnitude in onTouchEnd.
  private touchStartX = 0;

  // ── Navigation ────────────────────────────────────────────────────────────

  next(): void {
    if (!this.isLast()) this.currentIndex.update(i => i + 1);
  }

  prev(): void {
    if (this.currentIndex() > 0) this.currentIndex.update(i => i - 1);
  }

  goTo(index: number): void {
    this.currentIndex.set(index);
  }

  // ── Swipe gesture ─────────────────────────────────────────────────────────

  onTouchStart(e: TouchEvent): void {
    this.touchStartX = e.touches[0].clientX;
  }

  /**
   * A 50 px threshold filters accidental micro-swipes while remaining
   * responsive. Positive delta = swiped right (go back); negative = go forward.
   */
  onTouchEnd(e: TouchEvent): void {
    const delta = e.changedTouches[0].clientX - this.touchStartX;
    if (delta < -50) this.next();
    else if (delta > 50) this.prev();
  }

  // ── Keyboard ──────────────────────────────────────────────────────────────

  /**
   * Listening at the document level ensures keyboard shortcuts work regardless
   * of which element has focus — important since the backdrop typically receives
   * focus when the sheet opens, not the sheet itself.
   */
  @HostListener('document:keydown', ['$event'])
  onKeyDown(e: KeyboardEvent): void {
    if (e.key === 'Escape')     this.close.emit();
    if (e.key === 'ArrowRight') this.next();
    if (e.key === 'ArrowLeft')  this.prev();
  }
}
