import { Component } from '@angular/core';
import { AuthService } from '../auth/auth.service';
import { ToastController } from '@ionic/angular';
import { Router } from '@angular/router';

@Component({
  selector: 'app-login',
  templateUrl: './login.page.html',
  styleUrls: ['./login.page.scss'],
  standalone: false,
})
export class LoginPage {
  username: string = '';
  password: string = '';

  constructor(
    private authService: AuthService,
    private toastController: ToastController,
    private router: Router
  ) {}

  async login() {
    try {
      const response = await this.authService.login(this.username, this.password).toPromise();
      if (response.code === 200) {
        localStorage.setItem('token', response.data.token);
        const toast = await this.toastController.create({
          message: '登录成功',
          duration: 2000,
          position: 'top'
        });
        await toast.present();
        this.router.navigate(['/tabs/tab1']); 
      } else {
        const toast = await this.toastController.create({
          message: response.message,
          duration: 2000,
          position: 'top'
        });
        await toast.present();
      }
    } catch (error) {
      const toast = await this.toastController.create({
        message: '登录失败，请重试',
        duration: 2000,
        position: 'top'
      });
      await toast.present();
    }
  }

  navigateToRegister() {
    this.router.navigate(['/register']);
  }
}