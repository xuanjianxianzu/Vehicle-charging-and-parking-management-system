import { Component, OnInit } from '@angular/core';
import { Router } from '@angular/router';
import { ToastController } from '@ionic/angular';

@Component({
  selector: 'app-setup',
  templateUrl: './setup.page.html',
  styleUrls: ['./setup.page.scss'],
  standalone: false,
})
export class SetupPage implements OnInit {

  constructor(
    private router: Router,
    private toastController: ToastController,
  ) { }

  ngOnInit() {
  }


  
  async logout() {
    localStorage.removeItem('myUserID');
    localStorage.removeItem('token');

    const toast = await this.toastController.create({
      message: '已退出登录',
      duration: 2000,
      position: 'top'
    });
    await toast.present();

    this.router.navigate(['/login']);
  }
  

}
