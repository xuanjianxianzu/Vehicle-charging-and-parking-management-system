import { NgModule } from '@angular/core';
import { CommonModule } from '@angular/common';
import { FormsModule } from '@angular/forms';

import { IonicModule } from '@ionic/angular';

import { ToUseSpacePageRoutingModule } from './to-use-space-routing.module';

import { ToUseSpacePage } from './to-use-space.page';

@NgModule({
  imports: [
    CommonModule,
    FormsModule,
    IonicModule,
    ToUseSpacePageRoutingModule
  ],
  declarations: [ToUseSpacePage]
})
export class ToUseSpacePageModule {}
