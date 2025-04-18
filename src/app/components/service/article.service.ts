import { HttpClient } from '@angular/common/http';
import { Injectable } from '@angular/core';
import { Observable } from 'rxjs';

@Injectable({
  providedIn: 'root'
})
export class ArticleService {
  private selectedArticle: any;

  private apiBase = 'https://new.hardknocknews.tv/api';

  constructor(private http: HttpClient) {}

  // Store selected article
  setSelectedArticle(article: any) {
    this.selectedArticle = article;
  }

  // Get selected article
  getSelectedArticle() {
    return this.selectedArticle;
  }

  // Get all articles
  getArticle(): Observable<any> {
    return this.http.get(`${this.apiBase}/posts/all`);
  }

  // Get single post by type and slug
  getsinglepost(type: string, slug: string): Observable<any> {
    const url = `${this.apiBase}/post/${type}/${slug}`;
    console.log('GET Request URL:', url);
    return this.http.get(url);
  }

  // 🔥 Increment view for post ID
  postIncriment(postId: any): Observable<any> {
    const url = `${this.apiBase}/posts/${postId}/increment-view`;
    return this.http.post(url, {});
  }
 
  getLike(): Observable<any> {
    const storedArticle = localStorage.getItem('selectedArticle');
    if (storedArticle) {
      const article = JSON.parse(storedArticle);
      const slug = article.slug;
      const type = article.type;
  
      const url = `${this.apiBase}/post/simple/${type}/${slug}`;
      console.log('Like API URL:', url);
      return this.http.get(url);
    } else {
      console.error('No selectedArticle found in localStorage.');
      return new Observable(observer => {
        observer.error('No article slug found');
      });
    }
  }
  
  getcount(): Observable<any> {
    const storedArticle = localStorage.getItem('selectedArticle');
    if (storedArticle) {
      const article = JSON.parse(storedArticle);
      const slug = article.slug;
      const type = article.type;
  
      const url = `${this.apiBase}/post/${type}/${slug}/stats`;
      console.log('Stats API URL:', url);
      return this.http.get(url);
    } else {
      console.error('No selectedArticle found in localStorage.');
      return new Observable(observer => {
        observer.error('No article slug found');
      });
    }
  }
  




}
