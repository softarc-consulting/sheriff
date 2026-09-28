import { Component, ChangeDetectionStrategy } from '@angular/core';
import { RouterOutlet } from '@angular/router';

@Component({
    templateUrl: './customers-root.component.html',
    changeDetection: ChangeDetectionStrategy.Eager,
    imports: [RouterOutlet]
})
export class CustomersRootComponent {}
