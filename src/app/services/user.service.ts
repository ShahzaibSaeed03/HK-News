import { HttpClient } from '@angular/common/http';
import { Injectable } from '@angular/core';
import { Observable } from 'rxjs';

@Injectable({
  providedIn: 'root'
})
export class UserService {
  private apiUrl = 'https://new.hardknocknews.tv/api/user/details';
  private apiUrls = 'https://new.hardknocknews.tv/api/user';

  constructor(private http: HttpClient) {}

  // Get userId from localStorage
  private getUserId(): number {
    return Number(localStorage.getItem('userId'));
  }

  getUserDetails(): Observable<any> {
    const userId = this.getUserId();
    return this.http.get(`${this.apiUrl}/${userId}`);
  }

  updateUserProfile(userData: any): Observable<any> {
    const userId = this.getUserId();
    return this.http.put<any>(`${this.apiUrls}/${userId}`, userData);
  }
}
