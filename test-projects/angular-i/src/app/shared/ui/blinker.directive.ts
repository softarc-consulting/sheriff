import { Directive, ElementRef, HostListener } from '@angular/core';

@Directive({
  selector: '[eternalBlinker]',
  standalone: true,
})
export class BlinkerDirective {
  currentColor = '';
  intervalId: number | undefined;
  constructor(private el: ElementRef) {}

  @HostListener('mouseenter') onMouseEnter() {
    this.toggle();
    this.intervalId = window.setInterval(() => this.toggle(), 500);
  }

  @HostListener('mouseleave') onMouseLeave() {
    this.el.nativeElement.style.color = '';
    if (this.intervalId) {
      window.clearInterval(this.intervalId);
      this.intervalId = undefined;
    }
  }

  private toggle() {
    const color = this.currentColor === '' ? 'coral' : '';
    this.currentColor = color;
    this.el.nativeElement.style.color = color;
  }
}
