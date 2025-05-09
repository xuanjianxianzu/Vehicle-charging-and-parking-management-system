import { NgModule } from '@angular/core';
import { RouterModule, Routes } from '@angular/router';
import { ParkingComponent } from './parking/parking.component';
import { UsersComponent } from './users/users.component';

const routes: Routes = [
  { path: '', redirectTo: '/parking', pathMatch: 'full' },
  { path: 'parking', component: ParkingComponent },
  { path: 'users', component: UsersComponent },
  { path: '**', redirectTo: '/parking' }  
];

@NgModule({
  imports: [RouterModule.forRoot(routes)],
  exports: [RouterModule]
})
export class AppRoutingModule { }