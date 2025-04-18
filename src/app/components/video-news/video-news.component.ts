import { CommonModule } from '@angular/common';
import { Component, HostListener, OnInit, Renderer2 } from '@angular/core';
import { ActivatedRoute } from '@angular/router';

import { ArticleService } from '../service/article.service';

import { CommentComponent } from "../comment-control/comment/comment.component";
import { LikeDislikeComponent } from "../share/like-dislike/like-dislike.component";
import { MoreNewsComponent } from '../more-news/more-news.component';
import { TrandingNewsComponent } from "../tranding-news/tranding-news.component";

@Component({
  selector: 'app-video-news',
  standalone: true,
  imports: [
    CommonModule,
    CommentComponent,
    LikeDislikeComponent,
    MoreNewsComponent,
    TrandingNewsComponent
  ],
  templateUrl: './video-news.component.html',
  styleUrls: ['./video-news.component.css']
})
export class VideoNewsComponent implements OnInit {
  article: any;
  thumbUrl: string | null = null;
  extraImageUrls: string[] = [];
  videoUrl: string | null = null;
  showPopup = false;
  isMobile = false;
  showDescription = false;
  allTimeStats = 0;

  tags: { id: number; name: string; slug: string; icon: string | null; color: string | null }[] = [];

  constructor(
    private renderer: Renderer2,
    private articleService: ArticleService,
    private route: ActivatedRoute
  ) {}

  ngOnInit(): void {
    window.scrollTo(0, 0);
    this.updateIsMobile();

    const storedArticle = localStorage.getItem('selectedArticle');

    if (storedArticle) {
      this.article = JSON.parse(storedArticle);
      this.handleArticle(this.article);
    } else {
      this.route.params.subscribe(params => {
        this.articleService.getsinglepost(params['type'], params['slug']).subscribe(data => {
          this.article = data;
          localStorage.setItem('selectedArticle', JSON.stringify(data));
          this.handleArticle(data);
        });
      });
    }

    this.fetchCount();
  }

  handleArticle(data: any): void {
    this.incrementPostView(data);
    this.article.formattedCreatedAt = data.created_at ? this.formatDate(data.created_at) : '';
    this.article.formattedUpdatedAt = data.updated_at ? this.formatDate(data.updated_at) : '';
    this.videoUrl = data.entries?.[0]?.video ? this.getVideoUrl(data.entries[0].video) : null;
    this.setExtraImages(data.entries || []);
    this.tags = data.tags || [];
  }

  getVideoUrl(path: string): string {
    return `https://new.hardknocknews.tv/${path}`;
  }

  setExtraImages(entries: any[]): void {
    this.extraImageUrls = []; // Placeholder for future
  }

  togglePopup(): void {
    this.showPopup = !this.showPopup;
    this.showPopup
      ? this.renderer.addClass(document.body, 'blur-bg')
      : this.renderer.removeClass(document.body, 'blur-bg');
  }

  @HostListener('document:click', ['$event'])
  onDocumentClick(event: Event): void {
    const target = event.target as HTMLElement;
    if (!target.closest('.popup-container') && !target.closest('.share-btn')) {
      this.showPopup = false;
      this.renderer.removeClass(document.body, 'blur-bg');
    }
  }

  @HostListener('window:resize')
  updateIsMobile(): void {
    this.isMobile = window.innerWidth < 768;
  }

  formatDate(dateStr: string): string {
    const date = new Date(dateStr);
    if (isNaN(date.getTime())) {
      console.error("Invalid date:", dateStr);
      return 'Invalid date';
    }
    return date.toLocaleDateString('en-US', {
      year: 'numeric',
      month: 'long',
      day: 'numeric'
    });
  }

  fetchCount(): void {
    this.articleService.getcount().subscribe({
      next: (res) => {
        console.log('Like Count from API:', res);
        this.allTimeStats = res?.stats?.all_time_stats || 0;
      },
      error: (err) => {
        console.error('Error fetching like count:', err);
      }
    });
  }

  incrementPostView(articleData?: any): void {
    const data = articleData || JSON.parse(localStorage.getItem('selectedArticle') || '{}');
    const postId = data?.id;

    if (postId) {
      this.articleService.postIncriment(postId).subscribe({
        next: (res) => console.log('✅ View incremented:', res),
        error: (err) => console.error('❌ View increment error:', err)
      });
    } else {
      console.warn('⚠️ post.id not found for incrementing view');
    }
  }
}
