import { NgModule } from "@angular/core";
import { CommonModule, NgOptimizedImage } from "@angular/common";
import { WaschenIndexComponent } from './waschen-index/waschen-index.component';
import { WaschenOverviewComponent } from './waschen-index/waschen-overview/waschen-overview.component';
import { WaschenRoutingModule } from "./waschen-routing.module";
import { CommonSharedModule } from "../shared/common-shared.module";
import { MatIconModule } from "@angular/material/icon";
import { MatToolbarModule } from "@angular/material/toolbar";
import { MatTabsModule } from "@angular/material/tabs";
import {
  WashingCalendarTabContentComponent
} from './waschen-index/waschen-overview/washing-calendar-tab-content/washing-calendar-tab-content.component';
import { MatInputModule } from "@angular/material/input";
import { MatDatepickerModule } from "@angular/material/datepicker";
import { MAT_DATE_LOCALE, MatNativeDateModule } from "@angular/material/core";
import {
  MyReservationsTabComponent
} from './waschen-index/waschen-overview/my-reservations-tab/my-reservations-tab.component';
import { MatTableModule } from "@angular/material/table";
import { MatMenuModule } from "@angular/material/menu";
import { MatButtonModule } from "@angular/material/button";
import { MatSelectModule } from "@angular/material/select";

import {
  CommentDialogComponent
} from './waschen-index/waschen-overview/shared/comment-dialog/comment-dialog.component';
import { FormsModule, ReactiveFormsModule } from "@angular/forms";
import { MatCheckboxModule } from "@angular/material/checkbox";
import { MatChipsModule } from "@angular/material/chips";
import {
  DryerConfirmDialogComponent
} from "./waschen-index/waschen-overview/shared/dryer-confirm-dialog/dryer-confirm-dialog.component";
import {
  WashingMachineConfirmDialogComponent
} from "./waschen-index/waschen-overview/shared/washing-machine-confirm-dialog/washing-machine-confirm-dialog.component";
import { MatTooltipModule } from "@angular/material/tooltip";
import {
  WashDrySummaryTabComponent
} from './waschen-index/waschen-overview/wash-dry-summary-tab/wash-dry-summary-tab.component';
import { MatProgressSpinner } from "@angular/material/progress-spinner";
import { MatRadioButton, MatRadioGroup } from "@angular/material/radio";
import { MatDivider } from "@angular/material/divider";
import { MatSlideToggleModule } from "@angular/material/slide-toggle";

@NgModule({
  declarations: [
    WaschenIndexComponent,
    WaschenOverviewComponent,
    WashingCalendarTabContentComponent,
    MyReservationsTabComponent,
    WashingMachineConfirmDialogComponent,
    DryerConfirmDialogComponent,
    CommentDialogComponent,
    WashDrySummaryTabComponent
  ],
  imports: [
    CommonModule,
    WaschenRoutingModule,
    CommonSharedModule,
    MatIconModule,
    MatToolbarModule,
    MatTabsModule,
    MatInputModule,
    MatDatepickerModule,
    MatNativeDateModule,
    MatTableModule,
    MatMenuModule,
    MatButtonModule,
    MatSelectModule,
    ReactiveFormsModule,
    MatCheckboxModule,
    MatChipsModule,
    MatTooltipModule,
    NgOptimizedImage,
    MatProgressSpinner,
    MatRadioGroup,
    MatRadioButton,
    MatDivider,
    MatSlideToggleModule,
    FormsModule,
  ],
  providers: [
    { provide: MAT_DATE_LOCALE, useValue: 'de-DE' }
  ]
})
export class WaschenModule {
}
