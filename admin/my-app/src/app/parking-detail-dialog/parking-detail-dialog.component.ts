import { Component, Inject, OnInit } from '@angular/core';
import { MAT_DIALOG_DATA, MatDialogRef } from '@angular/material/dialog';
import { FormBuilder, FormGroup, Validators } from '@angular/forms';
import { 
  ParkingSpaceDetail, 
  ParkingSpaceType, 
  Vehicle, 
  UsageRecord, 
  Booking, 
  DateTime, 
  VehicleViewModel,
  ParkingSpaceDetailViewModel
} from '../../models';
import { MatSnackBar } from '@angular/material/snack-bar';
import { DataService } from '../../data.service';

// 状态枚举映射
interface StatusDisplay {
  [key: string]: string;
}

// 车位类型枚举映射
interface TypeDisplay {
  [key: string]: string;
}

@Component({
  selector: 'app-parking-detail-dialog',
  templateUrl: './parking-detail-dialog.component.html',
  styleUrls: ['./parking-detail-dialog.component.css']
})
export class ParkingDetailDialogComponent implements OnInit {
  parkingForm!: FormGroup;
  parkingDetail: ParkingSpaceDetailViewModel = {
    id: 0,
    type_id: 0,
    status: 'idle',
    vehicle_id: null,
    created_at: '',
    updated_at: '',
    typeDetail: {
      id: 0,
      type: 'normal',
      rate: 0,
      parking_rate: 0,
      overtime_occupancy_rate: 0,
      power: 0
    },
    usageRecords: [],
    bookings: [],
    currentVehicle: null
  };
  loading = false;
  isNewSpace = false; // 是否为新建车位
  isEditMode = false; // 编辑模式标志
  parkingSpaceTypes: ParkingSpaceType[] = []; // 车位类型列表

  // 状态映射
  statusDisplay: StatusDisplay = {
    'idle': '空闲',
    'occupied': '占用中',
    'booked': '已预约'
  };

  // 类型映射
  typeDisplay: TypeDisplay = {
    'fast_charging': '快充车位',
    'slow_charging': '慢充车位',
    'normal': '普通车位'
  };

  constructor(
    private dialogRef: MatDialogRef<ParkingDetailDialogComponent>,
    @Inject(MAT_DIALOG_DATA) public data: { spaceId?: number },
    private fb: FormBuilder,
    private snackBar: MatSnackBar,
    private dataService: DataService
  ) {
    this.isNewSpace = data.spaceId === undefined || data.spaceId === null;
    if (this.isNewSpace) {
      this.parkingDetail = this.getDefaultParkingDetail();
    }
  }

  ngOnInit(): void {
    if (this.isNewSpace) {
      this.initForm();
      this.fetchParkingSpaceTypes();
    } else {
      this.fetchParkingDetail(this.data.spaceId!);
    }
  }

  // 获取默认车位数据（移除冗余字段）
  private getDefaultParkingDetail(): ParkingSpaceDetail {
    return {
      id: 0,
      type_id: 1,
      status: 'idle',
      vehicle_id: null,
      created_at: new Date().toISOString(),
      updated_at: new Date().toISOString(),
      typeDetail: {
        id: 1,
        type: 'normal',
        rate: 2.0,
        parking_rate: 5.0,
        overtime_occupancy_rate: 0.5,
        power: 7.0
      },
      usageRecords: [],
      bookings: [],
      currentVehicle: null
    };
  }

  // 初始化表单
  private initForm(): void {
    this.parkingForm = this.fb.group({
      id: [this.parkingDetail.id],
      type_id: [this.parkingDetail.type_id, Validators.required],
      status: [this.parkingDetail.status, Validators.required],
      vehicle_id: [this.parkingDetail.vehicle_id]
    });
  }

  // 加载车位详情（修正数据映射）
  private fetchParkingDetail(spaceId: number): void {
    this.loading = true;
    this.dataService.getParkingSpaceDetail(spaceId).subscribe({
      next: (response: any) => { // 暂时使用any类型，待后端接口统一
        // 手动映射字段，确保与前端接口一致
        this.parkingDetail = {
        id: response.data.id,
      type_id: response.data.type_id,
      status: response.data.status,
      vehicle_id: response.data.vehicle_id,
      created_at: response.data.created_at,
      updated_at: response.data.updated_at,
      typeDetail: response.data.typeDetail,
      usageRecords: response.data.usageRecords,
      bookings: response.data.bookings,
      currentVehicle: response.data.currentVehicle || null
    };
    this.initForm();
    this.loading = false;
  },
      error: (err) => {
        this.snackBar.open(`加载车位详情失败：${err.error.message}`, '关闭', { duration: 3000 });
        this.loading = false;
      }
    });
  }

  // 获取车位类型列表
  private fetchParkingSpaceTypes(): void {
    this.dataService.getParkingSpaceTypes().subscribe({
      next: (types) => {
        this.parkingSpaceTypes = types;
      },
      error: (err) => {
        console.error('获取车位类型失败:', err);
      }
    });
  }

  // 进入编辑模式
  editSpace(): void {
    this.isEditMode = true;
  }

  // 保存修改
  saveSpace(): void {
    if (this.parkingForm.invalid || this.loading) return;
    
    const formValue = this.parkingForm.value;
    this.dataService.updateParkingSpace(formValue.id, {
      status: formValue.status,
      type_id: formValue.type_id,
      vehicle_id: formValue.vehicle_id
    }).subscribe({
      next: () => {
        this.snackBar.open('车位信息更新成功', '关闭', { duration: 3000 });
        this.dialogRef.close(true);
      },
      error: (err) => {
        this.snackBar.open(`操作失败：${err.error.message}`, '关闭', { duration: 5000 });
      }
    });
  }

  // 取消操作
  cancel(): void {
    this.dialogRef.close(false);
  }

  // 获取状态显示文本
  getStatusDisplay(status: keyof StatusDisplay): string {
    return this.statusDisplay[status];
  }

  // 获取类型显示文本
  getTypeDisplay(type: ParkingSpaceType['type']): string {
    return this.typeDisplay[type] || type;
  }

  // 格式化时间
  formatDate(date: DateTime): string {
    return new Date(date).toLocaleString();
  }
}