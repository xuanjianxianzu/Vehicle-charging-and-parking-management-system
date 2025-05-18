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
  // 移除'status'列
  displayedColumns = ['id', 'type','status', 'vehicle', 'user', 'actions']; 
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

  formatType(type: string): string {
    return type 
      ? type.replace(/_/g, ' ')        
            .toLowerCase()            
            .replace(/\b\w/g, (l) => l.toUpperCase()) 
      : '';
  }

}