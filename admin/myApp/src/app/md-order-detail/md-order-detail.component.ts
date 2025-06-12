import { Component, OnInit , Input } from '@angular/core';
import { ModalController } from '@ionic/angular';
import { OrderDetail, ParkingSpaceType } from 'src/models';
import { DataService } from 'src/data.service';

@Component({
  selector: 'app-md-order-detail',
  templateUrl: './md-order-detail.component.html',
  styleUrls: ['./md-order-detail.component.scss'],
  standalone: false,
})
export class MdOrderDetailComponent  implements OnInit {

 @Input() id!:number;
  orderDetail!:OrderDetail;
  constructor(
    private modalCtrl: ModalController,
    private dataService: DataService
) { }

  ngOnInit() {
    this.loadOrderDetail();
  }




  loadOrderDetail(){

     this.dataService.getOrderDetail(this.id).subscribe({
    next: (data) => {
      this.orderDetail=data.data[0];
      console.log(this.orderDetail)
    },
    error: (err) => {
      console.error('失败:', err);
    },
  });
  }



    dismiss() {
    this.modalCtrl.dismiss();
  }

}
