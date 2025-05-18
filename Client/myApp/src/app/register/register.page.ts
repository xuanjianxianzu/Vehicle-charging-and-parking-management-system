import { Component } from '@angular/core';
import { AuthService } from '../auth/auth.service';
import { ToastController } from '@ionic/angular';
import { Router } from '@angular/router';

@Component({
  selector: 'app-register',
  templateUrl: './register.page.html',
  styleUrls: ['./register.page.scss'],
  standalone: false,
})
export class RegisterPage {
  username: string = '';
  password: string = '';
  confirmPassword: string = '';

  constructor(
    private authService: AuthService,
    private toastController: ToastController,
    private router: Router
  ) {}

  async register() {


    if (!this.username || !this.password || !this.confirmPassword) {
      await this.showToast('Please fill in all fields');
      return;
    }

    if (this.password !== this.confirmPassword) {
      await this.showToast('The passwords entered twice are inconsistent');
      return;
    }

    const usernameRegex = /^\d{10,15}$/;
    const passwordRegex = /^[a-zA-Z0-9]{8,16}$/;

    if (!usernameRegex.test(this.username)) {
      await this.showToast('The account number must be 10 to 15 digits');
      return;
    }

    if (!passwordRegex.test(this.password)) {
      await this.showToast('The password must be 8 to 16 digits or letters');
      return;
    }

    try {
      const response = await this.authService.register(this.username, this.password).toPromise();
      switch(response.code) {
        case 201:
          this.showToast('Registration successful');
          this.router.navigate(['/login']);
          break;
        case 409:
          this.showToast('The username already exists');
          break;
        default:
          this.showToast(response.message || 'Registration failed');
      }
      
    } catch (error:any) {
      if (error.status === 409) {
        this.showToast('The username already exists');
      } else {
        this.showToast('Network anomaly. Please check the connection');
      }
    
    }
  }



  private async showToast(message: string) {
    const toast = await this.toastController.create({
      message,
      duration: 2000,
      position: 'top'
    });
    await toast.present();
  }

}