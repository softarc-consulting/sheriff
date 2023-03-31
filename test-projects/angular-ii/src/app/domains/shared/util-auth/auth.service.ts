import { Injectable } from '@angular/core';

@Injectable({providedIn: 'root'})
export class AuthService {
    isAuthenticated(): boolean {
        // Just for demo purposes
        return true;
    }
}
