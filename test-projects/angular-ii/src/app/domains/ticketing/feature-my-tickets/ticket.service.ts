import { Injectable } from '@angular/core';
import { Flight } from '../data';

@Injectable()
export class TicketService {

    readonly tickets: Flight[] = [
        { id: 4711, from: 'Graz', to: 'Düsseldorf', delayed: false, date: new Date().toISOString()},
        { id: 4712, from: 'Graz', to: 'Paderborn', delayed: false, date: new Date().toISOString()}
    ];

    constructor() {
        console.debug('creating ticket service');
    }

    get(limit = -1) {
        if (limit === -1) {
            return this.tickets;
        }
        return this.tickets.slice(0, limit);
    }
}
