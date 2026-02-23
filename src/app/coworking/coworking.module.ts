import {NgModule} from '@angular/core';
import {CommonModule} from '@angular/common';
import {CommonSharedModule} from "../shared/common-shared.module";
import {MatIconModule} from "@angular/material/icon";
import {MatToolbarModule} from "@angular/material/toolbar";
import {RouterOutlet} from "@angular/router";
import {CoworkingRoutingModule} from "./coworking-routing.module";
import {CoworkingOverviewComponent} from "./coworking-index/coworking-overview/coworking-overview.component";
import {CoworkingIndexComponent} from "./coworking-index/coworking-index.component";
import {MatCardModule} from "@angular/material/card";
import {MatButtonModule} from "@angular/material/button";
import {MatTab, MatTabGroup, MatTabLabel} from "@angular/material/tabs";
import {
  CoworkingCalendarTabContentComponent
} from "./coworking-index/coworking-overview/coworking-calendar-tab-content/coworking-calendar-tab-content.component";
import {MAT_DATE_LOCALE, MatNativeDateModule} from "@angular/material/core";
import {
  MyCoworkingTableReservationsTabComponent
} from "./coworking-index/coworking-overview/my-coworking-table-reservations-tab/my-coworking-table-reservations-tab.component";


@NgModule({
  declarations: [
    CoworkingIndexComponent,
    CoworkingOverviewComponent
  ],
  imports: [
    CommonModule,
    CommonSharedModule,
    MatIconModule,
    MatToolbarModule,
    RouterOutlet,
    CoworkingRoutingModule,
    MatCardModule,
    MatButtonModule,
    MatTabGroup,
    MatTab,
    MatTabLabel,
    MatNativeDateModule,
    CoworkingCalendarTabContentComponent,
    MyCoworkingTableReservationsTabComponent
  ],
  providers: [
    { provide: MAT_DATE_LOCALE, useValue: 'de-DE' }
  ]
})
export class CoworkingModule {
}
