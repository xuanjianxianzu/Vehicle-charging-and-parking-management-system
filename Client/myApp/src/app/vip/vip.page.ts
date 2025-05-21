import { Component, OnInit } from '@angular/core';
import { Router } from '@angular/router';
import { AlertController } from '@ionic/angular';
import { DataService } from 'src/data.service';
@Component({
  selector: 'app-vip',
  templateUrl: './vip.page.html',
  styleUrls: ['./vip.page.scss'],
  standalone: false,
})
export class VIPPage implements OnInit {

    vipPlans = [
    { days: 7, amount: 6, title: '7天体验卡', description: '¥6 畅享基础权益' },
    { days: 30, amount: 22, title: '月度VIP', description: '¥22 尊享全部特权' },
    { days: 365, amount: 188, title: '年度VIP', description: '¥188 全年尊贵体验' }
  ];
  constructor(
    private router: Router,
    private dataService: DataService,
    private alertCtrl: AlertController
  ) {}

  ngOnInit() {
  }
rechargeVIP(days: number, amount: number) {

       this.dataService.rechargeVIP(days, amount).subscribe({
    next: (data) => {
      console.log('successfully');
      console.log(data.data)
      this.router.navigate(['/tabs/tab4']);
    },
    error: (error) => {
      console.error('Error deleting vehicle:', error);
    }
  });

  
}
  private async showAlert(header: string, message: string) {
    const alert = await this.alertCtrl.create({
      header,
      message,
      buttons: ['确定']
    });
    await alert.present();
  }
}
