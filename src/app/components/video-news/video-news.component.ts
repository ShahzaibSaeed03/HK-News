import { CommonModule } from '@angular/common';
import { Component, HostListener, OnInit, Renderer2 } from '@angular/core';
import { CommentComponent } from "../comment-control/comment/comment.component";
import { LikeDislikeComponent } from "../share/like-dislike/like-dislike.component";
import { ActivatedRoute } from '@angular/router';
import { ArticleService } from '../service/article.service';
import { MoreNewsComponent } from '../more-news/more-news.component';
import { TrandingNewsComponent } from "../tranding-news/tranding-news.component";

@Component({
  selector: 'app-video-news',
  imports: [
    CommonModule,
    CommentComponent,
    LikeDislikeComponent,
    MoreNewsComponent,
    TrandingNewsComponent
  ],
  templateUrl: './video-news.component.html',
  styleUrl: './video-news.component.css'
})
export class VideoNewsComponent implements OnInit {
  article: any;
  thumbUrl: string | null = null;
  extraImageUrls: string[] = [];
  videoUrl: string | null = null;
  showPopup = false;
  isMobile = false;
  showDescription = false;

  tags: { id: number; name: string; slug: string; icon: string | null; color: string | null }[] = [];

  constructor(
    private renderer: Renderer2,
    private articleService: ArticleService,
    private route: ActivatedRoute
  ) {}

  ngOnInit(): void {
    window.scrollTo(0, 0);
    this.updateIsMobile();

  
    const navData = history.state['articleData'];
    if (navData) {
      this.setArticleData(navData);
    } else {
      // Optional: redirect back or show error if no data received
      console.error("No article data received via router.");
    }
  }
  

  private setArticleData(data: any): void {
    this.article = data;

    this.article.formattedCreatedAt = data.created_at ? this.formatDate(data.created_at) : '';
    this.article.formattedUpdatedAt = data.updated_at ? this.formatDate(data.updated_at) : '';

    this.videoUrl = data.entries?.[0]?.video ? this.getVideoUrl(data.entries[0].video) : null;

    this.setExtraImages(data.entries);
    this.tags = data.tags || [];
  }

  getVideoUrl(path: string): string {
    return `https://new.hardknocknews.tv/${path}`;
  }

  setExtraImages(entries: any[]): void {
    // Placeholder for future if you want to extract images from entries
    this.extraImageUrls = [];
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
}
