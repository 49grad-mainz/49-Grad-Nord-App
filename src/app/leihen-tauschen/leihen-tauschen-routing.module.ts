import { LeihenTauschenIndexComponent } from "./leihen-tauschen-index/leihen-tauschen-index.component";
import {
  LeihenTauschenOverviewComponent
} from "./leihen-tauschen-index/leihen-tauschen-overview/leihen-tauschen-overview.component";
import { RouterModule, Routes } from "@angular/router";
import { NgModule } from "@angular/core";
import { UserConfirmedGuard } from "../core/guards/user-confirmed.guard";
import { AuthGuard } from "@angular/fire/auth-guard";

const routes: Routes = [
  {
    path: '',
    component: LeihenTauschenIndexComponent,
    canActivate: [UserConfirmedGuard, AuthGuard],
    children: [
      {
        path: '',
        redirectTo: 'overview',
        pathMatch: 'full',
      },
      {
        path: 'overview',
        component: LeihenTauschenOverviewComponent,
      }
    ],
  }
]

@NgModule({
  imports: [RouterModule.forChild(routes)],
  exports: [RouterModule]
})
export class LeihenTauschenRoutingModule {
}
