import { Component, OnInit } from '@angular/core';
import { Router } from '@angular/router';
import { ToastController } from '@ionic/angular';
import { DataService } from 'src/data.service';

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
    private dataService:DataService
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
  cancelOut(){
    this.dataService.applicationCancellation().subscribe({
      next: (data: any) => {
        alert(data.message)
      },
      error: (error) => {
        console.error('Error:', error);
      }
    });
}
}