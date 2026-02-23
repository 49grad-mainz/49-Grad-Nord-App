import { NgModule } from '@angular/core';
import { RouterModule, Routes } from "@angular/router";
import { CoworkingIndexComponent } from "./coworking-index/coworking-index.component";
import {
  CoworkingOverviewComponent
} from "./coworking-index/coworking-overview/coworking-overview.component";

const routes: Routes = [
  {
    path: '',
    component: CoworkingIndexComponent,
    children: [
      {
        path: '',
        redirectTo: 'overview',
        pathMatch: 'full',
      },
      {
        path: 'overview',
        component: CoworkingOverviewComponent,
      },
    ]
  }
]

@NgModule({
  imports: [RouterModule.forChild(routes)],
  exports: [RouterModule],
})
export class CoworkingRoutingModule {
}
