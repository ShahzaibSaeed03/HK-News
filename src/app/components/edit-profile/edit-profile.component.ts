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
  showSuccess: boolean = false; // ✅ For showing popup

  constructor(
    private userService: UserService,
    private router: Router
  ) {}

  ngOnInit(): void {
    const storedUser = localStorage.getItem('editUser');
    if (storedUser) {
      this.updatedUser = JSON.parse(storedUser);
    } else {
      this.router.navigate(['/my-profile']);
    }
  }
  updateProfile(): void {
    this.userService.updateUserProfile(this.updatedUser).subscribe({
      next: (res: any) => {
        console.log('Update Response:', res); // 👈 log to debug
  
        if (res?.success) {
          this.showSuccess = true;
  
          setTimeout(() => {
            this.showSuccess = false; // 👈 hide popup after some time
            this.router.navigate(['/my-profile']);
          }, 2000);
        }
      },
      error: (err) => {
        console.error('Error updating profile:', err);
      }
    });
  }
  
}

