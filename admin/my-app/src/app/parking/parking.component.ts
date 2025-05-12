import { Component, OnInit } from '@angular/core';
import { MatDialog } from '@angular/material/dialog';
import { DataService } from '../../data.service';
import { ParkingDetailDialogComponent } from '../parking-detail-dialog/parking-detail-dialog.component';
import { ParkingSpace, SpaceStatus, ParkingSpaceType } from '../../models'; // 导入枚举和类型

@Component({
  selector: 'app-parking',
  templateUrl: './parking.component.html',
  styleUrls: ['./parking.component.css'],
})
export class ParkingComponent implements OnInit {
  spaces: ParkingSpace[] = [];
  displayedColumns = ['id', 'type', 'status', 'vehicle', 'user', 'actions'];
  loading = true;


  openDetail(spaceId: number): void {
  this.dialog.open(ParkingDetailDialogComponent, {
    data: { spaceId },
    width: '80vw',
    maxHeight: '90vh',
  });
}
  
  // 暴露枚举到模板
  statusEnum = SpaceStatus;
  
  // 车位类型映射（用于显示类型文本）
  spaceTypeMap: { [key: number]: string } = {
    1: '快充',
    2: '慢充',
    3: '普通'
  };

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
        // 确保数据中的状态转换为枚举类型
        this.spaces = data.data.map((space: ParkingSpace) => ({
          ...space,
          status: this.convertToSpaceStatus(space.status)
        }));
        this.loading = false;
      },
      error: (err) => {
        console.error('加载车位失败:', err);
        this.loading = false;
      },
    });
  }

  // 获取车位类型文本
  getSpaceTypeText(typeId: number): string {
    return this.spaceTypeMap[typeId] || '未知类型';
  }

  // 更新状态方法（参数类型改为SpaceStatus）
  updateStatus(space: ParkingSpace, newStatus: SpaceStatus) {
    this.dataService.updateSpace(space.id, { status: newStatus }).subscribe({
      next: () => {
        // 更新成功后刷新列表或显示提示
        this.loadSpaces();
        this.showSuccessMessage('状态更新成功');
      },
      error: (err) => {
        console.error('更新状态失败:', err);
        this.showErrorMessage('状态更新失败');
      },
    });
  }

  // 辅助方法：将字符串转换为SpaceStatus枚举
  private convertToSpaceStatus(status: string): SpaceStatus {
    switch (status) {
      case 'idle': return SpaceStatus.IDLE;
      case 'occupied': return SpaceStatus.OCCUPIED;
      case 'booked': return SpaceStatus.BOOKED;
      default: 
        console.warn(`未知状态: ${status}，默认转换为idle`);
        return SpaceStatus.IDLE;
    }
  }

  // 显示消息提示（需要注入MatSnackBar）
  private showSuccessMessage(message: string) {
    // this.snackBar.open(message, '关闭', { duration: 3000 });
  }

  private showErrorMessage(message: string) {
    // this.snackBar.open(message, '关闭', { duration: 3000, panelClass: 'error-snackbar' });
  }
}