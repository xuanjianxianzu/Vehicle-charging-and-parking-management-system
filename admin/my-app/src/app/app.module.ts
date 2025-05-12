import { NgModule } from '@angular/core';
import { BrowserModule } from '@angular/platform-browser';
import { AppRoutingModule } from './app-routing.module';
import { BrowserAnimationsModule } from '@angular/platform-browser/animations';
import { ParkingComponent } from './parking/parking.component';
import { UsersComponent } from './users/users.component';
import { UserDetailDialogComponent } from './users-detail-dialog/users-detail-dialog.component';
import { ParkingDetailDialogComponent } from './parking-detail-dialog/parking-detail-dialog.component';
import { AppComponent } from './app.component';
import { HttpClientModule, provideHttpClient, withInterceptors } from '@angular/common/http';
import { LoginComponent } from './login/login.component';
import { FormsModule } from '@angular/forms';
import { ReactiveFormsModule } from '@angular/forms';
import { MatSnackBarModule } from '@angular/material/snack-bar';
import { authInterceptor } from './auth/auth.interceptor';
import { MatDialogModule } from '@angular/material/dialog';
import { MatButtonModule } from '@angular/material/button';
import { MatIconModule } from '@angular/material/icon';
import { MatFormFieldModule } from '@angular/material/form-field';
import { MatInputModule } from '@angular/material/input';
import { MatSelectModule } from '@angular/material/select';
import { MatTableModule } from '@angular/material/table';
import { MatPaginatorModule } from '@angular/material/paginator';
import { MatSortModule } from '@angular/material/sort';
import { MatProgressSpinnerModule } from '@angular/material/progress-spinner';
import { MatExpansionModule } from '@angular/material/expansion';
import { MatDatepickerModule } from '@angular/material/datepicker';
import { MatNativeDateModule } from '@angular/material/core';
import { MatTooltipModule } from '@angular/material/tooltip';

@NgModule({
  declarations: [
    AppComponent,
    ParkingComponent,
    UsersComponent,
    ParkingDetailDialogComponent,
    UserDetailDialogComponent,
    LoginComponent,
    
  ],
  imports: [
    BrowserModule,
    BrowserAnimationsModule,
    AppRoutingModule,
    MatTableModule,
    MatDialogModule,
    MatSelectModule,
    MatButtonModule,
    MatProgressSpinnerModule,
    HttpClientModule,
    FormsModule,
    ReactiveFormsModule,
    MatSnackBarModule,
    MatIconModule,
    MatFormFieldModule,
    MatPaginatorModule,
    MatSortModule,
    MatExpansionModule,
    MatDatepickerModule,
    MatNativeDateModule,
    MatInputModule,
    MatTooltipModule,
  ],
  providers: [provideHttpClient(withInterceptors([authInterceptor]))],
  bootstrap: [AppComponent]
})
export class AppModule { }
