import { Component, Inject, OnInit } from '@angular/core';
import { MAT_DIALOG_DATA } from '@angular/material/dialog';
import { DataService } from '../../data.service';

interface SpaceDetail {
  space: any;
  history: any[];
}

@Component({
  selector: 'app-parking-detail-dialog',
  templateUrl: './parking-detail-dialog.component.html',
  styleUrls: ['./parking-detail-dialog.component.css'],
})
export class ParkingDetailDialogComponent implements OnInit {
  detail: SpaceDetail | undefined;
  loading = true;

  constructor(
    private dataService: DataService,
    @Inject(MAT_DIALOG_DATA) public data: { spaceId: number }
  ) {}

  ngOnInit(): void {
    this.dataService.getSpaceDetails(this.data.spaceId).subscribe({
      next: (data) => {
        this.detail = data;
        this.loading = false;
      },
      error: (err) => {
        console.error('加载详情失败:', err);
        this.loading = false;
      },
    });
  }
}
