import { Component, OnInit } from '@angular/core';
import { ModalController } from '@ionic/angular';
import { DataService } from 'src/data.service';
import { UsageRecords } from 'src/models';
import { MdOrderDetailComponent } from '../md-order-detail/md-order-detail.component';

@Component({
  selector: 'app-order',
  templateUrl: './order.page.html',
  styleUrls: ['./order.page.scss'],
  standalone: false,
})
export class OrderPage implements OnInit {

  Orders:UsageRecords[]=[];

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
  },
  error: (err) => {
    console.error('加载失败:', err);
  },
});

}

async openModal(orderId:number) {
  console.log(orderId);
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

}
