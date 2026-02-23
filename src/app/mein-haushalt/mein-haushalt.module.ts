import { NgModule } from '@angular/core';
import { CommonModule } from '@angular/common';
import { MeinHaushaltIndexComponent } from './mein-haushalt-index/mein-haushalt-index.component';
import { MeinHaushaltOverviewComponent } from './mein-haushalt-index/mein-haushalt-overview/mein-haushalt-overview.component';
import { MeinHaushaltRoutingModule } from "./mein-haushalt-routing.module";
import { MatToolbarModule } from "@angular/material/toolbar";
import { MatIconModule } from "@angular/material/icon";
import { CommonSharedModule } from "../shared/common-shared.module";



@NgModule({
  declarations: [
    MeinHaushaltIndexComponent,
    MeinHaushaltOverviewComponent
  ],
    imports: [
        CommonModule,
        MeinHaushaltRoutingModule,
        MatToolbarModule,
        MatIconModule,
        CommonSharedModule
    ]
})
export class MeinHaushaltModule { }
