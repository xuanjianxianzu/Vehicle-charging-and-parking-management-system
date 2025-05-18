import { Component } from '@angular/core';
import { AuthService } from '../auth/auth.service';
import { Router } from '@angular/router';
import { MatSnackBar } from '@angular/material/snack-bar';

@Component({
  selector: 'app-login',
  templateUrl: './login.component.html',
  styleUrls: ['./login.component.css'],
})
export class LoginComponent {
  username: string = '';
  password: string = '';

  constructor(
    private authService: AuthService,
    private router: Router,
    private snackBar: MatSnackBar
  ) {}

  async login() {
    if (!this.username || !this.password) {
      this.showToast('Please enter the username and password');
      return;
    }

    try {
      const response = await this.authService.login(this.username, this.password).toPromise();
      
      if (response.code === 200) {
        localStorage.setItem('token', response.data.token);
        localStorage.setItem('myUserID', response.data.id);
        this.showToast('Login successful');
        this.router.navigate(['/tabs/tab1']);
      } else {
        this.handleErrorResponse(response.code);
      }
    } catch (error: any) {
      this.handleHttpError(error);
    }
  }

  navigateToRegister() {
    this.router.navigate(['/register']);
  }

  private handleErrorResponse(code: number) {
    switch(code) {
      case 404:
        this.showToast('The username does not exist');
        break;
      case 401:
        this.showToast('The username or password is incorrect');
        break;
      default:
        this.showToast('Login error. Please try again');
    }
  }

  private handleHttpError(error: any) {
    if (error.status === 404) {
      this.showToast('The username does not exist');
    } else if(error.status === 401) {
      this.showToast('The username or password is incorrect');
    } else {
      this.showToast('Network anomaly. Please check the connection');
    }
  }

  private showToast(message: string) {
    this.snackBar.open(message, 'Close', {
      duration: 2000,
      verticalPosition: 'top'
    });
  }
}