import { NgModule } from '@angular/core';
import { CommonModule } from '@angular/common';

import { RouterModule, Routes } from '@angular/router';

import { AddRoadworkComponent } from './add-roadwork/add-roadwork.component';
import { DashboardComponent } from './dashboard/dashboard.component';
import { LogInComponent } from './log-in/log-in.component';
import { StatusComponent } from './status/status.component';
import { CloseRoadworkComponent } from './close-roadwork/close-roadwork.component';

const routes: Routes = [
  {path: 'close-roadwork', component: CloseRoadworkComponent },
  {path: 'add-roadwork', component: AddRoadworkComponent },
  {path: 'dashboard', component: DashboardComponent },
  {path: 'status', component: StatusComponent },
  {path: '', component:LogInComponent }
];

@NgModule({
  declarations: [],
  imports: [
    RouterModule.forRoot(routes),
    CommonModule
  ],
  exports:[RouterModule]
})
export class AppRoutingModule { }
