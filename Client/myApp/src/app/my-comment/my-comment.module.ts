import { NgModule } from '@angular/core';
import { CommonModule } from '@angular/common';
import { FormsModule } from '@angular/forms';

import { IonicModule } from '@ionic/angular';

import { MyCommentPageRoutingModule } from './my-comment-routing.module';

import { MyCommentPage } from './my-comment.page';

@NgModule({
  imports: [
    CommonModule,
    FormsModule,
    IonicModule,
    MyCommentPageRoutingModule
  ],
  declarations: [MyCommentPage]
})
export class MyCommentPageModule {}
