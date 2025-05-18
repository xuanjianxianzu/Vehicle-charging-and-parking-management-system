import { Injectable } from '@angular/core';
import { HttpClient } from '@angular/common/http';
import { Observable } from 'rxjs';
import { UsageRecords } from './models/usage-records';
import { User } from './models/user';

@Injectable({
  providedIn: 'root'
})
export class DataService {
  private apiUrl = 'http://localhost:3060/api/client';
  constructor(private http: HttpClient) { 
  }
getParkingSpaces(id: number): Observable<any> {
  return this.http.get(`${this.apiUrl}/parking-spaces/${id}`);
}

getMyCar(myUserID:number): Observable<any> {
  return this.http.get(`${this.apiUrl}/myCar/${myUserID}`);
}


addMyCar(license_plate: string,type: string,userId:number): Observable<any> {
  const body = { license_plate, type ,userId};
  return this.http.post<any>(`${this.apiUrl}/add-vehicle`, body);
}

updateCar(id:number,license_plate: string,type: string,userId:number): Observable<any> {
  const body = { id,license_plate, userId, type };
  return this.http.put<any>(`${this.apiUrl}/updateCar`, body);
}

deleteCar(id:number): Observable<any> {
  console.log('de',id);
  return this.http.delete<any>(`${this.apiUrl}/deleteCar/${id}`);
}

createUsageRecord(usageRecords:UsageRecords): Observable<any>  {
  const body = {usageRecords};
  return this.http.post(`${this.apiUrl}/usage-records`, body);
}

updateUsageRecord(charging_complete_time:string|null,end_time:string|null,parking_space_id:number,status:string,endStatus:string): Observable<any> {
  const body = { charging_complete_time,end_time, parking_space_id, status ,endStatus};
  return this.http.put<any>(`${this.apiUrl}/usage-records/update`, body);
}

getUsageMess(CarId:number,status:string): Observable<any> {
  return this.http.get(`${this.apiUrl}/usage-records/${CarId}/${status}`);
}

payBill(userId:number,usageRecordId:number){
  const body = { userId,usageRecordId};
  return this.http.put<any>(`${this.apiUrl}/payBill`, body);
}

getUserInf(userId:number): Observable<any> {
  return this.http.get<any>(`${this.apiUrl}/user/${userId}`);
}
rechargeMoney(userId:number,Amount:number): Observable<any> {
  const body = { userId,Amount};
  return this.http.put<any>(`${this.apiUrl}/Recharge`, body);
}

updateUserProfile(user:User){
  return this.http.put<any>(`${this.apiUrl}/userProfile/update`, user);
}

AllMyOrder(carIds: string[] | number[]): Observable<any> {
  const body = carIds;
  return this.http.post<any>(`${this.apiUrl}/usage-records/AllMy`,body);
}

completeEvaluation(orderId:number, rating:number, comment:string): Observable<any> {
  const body = {orderId,rating,comment};
  return this.http.post<any>(`${this.apiUrl}/comment/rating`,body);
}

getComplete(parking_space_id:number): Observable<any> {
  return this.http.get<any>(`${this.apiUrl}/getComment/rating/${parking_space_id}`);
}

getComplete2(user_id:number): Observable<any> {
  return this.http.get<any>(`${this.apiUrl}/getComment/r/${user_id}`);
}


}
