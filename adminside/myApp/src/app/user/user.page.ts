import { Component, OnInit } from '@angular/core';
import { ModalController } from '@ionic/angular';
import { DataService } from '../../data.service';
import { User } from '../../models';
import { Router } from '@angular/router';

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

  async openDetail(userId: number) {

  }

  async updateUser(user: User) {
  
  }

  async deleteUser(userId: number) {

  }
  async addAdmin() {
    this.router.navigate(['/register']);
  }

}