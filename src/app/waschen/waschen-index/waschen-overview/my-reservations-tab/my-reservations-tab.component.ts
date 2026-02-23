import { Component, OnInit } from '@angular/core';
import { UserService } from 'src/app/services/user.service';
import {
  DryerReservation,
  WashingMachineReservation
} from "../washing-calendar-tab-content/washing-calendar-tab-content.component";
import { WashingMachineReservationService } from "../../../services/washing-machine-reservation.service";
import { catchError, combineLatest, of, Subject, switchMap, take, takeUntil } from "rxjs";
import { WashingMachineService } from "../../../services/washing-machine.service";
import { map } from "rxjs/operators";
import { DryerService } from "../../../services/dryers-service";
import { DryerReservationService } from "../../../services/dryer-reservation.service";

@Component({
    selector: 'app-my-reservations-tab',
    templateUrl: './my-reservations-tab.component.html',
    styleUrls: ['./my-reservations-tab.component.scss'],
    standalone: false
})
export class MyReservationsTabComponent implements OnInit {
  reservations: WashingMachineReservation[] = [];
  combinedReservations: (WashingMachineReservation | DryerReservation)[] = [];
  displayedColumns: string[] = ['indicator', 'machine', 'date', 'time', 'menu'];
  private destroy$ = new Subject<void>();
  public isRefreshing = false;


  constructor(
    private userService: UserService,
    private reservationService: WashingMachineReservationService,
    private dryerReservationService: DryerReservationService,
    private machineService: WashingMachineService,
    private dryerService: DryerService
  ) {
  }

  ngOnInit(): void {
    this.loadReservations();
  }


  private loadReservations(): void {
    this.userService.userId$?.pipe(
      switchMap((userId) => combineLatest([
        this.reservationService.getReservationsByUser(userId ?? ''),
        this.dryerReservationService.getReservationsByUser(userId ?? ''),
      ])),
      switchMap(([washingReservations, dryerReservations]) => {
        // Combine the reservations and fetch machine details
        const combinedReservations = [...washingReservations, ...dryerReservations];
        if (combinedReservations.length > 0) {
          return combineLatest(
            combinedReservations.map((reservation) =>
              this.isWashingMachineReservation(reservation) ?
                this.machineService.getWashingMachineById(reservation.machineId).pipe(
                  map(machine => ({
                    ...reservation,
                    machineName: machine?.name ?? 'Unknown', // Set a default or keep as is
                    type: 'washingMachine' as const,
                    hoursTotal: Math.floor((reservation.endTime.getTime() - reservation.startTime.getTime()) / 3600000)
                  })),
                  catchError(err => {
                    // Handle errors appropriately
                    console.error('Error fetching washing machine details:', err);
                    return of({...reservation, machineName: 'Error fetching name'}); // Return a reservation with error message
                  })
                ) :
                this.dryerService.getDryerById(reservation.machineId).pipe(
                  map(machine => ({
                    ...reservation,
                    machineName: machine?.name,
                    type: 'dryer' as const,
                    hoursTotal: Math.floor((reservation.endTime.getTime() - reservation.startTime.getTime()) / 3600000)
                  })),
                  catchError(err => {
                    // Handle errors appropriately
                    console.error('Error fetching dryer details:', err);
                    return of({...reservation, machineName: 'Error fetching name'}); // Return a reservation with error message
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
      this.combinedReservations = reservations;
      this.isRefreshing = false;
    });
  }


  editReservation(reservation: WashingMachineReservation | DryerReservation): void {
    if (reservation.type === 'washingMachine') {
      // Logic for washing machine reservation
    } else if (reservation.type === 'dryer') {
      // Logic for dryer reservation
    }
  }

  deleteReservation(reservation: WashingMachineReservation | DryerReservation): void {
    if (reservation.type === 'washingMachine') {
      this.reservationService.deleteReservation(reservation.id ?? '').then(() => {
        this.loadReservations();
      });
    } else if (reservation.type === 'dryer') {
      this.dryerReservationService.deleteReservation(reservation.id ?? '').then(() => {
        this.loadReservations();
      });
    }
  }

  private isWashingMachineReservation(reservation: any): reservation is WashingMachineReservation {
    return reservation && reservation.type === 'washingMachine';
  }

  public refreshMyReservations() {
    this.isRefreshing = true;
    this.loadReservations();
  }
}
