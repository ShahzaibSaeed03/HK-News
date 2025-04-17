import { Component, Input, OnInit } from '@angular/core';
import { Router, ActivatedRoute } from '@angular/router';
import { UserService } from '../../services/user.service';
import { CommonModule } from '@angular/common';
import { FormsModule } from '@angular/forms';

@Component({
  selector: 'app-edit-profile',
  imports: [CommonModule,FormsModule],
  templateUrl: './edit-profile.component.html',
  styleUrl: './edit-profile.component.css'
})
export class EditProfileComponent implements OnInit {
  @Input() user: any;  // To receive user data
  updatedUser: any = {};

  constructor(
    private userService: UserService,
    private router: Router,
    private activatedRoute: ActivatedRoute
  ) {}

  ngOnInit(): void {
    const storedUser = localStorage.getItem('editUser');
    if (storedUser) {
      this.updatedUser = JSON.parse(storedUser);
    } else {
      alert('No user data found!');
      this.router.navigate(['/my-profile']);
    }
  }
  

  // Method to submit the updated profile data
  updateProfile(): void {
    const userId = 1; // Use dynamic user ID if needed
    this.userService.updateUserProfile(userId, this.updatedUser).subscribe((res) => {
      if (res.success) {
        alert('Profile updated successfully');
        this.router.navigate(['/my-profile']); // Navigate to profile page after successful update
      } else {
        alert('Failed to update profile');
      }
    });
  }
}