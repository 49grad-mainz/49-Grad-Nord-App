import { NgModule } from '@angular/core';
import { RouterModule, Routes } from "@angular/router";
import { InventoryIndexComponent } from "./inventory-index/inventory-index.component";
import { InventoryOverviewComponent } from "./inventory-index/inventory-overview/inventory-overview.component";
import { AuthGuard } from "../core/guards/auth.guard";
import { UserConfirmedGuard } from "../core/guards/user-confirmed.guard";

const routes: Routes = [
  {
    path: '',
    component: InventoryIndexComponent,
    children: [
      {
        path: '',
        redirectTo: 'overview',
        pathMatch: 'full',
      },
      {
        path: 'overview',
        component: InventoryOverviewComponent,
        canActivate: [AuthGuard, UserConfirmedGuard],
      },
    ]
  }
]

@NgModule({
  imports: [RouterModule.forChild(routes)],
  exports: [RouterModule],
})
export class InventoryRoutingModule {
  // This module handles the routing for the inventory management section of the application.
  // It defines routes for the inventory index and overview components.
}
