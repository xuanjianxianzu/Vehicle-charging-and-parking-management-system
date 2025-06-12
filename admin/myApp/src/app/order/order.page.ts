import { Component, OnInit } from '@angular/core';
import { ModalController } from '@ionic/angular';
import { DataService } from 'src/data.service';
import { UsageRecords } from 'src/models';
import { MdOrderDetailComponent } from '../md-order-detail/md-order-detail.component';
import { Chart, registerables } from 'chart.js';
import { DateTime } from 'luxon';
Chart.register(...registerables);
@Component({
  selector: 'app-order',
  templateUrl: './order.page.html',
  styleUrls: ['./order.page.scss'],
  standalone: false,
})
export class OrderPage implements OnInit {
   public charts: { [key: string]: Chart } = {};
  Orders:UsageRecords[]=[];
  validOrder:UsageRecords[]=[];
  constructor(private dataService: DataService,
    private modalCtrl: ModalController,) { }

  ngOnInit() {

    this.loadOrders();
  }

  loadOrders() {
this.dataService.getOrders().subscribe({
  next: (data) => {
    this.Orders = data.data;
    console.log(this.Orders)
    this.createLineChart();
    this.calculateHourlyIncome();
  },
  error: (err) => {
    console.error('加载失败:', err);
  },
});

}

async openModal(orderId:number) {
      const modal = await this.modalCtrl.create({
        component: MdOrderDetailComponent,
        componentProps: {
          id: orderId,
        }
      });
      
      modal.onDidDismiss().then(({ data }) => {
        if (data) {
        }
      });
      
      return await modal.present();
    
  }


async Release(spaceId: number,status:string) {
let statusA:string='';
  if(status=='in_progress'){
    statusA='occupied'
  }else if(status=='booked'){
    statusA='booked'
  }else{
    alert('订单已完成或取消')
    return;
  }

 this.dataService.releaseSpace(spaceId,statusA).subscribe({
  next: (data) => {
    alert(data.message);
    this.loadOrders();
  },
  error: (err) => {
    console.error('加载失败:', err);
  },
});

}

  async deleteOrder(orderId: number) {
this.dataService.deleteOrder(orderId).subscribe({
    next: (data) => {
      alert(data.message);
      this.loadOrders();
    },
    error: (err) => {
      console.error('失败:', err);
    },
  });

  }

  calculateHourlyIncome() {
  const hourlyIncome = new Array(24).fill(0);
  console.log(hourlyIncome)
  this.charts['lineChart'].data.datasets[0].data = hourlyIncome;
  this.charts['lineChart'].update();
  const now = DateTime.now().setZone('Asia/Shanghai');
  const today = now.toFormat('yyyy-MM-dd') + 'T';
  this.Orders.filter(order => order.vehicle_id > 50&&order.status=='completed'&&order.end_time?.startsWith(today)).forEach(order => {
    try {
      const timeString = order.end_time!;
      const hour = parseInt(timeString.split('T')[1].substring(0, 2));
      const hourIndex = hour;
      const fee = Number(order.total_fee!)
      hourlyIncome[hourIndex] += fee;

    } catch (e) {
      console.warn('时间格式错误:', order.start_time);
    }
  });

  return hourlyIncome;

}

  createLineChart() {
    this.charts['lineChart'] = new Chart('lineChart', {
      type: 'line',
      data: {
        labels: ['1点', '2点','3点','4点','5点','6点','7点','8点','9点','10点','11点','12点','13点','14点','15点','16点','17点','18点','19点','20点','21点','22点','23点','24点'],
        datasets: [{
          label: '每小时收入',
          data: [0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0],
          borderColor: '#4BC0C0',
          tension: 0.4,
          fill: true
        }]
      },
      options: {
        responsive: true,
        scales: {
          y: { beginAtZero: true }
        }
      }
    });
  }

}
