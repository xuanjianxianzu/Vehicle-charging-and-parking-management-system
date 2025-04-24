import { ComponentFixture, TestBed } from '@angular/core/testing';
import { MyBillPage } from './my-bill.page';

describe('MyBillPage', () => {
  let component: MyBillPage;
  let fixture: ComponentFixture<MyBillPage>;

  beforeEach(() => {
    fixture = TestBed.createComponent(MyBillPage);
    component = fixture.componentInstance;
    fixture.detectChanges();
  });

  it('should create', () => {
    expect(component).toBeTruthy();
  });
});
