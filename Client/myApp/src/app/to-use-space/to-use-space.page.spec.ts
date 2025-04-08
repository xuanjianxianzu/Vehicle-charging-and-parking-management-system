import { ComponentFixture, TestBed } from '@angular/core/testing';
import { ToUseSpacePage } from './to-use-space.page';

describe('ToUseSpacePage', () => {
  let component: ToUseSpacePage;
  let fixture: ComponentFixture<ToUseSpacePage>;

  beforeEach(() => {
    fixture = TestBed.createComponent(ToUseSpacePage);
    component = fixture.componentInstance;
    fixture.detectChanges();
  });

  it('should create', () => {
    expect(component).toBeTruthy();
  });
});
