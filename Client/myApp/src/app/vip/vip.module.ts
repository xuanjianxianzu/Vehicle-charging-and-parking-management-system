import { NgModule } from '@angular/core';
import { CommonModule } from '@angular/common';
import { FormsModule } from '@angular/forms';

import { IonicModule } from '@ionic/angular';

import { VIPPageRoutingModule } from './vip-routing.module';

import { VIPPage } from './vip.page';

@NgModule({
  imports: [
    CommonModule,
    FormsModule,
    IonicModule,
    VIPPageRoutingModule
  ],
  declarations: [VIPPage]
})
export class VIPPageModule {}
