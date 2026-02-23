import { Component, Inject } from '@angular/core';
import { MAT_DIALOG_DATA, MatDialog } from "@angular/material/dialog";
import {MatIcon} from "@angular/material/icon";
import {MatIconButton} from "@angular/material/button";


@Component({
    selector: 'app-comment-dialog',
    templateUrl: './coworking-table-comment-dialog.component.html',
    imports: [
    MatIcon,
    MatIconButton
],
    styleUrls: ['./coworking-table-comment-dialog.component.scss']
})
export class CoworkingTableCommentDialogComponent {
  constructor(
    private dialog: MatDialog,
    @Inject(MAT_DIALOG_DATA) public data: {
      comment: string;
    }
  ) {}

  closeDialog() {
    this.dialog.closeAll();
  }
}
