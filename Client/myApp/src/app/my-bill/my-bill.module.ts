import { NgModule } from '@angular/core';
import { CommonModule } from '@angular/common';
import { FormsModule } from '@angular/forms';

import { IonicModule } from '@ionic/angular';

import { MyBillPageRoutingModule } from './my-bill-routing.module';

import { MyBillPage } from './my-bill.page';

@NgModule({
  imports: [
    CommonModule,
    FormsModule,
    IonicModule,
    MyBillPageRoutingModule
  ],
  declarations: [MyBillPage]
})
export class MyBillPageModule {}
