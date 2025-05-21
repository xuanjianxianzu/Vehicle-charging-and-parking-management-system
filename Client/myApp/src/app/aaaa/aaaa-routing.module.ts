import { NgModule } from '@angular/core';
import { Routes, RouterModule } from '@angular/router';

import { AaaaPage } from './aaaa.page';

const routes: Routes = [
  {
    path: '',
    component: AaaaPage
  }
];

@NgModule({
  imports: [RouterModule.forChild(routes)],
  exports: [RouterModule],
})
export class AaaaPageRoutingModule {}
