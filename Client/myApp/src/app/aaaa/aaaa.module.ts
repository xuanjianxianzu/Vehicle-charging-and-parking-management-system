import { NgModule } from '@angular/core';
import { CommonModule } from '@angular/common';
import { FormsModule } from '@angular/forms';

import { IonicModule } from '@ionic/angular';

import { AaaaPageRoutingModule } from './aaaa-routing.module';

import { AaaaPage } from './aaaa.page';

@NgModule({
  imports: [
    CommonModule,
    FormsModule,
    IonicModule,
    AaaaPageRoutingModule
  ],
  declarations: [AaaaPage]
})
export class AaaaPageModule {}
