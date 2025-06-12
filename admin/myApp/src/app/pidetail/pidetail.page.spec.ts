import { ComponentFixture, TestBed } from '@angular/core/testing';
import { PIdetailPage } from './pidetail.page';

describe('PIdetailPage', () => {
  let component: PIdetailPage;
  let fixture: ComponentFixture<PIdetailPage>;

  beforeEach(() => {
    fixture = TestBed.createComponent(PIdetailPage);
    component = fixture.componentInstance;
    fixture.detectChanges();
  });

  it('should create', () => {
    expect(component).toBeTruthy();
  });
});
