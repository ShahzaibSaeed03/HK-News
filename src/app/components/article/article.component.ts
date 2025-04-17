import { CommonModule } from '@angular/common';
import { Component, HostListener, OnInit, Renderer2 } from '@angular/core';
import { ArticleService } from '../service/article.service';
import { ActivatedRoute } from '@angular/router';
import { CommentComponent } from '../comment-control/comment/comment.component';
import { LikeDislikeComponent } from "../share/like-dislike/like-dislike.component";
import { MoreNewsComponent } from '../more-news/more-news.component';
import { TrandingNewsComponent } from "../tranding-news/tranding-news.component";

@Component({
  selector: 'app-article',
  imports: [CommonModule, CommentComponent, LikeDislikeComponent, MoreNewsComponent, TrandingNewsComponent],
  templateUrl: './article.component.html',
  styleUrl: './article.component.css'
})
export class ArticleComponent implements OnInit {
  private baseUrl = 'https://new.hardknocknews.tv';
  article: any;
  thumbUrl: string | null = null;
  extraImageUrls: string[] = [];
  showPopup = false;
  tags: { id: number; name: string; slug: string; icon: string | null; color: string | null }[] = [];

  constructor(
    private renderer: Renderer2,
    private articleService: ArticleService,
    private route: ActivatedRoute
  ) {}

  ngOnInit(): void {
    const navData = history.state['articleData']; // 👈 router se data le rahe hain
  
    if (navData) {
      this.article = navData;
      this.setThumbUrl(this.article.thumb);
      this.setExtraImages(this.article.entries);
      this.tags = this.article.tags;
      console.log(this.article);
      this.article.spdate = this.calculateTimeAgo(this.article.spdate);
    } else {
      // If data not found (e.g. direct URL open), redirect or show message
      console.error("No article data received.");
      // Optional: Redirect to home or 404 page
      // this.router.navigate(['/']);
    }
  }
  

  // Calculate the time difference in a human-readable format (e.g., "3 hours ago")
  calculateTimeAgo(dateString: string): string {
    const now = new Date();
    const date = new Date(dateString);
    
    const seconds = Math.floor((now.getTime() - date.getTime()) / 1000);
    const minutes = Math.floor(seconds / 60);
    const hours = Math.floor(minutes / 60);
    const days = Math.floor(hours / 24);
    const months = Math.floor(days / 30);
    const years = Math.floor(days / 365);
  
    // If the time difference is more than a year
    if (years > 0) {
      return `${years} year${years > 1 ? 's' : ''} ago`;
    }
    // If the time difference is more than a month but less than a year
    else if (months > 0) {
      return `${months} month${months > 1 ? 's' : ''} ago`;
    }
    // If the time difference is more than a day but less than 30 days
    else if (days > 0) {
      return `${days} day${days > 1 ? 's' : ''} ago`;
    }
    // If the time difference is more than an hour but less than a day
    else if (hours > 0) {
      return `${hours} hour${hours > 1 ? 's' : ''} ago`;
    }
    // If the time difference is more than a minute but less than an hour
    else if (minutes > 0) {
      return `${minutes} minute${minutes > 1 ? 's' : ''} ago`;
    }
    // If the time difference is less than a minute
    else {
      return `${seconds} second${seconds > 1 ? 's' : ''} ago`;
    }
  }
  

  setThumbUrl(thumb: string) {
    if (!thumb) return;

    const cleanThumb = thumb.replace(/(-s|-m|-l)?\.jpg$/, '');
    this.thumbUrl = cleanThumb.startsWith('http')
      ? `${cleanThumb}-s.jpg`
      : `${this.baseUrl}/${cleanThumb}-s.jpg`;
    console.log('Thumbnail Image URL:', this.thumbUrl);
  }

  setExtraImages(entries: any[]) {
    if (!entries || entries.length === 0) return;
  
    entries.forEach((entry: any) => {
      // Check if entry has an image
      if (entry.type === 'image' && entry.image) {
        const imageUrl = this.setImageUrl(entry.image);
        this.extraImageUrls.push(imageUrl);
        console.log('Image URL:', imageUrl); // Log image URL
      }
  
      // Check if entry has a video
      if (entry.type === 'video' && entry.video) {
        const videoUrl = this.setVideoUrl(entry.video);
        console.log('Video URL:', videoUrl); // Log video URL
      }
  
      // Check if entry has text (body)
      if (entry.type === 'text' && entry.body) {
        this.extraImageUrls.push(entry.body); // Store the body as part of extraImageUrls for rendering
        console.log('Text Body:', entry.body); // Log the body content
      }
    });
  }
  
  
  setImageUrl(image: string): string {
    if (!image) return '';
    
    const cleanImage = image.replace(/(-s|-m|-l)?\.jpg$/, '');
    return cleanImage.startsWith('http')
      ? `${cleanImage}-s.jpg`
      : `${this.baseUrl}/${cleanImage}-s.jpg`;
  }
  
  setVideoUrl(video: string): string {
    if (!video) return '';
  
    // Check if video URL is relative or full
    let finalVideoUrl = video.startsWith('http') ? video : `${this.baseUrl}/${video}`;
  
    // Encode the URL, but keep the slash (/) intact
    finalVideoUrl = finalVideoUrl.replace(/[^a-zA-Z0-9\-._~:\/?#[\]@!$&'()*+,;=]/g, (match) => {
      return '%' + match.charCodeAt(0).toString(16).toUpperCase();
    });
  
    return finalVideoUrl;
  }
  
  

  

 

  togglePopup() {
    this.showPopup = !this.showPopup;
    this.showPopup
      ? this.renderer.addClass(document.body, 'blur-bg')
      : this.renderer.removeClass(document.body, 'blur-bg');
  }

  @HostListener('document:click', ['$event'])
  closePopup(event: Event) {
    const target = event.target as HTMLElement;
    if (!target.closest('.popup-container') && !target.closest('.share-btn')) {
      this.showPopup = false;
      this.renderer.removeClass(document.body, 'blur-bg');
    }
  }


  shareOn(platform: string) {
    const url = encodeURIComponent(window.location.href);
    let shareUrl = '';
  
    switch (platform) {
      case 'facebook':
        shareUrl = `https://www.facebook.com/sharer/sharer.php?u=${url}`;
        break;
      case 'twitter':
        shareUrl = `https://twitter.com/intent/tweet?url=${url}`;
        break;
      case 'linkedin':
        shareUrl = `https://www.linkedin.com/sharing/share-offsite/?url=${url}`;
        break;
      case 'whatsapp':
        shareUrl = `https://api.whatsapp.com/send?text=${url}`;
        break;
      case 'telegram':
        shareUrl = `https://t.me/share/url?url=${url}`;
        break;
      case 'reddit':
        shareUrl = `https://www.reddit.com/submit?url=${url}`;
        break;
      case 'pinterest':
        shareUrl = `https://pinterest.com/pin/create/button/?url=${url}`;
        break;
      case 'email':
        shareUrl = `mailto:?subject=Check this out&body=${url}`;
        break;
      case 'text':
        shareUrl = `sms:?body=${url}`;
        break;
      default:
        alert('Sharing not supported for this platform.');
        return;
    }
  
    window.open(shareUrl, '_blank');
  }
  
}
