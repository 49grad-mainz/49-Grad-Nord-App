import { Component, Inject } from '@angular/core';
import {
  MAT_DIALOG_DATA,
  MatDialogActions,
  MatDialogClose,
  MatDialogContent,
  MatDialogRef
} from '@angular/material/dialog';
import { NgOptimizedImage } from "@angular/common";
import { MatButton } from "@angular/material/button";

@Component({
    selector: 'app-table-image-dialog',
    template: `
    <div mat-dialog-content class="dialog-content">
      <img [src]="data.image"
           width="100%"
           height="auto"
           alt="Table Image" class="table-image-popup">
    </div>
  `,
    styleUrls: ['./table-image-dialog.component.scss'],
    imports: [
        MatDialogContent,
    ]
})
export class TableImageDialogComponent {
  constructor(
    public dialogRef: MatDialogRef<TableImageDialogComponent>,
    @Inject(MAT_DIALOG_DATA) public data: { image: string }
  ) {}
}
