import { Component, OnInit } from '@angular/core';
import { ActivatedRoute, Router } from '@angular/router';
import { DataService } from '../../data.service';
import { ParkingSpace } from 'src/models/parking-space';
import { Vehicle } from 'src/models/vehicle';
import { UsageRecords } from 'src/models/usage-records';
@Component({
  selector: 'app-to-use-space',
  templateUrl: './to-use-space.page.html',
  styleUrls: ['./to-use-space.page.scss'],
  standalone: false,
})
export class ToUseSpacePage implements OnInit {
  spaceId!: number;
  space!: ParkingSpace;
  currentVehicles?: Vehicle[]=[];
  isLoading = true;
  hasVehicle = false;
  myUserID = localStorage.getItem('myUserID');
  thisCarID!:number;
  MyCarId:number[]=[];
  MyCarArray: Vehicle[] = [];
  selectedCarId: number | null = null;
  isBookingModalOpen = false;
  isUsageModalOpen = false;
  isUpDateModalOpen = false;
  usageRecords:UsageRecords;
  startTime = new Date().toISOString();
  endTime!: Date;
  duration = 0;
  constructor(
    private route: ActivatedRoute,
    private router: Router,
    private dataService: DataService,
    
  ) {
    this.usageRecords = {
      startTime: new Date().toISOString(), 
      status: 'in_progress',
      vehicleId: 0,
      parkingSpaceId: 0,
      chargingStartTime: null,
      chargingCompleteTime: null,
      endTime: null
    };
  }

  async ngOnInit() {
    this.spaceId = +this.route.snapshot.params['id'];
    await this.loadData();
  }

  updateEndTime() {
    if (!this.startTime) return;
    
    const startDate = new Date(this.startTime);
    this.endTime = new Date(
      startDate.getTime() + (this.duration * 60000)
    );
  }

async loadData() {
  try {
    const myUserID = this.myUserID;
    if (!myUserID) {
      localStorage.removeItem('myUserID');
      this.router.navigate(['/login']);
      return;
    }

    const [spaceRes,  vehiclesRes] = await Promise.all([
      this.dataService.getParkingSpaces(this.spaceId).toPromise(),
      this.dataService.getMyCar(Number(myUserID)).toPromise()
    ]);
    if (!spaceRes?.data?.[0] || !vehiclesRes?.data) {
      throw new Error('Failed to load required data');
    }
    this.space = spaceRes.data[0];
    this.currentVehicles = vehiclesRes.data;
    this.hasVehicle = vehiclesRes.data.length > 0;
    this.MyCarArray = vehiclesRes.data;
    this.MyCarId = this.MyCarArray.map(car => car.id);

  } catch (error) {
    console.error('Error loading data:', error);
    this.router.navigate(['/tabs/tab1']);
  } finally {
    this.isLoading = false;
  }
}
get isMyCar(): boolean {
  if(this.MyCarId.length>0&&this.space.vehicle_id!==null){
  return this.MyCarId.includes(this.space.vehicle_id);
}else{
  return false;
}
}
openBookingModal(){
  if(!this.thisCarID){
    alert('请选择你的车辆');
    return;
  }
  this.isBookingModalOpen=true;
  this.startTime = new Date().toISOString();
  this.duration = 0;
  this.updateEndTime();
}
openUsageModal(){
  this.isUsageModalOpen=!this.isUsageModalOpen;
}

openUpDateModal(){
  this.isUpDateModalOpen=!this.isUsageModalOpen;
}
closeModal(){
  this.isBookingModalOpen=false;
}
closeModalTwo(){
  this.isUsageModalOpen=false;
}
closeModalThree(){
  this.isUpDateModalOpen=false;
}
cancelBook(){

}
async confirmBooking(){
  if (this.duration <= 0) {
    alert('请选择有效时长');
    return;
  }
  try {
    const endTimeISO = this.endTime.toISOString();
    const record: UsageRecords = {
      ...this.usageRecords,
      parkingSpaceId: this.spaceId,
      vehicleId: this.thisCarID,
      startTime: this.startTime,
      endTime: endTimeISO,
      status: 'booked'
    };

    const result = await this.dataService.createUsageRecord(record).toPromise();
    
    if (result.code===201) {
      await this.loadData();
      this.closeModal();
    } else {
      alert(`预订失败: ${result.message}`);
    }
  } catch (error) {
    console.error('Booking failed:', error);
    alert('预订请求发送失败，请检查网络连接');
  }
}


confirmModalTwo(){}
confirmModalThree(){}


getCarID(carId:number){
  this.selectedCarId = this.selectedCarId === carId ? null : carId;
  this.thisCarID=carId;
  console.log(carId);
}

}