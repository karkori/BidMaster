import { NgModule } from '@angular/core';
import { BrowserModule } from '@angular/platform-browser';
import { BrowserAnimationsModule } from '@angular/platform-browser/animations';
import { HttpClientModule } from '@angular/common/http';
import { ReactiveFormsModule } from '@angular/forms';

import { AppComponent } from './app.component';
import { AuctionFilterComponent } from './components/auction-filter/auction-filter.component';
import { AuctionListComponent } from './components/auction-list/auction-list.component';
import { AuctionService } from './services/auction.service';

@NgModule({
  declarations: [
    AppComponent,
    AuctionFilterComponent,
    AuctionListComponent
  ],
  imports: [
    BrowserModule,
    BrowserAnimationsModule,
    HttpClientModule,
    ReactiveFormsModule
  ],
  providers: [AuctionService],
  bootstrap: [AppComponent]
})
export class AppModule { }