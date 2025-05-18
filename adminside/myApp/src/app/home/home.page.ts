import { Component, OnInit } from '@angular/core';
import { DataService } from '../../data.service';
import { ParkingSpace, ParkingSpaceType, UsageRecords } from '../../models';
import { DateTime } from 'luxon';
import { AlertController } from '@ionic/angular';
import { ModalController } from '@ionic/angular';
import { MdUpdatePstComponent } from '../md-update-pst/md-update-pst.component';

@Component({
  selector: 'app-home',
  templateUrl: './home.page.html',
  styleUrls: ['./home.page.scss'],
    standalone: false,
})
export class HomePage implements OnInit {
  spaces: ParkingSpace[] = [];
  loading = true;
  usageRecords:UsageRecords;
  searchTerm: string='';
  filteredSpaces: ParkingSpace[] = [];
  newtype:string='';
  myUserID = localStorage.getItem('myUserID');
  ParkingSpaceT:ParkingSpaceType[]=[];

  constructor(
    private alertController: AlertController,
    private dataService: DataService,
    private modalCtrl: ModalController
  ) {
      this.usageRecords = {
      startTime: DateTime.now().setZone('Asia/Shanghai').toISO()!,
      status: 'in_progress',
      vehicleId: 0,
      parkingSpaceId: 0,
      chargingStartTime: null,
      chargingCompleteTime: null,
      endTime: null
    };
  }

ngOnInit() {
  this.loadSpaces();
}

loadSpaces() {
this.dataService.getSpaces().subscribe({
  next: (data) => {
    this.spaces = data.data;
    this.filterSpaces()
    this.loading = false;
  },
  error: (err) => {
    console.error('加载车位失败:', err);
    this.loading = false;
  },
});

this.dataService.getSpaceType().subscribe({
  next: (data) => {
    this.ParkingSpaceT = data.data;
    console.log(this.ParkingSpaceT)
  },
  error: (err) => {
    console.error('加载车位失败:', err);
  },
});


}

async Release(spaceId: number,status:string) {
 this.dataService.releaseSpace(spaceId,status).subscribe({
  next: (data) => {
    alert(data.message);
    this.loadSpaces();
  },
  error: (err) => {
    console.error('加载失败:', err);
  },
});

}

async Occupancy(spaceId: number) {

  try {
    const record: UsageRecords = {
      ...this.usageRecords,
      parkingSpaceId: spaceId,
      vehicleId: spaceId,
      startTime: DateTime.now().setZone('Asia/Shanghai').toISO()!,
      status: 'in_progress'
    };

    const result = await this.dataService.createUsageRecord(record).toPromise();
    
    if (result.code===201) {

    } else {
      alert(`失败`);
    }
  } catch (error) {
    console.error('failed:', error);
    alert('请求发送失败，请检查网络连接');
  }
      this.loadSpaces();
}


updateStatus(id:number, type: string) {
  let numberA:number;
  if(type==='fast_charging'){
      numberA=1;
  }else if(type==='slow_charging'){
      numberA=2;
  }else{
      numberA=3;
  }
  console.log(numberA)
  this.dataService.updateSpace(id, numberA).subscribe({
    next: (data) => {
      alert(data.message);
      this.loadSpaces();
    },
    error: (err) => {
      console.error('失败:', err);
    },
  });

}
async DeleteSpace(id: number,status:string) {
  if(status!='idle'){
    alert('不能删除正在使用的车位')
    return;
  }
  const alertA = await this.alertController.create({
    header: '确认删除',
    message: '是否确认删除该车位？',
    buttons: [
      {
        text: '取消',
        role: 'cancel',
        cssClass: 'secondary',
        handler: () => {

        }
      },
      {
        text: '确认',
        handler: () => {
          this.dataService.deleteSpace(id).subscribe({
            next: (response) => {
              console.log('删除成功', response);
              this.loadSpaces();
            },
            error: (error) => {
              console.error('删除失败', error);
            }
          });
        }
      }
    ]
  });

  await alertA.present();
}

filterSpaces() {

    if (!this.searchTerm) {
      this.filteredSpaces = [...this.spaces];
      console.log(this.filteredSpaces);
      return;
    }
    let filtered = [...this.spaces];
    if (this.searchTerm) {
      const search = this.searchTerm.toLowerCase();
      filtered = filtered.filter(space =>
        space.space_type.toLowerCase().includes(search) ||
        space.status.toLowerCase().includes(search)|| 
        String(space.id).toLowerCase().includes(search)
      );
    }
    this.filteredSpaces = filtered;
  }

  addSpace(){
  let numberA:number;
  if(this.newtype==='fast_charging'){
      numberA=1;
  }else if(this.newtype==='slow_charging'){
      numberA=2;
  }else{
      numberA=3;
  }

 this.dataService.addNewSpace(numberA).subscribe({
    next: (data) => {
      alert(data.message);
      this.loadSpaces();
    },
    error: (err) => {
      console.error('失败:', err);
    },
  });


  }



 async openModal(PST:ParkingSpaceType) {
      const modal = await this.modalCtrl.create({
        component: MdUpdatePstComponent,
        componentProps: {
          PST: PST
        }
      });
      
      modal.onDidDismiss().then(({ data }) => {
        if (data) {
          this.loadSpaces();
        }
      });
      
      return await modal.present();
    
  }



}