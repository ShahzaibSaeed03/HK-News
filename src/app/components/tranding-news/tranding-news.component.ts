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
  mainImage = ''; // For main news image
  private readonly baseUrl = 'https://new.hardknocknews.tv/upload/media/posts';

  constructor(
    private readonly httpArticle: ArticleService,
    private readonly router: Router
  ) {}

  ngOnInit(): void {
    this.getArticles();
  }

  private getArticles(): void {
    const saved = localStorage.getItem('articles');

    if (saved) {
      const parsed = JSON.parse(saved);
      this.news = this.shuffleAndLimit(parsed, 16);
    } else {
      this.httpArticle.getArticle().subscribe({
        next: ({ posts }: any) => {
          if (!Array.isArray(posts)) {
            this.news = [];
            return;
          }

          const formatted = posts.map((post: any) => ({
            ...post,
            thumb: post.thumb ? `${this.baseUrl}/${post.thumb}-s.jpg` : null,
            relativeTime: this.getRelativeTime(post.spdate),
            views: post.popularity_stats?.all_time_stats || 0
          }))
          .sort((a, b) => b.views - a.views);

          localStorage.setItem('articles', JSON.stringify(formatted));
          this.news = this.shuffleAndLimit(formatted, 16);
        },
        error: err => {
          console.error('Error fetching articles:', err);
          this.news = [];
        }
      });
    }
  }

  getPost(type: string, slug: string, article: any): void {
    localStorage.removeItem('selectedArticle');

    this.httpArticle.getsinglepost(type, slug).subscribe(() => {
      this.setSelectedArticle(article);
      localStorage.setItem('selectedArticle', JSON.stringify(article));

      const route = type === 'video' ? 'video-news' : 'article';
      this.router.navigate([route, type, slug]);
    });
  }

  private setSelectedArticle(article: any): void {
    this.httpArticle.setSelectedArticle(article);
  }

  private getRelativeTime(date: string): string {
    return formatDistanceToNowStrict(parseISO(date));
  }

  private shuffleAndLimit(arr: any[], count: number): any[] {
    return arr
      .map(value => ({ value, sort: Math.random() }))
      .sort((a, b) => a.sort - b.sort)
      .slice(0, count)
      .map(({ value }) => value);
  }
}
