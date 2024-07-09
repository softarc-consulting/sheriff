import { inject, Injectable } from '@angular/core';

import { SecurityService } from '@eternal/shared/security';
import { Observable } from 'rxjs';
import { filter, map } from 'rxjs/operators';

@Injectable({ providedIn: 'root' })
export class UserLoaderGuard  {
  #securityService = inject(SecurityService);

  canActivate(): Observable<boolean> | boolean {
    return this.#securityService.getLoaded$().pipe(
      map((loaded) => {
        if (!loaded) {
          this.#securityService.load();
        }
        return loaded;
      }),
      filter((loaded) => loaded)
    );
  }
}
