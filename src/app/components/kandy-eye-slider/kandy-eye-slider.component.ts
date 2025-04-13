import { CommonModule } from '@angular/common';
import { Component, HostListener, OnInit, OnDestroy } from '@angular/core';
import { Router, RouterLink } from '@angular/router';
import { ArticleService } from '../service/article.service';

@Component({
  selector: 'app-kandy-eye-slider',
  imports: [CommonModule,RouterLink],
  templateUrl: './kandy-eye-slider.component.html',
  styleUrl: './kandy-eye-slider.component.css'
})
export class KandyEyeSliderComponent implements OnInit, OnDestroy {
  // cards = Array.from({ length: 8 }, (_, i) => ({
  //   image: `https://picsum.photos/300/200?random=${i + 1}`,
  //   title: `Headline: How a Stuffed Animal Became Her Go-To Therapy for Surviving Trump’s Presidency ${i + 1}`
  // }));
  

  constructor(private articleService: ArticleService , private router: Router) {}
  cards: any[] = []; // no dummy data

  uniqueCategories: string[] = [];  // Store the unique categories

  visibleCards = 5;
  currentIndex = 0;
  translateX = 0;
  autoSlideInterval: any;

  ngOnInit() {
    this.updateVisibleCards();
    this.startAutoSlide();
    this.getArticles(); // call API first

  }

  @HostListener('window:resize', [])
  onResize() {
    this.updateVisibleCards();
  }

  updateVisibleCards() {
    const screenWidth = window.innerWidth;
    this.visibleCards = screenWidth <= 640 ? 2 : screenWidth <= 1024 ? 3 : 5;
    this.translateX = -(this.currentIndex * (100 / this.visibleCards));
  }
  getArticles(): void {
    this.articleService.getArticle().subscribe({
      next: (response) => {
        if (response && Array.isArray(response.posts)) {
          this.cards = response.posts.map((post: any) => ({
            title: post.title,
            image: post.thumb ? `https://new.hardknocknews.tv/upload/media/posts/${post.thumb}-s.jpg` : null,
            categories: post.categories
          }));
  
          // Initialize a Set to store unique categories
          const uniqueCategories = new Set<string>();
  
          // Iterate over each card and extract categories
          this.cards.forEach(card => {
            if (card.categories) {
              // Ensure categories is an array
              const categories: string[] = Array.isArray(card.categories) ? card.categories : [card.categories];
              categories.forEach((category: string) => {
                uniqueCategories.add(category); // Add each category to the Set
              });
            }
          });
  
          // Convert the Set to an array of unique categories
          this.uniqueCategories = Array.from(uniqueCategories);
  
          // Log the unique categories to the console
          console.log('Unique Categories:', this.uniqueCategories);
  
        } else {
          this.cards = [];
        }
      },
      error: (error) => {
        console.error('Error fetching articles:', error);
        this.cards = [];
      }
    });
  }
  
  getPost(type: string, slug: string, article: any) {
    // Clear the previously selected article from localStorage
    localStorage.removeItem('selectedArticle');
  
    this.articleService.getsinglepost(type, slug).subscribe(result => {
      this.articleService.setSelectedArticle(article);
      localStorage.setItem('selectedArticle', JSON.stringify(article)); // Save the new article to localStorage
  
      // Navigate based on type, pass real values, not param names
      if (type === 'video') {
        this.router.navigate(['video-news', type, slug]);
      } else if (type === 'news') {
        this.router.navigate(['article', type, slug]);
      }
  
      console.log(result);
    });
  }
  
  startAutoSlide() {
    this.autoSlideInterval = setInterval(() => {
      this.nextSlide();
    }, 3000); // Auto-slide every 1 second
  }

  stopAutoSlide() {
    clearInterval(this.autoSlideInterval);
  }

  nextSlide() {
    if (this.currentIndex + this.visibleCards < this.cards.length) {
      this.currentIndex++;
    } else {
      this.currentIndex = 0; // Reset to the beginning when reaching the end
    }
    this.updateTranslateX();
  }

  prevSlide() {
    if (this.currentIndex > 0) {
      this.currentIndex--;
    } else {
      this.currentIndex = this.cards.length - this.visibleCards; // Move to the last set of slides
    }
    this.updateTranslateX();
  }

  updateTranslateX() {
    this.translateX = -(this.currentIndex * (100 / this.visibleCards));
  }

  ngOnDestroy() {
    this.stopAutoSlide();
  }
}
