import { ComponentFixture, TestBed } from '@angular/core/testing';
import { MyCommentPage } from './my-comment.page';

describe('MyCommentPage', () => {
  let component: MyCommentPage;
  let fixture: ComponentFixture<MyCommentPage>;

  beforeEach(() => {
    fixture = TestBed.createComponent(MyCommentPage);
    component = fixture.componentInstance;
    fixture.detectChanges();
  });

  it('should create', () => {
    expect(component).toBeTruthy();
  });
});
