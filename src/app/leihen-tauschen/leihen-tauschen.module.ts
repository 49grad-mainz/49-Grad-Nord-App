import { NgModule } from '@angular/core';
import { CommonModule } from '@angular/common';
import { LeihenTauschenIndexComponent } from './leihen-tauschen-index/leihen-tauschen-index.component';
import { LeihenTauschenOverviewComponent } from './leihen-tauschen-index/leihen-tauschen-overview/leihen-tauschen-overview.component';
import { MatToolbarModule } from "@angular/material/toolbar";
import { MatIconModule } from "@angular/material/icon";
import { RouterOutlet } from "@angular/router";
import { LeihenTauschenRoutingModule } from "./leihen-tauschen-routing.module";
import { CommonSharedModule } from "../shared/common-shared.module";




@NgModule({
  declarations: [
    LeihenTauschenIndexComponent,
    LeihenTauschenOverviewComponent
  ],
  imports: [
    CommonModule,
    MatToolbarModule,
    MatIconModule,
    RouterOutlet,
    LeihenTauschenRoutingModule,
    CommonSharedModule
  ]
})
export class LeihenTauschenModule { }
