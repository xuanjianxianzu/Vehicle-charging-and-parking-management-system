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


@NgModule({
  declarations: [
    AppComponent,
    MdUpdatePstComponent
  ],
  imports: [BrowserModule, IonicModule.forRoot(), AppRoutingModule, FormsModule],
  providers: [{ provide: RouteReuseStrategy, useClass: IonicRouteStrategy },provideHttpClient(withInterceptors([authInterceptor])),AuthService],
  bootstrap: [AppComponent],
})
export class AppModule {}
