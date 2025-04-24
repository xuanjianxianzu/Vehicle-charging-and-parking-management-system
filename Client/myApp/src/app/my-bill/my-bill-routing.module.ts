import { NgModule } from '@angular/core';
import { Routes, RouterModule } from '@angular/router';

import { MyBillPage } from './my-bill.page';

const routes: Routes = [
  {
    path: '',
    component: MyBillPage
  }
];

@NgModule({
  imports: [RouterModule.forChild(routes)],
  exports: [RouterModule],
})
export class MyBillPageRoutingModule {}
