import { Component, OnInit, OnDestroy, inject, ChangeDetectorRef } from '@angular/core';

import { CommonModule } from '@angular/common';
import { MobilityResourceService, MobilityResource } from '../../services/mobility-resource.service';
import { MobilityReservationService, MobilityReservation } from '../../services/mobility-reservation.service';
import { switchMap, map, takeUntil, startWith, take } from 'rxjs/operators';
import { Subject, timer, combineLatest, of } from 'rxjs';
import { MatDialog } from '@angular/material/dialog';
import { isSameDay, format } from 'date-fns';
import { MobilityBookingDialogComponent } from '../mobility-booking-dialog/mobility-booking-dialog.component';
import { MatSnackBar } from '@angular/material/snack-bar';
import { AuthService } from 'src/app/core/auth.service';
import { UserService } from 'src/app/services/user.service';

interface TimelineBlock {
  left: number; // percentage
  width: number; // percentage
  type: 'free' | 'busy';
  label?: string;
  tooltip: string;
  userId: string;       // Added
  reservationId?: string; // Added
  occupantName?: string; // Added
}

@Component({
  selector: 'app-mobility-dashboard-card',
  templateUrl: './mobility-dashboard-card.component.html',
  styleUrls: ['./mobility-dashboard-card.component.scss'],
  standalone: false,

})
export class MobilityDashboardCardComponent implements OnInit, OnDestroy {
  private resourceService = inject(MobilityResourceService);
  private reservationService = inject(MobilityReservationService);
  private dialog = inject(MatDialog);
  private snackBar = inject(MatSnackBar);
  private authService = inject(AuthService);
  private userService = inject(UserService); // Added missing injection
  private cdr = inject(ChangeDetectorRef);

  private destroy$ = new Subject<void>();

  resource: MobilityResource | undefined;
  reservations: MobilityReservation[] = [];

  // UX State
  statusColor: 'green' | 'yellow' | 'red' = 'green';
  statusText: string = 'Laden...';

  // Timeline State
  timelineBlocks: TimelineBlock[] = [];
  activeBlock: TimelineBlock | null = null; // Added
  currentTimePosition: number = 0; // percentage
  timelineStartHour = 6; // 06:00
  timelineEndHour = 24;  // 24:00

  currentOccupantName: string | null = null;
  activeReservation: MobilityReservation | null = null; // Current user's active reservation
  private returnedReservationIds = new Set<string>(); // Locally tracked returned IDs to handle race conditions
  private lastResolvedUserId: string | null = null;

  currentUserId: string | null = null;

  ngOnInit(): void {
    this.authService.isLoggedIn$.pipe(takeUntil(this.destroy$)).subscribe(user => {
      this.currentUserId = user ? user.uid : null;
    });

    this.resourceService.getResource('cargo-bike-01').pipe(
      takeUntil(this.destroy$),
      switchMap(resource => {
        this.resource = resource;
        if (!resource) return of([]);
        return combineLatest([
          this.reservationService.getReservationsForDay(resource.id, new Date()),
          timer(0, 60000).pipe(map(() => new Date()))
        ]);
      })
    ).subscribe((result) => {
      if (Array.isArray(result) && result.length === 2 && Array.isArray(result[0])) {
        const [reservations, now] = result as [MobilityReservation[], Date];
        this.reservations = reservations;
        this.updateStatus(now);
        this.updateTimeline(now);
        this.cdr.markForCheck();
      }
    });

    this.refresh();
  }

  refresh() { } // Placeholder

  updateStatus(now: Date) {
    if (!this.resource) return;

    // Sort by start time just in case
    const sorted = [...this.reservations].sort((a, b) => a.startTime.getTime() - b.startTime.getTime());

    const currentReservationIdx = sorted.findIndex(r =>
      now >= r.startTime && now < r.endTime && !this.returnedReservationIds.has(r.id!)
    );

    if (currentReservationIdx !== -1) {
      let endTime = sorted[currentReservationIdx].endTime;

      // Check for contiguous reservations
      let nextIdx = currentReservationIdx + 1;
      while (nextIdx < sorted.length) {
        const nextRes = sorted[nextIdx];
        // If next starts before or exactly when current ends (with 1 min tolerance perhaps?)
        if (nextRes.startTime.getTime() <= endTime.getTime() + 60000) {
          if (nextRes.endTime > endTime) {
            endTime = nextRes.endTime;
          }
          nextIdx++;
        } else {
          break;
        }
      }

      this.statusColor = 'red';
      const isMultiDay = !isSameDay(now, endTime);
      const timeStr = this.formatTime(endTime);
      this.statusText = isMultiDay
        ? `Belegt bis ${timeStr} (${format(endTime, 'dd.MM.')})`
        : `Belegt bis ${timeStr}`;

      // Fetch occupant name if different from last loaded
      const activeRes = sorted[currentReservationIdx];

      // Check if it's OUR reservation AND not just returned
      if (activeRes.userId === this.currentUserId && !this.returnedReservationIds.has(activeRes.id!)) {
        this.activeReservation = activeRes;
      } else {
        this.activeReservation = null;
      }

      if (activeRes.userId !== this.lastResolvedUserId) {
        this.lastResolvedUserId = activeRes.userId;
        this.userService.getUser(activeRes.userId).pipe(take(1)).subscribe(u => {
          this.currentOccupantName = u?.displayName || 'Unbekannt';
        });
      }
    } else {
      this.currentOccupantName = null;
      this.activeReservation = null;
      this.lastResolvedUserId = null;

      const nextReservation = sorted.find(r => r.startTime > now);

      if (nextReservation) {
        this.statusColor = 'yellow';
        this.statusText = `Frei bis ${this.formatTime(nextReservation.startTime)}`;
      } else {
        this.statusColor = 'green';
        this.statusText = 'Jetzt verfügbar';
      }
    }
  }

  updateTimeline(now: Date) {
    // Fixed Scale: 06:00 to 24:00
    const startOfDay = new Date(now);
    startOfDay.setHours(this.timelineStartHour, 0, 0, 0);

    const endOfDay = new Date(now);
    endOfDay.setHours(this.timelineEndHour, 0, 0, 0);

    const totalDuration = endOfDay.getTime() - startOfDay.getTime();

    // Calculate Current Time Position
    const nowPos = Math.min(Math.max((now.getTime() - startOfDay.getTime()) / totalDuration, 0), 1) * 100;
    this.currentTimePosition = nowPos;

    // Generate Blocks
    const blocks: TimelineBlock[] = [];
    const relevantReservations = this.reservations.filter(r =>
      r.endTime > startOfDay && r.startTime < endOfDay
    );

    relevantReservations.forEach(r => {
      const start = Math.max(r.startTime.getTime(), startOfDay.getTime());
      const end = Math.min(r.endTime.getTime(), endOfDay.getTime());

      const left = ((start - startOfDay.getTime()) / totalDuration) * 100;
      const width = ((end - start) / totalDuration) * 100;

      blocks.push({
        left,
        width,
        type: 'busy',
        tooltip: `${this.formatTime(r.startTime)} - ${this.formatTime(r.endTime)}`,
        userId: r.userId,
        reservationId: r.id
      });
    });

    this.timelineBlocks = blocks;
  }

  formatTime(date: Date): string {
    return date.toLocaleTimeString('de-DE', { hour: '2-digit', minute: '2-digit' });
  }

  openBookingDialog() {
    if (!this.resource || !this.currentUserId) return;

    const dialogRef = this.dialog.open(MobilityBookingDialogComponent, {
      data: { resource: this.resource, userId: this.currentUserId },
      width: '500px', // Increased width
      maxWidth: '95vw' // Responsive fallback
    });

    dialogRef.afterClosed().subscribe(result => {
      if (result) {
        this.snackBar.open('Reservierung erfolgreich!', 'OK', { duration: 3000 });
      }
    });
  }

  async returnBike() {
    if (!this.activeReservation?.id) return;
    if (!confirm('Möchtest du das Rad wirklich jetzt zurückgeben?')) return;

    try {
      const reservationId = this.activeReservation.id;
      // Optimistically ignore this reservation ID immediately
      this.returnedReservationIds.add(reservationId);

      const now = new Date();
      const startTime = this.activeReservation.startTime;
      const durationMs = now.getTime() - startTime.getTime();
      const tenMinutesMs = 10 * 60 * 1000;

      if (durationMs < tenMinutesMs) {
        // Less than 10 minutes: Delete completely
        await this.reservationService.deleteReservation(reservationId);
        this.snackBar.open('Reservierung gelöscht (da unter 10 Min).', 'OK', { duration: 3000 });
      } else {
        // Constructive return
        await this.reservationService.returnBikeNow(reservationId);
        this.snackBar.open('Rad erfolgreich zurückgegeben!', 'OK', { duration: 3000 });
      }

      this.activeReservation = null; // Clear immediately
    } catch (error) {
      console.error(error);
      this.snackBar.open('Fehler beim Zurückgeben.', 'OK', { duration: 3000 });
    }
  }

  onBlockClick(block: TimelineBlock) {
    if (this.activeBlock === block) {
      this.activeBlock = null;
      return;
    }

    this.activeBlock = block;

    if (!block.occupantName) {
      this.userService.getUser(block.userId).pipe(take(1)).subscribe(u => {
        block.occupantName = u?.displayName || 'Unbekannt';
        this.cdr.markForCheck();
      });
    }

    // Auto-hide after 3 seconds
    timer(3000).pipe(takeUntil(this.destroy$)).subscribe(() => {
      if (this.activeBlock === block) {
        this.activeBlock = null;
        this.cdr.markForCheck();
      }
    });
  }

  ngOnDestroy() {
    this.destroy$.next();
    this.destroy$.complete();
  }
}
