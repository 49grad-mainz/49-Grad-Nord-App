import { Component } from '@angular/core';
import { CommonSharedModule } from "../../shared/common-shared.module";

import { MatToolbar, MatToolbarRow } from "@angular/material/toolbar";
import { RouterOutlet } from "@angular/router";
import { MatIcon } from "@angular/material/icon";

@Component({
  selector: 'app-inventory-index',
  imports: [
    CommonSharedModule,
    MatToolbar,
    MatToolbarRow,
    RouterOutlet,
    MatIcon
  ],
  templateUrl: './inventory-index.component.html',
  styleUrl: './inventory-index.component.scss'
})
export class InventoryIndexComponent {

}
