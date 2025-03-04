import { Component, OnInit } from '@angular/core';
import { CommonModule } from '@angular/common';
import {
  trigger,
  transition,
  style,
  animate,
  query,
  stagger,
} from '@angular/animations';
import {
  AuctionService,
  Auction,
  AuctionFilters,
} from '../../services/auction.service';

@Component({
  selector: 'app-auction-list',
  standalone: true,
  imports: [CommonModule],
  templateUrl: './auction-list.component.html',
  animations: [
    trigger('listAnimation', [
      transition('* <=> *', [
        query(':enter', [
          style({ 
            opacity: 0, 
            transform: 'translateY(20px)',
            filter: 'blur(4px)'
          }),
          stagger('50ms', [
            animate('300ms ease-out', 
              style({ 
                opacity: 1, 
                transform: 'translateY(0)',
                filter: 'blur(0)'
              })
            ),
          ]),
        ], { optional: true }),
        query(':leave', [
          stagger('50ms', [
            animate('300ms ease-out',
              style({ 
                opacity: 0, 
                transform: 'translateY(20px)',
                filter: 'blur(4px)'
              })
            ),
          ]),
        ], { optional: true }),
      ]),
    ]),
    // trigger('cardHover', [
    //   transition(':hover', [
    //     animate('200ms ease-out', style({ 
    //       transform: 'translateY(-5px)',
    //       boxShadow: '0 10px 20px rgba(0,0,0,0.1)'
    //     }))
    //   ])
    // ])
  ]
})
export class AuctionListComponent implements OnInit {
  auctions: Auction[] = [];
  currentFilters: AuctionFilters = {};
  loading = true;

  constructor(private auctionService: AuctionService) {}

  ngOnInit() {
    this.auctionService.getFilters().subscribe((filters) => {
      this.currentFilters = filters;
      this.updateAuctions();
    });

    this.updateAuctions();
  }

  private updateAuctions() {
    this.loading = true;
    this.auctionService.getFilteredAuctions(this.currentFilters).subscribe({
      next: (auctions) => {
        this.auctions = auctions;
        this.loading = false;
      },
      error: (error) => {
        console.error('Error loading auctions:', error);
        this.loading = false;
      },
    });
  }
}