import { Component, OnInit } from '@angular/core';
import { MatDialog } from '@angular/material/dialog';
import { DataService } from '../../data.service';
import { ParkingDetailDialogComponent } from '../parking-detail-dialog/parking-detail-dialog.component';

interface ParkingSpace {
  id: number;
  type: string;
  status: string;
  vehicleId?: number;
  licensePlate?: string;
  userName?: string;
  bookingStatus?: string;
}

@Component({
  selector: 'app-parking',
  templateUrl: './parking.component.html',
  styleUrls: ['./parking.component.css'],
})
export class ParkingComponent implements OnInit {
  spaces: ParkingSpace[] = [];
  displayedColumns = ['id', 'type', 'status', 'vehicle', 'user', 'actions'];
  loading = true;

  constructor(
    private dataService: DataService,
    private dialog: MatDialog
  ) {}

  ngOnInit(): void {
    this.loadSpaces();
  }

  loadSpaces() {
    this.dataService.getSpaces().subscribe({
      next: (data) => {
        this.spaces = data;
        this.loading = false;
      },
      error: (err) => {
        console.error('加载车位失败:', err);
        this.loading = false;
      },
    });
  }

  openDetail(spaceId: number) {
    this.dialog.open(ParkingDetailDialogComponent, {
      data: { spaceId },
      width: '80vw',
      maxHeight: '90vh',
    });
  }

  updateStatus(space: ParkingSpace, newStatus: string) {
    this.dataService.updateSpace(space.id, { status: newStatus }).subscribe({
      next: () => {
        space.status = newStatus;
        // 更新本地状态（可根据需要优化）
        this.loadSpaces();
      },
      error: (err) => {
        console.error('更新状态失败:', err);
      },
    });
  }
}
