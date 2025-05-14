import { Injectable } from '@angular/core';
import { HttpClient } from '@angular/common/http';
import { Observable } from 'rxjs';
import { ParkingSpace } from './models';

interface SpaceDetail {
  space: any;
  history: any[];
}

@Injectable({
  providedIn: 'root'
})
export class DataService {
  private apiUrl = 'http://localhost:3060/api/admin';

  constructor(private http: HttpClient) {}

  // 获取所有车位
  getSpaces(): Observable<any> {
    return this.http.get<ParkingSpace[]>(`${this.apiUrl}/parking-spaces`);
  }

  // 更新车位信息
  updateSpace(id: number, data: any): Observable<any> {
    return this.http.put(`${this.apiUrl}/${id}`, data);
  }

  // 获取车位详情
  getSpaceDetails(id: number): Observable<SpaceDetail> {
    return this.http.get<SpaceDetail>(`${this.apiUrl}/${id}/details`);
  }

  // 获取所有用户
  getUsers(): Observable<any> {
    return this.http.get<any>(`${this.apiUrl}/users`);
  }
 
  // 获取用户详情（包含关联数据）
  getUserDetail(userId: number): Observable<ParkingSpace> {
    return this.http.get<ParkingSpace>(`${this.apiUrl}/users/${userId}`);
  }
 
  // 更新用户信息
  updateUser(userId: number, data: any): Observable<any> {
    return this.http.put(`${this.apiUrl}/users/${userId}`, data);
  }
 
  // 更新关联车辆信息
  updateVehicle(vehicleId: number, data: any): Observable<any> {
    return this.http.put(`${this.apiUrl}/vehicles/${vehicleId}`, data);
  }
 
  // 更新使用记录
  updateUsageRecord(recordId: number, data: any): Observable<any> {
    return this.http.put(`${this.apiUrl}/usage-records/${recordId}`, data);
  }
 
  // 更新预约信息
  updateBooking(bookingId: number, data: any): Observable<any> {
    return this.http.put(`${this.apiUrl}/bookings/${bookingId}`, data);
  }
}
