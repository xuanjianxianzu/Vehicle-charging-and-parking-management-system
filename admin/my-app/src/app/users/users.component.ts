import { Component, OnInit } from '@angular/core';
import { MatDialog } from '@angular/material/dialog';
import { DataService } from '../../data.service';
import { UserDetailDialogComponent } from '../users-detail-dialog/users-detail-dialog.component';
import { User } from '../../models';

@Component({
  selector: 'app-users',
  templateUrl: './users.component.html',
  styleUrls: ['./users.component.css']
})
export class UsersComponent implements OnInit {
  users: User[] = [];
  displayedColumns = [
    'id', 'username', 'name', 'role', 'balance',
    'phone', 'email', 'avatar_number', 'created_at', 'updated_at', 
    'actions'
  ];
  loading = true;

  constructor(
    private dataService: DataService, // 修正变量名首字母小写（原DataService改为dataService）
    private dialog: MatDialog
  ) {}

  ngOnInit(): void {
    this.loadUsers();
  }

  loadUsers() {
    this.dataService.getUsers().subscribe({
      next: (data) => {
        this.users = data.data;
        this.loading = false;
        console.log(this.users);
      },
      error: (err) => {
        console.error('Failed to load users:', err); // 英文错误提示
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