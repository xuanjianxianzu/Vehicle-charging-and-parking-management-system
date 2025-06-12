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
  role:string='';
  constructor(
    private authService: AuthService,
    private toastController: ToastController,
    private router: Router
  ) {}

  async register() {


    if (!this.username || !this.password || !this.confirmPassword||!this.role) {
      await this.showToast('请填写所有字段');
      return;
    }

    if (this.password !== this.confirmPassword) {
      await this.showToast('两次输入的密码不一致');
      return;
    }

    const usernameRegex = /^\d{10,15}$/;
    const passwordRegex = /^[a-zA-Z0-9]{8,16}$/;

    if (!usernameRegex.test(this.username)) {
      await this.showToast('账号必须为10 - 15位数字');
      return;
    }

    if (!passwordRegex.test(this.password)) {
      await this.showToast('密码必须为8 - 16位数字或字母');
      return;
    }

    try {
      const response = await this.authService.register(this.role,this.username, this.password).toPromise();
      switch(response.code) {
        case 201:
          this.showToast('注册成功');
          this.router.navigate(['/user']);
          break;
        case 409:
          this.showToast('用户名已存在');
          break;
        default:
          this.showToast(response.message || '注册失败');
      }
      
    } catch (error:any) {
      if (error.status === 409) {
        this.showToast('用户名已存在');
      } else {
        this.showToast('网络异常，请检查连接');
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