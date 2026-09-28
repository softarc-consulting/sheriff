import { Component, ChangeDetectionStrategy } from '@angular/core';
import { MatToolbarModule } from '@angular/material/toolbar';
import { MatSidenavModule } from '@angular/material/sidenav';
import { SidemenuComponent } from './shell/sidemenu/sidemenu.component';
import { HeaderComponent } from './shell/header/header.component';
import { RouterOutlet } from '@angular/router';
import {
  LoaderComponent,
  MessageComponent,
} from '@eternal/shared/ui-messaging';

@Component({
    selector: 'eternal-root',
    templateUrl: './app.component.html',
    styleUrls: ['./app.component.scss'],
    changeDetection: ChangeDetectionStrategy.Eager,
    imports: [
        MatToolbarModule,
        MatSidenavModule,
        LoaderComponent,
        MessageComponent,
        SidemenuComponent,
        HeaderComponent,
        RouterOutlet,
    ]
})
export class AppComponent {}
