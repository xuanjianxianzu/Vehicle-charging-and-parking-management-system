import { Component, OnInit } from '@angular/core';
import { ActivatedRoute, Router } from '@angular/router';
import { DataService } from 'src/data.service';
import { Order } from 'src/models/order';
import { Vehicle } from 'src/models/vehicle';
import { ReviewModalComponent } from '../review-modal/review-modal.component';
import { ModalController } from '@ionic/angular';

@Component({
  selector: 'app-my-bill',
  templateUrl: './my-bill.page.html',
  styleUrls: ['./my-bill.page.scss'],
  standalone: false,
})
export class MyBillPage implements OnInit {
    MyCarArray: Vehicle[] = [];
    MyCarId:number[]=[];
    myUserID = localStorage.getItem('myUserID');
    myOrders:Order[]=[];
    filterOrd:Order[]=[];
  constructor(    
    private dataService: DataService,
    private router: Router,
    private route: ActivatedRoute,
    private modalController: ModalController) { }

  ngOnInit() {
    this.toggleMyAppointment();
    this.route.params.subscribe(() => {
      this.toggleMyAppointment();
    });
  }

  loadOrders() {
    this.dataService.AllMyOrder(this.MyCarId).subscribe({
      next: (data: any) => {
        this.myOrders = data.data;
        this.filterOrders();
      },
      error: (error) => {
        console.error('Error fetching parking spaces:', error);
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
      this.loadOrders();
      }
  
    } catch (error) {
      console.error('Failed to fetch cars:', error);
    }
  }


  filterOrders(){

  }

  async completeOrder(order: Order) {
    if (order.status === 'to_be_paid') {
      const userConfirmed = confirm('是否立即支付账单？');
      if (userConfirmed) {
        try {
          const response = await this.dataService.payBill(Number(this.myUserID), order.id).toPromise();
          if (response.code === 200) {
            alert('支付成功');
            this.router.navigate(['/my-bill']);
          }
        } catch (error) {
          alert('支付失败，请稍后重试');
        }
      }
    } else if (order.status === 'completed') {
      const modal = await this.modalController.create({
        component: ReviewModalComponent,
        componentProps: { orderId: order.id }
      });
      
      await modal.present();
      const { data } = await modal.onDidDismiss();
      
      if (data) {
        try {
          await this.dataService.completeEvaluation(order.id, data.rating, data.comment).toPromise();
          alert('评价提交成功');
          this.loadOrders();
        } catch (error) {
          alert('评价提交失败或重复提交');
        }
      }
    } else if (order.status === 'cancelled' || order.status === 'end_booked') {
      const confirmText = order.status === 'cancelled' 
        ? '是否重新预订该车位？' 
        : '是否再次使用该车位？';
      
      if (confirm(confirmText)) {
        this.router.navigate([`/to-use-space/${order.parking_space_id}`]);
      }
    } else if (order.status === 'booked') {
      if (confirm('是否立即前往使用该车位？')) {
        this.router.navigate([`/to-use-space/${order.parking_space_id}`]);
      }
    } else {
      if (confirm('是否结束使用该车位？')) {
        this.router.navigate([`/to-use-space/${order.parking_space_id}`]);
      }
    }
  }
}
