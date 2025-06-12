import { Injectable } from '@angular/core';
import { HttpClient } from '@angular/common/http';
import { Observable } from 'rxjs';
import { UsageRecords } from './models/usage-records';
import { User } from './models/user';

@Injectable({
  providedIn: 'root',
})
export class DataService {
  private apiUrl = 'http://localhost:3060/api/client';
  constructor(private http: HttpClient) {}
  /*------------------------------下面是停车位管理模块(张博)------------------------------*/
  getParkingSpaces(id: number): Observable<any> {//获取一个或所有车位
    return this.http.get(`${this.apiUrl}/parking-spaces/${id}`);
  }
  /*------------------------------下面是车辆管理模块(刘烨轩)------------------------------*/
  addMyCar(license_plate: string,type: string,userId: number): Observable<any> {//添加新车辆
    const body = { license_plate, type, userId };
    return this.http.post<any>(`${this.apiUrl}/add-vehicle`, body);
  }
  updateCar(id: number,license_plate: string,type: string,userId: number): Observable<any> {//更新车辆
    const body = { id, license_plate, userId, type };
    return this.http.put<any>(`${this.apiUrl}/updateCar`, body);
  }
  getMyCar(myUserID: number): Observable<any> {//获取我所有车辆
    return this.http.get(`${this.apiUrl}/myCar/${myUserID}`);
  }
  deleteCar(id: number): Observable<any> {//删除车辆
    return this.http.delete<any>(`${this.apiUrl}/deleteCar/${id}`);
  }
/*------------------------------下面是使用车辆管理模块(杨佳龙)------------------------------*/
  createUsageRecord(usageRecords: UsageRecords): Observable<any> {//创建新的使用记录
    const body = { usageRecords };
    return this.http.post(`${this.apiUrl}/usage-records`, body);
  }
  updateUsageRecord(charging_complete_time: string | null,end_time: string | null,parking_space_id: number,status: string,endStatus: string): Observable<any> {
    const body = {charging_complete_time,end_time,parking_space_id,status,endStatus,};//修改使用记录
    return this.http.put<any>(`${this.apiUrl}/usage-records/update`, body);
  }
  getUsageMess(CarId: number, status: string): Observable<any> {//获取使用记录
    return this.http.get(`${this.apiUrl}/usage-records/${CarId}/${status}`);
  }
  payBill(userId: number, usageRecordId: number) {//支付订单
    const body = { userId, usageRecordId };
    return this.http.put<any>(`${this.apiUrl}/payBill`, body);
  }
/*------------------------------下面是账户管理模块(苏汇德)------------------------------*/
  rechargeMoney(userId: number, Amount: number): Observable<any> {//充值
    const body = { userId, Amount };
    return this.http.put<any>(`${this.apiUrl}/Recharge`, body);
  }
  getUserInf(userId: number): Observable<any> {//获取个人信息
    return this.http.get<any>(`${this.apiUrl}/user/${userId}`);
  }
  updateUserProfile(user: User) {//更改个人信息
    return this.http.put<any>(`${this.apiUrl}/userProfile/update`, user);
  }
  AllMyOrder(carIds: string[] | number[]): Observable<any> {//获取我所有使用记录
    const body = carIds;
    return this.http.post<any>(`${this.apiUrl}/usage-records/AllMy`, body);
  }
  completeEvaluation(orderId: number,rating: number,comment: string): Observable<any> {//添加评价
    const body = { orderId, rating, comment };
    return this.http.post<any>(`${this.apiUrl}/comment/rating`, body);
  }
  rechargeVIP(days:number,amount:number): Observable<any> {//充值vip
    const body = { days,amount };
    return this.http.put<any>(`${this.apiUrl}/VIP`, body);
  }
  applicationCancellation(): Observable<any>  {//将状态改成待注销
    const body = {};
    return this.http.put<any>(`${this.apiUrl}/for/cancellation`,body);
  }
/*------------------------------下面是评价模块(张博)------------------------------*/
  getComplete(parking_space_id: number): Observable<any> {//获取在车位的评价
    return this.http.get<any>(
      `${this.apiUrl}/getComment/rating/${parking_space_id}`
    );
  }
  getComplete2(user_id: number): Observable<any> {//获取我的评价
    return this.http.get<any>(`${this.apiUrl}/getComment/r/${user_id}`);
  }
}
