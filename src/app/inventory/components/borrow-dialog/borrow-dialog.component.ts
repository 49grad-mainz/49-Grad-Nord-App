import { Component, Inject } from '@angular/core';
import { CommonModule, DatePipe } from '@angular/common';
import { FormBuilder, FormGroup, Validators, ReactiveFormsModule } from '@angular/forms';
import {
  MAT_DIALOG_DATA,
  MatDialogRef,
  MatDialogModule
} from '@angular/material/dialog';
import { MatFormFieldModule } from '@angular/material/form-field';
import { MatSelectModule } from '@angular/material/select';
import { MatInputModule } from '@angular/material/input';
import { MatButtonModule } from '@angular/material/button';
import { InventoryItem } from '../../services/inventory.service';

export interface BorrowDialogData {
  item: InventoryItem;
}

export interface BorrowDialogResult {
  durationDays: number;
  notes: string;
}

interface DurationOption {
  value: number;
  label: string;
  description: string;
}

@Component({
  selector: 'app-borrow-dialog',
  standalone: true,
  imports: [
    CommonModule,
    ReactiveFormsModule,
    MatDialogModule,
    MatFormFieldModule,
    MatSelectModule,
    MatInputModule,
    MatButtonModule
  ],
  template: `
    <h2 mat-dialog-title>{{ data.item.name }} ausleihen</h2>

    <mat-dialog-content>
      <form [formGroup]="borrowForm">
        <div class="item-info">
          <img [src]="data.item.image" [alt]="data.item.name" class="item-preview">
          <div class="item-details">
            <p><strong>Modell:</strong> {{ data.item.model }}</p>
            <p><strong>Standort:</strong> {{ data.item.location }}</p>
          </div>
        </div>

        <mat-form-field appearance="outline" class="full-width">
          <mat-label>Ausleihdauer</mat-label>
          <mat-select formControlName="duration" required>
            @for (option of durationOptions; track option.value) {
              <mat-option [value]="option.value">
                <div class="option-content">
                  <span class="option-label">{{ option.label }}</span>
                  <span class="option-description">{{ option.description }}</span>
                </div>
              </mat-option>
            }
          </mat-select>
          <mat-hint>Wähle, wie lange du das Item brauchst</mat-hint>
        </mat-form-field>

        @if (borrowForm.get('duration')?.value) {
          <div class="return-date-info">
            <strong>Rückgabe bis:</strong>
            {{ getReturnDate() | date:'EEEE, dd.MM.yyyy':'':'de-DE' }}
            <span class="time-hint">({{ borrowForm.get('duration')?.value }} Tag{{ borrowForm.get('duration')?.value === 1 ? '' : 'e' }})</span>
          </div>
        }

        <mat-form-field appearance="outline" class="full-width">
          <mat-label>Notiz (optional)</mat-label>
          <textarea
            matInput
            formControlName="notes"
            rows="3"
            placeholder="z.B. 'Brauche für Filmeabend am Samstag'"></textarea>
          <mat-hint>Warum brauchst du das Item?</mat-hint>
        </mat-form-field>
      </form>
    </mat-dialog-content>

    <mat-dialog-actions align="end">
      <button mat-button (click)="onCancel()">Abbrechen</button>
      <button
        mat-raised-button
        color="primary"
        [disabled]="!borrowForm.valid"
        (click)="onConfirm()">
        Jetzt ausleihen
      </button>
    </mat-dialog-actions>
  `,
  styles: [`
    .item-info {
      display: flex;
      gap: 1rem;
      margin-bottom: 1.5rem;
      padding: 1rem;
      background-color: #392936;
      border-radius: 8px;
    }

    .item-preview {
      width: 120px;
      height: auto;
      border-radius: 4px;
      object-fit: cover;
    }

    .item-details {
      flex: 1;
      display: flex;
      flex-direction: column;
      justify-content: center;
      gap: 0.5rem;
    }

    .item-details p {
      margin: 0;
      font-size: 0.9rem;
    }

    .full-width {
      width: 100%;
      margin-bottom: 1rem;
    }

    .option-content {
      display: flex;
      flex-direction: column;
      gap: 0.25rem;
    }

    .option-label {
      font-weight: 500;
    }

    .option-description {
      font-size: 0.85rem;
      color: #666;
    }

    .return-date-info {
      padding: 1rem;
      background-color: #392936;
      border-radius: 4px;
      margin-bottom: 1rem;
      text-align: center;
    }

    .time-hint {
      color: #666;
      font-size: 0.9rem;
      margin-left: 0.5rem;
    }

    mat-dialog-content {
      min-width: 250px;
      max-width: 400px;
    }
  `]
})
export class BorrowDialogComponent {
  borrowForm: FormGroup;

  durationOptions: DurationOption[] = [
    { value: 1, label: '1 Tag', description: 'Perfekt für einen Filmeabend' },
    { value: 3, label: '3 Tage', description: 'Für ein Wochenende' },
    { value: 7, label: '1 Woche', description: 'Für ein kleineres Projekt' },
    { value: 14, label: '2 Wochen', description: 'Für größere Vorhaben' }
  ];

  constructor(
    private fb: FormBuilder,
    private dialogRef: MatDialogRef<BorrowDialogComponent>,
    @Inject(MAT_DIALOG_DATA) public data: BorrowDialogData
  ) {
    this.borrowForm = this.fb.group({
      duration: [1, [Validators.required, Validators.min(1)]],
      notes: ['']
    });
  }

  getReturnDate(): Date {
    const duration = this.borrowForm.get('duration')?.value || 1;
    const returnDate = new Date();
    returnDate.setDate(returnDate.getDate() + duration);
    return returnDate;
  }

  onConfirm(): void {
    if (this.borrowForm.valid) {
      const result: BorrowDialogResult = {
        durationDays: this.borrowForm.get('duration')?.value,
        notes: this.borrowForm.get('notes')?.value || ''
      };
      this.dialogRef.close(result);
    }
  }

  onCancel(): void {
    this.dialogRef.close(null);
  }
}
