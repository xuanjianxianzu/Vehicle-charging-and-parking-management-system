import { Component, OnInit } from '@angular/core';
import { ModalController } from '@ionic/angular';
import { DataService } from '../../data.service';
import { UserDetailDialogComponent } from '../user-detail-dialog/user-detail-dialog.component';
import { User } from '../../models';

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
    private modalCtrl: ModalController
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

  async openDetail(userId: number) {
    const modal = await this.modalCtrl.create({
      component: UserDetailDialogComponent,
      componentProps: {
        userId: userId
      },
      cssClass: 'full-screen-modal'
    });
    await modal.present();
  }

  async updateUser(user: User) {
    const modal = await this.modalCtrl.create({
      component: UserDetailDialogComponent,
      componentProps: {
        userId: user.id,
        isUpdate: true
      },
      breakpoints: [0, 0.8],
      initialBreakpoint: 0.8
    });

    await modal.present();
    const { data } = await modal.onWillDismiss();
    if (data?.reload) {
      this.loadUsers();
    }
  }

  async deleteUser(userId: number) {

  }
}