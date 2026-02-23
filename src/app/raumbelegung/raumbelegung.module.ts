import { NgModule } from '@angular/core';
import { CommonModule, NgOptimizedImage } from '@angular/common';
import { RaumbelegungIndexComponent } from './raumbelegung-index/raumbelegung-index.component';
import { RaumbelegungOverviewComponent } from './raumbelegung-index/raumbelegung-overview/raumbelegung-overview.component';
import { CommonSharedModule } from "../shared/common-shared.module";
import { MatIconModule } from "@angular/material/icon";
import { MatToolbarModule } from "@angular/material/toolbar";
import { RouterOutlet } from "@angular/router";
import { RaumbelegungRoutingModule } from "./raumbelegung-routing.module";
import {
  MatCard,
  MatCardContent,
  MatCardHeader,
  MatCardSubtitle,
  MatCardTitle,
  MatCardTitleGroup
} from "@angular/material/card";
import { MatButton, MatIconButton } from "@angular/material/button";
import { MatChip, MatChipRow, MatChipSet } from "@angular/material/chips";
import { MatDivider } from "@angular/material/divider";
import {
  MatAccordion,
  MatExpansionPanel,
  MatExpansionPanelDescription,
  MatExpansionPanelHeader,
  MatExpansionPanelTitle
} from "@angular/material/expansion";
import { MatDatepicker, MatDatepickerInput, MatDatepickerToggle } from "@angular/material/datepicker";
import { MatFormField, MatSuffix } from "@angular/material/form-field";
import { MatInput } from "@angular/material/input";
import { MAT_DATE_LOCALE, MatNativeDateModule } from "@angular/material/core";
import { FormsModule, ReactiveFormsModule } from "@angular/forms";
import { MatSlideToggle } from "@angular/material/slide-toggle";
import { MatList, MatListItem } from "@angular/material/list";
import {
  MatCell,
  MatCellDef,
  MatColumnDef,
  MatHeaderCell, MatHeaderCellDef,
  MatHeaderRow,
  MatHeaderRowDef, MatRow, MatRowDef, MatTable
} from "@angular/material/table";
import { MatMenu, MatMenuItem, MatMenuTrigger } from "@angular/material/menu";
import { MatTab, MatTabGroup } from "@angular/material/tabs";
import { MatProgressSpinner } from "@angular/material/progress-spinner";
import { MatSort, MatSortHeader } from "@angular/material/sort";
import { MatButtonToggle, MatButtonToggleGroup } from "@angular/material/button-toggle";



@NgModule({
  declarations: [
    RaumbelegungIndexComponent,
    RaumbelegungOverviewComponent
  ],
  imports: [
    FormsModule,
    CommonModule,
    CommonSharedModule,
    MatIconModule,
    MatToolbarModule,
    RouterOutlet,
    RaumbelegungRoutingModule,
    MatCard,
    MatCardHeader,
    MatCardTitle,
    MatCardSubtitle,
    MatCardTitleGroup,
    MatCardContent,
    NgOptimizedImage,
    MatButton,
    MatChipSet,
    MatChip,
    MatDivider,
    MatChipRow,
    MatExpansionPanelHeader,
    MatExpansionPanelDescription,
    MatExpansionPanelTitle,
    MatExpansionPanel,
    MatAccordion,
    MatDatepicker,
    MatDatepickerToggle,
    MatFormField,
    MatDatepickerInput,
    MatInput,
    MatNativeDateModule,
    MatIconButton,
    MatSuffix,
    ReactiveFormsModule,
    MatSlideToggle,
    FormsModule,
    MatList,
    MatListItem,
    MatListItem,
    MatListItem,
    MatCell,
    MatCellDef,
    MatColumnDef,
    MatHeaderCell,
    MatHeaderRow,
    MatHeaderRowDef,
    MatMenu,
    MatMenuItem,
    MatRow,
    MatRowDef,
    MatTable,
    MatMenuTrigger,
    MatHeaderCellDef,
    MatTabGroup,
    MatTab,
    MatProgressSpinner,
    MatSort,
    MatSortHeader,
    MatButtonToggleGroup,
    MatButtonToggle
  ],
  providers: [
    { provide: MAT_DATE_LOCALE, useValue: 'de-DE' }
  ]
})
export class RaumbelegungModule { }
