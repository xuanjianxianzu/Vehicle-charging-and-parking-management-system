import { Component, OnInit } from '@angular/core';
import { Router } from '@angular/router';
import { ToastController } from '@ionic/angular';
import { DataService } from 'src/data.service';

@Component({
  selector: 'app-add-car',
  templateUrl: './add-car.page.html',
  styleUrls: ['./add-car.page.scss'],
  standalone: false,
})
export class AddCarPage implements OnInit {
  licensePlateLeft:string='';
  licensePlateRight:string='';
  vehicleType:string='';
  myUserID = localStorage.getItem('myUserID');

  constructor(
    private toastController: ToastController,
    private dataService: DataService,
    private router: Router
  ) { }

  ngOnInit() {
  }

  ionViewWillEnter() {
    this.clearForm();
  }

  async addCar(){
    if(!this.licensePlateLeft||!this.licensePlateRight||!this.vehicleType){
      await this.showToast('请填写所有字段');
      return;
    }
    const licensePlateLeftRegex = /^[\u4e00-\u9fa5][A-Z]/;
    const licensePlateRightRegex = /^[A-Z0-9]{5}$/;
    if (!licensePlateLeftRegex.test(this.licensePlateLeft)||!licensePlateRightRegex.test(this.licensePlateRight)) {
      await this.showToast('请按正确格式填写车牌号');
      return;
    }
    const licensePlate = `${this.licensePlateLeft}·${this.licensePlateRight}`;
    try {
      const response = await this.dataService.addMyCar(licensePlate, this.vehicleType, Number(this.myUserID)).toPromise();
      switch (response.code) {
        case 201:
          await this.showToast('车辆添加成功');
          this.router.navigate(['/tabs/tab2']);
          break;
        case 400:
          this.showToast('该用户已存在此车牌号的车辆');
          break;
        default:
          await this.showToast(`添加车辆失败，错误码: ${response.code}`);
          break;
      }
      
    } catch (error:any) {
      if (error.status === 400) {
        this.showToast('该用户已存在此车牌号的车辆');
      } else {
        this.showToast('网络异常，请检查连接');
      }
    }

  }

  private clearForm() {
    this.licensePlateLeft = '';
    this.licensePlateRight = '';
    this.vehicleType = '';
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
