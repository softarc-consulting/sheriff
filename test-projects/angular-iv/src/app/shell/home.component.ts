import { Component } from '@angular/core';

@Component({
  selector: 'eternal-home',
  template: `<p>
      Eternal is an imaginary travel agency and is used as training application
      for Angular developers.
    </p>
    <p>
      You can click around, do whatever you want but don't expect to be able to
      book a real holiday 😉.
    </p> `,
  standalone: true,
})
export class HomeComponent {}
