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
      this.showToast('Please log in first.');
      return;
    }

    if (!amount || amount <= 0) {
      this.showToast('The amount must be greater than 0');
      return;
    }

    try {
      const response = await this.dataService.rechargeMoney(Number(this.myUserID),amount).toPromise();

      if (response.code === 200) {
        this.balance=response.balance;
        console.log(response);
        this.showToast('Recharge successful');
        this.customAmount = null;
      } else {
        this.showToast(response.message || 'Recharge failed');
      }
    } catch (error) {
      console.error('Recharge error:', error);
      this.showToast('Network error. Please try again');
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
