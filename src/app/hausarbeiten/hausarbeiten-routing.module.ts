import { NgModule } from "@angular/core";
import { RouterModule, Routes } from "@angular/router";
import { HausarbeitenIndexComponent } from "./hausarbeiten-index/hausarbeiten-index.component";
import { UserConfirmedGuard } from "../core/guards/user-confirmed.guard";
import { AuthGuard } from "@angular/fire/auth-guard";
import {
  HausarbeitenOverviewComponent
} from "./hausarbeiten-index/hausarbeiten-overview/hausarbeiten-overview.component";

const routes: Routes = [
  {
    path: '',
    component: HausarbeitenIndexComponent,
    canActivate: [UserConfirmedGuard, AuthGuard],
    children: [
      {
        path: '',
        redirectTo: 'overview',
        pathMatch: 'full',
      },
      {
        path: 'overview',
        component: HausarbeitenOverviewComponent,
      }
    ],
  }
]

@NgModule({
  imports: [RouterModule.forChild(routes)],
  exports: [RouterModule]
})
export class HausarbeitenRoutingModule {
}
