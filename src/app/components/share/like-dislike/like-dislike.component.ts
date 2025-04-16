import { CommonModule } from '@angular/common';
import { Component, HostListener, OnInit, Renderer2 } from '@angular/core';
import { ActivatedRoute, RouterLink } from '@angular/router';
import { ArticleService } from '../../service/article.service';
import { LikeServiceService } from '../service/like-service.service';

@Component({
  selector: 'app-like-dislike',
  imports: [CommonModule,RouterLink],
  templateUrl: './like-dislike.component.html',
  styleUrl: './like-dislike.component.css'
})
export class LikeDislikeComponent implements OnInit {
  showPopup = false;
  showDescription = false;
  showReactions = true;
  showLoginPopup = false;

  article: any;
  reactions: any[] = [];
  selectedReactionIcon: string | null = null;

  liked: boolean = false;
  disliked: boolean = false;

  likeCount: number = 0;

  constructor(
    private renderer: Renderer2,
    private articleService: ArticleService,
    private route: ActivatedRoute,
    private LikeServiceHttp: LikeServiceService
  ) {}

  ngOnInit(): void {
    const storedArticle = localStorage.getItem('selectedArticle');
    if (storedArticle) {
      this.article = JSON.parse(storedArticle);
      if (this.article.reactions && Array.isArray(this.article.reactions)) {
        this.likeCount = this.article.reactions.length;
      }
    } else {
      this.route.params.subscribe(params => {
        this.articleService.getsinglepost(params['type'], params['slug']).subscribe(data => {
          this.article = data;
          if (this.article.reactions && Array.isArray(this.article.reactions)) {
            this.likeCount = this.article.reactions.length;
          }
          localStorage.setItem('selectedArticle', JSON.stringify(data));
        });
      });
    }

    this.getLike();
  }

  togglePopup() {
    this.showPopup = !this.showPopup;
    if (this.showPopup) {
      this.renderer.addClass(document.body, 'blur-bg');
    } else {
      this.renderer.removeClass(document.body, 'blur-bg');
    }
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
    // Handle like toggle directly in UI
    if (this.liked) {
      this.liked = false;
      this.likeCount -= 1;
    } else {
      this.liked = true;
      this.disliked = false;
      this.likeCount += 1;
    }

    this.sendReaction(this.liked ? 'like' : 'dislike');
  }

  toggleDislike() {
    this.disliked = !this.disliked;
    if (this.disliked) {
      this.liked = false;
    }

    this.sendReaction(this.disliked ? 'dislike' : 'like');
  }

  sendReaction(reactionType: string): void {
    const userId = localStorage.getItem('userId');
    const postId = this.article.id;
  
    if (!userId) {
      this.showLoginPopup = true;
      return;
    }
  
    const selected = this.reactions.find(r => r.reaction_type === reactionType);
    if (selected) {
      this.selectedReactionIcon = 'https://new.hardknocknews.tv' + selected.icon;
  
      const allReactions = JSON.parse(localStorage.getItem('postReactions') || '{}');
  
      if (!allReactions[postId]) {
        this.likeCount += 1;
      }
  
      allReactions[postId] = reactionType;
      localStorage.setItem('postReactions', JSON.stringify(allReactions));
    }
  
    const data = {
      user_id: userId,
      post_id: postId,
      reaction_type: reactionType
    };
  
    this.LikeServiceHttp.addReaction(data).subscribe(
      (res: any) => {
        console.log('Reaction sent successfully:', res);
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

        const allReactions = JSON.parse(localStorage.getItem('postReactions') || '{}');
        const savedReaction = allReactions[this.article.id];

        if (savedReaction) {
          const selected = this.reactions.find(r => r.reaction_type === savedReaction);
          if (selected) {
            this.selectedReactionIcon = 'https://new.hardknocknews.tv' + selected.icon;
            this.liked = savedReaction === 'like';  // Ensure the correct state is applied
            this.disliked = savedReaction === 'dislike'; // Ensure the correct state is applied
          }
        }
      },
      (err) => {
        console.error('Failed to get reaction:', err);
      }
    );
  }

  closePopups() {
    this.showLoginPopup = false;
  }
}

