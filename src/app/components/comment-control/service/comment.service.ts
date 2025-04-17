import { HttpClient } from '@angular/common/http';
import { Injectable } from '@angular/core';
import { Observable } from 'rxjs';

@Injectable({
  providedIn: 'root'
})
export class CommentService {

  private apiUrl = 'https://new.hardknocknews.tv/easy/public/api/comments/content';

  constructor(private http: HttpClient) {}

  getComments(): Observable<any> {
    const selectedArticle = localStorage.getItem('selectedArticle');
    const article = selectedArticle ? JSON.parse(selectedArticle) : null;
    const contentId = article ? `Post_${article.id}` : '';

    return this.http.get(`${this.apiUrl}/${contentId}`);
  }

  editComment(url: string, data: any) {
    return this.http.post(url, data);
  }

  deleteComment(commentId: number): Observable<any> {
    return this.http.delete(`https://new.hardknocknews.tv/easy/public/api/comments_api/${commentId}/delete`);
  }
}
