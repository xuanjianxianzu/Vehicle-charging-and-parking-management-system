import { Component, OnInit } from '@angular/core';
import { MatDialog } from '@angular/material/dialog';
import { DataService } from '../../data.service';
import { ParkingDetailDialogComponent } from '../parking-detail-dialog/parking-detail-dialog.component';
import { ParkingSpace } from '../../models';

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
        this.spaces = data.data;
        console.log(this.spaces, data);
        this.loading = false;
      },
      error: (err) => {
        console.error('Failed to load parking spaces:', err);
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

  updateStatus(space: ParkingSpace, newStatus: 'idle' | 'occupied' | 'booked') {
    this.dataService.updateSpace(space.id, { status: newStatus }).subscribe({
      next: () => {
        space.status = newStatus;
        this.loadSpaces();
      },
      error: (err) => {
        console.error('Failed to update status:', err);
      },
    });
  }

  // Type-safe helper method for status updates
  updateStatusFromTemplate(space: ParkingSpace, statusValue: string) {
    const validStatuses: ('idle' | 'occupied' | 'booked')[] = ['idle', 'occupied', 'booked'];
    if (validStatuses.includes(statusValue as any)) {
      this.updateStatus(space, statusValue as 'idle' | 'occupied' | 'booked');
    } else {
      console.error('Invalid status value:', statusValue);
    }
  }

  formatType(type: string): string {
    return type 
      ? type.replace(/_/g, ' ')        // 替换下划线为空格
            .toLowerCase()            // 转为小写
            .replace(/\b\w/g, (l) => l.toUpperCase()) // 每个单词首字母大写
      : '';
  }

  // 格式化状态（同理）
  formatStatus(status: string): string {
    return status 
      ? status.replace(/_/g, ' ')
              .toLowerCase()
              .replace(/\b\w/g, (l) => l.toUpperCase())
      : '';
  }
}