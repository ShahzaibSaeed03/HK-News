import { CommonModule } from '@angular/common';
import { Component, OnInit } from '@angular/core';
import { Router } from '@angular/router';
import { ArticleService } from '../service/article.service';

@Component({
  selector: 'app-carousel',
  imports: [CommonModule],
  templateUrl: './carousel.component.html',
  styleUrl: './carousel.component.css'
})
export class CarouselComponent implements OnInit {

  private baseUrl = 'https://new.hardknocknews.tv/upload/media/posts';

    constructor(private httpArticle:ArticleService , private router: Router) {}
  


  newss: any[] = [];


  currentIndex = 0;
  interval: any;

  ngOnInit() {
    this.startAutoSlide();
    this.getArticles();
  }

  nextSlide() {
    this.currentIndex = (this.currentIndex + 1) % this.newss.length;
  }

  prevSlide() {
    this.currentIndex =
      this.currentIndex === 0 ? this.newss.length - 1 : this.currentIndex - 1;
  }

  startAutoSlide() {
    this.interval = setInterval(() => {
      this.nextSlide();
    }, 3000); // Change slide every 3 seconds
  }


  private getArticles(): void {
    const saved = localStorage.getItem('articles');

    if (saved) {
      const parsed = JSON.parse(saved);
      this.newss = this.shuffleAndLimit(parsed, 12);
      console.log("limited item 16", this.newss)
    } else {
      this.httpArticle.getArticle().subscribe({
        next: ({ posts }: any) => {
          if (!Array.isArray(posts)) {
            this.newss = [];
            return;
          }

          const formatted = posts.map((post: any) => ({
            ...post,
            thumb: post.thumb ? `${this.baseUrl}/${post.thumb}-s.jpg` : null,
            views: post.popularity_stats?.all_time_stats || 0
          }))
          .sort((a:any, b:any) => b.views - a.views);

          localStorage.setItem('articles', JSON.stringify(formatted));
          this.newss = this.shuffleAndLimit(formatted, 16);
        },
        error: err => {
          console.error('Error fetching articles:', err);
          this.newss = [];
        }
      });
    }
  }


  private shuffleAndLimit(arr: any[], count: number): any[] {
    return arr
      .map(value => ({ value, sort: Math.random() }))
      .sort((a, b) => a.sort - b.sort)
      .slice(0, count)
      .map(({ value }) => value);
  }

  stopAutoSlide() {
    clearInterval(this.interval);
  }


  getPost(type: string, slug: string, article: any) {
    // Clear the previously selected article from localStorage
    localStorage.removeItem('selectedArticle');
  
    this.httpArticle.getsinglepost(type, slug).subscribe(result => {
      this.httpArticle.setSelectedArticle(article);
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
}