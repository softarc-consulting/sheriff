import { Component } from '@angular/core';
import { CommonModule } from '@angular/common';
import { internalUtil } from '../util/internal/internal-util';

@Component({
  selector: 'app-feat-violation',
  imports: [CommonModule],
  template: ``,
  styles: `
    :host {
      display: block;
    }
  `,
})
export class FeatViolationComponent {
  bla = internalUtil();
}
