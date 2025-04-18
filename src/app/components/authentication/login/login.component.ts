import { Component } from '@angular/core';
import { Router, RouterLink } from '@angular/router';
import { HttpRequestService } from '../service/http-request.service';
import { FormsModule, NgForm } from '@angular/forms';
import { CommonModule } from '@angular/common';

@Component({
  selector: 'app-login',
  standalone: true,
  imports: [FormsModule, CommonModule,RouterLink],
  templateUrl: './login.component.html',
  styleUrl: './login.component.css'
})
export class LoginComponent {
  user = {
    email: '',
    password: ''
  };

  showLoginSuccess: boolean = false;

  constructor(private httpRequestService: HttpRequestService, private router: Router) {}

  loginUser(form: NgForm) {
    if (form.invalid) {
      return;
    }

    this.httpRequestService.login(this.user).subscribe(
      (response: any) => {
        console.log('Login successful', response);

        // Show success message
        this.showLoginSuccess = true;

        // Store token and user info
        localStorage.setItem('authToken', response.token);
        localStorage.setItem('userId', response.user.id.toString());
        localStorage.setItem('user_username', response.user.username);
        localStorage.setItem('user_email', response.user.email);

        // Redirect after delay
        setTimeout(() => {
          this.router.navigate(['/home']);
        }, 2000);
      },
      error => {
        console.error('Error during login', error);
        alert('Login failed!');
      }
    );
  }
}

