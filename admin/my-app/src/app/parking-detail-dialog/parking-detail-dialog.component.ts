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
    currentVehicle: null,
    comments: []
  };
  loading = false;
  isNewSpace = false;
  isEditMode = false;
  parkingSpaceTypes: ParkingSpaceType[] = [];
last: any;

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
      comments: [],
      currentVehicle: null
    };
  }

  private initForm(): void {
    this.parkingForm = this.fb.group({
      id: [this.parkingDetail.id],
      type_id: [this.parkingDetail.type_id, Validators.required],
      status: [this.parkingDetail.status, Validators.required],
      vehicle_id: [this.parkingDetail.vehicle_id]
    });
  }

  private fetchParkingDetail(spaceId: number): void {
    this.loading = true;
    this.dataService.getParkingSpaceDetail(spaceId).subscribe({
      next: (response: any) => {
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
          comments: response.data.comments,
          currentVehicle: response.data.currentVehicle || null
        };
        this.initForm();
        this.loading = false;
      },
      error: (err) => {
        this.snackBar.open(`Failed to load parking details: ${err.error.message}`, 'Close', { duration: 3000 });
        this.loading = false;
      }
    });
  }

  private fetchParkingSpaceTypes(): void {
    this.dataService.getParkingSpaceTypes().subscribe({
      next: (types) => {
        this.parkingSpaceTypes = types;
      },
      error: (err) => {
        console.error('Failed to fetch parking types:', err);
      }
    });
  }

  // 添加删除方法
  deleteUsageRecord(recordId: number): void {
    if (confirm('Confirm delete this usage record?')) {
      this.dataService.deleteUsageRecord(recordId).subscribe({
        next: () => {
          this.parkingDetail.usageRecords = this.parkingDetail.usageRecords.filter(r => r.id !== recordId);
          this.snackBar.open('Usage record deleted successfully', 'Close', { duration: 3000 });
        },
        error: (err) => {
          this.handleDeleteError(err, 'usage record');
        }
      });
    }
  }

  deleteBooking(bookingId: number): void {
    if (confirm('Confirm delete this booking?')) {
      this.dataService.deleteBooking(bookingId).subscribe({
        next: () => {
          this.parkingDetail.bookings = this.parkingDetail.bookings.filter(b => b.id !== bookingId);
          this.snackBar.open('Booking deleted successfully', 'Close', { duration: 3000 });
        },
        error: (err) => {
          this.handleDeleteError(err, 'booking');
        }
      });
    }
  }

  deleteComment(commentId: number): void {
    if (confirm('Confirm delete this comment?')) {
      this.dataService.deleteComment(commentId).subscribe({
        next: () => {
          this.parkingDetail.comments = this.parkingDetail.comments.filter(c => c.comment_id !== commentId);
          this.snackBar.open('Comment deleted successfully', 'Close', { duration: 3000 });
        },
        error: (err) => {
          this.handleDeleteError(err, 'comment');
        }
      });
    }
  }

  // 错误处理公用方法
  private handleDeleteError(err: any, entity: string): void {
    const message = err.error?.message || `Failed to delete ${entity}. Please try again.`;
    this.snackBar.open(message, 'Close', { duration: 5000 });
  }

  editSpace(): void {
    this.isEditMode = true;
  }

  saveSpace(): void {
    if (this.parkingForm.invalid || this.loading) return;
    
    const formValue = this.parkingForm.value;
    this.dataService.updateParkingSpace(formValue.id, {
      status: formValue.status,
      type_id: formValue.type_id,
      vehicle_id: formValue.vehicle_id
    }).subscribe({
      next: () => {
        this.snackBar.open('Parking space updated successfully', 'Close', { duration: 3000 });
        this.dialogRef.close(true);
      },
      error: (err) => {
        this.snackBar.open(`Operation failed: ${err.error.message}`, 'Close', { duration: 5000 });
      }
    });
  }

  cancel(): void {
    this.dialogRef.close(false);
  }

  // Formatting methods
  formatType(type: string): string {
    return type ? type.replace(/_/g, ' ').toLowerCase().replace(/\b\w/g, (l) => l.toUpperCase()) : '';
  }

  formatStatus(status: string): string {
  return status ? status.replace(/_/g, ' ') 
    .toLowerCase() .replace(/\b\w/g, (l) => l.toUpperCase()) : '';
}

  formatDate(date: DateTime): string {
    return new Date(date).toLocaleString('en-US');
  }
}