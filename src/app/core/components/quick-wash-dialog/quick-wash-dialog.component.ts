import { Component, inject } from '@angular/core';
import { CommonModule } from '@angular/common';
import { MAT_DIALOG_DATA, MatDialogRef, MatDialogModule } from '@angular/material/dialog';
import { MatButtonModule } from '@angular/material/button';
import { MatIconModule } from '@angular/material/icon';
import { MatProgressSpinnerModule } from '@angular/material/progress-spinner';
import { MatCheckboxModule } from '@angular/material/checkbox';
import { FormsModule } from '@angular/forms';

export interface QuickWashDialogData {
  machineId: string;
  machineName: string;
  machineType: 'washer' | 'dryer';
  isFree: boolean;
  busyUntil?: Date;
}

@Component({
  selector: 'app-quick-wash-dialog',
  standalone: true,
  imports: [
    CommonModule,
    MatDialogModule,
    MatButtonModule,
    MatIconModule,
    MatProgressSpinnerModule,
    MatCheckboxModule,
    FormsModule
  ],
  template: `
    <div class="quick-wash-dialog">
      <div class="dialog-header">
        <mat-icon>{{ data.machineType === 'washer' ? 'local_laundry_service' : 'wb_sunny' }}</mat-icon>
        <h3>{{ data.machineName }}</h3>
      </div>

      @if (data.isFree) {
        <div class="start-option">
          <mat-checkbox [(ngModel)]="startNow" color="primary">
            Ab jetzt ({{ getCurrentHour() }})
          </mat-checkbox>
          @if (!startNow) {
            <span class="next-hour-hint">→ {{ getNextFullHour() }}</span>
          }
        </div>

        @if (!isNightTime) {
          <div class="duration-options">
            @for (option of durationOptions; track option.value) {
              <button
                mat-stroked-button
                [class.selected]="selectedDuration === option.value"
                (click)="selectedDuration = option.value">
                {{ option.label }}
              </button>
            }
          </div>
        }

        @if (isEveningOrNightTime) {
          <button
            mat-stroked-button
            class="overnight-button"
            [class.selected]="selectedDuration === 'overnight'"
            (click)="selectedDuration = 'overnight'">
            <mat-icon>nightlight</mat-icon>
            Über Nacht (bis 9:00)
          </button>
        }

        <div class="time-preview">
          <mat-icon>schedule</mat-icon>
          {{ getTimePreview() }}
        </div>

        <div class="actions">
          <button mat-button (click)="onCancel()">Abbrechen</button>
          <button
            mat-raised-button
            color="primary"
            [disabled]="isSubmitting"
            (click)="onReserve()">
            @if (isSubmitting) {
              <mat-spinner diameter="18"></mat-spinner>
            } @else {
              OK
            }
          </button>
        </div>
      } @else {
        <div class="status busy">
          <mat-icon>schedule</mat-icon>
          @if (data.busyUntil) {
            <span>Belegt bis {{ data.busyUntil | date:'HH:mm' }} Uhr</span>
          } @else {
            <span>Aktuell belegt</span>
          }
        </div>

        <div class="actions">
          <button mat-button (click)="onCancel()">Schließen</button>
          @if (data.busyUntil) {
            <button mat-raised-button color="accent" (click)="onReserveAfter()">
              Danach reservieren
            </button>
          }
        </div>
      }
    </div>
  `,
  styles: [`
    :host { display: block; }
    .quick-wash-dialog {
      padding: 0 4px 4px 4px;
      min-width: 280px;
      overflow: hidden;
      color: #e0e0e0;
    }
    .dialog-header {
      display: flex;
      align-items: center;
      gap: 12px;
      margin-bottom: 16px;
      padding-bottom: 8px;
      border-bottom: 1px solid rgba(255, 255, 255, 0.1);
      mat-icon { font-size: 28px; width: 28px; height: 28px; color: #81d4fa; }
      h3 { margin: 0; font-size: 1.2em; font-weight: 500; color: #ffffff; }
    }
    .start-option {
      display: flex;
      align-items: center;
      gap: 8px;
      margin-bottom: 16px;
      font-size: 0.95em;
      ::ng-deep .mat-mdc-checkbox { color: #e0e0e0; }
      .next-hour-hint { color: #81d4fa; font-size: 0.9em; }
    }
    .duration-options {
      display: flex;
      gap: 8px;
      margin-bottom: 12px;
      button {
        flex: 1;
        min-width: 0;
        padding: 4px 8px;
        color: #b0bec5;
        border-color: rgba(255, 255, 255, 0.3);
        &.selected {
          background: rgba(187, 134, 252, 0.2);
          border-color: #bb86fc;
          color: #e1bee7;
        }
      }
    }
    .overnight-button {
      width: 100%;
      display: flex;
      align-items: center;
      justify-content: center;
      gap: 8px;
      padding: 8px;
      margin-bottom: 16px;
      color: #b0bec5;
      border-color: rgba(255, 255, 255, 0.3);
      mat-icon { font-size: 20px; width: 20px; height: 20px; color: #ffd54f; }
      &.selected {
        background: rgba(255, 213, 79, 0.15);
        border-color: #ffd54f;
        color: #ffe082;
      }
    }
    .time-preview {
      display: flex;
      align-items: center;
      gap: 8px;
      padding: 8px 12px;
      background: rgba(0, 0, 0, 0.2);
      border-radius: 6px;
      margin-bottom: 20px;
      font-size: 0.9em;
      color: #e0e0e0;
      border: 1px solid rgba(255, 255, 255, 0.05);
      mat-icon { font-size: 18px; width: 18px; height: 18px; color: #81d4fa; }
    }
    .status.busy {
      display: flex;
      align-items: center;
      gap: 10px;
      padding: 12px;
      border-radius: 6px;
      margin-bottom: 20px;
      background: rgba(244, 67, 54, 0.15);
      color: #ffcdd2;
      border: 1px solid rgba(244, 67, 54, 0.3);
      mat-icon { font-size: 20px; width: 20px; height: 20px; }
    }
    .actions {
      display: flex;
      justify-content: flex-end;
      gap: 8px;
      button[mat-button] { color: #b0bec5; &:hover { color: #ffffff; } }
    }
  `]
})
export class QuickWashDialogComponent {
  private dialogRef = inject(MatDialogRef<QuickWashDialogComponent>);
  public data: QuickWashDialogData = inject(MAT_DIALOG_DATA);

  // HIER IST DIE ÄNDERUNG: 5h (300 Minuten) hinzugefügt
  public durationOptions = [
    { value: 60, label: '1h' },
    { value: 120, label: '2h' },
    { value: 180, label: '3h' },
    { value: 240, label: '4h' },
    { value: 300, label: '5h' }
  ];

  public selectedDuration: number | 'overnight' = this.getDefaultDuration();
  public isSubmitting = false;
  public startNow = true;

  public get isNightTime(): boolean {
    const hour = new Date().getHours();
    return hour < 6;
  }

  public get isEveningOrNightTime(): boolean {
    const hour = new Date().getHours();
    return hour >= 21 || hour < 6;
  }

  public getCurrentHour(): string {
    const now = new Date();
    return `${now.getHours().toString().padStart(2, '0')}:00`;
  }

  public getNextFullHour(): string {
    const now = new Date();
    const nextHour = now.getHours() + 1;
    return `${nextHour.toString().padStart(2, '0')}:00`;
  }

  private getStartTime(): Date {
    const now = new Date();
    const start = new Date(now);
    start.setMinutes(0, 0, 0);

    if (!this.startNow) {
      start.setHours(start.getHours() + 1);
    }
    return start;
  }

  private getDefaultDuration(): number | 'overnight' {
    const hour = new Date().getHours();
    if (hour < 6) {
      return 'overnight';
    }
    return 60;
  }

  public getTimePreview(): string {
    const start = this.getStartTime();
    let end: Date;
    let isTomorrow = false;

    if (this.selectedDuration === 'overnight') {
      end = new Date(start);
      if (start.getHours() < 9) {
        end.setHours(9, 0, 0, 0);
      } else {
        end.setDate(end.getDate() + 1);
        end.setHours(9, 0, 0, 0);
        isTomorrow = true;
      }
    } else {
      end = new Date(start.getTime() + this.selectedDuration * 60 * 1000);
    }

    const formatTime = (d: Date) =>
      `${d.getHours().toString().padStart(2, '0')}:${d.getMinutes().toString().padStart(2, '0')}`;

    const suffix = isTomorrow ? ' (morgen)' : '';
    return `${formatTime(start)} - ${formatTime(end)} Uhr${suffix}`;
  }

  public onReserve(): void {
    this.isSubmitting = true;

    const startTime = this.getStartTime();
    let endTime: Date;
    let isOvernightReservation = false;

    if (this.selectedDuration === 'overnight') {
      endTime = new Date(startTime);
      if (startTime.getHours() < 9) {
        endTime.setHours(9, 0, 0, 0);
      } else {
        endTime.setDate(endTime.getDate() + 1);
        endTime.setHours(9, 0, 0, 0);
      }
      isOvernightReservation = true;
    } else {
      endTime = new Date(startTime.getTime() + this.selectedDuration * 60 * 1000);
    }

    this.dialogRef.close({
      action: 'reserve',
      machineId: this.data.machineId,
      machineType: this.data.machineType,
      startTime: startTime,
      endTime: endTime,
      isOvernightReservation: isOvernightReservation
    });
  }

  public onCancel(): void {
    this.dialogRef.close();
  }

  public onReserveAfter(): void {
    this.dialogRef.close({
      action: 'reserveAfter',
      machineId: this.data.machineId,
      machineType: this.data.machineType,
      startTime: this.data.busyUntil
    });
  }
}
