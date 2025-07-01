import { Injectable } from '@angular/core';
import { ViolationType } from '../types/violation.types';

@Injectable({
  providedIn: 'root',
})
export class ViolationDataService {
  getData(): Array<ViolationType> {
    return [];
  }
}
