import { NgModule } from '@angular/core';
import { BrowserModule } from '@angular/platform-browser';
import { AppRoutingModule } from './app-routing.module';
import { BrowserAnimationsModule } from '@angular/platform-browser/animations';
import { MatTableModule } from '@angular/material/table';
import { MatDialogModule } from '@angular/material/dialog';
import { MatSelectModule } from '@angular/material/select';
import { MatButtonModule } from '@angular/material/button';
import { MatProgressSpinnerModule } from '@angular/material/progress-spinner';
import { ParkingComponent } from './parking/parking.component';
import { UsersComponent } from './users/users.component';
import { ParkingDetailDialogComponent } from './parking/parking-detail-dialog/parking-detail-dialog.component';
import { AppComponent } from './app.component';
import { HttpClientModule } from '@angular/common/http'; // 添加这行
@NgModule({
  declarations: [
    AppComponent,
    ParkingComponent,
    UsersComponent,
    ParkingDetailDialogComponent
  ],
  imports: [
    BrowserModule,
    AppRoutingModule,
    BrowserAnimationsModule,
    MatTableModule,
    MatDialogModule,
    MatSelectModule,
    MatButtonModule,
    MatProgressSpinnerModule,
    HttpClientModule,
  ],
  providers: [],
  bootstrap: [AppComponent]
})
export class AppModule { }
