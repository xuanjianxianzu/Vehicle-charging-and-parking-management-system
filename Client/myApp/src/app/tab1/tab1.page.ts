import { Component, OnInit } from '@angular/core';
import { DataService } from 'src/data.service';
import { ParkingSpace } from 'src/models/parking-space';

@Component({
  selector: 'app-tab1',
  templateUrl: './tab1.page.html',
  styleUrls: ['./tab1.page.scss'],
  standalone: false,
})
export class Tab1Page implements OnInit {

  searchTerm: string='';
  parkingSpaces: ParkingSpace[] = [];
  filteredSpaces: ParkingSpace[] = [];
  isLoading:boolean = true;
  constructor(private dataService: DataService) { }

  ngOnInit() {
    this.loadParkingSpaces();
  }

  loadParkingSpaces(event?: any) {
    this.isLoading = true;
    this.dataService.getParkingSpaces().subscribe({
      next: (data: any) => {
        this.parkingSpaces = data.data;
        this.filteredSpaces = [...this.parkingSpaces];
        this.isLoading = false;
        console.log(this.parkingSpaces);
      },
      error: (error) => {
        console.error('Error fetching parking spaces:', error);
        this.isLoading = false;
      }
    });
  }

  filterSpaces() {
    if (!this.searchTerm) {
      this.filteredSpaces = [...this.parkingSpaces];
      return;
    }
    
    this.filteredSpaces = this.parkingSpaces.filter(space => 
      space.type.toLowerCase().includes(this.searchTerm.toLowerCase()) ||
      space.status.toLowerCase().includes(this.searchTerm.toLowerCase())
    );
  }


}