import { CommonModule } from '@angular/common';
import { HttpClient } from '@angular/common/http';
import { Component, Output, EventEmitter } from '@angular/core';
import { FormsModule } from '@angular/forms';
import { RouterLink } from '@angular/router';
// ...rest of your imports

@Component({
  selector: 'app-write-comment',
  standalone: true,
  imports: [CommonModule, FormsModule, RouterLink],
  templateUrl: './write-comment.component.html',
  styleUrls: ['./write-comment.component.css']
})
export class WriteCommentComponent {
  @Output() commentSubmitted = new EventEmitter<void>();

  showLoginPopup = false;
  commentText: string = '';

  constructor(private http: HttpClient) {}

  onSubmit() {
    const selectedArticle = localStorage.getItem('selectedArticle');
    const username = localStorage.getItem('user_username');
    const email = localStorage.getItem('user_email');

    if (!selectedArticle || !username || !email) {
      this.showLoginPopup = true;
      return;
    }

    const article = JSON.parse(selectedArticle);

    const commentData = {
      comment: this.commentText,
      type: 'addcomment',
      content_id: `Post_${article.id}`,
      content_url: `https://new.hardknocknews.tv/post/${article.id}`,
      access_domain: 'new.hardknocknews.tv',
      user_username: username,
      user_email: email
    };

    this.http.post('https://new.hardknocknews.tv/easy/public/api/comments_api/submit', commentData)
      .subscribe(
        response => {
          console.log('Comment submitted:', response);
          this.commentText = '';
          this.commentSubmitted.emit(); // trigger event
        },
        error => {
          console.error('Error posting comment:', error);
        }
      );
  }

  closePopup() {
    this.showLoginPopup = false;
  }
}
