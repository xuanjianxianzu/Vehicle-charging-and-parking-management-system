import { Injectable } from '@angular/core';
import { HttpClient } from '@angular/common/http';
import { Observable } from 'rxjs';
import { ParkingSpace, ParkingSpaceType, UsageRecords, User } from './models';

@Injectable({
  providedIn: 'root',
})
export class DataService {
  private apiUrl = 'http://localhost:3060/api/admin';//api路径

  constructor(private http: HttpClient) {}
  /*------------------------------下面是管理端的用户管理模块(苏汇德)------------------------------*/
  getUsers(): Observable<any> {//获取所有用户
    return this.http.get<any>(`${this.apiUrl}/users`);
  }
  updateUserStatus(userId: number, status: string): Observable<any> {//修改用户状态
    const body = { userId, status };
    return this.http.put(`${this.apiUrl}/users/status`, body);
  }
  getUserDetail(userId: number): Observable<any> {//获取用户使用记录等详细信息
    return this.http.get<any>(`${this.apiUrl}/users/${userId}`);
  }
  deleteUser(id: number): Observable<any> {//删除该用户
    return this.http.delete<any>(`${this.apiUrl}/user/${id}`);
  }
  updateUserDetails(user: User): Observable<any> {//更新用户详细信息
    const body = { user };
    return this.http.put<any>(`${this.apiUrl}/user/details`, body);
  }
  getUserInf(userId: number): Observable<any> {//获取用户信息
    return this.http.get<any>(`${this.apiUrl}/user/${userId}`);
  }
  updateUserProfile(user: User) {//更新用户信息
    return this.http.put<any>(`${this.apiUrl}/userProfile/update`, user);
  }
  /*------------------------------下面是管理端的车位管理模块(刘烨轩)------------------------------*/
  getSpaces(): Observable<any> {//获取车位信息
    return this.http.get<any>(`${this.apiUrl}/parking-spaces`);
  }
  releaseSpace(spaceId: number, status: string): Observable<any> {//释放车位==结束订单
    const body = { spaceId, status };
    return this.http.put<any>(`${this.apiUrl}/release-space`, body);
  }
  updateSpace(id: number, typeId: number): Observable<any> {//更新车位类型
    const body = { id, typeId };
    return this.http.put(`${this.apiUrl}/updatePSpace`, body);
  }
  deleteSpace(space_id: number): Observable<any> {//删除车位
    return this.http.delete<any>(`${this.apiUrl}/deleteSpace/${space_id}`);
  }
  addNewSpace(typeId: number): Observable<any> {//添加新的车位
    const body = { typeId };
    return this.http.post(`${this.apiUrl}/addNewSpace`, body);
  }
  /*------------------------------下面是管理端的车位类型管理模块(张博)------------------------------*/
  getSpaceType(): Observable<any> {//获取车位类型表信息
    return this.http.get<any>(`${this.apiUrl}/parking-spaces-type`);
  }
  updateParkingST(PST: ParkingSpaceType): Observable<any> {//更新车位类型表的信息(各种费率调整)
    const body = { PST };
    return this.http.put(`${this.apiUrl}/spaceType`, body);
  }
  /*------------------------------下面是管理端的使用记录管理模块(杨佳龙)------------------------------*/
  createUsageRecord(usageRecords: UsageRecords): Observable<any> {//插入占位车辆给车位
    const body = { usageRecords };
    return this.http.post(`${this.apiUrl}/usage-records`, body);
  }
  getOrders(): Observable<any> {//获取所有订单
    return this.http.get<any>(`${this.apiUrl}/Order/All`);
  }
  getOrderDetail(id: number): Observable<any> {//获取订单相关详细信息
    return this.http.get<any>(`${this.apiUrl}/Order/detailed/${id}`);
  }
  deleteOrder(id: number): Observable<any> {//删除订单
    return this.http.delete<any>(`${this.apiUrl}/deleteOrder/${id}`);
  }
  /*------------------------------下面是管理端的评价模块(张博)------------------------------*/
  getComplete(): Observable<any> {//获取评价
    return this.http.get<any>(`${this.apiUrl}/getComment/rating`);
  }
  deleteComment(id: number): Observable<any> {//删除评价
    return this.http.delete<any>(`${this.apiUrl}/deleteComment/${id}`);
  }
}
