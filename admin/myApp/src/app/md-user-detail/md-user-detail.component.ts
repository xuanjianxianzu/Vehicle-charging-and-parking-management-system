import { Component, OnInit , Input } from '@angular/core';
import { ModalController } from '@ionic/angular';
import { ParkingSpaceType, UserDetail, Vehicle } from 'src/models';
import { DataService } from 'src/data.service';

@Component({
  selector: 'app-md-user-detail',
  templateUrl: './md-user-detail.component.html',
  styleUrls: ['./md-user-detail.component.scss'],
  standalone: false,
})
export class MdUserDetailComponent  implements OnInit {

  @Input() userId!:number;
  @Input() name!:string;
  Vehicle:Vehicle[]=[];
  UserDetail:UserDetail[]=[];
  constructor(
    private modalCtrl: ModalController,
    private dataService: DataService
) { }

  ngOnInit() {
    this.loadUserDetail();
  }



  loadUserDetail(){

     this.dataService.getUserDetail(this.userId).subscribe({
    next: (data) => {

      this.Vehicle=data.data;
      this.UserDetail=data.data2;
      console.log(this.Vehicle,this.UserDetail)
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
