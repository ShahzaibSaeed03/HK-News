import { Component, OnInit } from '@angular/core';
import { UserService } from '../../services/user.service';
import { CommonModule } from '@angular/common';
import { Router, RouterLink } from '@angular/router';

@Component({
  selector: 'app-my-profile',
  templateUrl: './my-profile.component.html',
  styleUrls: ['./my-profile.component.css'],
  imports: [CommonModule, RouterLink]
})
export class MyProfileComponent implements OnInit {
  user: any;

  constructor(private userService: UserService, private router: Router) {}

  ngOnInit(): void {
    const token = localStorage.getItem('authToken');

    if (!token) {
      this.router.navigate(['/login']);
      return;
    }

    const userId = 1; // Replace with dynamic ID if available
    this.userService.getUserDetails(userId).subscribe((res) => {
      if (res.success) {
        this.user = res.user;
      }
    });
  }


  editProfile(): void {
    localStorage.setItem('editUser', JSON.stringify(this.user));
    this.router.navigate(['/edit-profile']);
  }
  

  logout(): void {
    localStorage.removeItem('authToken');
    this.router.navigate(['/login']);
  }
}
