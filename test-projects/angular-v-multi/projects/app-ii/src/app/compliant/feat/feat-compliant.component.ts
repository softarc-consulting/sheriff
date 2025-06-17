import { Component, inject } from '@angular/core';
import { CommonModule } from '@angular/common';
import { UiCompliantComponent } from '../ui/ui-compliant.component';
import { CompliantDataService } from '../data-access/compliant-data.service';
import { CompliantType } from '../types/compliant.types';

@Component({
  selector: 'app-feat-compliant',
  imports: [CommonModule, UiCompliantComponent],
  template: `<app-ui-compliant />`,
  styles: `
    :host {
      display: block;
    }
  `,
})
export class FeatCompliantComponent {
  data = inject(CompliantDataService);
  b: CompliantType = {
    id: '',
  };
}
