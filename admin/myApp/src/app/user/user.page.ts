import { Component, OnInit } from '@angular/core';
import { ModalController } from '@ionic/angular';
import { DataService } from '../../data.service';
import { User } from '../../models';
import { Router } from '@angular/router';
import { MdUserDetailsComponent } from '../md-user-details/md-user-details.component';
import { MdUserDetailComponent } from '../md-user-detail/md-user-detail.component';

@Component({
  selector: 'app-users',
  templateUrl: './user.page.html',
  styleUrls: ['./user.page.scss'],
  standalone: false,
})
export class UserPage implements OnInit {
  users: User[] = [];
  loading = true;
  constructor(
    private dataService: DataService,
    private modalCtrl: ModalController,
    private router: Router
  ) {}

  ngOnInit() {
    this.loadUsers();
  }

  async loadUsers() {
    try {
      const data = await this.dataService.getUsers().toPromise();
      this.users = data.data;
    } catch (err) {
      console.error('加载用户失败:', err);
    } finally {
      this.loading = false;
    }
  }

  async updateUser(user: User) {
    const modal = await this.modalCtrl.create({
          component: MdUserDetailsComponent,
          componentProps: {
            user: user,
          }
        });
        
        modal.onDidDismiss().then(({ data }) => {
          if (data) {
            this.loadUsers();
          }
        });
        
        return await modal.present();
      

  }

    async updateUserStatus(userId: number,status:string,) {
  this.dataService.updateUserStatus(userId,status).subscribe({
    next: (data) => {
      alert(data.message);
      this.loadUsers();
    },
    error: (err) => {
      console.error('失败:', err);
    },
  });
  }

  async deleteUser(userId: number) {
this.dataService.deleteUser(userId).subscribe({
    next: (data) => {
      alert(data.message);
      this.loadUsers();
    },
    error: (err) => {
      console.error('失败:', err);
    },
  });

  }
  async addAdmin() {
    this.router.navigate(['/register']);
  }


 async openModal(userId:number,name:string) {
  console.log(userId,name);
      const modal = await this.modalCtrl.create({
        component: MdUserDetailComponent,
        componentProps: {
          userId: userId,
          name:name
        }
      });
      
      modal.onDidDismiss().then(({ data }) => {
        if (data) {
        }
      });
      
      return await modal.present();
    
  }



}