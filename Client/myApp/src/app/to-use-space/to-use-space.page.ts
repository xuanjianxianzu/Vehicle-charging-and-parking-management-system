import { Component, OnInit } from '@angular/core';
import { ActivatedRoute, Router } from '@angular/router';
import { DataService } from '../../data.service';
import { ParkingSpace } from 'src/models/parking-space';
import { Vehicle } from 'src/models/vehicle';
import { UsageRecords } from 'src/models/usage-records';
import { DateTime } from 'luxon';
@Component({
  selector: 'app-to-use-space',
  templateUrl: './to-use-space.page.html',
  styleUrls: ['./to-use-space.page.scss'],
  standalone: false,
})
export class ToUseSpacePage implements OnInit {
  spaceId!: number;
  space!: ParkingSpace;
  isLoading = true;
  hasVehicle = false;
  myUserID = localStorage.getItem('myUserID');
  thisCarID:number=0;
  MyCarId:number[]=[];
  MyCarArray: Vehicle[] = [];
  selectedCarId: number | null = null;
  isBookingModalOpen = false;
  isUsageModalOpen = false;
  isUpDateModalOpen = false;
  usageRecords:UsageRecords;
  startTime:string = DateTime.now().setZone('Asia/Shanghai').toISO()!;
  endTime: string|null=null;
  duration = 0;
  currentTime!: string;
  usageStartTime!: string;
  orderStartTime!:string;
  orderChargingStart!:string;
  chargingCompleteTime: string | null = null;
  minChargingCompleteTime: string = DateTime.now().toISO()!;
  maxChargingCompleteTime: string = DateTime.now().toISO()!;
  orderID:number=0;
minEndTime: string = DateTime.now().toISO()!;

  constructor(
    private route: ActivatedRoute,
    private router: Router,
    private dataService: DataService,
    
  ) {
    this.usageRecords = {
      startTime: DateTime.now().setZone('Asia/Shanghai').toISO()!,
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
    if (!this.startTime || this.duration <= 0) {
      this.endTime = null;
      return;
    }
  
    try {
      const start = DateTime.fromISO(this.startTime, { zone: 'Asia/Shanghai' });
      const end = start.plus({ minutes: this.duration });
      
      this.endTime = end.toISO();
    } catch (error) {
      console.error('时间计算错误:', error);
      this.endTime = null;
    }
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
    console.log(spaceRes);
    this.space = spaceRes.data[0];
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
get isMyCar() {
  return !!this.space?.vehicle_id && this.MyCarId.includes(this.space.vehicle_id);
}
openBookingModal(){
  if(!this.thisCarID){
    alert('请选择你的车辆');
    return;
  }
  this.isBookingModalOpen=true;
  this.startTime = DateTime.now().setZone('Asia/Shanghai').toISO()!;
  this.duration = 0;
  this.updateEndTime();
}
openUsageModal(){
  if(!this.thisCarID){
    alert('请选择你的车辆');
    return;
  }
  const now = DateTime.now().setZone('Asia/Shanghai');
  this.currentTime = now.toISO()!;
  this.usageStartTime = now.toISO()!;
  this.isUsageModalOpen=!this.isUsageModalOpen;
}

openUpDateModal(){
  this.isUpDateModalOpen=!this.isUsageModalOpen;

}
closeModal(){
  this.isBookingModalOpen=false;
  this.isUsageModalOpen=false;
  this.isUpDateModalOpen=false;
}


async cancelBook() {
  try {
    const result = await this.dataService.updateUsageRecord(
      null,
      DateTime.now().setZone('Asia/Shanghai').toISO()!,
      this.space.id,
      this.space.status,
      'cancelled'
    ).toPromise();
    if (result.code === 200) {
      this.space.status = 'idle';
    } else {
      alert('取消失败');
    }
    await this.loadData();
  } catch (error) {
    console.error('取消预约失败:', error);
    alert('取消预约请求发送失败，请检查网络连接');
  }
}


async confirmBooking(){
  if (this.duration <= 0) {
    alert('请选择有效时长');
    return;
  }
  try {
    const record: UsageRecords = {
      ...this.usageRecords,
      parkingSpaceId: this.spaceId,
      vehicleId: this.thisCarID,
      startTime: this.startTime,
      endTime: this.endTime,
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


async confirmModalTwo(){

  try {
    const record: UsageRecords = {
      ...this.usageRecords,
      chargingStartTime: this.usageStartTime,
      parkingSpaceId: this.spaceId,
      vehicleId: this.thisCarID,
      startTime: this.startTime,
      status: 'in_progress'
    };

    const result = await this.dataService.createUsageRecord(record).toPromise();
    
    if (result.code===201) {
      await this.loadData();
      this.closeModal();
    } else {
      alert(`使用失败: ${result.message}`);
    }
  } catch (error) {
    console.error('failed:', error);
    alert('请检查网络连接');
  }


}



async confirmModalThree(){
  try {
    if (!this.endTime) {
      alert('请选择结束时间');
      return;
    }

    const endTime = DateTime.fromISO(this.endTime);
    const chargingComplete = DateTime.fromISO(this.chargingCompleteTime!);

    if (endTime < chargingComplete) {
      alert('结束时间不能早于充电完成时间');
      return;
    }

    await this.dataService.updateUsageRecord(
      this.chargingCompleteTime,
      this.endTime,
      this.space.id,
      'in_progress',
      'to_be_paid',
    ).toPromise();

    await this.loadData();
    this.closeModal();
  } catch (error) {
    console.error('结束使用失败:', error);
    alert('请求发送失败，请检查网络连接');
  }
}

getCarID(carId:number){
  this.selectedCarId = this.selectedCarId === carId ? null : carId;
  this.thisCarID=carId;
  console.log(carId);
}

async getBookMess(){
  if(this.space.vehicle_id){
  this.thisCarID=this.space.vehicle_id;
try {
  await this.dataService.updateUsageRecord(
    null,
    DateTime.now().setZone('Asia/Shanghai').toISO()!,
    this.space.id,
    this.space.status,
    'end_booked'
  ).toPromise();

  this.space.status = 'idle';
  this.openUsageModal();
  await this.loadData();
} catch (error) {
  console.error('失败:', error);
  alert('请检查网络连接');
}
}
}

async toCloseOrder() {
  this.dataService.getUsageMess(this.space.vehicle_id!, 'in_progress').subscribe(
    (data: any) => {
      const chargingStart = DateTime.fromISO(data.data[0].charging_start_time, { zone: 'Asia/Shanghai' });
      
      this.orderStartTime = DateTime.fromISO(data.data[0].start_time, { zone: 'Asia/Shanghai' }).toISO()!;
      this.orderChargingStart = chargingStart.toISO()!;
      this.orderID=data.data[0].id;
      this.minChargingCompleteTime = chargingStart.toISO()!;
      this.maxChargingCompleteTime = DateTime.now().setZone('Asia/Shanghai').toISO()!;
      
      this.openUpDateModal();
    }
  );
}




updateEndTimeLimits() {
  if (this.chargingCompleteTime) {
    this.minEndTime = this.chargingCompleteTime;
    if (this.endTime && DateTime.fromISO(this.endTime) < DateTime.fromISO(this.minEndTime)) {
      this.endTime = null;
    }
  }
}

}