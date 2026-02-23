import { Component, Inject, OnInit } from '@angular/core';
import { MAT_DIALOG_DATA, MatDialogRef } from '@angular/material/dialog';
import { FormControl, Validators } from '@angular/forms';

export interface DateTimePickerData {
  date: Date;
  time?: string;
  minDate?: Date;
  title?: string;
}

@Component({
  selector: 'app-from-to-time-picker',
  templateUrl: './from-to-time-picker.component.html',
  styleUrls: ['./from-to-time-picker.component.scss'],
  standalone: false
})
export class FromToTimePickerComponent implements OnInit {
  public dateControl = new FormControl<Date | null>(null, [Validators.required]);
  public timeControl = new FormControl<Date | null>(null, [Validators.required]);

  constructor(
    public dialogRef: MatDialogRef<FromToTimePickerComponent>,
    @Inject(MAT_DIALOG_DATA) public data: DateTimePickerData
  ) {}

  ngOnInit(): void {
    // Initialize with the provided date for both date and time controls
    const initialDate = this.data.date || new Date();

    // Set the date control with a clean date (no time component)
    const dateOnly = new Date(initialDate);
    dateOnly.setHours(0, 0, 0, 0);
    this.dateControl.setValue(dateOnly);

    // For time control, preserve the original time or set to current time
    const timeValue = new Date(initialDate);
    this.timeControl.setValue(timeValue);
  }

  filterDates = (d: Date | null): boolean => {
    if (!d) return false;

    // Use minDate from data if provided, otherwise use current date
    const minDate = this.data.minDate || new Date();

    // Create a clean comparison date without time
    const compareMinDate = new Date(minDate.getFullYear(), minDate.getMonth(), minDate.getDate());
    const compareDate = new Date(d.getFullYear(), d.getMonth(), d.getDate());

    return compareDate >= compareMinDate;
  };

  formatPreview(): string {
    if (this.dateControl.valid && this.timeControl.valid) {
      const date = this.dateControl.value;
      const time = this.timeControl.value;

      if (date && time) {
        // Format the date
        const dateStr = date.toLocaleDateString('de-DE');

        // Format the time
        const hours = time.getHours().toString().padStart(2, '0');
        const minutes = time.getMinutes().toString().padStart(2, '0');

        return `${dateStr} um ${hours}:${minutes} Uhr`;
      }
    }
    return '';
  }

  onDateTimeSelected(): void {
    if (this.dateControl.invalid || this.timeControl.invalid || !this.dateControl.value || !this.timeControl.value) {
      return;
    }

    // Get the selected date and time
    const selectedDate = this.dateControl.value;
    const selectedTime = this.timeControl.value;

    // Create final datetime by properly combining date and time
    // Use the date from dateControl and time from timeControl
    const combinedDateTime = new Date(
      selectedDate.getFullYear(),
      selectedDate.getMonth(),
      selectedDate.getDate(),
      selectedTime.getHours(),
      selectedTime.getMinutes(),
      0, // seconds
      0  // milliseconds
    );

    console.log('Selected Date:', selectedDate);
    console.log('Selected Time:', selectedTime);
    console.log('Combined DateTime:', combinedDateTime);

    this.dialogRef.close(combinedDateTime);
  }

  onCancel(): void {
    this.dialogRef.close();
  }
}
