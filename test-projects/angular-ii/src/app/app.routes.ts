import { inject } from "@angular/core";
import { Routes } from "@angular/router";
import { AuthService } from "./domains/shared/util-auth";
import { HomeComponent } from "./home/home.component";

export const APP_ROUTES: Routes = [
    {
        path: '',
        pathMatch: 'full',
        redirectTo: 'home'
    },
    {
        path: 'home',
        component: HomeComponent
    },
    {
        path: 'flight-booking',
        canActivate: [() => inject(AuthService).isAuthenticated()],
        loadChildren: () =>
            import('./domains/ticketing/feature-booking')
                .then(m => m.FLIGHT_BOOKING_ROUTES)
    },
    {
        path: 'next-flight',
        loadComponent: () => 
            import('./domains/ticketing/feature-next-flight')
                .then(m => m.NextFlightComponent)
    },
    {
        path: 'checkin',
        loadComponent: () => import('./domains/checkin/feature-manage')
            .then(m => m.FeatureManageComponent)
    },
    {
        path: 'about',
        loadComponent: () => 
            import('./about/about.component')
                // .then(m => m.AboutComponent)
    },
];
