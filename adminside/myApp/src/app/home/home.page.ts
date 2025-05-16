import { Component, OnInit } from '@angular/core';
import { ModalController } from '@ionic/angular';
import { DataService } from '../../data.service';
import { ParkingdetailComponent } from '../parkingdetail/parkingdetail.component';
import { ParkingSpace } from '../../models';

@Component({
  selector: 'app-home',
  templateUrl: './home.page.html',
  styleUrls: ['./home.page.scss'],
    standalone: false,
})
export class HomePage implements OnInit {
  spaces: ParkingSpace[] = [];
  loading = true;
  constructor(
    private dataService: DataService,
    private modalCtrl: ModalController
  ) {}

  ngOnInit() {
    this.loadSpaces();
  }
   loadSpaces() {
    this.dataService.getSpaces().subscribe({
      next: (data) => {
        this.spaces = data.data;
        this.loading = false;
      },
      error: (err) => {
        console.error('Failed to load the parking space:', err);
        this.loading = false;
      },
    });
  }

  async openDetail(spaceId: number) {
    const modal = await this.modalCtrl.create({
      component: ParkingdetailComponent,
      componentProps: {
        spaceId: spaceId
      },
      cssClass: 'custom-modal'
    });
    await modal.present();
  }

  updateStatus(space: ParkingSpace, newStatus: string) {
    this.dataService.updateSpace(space.id, { status: newStatus }).subscribe({
      next: () => {
        space.status = newStatus;
        this.loadSpaces();
      },
      error: (err) => {
        console.error('Failed to update the status:', err);
      },
    });
  }


}