import { Component, Inject, OnInit } from '@angular/core';
import { FormBuilder, FormGroup, Validators  } from '@angular/forms';
import { MAT_DIALOG_DATA, MatDialogRef } from '@angular/material/dialog';
import { DataService } from '../../data.service';

@Component({
  selector: 'app-user-detail-dialog',
  templateUrl: './users-detail-dialog.component.html',
  styleUrls: ['./users-detail-dialog.component.css']
})
export class UserDetailDialogComponent implements OnInit {
  detail: any;
  loading = true;
  userForm!: FormGroup;
  isEditMode = false;
 
  constructor(
    private dataService: DataService,
    private fb: FormBuilder,
    private dialogRef: MatDialogRef<UserDetailDialogComponent>,
    @Inject(MAT_DIALOG_DATA) public data: { userId: number; isEdit?: boolean }
  ) 
  {
  // 添加公共关闭方法
    this.closeDialog = this.closeDialog.bind(this);
    this.isEditMode = data.isEdit || false;
  }
 
  ngOnInit(): void {
    this.dataService.getUserDetail(this.data.userId).subscribe({
      next: (data) => {
        this.detail = data;
        this.initForm();
        this.loading = false;
      },
      error: (err) => {
        console.error('加载详情失败:', err);
        this.loading = false;
      }
    });
  }
 
  private initForm() {
    this.userForm = this.fb.group({
      name: [this.detail.user.name, Validators.required],
      phone: [this.detail.user.phone],
      email: [this.detail.user.email, [Validators.email]],
      role: [this.detail.user.role, Validators.required],
      balance: [this.detail.user.balance, [
        Validators.required,
        Validators.min(0)
      ]]
    });
  }
 
  saveUser() {
    if (this.userForm.valid) {
      this.dataService.updateUser(this.data.userId, this.userForm.value).subscribe(() => {
        this.dialogRef.close(true);
      });
    }
  }
 
  updateVehicle(vehicle: any) {
    this.dataService.updateVehicle(vehicle.id, vehicle).subscribe();
  }
 
  updateRecord(record: any) {
    this.dataService.updateUsageRecord(record.id, record).subscribe();
  }
 
  updateBooking(booking: any) {
    this.dataService.updateBooking(booking.id, booking).subscribe();
  }

  public closeDialog() {
  this.dialogRef.close();
}
}