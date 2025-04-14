import { Component, OnInit } from '@angular/core';
import { HttpClient } from '@angular/common/http';
import { Router } from '@angular/router';
import { AlertController, ToastController } from '@ionic/angular';

@Component({
  selector: 'app-tab3',
  templateUrl: './tab3.page.html',
  styleUrls: ['./tab3.page.scss'],
  standalone: false,
})
export class Tab3Page implements OnInit {
  username: string = ''; // 用户名
  avatarUrl: string = ''; // 用户头像
  bills: any[] = []; // 用户账单
  parkingHistory: any[] = []; // 车位历史

  constructor(
    private http: HttpClient,
    private router: Router,
    private alertController: AlertController,
    private toastController: ToastController
  
  ) {}

  ngOnInit() {
    this.loadUserProfile();
    this.loadUserBills();
    this.loadParkingHistory();
  }

  async loadUserProfile() {
    const userId = localStorage.getItem('myUserID');
    if (!userId) {
      console.error('用户未登录');
      return;
    }
  
    try {
      const response: any = await this.http.get(`/api/user-profile/${userId}`).toPromise();
      console.log('用户信息响应:', response); // 添加调试日志
      
      this.username = response.data.username;
      // 修改默认头像路径
      this.avatarUrl = response.data.avatar_url || 'assets/images/default-avatar.png';
      console.log('设置的头像URL:', this.avatarUrl); // 添加调试日志
    } catch (error) {
      console.error('加载用户信息时出错:', error);
      // 设置默认头像
      this.avatarUrl = 'assets/images/default-avatar.png';
    }
  }

  async loadUserBills() {
    const userId = localStorage.getItem('myUserID');
    if (!userId) return;

    try {
      const response: any = await this.http.get(`/api/user-bills/${userId}`).toPromise();
      this.bills = response.data;
    } catch (error) {
      console.error('加载用户账单时出错:', error);
    }
  }

  async loadParkingHistory() {
    const userId = localStorage.getItem('myUserID');
    if (!userId) return;

    try {
      const response: any = await this.http.get(`/api/parking-history/${userId}`).toPromise();
      this.parkingHistory = response.data;
    } catch (error) {
      console.error('加载车位历史时出错:', error);
    }
  }

  async logout() {
    // 清除本地存储的用户信息
    localStorage.removeItem('myUserID');
    localStorage.removeItem('username');
    localStorage.removeItem('token');

    // 显示退出成功提示
    const toast = await this.toastController.create({
      message: '已退出登录',
      duration: 2000,
      position: 'top'
    });
    await toast.present();

    // 跳转到登录页面
    this.router.navigate(['/login']);
  }

  // 显示注销确认对话框
  async showDeleteConfirm() {
    const alert = await this.alertController.create({
      header: '确认注销账号',
      message: '注销账号后，所有数据将被永久删除且无法恢复。确定要继续吗？',
      buttons: [
        {
          text: '取消',
          role: 'cancel'
        },
        {
          text: '确定注销',
          role: 'destructive',
          handler: () => {
            this.deleteAccount();
          }
        }
      ]
    });

    await alert.present();
  }


  async deleteAccount() {
    const userId = localStorage.getItem('myUserID');
    if (!userId) {
        return;
    }

    try {
        // 修改 API 调用路径
        const response: any = await this.http.delete(`/api/logout/${userId}`).toPromise();
        
        if (response.code === 200) {
            // 清除本地存储
            localStorage.clear();
            
            // 显示注销成功提示
            const toast = await this.toastController.create({
                message: '账号已注销',
                duration: 2000,
                position: 'top'
            });
            await toast.present();

            // 跳转到注册页面
            this.router.navigate(['/register']);
        }
    } catch (error) {
        console.error('注销账号失败:', error);
        const toast = await this.toastController.create({
            message: '注销账号失败，请稍后重试',
            duration: 2000,
            position: 'top'
        });
        await toast.present();
    }
}

}
