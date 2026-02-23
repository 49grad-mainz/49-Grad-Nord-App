import { Component, Inject } from '@angular/core';
import { MAT_DIALOG_DATA, MatDialogModule, MatDialogRef } from '@angular/material/dialog';
import { MatButton } from '@angular/material/button';
import { MatIcon } from '@angular/material/icon';


@Component({
  selector: 'app-notification-help-dialog',
  template: `
    <h2 mat-dialog-title>
      <mat-icon>help_outline</mat-icon>
      Benachrichtigungen aktivieren
    </h2>
    <mat-dialog-content>
      <div class="platform-badge">{{ data.platform }}</div>
      <div class="instructions">{{ data.instructions }}</div>
    </mat-dialog-content>
    <mat-dialog-actions align="end">
      <button mat-button (click)="close()">Schließen</button>
      @if (data.settingsUrl) {
        <button mat-raised-button color="primary" (click)="openSettings()">
          <mat-icon>settings</mat-icon>
          Einstellungen öffnen
        </button>
      }
    </mat-dialog-actions>
  `,
  styles: [`
    h2 {
      display: flex;
      align-items: center;
      gap: 8px;
      margin: 0;
    }

    .platform-badge {
      display: inline-block;
      background: #2196f3;
      color: white;
      padding: 4px 12px;
      border-radius: 12px;
      font-size: 12px;
      font-weight: 500;
      margin-bottom: 16px;
    }

    .instructions {
      white-space: pre-line;
      line-height: 1.8;
      font-size: 14px;
      color: #333;
      padding: 16px;
      background: #f5f5f5;
      border-radius: 8px;
      border-left: 4px solid #2196f3;
    }

    mat-dialog-content {
      max-height: 60vh;
      overflow-y: auto;
    }

    mat-dialog-actions {
      padding: 16px 24px;
      gap: 8px;
    }

    button mat-icon {
      margin-right: 4px;
    }
  `],
  standalone: true,
  imports: [MatDialogModule, MatButton, MatIcon]
})
export class NotificationHelpDialogComponent {
  constructor(
    public dialogRef: MatDialogRef<NotificationHelpDialogComponent>,
    @Inject(MAT_DIALOG_DATA) public data: {
      instructions: string;
      settingsUrl?: string;
      platform: string;
    }
  ) {}

  close(): void {
    this.dialogRef.close();
  }

  openSettings(): void {
    if (this.data.settingsUrl) {
      window.open(this.data.settingsUrl, '_blank');
    }
    this.dialogRef.close();
  }
}
