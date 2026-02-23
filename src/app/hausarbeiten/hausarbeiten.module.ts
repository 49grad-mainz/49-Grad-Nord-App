import { NgModule } from "@angular/core";
import { CommonModule } from "@angular/common";
import { HausarbeitenRoutingModule } from "./hausarbeiten-routing.module";
import { HausarbeitenIndexComponent } from "./hausarbeiten-index/hausarbeiten-index.component";
import {
  HausarbeitenOverviewComponent
} from "./hausarbeiten-index/hausarbeiten-overview/hausarbeiten-overview.component";
import { MatToolbarModule } from "@angular/material/toolbar";
import { MatIconModule } from "@angular/material/icon";
import { CommonSharedModule } from "../shared/common-shared.module";

@NgModule({
  declarations: [
    HausarbeitenIndexComponent,
      ],
  imports: [
    CommonModule,
    HausarbeitenRoutingModule,
    MatToolbarModule,
    MatIconModule,
    CommonSharedModule
  ],
})
export class HausarbeitenModule {}
