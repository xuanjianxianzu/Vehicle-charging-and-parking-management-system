import { Injectable } from '@angular/core';
import { HttpClient } from '@angular/common/http';
import { Observable } from 'rxjs';
import { ParkingSpace, ParkingSpaceType, UsageRecords } from './models';

@Injectable({
  providedIn: 'root'
})
export class DataService {
  private apiUrl = 'http://localhost:3060/api/admin';

  constructor(private http: HttpClient) {}


  getSpaces(): Observable<any> {
    return this.http.get<ParkingSpace[]>(`${this.apiUrl}/parking-spaces`);
  }
  getSpaceType(): Observable<any> {
    return this.http.get<ParkingSpace[]>(`${this.apiUrl}/parking-spaces-type`);
  }
  updateSpace(id: number, typeId:number): Observable<any> {
    const body={id,typeId}
    return this.http.put(`${this.apiUrl}/updatePSpace`, body);
  }

  getUsers(): Observable<any> {
    return this.http.get<any>(`${this.apiUrl}/users`);
  }
 
  getUserDetail(userId: number): Observable<any> {
    return this.http.get<any>(`${this.apiUrl}/users/${userId}`);
  }

  releaseSpace(spaceId:number,status:string): Observable<any> {
    const body = { spaceId,status};
    return this.http.put<any>(`${this.apiUrl}/release-sapce`,body);
  }


createUsageRecord(usageRecords:UsageRecords): Observable<any>  {
  const body = {usageRecords};
  return this.http.post(`${this.apiUrl}/usage-records`, body);
}

deleteSpace(space_id:number): Observable<any> {
  return this.http.delete<any>(`${this.apiUrl}/deleteSpace/${space_id}`);
}

addNewSpace(typeId:number): Observable<any>{
  const body = {typeId};
  return this.http.post(`${this.apiUrl}/addNewSpace`,body);
}

updateParkingST(PST:ParkingSpaceType): Observable<any>{
  const body = {PST};
  return this.http.put(`${this.apiUrl}/spaceType`,body);
}

getComplete(): Observable<any> {
  return this.http.get<any>(`${this.apiUrl}/getComment/rating`);
}
deleteComment(id:number): Observable<any> {
  return this.http.delete<any>(`${this.apiUrl}/deleteComment/${id}`);
}

}
