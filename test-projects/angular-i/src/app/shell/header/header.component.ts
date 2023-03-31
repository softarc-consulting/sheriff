import { AsyncPipe, NgIf } from '@angular/common';
import { Component, inject } from '@angular/core';
import { MatButtonModule } from '@angular/material/button';
import { SecurityService } from '@eternal/shared/security';
import { RouterLinkWithHref } from '@angular/router';

@Component({
  selector: 'eternal-header',
  templateUrl: './header.component.html',
  styleUrls: ['./header.component.scss'],
  standalone: true,
  imports: [MatButtonModule, NgIf, AsyncPipe, RouterLinkWithHref],
})
export class HeaderComponent {
  #userService = inject(SecurityService);
  user$ = this.#userService.getLoadedUser$();

  signOut() {
    this.#userService.signOut();
  }
}
