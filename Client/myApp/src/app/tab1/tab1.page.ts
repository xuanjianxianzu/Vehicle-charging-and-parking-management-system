import { Component, OnInit } from '@angular/core';
import { ActivatedRoute, Router } from '@angular/router';
import { DataService } from 'src/data.service';
import { ParkingSpace } from 'src/models/parking-space';
import { Vehicle } from 'src/models/vehicle';

@Component({
  selector: 'app-tab1',
  templateUrl: './tab1.page.html',
  styleUrls: ['./tab1.page.scss'],
  standalone: false,
})
export class Tab1Page implements OnInit {

  MyCarArray: Vehicle[] = [];
  searchTerm: string='';
  statusFilter:string='';
  typeFilter:string='';
  isFindUsing: boolean = false;
  parkingSpaces: ParkingSpace[] = [];
  filteredSpaces: ParkingSpace[] = [];
  isLoading:boolean = true;
  MyCarId:number[]=[];
  myUserID = localStorage.getItem('myUserID');

  constructor(
    private dataService: DataService,
    private router: Router,
    private route: ActivatedRoute
  ) { }

  ngOnInit() {
    this.loadParkingSpaces();
    this.route.params.subscribe(() => {
      this.loadParkingSpaces();
    });
  }

  loadParkingSpaces(event?: any) {
    this.isLoading = true;
    this.dataService.getParkingSpaces(0).subscribe({
      next: (data: any) => {
        this.parkingSpaces = data.data;
        this.filterSpaces();
        this.isLoading = false;
        console.log(this.parkingSpaces);
        if (event) {
          event.target.complete();
        }
      },
      error: (error) => {
        console.error('Error fetching parking spaces:', error);
        this.isLoading = false;

        if (event) {
          event.target.complete();
        }

      }
    });
  }


  async toggleMyAppointment() {
    try {
      const userId = Number(this.myUserID); 
      const response = await this.dataService.getMyCar(userId).toPromise();
      this.MyCarArray = response.data || [];
      this.MyCarId = this.MyCarArray.map(car => car.id);
      if(this.MyCarId.length>0){  
        console.log(this.MyCarId);
        console.log('<0');
        this.isFindUsing = !this.isFindUsing;
        this.filterSpaces();
      }
  
    } catch (error) {
      console.error('Failed to fetch cars:', error);
    }
  }

  filterSpaces() {
    console.log(this.typeFilter);
    if (!this.searchTerm&&!this.statusFilter&&!this.typeFilter&&!this.isFindUsing) {
      this.filteredSpaces = [...this.parkingSpaces];
      console.log(this.filteredSpaces);
      console.log('aaaaa');
      return;
    }
    let filtered = [...this.parkingSpaces];
    if (this.statusFilter && this.statusFilter!== '') {
      filtered = filtered.filter(space => space.status === this.statusFilter);
    }

    if (this.typeFilter && this.typeFilter!== '') {
      filtered = filtered.filter(space => space.space_type === this.typeFilter);
    }



    if (this.searchTerm) {
      const search = this.searchTerm.toLowerCase();
      filtered = filtered.filter(space =>
        space.space_type.toLowerCase().includes(search) ||
        space.status.toLowerCase().includes(search)
      );
    }
    this.filteredSpaces = filtered;
  }


  toUse(id:number){
    this.router.navigate([`/to-use-space/${id}`]);
  }


}