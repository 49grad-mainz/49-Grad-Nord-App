import { Component, Inject } from '@angular/core';
import { MatButton } from "@angular/material/button";
import { MAT_DIALOG_DATA, MatDialog } from "@angular/material/dialog";
import { DryerReservationService } from "../../../../services/dryer-reservation.service";
import { SnackbarService } from "../../../../../services/snackbar.service";
import { FormControl, ReactiveFormsModule } from '@angular/forms';
import { DryerReservation } from "../../washing-calendar-tab-content/washing-calendar-tab-content.component";
import { DatePipe } from "@angular/common";
import { MatRadioButton, MatRadioGroup } from "@angular/material/radio";
import { MatCheckbox } from "@angular/material/checkbox";
import { MatFormField, MatLabel, MatSuffix } from "@angular/material/form-field";
import { MatDatepicker, MatDatepickerInput, MatDatepickerToggle } from "@angular/material/datepicker";
import { MatOption, MatSelect } from "@angular/material/select";
import { MatInput } from "@angular/material/input";

export interface DryerEditDialogData {
  reservation: DryerReservation;
}

@Component({
    selector: 'app-dryer-edit-dialog',
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
    ],
    templateUrl: './dryer-edit-dialog.component.html',
    styleUrl: './dryer-edit-dialog.component.scss'
})
export class DryerEditDialogComponent {
  public isDeleting = false;
  public isEditing = false;
  public isSaving = false;
  public reservation: DryerReservation;

  // Original values for canceling
  private readonly originalReservation: DryerReservation;

  // Form controls for editing
  public startDateControl = new FormControl(new Date());
  public startTimeControl = new FormControl(6);
  public durationControl = new FormControl<number>(2);
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

  constructor(
    @Inject(MAT_DIALOG_DATA) public data: DryerEditDialogData,
    private dialog: MatDialog,
    private reservationService: DryerReservationService,
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

    const duration = Math.round((this.reservation.endTime.getTime() - this.reservation.startTime.getTime()) / (1000 * 60 * 60));
    this.durationControl.setValue(duration);

    this.othersMayRemoveControl.setValue(this.reservation.othersMayRemoveMyClothes);

    const comment = this.reservation.comment || '';
    if (comment && this.commentOptions.includes(comment)) {
      this.commentTypeControl.setValue(comment);
    } else if (comment) {
      this.commentTypeControl.setValue('custom');
      this.customCommentControl.setValue(comment);
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

      const endTime = new Date(startTime);
      endTime.setHours(endTime.getHours() + selectedDuration);

      const finalComment = this.commentTypeControl.value === 'custom'
        ? (this.customCommentControl.value || '')
        : (this.commentTypeControl.value || '');

      const updatedReservation: DryerReservation = {
        ...this.reservation,
        startTime: startTime,
        endTime: endTime,
        othersMayRemoveMyClothes: this.othersMayRemoveControl.value ?? false,
        comment: finalComment === '-' ? '' : finalComment
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
    const duration = Math.round((this.reservation.endTime.getTime() - this.reservation.startTime.getTime()) / (1000 * 60 * 60));
    return `${duration} Stunden`;
  }
}
