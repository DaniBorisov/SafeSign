import { NgModule } from '@angular/core';
import { BrowserModule } from '@angular/platform-browser';
import { FormsModule } from '@angular/forms';
import { HttpClientModule } from '@angular/common/http';

import { AppRoutingModule } from './app-routing.module';
import { AppComponent } from './app.component';
import { AddRoadworkComponent } from './add-roadwork/add-roadwork.component';
import { CloseRoadworkComponent } from './close-roadwork/close-roadwork.component';
import { DashboardComponent } from './dashboard/dashboard.component';
import { LogInComponent } from './log-in/log-in.component';
import { StatusComponent } from './status/status.component';

import { WebcamModule } from 'ngx-webcam';
import { NgxScannerQrcodeModule } from 'ngx-scanner-qrcode';

@NgModule({
  declarations: [
    AppComponent,
    AddRoadworkComponent,
    CloseRoadworkComponent,
    DashboardComponent,
    LogInComponent,
    StatusComponent
  ],
  imports: [
    BrowserModule,
    FormsModule,
    AppRoutingModule,
    HttpClientModule,
    WebcamModule,
    NgxScannerQrcodeModule,
  ],
  providers: [],
  bootstrap: [AppComponent]
})
export class AppModule { }
