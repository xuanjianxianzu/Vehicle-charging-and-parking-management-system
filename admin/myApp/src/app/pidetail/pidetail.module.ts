import { NgModule } from '@angular/core';
import { CommonModule } from '@angular/common';
import { FormsModule } from '@angular/forms';

import { IonicModule } from '@ionic/angular';

import { PIdetailPageRoutingModule } from './pidetail-routing.module';

import { PIdetailPage } from './pidetail.page';

@NgModule({
  imports: [
    CommonModule,
    FormsModule,
    IonicModule,
    PIdetailPageRoutingModule
  ],
  declarations: [PIdetailPage]
})
export class PIdetailPageModule {}
