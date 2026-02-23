import { catchError, of, Subject, switchMap, take, takeUntil, combineLatest, BehaviorSubject } from 'rxjs';
import { Component, OnDestroy, OnInit, ChangeDetectionStrategy, ChangeDetectorRef } from '@angular/core';
import { MatDatepickerInputEvent } from "@angular/material/datepicker";
import { MatDialog } from "@angular/material/dialog";
import { MatTabChangeEvent } from "@angular/material/tabs";
import { WashingMachine, WashingMachineService } from "../../../services/washing-machine.service";
import { CommentDialogComponent } from "../shared/comment-dialog/comment-dialog.component";
import { FormControl } from "@angular/forms";
import { WashingMachineReservationService } from "../../../services/washing-machine-reservation.service";
import { UserService } from 'src/app/services/user.service';
import { map } from "rxjs/operators";
import { Dryer, DryerService } from "../../../services/dryers-service";
import { DryerReservationService } from "../../../services/dryer-reservation.service";
import {
  WashingMachineConfirmDialogComponent
} from "../shared/washing-machine-confirm-dialog/washing-machine-confirm-dialog.component";
import { DryerConfirmDialogComponent } from "../shared/dryer-confirm-dialog/dryer-confirm-dialog.component";
import { ActivatedRoute, Router } from "@angular/router";
import { animate, style, transition, trigger } from "@angular/animations";
import {
  WashingMachineEditDialogComponent
} from "../shared/washing-machine-edit-dialog/washing-machine-edit-dialog.component";
import { DryerEditDialogComponent } from "../shared/dryer-edit-dialog/dryer-edit-dialog.component";

export interface WashingMachineReservation {
  type: 'washingMachine';
  id?: string;
  machineId: string;
  startTime: Date;
  endTime: Date;
  user: string;
  userId?: string;
  userName?: string;
  comment?: string;
  othersMayRemoveMyClothes: boolean;
  paid: boolean;
  isOvernightReservation?: boolean;
}

export interface DryerReservation {
  type: 'dryer';
  id?: string;
  machineId: string;
  startTime: Date;
  endTime: Date;
  user: string;
  userId?: string;
  userName?: string;
  comment?: string;
  othersMayRemoveMyClothes: boolean;
  paid: boolean;
  isOvernightReservation?: boolean;
}

@Component({
  selector: 'app-washing-calendar-tab-content',
  templateUrl: './washing-calendar-tab-content.component.html',
  styleUrls: ['./washing-calendar-tab-content.component.scss'],
  changeDetection: ChangeDetectionStrategy.OnPush, // Enable OnPush
  animations: [
    trigger('fadeInOut', [
      transition(':enter', [
        style({ opacity: 0 }),
        animate('0.3s', style({ opacity: 1 }))
      ]),
      transition(':leave', [
        animate('0.3s', style({ opacity: 0 }))
      ])
    ])
  ],
  standalone: false
})
export class WashingCalendarTabContentComponent implements OnInit, OnDestroy {
  public readonly hours: number[] = Array.from(Array(18), (_, i) => i + 6);

  // Convert to BehaviorSubjects for better OnPush compatibility
  private selectedDate$ = new BehaviorSubject<Date>(new Date());
  private washingMachines$ = new BehaviorSubject<WashingMachine[] | null>(null);
  private dryers$ = new BehaviorSubject<Dryer[] | null>(null);
  private washingMachineReservations$ = new BehaviorSubject<WashingMachineReservation[]>([]);
  private reservationsDryer$ = new BehaviorSubject<DryerReservation[]>([]);
  private currentHour$ = new BehaviorSubject<number>(new Date().getHours());
  private highlightUserReservations$ = new BehaviorSubject<boolean>(false);
  private selectedTabIndex$ = new BehaviorSubject<number>(0);

  // Public getters for template access
  public get selectedDate(): Date {
    return this.selectedDate$.value;
  }

  public get washingMachines(): WashingMachine[] | null {
    return this.washingMachines$.value;
  }

  public get dryers(): Dryer[] | null {
    return this.dryers$.value;
  }

  public get washingMachineReservations(): WashingMachineReservation[] {
    return this.washingMachineReservations$.value;
  }

  public get reservationsDryer(): DryerReservation[] {
    return this.reservationsDryer$.value;
  }

  public get highlightUserReservations(): boolean {
    return this.highlightUserReservations$.value;
  }

  // Two-way binding requires both getter and setter
  public get selectedTabIndex(): number {
    return this.selectedTabIndex$.value;
  }

  public set selectedTabIndex(value: number) {
    this.selectedTabIndex$.next(value);
    this.cdr.markForCheck();
  }

  private selectedWashingMachineId: string | null = null;
  private selectedTime: number | null = null;
  public date1 = new FormControl(new Date());

  private currentUserId: string | null = null;
  private updateCurrentHourInterval: any;
  private destroy$ = new Subject<void>();

  public constructor(
    private dialog: MatDialog,
    private washingMachineService: WashingMachineService,
    private dryerService: DryerService,
    private washingMachineReservationService: WashingMachineReservationService,
    private dryerReservationService: DryerReservationService,
    private userService: UserService,
    private router: Router,
    private route: ActivatedRoute,
    private cdr: ChangeDetectorRef // Inject ChangeDetectorRef
  ) {
  }

  public ngOnInit() {
    // Setup reactive streams
    this.setupWashingMachinesStream();
    this.setupDryersStream();
    this.setupUserStream();
    this.setupReservationsStreams();
    this.setupCurrentHourUpdates();
    this.setupRouteHandling();
    this.setupHighlightTrigger();

    // Initial load
    this.triggerUserHighlight();
  }

  private setupWashingMachinesStream(): void {
    this.washingMachineService.getWashingMachines()
      .pipe(takeUntil(this.destroy$))
      .subscribe((machines) => {
        machines.sort((a, b) => a.orderNo - b.orderNo);
        this.washingMachines$.next(machines);
        this.cdr.markForCheck(); // Trigger change detection
      });
  }

  private setupDryersStream(): void {
    this.dryerService.getDryers()
      .pipe(takeUntil(this.destroy$))
      .subscribe((dryers) => {
        dryers.sort((a, b) => a.orderNo - b.orderNo);
        this.dryers$.next(dryers);
        this.cdr.markForCheck();
      });
  }

  private setupUserStream(): void {
    this.userService.userId$
      .pipe(takeUntil(this.destroy$))
      .subscribe(userId => {
        this.currentUserId = userId || null;
        this.cdr.markForCheck();
      });
  }

  private setupReservationsStreams(): void {
    // Reactive stream for washing machine reservations
    this.selectedDate$
      .pipe(
        switchMap(date => this.refreshWashingMachineReservationsStream(date)),
        takeUntil(this.destroy$)
      )
      .subscribe(reservations => {
        this.washingMachineReservations$.next(reservations);
        this.cdr.markForCheck();
      });

    // Reactive stream for dryer reservations
    this.selectedDate$
      .pipe(
        switchMap(date => this.refreshDryerReservationsStream(date)),
        takeUntil(this.destroy$)
      )
      .subscribe(reservations => {
        this.reservationsDryer$.next(reservations);
        this.cdr.markForCheck();
      });
  }

  private setupCurrentHourUpdates(): void {
    this.updateCurrentHourInterval = setInterval(() => {
      const newHour = new Date().getHours();
      if (this.currentHour$.value !== newHour) {
        this.currentHour$.next(newHour);
        this.cdr.markForCheck();
      }
    }, 60000);
  }

  private setupRouteHandling(): void {
    this.route.queryParams
      .pipe(takeUntil(this.destroy$))
      .subscribe(params => {
        if (params['tab'] === 'dryer') {
          this.selectedTabIndex$.next(1);
          this.cdr.markForCheck();
          this.router.navigate([], {
            relativeTo: this.route,
            queryParams: {}
          });
        } else if (params['tab'] === 'washing') {
          this.selectedTabIndex$.next(0);
          this.cdr.markForCheck();
        }
      });
  }

  private setupHighlightTrigger(): void {
    // React to date and tab changes for highlighting
    combineLatest([this.selectedDate$, this.selectedTabIndex$])
      .pipe(takeUntil(this.destroy$))
      .subscribe(() => {
        this.triggerUserHighlight();
      });
  }

  private refreshWashingMachineReservationsStream(selectedDate: Date) {
    return this.washingMachineReservationService.getWashingMachineReservationsForCurrentDay(selectedDate)
      .pipe(
        switchMap((reservations) => {
          if (reservations.length > 0) {
            const uniqueUserIds = [...new Set(reservations.map(reservation => reservation.user))];
            return this.userService.getUsers(uniqueUserIds).pipe(
              map(users => {
                return reservations.map(reservation => {
                  const user = users.find(u => u.uid === reservation.user);
                  return {
                    ...reservation,
                    userName: user?.displayName?.split(' ')[0] || 'Unknown User',
                    userId: reservation.user
                  };
                });
              }),
              catchError(() => of(reservations.map(reservation => ({
                ...reservation,
                userName: 'Unknown User',
                userId: reservation.user
              }))))
            );
          } else {
            return of([]);
          }
        })
      );
  }

  private refreshDryerReservationsStream(selectedDate: Date) {
    return this.dryerReservationService.getReservationsForCurrentDay(selectedDate)
      .pipe(
        switchMap((reservations) => {
          if (reservations.length > 0) {
            const uniqueUserIds = [...new Set(reservations.map(reservation => reservation.user))];
            return this.userService.getUsers(uniqueUserIds).pipe(
              map(users => {
                return reservations.map(reservation => {
                  const user = users.find(u => u.uid === reservation.user);
                  return {
                    ...reservation,
                    userName: user?.displayName?.split(' ')[0] || 'Unknown User',
                    userId: reservation.user
                  };
                });
              }),
              catchError(() => of(reservations.map(reservation => ({
                ...reservation,
                userName: 'Unknown User',
                userId: reservation.user
              }))))
            );
          } else {
            return of([]);
          }
        })
      );
  }

  public getReservationForWashingMachine(machine: WashingMachine, hour: number): WashingMachineReservation | undefined {
    const date = new Date(this.selectedDate);
    date.setHours(hour, 0, 0, 0);

    const reservation = this.washingMachineReservations.find(
      (r) => r.machineId === machine.id && r.startTime <= date && r.endTime > date
    );

    if (reservation) {
      return reservation;
    }

    if (machine.status === 'available') {
      return {
        type: 'washingMachine',
        machineId: machine.id,
        startTime: date,
        endTime: new Date(date.getTime() + 60 * 60 * 1000),
        user: 'Frei',
        userName: 'Frei',
        othersMayRemoveMyClothes: false,
        paid: false
      };
    }

    return undefined;
  }

  public getReservationForDryer(dryer: Dryer, hour: number): DryerReservation | undefined {
    const date = new Date(this.selectedDate);
    date.setHours(hour, 0, 0, 0);

    const reservation = this.reservationsDryer.find(
      (r) => r.machineId === dryer.id && r.startTime <= date && r.endTime > date
    );

    if (reservation) {
      return reservation;
    }

    if (dryer.status === 'available') {
      return {
        type: 'dryer',
        machineId: dryer.id,
        startTime: date,
        endTime: new Date(date.getTime() + 60 * 60 * 1000),
        user: 'Frei',
        userName: 'Frei',
        othersMayRemoveMyClothes: false,
        paid: false
      };
    }

    return undefined;
  }

  // Event handlers with explicit change detection
  public onDateChange(event: MatDatepickerInputEvent<any, any>): void {
    if (event.value) {
      this.selectedDate$.next(event.value);
      this.cdr.markForCheck();
    }
  }

  public onTabChange(event: MatTabChangeEvent): void {
    this.selectedTabIndex$.next(event.index);
    this.triggerUserHighlight();
    this.cdr.markForCheck();
  }

  public previousDate(): void {
    const date = new Date(this.selectedDate);
    date.setDate(date.getDate() - 1);
    this.selectedDate$.next(date);
    this.date1.setValue(date);
    this.cdr.markForCheck();
  }

  public nextDate(): void {
    const date = new Date(this.selectedDate);
    date.setDate(date.getDate() + 1);
    this.selectedDate$.next(date);
    this.date1.setValue(date);
    this.cdr.markForCheck();
  }

  public isCurrentHour(hour: number): boolean {
    const today = new Date();
    return this.selectedDate.toDateString() === today.toDateString() &&
      this.currentHour$.value === hour;
  }

  public isUserReservation(reservation: WashingMachineReservation | undefined): boolean {
    if (!reservation || !this.currentUserId) return false;
    return reservation.user === this.currentUserId || reservation.userId === this.currentUserId;
  }

  public isUserDryerReservation(reservation: DryerReservation | undefined): boolean {
    if (!reservation || !this.currentUserId) return false;
    return reservation.user === this.currentUserId || reservation.userId === this.currentUserId;
  }

  public handleWashingMachineSlotClick(machine: WashingMachine, machineName: string, hour: number): void {
    const reservation = this.getReservationForWashingMachine(machine, hour);

    this.userService?.userId$?.pipe(take(1)).subscribe((userId) => {
      if (!userId) {
        this.router.navigate(['/login']);
      } else if (reservation && (reservation.user === userId || reservation.userId === userId)) {
        this.dialog.open(WashingMachineEditDialogComponent, {
          data: { reservation: reservation }
        });
      } else if (reservation?.userName !== 'Frei' && reservation?.user !== 'Frei') {
        this.dialog.open(CommentDialogComponent, {
          data: {
            comment: reservation?.comment,
            othersMayRemoveMyClothes: reservation?.othersMayRemoveMyClothes,
            id: reservation?.id
          }
        });
      } else {
        this.selectedWashingMachineId = machine.id;
        this.selectedTime = hour;
        this.dialog.open(WashingMachineConfirmDialogComponent, {
          disableClose: true,
          data: {
            machineName: machineName,
            machineId: machine.id,
            time: this.selectedTime,
            date: this.selectedDate,
            userId: userId
          }
        });
      }
    });
  }

  public handleDryerSlotClick(dryer: Dryer, dryerName: string, hour: number): void {
    const reservation = this.getReservationForDryer(dryer, hour);

    if (reservation?.user !== 'Frei' && this.userService.userId$) {
      this.userService.userId$.pipe(take(1)).subscribe((userId) => {
        if (reservation?.userId === userId) {
          this.dialog.open(DryerEditDialogComponent, {
            data: { reservation: reservation }
          });
        } else {
          this.dialog.open(CommentDialogComponent, {
            data: {
              comment: reservation?.comment,
              othersMayRemoveMyClothes: reservation?.othersMayRemoveMyClothes
            }
          });
        }
      });
    } else {
      this.userService.userId$?.pipe(take(1)).subscribe((userId) => {
        if (!userId) {
          this.router.navigate(['/login']);
        } else {
          this.selectedWashingMachineId = dryer.id;
          this.selectedTime = hour;
          this.dialog.open(DryerConfirmDialogComponent, {
            disableClose: true,
            data: {
              machineName: dryerName,
              machineId: dryer.id,
              time: this.selectedTime,
              date: this.selectedDate,
              userId: userId
            }
          });
        }
      });
    }
  }

  private triggerUserHighlight(): void {
    setTimeout(() => {
      this.highlightUserReservations$.next(true);
      this.cdr.markForCheck();

      this.userService.enableReservationScroll$.pipe(take(1)).subscribe(enableScroll => {
        if (enableScroll) {
          this.scrollToFirstUserReservation();
        }
      });

      setTimeout(() => {
        this.highlightUserReservations$.next(false);
        this.cdr.markForCheck();
      }, 3000);
    }, 300);
  }

  private scrollToFirstUserReservation(): void {
    if (!this.currentUserId) return;

    const now = new Date();
    const currentHour = now.getHours();
    const isToday = this.selectedDate.toDateString() === now.toDateString();
    const isWashingTab = this.selectedTabIndex === 0;
    const isDryerTab = this.selectedTabIndex === 1;

    if (isWashingTab && !this.washingMachines) return;
    if (isDryerTab && !this.dryers) return;

    for (let hour of this.hours) {
      if (isToday && hour <= currentHour) continue;

      if (isWashingTab && this.washingMachines) {
        for (let machine of this.washingMachines) {
          const reservation = this.getReservationForWashingMachine(machine, hour);
          if (this.isUserReservation(reservation)) {
            this.scrollToHour(hour);
            return;
          }
        }
      }

      if (isDryerTab && this.dryers) {
        for (let dryer of this.dryers) {
          const reservation = this.getReservationForDryer(dryer, hour);
          if (this.isUserDryerReservation(reservation)) {
            this.scrollToHour(hour);
            return;
          }
        }
      }
    }

    // Fallback to any user reservation
    for (let hour of this.hours) {
      if (isWashingTab && this.washingMachines) {
        for (let machine of this.washingMachines) {
          const reservation = this.getReservationForWashingMachine(machine, hour);
          if (this.isUserReservation(reservation)) {
            this.scrollToHour(hour);
            return;
          }
        }
      }

      if (isDryerTab && this.dryers) {
        for (let dryer of this.dryers) {
          const reservation = this.getReservationForDryer(dryer, hour);
          if (this.isUserDryerReservation(reservation)) {
            this.scrollToHour(hour);
            return;
          }
        }
      }
    }
  }

  private scrollToHour(hour: number): void {
    setTimeout(() => {
      const allTimeSlots = document.querySelectorAll('.time-slot');
      const hourIndex = this.hours.indexOf(hour);

      if (allTimeSlots[hourIndex]) {
        allTimeSlots[hourIndex].scrollIntoView({
          behavior: 'smooth',
          block: 'center'
        });
      }
    }, 500);
  }

  public ngOnDestroy(): void {
    this.destroy$.next();
    this.destroy$.complete();

    if (this.updateCurrentHourInterval) {
      clearInterval(this.updateCurrentHourInterval);
    }

    // Complete all BehaviorSubjects
    this.selectedDate$.complete();
    this.washingMachines$.complete();
    this.dryers$.complete();
    this.washingMachineReservations$.complete();
    this.reservationsDryer$.complete();
    this.currentHour$.complete();
    this.highlightUserReservations$.complete();
    this.selectedTabIndex$.complete();
  }
}
