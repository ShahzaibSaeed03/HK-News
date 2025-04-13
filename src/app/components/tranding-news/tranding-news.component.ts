import { Component, OnInit } from '@angular/core';
import { Router } from '@angular/router';
import { parseISO, formatDistanceToNowStrict } from 'date-fns';
import { ArticleService } from '../service/article.service';
import { CommonModule } from '@angular/common';

@Component({
  selector: 'app-tranding-news',
  standalone: true,
  imports: [CommonModule],
  templateUrl: './tranding-news.component.html',
  styleUrls: ['./tranding-news.component.css']
})
export class TrandingNewsComponent implements OnInit {

  news: any[] = [];
  mainImage: string = ''; // Stores the first news image

  constructor(private httpArticle: ArticleService, private router: Router) {}

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
  }

  private baseUrl = 'https://new.hardknocknews.tv/upload/media/posts';

  getArticles(): void {
    // Check if the articles are already in localStorage
    const savedArticles = localStorage.getItem('articles');
    if (savedArticles) {
      this.news = JSON.parse(savedArticles);
      console.log('Articles loaded from localStorage:', this.news);

      // Shuffle the articles and take the first 16
      this.news = this.shuffleAndLimit(this.news, 16);
      console.log('Random 16 articles from localStorage:', this.news);
    } else {
      // Fetch articles from API if not found in localStorage
      this.httpArticle.getArticle().subscribe({
        next: (response) => {
          console.log('API Response:', response);
  
          if (response && Array.isArray(response.posts)) {
            let formattedPosts = response.posts.map((post: any) => {
              const updatedThumb = post.thumb ? `${this.baseUrl}/${post.thumb}-s.jpg` : null;
              return {
                ...post,
                thumb: updatedThumb,
                relativeTime: this.getRelativeTime(post.spdate),
                views: post.popularity_stats?.all_time_stats || 0 // fallback if null
              };
            });
  
            // Sort by views descending
            formattedPosts = formattedPosts.sort((a: any, b: any) => b.views - a.views);
  
            // Save articles to localStorage
            localStorage.setItem('articles', JSON.stringify(formattedPosts));
  
            // Shuffle and limit to 16 articles
            this.news = this.shuffleAndLimit(formattedPosts, 16);
            console.log('Random 16 articles from API:', this.news);
          } else {
            console.error('Invalid API response format:', response);
            this.news = [];
          }
        },
        error: (error) => console.error('Error fetching articles:', error),
      });
    }
  }

  getPost(type: string, slug: string, article: any) {
    // Clear the previously selected article from localStorage
    localStorage.removeItem('selectedArticle');

    this.httpArticle.getsinglepost(type, slug).subscribe(result => {
      this.setSelectedArticle(article);
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

  private shuffleAndLimit(arr: any[], count: number): any[] {
    // Shuffle the array randomly
    return arr.sort(() => 0.5 - Math.random()).slice(0, count);
  }
}
