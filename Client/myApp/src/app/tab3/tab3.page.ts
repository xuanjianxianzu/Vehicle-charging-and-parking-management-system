import { Component, OnInit } from '@angular/core';
import { ActivatedRoute, Router } from '@angular/router';
import { DataService } from 'src/data.service';
import { ParkingSpace } from 'src/models/parking-space';
import { Vehicle } from 'src/models/vehicle';


@Component({
  selector: 'app-tab3',
  templateUrl: './tab3.page.html',
  styleUrls: ['./tab3.page.scss'],
  standalone: false,
})
export class Tab3Page{

  MyCarArray: Vehicle[] = [];
  parkingSpaces: ParkingSpace[] = [];
  filteredSpaces: ParkingSpace[] = [];
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
    this.dataService.getParkingSpaces(0).subscribe({
      next: (data: any) => {
        this.parkingSpaces = data.data;
        this.toggleMyAppointment();
        console.log(this.parkingSpaces);
        if (event) {
          event.target.complete();
        }
      },
      error: (error) => {
        console.error('Error fetching parking spaces:', error);
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
        this.filterSpaces();
      }
  
    } catch (error) {
      console.error('Failed to fetch cars:', error);
    }
  }


  filterSpaces() {
    let filtered = [...this.parkingSpaces];

    filtered = filtered.filter(space => 
      space.vehicle_id !== null && 
      this.MyCarId.includes(space.vehicle_id)
    );
    this.filteredSpaces = filtered;
  }

  toUse(id:number){
    this.router.navigate([`/to-use-space/${id}`]);
  }

}
