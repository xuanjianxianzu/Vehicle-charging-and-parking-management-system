import { NgModule } from '@angular/core';
import { RouterModule, Routes } from '@angular/router';
import { ParkingComponent } from './parking/parking.component';
import { UsersComponent } from './users/users.component';

const routes: Routes = [
  { path: '', component: ParkingComponent },    // 默认路由
  { path: 'users', component: UsersComponent },
  { path: '**', redirectTo: '' }           // 404重定向
];

@NgModule({
  imports: [RouterModule.forRoot(routes)],
  exports: [RouterModule]
})
export class AppRoutingModule { }