import { Component, OnInit } from '@angular/core';
import { ToastController } from '@ionic/angular';
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
  statusFilter:string='';
  typeFilter:string='';
  myAppointmentFilter: boolean = false;
  parkingSpaces: ParkingSpace[] = [];
  filteredSpaces: ParkingSpace[] = [];
  isLoading:boolean = true;
  MyCarId = localStorage.getItem('MyCarId');

  constructor(
    private dataService: DataService,
    private toastController: ToastController,
  ) { }

  ngOnInit() {
    this.loadParkingSpaces();
  }

  loadParkingSpaces(event?: any) {
    this.isLoading = true;
    this.dataService.getParkingSpaces().subscribe({
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


  async toggleMyAppointment(){
    if(!this.MyCarId){
      const toast = await this.toastController.create({
        message:"未绑定车辆",
        duration: 2000,
        position: 'top'
      });
      await toast.present();
      return;
    }
    this.myAppointmentFilter = !this.myAppointmentFilter;
    console.log(this.myAppointmentFilter);
  }

  filterSpaces() {

    console.log(this.typeFilter);
    if (!this.searchTerm&&!this.statusFilter&&!this.typeFilter&&!this.myAppointmentFilter) {
      this.filteredSpaces = [...this.parkingSpaces];
      console.log('aaaaa');
      return;
    }
    let filtered = [...this.parkingSpaces];
    if (this.statusFilter && this.statusFilter!== '') {
      filtered = filtered.filter(space => space.status === this.statusFilter);
    }

    if (this.typeFilter && this.typeFilter!== '') {
      filtered = filtered.filter(space => space.type === this.typeFilter);
    }

    if (this.myAppointmentFilter) {
        filtered = filtered.filter(space => space.vehicles_id === Number(this.MyCarId));
    }

    if (this.searchTerm) {
      const search = this.searchTerm.toLowerCase();
      filtered = filtered.filter(space =>
        space.type.toLowerCase().includes(search) ||
        space.status.toLowerCase().includes(search)
      );
    }
    this.filteredSpaces = filtered;
  }


}