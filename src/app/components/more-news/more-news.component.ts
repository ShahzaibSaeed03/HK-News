import { Component, OnInit } from '@angular/core';
import { Router } from '@angular/router';
import { parseISO, formatDistanceToNowStrict } from 'date-fns';
import { ArticleService } from '../service/article.service';
import { CommonModule } from '@angular/common';

@Component({
  selector: 'app-more-news',
  standalone: true,
  imports: [CommonModule],
  templateUrl: './more-news.component.html',
  styleUrls: ['./more-news.component.css'] // fixed typo from styleUrl → styleUrls
})
export class MoreNewsComponent implements OnInit {

  news: any[] = [];
  private readonly baseUrl = 'https://new.hardknocknews.tv/upload/media/posts';

  constructor(
    private httpArticle: ArticleService,
    private router: Router
  ) {}

  ngOnInit(): void {
    this.getArticles();
  }

  setSelectedArticle(article: any): void {
    this.httpArticle.setSelectedArticle(article);
  }

  getRelativeTime(publishedAt: string): string {
    const parsedDate = parseISO(publishedAt);
    return formatDistanceToNowStrict(parsedDate);
  }

  getArticles(): void {
    // Check if the articles are already in localStorage
    const savedArticles = localStorage.getItem('articles');
    if (savedArticles) {
      this.news = JSON.parse(savedArticles);
      console.log('Articles loaded from localStorage:', this.news);

      // Shuffle the articles and take the first 15
      this.news = this.shuffleAndLimit(this.news, 15);
      console.log('Random 15 articles:', this.news);
    } else {
      // Fetch articles from API if not found in localStorage
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

            // Save articles to localStorage
            localStorage.setItem('articles', JSON.stringify(this.news));

            // Shuffle and limit to 15 articles
            this.news = this.shuffleAndLimit(this.news, 15);
            console.log('Random 15 articles from API:', this.news);
          } else {
            console.error('Invalid API response format:', response);
            this.news = [];
          }
        },
        error: (error) => console.error('Error fetching articles:', error),
      });
    }
  }

  getTranding(): void {
    this.httpArticle.getArticle().subscribe({
      next: (response) => {
        console.log('API Response:', response);

        if (response && Array.isArray(response.posts)) {
          const formattedPosts = response.posts.map((post: any) => ({
            ...post,
            thumb: post.thumb ? `${this.baseUrl}/${post.thumb}-s.jpg` : null,
            relativeTime: this.getRelativeTime(post.spdate),
            views: post.popularity_stats?.all_time_stats || 0
          }));

          formattedPosts.sort((a: any, b: any) => b.views - a.views);
          this.news = formattedPosts.slice(0, 10);
        } else {
          console.error('Invalid API response format:', response);
          this.news = [];
        }
      },
      error: (error) => console.error('Error fetching trending articles:', error)
    });
  }

  getPost(type: string, slug: string, article: any): void {
    localStorage.removeItem('selectedArticle');

    this.httpArticle.getsinglepost(type, slug).subscribe(result => {
      this.setSelectedArticle(article);
      localStorage.setItem('selectedArticle', JSON.stringify(article));

      if (type === 'video') {
        this.router.navigate(['video-news', type, slug]);
      } else {
        this.router.navigate(['article', type, slug]);
      }

      console.log(result);
    });
  }

  private shuffleAndLimit(arr: any[], count: number): any[] {
    // Shuffle the array randomly
    return arr.sort(() => 0.5 - Math.random()).slice(0, count);
  }
}
