import { Component, Inject, OnInit } from '@angular/core';
import { FormBuilder, FormGroup, Validators } from '@angular/forms';
import { MAT_DIALOG_DATA, MatDialogRef } from '@angular/material/dialog';
import { MobilityResource } from '../../services/mobility-resource.service';
import { MobilityReservationService, MobilityReservation } from '../../services/mobility-reservation.service';
import { MatSnackBar } from '@angular/material/snack-bar';

export interface MobilityBookingDialogData {
  resource: MobilityResource;
  userId: string;
  reservation?: MobilityReservation;
}

@Component({
  selector: 'app-mobility-booking-dialog',
  templateUrl: './mobility-booking-dialog.component.html',
  styleUrls: ['./mobility-booking-dialog.component.scss'],
  standalone: false
})
export class MobilityBookingDialogComponent implements OnInit {
  form: FormGroup;
  timeOptions: string[] = [];
  isEditMode = false;

  constructor(
    private fb: FormBuilder,
    private dialogRef: MatDialogRef<MobilityBookingDialogComponent>,
    @Inject(MAT_DIALOG_DATA) public data: MobilityBookingDialogData,
    private reservationService: MobilityReservationService,
    private snackBar: MatSnackBar
  ) {
    this.form = this.fb.group({
      startDate: [new Date(), Validators.required],
      startTime: [new Date(), Validators.required],
      endDate: [new Date(), Validators.required],
      endTime: [new Date(), Validators.required],
      comment: ['']
    });

    // timeOptions no longer needed
  }

  ngOnInit(): void {
    if (this.data.reservation) {
      this.isEditMode = true;
      const res = this.data.reservation;

      this.form.patchValue({
        startDate: res.startTime,
        startTime: res.startTime, // Pass Date object
        endDate: res.endTime,
        endTime: res.endTime,     // Pass Date object
        comment: res.comment
      });
    } else {
      // Pre-select next full hour
      const now = new Date();
      now.setMinutes(0, 0, 0);
      now.setHours(now.getHours() + 1);

      const end = new Date(now.getTime() + 2 * 60 * 60 * 1000); // +2h default

      this.form.patchValue({
        startDate: now,
        startTime: now,
        endDate: end, // Changed from 'now' to 'end'
        endTime: end
      });
    }
  }

  generateTimeOptions() {
    // No longer needed
  }

  async quickBook(hours: number) {
    const now = new Date();

    // No rounding as per user request
    now.setSeconds(0, 0);

    const end = new Date(now.getTime() + hours * 60 * 60 * 1000);

    try {
      await this.reservationService.createReservation({
        resourceId: this.data.resource.id,
        userId: this.data.userId,
        startTime: now,
        endTime: end,
        comment: ``
      });
      this.dialogRef.close(true);
    } catch (e: any) {
      this.snackBar.open(e.message || 'Fehler beim Reservieren', 'OK', { duration: 3000 });
    }
  }

  dateToTimeString(date: Date): string {
    return `${date.getHours().toString().padStart(2, '0')}:${date.getMinutes().toString().padStart(2, '0')}`;
  }

  async submit() {
    if (this.form.invalid) return;

    const { startDate, startTime, endDate, endTime, comment } = this.form.value;

    // Start Time
    const start = new Date(startDate);
    if (startTime instanceof Date) {
      start.setHours(startTime.getHours(), startTime.getMinutes(), 0, 0);
    }

    // End Time
    const end = new Date(endDate);
    if (endTime instanceof Date) {
      end.setHours(endTime.getHours(), endTime.getMinutes(), 0, 0);
    }

    if (end <= start) {
      this.snackBar.open('Enddatum muss nach Startdatum liegen', 'OK', { duration: 3000 });
      return;
    }

    try {
      if (this.isEditMode && this.data.reservation) {
        await this.reservationService.updateReservation({
          ...this.data.reservation,
          startTime: start,
          endTime: end,
          comment: comment
        });
        this.snackBar.open('Reservierung aktualisiert!', 'OK', { duration: 3000 });
      } else {
        await this.reservationService.createReservation({
          resourceId: this.data.resource.id,
          userId: this.data.userId,
          startTime: start,
          endTime: end,
          comment: comment
        });
        this.snackBar.open('Reservierung erstellt!', 'OK', { duration: 3000 });
      }
      this.dialogRef.close(true);
    } catch (e: any) {
      this.snackBar.open(e.message || 'Fehler beim Speichern', 'OK', { duration: 3000 });
    }
  }

  cancel() {
    this.dialogRef.close(false);
  }
}
