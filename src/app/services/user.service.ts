import { HttpClient } from '@angular/common/http';
import { Injectable } from '@angular/core';
import { Observable } from 'rxjs';

@Injectable({
  providedIn: 'root'
})
export class UserService {
  private apiUrl = 'https://new.hardknocknews.tv/api/user/details';

  constructor(private http: HttpClient) {}

  getUserDetails(id: number): Observable<any> {
    return this.http.get(`${this.apiUrl}/${id}`);
  }
    // Method to update the user profile
    updateUserProfile(userId: number, userData: any): Observable<any> {
      return this.http.post<any>(`${this.apiUrl}/user/update/${userId}`, userData);
    }
}
