import { WaschenIndexComponent } from "./waschen-index/waschen-index.component";
import { WaschenOverviewComponent } from "./waschen-index/waschen-overview/waschen-overview.component";
import { RouterModule, Routes } from "@angular/router";
import { NgModule } from "@angular/core";
import { AuthGuard } from "../core/guards/auth.guard";
import { UserConfirmedGuard } from "../core/guards/user-confirmed.guard";

const routes: Routes = [
  {
    path: '',
    component: WaschenIndexComponent,
    children: [
      {
        path: '',
        redirectTo: 'overview',
        pathMatch: 'full',
      },
      {
        path: 'overview',
        component: WaschenOverviewComponent,
        canActivate: [AuthGuard, UserConfirmedGuard],
      }
    ],
  }
];

@NgModule({
  imports: [RouterModule.forChild(routes)],
  exports: [RouterModule]
})
export class WaschenRoutingModule {
}
