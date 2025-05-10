import { ComponentFixture, TestBed } from '@angular/core/testing';

import { ParkingDetailDialogComponent } from './parking-detail-dialog.component';

describe('ParkingDetailDialogComponent', () => {
  let component: ParkingDetailDialogComponent;
  let fixture: ComponentFixture<ParkingDetailDialogComponent>;

  beforeEach(async () => {
    await TestBed.configureTestingModule({
      declarations: [ParkingDetailDialogComponent]
    })
    .compileComponents();
    
    fixture = TestBed.createComponent(ParkingDetailDialogComponent);
    component = fixture.componentInstance;
    fixture.detectChanges();
  });

  it('should create', () => {
    expect(component).toBeTruthy();
  });
});
