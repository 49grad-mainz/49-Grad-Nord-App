import { Component, Inject } from '@angular/core';
import { MAT_DIALOG_DATA, MatDialog } from "@angular/material/dialog";
import { FormControl } from "@angular/forms";
import { DryerReservation } from "../../washing-calendar-tab-content/washing-calendar-tab-content.component";
import { DryerReservationService } from "../../../../services/dryer-reservation.service";

@Component({
  selector: 'app-dryer-confirm-dialog',
  templateUrl: './dryer-confirm-dialog.component.html',
  styleUrls: ['./dryer-confirm-dialog.component.scss'],
  standalone: false
})
export class DryerConfirmDialogComponent {
  hours = [1, 2, 3, 4, 5];
  selectedHours = new FormControl<number | string>(2);
  public othersMayRemoveMyClothes = new FormControl(true);

  // Predefined comment options
  public commentOptions = [
    '-',
    'Wäsche darf in den Korb gelegt werden, falls fertig',
  ];

  public selectedComment = '';
  public customComment = ''; // For user-entered comment
  public isMakingReservation = false;
  public isEveningReservation = false;

  constructor(
    @Inject(MAT_DIALOG_DATA) public data: {
      machineName: string,
      machineId: string;
      time: number,
      date: Date,
      userId: string
    },
    private dialog: MatDialog,
    private reservationService: DryerReservationService
  ) {
    // Check if this is an evening reservation (21:00 or later)
    this.isEveningReservation = this.data.time >= 21;
  }

  onCommentChange(value: string) {
    if (value !== 'custom') {
      this.customComment = ''; // Clear custom comment when predefined option is selected
    }
  }

  onNoClick() {
    this.dialog.closeAll();
  }

  async onReserve() {
    this.isMakingReservation = true;
    const addedHours = this.selectedHours.value;
    const date = new Date(this.data.date);
    date.setHours(this.data.time, 0, 0, 0);

    try {
      // Check if "Über Nacht laufen lassen" is selected
      if (addedHours === 'overnight') {
        await this.createOvernightReservation(date);
      } else {
        const startTime = new Date(date);
        const endTime = this.addHours(startTime, (addedHours as number) ?? 2);
        await this.createSingleReservation(startTime, endTime);
      }

      this.isMakingReservation = false;
      this.dialog.closeAll();
    } catch (error) {
      this.isMakingReservation = false;
    }
  }

  private async createSingleReservation(startTime: Date, endTime: Date): Promise<void> {
    const reservation: DryerReservation = {
      type: 'dryer',
      machineId: this.data.machineId,
      startTime: startTime,
      endTime: endTime,
      user: this.data.userId,
      othersMayRemoveMyClothes: this.othersMayRemoveMyClothes.value ?? false,
      comment: this.selectedComment === 'custom' ? this.customComment : this.selectedComment,
      paid: false
    };

    await this.reservationService.createReservation(reservation);
  }

  private async createOvernightReservation(startTime: Date): Promise<void> {
    // Single overnight reservation: from start time until 9:00 next day
    const endTime = new Date(startTime);
    endTime.setDate(endTime.getDate() + 1);
    endTime.setHours(9, 0, 0, 0);

    const overnightReservation: DryerReservation = {
      type: 'dryer',
      machineId: this.data.machineId,
      startTime: startTime,
      endTime: endTime,
      user: this.data.userId,
      othersMayRemoveMyClothes: this.othersMayRemoveMyClothes.value ?? false,
      comment: '🌙 Über Nacht Trocknung - ' + (this.selectedComment === 'custom' ? this.customComment : this.selectedComment),
      paid: false,
      isOvernightReservation: true
    };

    await this.reservationService.createReservation(overnightReservation);
  }

  private addHours(date: Date, hours: number): Date {
    const newDate = new Date(date);
    newDate.setHours(newDate.getHours() + hours);
    return newDate;
  }
}
