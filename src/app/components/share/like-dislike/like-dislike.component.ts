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
}
