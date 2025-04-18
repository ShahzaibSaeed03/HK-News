import { Component, OnInit } from '@angular/core';
import { WriteCommentComponent } from "../write-comment/write-comment.component";
import { CommonModule } from '@angular/common';
import { CommentService } from '../service/comment.service';

@Component({
  selector: 'app-comment',
  imports: [WriteCommentComponent, CommonModule],
  templateUrl: './comment.component.html',
  styleUrls: ['./comment.component.css']
})
export class CommentComponent implements OnInit {
  comments: any[] = [];
  sortCriteria: string = 'recent';
  localUsername: string = '';

  constructor(private commentService: CommentService) {}

  ngOnInit(): void {
    this.localUsername = localStorage.getItem('user_username') || '';
    this.getCommentByPost();
  }

  getCommentByPost(): void {
    this.commentService.getComments().subscribe(
      response => {
        // Ensure comments is always an array
        if (Array.isArray(response)) {
          this.comments = response;
        } else {
          this.comments = []; // fallback if it's not array
          console.warn('Unexpected response:', response);
        }
  
        // Check matching usernames
        this.comments.forEach(comment => {
          const user = this.getParsedUser(comment.data);
          if (user?.username === this.localUsername) {
            console.log('username match');
          }
        });
  
        this.sortComments();
      },
      error => {
        console.error('Failed to fetch comments:', error);
      }
    );
  }
  

  getParsedUser(data: string): any {
    try {
      const firstParse = JSON.parse(data);
      return JSON.parse(firstParse);
    } catch {
      return {};
    }
  }

  canDeleteComment(comment: any): boolean {
    const user = this.getParsedUser(comment.data);
    return user?.username === this.localUsername;
  }

  deleteComment(commentId: number): void {
    if (confirm('Are you sure you want to delete your comment?')) {
      this.commentService.deleteComment(commentId).subscribe(
        () => {
          this.comments = this.comments.filter(c => c.id !== commentId);
        },
        error => {
          console.error('Delete failed:', error);
        }
      );
    }
  }

  sortComments(): void {
    if (this.sortCriteria === 'recent') {
      this.comments.sort((a, b) => new Date(b.created_at).getTime() - new Date(a.created_at).getTime());
    } else if (this.sortCriteria === 'hottest') {
      this.comments.sort((a, b) => (b.replies ?? 0) - (a.replies ?? 0));
    }
  }

  setSortCriteria(criteria: string): void {
    this.sortCriteria = criteria;
    this.sortComments();
  }


  showDeleteModal = false;
commentIdToDelete: number | null = null;

openDeletePopup(commentId: number): void {
  this.commentIdToDelete = commentId;
  this.showDeleteModal = true;
}

confirmDelete(): void {
  if (this.commentIdToDelete !== null) {
    this.commentService.deleteComment(this.commentIdToDelete).subscribe(
      () => {
        this.comments = this.comments.filter(c => c.id !== this.commentIdToDelete);
        this.showDeleteModal = false;
        this.commentIdToDelete = null;
      },
      error => {
        console.error('Delete failed:', error);
        this.showDeleteModal = false;
        this.commentIdToDelete = null;
      }
    );
  }
}

cancelDelete(): void {
  this.showDeleteModal = false;
  this.commentIdToDelete = null;
}

}
