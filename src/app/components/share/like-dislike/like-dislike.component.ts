import { CommonModule } from '@angular/common';
import { Component, HostListener, OnInit, Renderer2 } from '@angular/core';
import { ActivatedRoute, RouterLink } from '@angular/router';
import { ArticleService } from '../../service/article.service';
import { LikeServiceService } from '../service/like-service.service';

@Component({
  selector: 'app-like-dislike',
  standalone: true,
  imports: [CommonModule, RouterLink],
  templateUrl: './like-dislike.component.html',
  styleUrl: './like-dislike.component.css'
})
export class LikeDislikeComponent implements OnInit {
  showPopup = false;
  showLoginPopup = false;
  article: any;
  reactions: any[] = [];
  selectedReactionIcon: string | null = null;
  liked = false;
  likeCount = 0;
  likeData: any;
  showReactions = true;
  linkCopied: boolean = false;



  constructor(
    private renderer: Renderer2,
    private articleService: ArticleService,
    private route: ActivatedRoute,
    private LikeServiceHttp: LikeServiceService
  ) {}

  ngOnInit(): void {
    localStorage.removeItem('reaction'); // ✅ Clear any stored reaction

    const storedArticle = localStorage.getItem('selectedArticle');
    if (storedArticle) {
      this.article = JSON.parse(storedArticle);
      this.likeCount = Array.isArray(this.article.reactions) ? this.article.reactions.length : 0;
    } else {
      this.route.params.subscribe(params => {
        this.articleService.getsinglepost(params['type'], params['slug']).subscribe(data => {
          this.article = data;
          this.likeCount = Array.isArray(data.reactions) ? data.reactions.length : 0;
          localStorage.setItem('selectedArticle', JSON.stringify(data));
        });
      });
    }

    this.loadReactionData();
    this.getLike();
  }

  loadReactionData(): void {
    const currentUserId = localStorage.getItem('userId');
    this.articleService.getLike().subscribe({
      next: (res) => {
        this.likeData = res?.post;
        const userReaction = this.likeData?.reactions?.find(
          (reaction: any) => reaction.user_id == currentUserId
        );
        this.selectedReactionIcon = userReaction ? 'https://new.hardknocknews.tv' + userReaction.gif : null;
      },
      error: (err) => console.error('Error loading reactions:', err)
    });
  }

  togglePopup() {
    this.showPopup = !this.showPopup;
    this.renderer[this.showPopup ? 'addClass' : 'removeClass'](document.body, 'blur-bg');
  }

  @HostListener('document:click', ['$event'])
  closePopup(event: Event) {
    const target = event.target as HTMLElement;
    if (
      !target.closest('.popup-container') &&
      !target.closest('.share-btn') &&
      !target.closest('.like-dislike')
    ) {
      this.renderer.removeClass(document.body, 'blur-bg');
    }
  }

  toggleLike() {
    this.liked = !this.liked;
    this.likeCount += this.liked ? 1 : -1;
    this.sendReaction(this.liked ? 'like' : 'dislike');
  }

  sendReaction(reactionType: string): void {
    const userId = localStorage.getItem('userId');
    const selectedArticle = localStorage.getItem('selectedArticle');
    const postId = selectedArticle ? JSON.parse(selectedArticle).id : null;

    if (!userId || !postId) {
      this.showLoginPopup = true;
      return;
    }

    const data = {
      user_id: userId,
      post_id: postId,
      reaction_type: reactionType
    };

    this.LikeServiceHttp.addReaction(data).subscribe(
      (res: any) => {
        console.log('Reaction sent successfully:', res);
        this.selectedReactionIcon = null;
        this.loadReactionData();
      },
      (err) => {
        console.error('Failed to add reaction:', err);
        alert('Error submitting reaction');
      }
    );
  }

  getLike(): void {
    this.LikeServiceHttp.getReaction().subscribe(
      (res: any) => {
        this.reactions = res.reactions;
      },
      (err) => {
        console.error('Failed to get reaction:', err);
      }
    );
  }

  closePopups() {
    this.showLoginPopup = false;
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
