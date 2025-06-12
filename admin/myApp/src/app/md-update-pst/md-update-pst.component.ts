import { Component, OnInit , Input } from '@angular/core';
import { ModalController } from '@ionic/angular';
import { ParkingSpaceType } from 'src/models';
import { DataService } from 'src/data.service';
@Component({
  selector: 'app-md-update-pst',
  templateUrl: './md-update-pst.component.html',
  styleUrls: ['./md-update-pst.component.scss'],
  standalone: false,
})
export class MdUpdatePstComponent  implements OnInit {

  @Input() PST!:ParkingSpaceType;

  constructor(
    private modalCtrl: ModalController,
    private dataService: DataService
) { }

  ngOnInit() {}



  save(){
    if(this.PST.rate==null||this.PST.parking_rate==null||this.PST.overtime_occupancy_rate==null||this.PST.power==null){
      alert('请填写所有')
      return;
    }

     this.dataService.updateParkingST(this.PST).subscribe({
    next: (data) => {
      alert(data.message);
       this.modalCtrl.dismiss();
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
