import { NgModule } from '@angular/core';
import { BrowserModule } from '@angular/platform-browser';
import { RouteReuseStrategy } from '@angular/router';

import { IonicModule, IonicRouteStrategy } from '@ionic/angular';

import { AppComponent } from './app.component';
import { AppRoutingModule } from './app-routing.module';
import { provideHttpClient, withInterceptors } from '@angular/common/http';
import { AuthService } from '../app/auth/auth.service';

import { FormsModule } from '@angular/forms';
import { authInterceptor } from './auth/auth.interceptor';
import { MdUpdatePstComponent } from './md-update-pst/md-update-pst.component';
import { MdUserDetailsComponent } from './md-user-details/md-user-details.component';
import { MdOrderDetailComponent } from './md-order-detail/md-order-detail.component';
import { MdUserDetailComponent } from './md-user-detail/md-user-detail.component';
import { ModalToInfComponent } from './modal-to-inf/modal-to-inf.component';
import { ModalToPicComponent } from './modal-to-pic/modal-to-pic.component';


@NgModule({
  declarations: [
    AppComponent,
    MdUpdatePstComponent,
    MdUserDetailsComponent,
    MdUserDetailComponent,
    MdOrderDetailComponent,
    ModalToInfComponent,
    ModalToPicComponent
  ],
  imports: [BrowserModule, IonicModule.forRoot(), AppRoutingModule, FormsModule],
  providers: [{ provide: RouteReuseStrategy, useClass: IonicRouteStrategy },provideHttpClient(withInterceptors([authInterceptor])),AuthService],
  bootstrap: [AppComponent],
})
export class AppModule {}
