import { Injectable } from '@angular/core';
import { HttpClient } from '@angular/common/http';
import { Observable } from 'rxjs';

interface ParkingSpace {
  id: number;
  type: string;
  status: string;
  vehicleId?: number;
  licensePlate?: string;
  userName?: string;
  bookingStatus?: string;
}

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
  getSpaces(): Observable<ParkingSpace[]> {
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
}