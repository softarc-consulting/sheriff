import { Component, Input, ChangeDetectionStrategy } from '@angular/core';
import { FormControl } from '@angular/forms';
import { JsonPipe } from '@angular/common';
import { MatInputModule } from '@angular/material/input';

@Component({
    selector: 'eternal-form-errors',
    template: ` @if (control) {
   @if (control.hasError('required')) {
     <span>This field is mandatory</span>
   }
 }`,
    changeDetection: ChangeDetectionStrategy.Eager,
    imports: [JsonPipe, MatInputModule]
})
export class FormErrorsComponent {
  @Input() control: FormControl | undefined;
}
