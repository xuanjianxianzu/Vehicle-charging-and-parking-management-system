import { Injectable } from '@angular/core';
import { HttpClient, HttpHeaders } from '@angular/common/http';
import { Observable } from 'rxjs';
import { Vehicle } from './models/vehicle';
import { User } from 'src/models/user';
import { ParkingSpace } from 'src/models/parking-space';
import { N } from '@angular/core/navigation_types.d-u4EOrrdZ';

@Injectable({
  providedIn: 'root'
})
export class DataService {
  private apiUrl = 'http://localhost:3060/api';

  constructor(private http: HttpClient) { }

  getParkingSpaces(): Observable<any> {
   /* const token = localStorage.getItem('token');
    console.log(token);

    const headers = new HttpHeaders({
      'Authorization': `Bearer ${token}`,
    });
 console.log(headers);*/
    return this.http.get(`${this.apiUrl}/parking-spaces`);
  }
  getParkingSpace(id: number): Observable<{ data: ParkingSpace }> {
    return this.http.get<{ data: ParkingSpace }>(`${this.apiUrl}/parking-spaces/${id}`);
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
  getUser(userId: string) {
    return this.http.get<{ data: User }>(`/api/users/${userId}`);
  }
  
  // data.service.ts
getUserVehicles(userId: string): Observable<{ data: Vehicle[] }> {
  const numericUserId = Number(userId);
  return this.http.get<{ data: Vehicle[] }>(
    `${this.apiUrl}/vehicles?user_id=${numericUserId}`
  );
}
  
createBooking(data: any) {
  return this.http.post(`${this.apiUrl}/bookings`, data); // 添加 apiUrl 前缀
}

createUsageRecord(data: any) {
  return this.http.post(`${this.apiUrl}/usage-records`, data); // 添加 apiUrl 前缀
}
  
  updateParkingSpace(id: number, data: any) {
    return this.http.patch(`/api/parking-spaces/${id}`, data);
  }
  
  
}
