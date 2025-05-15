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

  saveUser(): void {}

  cancel(): void {
    this.dialogRef.close(false);
  }

  editUser(): void {
    this.isEditMode = true;
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