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
  styleUrls: ['./more-news.component.css']
})
export class MoreNewsComponent implements OnInit {
  news: any[] = [];
  private readonly baseUrl = 'https://new.hardknocknews.tv/upload/media/posts';

  constructor(
    private readonly httpArticle: ArticleService,
    private readonly router: Router
  ) {}

  ngOnInit(): void {
    const savedArticles = localStorage.getItem('articles');
    if (savedArticles) {
      this.news = this.shuffleAndLimit(JSON.parse(savedArticles), 15);
    } else {
      this.fetchArticles();
    }
  }

  private fetchArticles(): void {
    this.httpArticle.getArticle().subscribe({
      next: (res: any) => {
        const posts = res?.posts;
        if (!Array.isArray(posts)) {
          this.news = [];
          return;
        }

        const mapped = posts.map((post: any) => this.mapPost(post)).sort(
          (a, b) => new Date(b.spdate).getTime() - new Date(a.spdate).getTime()
        );

        localStorage.setItem('articles', JSON.stringify(mapped));
        this.news = this.shuffleAndLimit(mapped, 15);
      },
      error: () => {
        this.news = [];
      }
    });
  }

  getTranding(): void {
    this.httpArticle.getArticle().subscribe({
      next: (res: any) => {
        const posts = res?.posts;
        if (!Array.isArray(posts)) {
          this.news = [];
          return;
        }

        this.news = posts
          .map((post: any) => {
            const mapped = this.mapPost(post);
            return {
              ...mapped,
              views: post.popularity_stats?.all_time_stats || 0
            };
          })
          .sort((a, b) => b.views - a.views)
          .slice(0, 10);
      },
      error: () => {
        this.news = [];
      }
    });
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

  private mapPost(post: any): any {
    return {
      ...post,
      thumb: post.thumb ? `${this.baseUrl}/${post.thumb}-s.jpg` : null,
      relativeTime: this.getRelativeTime(post.spdate)
    };
  }

  private shuffleAndLimit(arr: any[], count: number): any[] {
    return arr
      .map(value => ({ value, sort: Math.random() }))
      .sort((a, b) => a.sort - b.sort)
      .slice(0, count)
      .map(({ value }) => value);
  }

  private getRelativeTime(date: string): string {
    return formatDistanceToNowStrict(parseISO(date));
  }

  private setSelectedArticle(article: any): void {
    this.httpArticle.setSelectedArticle(article);
  }
}
