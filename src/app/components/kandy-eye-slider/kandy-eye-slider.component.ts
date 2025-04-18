import { CommonModule } from '@angular/common';
import { Component, HostListener, OnInit, OnDestroy } from '@angular/core';
import { Router } from '@angular/router';
import { ArticleService } from '../service/article.service';

@Component({
  selector: 'app-kandy-eye-slider',
  imports: [CommonModule],
  templateUrl: './kandy-eye-slider.component.html',
  styleUrl: './kandy-eye-slider.component.css'
})
export class KandyEyeSliderComponent implements OnInit, OnDestroy {
  cards: any[] = [];
  visibleCards = 5;
  currentIndex = 0;
  translateX = 0;
  autoSlideInterval: any;

  constructor(
    private articleService: ArticleService,
    private router: Router
  ) {}

  ngOnInit() {
    this.updateVisibleCards();
    this.startAutoSlide();
    this.getArticles();
  }

  @HostListener('window:resize')
  onResize() {
    this.updateVisibleCards();
  }

  updateVisibleCards() {
    const width = window.innerWidth;
    this.visibleCards = width <= 640 ? 2 : width <= 1024 ? 3 : 5;
    this.updateTranslateX();
  }

  getArticles(): void {
    this.articleService.getArticle().subscribe({
      next: (response) => {
        if (response?.posts?.length) {
          this.cards = response.posts.map((post: any) => ({
            title: post.title,
            image: post.thumb ? `https://new.hardknocknews.tv/upload/media/posts/${post.thumb}-s.jpg` : null,
            type: post.type,
            slug: post.slug,
            original: post // full post saved for reuse
          }));
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
    localStorage.removeItem('selectedArticle');

    this.articleService.getsinglepost(type, slug).subscribe(() => {
      this.articleService.setSelectedArticle(article);
      localStorage.setItem('selectedArticle', JSON.stringify(article));

      const routePath = type === 'video' ? 'video-news' : 'article';
      this.router.routeReuseStrategy.shouldReuseRoute = () => false;
      this.router.onSameUrlNavigation = 'reload';
      this.router.navigate([routePath, type, slug]);
    });
  }

  startAutoSlide() {
    this.autoSlideInterval = setInterval(() => {
      this.nextSlide();
    }, 3000);
  }

  stopAutoSlide() {
    clearInterval(this.autoSlideInterval);
  }

  nextSlide() {
    if (this.currentIndex + this.visibleCards < this.cards.length) {
      this.currentIndex++;
    } else {
      this.currentIndex = 0;
    }
    this.updateTranslateX();
  }

  prevSlide() {
    if (this.currentIndex > 0) {
      this.currentIndex--;
    } else {
      this.currentIndex = Math.max(this.cards.length - this.visibleCards, 0);
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
