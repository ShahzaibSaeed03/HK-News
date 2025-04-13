import { Component } from '@angular/core';
import { RouterOutlet } from '@angular/router';
import { CarouselComponent } from "./components/carousel/carousel.component";
import { AllNewsComponent } from "./components/all-news/all-news.component";
import { HomeComponent } from './components/home/home.component';
import { HeaderComponent } from "./components/share/header/header.component";


@Component({
  selector: 'app-root',
  imports: [RouterOutlet, HeaderComponent],
  templateUrl: './app.component.html',
  styleUrl: './app.component.css'
})
export class AppComponent {
  title = 'HKN';
}
