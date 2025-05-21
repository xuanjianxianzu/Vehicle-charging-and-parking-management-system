import { Component, OnInit } from '@angular/core';
import { DataService } from '../../data.service';
import { ParkingSpace, ParkingSpaceType, UsageRecords } from '../../models';
import { DateTime } from 'luxon';
import { AlertController } from '@ionic/angular';
import { ModalController } from '@ionic/angular';
import { MdUpdatePstComponent } from '../md-update-pst/md-update-pst.component';
import { Chart, registerables } from 'chart.js';
Chart.register(...registerables);
@Component({
  selector: 'app-home',
  templateUrl: './home.page.html',
  styleUrls: ['./home.page.scss'],
    standalone: false,
})
export class HomePage implements OnInit {
  

   public charts: { [key: string]: Chart } = {};
  spaces: ParkingSpace[] = [];
  loading = true;
  usageRecords:UsageRecords;
  searchTerm: string='';
  filteredSpaces: ParkingSpace[] = [];
  newtype:string='';
  myUserID = localStorage.getItem('myUserID');
  ParkingSpaceT:ParkingSpaceType[]=[];


    overallStatusCounts: { [key: string]: number } = {
    idle: 0,
    occupied: 0,
    booked: 0
  };

      overallTypeCounts: { [key: string]: number } = {
      fast_charging:0,
      slow_charging:0, 
      normal:0
  };


  constructor(
    private alertController: AlertController,
    private dataService: DataService,
    private modalCtrl: ModalController
  ) {
      this.usageRecords = {
      id:0,
      start_time: DateTime.now().setZone('Asia/Shanghai').toISO()!,
      status: 'in_progress',
      vehicle_id: 0,
      parking_space_id: 0,
      charging_start_time: null,
      charging_complete_time: null,
      end_time: null,
      electricity_used: null,
      total_fee: null,
    };
  }

ngOnInit() {
  this.loadSpaces();
  this.createPieChart();
  this.createbarChart();
}

loadSpaces() {
this.dataService.getSpaces().subscribe({
  next: (data) => {
    this.spaces = data.data;
    this.filterSpaces()
    this.loading = false;
      this.calculateStatusCounts();
      this.updateChartData();
  console.log(this.overallStatusCounts)
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
      parking_space_id: spaceId,
      start_time: DateTime.now().setZone('Asia/Shanghai').toISO()!,
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


  private calculateStatusCounts() {
    this.overallStatusCounts = this.spaces.reduce((acc, space) => {
      if (space.status === 'idle' || 
          space.status === 'occupied' || 
          space.status === 'booked') {
        acc[space.status] += 1;
      }
      return acc;
    }, { 
      idle: 0, 
      occupied: 0, 
      booked: 0 
    });
    this.overallTypeCounts = this.spaces.reduce((acc, space) => {
      if (space.space_type === 'fast_charging'&& space.status === 'occupied'|| 
          space.space_type === 'slow_charging'&& space.status === 'occupied' || 
          space.space_type === 'normal'&& space.status === 'occupied') {
        acc[space.space_type] += 1;
      }
      return acc;
    }, { 
      fast_charging: 0, 
      slow_charging: 0, 
      normal: 0 
    });

  }


  createPieChart() {
    this.charts['pieChart'] = new Chart('pieChart', {
      type: 'pie',
      data: {
        labels: ['空闲', '占用', '预约'],
        datasets: [{
          data: [30,30,30],
          backgroundColor: ['#FF6384', '#36A2EB', '#FFCE56'],
          hoverOffset: 4
        }]
      },
      options: {
        responsive: true,
        plugins: {
          legend: { position: 'top' },
          tooltip: { callbacks: { label: (ctx) => `${ctx.label}: ${ctx.raw}%` } }
        }
      }
    });
  }

    createbarChart() {
    this.charts['barChart'] = new Chart('barChart', {
      type: 'bar', 
      data: {
        labels: ['快充', '慢充', '普通'],
        datasets: [{
          label: '不同类型车位占用',
          data: [65, 59, 80],
          backgroundColor: 'rgba(75, 192, 192, 0.2)',
          borderColor: 'rgba(75, 192, 192, 1)',
          borderWidth: 1
        }]
      },
      options: {
        responsive: true,
        scales: {
          y: {
            beginAtZero: true
          }
        }
      }
    });
  }

  updateChartData() {
  this.charts['pieChart'].data.datasets[0].data = [this.overallStatusCounts['idle'],this.overallStatusCounts['occupied'],this.overallStatusCounts['booked']];
  this.charts['pieChart'].update(); // 触发重绘

    this.charts['barChart'].data.datasets[0].data = [this.overallTypeCounts['fast_charging'],this.overallTypeCounts['slow_charging'],this.overallTypeCounts['normal']];
  this.charts['barChart'].update(); // 触发重绘
}

}