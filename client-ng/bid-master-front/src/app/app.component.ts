import { Component } from '@angular/core';
import { RouterOutlet } from '@angular/router';
import { AuctionFilterComponent } from './components/auction-filter/auction-filter.component';
import { AuctionListComponent } from './components/auction-list/auction-list.component';

@Component({
  selector: 'app-root',
  imports: [RouterOutlet, AuctionFilterComponent, AuctionListComponent],
  templateUrl: './app.component.html',
  styleUrl: './app.component.css',
})
export class AppComponent {
  title = 'bid-master-front';
}
