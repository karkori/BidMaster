import { Component, OnInit } from '@angular/core';
import { CommonModule } from '@angular/common';
import { FormBuilder, FormGroup, ReactiveFormsModule } from '@angular/forms';
import { trigger, transition, style, animate } from '@angular/animations';
import { AuctionService } from '../../services/auction.service';

@Component({
  selector: 'app-auction-filter',
  standalone: true,
  imports: [CommonModule, ReactiveFormsModule],
  templateUrl: './auction-filter.component.html',
  animations: [
    trigger('filterAnimation', [
      transition(':enter', [
        style({ opacity: 0, transform: 'translateY(-10px)' }),
        animate(
          '300ms ease-out',
          style({ opacity: 1, transform: 'translateY(0)' }),
        ),
      ]),
      transition(':leave', [
        animate(
          '200ms ease-in',
          style({ opacity: 0, transform: 'translateY(-10px)' }),
        ),
      ]),
    ]),
  ],
})
export class AuctionFilterComponent implements OnInit {
  filterForm: FormGroup;
  showAdvancedFilters = false;

  constructor(
    private fb: FormBuilder,
    private auctionService: AuctionService,
  ) {
    this.filterForm = this.fb.group({
      searchTerm: [''],
      priceRange: this.fb.group({
        min: [0],
        max: [999999],
      }),
      isActive: [true],
    });
  }

  ngOnInit() {
    this.filterForm.valueChanges.subscribe((values) => {
      this.auctionService.updateFilters(values);
    });
  }

  toggleAdvancedFilters() {
    this.showAdvancedFilters = !this.showAdvancedFilters;
  }

  resetFilters() {
    this.filterForm.reset({
      searchTerm: '',
      priceRange: { min: 0, max: 999999 },
      isActive: true,
    });
  }
}