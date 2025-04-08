import { Component, OnInit } from '@angular/core';
import { Router } from '@angular/router';
import { ToastController } from '@ionic/angular';
import { DataService } from 'src/data.service';
import { Vehicle } from 'src/models/vehicle';
@Component({
  selector: 'app-update-car',
  templateUrl: './update-car.page.html',
  styleUrls: ['./update-car.page.scss'],
  standalone: false,
})
export class UpdateCarPage implements OnInit {
  licensePlateLeft:string='';
  licensePlateRight:string='';
  vehicleType:string='';
  vehicle!: Vehicle;

  constructor(
    private router: Router,
    private toastController: ToastController,
    private dataService: DataService
  ) { }

  ngOnInit(): void  {
    this.vehicle = this.router.getCurrentNavigation()?.extras.state?.['vehicle'];
    if (this.vehicle) {
      const [leftPart, rightPart] = this.vehicle.license_plate.split('·');
      this.licensePlateLeft = leftPart || '';
      this.licensePlateRight = rightPart || '';
      this.vehicleType = this.vehicle.type;
    }
  }
  async updateCar(){

    console.log(this.vehicle);
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
      console.log(this.vehicle.id,licensePlate, this.vehicleType, this.vehicle.user_id);
      const response = await this.dataService.updateCar(this.vehicle.id,licensePlate, this.vehicleType, this.vehicle.user_id).toPromise();
      switch (response.code) {
        case 200:
          await this.showToast('车辆更新成功');
          this.router.navigate(['/tabs/tab2']);
          break;
        case 400:
          this.showToast('该用户已存在此车牌号的车辆');
          break;
        default:
          await this.showToast(`更新车辆失败，错误码: ${response.code}`);
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


  toDeleteCar(){

    this.dataService.deleteCar(this.vehicle.id).subscribe({
      next: () => {
        console.log('车辆删除成功');
        this.router.navigate(['/tabs/tab2']);
      },
      error: (error) => {
        console.error('删除车辆时出错:', error);
      }
    });

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
