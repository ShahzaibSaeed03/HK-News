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

  constructor(private httpRequestService: HttpRequestService, private router: Router) {}

  loginUser(form: NgForm) {
    if (form.invalid) {
      return;
    }
  
    this.httpRequestService.login(this.user).subscribe(
      (response: any) => {
        console.log('Login successful', response);
        alert('Login successful!');
  
        // Store token in localStorage
        localStorage.setItem('authToken', response.token);
  
        // Store user ID in localStorage
        localStorage.setItem('userId', response.user.id.toString());
        localStorage.setItem('user_username', response.user.username);
        localStorage.setItem('user_email', response.user.email);


  
        // Navigate to the home page after login
        this.router.navigate(['/home']);
      },
      error => {
        console.error('Error during login', error);
        alert('Login failed!');
      }
    );
  }
  
}
