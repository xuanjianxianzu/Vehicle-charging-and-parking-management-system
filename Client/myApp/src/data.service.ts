import { Injectable } from '@angular/core';
import { HttpClient, HttpHeaders } from '@angular/common/http';
import { Observable } from 'rxjs';

@Injectable({
  providedIn: 'root'
})
export class DataService {
  private apiUrl = 'http://localhost:3060/api';

  constructor(private http: HttpClient) { }

  getParkingSpaces(): Observable<any> {
    const token = localStorage.getItem('token');
    console.log(token);

    const headers = new HttpHeaders({
      'Authorization': `Bearer ${token}`,
      'Content-Type': 'application/json'
    });
 console.log(headers);
    return this.http.get(`${this.apiUrl}/parking-spaces`, { headers });
  }
}
