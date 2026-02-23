import { RouterModule, Routes } from "@angular/router";
import { MeinHaushaltIndexComponent } from "./mein-haushalt-index/mein-haushalt-index.component";
import {
  MeinHaushaltOverviewComponent
} from "./mein-haushalt-index/mein-haushalt-overview/mein-haushalt-overview.component";
import { NgModule } from "@angular/core";

const routes: Routes = [
  {
    path: '',
    component: MeinHaushaltIndexComponent,
    children: [
      {
        path: '',
        redirectTo: 'overview',
        pathMatch: 'full',
      },
      {
        path: 'overview',
        component: MeinHaushaltOverviewComponent,
      }
    ],
  }
]

@NgModule({
  imports: [RouterModule.forChild(routes)],
  exports: [RouterModule]
})
export class MeinHaushaltRoutingModule { }
