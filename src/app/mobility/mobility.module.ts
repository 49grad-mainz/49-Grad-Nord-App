import { NgModule } from '@angular/core';
import { CommonModule } from '@angular/common';
import { CommonSharedModule } from '../shared/common-shared.module';

import { MobilityRoutingModule } from './mobility-routing.module';
import { MobilityDashboardCardComponent } from './components/mobility-dashboard-card/mobility-dashboard-card.component';
import { MobilityBookingDialogComponent } from './components/mobility-booking-dialog/mobility-booking-dialog.component';

import { MatIconModule } from '@angular/material/icon';
import { MatButtonModule } from '@angular/material/button';
import { MatCardModule } from '@angular/material/card';
import { MatTooltipModule } from '@angular/material/tooltip';
import { MatDialogModule } from '@angular/material/dialog';
import { MatInputModule } from '@angular/material/input';
import { MatFormFieldModule } from '@angular/material/form-field';
import { MatSelectModule } from '@angular/material/select';
import { MatDatepickerModule } from '@angular/material/datepicker';
import { MatNativeDateModule } from '@angular/material/core';
import { MatTimepickerModule } from '@angular/material/timepicker';
import { MatSnackBarModule } from '@angular/material/snack-bar';
import { MatSlideToggleModule } from '@angular/material/slide-toggle';
import { ReactiveFormsModule, FormsModule } from '@angular/forms';

import { MobilityOverviewComponent } from './components/mobility-overview/mobility-overview.component';
import { MobilityReservationDetailsComponent } from './components/mobility-reservation-details/mobility-reservation-details.component';
import { MobilityUserReservationsComponent } from './components/mobility-user-reservations/mobility-user-reservations.component';

@NgModule({
  declarations: [
    MobilityDashboardCardComponent,
    MobilityBookingDialogComponent,
    MobilityOverviewComponent,
    MobilityReservationDetailsComponent
  ],
  imports: [
    CommonModule,
    MobilityRoutingModule,
    MobilityUserReservationsComponent,
    CommonSharedModule,

    // Material
    MatIconModule,
    MatButtonModule,
    MatCardModule,
    MatTooltipModule,
    MatDialogModule,
    MatInputModule,
    MatFormFieldModule,
    MatSelectModule,
    MatDatepickerModule,
    MatNativeDateModule,
    MatTimepickerModule,
    MatSnackBarModule,
    MatSlideToggleModule,

    MatSlideToggleModule,
    ReactiveFormsModule,
    FormsModule
  ],
  exports: [
    MobilityDashboardCardComponent
  ]
})
export class MobilityModule { }
