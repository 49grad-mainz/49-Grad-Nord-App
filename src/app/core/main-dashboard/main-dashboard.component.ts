import { Beamer, InventoryService } from '../../inventory/services/inventory.service';
import { ChangeDetectionStrategy, ChangeDetectorRef, Component, inject, OnDestroy, OnInit } from '@angular/core';
import { AuthService } from "../auth.service";
import { UserService } from "../../services/user.service";
import { BehaviorSubject, catchError, combineLatest, of, Subject, switchMap, takeUntil } from "rxjs";
import { Reservation, RoomReservationsService } from "../../raumbelegung/services/room-reservations.service";
import { SnackbarService } from "../../services/snackbar.service";
import { RoomsService } from "../../raumbelegung/services/rooms.service";
import { PromptUpdateService } from "../services/prompt-update.service";
import { format, isToday, isTomorrow, isYesterday } from 'date-fns';
import { de } from 'date-fns/locale';
import { animate, style, transition, trigger } from '@angular/animations';
import { MatDialog } from '@angular/material/dialog';
import {
  ConfirmationDialogComponent,
  ConfirmationDialogData
} from "../../shared/confirmation-dialog/confirmation-dialog.component";
import { GoogleCalendarService } from "../../services/google-calendar.service";
import { WashingMachineService } from "../../waschen/services/washing-machine.service";
import { DryerService } from "../../waschen/services/dryers-service";
import { WashingMachineReservationService } from "../../waschen/services/washing-machine-reservation.service";
import { DryerReservationService } from "../../waschen/services/dryer-reservation.service";
import { Router } from "@angular/router";
import { CoworkingTableService, CoworkingTable } from '../../coworking/services/coworking-table.service';
import {
  CoworkingTableReservationService,
  CoworkingTableReservation
} from '../../coworking/services/coworking-table-reservation.service';
import { map } from "rxjs/operators";
import {
  CoworkingInfoDialogComponent,
  CoworkingInfoDialogData
} from "../components/coworking-info-dialog/coworking-info-dialog.component";
import { Item, ItemService } from "../../gemeinschafts-haushalt/services/werkzeug.service";
import { QuickWashDialogComponent, QuickWashDialogData } from '../components/quick-wash-dialog/quick-wash-dialog.component';
import {
  DryerReservation,
  WashingMachineReservation
} from "../../waschen/waschen-index/waschen-overview/washing-calendar-tab-content/washing-calendar-tab-content.component";
import { UserPhoneNumberService } from "../../services/user-phone-number.service";
import {
  ReservationDetailDialogComponent,
  ReservationDetailDialogData,
  ReservationDetailAction
} from "../../shared/reservation-detail-dialog/reservation-detail-dialog.component";
import { isSameDay } from '../../shared/date.utils';

// Interface für den Coworking-Status
interface CoworkingTableStatus {
  tableId: string;
  tableName: string;
  location: 'coworking1' | 'atelier';
  orderNo: number;
  isFree: boolean;
  occupantName?: string; // Vorname der Person
  occupiedUntil?: Date;
}

interface EnhancedReservation extends Reservation {
  roomName: string;
  formattedTimeRange: string;
  isToday: boolean;
  isInProgress: boolean;
  isFinished: boolean;
  isBirthday?: boolean;
  isGoogleCalendarEvent?: boolean;
  creatorName?: string; // ← NEU
  creatorPhoneNumber?: string | null; // ← NEU
}

interface MachineStatus {
  machineId: string;
  machineName: string;
  orderNo: number;
  isFreeNow: boolean;
  isAvailableNext4Hours: boolean;
  hasFutureReservations: boolean; // Neu
  busyUntil?: Date; // Neu
}

@Component({
  selector: 'app-main-dashboard',
  templateUrl: './main-dashboard.component.html',
  styleUrls: ['./main-dashboard.component.scss'],
  changeDetection: ChangeDetectionStrategy.OnPush,
  animations: [
    trigger('fadeInOut', [
      transition(':enter', [
        style({ opacity: 0 }),
        animate('100ms ease-in', style({ opacity: 1 }))
      ]),
      transition(':leave', [
        animate('100ms ease-out', style({ opacity: 0 }))
      ])
    ])
  ],
  standalone: false
})
export class MainDashboardComponent implements OnInit, OnDestroy {
  // Coworking status
  private coworkingTableService = inject(CoworkingTableService);
  private coworkingTableReservationService = inject(CoworkingTableReservationService);

  public coworkingStatus: CoworkingTableStatus[] = [];

  public readonly userDisplayName$ = this.userService.userDisplayNameFromFirestore$;
  public readonly currentUserId$ = this.userService.userId$;
  public upcomingEvents: EnhancedReservation[] = [];
  // public showEvents$ = this.userService.showEvents$;
  public isLoading = true;

  // Add update service observable
  public readonly hasUpdate$ = this.promptUpdateService.hasUpdate$;

  private userId: string | null = null;
  private destroy$ = new Subject<void>();
  public readonly isLoggedIn$ = this.authService.isLoggedIn$.pipe(takeUntil(this.destroy$));

  // für Trockner und Waschmaschinenstatus
  private washingMachineService = inject(WashingMachineService);
  private washingMachinesReservationService = inject(WashingMachineReservationService);
  private dryerService = inject(DryerService);
  private dryersReservationService = inject(DryerReservationService);
  private currentWashingReservations: WashingMachineReservation[] = [];
  private currentDryerReservations: DryerReservation[] = [];

  public washingMachineStatus: MachineStatus[] = [];
  public dryerStatus: MachineStatus[] = [];

  private itemService = inject(ItemService);

  // TV / Beamer properties
  public readonly beamerState$: BehaviorSubject<Beamer> = new BehaviorSubject<Beamer>({
    available: true,
    category: 'audio-visual',
    condition: 'excellent',
    description: '',
    image: '',
    location: '',
    model: '',
    name: '',
    orderNo: 0,
    inUseNowInCommonRoom: false,
    showing: '',
  })

  constructor(
    private cdr: ChangeDetectorRef,
    private authService: AuthService,
    private userService: UserService,
    private roomReservationsService: RoomReservationsService,
    private inventoryService: InventoryService,
    private roomsService: RoomsService,
    private snackBar: SnackbarService,
    private promptUpdateService: PromptUpdateService,
    private dialog: MatDialog,
    private googleCalendarService: GoogleCalendarService,
    private router: Router,
    private userPhoneNumberService: UserPhoneNumberService // ← NEU
  ) {
  }

  private isEventActive(startDate: Date, endDate: Date): boolean {
    const now = new Date();
    return now >= startDate && now <= endDate;
  }

  public getAvailableCount(statuses: MachineStatus[]): number {
    return statuses.filter(status => status.isAvailableNext4Hours).length;
  }


  private formatTimeRange(startDate: Date, endDate: Date): string {
    const formatTime = (date: Date) => format(date, 'HH:mm', { locale: de });
    const formatDate = (date: Date) => format(date, 'EEEE, dd.MM.yyyy', { locale: de });

    // Prüfen ob Start- und Enddatum am gleichen Tag sind
    const sameDay = isSameDay(startDate, endDate);

    const startTime = formatTime(startDate);
    const endTime = formatTime(endDate);

    // Datum-Präfix für Startdatum
    let startDatePrefix = '';
    if (isToday(startDate)) {
      startDatePrefix = '';
    } else if (isTomorrow(startDate)) {
      startDatePrefix = 'Morgen';
    } else if (isYesterday(startDate)) {
      startDatePrefix = 'Gestern';
    } else {
      startDatePrefix = formatDate(startDate);
    }

    // Wenn Start- und Enddatum am gleichen Tag sind (bisheriges Verhalten)
    if (sameDay) {
      return startDatePrefix
        ? `${startDatePrefix}, ${startTime} - ${endTime}`
        : `${startTime} - ${endTime}`;
    }

    // Wenn sich die Reservierung über mehrere Tage erstreckt
    let endDatePrefix = '';
    if (isToday(endDate)) {
      endDatePrefix = 'heute';
    } else if (isTomorrow(endDate)) {
      endDatePrefix = 'morgen';
    } else if (isYesterday(endDate)) {
      endDatePrefix = 'gestern';
    } else {
      endDatePrefix = formatDate(endDate);
    }

    // Formatierung für mehrtägige Reservierungen
    const startPart = startDatePrefix
      ? `${startDatePrefix}, ${startTime}`
      : `${startTime}`;

    const endPart = `${endDatePrefix}, ${endTime}`;

    return `${startPart} - ${endPart}`;
  }

  // Add method to handle app update
  public onUpdateApp(): void {
    this.promptUpdateService.updateApp();
  }

  // Add method to dismiss update notification (optional)
  public onDismissUpdate(): void {
    this.promptUpdateService.dismissUpdate();
  }

  public async onReservationClick(reservation: EnhancedReservation): Promise<void> {
    if (reservation.isGoogleCalendarEvent) {
      return; // Calendar Events können nicht bearbeitet werden
    }
    if (!reservation.id || !this.userId) {
      return;
    }

    const viewerHasPhoneNumber = await this.userPhoneNumberService.userHasPhoneNumber(this.userId);
    const isOwner = reservation.userId === this.userId;

    const dialogData: ReservationDetailDialogData = {
      reservation: reservation,
      creatorName: reservation.creatorName || 'Unbekannt',
      creatorPhoneNumber: reservation.creatorPhoneNumber,
      isOwner: isOwner,
      viewerHasPhoneNumber: viewerHasPhoneNumber,
      roomName: reservation.roomName
    };

    const dialogRef = this.dialog.open(ReservationDetailDialogComponent, {
      data: dialogData,
      width: '400px'
    });

    dialogRef.afterClosed().subscribe((result: { action: ReservationDetailAction }) => {
      if (!result) return;

      if (result.action === 'addPhoneNumber') {
        this.router.navigate(['/profile'], { queryParams: { tab: 1 } });
      } else if (result.action === 'edit' && isOwner) {
        this.openEditDialog(reservation);
      } else if (result.action === 'delete' && isOwner) {
        this.confirmDelete(reservation);
      }
    });
  }

  private openEditDialog(reservation: EnhancedReservation): void {
    const dialogData: ConfirmationDialogData = {
      message: '',
      eventName: reservation.eventName,
      fromDateTime: reservation.fromDateTime,
      toDateTime: reservation.toDateTime,
      roomName: reservation.roomName,
      isPrivate: reservation.isPrivate,
      reservationId: reservation.id || '',
      userId: reservation.userId,
      buttonText: {
        ok: 'Bearbeiten',
        cancel: 'Schließen'
      },
      mode: 'edit'
    };

    const dialogRef = this.dialog.open(ConfirmationDialogComponent, {
      data: dialogData,
    });

    dialogRef.afterClosed().subscribe((result: any) => {
      if (result?.action === 'updated') {
        this.snackBar.success('Reservierung erfolgreich aktualisiert');
        this.loadOnlyRoomReservations();
      } else if (result?.action === 'delete') {
        this.confirmDelete(reservation);
      }
    });
  }

  private confirmDelete(reservation: EnhancedReservation): void {
    this.roomReservationsService.deleteReservation(reservation.id as string).then(() => {
      this.snackBar.success('Reservierung erfolgreich gelöscht');
      this.loadOnlyRoomReservations();
    }).catch(error => {
      this.snackBar.error('Fehler beim Löschen der Reservierung');
      console.error(error);
    });
  }

  public onDeleteReservation(event: Event, reservation: EnhancedReservation): void {
    event.stopPropagation(); // Prevent triggering the edit dialog

    if (reservation.isGoogleCalendarEvent) {
      return; // Calendar Events können nicht bearbeitet werden
    }

    if (!reservation.id || !this.userId) {
      return;
    }

    // Only allow deleting if user is the owner
    if (reservation.userId !== this.userId) {
      return;
    }

    const dialogData: ConfirmationDialogData = {
      message: 'Möchtest du die folgende Reservierung wirklich löschen?',
      eventName: reservation.eventName,
      fromDateTime: reservation.fromDateTime,
      toDateTime: reservation.toDateTime,
      roomName: reservation.roomName,
      isPrivate: reservation.isPrivate,
      reservationId: reservation.id,
      userId: reservation.userId,
      buttonText: {
        ok: 'Löschen',
        cancel: 'Abbrechen'
      },
      mode: 'delete'
    };

    const dialogRef = this.dialog.open(ConfirmationDialogComponent, {
      data: dialogData,
    });

    dialogRef.afterClosed().subscribe((result: any) => {
      if (result?.action === 'delete') {
        this.confirmDelete(reservation);
      }
    });
  }

  private isBirthdayEvent(eventName: string): boolean {
    return eventName?.toLowerCase().includes('geburtstag') || false;
  }

  ngOnInit(): void {
    this.isLoggedIn$.pipe(
      takeUntil(this.destroy$)
    ).subscribe(user => {
      if (user) {
        this.userId = user.uid;
        this.loadOnlyRoomReservations();
        this.checkWasherAndDryerStatus();
      }
    });

    this.checkCoworkingStatus();

  }

  public get myBorrowedItems(): Item[] {
    if (!this.userId) return [];
    return this.itemService.items().filter(item =>
      item.isBorrowed && item.borrowedByUserId === this.userId
    );
  }

  // Icon Helper (gleich wie in der Haushalt-Komponente)
  public getItemIcon(item: Item): string {
    const iconMap: Record<string, string> = {
      'Werkzeug': 'build',
      'Elektronik': 'devices',
      'Garten': 'yard',
      'Küche': 'kitchen',
      'Haushalt': 'home',
      'Sport': 'sports',
      'Kinder': 'child_care'
    };
    return iconMap[item.category] || 'category';
  }

  // Navigation
  public navigateToHaushalt(): void {
    this.router.navigate(['/gemeinschafts-haushalt']); // oder wie auch immer deine Route heißt
  }

  // Klick auf Item
  public onBorrowedItemClick(item: Item): void {
    this.router.navigate(['/gemeinschafts-haushalt']); // Optional: mit Query-Param zum Item springen
  }

  // Quick Return
  public async onQuickReturn(item: Item, event: Event): Promise<void> {
    event.stopPropagation();

    if (confirm(`"${item.name}" zurückgeben?`)) {
      try {
        await this.itemService.returnItem(item.id);
        this.snackBar.success(`"${item.name}" zurückgegeben`);
        this.cdr.markForCheck();
      } catch (error) {
        this.snackBar.error('Fehler beim Zurückgeben');
      }
    }
  }

  ngOnDestroy() {
    this.destroy$.next();
    this.destroy$.complete();
  }

  private checkCoworkingStatus(): void {
    combineLatest([
      this.coworkingTableService.getCoworkingTables(),
      this.coworkingTableReservationService.getReservationForCurrentDay(new Date())
    ]).pipe(
      switchMap(([tables, reservations]) => {
        const now = new Date();  // ← HIER! Bei jedem Update neu berechnen

        const activeReservations = reservations.filter(r =>
          now >= r.startTime && now <= r.endTime
        );

        if (activeReservations.length > 0) {
          const userObservables = activeReservations.map(reservation =>
            this.userService.getUser(reservation.user).pipe(
              map(user => ({
                displayName: user?.displayName ? user.displayName.split(' ')[0] : 'Jemand',
                endTime: reservation.endTime
              })),
              catchError(() => of({ displayName: 'Jemand', endTime: reservation.endTime }))
            )
          );

          return combineLatest(userObservables).pipe(
            map(users => {
              const userMap = new Map<string, { name: string, until: Date }>();
              activeReservations.forEach((res, index) => {
                userMap.set(res.tableId, {
                  name: users[index].displayName,
                  until: users[index].endTime
                });
              });
              return { tables, activeReservations, userMap };
            })
          );
        }

        return of({ tables, activeReservations, userMap: new Map<string, { name: string, until: Date }>() });
      }),
      takeUntil(this.destroy$)
    ).subscribe(({ tables, activeReservations, userMap }) => {
      const now = new Date();  // ← Auch hier nochmal für die finale Berechnung

      this.coworkingStatus = tables
        .sort((a, b) => a.orderNo - b.orderNo)
        .map(table => {
          const isOccupied = activeReservations.some(r => r.tableId === table.id);

          return {
            tableId: table.id,
            tableName: table.name,
            location: table.location,
            orderNo: table.orderNo,
            isFree: !isOccupied,
            occupantName: userMap.get(table.id)?.name,
            occupiedUntil: userMap.get(table.id)?.until
          };
        });

      this.cdr.markForCheck();
    });
  }

  public formatTime(date: Date): string {
    return format(date, 'HH:mm', { locale: de });
  }

  // helper methods for coworking status
  public getOccupiedCount(): number {
    return this.coworkingStatus.filter(s => !s.isFree).length;
  }

  public navigateToCoworking(): void {
    this.router.navigate(['/coworking']);
  }

  private loadBeamerState() {
    this.inventoryService.getBeamer()
      .pipe(takeUntil(this.destroy$))
      .subscribe(beamer => {
        this.beamerState$.next(beamer);
        this.cdr.markForCheck();
      })
  }

  private loadOnlyRoomReservations(): void {
    const reservations$ = this.roomReservationsService.getReservationsForComingWeek();
    const rooms$ = this.roomsService.getRooms$();

    combineLatest([reservations$, rooms$])
      .pipe(
        takeUntil(this.destroy$),
        switchMap(([reservations, rooms]) => {
          // Collect unique user IDs
          const userIds = [...new Set(reservations.map(r => r.userId))].filter(Boolean);

          // Fetch users and phone numbers
          return combineLatest([
            of(reservations),
            of(rooms),
            this.userService.getUsers(userIds),
            // Fetch all phone numbers for these users (parallel)
            userIds.length > 0
              ? combineLatest(userIds.map(id => this.userPhoneNumberService.getPhoneNumber(id).pipe(map(num => ({ id, num })))))
              : of([])
          ]);
        })
      )
      .subscribe(([reservations, rooms, users, phoneNumbers]) => {
        // Create maps for easy lookup
        const userMap = new Map(users.map(u => [u.uid, u]));
        const phoneMap = new Map(phoneNumbers.map(p => [p.id, p.num]));

        this.upcomingEvents = reservations.map(reservation => {
          const user = userMap.get(reservation.userId);
          const phoneNumber = phoneMap.get(reservation.userId);

          return this.mapReservationToEnhancedReservation(reservation, rooms, user?.displayName, phoneNumber);
        }).sort((a, b) => a.fromDateTime.getTime() - b.fromDateTime.getTime());

        this.isLoading = false; // Move isLoading = false here
        this.cdr.markForCheck();
      });
  }

  private mapReservationToEnhancedReservation(
    reservation: Reservation,
    rooms: any[],
    creatorName?: string,
    creatorPhoneNumber?: string | null
  ): EnhancedReservation {
    const room = rooms.find(r => r.id === reservation.roomId);
    const now = new Date();
    const isActive = this.isEventActive(reservation.fromDateTime, reservation.toDateTime);
    const isFinished = now > reservation.toDateTime && isToday(reservation.toDateTime);

    return {
      ...reservation,
      roomName: room ? room.name : 'Unbekannter Raum',
      formattedTimeRange: this.formatTimeRange(reservation.fromDateTime, reservation.toDateTime),
      isToday: isToday(reservation.fromDateTime),
      isInProgress: isActive,
      isFinished: isFinished,
      isBirthday: this.isBirthdayEvent(reservation.eventName),
      isGoogleCalendarEvent: false,
      creatorName: creatorName || 'Unbekannt',
      creatorPhoneNumber: creatorPhoneNumber
    };
  }

  private checkWasherAndDryerStatus(): void {
    const currentDate = new Date();
    this.getWashingMachineStatus(currentDate);
    this.getDryerStatus(currentDate); // Add dryer equivalent
  }

  private getWashingMachineStatus(selectedDate: Date): void {
    combineLatest([
      this.washingMachineService.getWashingMachines(),
      this.washingMachinesReservationService.getWashingMachineReservationsForCurrentDay(selectedDate)
    ]).pipe(
      takeUntil(this.destroy$)
    ).subscribe(([machines, reservations]) => {
      this.currentWashingReservations = reservations;

      const now = new Date();
      const fourHoursFromNow = new Date(now.getTime() + 4 * 60 * 60 * 1000);

      this.washingMachineStatus = machines
        .sort((a, b) => a.orderNo - b.orderNo) // Sort by orderNo
        .map(machine => {
          // Check if machine is currently in use
          const currentReservation = reservations.find(reservation =>
            reservation.machineId === machine.id &&
            this.isEventActive(reservation.startTime, reservation.endTime)
          );

          // Check if machine has reservations in next 4 hours
          const futureReservations = reservations.filter(reservation =>
            reservation.machineId === machine.id &&
            reservation.startTime <= fourHoursFromNow &&
            reservation.endTime > now
          );

          const hasFutureReservations = futureReservations.length > 0;
          const busyUntil = this.calculateBusyUntil(machine.id, reservations);

          return {
            machineId: machine.id,
            machineName: machine.name,
            orderNo: machine.orderNo, // Diese Zeile hinzufügen
            isFreeNow: machine.status === 'available' && !currentReservation,
            isAvailableNext4Hours: machine.status === 'available' && futureReservations.length === 0,
            hasFutureReservations: hasFutureReservations,
            busyUntil: busyUntil
          } as MachineStatus;
        });

      this.cdr.markForCheck();
    });
  }

  private getDryerStatus(selectedDate: Date): void {
    combineLatest([
      this.dryerService.getDryers(),
      this.dryersReservationService.getReservationsForCurrentDay(selectedDate)
    ]).pipe(
      takeUntil(this.destroy$)
    ).subscribe(([dryers, reservations]) => {
      this.currentDryerReservations = reservations;

      const now = new Date();
      const fourHoursFromNow = new Date(now.getTime() + 4 * 60 * 60 * 1000);

      this.dryerStatus = dryers
        .sort((a, b) => a.orderNo - b.orderNo) // Sort by orderNo
        .map(dryer => {
          const currentReservation = reservations.find(reservation =>
            reservation.machineId === dryer.id &&
            this.isEventActive(reservation.startTime, reservation.endTime)
          );

          const futureReservations = reservations.filter(reservation =>
            reservation.machineId === dryer.id &&
            reservation.startTime <= fourHoursFromNow &&
            reservation.endTime > now
          );

          const hasFutureReservations = futureReservations.length > 0;
          const busyUntil = this.calculateBusyUntil(dryer.id, reservations);

          return {
            machineId: dryer.id,
            machineName: dryer.name,
            orderNo: dryer.orderNo,
            isFreeNow: dryer.status === 'available' && !currentReservation,
            isAvailableNext4Hours: dryer.status === 'available' && futureReservations.length === 0,
            hasFutureReservations: hasFutureReservations,
            busyUntil: busyUntil
          } as MachineStatus;
        });

      this.cdr.markForCheck();
    });
  }

  public getStatusClass(status: MachineStatus): string {
    if (!status.isFreeNow) {
      return 'occupied'; // Rot - belegt
    } else if (status.hasFutureReservations) {
      return 'warning'; // Gelb - frei aber bald belegt
    } else {
      return 'available'; // Grün - frei
    }
  }

  public getStatusText(status: MachineStatus): string {
    if (!status.isFreeNow) {
      return 'Belegt';
    } else if (status.hasFutureReservations) {
      return 'in Kürze belegt'; // Gelb - frei aber bald belegt
    } else {
      return 'Frei'; // Grün - komplett frei
    }
  }

  public navigateToWashing(tab: 'dryer' | 'washing'): void {
    // Navigate with query parameter to specify which tab
    this.router.navigate(['/waschen'], {
      queryParams: { tab: tab === 'dryer' ? 'dryer' : 'washing' }
    });
  }

  private calculateBusyUntil(machineId: string, reservations: any[]): Date | undefined {
    const now = new Date();
    const currentReservation = reservations.find(r =>
      r.machineId === machineId &&
      now >= r.startTime && now <= r.endTime
    );

    if (currentReservation) {
      // Konvertiere zu Date
      let currentEndTime = currentReservation.endTime instanceof Date
        ? currentReservation.endTime
        : (currentReservation.endTime as any).toDate();

      // Hole alle zukünftigen Reservierungen für diese Maschine, sortiert nach Startzeit
      const futureReservations = reservations
        .filter(r => r.machineId === machineId)
        .map(r => ({
          ...r,
          startTime: r.startTime instanceof Date ? r.startTime : (r.startTime as any).toDate(),
          endTime: r.endTime instanceof Date ? r.endTime : (r.endTime as any).toDate()
        }))
        .filter(r => r.startTime >= currentEndTime) // >= statt > !
        .sort((a, b) => a.startTime.getTime() - b.startTime.getTime());

      // Prüfe auf lückenlose Anschlusskette (max. 5 Minuten Pause)
      for (const nextReservation of futureReservations) {
        const timeDifference = nextReservation.startTime.getTime() - currentEndTime.getTime();
        const fiveMinutesInMs = 5 * 60 * 1000;

        if (timeDifference <= fiveMinutesInMs) {
          // Diese Reservierung schließt direkt an
          currentEndTime = nextReservation.endTime;
        } else {
          // Lücke gefunden, Kette endet hier
          break;
        }
      }

      return currentEndTime;
    }
    return undefined;
  }

  public onMachineClick(status: MachineStatus, type: 'washer' | 'dryer'): void {
    let busyUntil: Date | undefined;

    if (!status.isFreeNow) {
      const reservations = type === 'washer'
        ? this.currentWashingReservations
        : this.currentDryerReservations;

      const now = new Date();
      const currentReservation = reservations.find(r =>
        r.machineId === status.machineId &&
        now >= r.startTime && now <= r.endTime
      );

      if (currentReservation) {
        busyUntil = this.calculateBusyUntil(status.machineId, reservations);
      }
    }

    const dialogData: QuickWashDialogData = {
      machineId: status.machineId,
      machineName: status.machineName,
      machineType: type,
      isFree: status.isFreeNow,
      busyUntil: busyUntil
    };

    const dialogRef = this.dialog.open(QuickWashDialogComponent, {
      data: dialogData
    });

    dialogRef.afterClosed().subscribe(async (result) => {
      if (!result || !this.userId) return;

      if (result.action === 'reserve') {
        try {
          const comment = result.isOvernightReservation
            ? `🌙 Über Nacht ${type === 'washer' ? 'Reservierung' : 'Trocknung'}`
            : '';

          if (type === 'washer') {
            await this.washingMachinesReservationService.createReservation({
              type: 'washingMachine',
              machineId: result.machineId,
              user: this.userId,
              startTime: result.startTime,
              endTime: result.endTime,
              othersMayRemoveMyClothes: true,
              comment: comment,
              paid: false,
              isOvernightReservation: result.isOvernightReservation || false
            } as WashingMachineReservation);
          } else {
            await this.dryersReservationService.createReservation({
              type: 'dryer',
              machineId: result.machineId,
              user: this.userId,
              startTime: result.startTime,
              endTime: result.endTime,
              othersMayRemoveMyClothes: true,
              comment: comment,
              paid: false,
              isOvernightReservation: result.isOvernightReservation || false
            } as DryerReservation);
          }
          this.snackBar.success('Reservierung erfolgreich!');
        } catch (error) {
          console.error('Fehler bei der Reservierung:', error);
        }
      } else if (result.action === 'reserveAfter') {
        this.router.navigate(['/waschen'], {
          queryParams: {
            tab: type === 'dryer' ? 'dryer' : 'washing',
            machine: result.machineId
          }
        });
      }
    });
  }

  public onDeskClick(table: CoworkingTableStatus): void {
    if (!table.isFree && table.occupantName && table.occupiedUntil) {
      this.dialog.open(CoworkingInfoDialogComponent, {
        data: {
          occupantName: table.occupantName,
          tableName: table.tableName,
          until: this.formatTime(table.occupiedUntil)
        } as CoworkingInfoDialogData
      });
    } else {
      this.navigateToCoworking();
    }
  }

}
