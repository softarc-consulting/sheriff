import { Component, EventEmitter, inject, Input, Output } from '@angular/core';
import {
  NonNullableFormBuilder,
  ReactiveFormsModule,
  Validators,
} from '@angular/forms';
import { RouterLink } from '@angular/router';
import { AsyncPipe, NgForOf, NgIf } from '@angular/common';
import { MatButtonModule } from '@angular/material/button';
import { MatDatepickerModule } from '@angular/material/datepicker';
import { MatFormFieldModule } from '@angular/material/form-field';
import { MatInputModule } from '@angular/material/input';
import { MatSelectModule } from '@angular/material/select';
import { FormErrorsComponent, Options } from '@eternal/shared/form';
import { Customer } from '@eternal/customers/model';
import { Option } from '../../../shared/form/options';

@Component({
  selector: 'eternal-customer',
  templateUrl: './customer.component.html',
  styleUrls: ['./customer.component.scss'],
  standalone: true,
  imports: [
    ReactiveFormsModule,
    MatButtonModule,
    MatDatepickerModule,
    RouterLink,
    AsyncPipe,
    NgIf,
    MatFormFieldModule,
    FormErrorsComponent,
    MatInputModule,
    MatSelectModule,
    NgForOf,
  ],
})
export class CustomerComponent {
  @Input() customer: Customer | undefined;
  @Input() countries: Option[] = [];
  @Input() showDeleteButton = true;
  @Output() save = new EventEmitter<Customer>();
  @Output() remove = new EventEmitter<Customer>();

  formGroup = inject(NonNullableFormBuilder).group({
    id: [0],
    firstname: ['', [Validators.required]],
    name: ['', [Validators.required]],
    country: ['', [Validators.required]],
    birthdate: ['', [Validators.required]],
  });

  submit() {
    if (this.formGroup.valid) {
      this.save.emit(this.formGroup.getRawValue());
    }
  }

  handleRemove() {
    if (confirm(`Really delete?`)) {
      this.remove.emit(this.formGroup.getRawValue());
    }
  }
}
