import { Component, Inject, OnInit } from '@angular/core';
import { MAT_DIALOG_DATA, MatDialogRef } from '@angular/material/dialog';
import { FormBuilder, FormGroup, Validators } from '@angular/forms';
import { User, UserDetail, Vehicle, UsageRecord, Booking, Comment } from '../../models';
import { HttpClient } from '@angular/common/http';
import { MatSnackBar } from '@angular/material/snack-bar';
import { DateTime } from '../../models';

interface RoleDisplay {
  [key: string]: string; // 添加索引签名
}

@Component({
  selector: 'app-users-detail-dialog',
  templateUrl: './users-detail-dialog.component.html',
  styleUrls: ['./users-detail-dialog.component.css']
})
export class UserDetailDialogComponent implements OnInit {
  userForm!: FormGroup;
  userDetail: UserDetail = {
    id: 0,
    name: null,
    username: '',
    password: '',
    phone: null,
    email: null,
    role: 'user',
    avatar_number: 0,
    balance: 0,
    created_at: '',
    updated_at: '',
    vehicles: [],
    usageRecords: [],
    bookings: [],
    comments: []
  };
  loading = false;
  isNewUser = false;
  isEditMode = false; // 新增：表示是否处于编辑模式
  emailPattern = '[a-zA-Z0-9._%+-]+@[a-zA-Z0-9.-]+\\.[a-zA-Z]{2,}';
  // 关联数据
  vehicles: Vehicle[] = [];
  usageRecords: UsageRecord[] = [];
  bookings: Booking[] = [];
  comments: Comment[] = [];

  // 枚举映射（用于显示文本转换）
  roleDisplay: RoleDisplay = {
    'user': '普通用户',
    'admin': '管理员',
    'super_admin': '超级管理员'
  };

  vehicleTypeDisplay = {
    'electric': '电动车',
    'fuel': '燃油车'
  };

  constructor(
    private dialogRef: MatDialogRef<UserDetailDialogComponent>,
    @Inject(MAT_DIALOG_DATA) public data: { userId: number },
    private fb: FormBuilder,
    private http: HttpClient,
    private snackBar: MatSnackBar
  ) {
    this.isNewUser = data.userId === null;
    if (this.isNewUser) {
      this.userDetail = this.getDefaultUserDetail();
    }
  }

  ngOnInit(): void {
    if (!this.isNewUser) {
      this.fetchUserDetail();
    } else {
      this.initForm();
    }
  }

  private getDefaultUserDetail(): UserDetail {
    return {
      id: 0,
      name: null,
      username: '',
      password: '',
      phone: null,
      email: null,
      role: 'user',
      avatar_number: 0,
      balance: 0,
      created_at: '',
      updated_at: '',
      vehicles: [],
      usageRecords: [],
      bookings: [],
      comments: []
    };
  }

  // 初始化表单
  private initForm(): void {
    this.userForm = this.fb.group({
      id: [this.userDetail.id],
      name: [this.userDetail.name, Validators.maxLength(50)],
      username: [this.userDetail.username, [Validators.required, Validators.maxLength(50)]],
      password: [this.userDetail.password, Validators.maxLength(255)],
      phone: [this.userDetail.phone, Validators.maxLength(20)],
      email: [this.userDetail.email, [Validators.email, Validators.maxLength(100)]],
      role: [this.userDetail.role, Validators.required],
      avatar_number: [this.userDetail.avatar_number],
      balance: [this.userDetail.balance, Validators.min(0)]
    });
  }

  // 获取用户详情
  private fetchUserDetail(): void {
    this.loading = true;
    this.http.get<UserDetail>(`/api/admin/users/${this.data.userId}`).subscribe({
      next: (response) => {
        this.userDetail = response;
        this.initForm();
        this.bindDataToForm();
        this.bindRelatedData();
        this.loading = false;
      },
      error: (err) => {
        this.snackBar.open('加载失败，请检查用户ID是否存在', '关闭', { duration: 3000 });
        this.userDetail = this.getDefaultUserDetail();
        this.initForm();
        this.loading = false;
      }
    });
  }

  // 绑定基础数据到表单
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

  // 绑定关联数据
  private bindRelatedData(): void {
    this.vehicles = this.userDetail.vehicles || [];
    this.usageRecords = this.userDetail.usageRecords || [];
    this.bookings = this.userDetail.bookings || [];
    this.comments = this.userDetail.comments || [];
  }

  // 保存用户
  saveUser(): void {
    if (this.userForm.invalid || this.loading) return;

    const formValue = this.userForm.value;
    const apiUrl = this.isNewUser ? '/api/admin/users' : `/api/admin/users/${formValue.id}`;
    const method = this.isNewUser ? 'post' : 'put';

    this.http.request<{ code: number; data: User; message: string }>(method, apiUrl, { body: formValue }).subscribe({
      next: () => {
        this.snackBar.open(this.isNewUser? '用户创建成功' : '用户更新成功', '关闭', { duration: 3000 });
        this.dialogRef.close(true);
      },
      error: (err) => {
        this.snackBar.open(`操作失败：${err.error.message}`, '关闭', { duration: 5000 });
      }
    });
  }

  // 取消
  cancel(): void {
    this.dialogRef.close(false);
  }

  // 进入编辑模式
  editUser(): void {
    this.isEditMode = true;
  }

  getRoleDisplay(role: keyof RoleDisplay): string {
    return this.roleDisplay[role];
  }

  formatDate(date: DateTime): string { // 明确使用DateTime类型
    return new Date(date).toLocaleString();
  }

  // 获取车辆类型显示文本
  getVehicleTypeDisplay(type: Vehicle['type']): string {
    return this.vehicleTypeDisplay[type] || type;
  }
}