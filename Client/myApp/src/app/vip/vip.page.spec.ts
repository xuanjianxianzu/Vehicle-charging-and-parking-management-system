import { ComponentFixture, TestBed } from '@angular/core/testing';
import { VIPPage } from './vip.page';

describe('VIPPage', () => {
  let component: VIPPage;
  let fixture: ComponentFixture<VIPPage>;

  beforeEach(() => {
    fixture = TestBed.createComponent(VIPPage);
    component = fixture.componentInstance;
    fixture.detectChanges();
  });

  it('should create', () => {
    expect(component).toBeTruthy();
  });
});
