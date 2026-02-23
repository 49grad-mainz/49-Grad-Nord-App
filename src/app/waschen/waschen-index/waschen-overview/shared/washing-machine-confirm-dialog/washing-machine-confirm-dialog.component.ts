import { Component, Inject } from '@angular/core';
import { MAT_DIALOG_DATA, MatDialog } from "@angular/material/dialog";
import { WashingMachineReservationService } from "../../../../services/washing-machine-reservation.service";
import { FormControl } from "@angular/forms";
import { WashingMachineReservation } from "../../washing-calendar-tab-content/washing-calendar-tab-content.component";

@Component({
  selector: 'app-washing-machine-confirm-dialog',
  templateUrl: './washing-machine-confirm-dialog.component.html',
  styleUrls: ['./washing-machine-confirm-dialog.component.scss'],
  standalone: false
})
export class WashingMachineConfirmDialogComponent {
  hours = [1, 2, 3, 4, 5];
  selectedHours = new FormControl<number | string>(2);
  public othersMayRemoveMyClothes = new FormControl(true);

  public commentOptions = [
    '-',
    'Wäsche darf in den Korb gelegt werden, falls fertig',
  ];

  public isEveningReservation = false;

  public selectedComment = '';
  public customComment = '';
  public isMakingReservation = false;

  constructor(
    @Inject(MAT_DIALOG_DATA) public data: {
      machineName: string,
      machineId: string;
      time: number,
      date: Date,
      userId: string
    },
    private dialog: MatDialog,
    private reservationService: WashingMachineReservationService
  ) {
    // Check if this is an evening reservation (21:00 or later)
    this.isEveningReservation = this.data.time >= 21;
  }

  onCommentChange(value: string) {
    if (value !== 'custom') {
      this.customComment = '';
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
        await this.createOvernightReservations(date);
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

  private addHours(date: Date, hours: number): Date {
    const newDate = new Date(date);
    newDate.setHours(newDate.getHours() + hours);
    return newDate;
  }

  private async createSingleReservation(startTime: Date, endTime: Date): Promise<void> {
    const reservation: WashingMachineReservation = {
      type: 'washingMachine',
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

  private async createOvernightReservations(startTime: Date): Promise<void> {
    // Single overnight reservation: from start time until 9:00 next day
    const endTime = new Date(startTime);
    endTime.setDate(endTime.getDate() + 1);
    endTime.setHours(9, 0, 0, 0);

    const overnightReservation: WashingMachineReservation = {
      type: 'washingMachine',
      machineId: this.data.machineId,
      startTime: startTime,
      endTime: endTime,
      user: this.data.userId,
      othersMayRemoveMyClothes: this.othersMayRemoveMyClothes.value ?? false,
      comment: '🌙 Über Nacht Reservierung - ' + (this.selectedComment === 'custom' ? this.customComment : this.selectedComment),
      paid: false,
      isOvernightReservation: true
    };

    await this.reservationService.createReservation(overnightReservation);
  }
}
