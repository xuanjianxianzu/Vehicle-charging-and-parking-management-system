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
      console.log(response.data.id);
      switch(response.code) {
        case 200:
          localStorage.setItem('token', response.data.token);
          localStorage.setItem('myUserID', response.data.id);
          this.showToast('登陆成功');
          this.router.navigate(['/tabs/tab1']);
          break;
        case 404:
          this.showToast('用户名不存在');
          break;
        case 401:
          this.showToast('用户名或密码错误');
          break;
        default:
          this.showToast(response.message || '登陆错误');
      }

    } catch (error:any) {
      this.showToast('登陆失败');

      if (error.status === 404) {
        this.showToast('用户名不存在');
      }else if(error.status === 401){
        this.showToast('用户名或密码错误');
      }else {
        this.showToast('网络异常，请检查连接');
      }
    }
  }

  navigateToRegister() {
    this.router.navigate(['/register']);
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