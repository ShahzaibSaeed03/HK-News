import { CommonModule } from '@angular/common';
import { Component } from '@angular/core';
import { RouterLink } from '@angular/router';
import { HttpRequestService } from '../service/http-request.service';
import { FormsModule, NgForm } from '@angular/forms';

@Component({
  selector: 'app-register',
  standalone: true,
  imports: [CommonModule, RouterLink, FormsModule],
  templateUrl: './register.component.html',
  styleUrl: './register.component.css'
})
export class RegisterComponent {


  showRegisterSuccess: boolean = false;


  user = {
    username: '',
    email: '',
    password: '',
  };

  constructor(private httpRequestService: HttpRequestService) {}

  // registerUser(form: NgForm) {
  //   if (form.invalid) {
  //     alert('Please fill out all required fields correctly.');
  //     return;
  //   }
  
  //   const requestData = { data: this.user }; // Wrapping user data inside a "data" object
  //   console.log(requestData);
  
  
  //   this.httpRequestService.register(requestData).subscribe(
  //     response => {
  //       console.log('Registration successful', response);
  //       alert('User registered successfully!');
  //     },
  //     error => {
  //       console.error('Error during registration', error);
  //       alert(error.error.message || 'Registration failed!');
  //     }
  //   );
  // }

  registerUser(form: NgForm) {
  if (form.invalid) {
    alert('Please fill out all required fields correctly.');
    return;
  }

  const requestData = this.user;
  console.log('Sending data:', requestData);

  this.httpRequestService.register(requestData).subscribe({
    next: (response) => {
      console.log('Registration successful', response);

      // ✅ Show bottom success message
      this.showRegisterSuccess = true;

      // ✅ Reset form after success
      form.resetForm();

      // ✅ Optional: Auto-hide message after 3 sec
      setTimeout(() => {
        this.showRegisterSuccess = false;
      }, 3000);
    },
    error: (error) => {
      console.error('Error during registration', error);

      if (error.status === 422 && error.error.errors) {
        const messages = Object.entries(error.error.errors)
          .map(([field, messages]) => `${field}: ${(messages as string[]).join(', ')}`)
          .join('\n');
        alert('Validation errors:\n' + messages);
      } else {
        alert(error.error.message || 'Registration failed!');
      }
    }
  });
}

  
  
}
