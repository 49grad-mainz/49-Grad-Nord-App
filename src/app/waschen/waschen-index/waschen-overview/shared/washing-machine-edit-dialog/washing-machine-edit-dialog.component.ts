import { Component, Inject } from '@angular/core';
import { MAT_DIALOG_DATA, MatDialog } from "@angular/material/dialog";
import { WashingMachineReservationService } from "../../../../services/washing-machine-reservation.service";
import { SnackbarService } from "../../../../../services/snackbar.service";
import { FormControl, ReactiveFormsModule } from '@angular/forms';
import { WashingMachineReservation } from "../../washing-calendar-tab-content/washing-calendar-tab-content.component";
import { MatButton } from "@angular/material/button";
import { DatePipe } from "@angular/common";
import { MatRadioButton, MatRadioGroup } from "@angular/material/radio";
import { MatCheckbox } from "@angular/material/checkbox";
import { MatFormField, MatLabel, MatSuffix } from "@angular/material/form-field";
import { MatDatepicker, MatDatepickerInput, MatDatepickerToggle } from "@angular/material/datepicker";
import { MatOption, MatSelect } from "@angular/material/select";
import { MatInput } from "@angular/material/input";

@Component({
  selector: 'app-washing-machine-edit-dialog',
  templateUrl: './washing-machine-edit-dialog.component.html',
  imports: [
    MatButton,
    DatePipe,
    MatRadioGroup,
    MatRadioButton,
    ReactiveFormsModule,
    MatCheckbox,
    MatFormField,
    MatSuffix,
    MatLabel,
    MatDatepickerInput,
    MatDatepickerToggle,
    MatSelect,
    MatOption,
    MatDatepicker,
    MatInput,
    // Add other imports as needed for the form controls
  ],
  styleUrls: ['./washing-machine-edit-dialog.component.scss']
})
export class WashingMachineEditDialogComponent {
  public isDeleting = false;
  public isEditing = false;
  public isSaving = false;
  public reservation: WashingMachineReservation;

  // Original values for canceling
  private readonly originalReservation: WashingMachineReservation;

  // Form controls for editing
  public startDateControl = new FormControl(new Date());
  public startTimeControl = new FormControl(6);
  public durationControl = new FormControl<number | string>(2);
  public othersMayRemoveControl = new FormControl(false);
  public commentTypeControl = new FormControl('-');
  public customCommentControl = new FormControl('');

  // Options
  public hours = [1, 2, 3, 4];
  public availableTimes = Array.from({length: 18}, (_, i) => i + 6); // 6-23 hours
  public commentOptions = [
    '-',
    'Wäsche darf in den Korb gelegt werden, falls fertig',
  ];
  public readonly minDate = new Date(); // Minimum date is today

  // Computed properties
  public get isOvernightReservation(): boolean {
    return !!this.reservation.isOvernightReservation;
  }

  public get isEveningTime(): boolean {
    const selectedTime = this.startTimeControl.value;
    return selectedTime !== null && selectedTime >= 21;
  }

  public get canShowOvernightOption(): boolean {
    return this.isEveningTime;
  }

  constructor(
    @Inject(MAT_DIALOG_DATA) public data: { reservation: WashingMachineReservation },
    private dialog: MatDialog,
    private reservationService: WashingMachineReservationService,
    private snackBar: SnackbarService
  ) {
    this.reservation = { ...data.reservation };
    this.originalReservation = { ...data.reservation };
    this.initializeFormControls();
  }

  private initializeFormControls() {
    const startDate = new Date(this.reservation.startTime);
    this.startDateControl.setValue(startDate);
    this.startTimeControl.setValue(startDate.getHours());

    // Handle duration based on reservation type
    if (this.reservation.isOvernightReservation) {
      this.durationControl.setValue('overnight');
    } else {
      const duration = Math.round((this.reservation.endTime.getTime() - this.reservation.startTime.getTime()) / (1000 * 60 * 60));
      this.durationControl.setValue(duration);
    }

    this.othersMayRemoveControl.setValue(this.reservation.othersMayRemoveMyClothes);

    // Handle comment - remove overnight prefix if present
    let cleanComment = this.reservation.comment || '';
    if (cleanComment.startsWith('🌙 Über Nacht Reservierung - ')) {
      cleanComment = cleanComment.replace('🌙 Über Nacht Reservierung - ', '');
    }

    if (cleanComment && this.commentOptions.includes(cleanComment)) {
      this.commentTypeControl.setValue(cleanComment);
    } else if (cleanComment) {
      this.commentTypeControl.setValue('custom');
      this.customCommentControl.setValue(cleanComment);
    } else {
      this.commentTypeControl.setValue('-');
    }
  }

  public enableEditing() {
    this.isEditing = true;
  }

  public cancelEditing() {
    this.isEditing = false;
    this.reservation = { ...this.originalReservation };
    this.initializeFormControls();
  }

  public onCommentChange(value: string) {
    if (value !== 'custom') {
      this.customCommentControl.setValue('');
    }
  }

  public onStartTimeChange() {
    // If time changes from evening to non-evening and overnight was selected, reset duration
    if (!this.isEveningTime && this.durationControl.value === 'overnight') {
      this.durationControl.setValue(2);
    }
  }

  public async saveReservation() {
    if (!this.data.reservation.id) {
      alert('Fehler: Keine Reservierungs-ID vorhanden');
      return;
    }

    this.isSaving = true;

    try {
      const selectedDate = this.startDateControl.value;
      const selectedTime = this.startTimeControl.value;
      const selectedDuration = this.durationControl.value;

      if (!selectedDate || selectedTime === null || !selectedDuration) {
        alert('Bitte alle Felder ausfüllen');
        this.isSaving = false;
        return;
      }

      const startTime = new Date(selectedDate);
      startTime.setHours(selectedTime, 0, 0, 0);

      let endTime: Date;
      let finalComment: string;
      let isOvernightReservation = false;

      // Handle overnight vs regular reservation
      if (selectedDuration === 'overnight') {
        // Overnight reservation
        endTime = new Date(startTime);
        endTime.setDate(endTime.getDate() + 1);
        endTime.setHours(9, 0, 0, 0);
        isOvernightReservation = true;

        const baseComment = this.commentTypeControl.value === 'custom'
          ? (this.customCommentControl.value || '')
          : (this.commentTypeControl.value || '');
        finalComment = '🌙 Über Nacht Reservierung - ' + baseComment;
      } else {
        // Regular reservation
        endTime = new Date(startTime);
        endTime.setHours(endTime.getHours() + (selectedDuration as number));
        isOvernightReservation = false;

        finalComment = this.commentTypeControl.value === 'custom'
          ? (this.customCommentControl.value || '')
          : (this.commentTypeControl.value || '');
      }

      const updatedReservation: WashingMachineReservation = {
        ...this.reservation,
        startTime: startTime,
        endTime: endTime,
        othersMayRemoveMyClothes: this.othersMayRemoveControl.value ?? false,
        comment: finalComment === '-' ? '' : finalComment,
        isOvernightReservation: isOvernightReservation
      };

      await this.reservationService.updateReservation(this.data.reservation.id, updatedReservation);
      this.dialog.closeAll();
      this.snackBar.success('Reservierung erfolgreich aktualisiert');
    } catch (error) {
      console.error('Error updating reservation:', error);
      this.isSaving = false;
    }
  }

  public async deleteReservation() {
    if (!this.data.reservation.id) {
      alert('Fehler: Keine Reservierungs-ID vorhanden');
      return;
    }

    this.isDeleting = true;

    try {
      await this.reservationService.deleteReservation(this.data.reservation.id);
      this.dialog.closeAll();
      this.snackBar.success('Reservierung erfolgreich gelöscht');
    } catch (error) {
      alert(`Fehler beim Löschen der Reservierung: ${error}`);
      this.isDeleting = false;
    }
  }

  public getDisplayDuration(): string {
    if (this.isOvernightReservation) {
      return 'Über Nacht (bis 9:00 Uhr am nächsten Tag)';
    } else {
      const duration = Math.round((this.reservation.endTime.getTime() - this.reservation.startTime.getTime()) / (1000 * 60 * 60));
      return `${duration} Stunden`;
    }
  }
}
