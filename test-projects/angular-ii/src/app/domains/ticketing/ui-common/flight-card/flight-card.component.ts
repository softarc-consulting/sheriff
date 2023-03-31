import { CommonModule } from "@angular/common";
import { Component, EventEmitter, Input, Output } from "@angular/core";
import { RouterModule } from "@angular/router";
import { CityPipe } from "src/app/domains/shared/util-common";
import { Flight, initFlight } from "../../data";

@Component({
  standalone: true,
  selector: 'app-flight-card',
  imports: [CommonModule, RouterModule, CityPipe],
  templateUrl: './flight-card.component.html',
})
export class FlightCardComponent {

  @Input() item: Flight = initFlight;
  @Input() selected: boolean | undefined;
  @Output() selectedChange = new EventEmitter<boolean>();
  @Input() showEditButton = true;

  select() {
    this.selected = true;
    this.selectedChange.next(true);
  }

  deselect() {
    this.selected = false;
    this.selectedChange.next(false);
  }
}
