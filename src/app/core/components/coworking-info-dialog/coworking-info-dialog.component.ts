import { Component, Inject } from '@angular/core';
import { MAT_DIALOG_DATA, MatDialogRef, MatDialogModule } from '@angular/material/dialog';
import { MatButtonModule } from '@angular/material/button';
import { MatIconModule } from '@angular/material/icon';

export interface CoworkingInfoDialogData {
  occupantName: string;
  tableName: string;
  until: string;
}

@Component({
  selector: 'app-coworking-info-dialog',
  standalone: true,
  imports: [MatDialogModule, MatButtonModule, MatIconModule],
  template: `
    <div class="coworking-info-dialog">
      <div class="icon-wrapper">
        <mat-icon>person</mat-icon>
      </div>
      <h2>{{ data.occupantName }}</h2>
      <p class="table-info">{{ data.tableName }}</p>
      <p class="until-info">bis {{ data.until }} Uhr</p>

      <div class="actions">
        <button mat-raised-button (click)="onClose()">OK</button>
      </div>
    </div>
  `,
  styles: [`
    .coworking-info-dialog {
      text-align: center;
      padding: 1rem;
      min-width: 200px;
    }

    .icon-wrapper {
      background: linear-gradient(135deg, #667eea 0%, #764ba2 100%);
      border-radius: 50%;
      width: 60px;
      height: 60px;
      display: flex;
      align-items: center;
      justify-content: center;
      margin: 0 auto 1rem;

      mat-icon {
        color: white;
        font-size: 2rem;
        width: 2rem;
        height: 2rem;
      }
    }

    h2 {
      margin: 0 0 0.25rem;
      color: #fff;
      font-size: 1.4rem;
    }

    .table-info {
      margin: 0;
      color: #b0bec5;
      font-size: 0.9rem;
    }

    .until-info {
      margin: 0.5rem 0 1.5rem;
      color: #ffb74d;
      font-size: 1.1rem;
      font-weight: 500;
    }

    .actions button {
      min-width: 100px;
    }
  `]
})
export class CoworkingInfoDialogComponent {
  constructor(
    public dialogRef: MatDialogRef<CoworkingInfoDialogComponent>,
    @Inject(MAT_DIALOG_DATA) public data: CoworkingInfoDialogData
  ) {}

  onClose(): void {
    this.dialogRef.close();
  }
}
