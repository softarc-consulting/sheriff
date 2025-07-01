import { Component } from '@angular/core';
import { CommonModule } from '@angular/common';
import { compliantUtils } from '../util/compliant.utils';
import { CompliantType } from '../types/compliant.types';

@Component({
  selector: 'app-ui-compliant',
  imports: [CommonModule],
  template: `<p>ui-compliant works!</p>`,
  styles: `
    :host {
      display: block;
    }
  `,
})
export class UiCompliantComponent {
  bla = compliantUtils();

  data: CompliantType = {
    id: '',
  };
}
