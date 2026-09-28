import { Component, inject, ChangeDetectionStrategy } from '@angular/core';
import { MatButtonModule } from '@angular/material/button';
import { SecurityService } from '@eternal/shared/security';
import { RouterLinkWithHref } from '@angular/router';
import { AsyncPipe } from '@angular/common';

@Component({
    selector: 'eternal-sidemenu',
    templateUrl: './sidemenu.component.html',
    styleUrls: ['./sidemenu.component.scss'],
    changeDetection: ChangeDetectionStrategy.Eager,
    imports: [MatButtonModule, RouterLinkWithHref, AsyncPipe]
})
export class SidemenuComponent {
  #securityService = inject(SecurityService);
  loaded$ = this.#securityService.getLoaded$();
  signedIn$ = this.#securityService.getSignedIn$();
}
