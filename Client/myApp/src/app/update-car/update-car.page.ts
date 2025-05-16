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
if (!this.licensePlateLeft || !this.licensePlateRight || !this.vehicleType) {
  await this.showToast('Please fill in all fields');
  return;
}
const licensePlateLeftRegex = /^[\u4e00-\u9fa5][A-Z]/;
const licensePlateRightRegex = /^[A-Z0-9]{5}$/;
if (!licensePlateLeftRegex.test(this.licensePlateLeft) || !licensePlateRightRegex.test(this.licensePlateRight)) {
  await this.showToast('Please enter the license plate in the correct format');
  return;
}
const licensePlate = `${this.licensePlateLeft}·${this.licensePlateRight}`;
try {
  console.log(this.vehicle.id, licensePlate, this.vehicleType, this.vehicle.user_id);
  const response = await this.dataService.updateCar(this.vehicle.id, licensePlate, this.vehicleType, this.vehicle.user_id).toPromise();
  switch (response.code) {
    case 200:
      await this.showToast('Vehicle updated successfully');
      this.router.navigate(['/tabs/tab2']);
      break;
    case 400:
      this.showToast('This user already has a vehicle with this license plate');
      break;
    default:
      await this.showToast(`Failed to update vehicle, error code: ${response.code}`);
      break;
  }
} catch (error: any) {
  if (error.status === 400) {
    this.showToast('This user already has a vehicle with this license plate');
  } else {
    this.showToast('Network error, please check your connection');
  }
}
}

toDeleteCar() {
  this.dataService.deleteCar(this.vehicle.id).subscribe({
    next: () => {
      console.log('Vehicle deleted successfully');
      this.router.navigate(['/tabs/tab2']);
    },
    error: (error) => {
      console.error('Error deleting vehicle:', error);
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