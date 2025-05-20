import { NgModule } from '@angular/core';
import { Routes, RouterModule } from '@angular/router';

import { PIdetailPage } from './pidetail.page';

const routes: Routes = [
  {
    path: '',
    component: PIdetailPage
  }
];

@NgModule({
  imports: [RouterModule.forChild(routes)],
  exports: [RouterModule],
})
export class PIdetailPageRoutingModule {}
