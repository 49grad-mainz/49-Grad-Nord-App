import { Component, Inject } from '@angular/core';
import { MAT_DIALOG_DATA, MatDialog } from "@angular/material/dialog";
import {FormControl, ReactiveFormsModule} from "@angular/forms";
import {
  CoworkingTableReservation,
  CoworkingTableReservationService
} from "../../../../services/coworking-table-reservation.service";
import {MatFormField, MatLabel} from "@angular/material/form-field";
import {MatOption, MatSelect} from "@angular/material/select";
import {MatInput} from "@angular/material/input";
import { DatePipe } from "@angular/common";
import {MatButton} from "@angular/material/button";
import {MatIcon} from "@angular/material/icon";

@Component({
  selector: 'app-coworking-table-confirm-dialog',
  templateUrl: './coworking-table-confirm-dialog.component.html',
  imports: [
    MatFormField,
    MatSelect,
    MatOption,
    ReactiveFormsModule,
    MatInput,
    DatePipe,
    MatButton,
    MatLabel,
    MatIcon
  ],
  styleUrls: ['./coworking-table-confirm-dialog.component.scss']
})
export class CoworkingTableConfirmDialogComponent {
  hours = [1, 2, 3, 4, 5, 6, 7, 8];
  nightHours = [22, 23, 0, 1, 2, 3, 4, 5]; // 22:00 bis 05:00 Uhr
  dayHours = Array.from({length: 18}, (_, i) => i + 6); // 6-23 Uhr

  selectedHours = new FormControl(2);
  selectedTable = new FormControl('');
  selectedStartTime = new FormControl(0);

  public comment = new FormControl('');
  public isMakingReservation = false;

  constructor(
    @Inject(MAT_DIALOG_DATA) public data: {
      tableName: string,
      tableId?: string;
      time?: number,
      date?: Date,
      userId?: string,
      isNightReservation?: boolean,
      availableTables?: any[],
      isDeleteMode?: boolean,
      reservation?: any
    },
    private dialog: MatDialog,
    private reservationService: CoworkingTableReservationService
  ) {
    // Initialize with provided values
    if (!this.isDeleteMode) {
      this.selectedTable.setValue(this.data.tableId || '');
      this.selectedStartTime.setValue(this.data.time || 0);
    }
  }

  get isNightMode(): boolean {
    return this.data.isNightReservation === true;
  }

  get isDeleteMode(): boolean {
    return this.data.isDeleteMode === true;
  }

  get availableStartTimes(): number[] {
    return this.isNightMode ? this.nightHours : [];
  }

  get selectedTableName(): string {
    if (!this.data.availableTables) return this.data.tableName;
    const table = this.data.availableTables.find(t => t.id === this.selectedTable.value);
    return table ? table.name : this.data.tableName;
  }

  onNoClick() {
    // close dialog
    this.dialog.closeAll();
  }

  onReserve() {
    this.isMakingReservation = true;
    const addedHours = this.selectedHours.value;
    const startTime = this.isNightMode ? this.selectedStartTime.value : this.data.time;
    const tableId = this.isNightMode ? this.selectedTable.value : this.data.tableId;

    // Create a new Date object from the provided date
    const date = new Date(this.data.date!);
    date.setHours(startTime ?? 0, 0, 0, 0); // Set the time part

    const start = new Date(date); // Create the start time
    const end = this.addHours(start, addedHours ?? 2); // Create the end time

    const reservation: CoworkingTableReservation = {
      type: 'coworkingTable',
      tableId: tableId ?? this.data.tableId!,
      startTime: start,
      endTime: end,
      user: this.data.userId!,
      comment: this.comment.value ?? '',
    };

    this.reservationService.createReservation(reservation).then(() => {
      this.isMakingReservation = false;
      this.dialog.closeAll();
    }).catch(() => {
      this.isMakingReservation = false;
    });
  }

  onDelete() {
    if (!this.data.reservation?.id) return;

    this.isMakingReservation = true;
    this.reservationService.deleteReservation(this.data.reservation.id).then(() => {
      this.isMakingReservation = false;
      this.dialog.closeAll();
    }).catch((error) => {
      console.error('Fehler beim Löschen:', error);
      this.isMakingReservation = false;
      alert('Fehler beim Löschen der Reservierung');
    });
  }

  formatReservationTime(): string {
    if (!this.data.reservation) return '';
    const start = new Date(this.data.reservation.startTime);
    const end = new Date(this.data.reservation.endTime);
    return `${start.getHours().toString().padStart(2, '0')}:00 - ${end.getHours().toString().padStart(2, '0')}:00`;
  }

  formatReservationDate(): string {
    if (!this.data.reservation) return '';
    const date = new Date(this.data.reservation.startTime);
    return date.toLocaleDateString('de-DE', { weekday: 'long', day: '2-digit', month: '2-digit', year: 'numeric' });
  }

  private addHours(date: Date, hours: number): Date {
    const newDate = new Date(date);
    newDate.setHours(newDate.getHours() + hours);
    return newDate;
  }
}
