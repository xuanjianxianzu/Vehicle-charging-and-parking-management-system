// users-detail-dialog.component.ts
import { Component, Inject, OnInit } from '@angular/core';
import { MAT_DIALOG_DATA, MatDialogRef } from '@angular/material/dialog';
import { FormBuilder, FormGroup, Validators } from '@angular/forms';
import { MatSnackBar } from '@angular/material/snack-bar';
import { DateTime } from '../../models';
import { DataService } from '../../data.service';

@Component({
  selector: 'app-users-detail-dialog',
  templateUrl: './users-detail-dialog.component.html',
  styleUrls: ['./users-detail-dialog.component.css']
})
export class UserDetailDialogComponent implements OnInit {
  userForm!: FormGroup;
  userDetail: any = {};
  loading = false;
  isNewUser = false;
  isEditMode = false;
  emailPattern = '[a-zA-Z0-9._%+-]+@[a-zA-Z0-9.-]+\\.[a-zA-Z]{2,}';
  vehicles: any[] = [];
  usageRecords: any[] = [];
  bookings: any[] = [];
  comments: any[] = [];
  originalData: any ={};
last: any;

  constructor(
    private dialogRef: MatDialogRef<UserDetailDialogComponent>,
    @Inject(MAT_DIALOG_DATA) public data: { userId: number },
    private fb: FormBuilder,
    private snackBar: MatSnackBar,
    private dataService: DataService
  ) {
    this.isNewUser = data.userId === null;
  }

  ngOnInit(): void {
    if (!this.isNewUser) {
      this.fetchUserDetail();
    } else {
      this.initForm();
      this.originalData = this.userForm.value;
    }
  }

  private initForm(): void {
    this.userForm = this.fb.group({
      id: [0],
      name: [null, Validators.maxLength(50)],
      username: ['', [Validators.required, Validators.maxLength(50)]],
      password: ['', Validators.maxLength(255)],
      phone: [null, Validators.maxLength(20)],
      email: [null, [Validators.email, Validators.maxLength(100)]],
      role: ['user', Validators.required],
      avatar_number: [0],
      balance: [0, Validators.min(0)]
    });
  }

  private fetchUserDetail(): void {
    this.loading = true;
    this.dataService.getUserDetail(this.data.userId).subscribe({
      next: (response) => {
        this.userDetail = response.data;
        this.vehicles = this.userDetail.vehicles || [];
        this.usageRecords = this.userDetail.usageRecords || [];
        this.bookings = this.userDetail.bookings || [];
        this.comments = this.userDetail.comments || [];
        this.initForm();
        this.bindDataToForm();
        this.originalData = { ...this.userDetail };
        this.loading = false;
      },
      error: (err) => {
        this.snackBar.open('Load failed. Please check user ID.', 'Close', { duration: 3000 });
        this.loading = false;
      }
    });
  }

  private bindDataToForm(): void {
    this.userForm.patchValue({
      id: this.userDetail.id,
      name: this.userDetail.name,
      username: this.userDetail.username,
      phone: this.userDetail.phone,
      email: this.userDetail.email,
      role: this.userDetail.role,
      avatar_number: this.userDetail.avatar_number,
      balance: this.userDetail.balance
    });
  }

  
saveUser(): void {
    if (!this.isEditMode) return;
    if (this.userForm.invalid) return;
    
    const formValue = this.userForm.value;
    if (!this.hasChanges(formValue)) {
      this.snackBar.open('未检测到任何修改', '关闭', { duration: 3000 });
      return;
    }

    this.loading = true;
    const updateData = this.getUpdateData(formValue);
    
    this.dataService.updateUser(this.userDetail.id, updateData).subscribe({
      next: () => {
        this.snackBar.open('用户信息更新成功', '关闭', { duration: 3000 });
        this.isEditMode = false;
        this.originalData = { ...formValue }; // 更新原始数据
        this.loading = false;
      },
      error: (err) => {
        this.snackBar.open('更新失败，请检查输入', '关闭', { duration: 3000 });
        this.loading = false;
      }
    });
  }

  // 检查数据是否有修改（包含关联数据的变更）
private hasChanges(formValue: any): boolean {
  const baseChanges = !['id', 'username', 'password'].every(field => 
    formValue[field] === this.originalData[field]
  );

  const relatedDataChanges = 
    this.vehicles.length !== this.originalData.vehicles.length ||
    this.comments.length !== this.originalData.comments.length ||
    this.bookings.length !== this.originalData.bookings.length ||
    this.usageRecords.length !== this.originalData.usageRecords.length;

  return baseChanges || relatedDataChanges;
}

  // 获取可更新的数据（排除不可修改字段）
  private getUpdateData(formValue: any): any {
    return {
      name: formValue.name,
      phone: formValue.phone,
      email: formValue.email,
      role: formValue.role,
      avatar_number: formValue.avatar_number,
      balance: formValue.balance
    };
  }

  cancel(): void {
    this.dialogRef.close(false);
  }

  editUser(): void {
    this.isEditMode = true;
  }

  // 删除车辆
deleteVehicle(vehicleId: number): void {
  if (confirm('Confirm delete this vehicle?')) {
    this.dataService.deleteVehicle(vehicleId).subscribe({
      next: () => {
        this.vehicles = this.vehicles.filter(v => v.id !== vehicleId);
        this.snackBar.open('The vehicle was deleted successfully.', 'Close', { duration: 3000 });
      },
      error: (err) => {
        // Handle specific error codes
        if (err.error && err.error.message) {
          this.snackBar.open(err.error.message, 'Close', { duration: 5000 });
        } else {
          this.snackBar.open('Delete failed. Please try again.', 'Close', { duration: 3000 });
        }
      }
    });
  }
}

// 删除预订
deleteBooking(bookingId: number): void {
  if (confirm('Confirm delete this booking?')) {
    this.dataService.deleteBooking(bookingId).subscribe({
      next: () => {
        this.bookings = this.bookings.filter(b => b.id !== bookingId);
        this.snackBar.open('The booking was deleted successfully.', 'Close', { duration: 3000 });
      },
      error: (err) => {
        if (err.error && err.error.message) {
          this.snackBar.open(err.error.message, 'Close', { duration: 5000 });
        } else {
          this.snackBar.open('Delete booking failed. Please try again.', 'Close', { duration: 3000 });
        }
      }
    });
  }
}

// 删除使用记录
deleteUsageRecord(recordId: number): void {
  if (confirm('Confirm delete this usage record?')) {
    this.dataService.deleteUsageRecord(recordId).subscribe({
      next: () => {
        this.usageRecords = this.usageRecords.filter(r => r.id !== recordId);
        this.snackBar.open('The usage record was deleted successfully.', 'Close', { duration: 3000 });
      },
      error: (err) => {
        if (err.error && err.error.message) {
          this.snackBar.open(err.error.message, 'Close', { duration: 5000 });
        } else {
          this.snackBar.open('Delete usage record failed. Please try again.', 'Close', { duration: 3000 });
        }
      }
    });
  }
}

// 删除评论
deleteComment(commentId: number): void {
  if (confirm('Confirm delete this comment?')) {
    this.dataService.deleteComment(commentId).subscribe({
      next: () => {
        this.comments = this.comments.filter(c => c.comment_id !== commentId);
        this.snackBar.open('The comment was deleted successfully.', 'Close', { duration: 3000 });
      },
      error: (err) => {
        if (err.error && err.error.message) {
          this.snackBar.open(err.error.message, 'Close', { duration: 5000 });
        } else {
          this.snackBar.open('Delete comment failed. Please try again.', 'Close', { duration: 3000 });
        }
      }
    });
  }
}

  formatDate(date: DateTime): string {
    return new Date(date).toLocaleString();
  }

  formatRole(role: string): string {
    return role ? role.replace(/_/g, ' ') : '';
  }

  formatStatus(status: string): string {
    return status ? status.replace(/_/g, ' ') : '';
  }
}