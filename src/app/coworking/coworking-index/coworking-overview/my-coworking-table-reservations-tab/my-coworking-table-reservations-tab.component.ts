import {Component, OnInit} from '@angular/core';
import {UserService} from 'src/app/services/user.service';
import {catchError, combineLatest, of, Subject, switchMap, take, takeUntil} from "rxjs";
import {map} from "rxjs/operators";
import {
  CoworkingTableReservation,
  CoworkingTableReservationService
} from "../../../services/coworking-table-reservation.service";
import {CoworkingTableService} from "../../../services/coworking-table.service";
import {
  MatCell,
  MatCellDef,
  MatColumnDef,
  MatHeaderCell,
  MatHeaderCellDef,
  MatHeaderRow, MatHeaderRowDef, MatRow, MatRowDef,
  MatTable
} from "@angular/material/table";
import {MatTooltip} from "@angular/material/tooltip";
import {DatePipe, NgClass} from "@angular/common";
import {MatMenu, MatMenuItem, MatMenuTrigger} from "@angular/material/menu";
import {MatIcon} from "@angular/material/icon";
import {MatButton, MatIconButton} from "@angular/material/button";

@Component({
  selector: 'app-my-coworking-table-reservations-tab',
  templateUrl: './my-coworking-table-reservations-tab.component.html',
  imports: [
    MatTable,
    MatColumnDef,
    MatHeaderCell,
    MatCellDef,
    MatCell,
    DatePipe,
    MatHeaderCellDef,
    MatMenuTrigger,
    MatIcon,
    MatMenu,
    MatMenuItem,
    MatHeaderRow,
    MatHeaderRowDef,
    MatRowDef,
    MatRow,
    MatIconButton,
    MatButton
  ],
  standalone: true,
  styleUrls: ['./my-coworking-table-reservations-tab.component.scss']
})
export class MyCoworkingTableReservationsTabComponent implements OnInit {
  reservations: CoworkingTableReservation[] = [];
  displayedColumns: string[] = ['table', 'date', 'time', 'menu'];
  private destroy$ = new Subject<void>();
  public isRefreshing = false;


  constructor(
    private userService: UserService,
    private reservationService: CoworkingTableReservationService,
    private coworkingTableService: CoworkingTableService,
  ) {
  }

  ngOnInit(): void {
    this.loadReservations();
  }


  private loadReservations(): void {
    this.userService.userId$?.pipe(
      switchMap((userId) => combineLatest([
        this.reservationService.getReservationsByUser(userId ?? ''),
      ])),
      switchMap(([tableReservations]) => {
        // Combine the reservations and fetch machine details
        const combinedReservations = [...tableReservations];
        if (combinedReservations.length > 0) {
          return combineLatest(
            combinedReservations.map((reservation) =>
              this.coworkingTableService.getCoworkingTableById(reservation.tableId).pipe(
                map(table => ({
                  ...reservation,
                  tableName: table?.name ?? 'Unknown', // Set a default or keep as is
                  hoursTotal: Math.floor((reservation.endTime.getTime() - reservation.startTime.getTime()) / 3600000)
                })),
                catchError(err => {
                  // Handle errors appropriately
                  console.error('Error fetching table details:', err);
                  return of({...reservation, tableName: 'Error fetching name'}); // Return a reservation with error message
                })
              )
            )
          );
        } else {
          return of([]);
        }
      }),
      takeUntil(this.destroy$),
      take(1),
    ).subscribe((reservations) => {
      this.reservations = reservations;
      this.isRefreshing = false;
    });
  }


  editReservation(reservation: CoworkingTableReservation): void {
    return;
  }

  deleteReservation(reservation: CoworkingTableReservation): void {
    this.reservationService.deleteReservation(reservation.id ?? '').then(() => {
      this.loadReservations();
    });
  }

  public refreshMyReservations() {
    this.isRefreshing = true;
    this.loadReservations();
  }
}
