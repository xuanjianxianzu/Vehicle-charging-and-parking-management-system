import { NgModule } from '@angular/core';
import { Routes, RouterModule } from '@angular/router';

import { ToUseSpacePage } from './to-use-space.page';

const routes: Routes = [
  {
    path: '',
    component: ToUseSpacePage
  }
];

@NgModule({
  imports: [RouterModule.forChild(routes)],
  exports: [RouterModule],
})
export class ToUseSpacePageRoutingModule {}
