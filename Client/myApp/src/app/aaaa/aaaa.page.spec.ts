import { ComponentFixture, TestBed } from '@angular/core/testing';
import { AaaaPage } from './aaaa.page';

describe('AaaaPage', () => {
  let component: AaaaPage;
  let fixture: ComponentFixture<AaaaPage>;

  beforeEach(() => {
    fixture = TestBed.createComponent(AaaaPage);
    component = fixture.componentInstance;
    fixture.detectChanges();
  });

  it('should create', () => {
    expect(component).toBeTruthy();
  });
});
