import { Component } from '@angular/core';
import { RouterOutlet } from '@angular/router';
import { FeatViolationComponent } from './non-compliant/feat/feat-violation.component';
import { UiViolationComponent } from './non-compliant/ui/ui-violation.component';

@Component({
  selector: 'app-root',
  imports: [RouterOutlet, FeatViolationComponent, UiViolationComponent],
  templateUrl: './app.component.html',
})
export class AppComponent {
  title = 'app-i';
}
