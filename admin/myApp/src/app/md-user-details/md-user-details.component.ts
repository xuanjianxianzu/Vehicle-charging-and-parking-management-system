import { Component, Input, OnInit } from '@angular/core';
import { User } from 'src/models';
import { ModalController } from '@ionic/angular';
import { DataService } from 'src/data.service';
@Component({
  selector: 'app-md-user-details',
  templateUrl: './md-user-details.component.html',
  styleUrls: ['./md-user-details.component.scss'],
  standalone: false,
})
export class MdUserDetailsComponent  implements OnInit {

  @Input() user!:User;
  constructor(    
    private modalCtrl: ModalController,
    private dataService: DataService
  ) { }

  ngOnInit() {}

  
  save(){
    if(this.user.username==null||this.user.role==null||this.user.avatar_number==null||this.user.balance==null||this.user.status==null){
      alert('请填写必要字段')
      return;
    }

     this.dataService.updateUserDetails(this.user).subscribe({
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
