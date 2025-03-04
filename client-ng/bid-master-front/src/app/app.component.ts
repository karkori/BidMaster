import { Component } from '@angular/core';
import { RouterOutlet } from '@angular/router';
import { HttpClientModule } from '@angular/common/http';
import { AuctionFilterComponent } from './components/auction-filter/auction-filter.component';
import { AuctionListComponent } from './components/auction-list/auction-list.component';
import { AuctionService } from './services/auction.service';

@Component({
  selector: 'app-root',
  standalone: true,
  imports: [
    RouterOutlet, 
    HttpClientModule,
    AuctionFilterComponent, 
    AuctionListComponent
  ],
  providers: [AuctionService],
  templateUrl: './app.component.html',
  styleUrl: './app.component.css',
})
export class AppComponent {
  title = 'bid-master-front';
}