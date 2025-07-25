import { Injectable } from '@angular/core';
import { CompliantType } from '../types/compliant.types';

@Injectable({
  providedIn: 'root',
})
export class CompliantDataService {
  getData(): Array<CompliantType> {
    return [];
  }
}
