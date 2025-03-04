import { inject, Injectable } from '@angular/core';
import { HttpClient } from '@angular/common/http';
import { BehaviorSubject, Observable } from 'rxjs';
import { map } from 'rxjs/operators';

export interface Auction {
  id: number;
  title: string;
  description: string;
  currentPrice: number;
  imageUrl: string;
  endTime: string;
  isActive: boolean;
}

export interface AuctionFilters {
  priceRange?: { min: number; max: number };
  isActive?: boolean;
  searchTerm?: string;
}

@Injectable({
  providedIn: 'root',
})
export class AuctionService {
  private apiUrl = 'http://localhost:5000/api';
  private filtersSubject = new BehaviorSubject<AuctionFilters>({});

  http = inject(HttpClient);

  getAuctions(): Observable<Auction[]> {
    return this.http.get<Auction[]>(`${this.apiUrl}/auctions`);
  }

  getFilteredAuctions(filters: AuctionFilters): Observable<Auction[]> {
    return this.getAuctions().pipe(
      map(auctions => this.applyFilters(auctions, filters))
    );
  }

  private applyFilters(auctions: Auction[], filters: AuctionFilters): Auction[] {
    return auctions.filter(auction => {
      if (filters.priceRange) {
        if (auction.currentPrice < filters.priceRange.min || 
            auction.currentPrice > filters.priceRange.max) {
          return false;
        }
      }
      
      if (filters.isActive !== undefined && auction.isActive !== filters.isActive) {
        return false;
      }
      
      if (filters.searchTerm) {
        const searchLower = filters.searchTerm.toLowerCase();
        return auction.title.toLowerCase().includes(searchLower) ||
               auction.description.toLowerCase().includes(searchLower);
      }
      
      return true;
    });
  }

  updateFilters(filters: AuctionFilters) {
    this.filtersSubject.next(filters);
  }

  getFilters(): Observable<AuctionFilters> {
    return this.filtersSubject.asObservable();
  }
}
