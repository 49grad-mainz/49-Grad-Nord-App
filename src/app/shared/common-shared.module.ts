import { NgModule } from '@angular/core';
import { CommonModule } from '@angular/common';
import { CommonSearchInputComponent } from "./common-search-input/common-search-input.component";
import { FormsModule, ReactiveFormsModule } from "@angular/forms";
import { MatAutocompleteModule } from "@angular/material/autocomplete";
import { MatInputModule } from "@angular/material/input";
import { ChildRouterPaddingDirective } from './child-router-padding.directive';
import { FromToTimePickerComponent } from "./from-to-time-picker/from-to-time-picker.component";
import { MatDialogActions, MatDialogContent, MatDialogTitle } from "@angular/material/dialog";
import { MatDatepicker, MatDatepickerInput, MatDatepickerToggle } from "@angular/material/datepicker";

import { MatButton } from "@angular/material/button";
import { MatIcon } from "@angular/material/icon";
import { ConfirmationDialogComponent } from "./confirmation-dialog/confirmation-dialog.component";
import { MatTimepicker, MatTimepickerInput, MatTimepickerToggle } from "@angular/material/timepicker";
import { MatButtonToggle, MatButtonToggleGroup } from "@angular/material/button-toggle";
import { ReservationDetailDialogComponent } from "./reservation-detail-dialog/reservation-detail-dialog.component";
import { FirstNamePipe } from './first-name.pipe';


@NgModule({
  declarations: [
    CommonSearchInputComponent,
    ChildRouterPaddingDirective,
    FromToTimePickerComponent,
    ConfirmationDialogComponent,
    ReservationDetailDialogComponent // ← NEU
  ],
  imports: [
    CommonModule,
    ReactiveFormsModule,
    MatAutocompleteModule,
    MatInputModule,
    MatDialogTitle,
    MatDialogContent,
    MatDatepickerToggle,

    MatDialogActions,
    MatButton,

    MatIcon,
    MatDatepicker,
    MatDatepickerInput,
    MatTimepickerToggle,
    MatTimepicker,
    MatTimepickerInput,
    MatButtonToggle,
    MatButtonToggleGroup,
    FormsModule,
    FirstNamePipe
  ],
  exports: [
    CommonSearchInputComponent,
    ChildRouterPaddingDirective,
    FromToTimePickerComponent,
    ConfirmationDialogComponent,
    ReservationDetailDialogComponent, // ← NEU
    FirstNamePipe
  ]
})
export class CommonSharedModule {
}
