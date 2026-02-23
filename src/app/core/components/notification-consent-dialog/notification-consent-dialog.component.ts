// app/core/components/notification-consent-dialog/notification-consent-dialog.component.ts

import { Component } from '@angular/core';
import { MatDialogRef } from '@angular/material/dialog';

@Component({
  selector: 'app-notification-consent-dialog',
  template: `
    <div class="dialog-container">
      <h2 class="dialog-title">Bleiben Sie auf dem Laufenden!</h2>

      <div class="dialog-content">
        <p>Mit Push-Benachrichtigungen verpassen Sie nichts mehr:</p>
        <ul>
          <li>Erinnerung, wenn Ihre Wäsche fertig ist</li>
          <li>Benachrichtigung, wenn der Trockner fertig ist</li>
        </ul>
        <p>Sie können die Benachrichtigungen jederzeit in Ihren Browser-Einstellungen deaktivieren.</p>
      </div>

      <div class="dialog-actions">
        <button class="btn-secondary" (click)="dialogRef.close(false)">
          Jetzt nicht
        </button>
        <button class="btn-primary" (click)="dialogRef.close(true)">
          Benachrichtigungen aktivieren
        </button>
      </div>
    </div>
  `,
  standalone: true,
  styles: [`
    .dialog-container {
      padding: 24px;
      max-width: 400px;
      color: #000000;
      background: #ffffff;
    }

    .dialog-title {
      margin: 0 0 20px 0;
      font-size: 20px;
      font-weight: 500;
      color: #000000;
    }

    .dialog-content {
      margin-bottom: 24px;
      color: #000000;
    }

    ul {
      padding-left: 20px;
      margin: 16px 0;
    }

    li {
      margin: 8px 0;
    }

    .dialog-actions {
      display: flex;
      justify-content: flex-end;
      gap: 8px;
    }

    button {
      padding: 8px 16px;
      border: none;
      border-radius: 4px;
      cursor: pointer;
      font-weight: 500;
    }

    .btn-secondary {
      background: rgba(0, 0, 0, 0.1);
      color: #000000;
      border: 1px solid transparent;
    }

    .btn-primary {
      background: #2196F3; /* Material Blue */
      color: #ffffff;
    }

    .btn-primary:hover {
      background: #1976D2; /* Darker shade for hover */
    }

    .btn-secondary:hover {
      background: rgba(0, 0, 0, 0.15);
    }
  `]
})
export class NotificationConsentDialogComponent {
  constructor(public dialogRef: MatDialogRef<NotificationConsentDialogComponent>) {}
}
