import { NgModule } from '@angular/core';
import { RouterModule, Routes } from '@angular/router';
import { MobilityOverviewComponent } from './components/mobility-overview/mobility-overview.component';
import { AuthGuard } from '../core/guards/auth.guard';

const routes: Routes = [
  {
    path: '',
    component: MobilityOverviewComponent,
    canActivate: [AuthGuard]
  }
];

@NgModule({
  imports: [RouterModule.forChild(routes)],
  exports: [RouterModule]
})
export class MobilityRoutingModule { }
