import {AsyncPipe, JsonPipe, NgForOf, NgIf} from "@angular/common";
import {Component, inject} from "@angular/core";
import {FormsModule} from "@angular/forms";
import {Store} from "@ngrx/store";
import {take} from "rxjs";
import {ActivatedRoute} from "@angular/router";
import {BookingSlice, delayFlight, loadFlights, selectFlights} from "../../data";
import {CityValidator} from "src/app/domains/shared/util-common";
import {FlightCardComponent} from "../../ui-common/flight-card";

@Component({
  standalone: true,
  imports: [
    // CommonModule,
    NgIf,
    NgForOf,
    AsyncPipe,
    JsonPipe,

    FormsModule,
    FlightCardComponent,
    CityValidator,
  ],
  selector: 'app-flight-search',
  templateUrl: './flight-search.component.html'
})
export class FlightSearchComponent  {

  private store = inject<Store<BookingSlice>>(Store);
  private route = inject(ActivatedRoute);

  from = 'Hamburg'; // in Germany
  to = 'Graz'; // in Austria
  urgent = false;

  flights$ = this.store.select(selectFlights);

  basket: { [id: number]: boolean } = {
    3: true,
    5: true
  };

  constructor() {
    this.route.paramMap.subscribe(p => {
      const from = p.get('from');
      const to = p.get('to');

      if (from && to) {
        this.from = from;
        this.to = to;
        this.search();
      }
    });
  }

  search(): void {
    if (!this.from || !this.to) return;

    this.store.dispatch(loadFlights({
      from: this.from,
      to: this.to
    }));
  }

  delay(): void {
    this.flights$.pipe(take(1)).subscribe(flights => {
      const id = flights[0].id;
      this.store.dispatch(delayFlight({id}));
    });
  }

}

