import { Component, Inject, OnInit } from '@angular/core';
import { MAT_DIALOG_DATA, MatDialogRef, MatDialog } from '@angular/material/dialog';
import { RoomReservationsService } from "../../raumbelegung/services/room-reservations.service";
import { Observable } from "rxjs";
import { UserService } from "../../services/user.service";
import { map } from "rxjs/operators";
import { format } from 'date-fns';
import { de } from 'date-fns/locale';
import { FromToTimePickerComponent } from '../from-to-time-picker/from-to-time-picker.component';

export interface ConfirmationDialogData {
  message: string;
  eventName: string;
  fromDateTime: Date | string;
  toDateTime: Date | string;
  roomName: string;
  isPrivate: boolean;
  reservationId: string | number;
  userId: string;
  buttonText: {
    ok: string;
    cancel: string;
  };
  mode: 'delete' | 'edit';
}

@Component({
  selector: 'app-confirmation-dialog',
  templateUrl: './confirmation-dialog.component.html',
  standalone: false
})
export class ConfirmationDialogComponent implements OnInit {
  public isPrivateReservation = false;
  public isOwner$: Observable<boolean>;
  public currentUserId$: Observable<string | undefined>;
  public isEditMode = false;
  public hasChanges = false;
  private originalPrivateState = false;

  // Edit form properties
  public editEventName = '';
  public editFromDateTime: Date | null = null;
  public editToDateTime: Date | null = null;
  private originalEventName = '';
  private originalFromDateTime: Date | null = null;
  private originalToDateTime: Date | null = null;

  constructor(
    public dialogRef: MatDialogRef<ConfirmationDialogComponent>,
    private roomReservationService: RoomReservationsService,
    private userService: UserService,
    private dialog: MatDialog,
    @Inject(MAT_DIALOG_DATA) public data: ConfirmationDialogData
  ) {
    this.currentUserId$ = this.userService.userId$;
    this.isOwner$ = this.currentUserId$.pipe(
      map(currentUserId => currentUserId === this.data.userId)
    );
  }

  ngOnInit(): void {
    this.isPrivateReservation = this.data?.isPrivate || false;
    this.originalPrivateState = this.isPrivateReservation;
    this.isEditMode = this.data.mode === 'edit';

    // Initialize edit form with current values
    this.editEventName = this.data.eventName;
    this.editFromDateTime = typeof this.data.fromDateTime === 'string'
      ? new Date(this.data.fromDateTime)
      : this.data.fromDateTime;
    this.editToDateTime = typeof this.data.toDateTime === 'string'
      ? new Date(this.data.toDateTime)
      : this.data.toDateTime;

    // Store original values
    this.originalEventName = this.editEventName;
    this.originalFromDateTime = this.editFromDateTime;
    this.originalToDateTime = this.editToDateTime;
  }

  // Method to format date with German weekday using date-fns
  public getFormattedDateWithWeekday(dateInput: Date | string): string {
    const date = typeof dateInput === 'string' ? new Date(dateInput) : dateInput;
    return format(date, 'EEEE, dd.MM.yyyy', {locale: de});
  }

  onPrivateToggleChange(): void {
    this.checkForChanges();
    this.updateButtonText();
  }

  onEventNameChange(): void {
    this.checkForChanges();
    this.updateButtonText();
  }

  private checkForChanges(): void {
    this.hasChanges =
      this.isPrivateReservation !== this.originalPrivateState ||
      this.editEventName !== this.originalEventName ||
      this.editFromDateTime?.getTime() !== this.originalFromDateTime?.getTime() ||
      this.editToDateTime?.getTime() !== this.originalToDateTime?.getTime();
  }

  onEditClick(): void {
    this.isEditMode = true;
    this.data.mode = 'edit';
    this.updateButtonText();
  }

  onSaveClick(): void {
    if (this.hasChanges) {
      // Validate times
      if (this.editFromDateTime && this.editToDateTime && this.editToDateTime <= this.editFromDateTime) {
        alert('Die Endzeit muss nach der Startzeit liegen.');
        return;
      }

      // Prepare updates object
      const updates: any = {};

      if (this.isPrivateReservation !== this.originalPrivateState) {
        updates.isPrivate = this.isPrivateReservation;
      }

      if (this.editEventName !== this.originalEventName) {
        updates.eventName = this.editEventName;
      }

      if (this.editFromDateTime && this.editFromDateTime.getTime() !== this.originalFromDateTime?.getTime()) {
        updates.fromDateTime = this.editFromDateTime;
      }

      if (this.editToDateTime && this.editToDateTime.getTime() !== this.originalToDateTime?.getTime()) {
        updates.toDateTime = this.editToDateTime;
      }

      // Save the changes
      this.roomReservationService.updateReservation(
        this.data.reservationId as string,
        updates
      ).then(() => {
        this.dialogRef.close({
          action: 'updated',
          updatedReservation: {
            ...updates,
            id: this.data.reservationId
          }
        });
      }).catch((error: any) => {
        console.error('Error updating reservation:', error);
        alert(`Fehler beim Aktualisieren der Reservierung: ${error.message}`);
      });
    } else {
      this.dialogRef.close({ action: 'no-changes' });
    }
  }

  onConfirmClick(): void {
    if (this.isEditMode && this.hasChanges) {
      this.onSaveClick();
    } else if (this.data.mode === 'delete') {
      // confirm delete
      if (!confirm('Reservierung wirklich löschen?')) {
        return;
      }
      this.dialogRef.close({action: 'delete'});
    } else {
      this.dialogRef.close({action: 'confirm'});
    }
  }

  onCancelClick(): void {
    this.dialogRef.close({ action: 'cancel' });
  }

  openFromTimePicker(): void {
    const initialDate = this.editFromDateTime || new Date();

    const dialogRef = this.dialog.open(FromToTimePickerComponent, {
      data: {
        date: initialDate,
        minDate: new Date(),
        title: 'Startzeit bearbeiten'
      },
      width: '350px',
      autoFocus: false
    });

    dialogRef.afterClosed().subscribe(result => {
      if (result) {
        this.editFromDateTime = new Date(result);
        // Auto-adjust end time if it becomes invalid
        if (this.editToDateTime && this.editToDateTime <= this.editFromDateTime) {
          this.editToDateTime = new Date(this.editFromDateTime.getTime() + (2 * 60 * 60 * 1000));
        }
        this.checkForChanges();
        this.updateButtonText();
      }
    });
  }

  openToTimePicker(): void {
    if (!this.editFromDateTime) {
      alert('Bitte wähle zuerst eine Startzeit.');
      return;
    }

    const minDate = new Date(this.editFromDateTime.getTime() + 60000);
    const initialEndTime = this.editToDateTime ||
      new Date(this.editFromDateTime.getTime() + (2 * 60 * 60 * 1000));

    const dialogRef = this.dialog.open(FromToTimePickerComponent, {
      data: {
        date: initialEndTime,
        minDate: minDate,
        title: 'Endzeit bearbeiten'
      },
      width: '350px',
      autoFocus: false
    });

    dialogRef.afterClosed().subscribe(result => {
      if (result) {
        if (result <= this.editFromDateTime!) {
          alert('Die Endzeit muss nach der Startzeit liegen.');
          return;
        }
        this.editToDateTime = new Date(result);
        this.checkForChanges();
        this.updateButtonText();
      }
    });
  }

  public isEndTimeInvalid(): boolean {
    return !!this.editToDateTime && !!this.editFromDateTime && this.editToDateTime <= this.editFromDateTime;
  }

  private updateButtonText(): void {
    if (this.isEditMode) {
      this.data.buttonText.ok = this.hasChanges ? 'Speichern' : 'Schließen';
    }
  }
}
