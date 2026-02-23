import { Component, OnDestroy, OnInit, ChangeDetectionStrategy, ChangeDetectorRef } from '@angular/core';
import { FormControl, FormsModule, ReactiveFormsModule } from "@angular/forms";
import {
  MatDatepicker,
  MatDatepickerInput,
  MatDatepickerInputEvent,
  MatDatepickerToggle
} from "@angular/material/datepicker";
import { MatFormField, MatSuffix } from "@angular/material/form-field";
import { MatIcon } from "@angular/material/icon";
import { MatIconButton, MatMiniFabButton, MatButton } from "@angular/material/button";
import { MatInput } from "@angular/material/input";
import { MatDialog } from "@angular/material/dialog";
import {
  CoworkingTable,
  CoworkingTableService
} from "../../../services/coworking-table.service";
import {
  CoworkingTableReservation,
  CoworkingTableReservationService
} from "../../../services/coworking-table-reservation.service";
import { UserService } from "../../../../services/user.service";
import { catchError, combineLatest, of, startWith, Subject, switchMap, take, takeUntil } from "rxjs";
import { map } from "rxjs/operators";
import { NgClass, NgOptimizedImage } from "@angular/common";
import {
  CoworkingTableCommentDialogComponent
} from "../shared/coworking-table-comment-dialog/coworking-table-comment-dialog.component";
import {
  CoworkingTableConfirmDialogComponent
} from "../shared/coworking-table-confirm-dialog/coworking-table-confirm-dialog.component";
import { MatProgressSpinner } from "@angular/material/progress-spinner";
import { animate, style, transition, trigger } from "@angular/animations";
import { Router } from "@angular/router";
import { MatTab, MatTabGroup } from "@angular/material/tabs";
import { TableImageDialogComponent } from "../shared/table-image-dialog/table-image-dialog.component";

@Component({
  selector: 'app-coworking-calendar-tab-content',
  imports: [
    FormsModule,
    MatDatepicker,
    MatDatepickerInput,
    MatDatepickerToggle,
    MatFormField,
    MatIcon,
    MatIconButton,
    MatButton,
    MatInput,
    MatSuffix,
    ReactiveFormsModule,
    NgClass,
    MatTabGroup,
    MatTab
  ],
  templateUrl: './coworking-calendar-tab-content.component.html',
  styleUrl: './coworking-calendar-tab-content.component.scss',
  changeDetection: ChangeDetectionStrategy.OnPush,
  standalone: true,
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
  ]
})
export class CoworkingCalendarTabContentComponent implements OnInit, OnDestroy {
  public readonly hours: number[] = Array.from(Array(18), (_, i) => i + 6); // 6-23 Uhr
  public readonly nightHours: number[] = [0, 1, 2, 3, 4, 5]; // 0-5 Uhr
  public date1 = new FormControl(new Date());

  // Simple public properties - much cleaner!
  public selectedDate: Date = new Date();
  public coworkingTables: CoworkingTable[] | null = null;
  public coworkingTableReservations: CoworkingTableReservation[] = [];
  public isLoading = true;
  public nightReservations: Map<string, CoworkingTableReservation[]> = new Map();

  private selectedCoworkingTableId: string | null = null;
  private selectedTime: number | null = null;
  private destroy$ = new Subject<void>();

  public constructor(
    private dialog: MatDialog,
    private coworkingTableService: CoworkingTableService,
    private coworkingTableReservationService: CoworkingTableReservationService,
    private userService: UserService,
    private router: Router,
    private cdr: ChangeDetectorRef
  ) {}

  public ngOnInit(): void {
    this.loadCoworkingTables();
    this.refreshReservations();
  }

  private loadCoworkingTables(): void {
    this.coworkingTableService.getCoworkingTables()
      .pipe(takeUntil(this.destroy$))
      .subscribe((tables) => {
        this.coworkingTables = tables.sort((a, b) => a.name.localeCompare(b.name));
        this.isLoading = false;
        this.cdr.markForCheck();
      });
  }

  private refreshReservations(): void {
    // Lade sowohl den aktuellen Tag als auch den Vortag (für Nachtreservierungen die über Mitternacht gehen)
    const previousDay = new Date(this.selectedDate);
    previousDay.setDate(previousDay.getDate() - 1);

    combineLatest([
      this.coworkingTableReservationService.getReservationForCurrentDay(this.selectedDate),
      this.coworkingTableReservationService.getReservationForCurrentDay(previousDay)
    ]).pipe(
      switchMap(([currentDayReservations, previousDayReservations]) => {
        // Kombiniere beide Listen
        const allReservations = [...currentDayReservations, ...previousDayReservations];

        // Filter night reservations
        this.processNightReservations(allReservations);

        if (allReservations.length > 0) {
          const userObservables = allReservations.map(reservation =>
            this.userService.getUser(reservation.user).pipe(
              map(user => ({
                ...reservation,
                originalUserId: reservation.user, // Speichere Original-ID
                user: user?.displayName?.split(' ')[0] || 'Unknown User'
              })),
              catchError(() => of({
                ...reservation,
                originalUserId: reservation.user,
                user: 'Unknown User'
              })),
              startWith({
                ...reservation,
                originalUserId: reservation.user,
                user: ''
              })
            )
          );
          return combineLatest(userObservables);
        } else {
          return of([]);
        }
      }),
      takeUntil(this.destroy$)
    )
      .subscribe(reservations => {
        this.coworkingTableReservations = reservations;
        this.cdr.markForCheck();
      });
  }

  private processNightReservations(reservations: CoworkingTableReservation[]): void {
    this.nightReservations.clear();

    const currentDayStart = new Date(this.selectedDate);
    currentDayStart.setHours(0, 0, 0, 0);
    const currentDayEnd = new Date(this.selectedDate);
    currentDayEnd.setHours(23, 59, 59, 999);

    reservations.forEach(reservation => {
      const startDate = new Date(reservation.startTime);
      const endDate = new Date(reservation.endTime);
      const startHour = startDate.getHours();

      // Prüfe ob die Reservierung AM AUSGEWÄHLTEN TAG startet
      const startsOnSelectedDay = startDate >= currentDayStart && startDate <= currentDayEnd;

      // Es ist eine Nachtreservierung wenn:
      // - Sie am ausgewählten Tag startet UND
      // - Sie entweder spät abends (ab 22:00) oder früh morgens (bis 05:59) startet
      const isNightTimeSlot = (startHour >= 22 || startHour < 6);

      if (startsOnSelectedDay && isNightTimeSlot) {
        if (!this.nightReservations.has(reservation.tableId)) {
          this.nightReservations.set(reservation.tableId, []);
        }

        // Load user name for night reservation - aber behalte originalUserId!
        const userId = reservation.user;
        const originalUserId = (reservation as any).originalUserId || reservation.user;

        if (userId && typeof userId === 'string' && userId.length > 10) {
          this.userService.getUser(userId).pipe(
            take(1),
            catchError(() => of(undefined))
          ).subscribe(user => {
            reservation.user = user?.displayName?.split(' ')[0] || 'Unbekannt';
            // Wichtig: originalUserId beibehalten!
            (reservation as any).originalUserId = originalUserId;
            this.cdr.markForCheck();
          });
        } else {
          // Falls User bereits geladen wurde, originalUserId trotzdem setzen
          (reservation as any).originalUserId = originalUserId;
        }

        this.nightReservations.get(reservation.tableId)?.push(reservation);
      }
    });
  }

  public hasNightReservations(location: 'coworking1' | 'atelier'): boolean {
    if (!this.coworkingTables) return false;

    return this.coworkingTables
      .filter(table => table.location === location)
      .some(table => this.nightReservations.has(table.id));
  }

  public getNightReservationsForLocation(location: 'coworking1' | 'atelier'): Array<{table: CoworkingTable, reservations: CoworkingTableReservation[]}> {
    if (!this.coworkingTables) return [];

    return this.coworkingTables
      .filter(table => table.location === location && this.nightReservations.has(table.id))
      .map(table => ({
        table,
        reservations: this.nightReservations.get(table.id) || []
      }));
  }

  public formatNightTimeRange(reservation: CoworkingTableReservation): string {
    const startHour = reservation.startTime.getHours();
    const endHour = reservation.endTime.getHours();
    const startDate = new Date(reservation.startTime);
    const endDate = new Date(reservation.endTime);

    // Format Start
    let startStr = `${startHour.toString().padStart(2, '0')}:00`;

    // Format End mit Kontext
    let endStr = `${endHour.toString().padStart(2, '0')}:00`;

    // Wenn über Mitternacht: zeige "→ morgen"
    if (endDate.getDate() !== startDate.getDate()) {
      return `${startStr} → ${endStr} Uhr (morgen)`;
    }

    return `${startStr} - ${endStr} Uhr`;
  }

  public getNightButtonText(): string {
    const now = new Date();
    const selectedDayStart = new Date(this.selectedDate);
    selectedDayStart.setHours(0, 0, 0, 0);
    const selectedDayEnd = new Date(this.selectedDate);
    selectedDayEnd.setHours(23, 59, 59, 999);

    const isToday = now >= selectedDayStart && now <= selectedDayEnd;

    if (!isToday) {
      // Wenn ein anderer Tag ausgewählt ist
      return 'Für diese Nacht reservieren';
    }

    const currentHour = now.getHours();

    // Wenn es bereits Nacht ist (22:00 - 05:59), dann ist es "jetzt / heute Nacht"
    if (currentHour >= 22 || currentHour < 6) {
      return 'Für jetzt / heute Nacht reservieren';
    }

    // Wenn es Tag ist (6:00 - 21:59), dann ist es "heute Nacht / morgen früh"
    return 'Für heute Nacht / morgen früh reservieren';
  }

  public getNightBannerTitle(): string {
    const now = new Date();
    const selectedDayStart = new Date(this.selectedDate);
    selectedDayStart.setHours(0, 0, 0, 0);
    const selectedDayEnd = new Date(this.selectedDate);
    selectedDayEnd.setHours(23, 59, 59, 999);

    const isToday = now >= selectedDayStart && now <= selectedDayEnd;

    if (!isToday) {
      // Wenn ein anderer Tag ausgewählt ist
      return 'Nachtreservierungen (22:00 - 06:00)';
    }

    const currentHour = now.getHours();

    // Wenn es bereits Nacht ist
    if (currentHour >= 22 || currentHour < 6) {
      return 'Jetzt / heute Nacht (22:00 - 06:00)';
    }

    // Wenn es Tag ist
    return 'Heute Nacht / morgen früh (22:00 - 06:00)';
  }

  public openTableImageDialog(table: CoworkingTable): void {
    const imageUrl = this.getTableImage(table);

    this.dialog.open(TableImageDialogComponent, {
      width: '90vw',
      maxWidth: '100vw',
      height: 'auto',
      panelClass: 'full-width-dialog',
      data: {
        image: imageUrl
      }
    });
  }

  public previousDate(): void {
    const date = new Date(this.selectedDate);
    date.setDate(date.getDate() - 1);
    this.selectedDate = date;
    this.date1.setValue(date);
    this.refreshReservations();
  }

  public nextDate(): void {
    const date = new Date(this.selectedDate);
    date.setDate(date.getDate() + 1);
    this.selectedDate = date;
    this.date1.setValue(date);
    this.refreshReservations();
  }

  public onDateChange(event: MatDatepickerInputEvent<any, any>): void {
    if (event.value) {
      this.selectedDate = event.value;
      this.refreshReservations();
    }
  }

  public handleCoworkingTableSlotClick(table: CoworkingTable, name: string, hour: number): void {
    const reservation = this.getReservationForCoworkingTable(table, hour);

    if (reservation?.user !== 'Frei') {
      // Prüfe ob es die eigene Reservierung ist
      this.userService.userId$?.pipe(take(1)).subscribe((userId) => {
        const originalUserId = (reservation as any)?.originalUserId;
        if (reservation?.id && originalUserId && originalUserId === userId) {
          // Eigene Reservierung - zeige Löschen-Dialog
          this.openDeleteReservationDialog(reservation);
        } else {
          // Fremde Reservierung - zeige nur Kommentar
          this.dialog.open(CoworkingTableCommentDialogComponent, {
            data: {
              comment: reservation?.comment,
            }
          });
        }
      });
    } else {
      this.userService.userId$?.pipe(take(1)).subscribe((userId) => {
        if (!userId) {
          this.router.navigate(['/login']);
        } else {
          this.selectedCoworkingTableId = table.id;
          this.selectedTime = hour;
          this.dialog.open(CoworkingTableConfirmDialogComponent, {
            data: {
              tableId: table.id,
              tableName: table.name,
              time: hour,
              date: this.selectedDate,
              userId: userId
            }
          });
        }
      });
    }
  }

  private openDeleteReservationDialog(reservation: CoworkingTableReservation): void {
    const dialogRef = this.dialog.open(CoworkingTableConfirmDialogComponent, {
      data: {
        isDeleteMode: true,
        reservation: reservation,
        tableName: this.coworkingTables?.find(t => t.id === reservation.tableId)?.name || 'Unbekannt'
      }
    });
  }

  public handleNightReservationClick(reservation: CoworkingTableReservation): void {
    // Prüfe ob es die eigene Reservierung ist
    this.userService.userId$?.pipe(take(1)).subscribe((userId) => {
      const originalUserId = (reservation as any)?.originalUserId;
      if (reservation?.id && originalUserId && originalUserId === userId) {
        // Eigene Reservierung - zeige Löschen-Dialog
        this.openDeleteReservationDialog(reservation);
      } else {
        // Fremde Reservierung - zeige nur Kommentar
        this.dialog.open(CoworkingTableCommentDialogComponent, {
          data: {
            comment: reservation.comment,
          }
        });
      }
    });
  }

  public openNightReservationDialog(location: 'coworking1' | 'atelier'): void {
    this.userService.userId$?.pipe(take(1)).subscribe((userId) => {
      if (!userId) {
        this.router.navigate(['/login']);
      } else {
        // Open a dialog to select table and time for night reservation
        const availableTables = this.coworkingTables?.filter(t => t.location === location && t.status === 'available') || [];

        if (availableTables.length === 0) {
          alert('Keine verfügbaren Tische in diesem Bereich');
          return;
        }

        // For simplicity, use the confirm dialog with modified data
        // You might want to create a separate dialog for night reservations
        this.dialog.open(CoworkingTableConfirmDialogComponent, {
          data: {
            tableId: availableTables[0].id,
            tableName: availableTables[0].name,
            time: 0, // Start at midnight
            date: this.selectedDate,
            userId: userId,
            isNightReservation: true,
            availableTables: availableTables
          }
        });
      }
    });
  }

  public getReservationForCoworkingTable(table: CoworkingTable, hour: number): CoworkingTableReservation | undefined {
    const date = new Date(this.selectedDate);
    date.setHours(hour, 0, 0, 0);

    const reservation = this.coworkingTableReservations.find(
      (r) => r.tableId === table.id && r.startTime <= date && r.endTime > date
    );

    if (reservation) {
      return reservation;
    }

    if (table.status === 'available') {
      return {
        type: 'coworkingTable',
        tableId: table.id,
        startTime: date,
        endTime: new Date(date.getTime() + 60 * 60 * 1000),
        user: 'Frei',
      };
    }

    return undefined;
  }

  public isCoworking1(table: CoworkingTable): boolean {
    return table.location === 'coworking1';
  }

  public isAtelier(table: CoworkingTable): boolean {
    return table.location === 'atelier';
  }

  public trackByTableId(index: number, table: CoworkingTable): string {
    return table.id;
  }

  public trackByHour(index: number, hour: number): number {
    return hour;
  }

  public getTableImage(table: CoworkingTable): string {
    const basePath = 'assets/images/coworking/';

    switch (table.orderNo) {
      case 1:
        return `${basePath}table_1.jpg`;
      case 2:
        return `${basePath}table_2.jpg`;
      case 3:
        return `${basePath}table_3.jpg`;
      default:
        return `${basePath}table1.jpg`;
    }
  }

  public ngOnDestroy(): void {
    this.destroy$.next();
    this.destroy$.complete();
  }
}
