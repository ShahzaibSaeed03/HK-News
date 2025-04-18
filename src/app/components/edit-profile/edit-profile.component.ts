import { Component, Input, OnInit } from '@angular/core';
import { Router } from '@angular/router';
import { UserService } from '../../services/user.service';
import { CommonModule } from '@angular/common';
import { FormsModule } from '@angular/forms';

@Component({
  selector: 'app-edit-profile',
  standalone: true,
  imports: [CommonModule, FormsModule],
  templateUrl: './edit-profile.component.html',
  styleUrl: './edit-profile.component.css'
})
export class EditProfileComponent implements OnInit {
  @Input() user: any;
  updatedUser: any = {};

  constructor(
    private userService: UserService,
    private router: Router
  ) {}

  ngOnInit(): void {
    const storedUser = localStorage.getItem('editUser');
    if (storedUser) {
      this.updatedUser = JSON.parse(storedUser);
      console.log('Loaded user from localStorage:', this.updatedUser);
    } else {
      console.warn('No user data found in localStorage');
      this.router.navigate(['/my-profile']);
    }
  }

  updateProfile(): void {
    const userId = this.updatedUser?.id || 1; // Use actual ID if stored
    console.log('Submitting updated profile for user ID:', userId);
    console.log('Updated user data:', this.updatedUser);

    this.userService.updateUserProfile(userId, this.updatedUser).subscribe({
      next: (res: any) => {
        if (res.success) {
          console.log('Profile update successful:', res);
          this.router.navigate(['/my-profile']);
        } else {
          console.error('Profile update failed:', res.message);
        }
      },
      error: (err) => {
        console.error('Error updating profile:', err);
      }
    });
  }
}
