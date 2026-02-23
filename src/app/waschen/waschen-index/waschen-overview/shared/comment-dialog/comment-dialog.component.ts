import { Component, Inject } from '@angular/core';
import { MAT_DIALOG_DATA, MatDialog } from "@angular/material/dialog";

@Component({
    selector: 'app-comment-dialog',
    templateUrl: './comment-dialog.component.html',
    styleUrls: ['./comment-dialog.component.scss'],
    standalone: false
})
export class CommentDialogComponent {
  constructor(
    private dialog: MatDialog,
    @Inject(MAT_DIALOG_DATA) public data: {
      reservationId: string;
      comment: string;
      othersMayRemoveMyClothes?: boolean;
      // id?: string;
    }
  ) {}

  closeDialog() {
    this.dialog.closeAll();
  }
}
