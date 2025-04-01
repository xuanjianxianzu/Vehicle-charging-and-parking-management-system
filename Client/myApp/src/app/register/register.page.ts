import { Component } from '@angular/core';
import { AuthService } from '../auth/auth.service';
import { ToastController } from '@ionic/angular';

@Component({
  selector: 'app-register',
  templateUrl: './register.page.html',
  styleUrls: ['./register.page.scss'],
  standalone: false,
})
export class RegisterPage {
  username: string = '';
  password: string = '';

  constructor(
    private authService: AuthService,
    private toastController: ToastController
  ) {}

  async register() {

    const usernameRegex = /^\d{10,15}$/;
    const passwordRegex = /^[a-zA-Z0-9]{8,16}$/;

    if (!usernameRegex.test(this.username)) {
      const toast = await this.toastController.create({
        message: '账号必须为10 - 15位数字',
        duration: 2000,
        position: 'top'
      });
      await toast.present();
      return;
    }

    if (!passwordRegex.test(this.password)) {
      const toast = await this.toastController.create({
        message: '密码必须为8 - 16位数字或字母',
        duration: 2000,
        position: 'top'
      });
      await toast.present();
      return;
    }

    try {
      const response = await this.authService.register(this.username, this.password).toPromise();
      if (response.code === 201) {
        const toast = await this.toastController.create({
          message: '注册成功',
          duration: 2000,
          position: 'top'
        });
        await toast.present();
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
        message: '注册失败，请重试',
        duration: 2000,
        position: 'top'
      });
      await toast.present();
    }
  }
}