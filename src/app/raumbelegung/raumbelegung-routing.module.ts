import { NgModule } from '@angular/core';
import { RouterModule, Routes } from "@angular/router";
import { RaumbelegungIndexComponent } from "./raumbelegung-index/raumbelegung-index.component";
import {
  RaumbelegungOverviewComponent
} from "./raumbelegung-index/raumbelegung-overview/raumbelegung-overview.component";
import { AuthGuard } from "../core/guards/auth.guard";
import { UserConfirmedGuard } from "../core/guards/user-confirmed.guard";

const routes: Routes = [
  {
    path: '',
    component: RaumbelegungIndexComponent,
    children: [
      {
        path: '',
        redirectTo: 'overview',
        pathMatch: 'full',
      },
      {
        path: 'overview',
        component: RaumbelegungOverviewComponent,
        canActivate: [AuthGuard, UserConfirmedGuard],
      },
    ]
  }
]

@NgModule({
  imports: [RouterModule.forChild(routes)],
  exports: [RouterModule],
})
export class RaumbelegungRoutingModule {
}
