import { Component, OnInit } from '@angular/core';
import { DataService } from 'src/data.service';
import { User } from 'src/models/user';
import { Router } from '@angular/router';
import { ModalController } from '@ionic/angular';
import { ModalToInfComponent } from '../modal-to-inf/modal-to-inf.component';
import { ModalToPicComponent } from '../modal-to-pic/modal-to-pic.component';

@Component({
  selector: 'app-personal-information',
  templateUrl: './personal-information.page.html',
  styleUrls: ['./personal-information.page.scss'],
  standalone: false,
})
export class PersonalInformationPage implements OnInit {

  user!:User;
  myUserID = localStorage.getItem('myUserID');


  constructor(    
    private router: Router,
    private dataService: DataService,
    private modalCtrl: ModalController) { }

  ngOnInit() {
    const navigation = this.router.getCurrentNavigation();
    if (navigation?.extras?.state) {
      this.user = navigation.extras.state['userI'];
    }
  }

  get userAvatar(): string {
    return `../../assets/images/${this.user?.avatar_number}.png`;
  }




  async openModal(fieldType: string) {
    if (fieldType === 'avatar') {
      const modal = await this.modalCtrl.create({
        component: ModalToPicComponent,
        componentProps: {
          currentAvatar: this.user.avatar_number
        }
      });
      
      modal.onDidDismiss().then(({ data }) => {
        if (data) {
          this.user.avatar_number = data;
          this.updateProfile();
          console.log(this.user)
        }
      });
      
      return await modal.present();
    } else {
      const modal = await this.modalCtrl.create({
        component: ModalToInfComponent,
        componentProps: {
          fieldType: fieldType,
          currentValue: this.getFieldValue(fieldType)
        }
      });
      
      modal.onDidDismiss().then(({ data }) => {
        if (data) {
          this.updateField(fieldType, data);
          this.updateProfile();
        }
      });
      
      return await modal.present();
    }
  }

  getFieldValue(fieldType: string): any {
    switch(fieldType) {
      case 'name': return this.user?.name;
      case 'email': return this.user?.email;
      case 'phone': return this.user?.phone;
      default: return null;
    }
  }

  updateField(fieldType: string, value: string) {
    switch(fieldType) {
      case 'name': this.user.name = value; break;
      case 'email': this.user.email = value; break;
      case 'phone': this.user.phone = value; break;
    }
  }

  updateProfile() {
    this.dataService.updateUserProfile(this.user).subscribe({
      next: (res) => console.log('Update successful', res),
      error: (err) => console.error('Update failed', err)
    });
  }
}