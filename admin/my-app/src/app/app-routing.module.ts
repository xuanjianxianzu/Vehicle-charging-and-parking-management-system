import { NgModule } from '@angular/core';
import { RouterModule, Routes } from '@angular/router';
import { ParkingComponent } from './parking/parking.component';
import { UsersComponent } from './users/users.component';
import { authGuard } from './auth/guards/auth.guard';
import { LoginComponent } from './login/login.component';

const routes: Routes = [
  { path: '', redirectTo: 'login', pathMatch: 'full' },
  { path: 'login', component: LoginComponent },
  { path: 'parking', component: ParkingComponent },
  { path: 'users',canActivate: [authGuard], component: UsersComponent },
  { path: '**', redirectTo: 'login' }  
];



@NgModule({
  imports: [RouterModule.forRoot(routes)],
  exports: [RouterModule]
})
export class AppRoutingModule { }