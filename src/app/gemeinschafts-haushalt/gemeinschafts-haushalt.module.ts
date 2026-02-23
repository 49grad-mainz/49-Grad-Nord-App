import { NgModule } from '@angular/core';
import { CommonModule } from '@angular/common';
import { GemeinschaftsHaushaltIndexComponent } from './gemeinschafts-haushalt-index/gemeinschafts-haushalt-index.component';
import { GemeinschaftsHaushaltOverviewComponent } from './gemeinschafts-haushalt-index/gemeinschafts-haushalt-overview/gemeinschafts-haushalt-overview.component';
import { GemeinschaftsHaushaltRoutingModule } from "./gemeinschafts-haushalt-routing.module";
import { MatToolbarModule } from "@angular/material/toolbar";
import { MatIconModule } from "@angular/material/icon";
import { CommonSharedModule } from "../shared/common-shared.module";



@NgModule({
  declarations: [
    GemeinschaftsHaushaltIndexComponent
  ],
  imports: [
    CommonModule,
    GemeinschaftsHaushaltRoutingModule,
    MatToolbarModule,
    MatIconModule,
    CommonSharedModule,
    GemeinschaftsHaushaltOverviewComponent
  ]
})
export class GemeinschaftsHaushaltModule { }
