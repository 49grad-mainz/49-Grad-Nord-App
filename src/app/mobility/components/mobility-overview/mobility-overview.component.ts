import { Component, OnInit, OnDestroy, inject, ChangeDetectorRef } from '@angular/core';
import { AuthService } from 'src/app/core/auth.service';
import { MobilityResourceService, MobilityResource } from '../../services/mobility-resource.service';
import { MobilityReservationService, MobilityReservation } from '../../services/mobility-reservation.service';
import { UserService } from 'src/app/services/user.service';
import { Subject, takeUntil, startWith, switchMap, combineLatest, map, of, forkJoin } from 'rxjs';
import { startOfWeek, addDays, format, isSameDay } from 'date-fns';
import { de } from 'date-fns/locale';
import { MatDialog } from '@angular/material/dialog';
import { MobilityReservationDetailsComponent } from '../mobility-reservation-details/mobility-reservation-details.component';
import { ConfirmationDialogComponent } from 'src/app/shared/confirmation-dialog/confirmation-dialog.component';

interface CalendarDay {
  date: Date;
  label: string;
  isToday: boolean;
  slots: any[]; // Placeholder for visual slots if needed
}

interface EnhancedReservation extends MobilityReservation {
  userName?: string;
}

@Component({
  selector: 'app-mobility-overview',
  templateUrl: './mobility-overview.component.html',
  styleUrls: ['./mobility-overview.component.scss'],
  standalone: false
})

export class MobilityOverviewComponent implements OnInit, OnDestroy {
  private resourceService = inject(MobilityResourceService);
  private reservationService = inject(MobilityReservationService);
  private userService = inject(UserService);
  private dialog = inject(MatDialog);
  private authService = inject(AuthService); // Added
  private cdr = inject(ChangeDetectorRef);
  private destroy$ = new Subject<void>();

  resource: MobilityResource | undefined;
  weekDays: CalendarDay[] = [];
  reservations: EnhancedReservation[] = [];

  currentUserId: string | null = null;

  // ...

  viewMode: 'week' | 'list' = 'week';
  showPast: boolean = false;
  currentWeekStart: Date = startOfWeek(new Date(), { weekStartsOn: 1 }); // Monday start

  ngOnInit(): void {
    // Subscribe to user ID from AuthService
    this.authService.isLoggedIn$.pipe(takeUntil(this.destroy$)).subscribe(user => {
      // console.log('Current User:', user?.uid); // Debugging
      this.currentUserId = user ? user.uid : null;
      this.cdr.markForCheck(); // Ensure UI updates when ID is loaded
    });

    this.generateWeek(this.currentWeekStart);

    this.resourceService.getResource('cargo-bike-01').pipe(
      takeUntil(this.destroy$),
      switchMap(res => {
        this.resource = res;
        if (!res) return of([]);
        return this.reservationService.getReservations(res.id);
      }),
      switchMap(reservations => {
        if (reservations.length === 0) return of([]);

        // Get unique user IDs
        const userIds = [...new Set(reservations.map(r => r.userId))];

        return this.userService.getUsers(userIds).pipe(
          map(users => {
            const userMap = new Map(users.map(u => [u.uid, u.displayName]));
            return reservations.map(r => ({
              ...r,
              userName: userMap.get(r.userId) || 'Unbekannt'
            }));
          })
        );
      })
    ).subscribe(reservations => {
      this.reservations = reservations;
      this.cdr.markForCheck();
    });
  }

  generateWeek(start: Date) {
    this.weekDays = [];
    for (let i = 0; i < 7; i++) {
      const d = addDays(start, i);
      this.weekDays.push({
        date: d,
        label: format(d, 'EEEE, dd.MM.', { locale: de }),
        isToday: isSameDay(d, new Date()),
        slots: []
      });
    }
  }

  getReservationsForDay(date: Date): EnhancedReservation[] {
    return this.reservations.filter(r => {
      // Check overlap with this day (00:00 - 23:59)
      const dayStart = new Date(date); dayStart.setHours(0, 0, 0, 0);
      const dayEnd = new Date(date); dayEnd.setHours(23, 59, 59, 999);

      return r.startTime <= dayEnd && r.endTime >= dayStart;
    }).sort((a, b) => a.startTime.getTime() - b.startTime.getTime());
  }

  get myReservations(): EnhancedReservation[] {
    if (!this.currentUserId) return [];
    return this.reservations.filter(r => r.userId === this.currentUserId);
  }

  formatTime(date: Date): string {
    return format(date, 'HH:mm');
  }

  formatDate(date: Date): string {
    return format(date, 'dd.MM.yyyy', { locale: de });
  }

  nextWeek() {
    this.currentWeekStart = addDays(this.currentWeekStart, 7);
    this.generateWeek(this.currentWeekStart);
  }

  previousWeek() {
    this.currentWeekStart = addDays(this.currentWeekStart, -7);
    this.generateWeek(this.currentWeekStart);
  }

  goToCurrentWeek() {
    this.currentWeekStart = startOfWeek(new Date(), { weekStartsOn: 1 });
    this.generateWeek(this.currentWeekStart);
  }

  toggleViewMode() {
    this.viewMode = this.viewMode === 'week' ? 'list' : 'week';
  }

  get sortedReservations(): EnhancedReservation[] {
    const now = new Date();
    let filtered = this.reservations;

    if (!this.showPast) {
      filtered = filtered.filter(r => r.endTime >= now);
    }

    return [...filtered].sort((a, b) => a.startTime.getTime() - b.startTime.getTime());
  }

  getErrorState(res: MobilityReservation): boolean {
    // Logic for status colors if needed
    return false;
  }

  openReservationDetails(res: EnhancedReservation) {
    const dialogRef = this.dialog.open(MobilityReservationDetailsComponent, {
      data: { reservation: res, userName: res.userName },
      width: '400px',
      panelClass: 'mobility-details-dialog' // Optional for theming
    });

    dialogRef.afterClosed().subscribe(async result => {
      if (result?.action === 'delete') {
        try {
          if (res.id) {
            await this.reservationService.deleteReservation(res.id);
          }
        } catch (e) {
          console.error(e);
          alert('Fehler beim Löschen');
        }
      }
    });
  }

  async onDeleteReservation(res: MobilityReservation) {
    if (res.id) {
      if (!this.resource) return;

      const dialogRef = this.dialog.open(ConfirmationDialogComponent, {
        data: {
          title: 'Reservierung löschen?',
          message: 'Möchtest du diese Reservierung wirklich löschen?',
          // Required fields for ConfirmationDialogComponent
          eventName: res.comment || 'Lastenrad Buchung',
          fromDateTime: res.startTime,
          toDateTime: res.endTime,
          roomName: this.resource.name,
          isPrivate: false,
          reservationId: res.id,
          userId: res.userId,
          buttonText: {
            ok: 'Löschen',
            cancel: 'Abbrechen'
          },
          mode: 'delete'
        }
      });

      dialogRef.afterClosed().subscribe(async result => {
        if (result?.action === 'delete') {
          try {
            await this.reservationService.deleteReservation(res.id!);
            this.cdr.markForCheck();
          } catch (e) {
            console.error(e);
            alert('Fehler beim Löschen');
          }
        }
      });
    }
  }

  ngOnDestroy() {
    this.destroy$.next();
    this.destroy$.complete();
  }
}
