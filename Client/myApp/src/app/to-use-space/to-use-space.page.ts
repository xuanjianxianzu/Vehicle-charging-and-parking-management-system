import { Component, OnInit } from '@angular/core';
import { ActivatedRoute, Router } from '@angular/router';
import { AlertController } from '@ionic/angular';
import { DataService } from '../../data.service';
import { ParkingSpace } from 'src/models/parking-space';
import { Vehicle } from 'src/models/vehicle';
import { User } from 'src/models/user';

@Component({
  selector: 'app-to-use-space',
  templateUrl: './to-use-space.page.html',
  styleUrls: ['./to-use-space.page.scss'],
  standalone: false,
})
export class ToUseSpacePage implements OnInit {
  spaceId!: number;
  space!: ParkingSpace;
  currentUser!: User;
  currentVehicle?: Vehicle;
  isLoading = true;
  hasVehicle = false;
  showNoVehicleAlert = false;
  myUserID = localStorage.getItem('myUserID');

  constructor(
    private route: ActivatedRoute,
    private router: Router,
    private dataService: DataService,
    private alertCtrl: AlertController
  ) {}

  async ngOnInit() {
    this.spaceId = +this.route.snapshot.params['id'];
    await this.loadData();
  }

  // to-use-space.page.ts
async loadData() {
  try {
    const myUserID = this.myUserID;
    if (!myUserID) {
      this.router.navigate(['/login']);
      return;
    }

    const [spaceRes, userRes, vehiclesRes] = await Promise.all([
      this.dataService.getParkingSpace(this.spaceId).toPromise(),
      this.dataService.getUser(myUserID).toPromise(),
      this.dataService.getUserVehicles(myUserID).toPromise()
    ]);

    // 添加空值检查
    if (!spaceRes || !userRes || !vehiclesRes) {
      throw new Error('Failed to load required data');
    }

    this.currentUser = userRes.data;
    this.currentVehicle = vehiclesRes.data[0];
    this.hasVehicle = vehiclesRes.data.length > 0;

  } catch (error) {
    console.error('Error loading data:', error);
    this.showErrorAlert('Failed to load data');
    this.router.navigate(['/tab1']); // 导航回列表页
  } finally {
    this.isLoading = false;
  }
}

  getTypeLabel(type: string): string {
    const typeMap: { [key: string]: string } = {
      1: 'Fast Charging',
      2: 'Slow Charging',
      3: 'Normal'
    };
    return typeMap[type] || 'Unknown';
  }

  async handleBooking() {
    if (!this.hasVehicle) {
      this.showNoVehicleAlert = true;
      return;
    }

    const alert = await this.alertCtrl.create({
      header: 'Confirm Booking',
      message: `Confirm booking for space ${this.spaceId}?`,
      buttons: [
        {
          text: 'Cancel',
          role: 'cancel'
        },
        {
          text: 'Confirm',
          handler: () => this.createBooking()
        }
      ]
    });

    await alert.present();
  }

  async createBooking() {
    try {
      // 创建预约记录
      const bookingRes = await this.dataService.createBooking({
        user_id: this.currentUser.id,
        space_id: this.spaceId,
        vehicle_id: this.currentVehicle!.id,
        start_time: new Date().toISOString(),
        status: 'pending'
      }).toPromise();

      // 更新车位状态
      await this.dataService.updateParkingSpace(this.spaceId, {
        status: 'be_booked',
        vehicles_id: this.currentVehicle!.id
      }).toPromise();

      // 创建费用记录
      await this.dataService.createUsageRecord({
        user_id: this.currentUser.id,
        space_id: this.spaceId,
        amount: this.space.parking_rate,
        duration: 1, // 默认1小时
        status: 'unpaid'
      }).toPromise();

      this.showSuccessAlert();
      this.router.navigate(['/tab1']);

    } catch (error) {
      console.error('Booking failed:', error);
      this.showErrorAlert('Booking failed');
    }
  }

  private async showSuccessAlert() {
    const alert = await this.alertCtrl.create({
      header: 'Success',
      message: 'Booking created successfully',
      buttons: ['OK']
    });
    await alert.present();
  }

  private async showErrorAlert(message: string) {
    const alert = await this.alertCtrl.create({
      header: 'Error',
      message,
      buttons: ['OK']
    });
    await alert.present();
  }
}