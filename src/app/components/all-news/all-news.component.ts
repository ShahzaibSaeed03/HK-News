import { CommonModule } from '@angular/common';
import { Component, Input, OnChanges, OnInit, SimpleChanges } from '@angular/core';
import { FontAwesomeModule } from '@fortawesome/angular-fontawesome';
import { formatDistanceToNowStrict, parseISO } from 'date-fns';
import { Router, RouterLink } from '@angular/router';
import { ArticleService } from '../service/article.service';
import { KandyEyeSliderComponent } from "../kandy-eye-slider/kandy-eye-slider.component";
import { LazyImgDirective } from './lazy-img.directive';

@Component({
  selector: 'app-all-news',
  standalone: true,
  imports: [CommonModule, FontAwesomeModule, KandyEyeSliderComponent,LazyImgDirective],
  templateUrl: './all-news.component.html',
  styleUrls: ['./all-news.component.css']
})
export class AllNewsComponent implements OnInit, OnChanges {
  filteredNews: any[] = [];
  loading: boolean = true; // Track loading state



  @Input() searchTerm: string = '';


  ngOnChanges(changes: SimpleChanges): void {
    if (changes['searchTerm']) {
      this.applySearch();
    }
  }

  applySearch(): void {
    if (!this.searchTerm || this.searchTerm.trim() === '') {
      this.filteredNews = this.news;
    } else {
      const term = this.searchTerm.toLowerCase();
      this.filteredNews = this.news.filter(post =>
        post.title?.toLowerCase().includes(term) || 
        post.categories?.toLowerCase().includes(term)
      );
    }
  }


  news: any[] = [];
  mainImage: string = ''; // Stores the first news image

  // Pagination
pageSize = 72;
currentPage = 1;

get paginatedNews() {
  const source = this.filteredNews.length ? this.filteredNews : this.news;
  const start = (this.currentPage - 1) * this.pageSize;
  const end = start + this.pageSize;
  return source.slice(start, end);
}


get totalPages(): number {
  return Math.ceil(this.news.length / this.pageSize);
}

changePage(page: number) {
  if (page >= 1 && page <= this.totalPages) {
    this.currentPage = page;
    window.scrollTo({ top: 0, behavior: 'smooth' });
  }
}

 

  constructor(private httpArticle:ArticleService , private router: Router) {}

   heading: string[] = [
    'Celebrity',
    'Politics',
    "Crime",
    "Business",
    "Entertainment",
 
  ];



  getHeading(index: number): string {
    return this.heading[Math.floor(index / 8) % this.heading.length];
  }

setSelectedArticle(article: any) {
  this.httpArticle.setSelectedArticle(article);
}

   // Convert the published_at timestamp to a relative time
  getRelativeTime(publishedAt: string): string {
    const parsedDate = parseISO(publishedAt); // Parse the ISO 8601 string to a Date object
    return formatDistanceToNowStrict(parsedDate); // Get the relative time without "about"
  }


  ngOnInit(): void {
    this.getArticles();
    this.applySearch();


  }

  
  private baseUrl = 'https://new.hardknocknews.tv/upload/media/posts';


  getArticles(): void {
    this.loading = true; // Start loading

    this.httpArticle.getArticle().subscribe({
      next: (response) => {
        console.log('API Response more news:', response);
  
        if (response && Array.isArray(response.posts)) {
          this.news = response.posts.map((post: any) => {
            const updatedThumb = post.thumb ? `${this.baseUrl}/${post.thumb}-s.jpg` : null;
            return {
              ...post,
              thumb: updatedThumb,
              relativeTime: this.getRelativeTime(post.spdate), // Add relative time to each post
            };
          });
  
          // Sort the news array by the spdate (latest date first)
          this.news.sort((a, b) => {
            const dateA = new Date(a.spdate).getTime();
            const dateB = new Date(b.spdate).getTime();
            return dateB - dateA; // Sort in descending order
          });
        } else {
          console.error('Invalid API response format:', response);
          this.news = [];
        }
      },
      error: (error) => console.error('Error fetching articles:', error),
      complete: () => {
        this.loading = false; // Stop loading when done
      }
    });
  }
  
  
  
  
  
  getPost(type: string, slug: string, article: any) {
    this.httpArticle.setSelectedArticle(article); // Optional if needed globally
  
    const routePath = type === 'video' ? 'video-news' : 'article';
    this.router.navigate([routePath, type, slug], {
      state: { articleData: article } // 👈 send full article data here
    });
  }
  
  
  
  
}
