import { Component, OnInit } from '@angular/core';
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
import { ReactiveFormsModule } from '@angular/forms';
import { NgFor, NgIf } from '@angular/common';

@Component({
  selector: 'app-auction-list',
  templateUrl: './auction-list.component.html',
  animations: [
    trigger('listAnimation', [
      transition('* <=> *', [
        query(
          ':enter',
          [
            style({ opacity: 0, transform: 'translateY(20px)' }),
            stagger('50ms', [
              animate(
                '300ms ease-out',
                style({ opacity: 1, transform: 'translateY(0)' }),
              ),
            ]),
          ],
          { optional: true },
        ),
        query(
          ':leave',
          [
            stagger('50ms', [
              animate(
                '300ms ease-out',
                style({ opacity: 0, transform: 'translateY(20px)' }),
              ),
            ]),
          ],
          { optional: true },
        ),
      ]),
    ]),
  ],
  imports: [NgIf, NgFor, ReactiveFormsModule],
})
export class AuctionListComponent implements OnInit {
  auctions: Auction[] = [];
  currentFilters: AuctionFilters = {};
  loading = true;

  constructor(private auctionService: AuctionService) {}

  ngOnInit() {
    // Suscribirse a los cambios en los filtros
    this.auctionService.getFilters().subscribe((filters) => {
      this.currentFilters = filters;
      this.updateAuctions();
    });

    // Cargar subastas iniciales
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
