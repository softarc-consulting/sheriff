import { Component, inject } from '@angular/core';
import { CommonModule } from '@angular/common';
import { ViolationDataService } from '../data-access/violation-data.service';
import { FeatViolationComponent } from '../feat/feat-violation.component';

@Component({
  selector: 'app-ui-violation',
  imports: [CommonModule, FeatViolationComponent],
  template: `<app-feat-violation />`,
  styles: `
    :host {
      display: block;
    }
  `,
})
export class UiViolationComponent {
  ds = inject(ViolationDataService);
}
