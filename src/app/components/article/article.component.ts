import { CommonModule } from '@angular/common';
import { Component, HostListener, OnInit, Renderer2 } from '@angular/core';
import { ActivatedRoute } from '@angular/router';

import { ArticleService } from '../service/article.service';

import { CommentComponent } from '../comment-control/comment/comment.component';
import { LikeDislikeComponent } from "../share/like-dislike/like-dislike.component";
import { MoreNewsComponent } from '../more-news/more-news.component';
import { TrandingNewsComponent } from "../tranding-news/tranding-news.component";

@Component({
  selector: 'app-article',
  standalone: true,
  imports: [
    CommonModule,
    CommentComponent,
    LikeDislikeComponent,
    MoreNewsComponent,
    TrandingNewsComponent
  ],
  templateUrl: './article.component.html',
  styleUrls: ['./article.component.css']
})
export class ArticleComponent implements OnInit {
  private baseUrl = 'https://new.hardknocknews.tv';

  article: any;
  thumbUrl: string | null = null;
  extraImageUrls: string[] = [];
  showPopup = false;
  linkCopied: boolean = false;


  tags: { id: number; name: string; slug: string; icon: string | null; color: string | null }[] = [];

  constructor(
    private renderer: Renderer2,
    private articleService: ArticleService,
    private route: ActivatedRoute
  ) {}

  ngOnInit(): void {
    window.scrollTo(0, 0);

    this.articleService.getLike().subscribe({
      next: (res) => console.log('Like Data:', res),
      error: (err) => console.error('Error fetching like data:', err)
    });

    const navData = history.state['articleData'];
    const storedArticle = localStorage.getItem('selectedArticle');

    if (navData) {
      this.handleArticle(navData);
    } else if (storedArticle) {
      this.handleArticle(JSON.parse(storedArticle));
    } else {
      console.error('No article data received.');
      return;
    }
  }

  handleArticle(data: any): void {
    this.article = data;
    this.setThumbFromEntriesOnly(data.entries || []);
    this.setExtraImages(data.entries || []);
    this.tags = data.tags || [];
    this.article.spdate = this.calculateTimeAgo(data.spdate);
    console.log(this.article);
  }
  
  setThumbFromEntriesOnly(entries: any[]): void {
    const imageEntry = entries.find((entry: any) => entry.type === 'image' && entry.image);
  
    if (imageEntry) {
      const cleanImage = imageEntry.image.replace(/(-s|-m|-l)?\.jpg$/, '.jpg'); // force original
      this.thumbUrl = cleanImage.startsWith('http')
        ? cleanImage
        : `${this.baseUrl}/upload/media/entries/${cleanImage}`;
      
      console.log('Thumbnail set from entry image:', this.thumbUrl);
    }
  }
  
  
  

  setThumbUrl(thumb: string): void {
    if (!thumb) return;
  
    const cleanThumb = thumb.replace(/(-s|-m|-l)?\.jpg$/, '');
    this.thumbUrl = cleanThumb.startsWith('http')
      ? `${cleanThumb}-s.jpg`
      : `${this.baseUrl}/upload/media/entries/${cleanThumb}-s.jpg`;
  
    console.log('Thumbnail Image URL:', this.thumbUrl);
  }
  

  setExtraImages(entries: any[]): void {
    this.extraImageUrls = [];
  
    entries.forEach((entry: any) => {
      if (entry.type === 'image' && entry.image) {
        const imageUrl: string | null = this.setImageUrl(entry.image);
        if (imageUrl) {
          this.extraImageUrls.push(imageUrl);
          console.log('Image URL:', imageUrl);
        }
      }
  
      if (entry.type === 'video' && entry.video) {
        const videoUrl = this.setVideoUrl(entry.video);
        console.log('Video URL:', videoUrl);
      }
  
      if (entry.type === 'text' && entry.body) {
        this.extraImageUrls.push(entry.body);
        console.log('Text Body:', entry.body);
      }
    });
  }
  


setImageUrl(image: string): string | null {
  if (!image || !image.endsWith('.jpg')) {
    return null; // Skip broken or missing images
  }

  const cleanImage = image
    .replace(/-0-/, '-')                    // remove -0-
    .replace(/(-s|-m|-l)?\.jpg$/, '.jpg');  // normalize ending

  return cleanImage.startsWith('http')
    ? cleanImage
    : `${this.baseUrl}/upload/media/entries/${cleanImage}`;
}




  
  

  setVideoUrl(video: string): string {
    let finalVideoUrl = video.startsWith('http')
      ? video
      : `${this.baseUrl}/${video}`;

    return finalVideoUrl.replace(/[^a-zA-Z0-9\-._~:\/?#[\]@!$&'()*+,;=]/g, (match) => {
      return '%' + match.charCodeAt(0).toString(16).toUpperCase();
    });
  }

  calculateTimeAgo(dateString: string): string {
    const now = new Date();
    const date = new Date(dateString);

    const seconds = Math.floor((now.getTime() - date.getTime()) / 1000);
    const minutes = Math.floor(seconds / 60);
    const hours = Math.floor(minutes / 60);
    const days = Math.floor(hours / 24);
    const months = Math.floor(days / 30);
    const years = Math.floor(days / 365);

    if (years > 0) return `${years} year${years > 1 ? 's' : ''} ago`;
    if (months > 0) return `${months} month${months > 1 ? 's' : ''} ago`;
    if (days > 0) return `${days} day${days > 1 ? 's' : ''} ago`;
    if (hours > 0) return `${hours} hour${hours > 1 ? 's' : ''} ago`;
    if (minutes > 0) return `${minutes} minute${minutes > 1 ? 's' : ''} ago`;
    return `${seconds} second${seconds > 1 ? 's' : ''} ago`;
  }

  togglePopup(): void {
    this.showPopup = !this.showPopup;
    this.showPopup
      ? this.renderer.addClass(document.body, 'blur-bg')
      : this.renderer.removeClass(document.body, 'blur-bg');
  }

  @HostListener('document:click', ['$event'])
  closePopup(event: Event): void {
    const target = event.target as HTMLElement;
    if (!target.closest('.popup-container') && !target.closest('.share-btn')) {
      this.showPopup = false;
      this.renderer.removeClass(document.body, 'blur-bg');
    }
  }


  shareOn(platform: string): void {
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
      case 'link':
        // Copy the URL to the clipboard
        navigator.clipboard.writeText(window.location.href).then(() => {
          this.linkCopied = true;
          this.showPopup=false
          // Hide the "Link Copied!" message after 1 second
          setTimeout(() => {
            this.linkCopied = false;
          }, 1000);
        }).catch(err => {
          console.error('Error copying text: ', err);
        });
        return; // Exit the function after copying the link
      case 'instagram':
        shareUrl = `https://www.instagram.com/?url=${url}`; // Note: Instagram does not have a direct sharing URL API
        break;
      case 'youtube':
        shareUrl = `https://www.youtube.com/share?url=${url}`; // Note: YouTube also lacks a direct sharing URL API
        break;
      case 'snapchat':
        shareUrl = `https://www.snapchat.com/scan?attachmentUrl=${url}`; // Example URL for Snapchat share
        break;
      case 'tumblr':
        shareUrl = `https://www.tumblr.com/share/link?url=${url}`;
        break;
      default:
        alert('Sharing not supported for this platform.');
        return;
    }

    // Open the share URL in a new tab
    window.open(shareUrl, '_blank');

    // Close the "Link Copied!" popup after sharing
    this.linkCopied = false;
    this.showPopup = false;
  }
  
}
