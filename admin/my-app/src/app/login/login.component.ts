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
      this.showToast('请输入用户名和密码');
      return;
    }

    try {
      const response = await this.authService.login(this.username, this.password).toPromise();
      
      if (response.code === 200) {
        localStorage.setItem('token', response.data.token);
        localStorage.setItem('myUserID', response.data.id);
        this.showToast('登录成功');
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
        this.showToast('用户名不存在');
        break;
      case 401:
        this.showToast('用户名或密码错误');
        break;
      default:
        this.showToast('登录错误，请重试');
    }
  }

  private handleHttpError(error: any) {
    if (error.status === 404) {
      this.showToast('用户名不存在');
    } else if(error.status === 401) {
      this.showToast('用户名或密码错误');
    } else {
      this.showToast('网络异常，请检查连接');
    }
  }

  private showToast(message: string) {
    this.snackBar.open(message, '关闭', {
      duration: 2000,
      verticalPosition: 'top'
    });
  }
}