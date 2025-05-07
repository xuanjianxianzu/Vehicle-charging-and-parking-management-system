import { Component, OnInit } from '@angular/core';
import { Router } from '@angular/router';
import { DataService } from 'src/data.service';
import { ToastController } from '@ionic/angular';

@Component({
  selector: 'app-wallet',
  templateUrl: './wallet.page.html',
  styleUrls: ['./wallet.page.scss'],
  standalone: false,
})
export class WalletPage implements OnInit {
  balance: number = 0;
  myUserID = localStorage.getItem('myUserID');
  customAmount: number | null = null;
  
  constructor(
    private router: Router,
    private dataService: DataService,
    private toastCtrl: ToastController
  ) { }

  ngOnInit() {
    const navigation = this.router.getCurrentNavigation();
    if (navigation?.extras?.state) {
      this.balance = navigation.extras.state['balance'];
    }
  
  }



  async recharge(amount: number) {
    if (!this.myUserID) {
      this.showToast('请先登录');
      return;
    }

    if (!amount || amount <= 0) {
      this.showToast('金额必须大于0');
      return;
    }

    try {
      const response = await this.dataService.rechargeMoney(Number(this.myUserID),amount).toPromise();

      if (response.code === 200) {
        this.balance=response.balance;
        console.log(response);
        this.showToast('充值成功');
        this.customAmount = null;
      } else {
        this.showToast(response.message || '充值失败');
      }
    } catch (error) {
      console.error('充值错误:', error);
      this.showToast('网络错误，请重试');
    }
  }

  private async showToast(message: string) {
    const toast = await this.toastCtrl.create({
      message,
      duration: 2000,
      position: 'top'
    });
    await toast.present();
  }

  

}
