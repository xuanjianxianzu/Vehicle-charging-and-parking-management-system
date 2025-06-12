import { NgModule } from '@angular/core';
import { Routes, RouterModule } from '@angular/router';

import { VIPPage } from './vip.page';

const routes: Routes = [
  {
    path: '',
    component: VIPPage
  }
];

@NgModule({
  imports: [RouterModule.forChild(routes)],
  exports: [RouterModule],
})
export class VIPPageRoutingModule {}
