import { Component, OnInit } from '@angular/core';
import { MatDialog } from '@angular/material/dialog';
import { DataService } from '../../data.service';
import { UserDetailDialogComponent } from '../users-detail-dialog/users-detail-dialog.component';

@Component({
  selector: 'app-users',
  templateUrl: './users.component.html',
  styleUrls: ['./users.component.css']
})
export class UsersComponent implements OnInit {
  users: any[] = [];
  displayedColumns = ['id', 'username', 'name', 'role', 'balance', 'actions'];
  loading = true;

  constructor(
    private DataService: DataService,
    private dialog: MatDialog
  ) {}

  ngOnInit(): void {
    this.loadUsers();
  }

  loadUsers() {
    this.DataService.getUsers().subscribe({
      next: (data) => {
        this.users = data;
        this.loading = false;
      },
      error: (err) => {
        console.error('加载用户失败:', err);
        this.loading = false;
      }
    });
  }

  openDetail(userId: number) {
    this.dialog.open(UserDetailDialogComponent, {
      data: { userId },
      width: '90vw',
      maxHeight: '95vh',
      autoFocus: false
    });
  }

  updateUser(user: any) {
    const dialogRef = this.dialog.open(UserDetailDialogComponent, {
      data: { userId: user.id, isUpdate: true },
      width: '500px'
    });

    dialogRef.afterClosed().subscribe(() => this.loadUsers());
  }
}