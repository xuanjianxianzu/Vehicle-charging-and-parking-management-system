import { NgModule } from '@angular/core';
import { PreloadAllModules, RouterModule, Routes } from '@angular/router';
import { authGuard } from './auth/guards/auth.guard';
import { authChildGuard } from './auth/guards/auth-child.guard';



const routes: Routes = [
  {
    path: '',
    redirectTo: tokenExists() ? 'tabs' : 'login',
    pathMatch: 'full'
  },
  {
    path: 'login',
    loadChildren: () => import('./login/login.module').then( m => m.LoginPageModule)
  },
  {
    path: 'register',
    loadChildren: () => import('./register/register.module').then( m => m.RegisterPageModule)
  },
  {
    path: 'tabs',
    canActivate: [authGuard],
    canActivateChild: [authChildGuard],
    loadChildren: () => import('./tabs/tabs.module').then( m => m.TabsPageModule)
    
  },
  {
    path: 'add-car',
    canActivate: [authGuard],
    loadChildren: () => import('./add-car/add-car.module').then( m => m.AddCarPageModule)
  },
  {
    path: 'update-car',
    canActivate: [authGuard],
    loadChildren: () => import('./update-car/update-car.module').then( m => m.UpdateCarPageModule)
  },
  {
    path: 'to-use-space/:id',
    canActivate: [authGuard],
    loadChildren: () => import('./to-use-space/to-use-space.module').then( m => m.ToUseSpacePageModule)
  },
  {
    path: 'my-bill',
    canActivate: [authGuard],
    loadChildren: () => import('./my-bill/my-bill.module').then( m => m.MyBillPageModule)
  },

  
];

function tokenExists() {
  return localStorage.getItem('token') !== null;
}

@NgModule({
  imports: [
    RouterModule.forRoot(routes, { preloadingStrategy: PreloadAllModules })
  ],
  exports: [RouterModule]
})
export class AppRoutingModule { }
