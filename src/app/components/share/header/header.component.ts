import { CommonModule } from '@angular/common';
import { Component } from '@angular/core';
import { Router, RouterLink } from '@angular/router';

@Component({
  selector: 'app-header',
  imports: [CommonModule,RouterLink],
  templateUrl: './header.component.html',
  styleUrl: './header.component.css'
})
export class HeaderComponent {

  constructor(private router: Router) {}

  isDropdownOpen = false;
  isMenuOpen = false;
  isMobileDropdownOpen = false;

  toggleMenu() {
    this.isMenuOpen = !this.isMenuOpen;
  }

  toggleMobileDropdown() {
    this.isMobileDropdownOpen = !this.isMobileDropdownOpen;
  }

  goToProfileOrLogin() {
    const token = localStorage.getItem('authToken');
    if (token) {
      this.router.navigate(['/my-profile']);
    } else {
      this.router.navigate(['/login']);
    }
  }

}
