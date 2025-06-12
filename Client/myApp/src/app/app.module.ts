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
import { ModalToInfComponent } from './modal-to-inf/modal-to-inf.component';
import { ModalToPicComponent } from './modal-to-pic/modal-to-pic.component';
import { ReviewModalComponent } from './review-modal/review-modal.component';


@NgModule({
  declarations: [
    AppComponent,
    ModalToInfComponent,
    ModalToPicComponent,
    ReviewModalComponent,
  ],
  imports: [BrowserModule, IonicModule.forRoot(), AppRoutingModule, FormsModule],
  providers: [{ provide: RouteReuseStrategy, useClass: IonicRouteStrategy },provideHttpClient(withInterceptors([authInterceptor])),AuthService],
  bootstrap: [AppComponent],
})
export class AppModule {}
