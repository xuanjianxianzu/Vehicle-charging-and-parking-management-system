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
  {
    path: 'tab4',
    canActivate: [authGuard],
    loadChildren: () => import('./tab4/tab4.module').then( m => m.Tab4PageModule)
  },
  {
    path: 'personal-information',
    canActivate: [authGuard],
    loadChildren: () => import('./personal-information/personal-information.module').then( m => m.PersonalInformationPageModule)
  },
  {
    path: 'wallet',
    canActivate: [authGuard],
    loadChildren: () => import('./wallet/wallet.module').then( m => m.WalletPageModule)
  },
  {
    path: 'setup',
    canActivate: [authGuard],
    loadChildren: () => import('./setup/setup.module').then( m => m.SetupPageModule)
  },
  {
    path: 'my-comment',
    canActivate: [authGuard],
    loadChildren: () => import('./my-comment/my-comment.module').then( m => m.MyCommentPageModule)
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
