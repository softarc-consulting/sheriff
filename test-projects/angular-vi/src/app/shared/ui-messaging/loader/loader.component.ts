import { AsyncPipe, NgStyle } from '@angular/common';
import { Component, inject, ChangeDetectionStrategy } from '@angular/core';
import { MatProgressBarModule } from '@angular/material/progress-bar';
import { LoadingService } from './loading.service';

@Component({
    selector: 'eternal-loader',
    template: `<mat-progress-bar
    [ngStyle]="{
      visibility: (loadingService.loading$ | async) ? 'visible' : 'hidden'
    }"
    mode="indeterminate"
  ></mat-progress-bar>`,
    changeDetection: ChangeDetectionStrategy.Eager,
    imports: [MatProgressBarModule, NgStyle, AsyncPipe]
})
export class LoaderComponent {
  loadingService = inject(LoadingService);
}
