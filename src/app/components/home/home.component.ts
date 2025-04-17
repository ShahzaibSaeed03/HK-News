import { Component } from '@angular/core';
import { CarouselComponent } from "../carousel/carousel.component";
import { AllNewsComponent } from "../all-news/all-news.component";
import { FormsModule } from '@angular/forms';
import { CommonModule } from '@angular/common';

@Component({
  selector: 'app-home',
  imports: [CarouselComponent, AllNewsComponent, FormsModule ,CommonModule],
  templateUrl: './home.component.html',
  styleUrl: './home.component.css',
})
export class HomeComponent {
  searchText: string = '';

  onSearchInput(value: string) {
    this.searchText = value;
    console.log('Search input:', value);

  }
}
