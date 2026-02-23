import { RouterModule, Routes } from "@angular/router";
import {
  GemeinschaftsHaushaltIndexComponent
} from "./gemeinschafts-haushalt-index/gemeinschafts-haushalt-index.component";
import {
  GemeinschaftsHaushaltOverviewComponent
} from "./gemeinschafts-haushalt-index/gemeinschafts-haushalt-overview/gemeinschafts-haushalt-overview.component";
import { NgModule } from "@angular/core";
import { AuthGuard } from "../core/guards/auth.guard";
import { UserConfirmedGuard } from "../core/guards/user-confirmed.guard";

const routes: Routes = [
  {
    path: '',
    component: GemeinschaftsHaushaltIndexComponent,
    canActivate: [AuthGuard, UserConfirmedGuard],
    children: [
      {
        path: '',
        redirectTo: 'overview',
        pathMatch: 'full',
      },
      {
        path: 'overview',
        component: GemeinschaftsHaushaltOverviewComponent,
      }
    ],
  }
]

@NgModule({
  imports: [RouterModule.forChild(routes)],
  exports: [RouterModule]
})
export class GemeinschaftsHaushaltRoutingModule {
}
