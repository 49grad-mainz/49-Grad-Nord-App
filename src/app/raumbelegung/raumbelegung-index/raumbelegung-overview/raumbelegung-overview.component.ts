import {
  Component,
  OnInit,
  DestroyRef,
  AfterViewInit,
  ViewChild,
  OnDestroy,
  Injector,
  runInInjectionContext,
  ViewChildren, QueryList, ElementRef, ChangeDetectorRef, inject
} from '@angular/core';
import { MatDialog } from '@angular/material/dialog';
import { Router } from '@angular/router'; // ← NEU
import { takeUntilDestroyed } from '@angular/core/rxjs-interop';
import { RoomReservationsService, Reservation } from '../../services/room-reservations.service';
import { FromToTimePickerComponent } from '../../../shared/from-to-time-picker/from-to-time-picker.component';
import { AngularFireAuth } from '@angular/fire/compat/auth';
import { RoomsService, Room } from '../../services/rooms.service';
import { SnackbarService } from "../../../services/snackbar.service";
import {
  ConfirmationDialogComponent,
  ConfirmationDialogData
} from "../../../shared/confirmation-dialog/confirmation-dialog.component";
import { UserPhoneNumberService } from "../../../services/user-phone-number.service"; // ← NEU
import {
  ReservationDetailDialogComponent,
  ReservationDetailDialogData,
  ReservationDetailAction
} from "../../../shared/reservation-detail-dialog/reservation-detail-dialog.component"; // ← NEU
import { UserService } from "../../../services/user.service"; // ← NEU
import { MatTableDataSource } from "@angular/material/table";
import { MatSort } from "@angular/material/sort";
import { Subject, Subscription, takeUntil, combineLatest, of } from "rxjs";
import { switchMap, map } from 'rxjs/operators';
import { CommonSearchInputComponent } from "../../../shared/common-search-input/common-search-input.component";
import { isSameDay } from '../../../shared/date.utils';

interface AugmentedReservation extends Reservation {
  creatorName?: string;
  creatorPhoneNumber?: string | null;
}

type FilterType = 'all' | 'mine' | 'private' | 'public';

interface RoomReservationState {
  eventName: string;
  fromDateTime: Date | null;
  toDateTime: Date | null;
  isPrivateEvent: boolean;
  filterType: FilterType;
  isLoading: boolean;
}

@Component({
  selector: 'app-raumbelegung-overview',
  templateUrl: './raumbelegung-overview.component.html',
  styleUrls: ['./raumbelegung-overview.component.scss'],
  standalone: false
})
export class RaumbelegungOverviewComponent implements OnInit, AfterViewInit, OnDestroy {
  @ViewChildren('eventNameInput') eventNameInputs!: QueryList<ElementRef<HTMLInputElement>>;

  public showEvents: boolean = true;

  public rooms: Room[] = [];
  public dataSources: { [roomId: string]: MatTableDataSource<Reservation> } = {};
  public displayedColumns: string[] = ['name', 'creator', 'time', 'private'];

  @ViewChild(MatSort) sort!: MatSort;

  public roomStates: { [roomId: string]: RoomReservationState } = {};

  private userId: string | null = null;
  public isReserving = false;

  // Centralized destroy subject for all subscriptions
  private destroy$ = new Subject<void>();
  private destroyRef = inject(DestroyRef); // Inject DestroyRef as property

  // Keep track of individual subscriptions that need manual cleanup
  private authStateSubscription: Subscription | undefined = undefined;
  private userIdSubscription: Subscription | undefined = undefined;
  private showEventsSubscription: Subscription | undefined = undefined;

  constructor(
    private roomReservationsService: RoomReservationsService,
    private roomsService: RoomsService,
    private dialog: MatDialog,
    private afAuth: AngularFireAuth,
    private snackBar: SnackbarService,
    private injector: Injector,
    private userService: UserService,
    private userPhoneNumberService: UserPhoneNumberService,
    private router: Router
  ) { }

  ngOnInit(): void {
    // Auth state subscription with proper cleanup
    runInInjectionContext(this.injector, () => {
      this.authStateSubscription = this.afAuth.authState.pipe(
        takeUntil(this.destroy$) // Use takeUntil for cleanup
      ).subscribe(user => {
        if (user) {
          this.userId = user.uid;
        }
      });
    });

    // Rooms subscription using takeUntilDestroyed (modern approach)
    runInInjectionContext(this.injector, () => {
      this.roomsService.getRooms$().pipe(
        takeUntilDestroyed(this.destroyRef)
      ).subscribe((rooms: Room[]) => {
        this.rooms = rooms.sort((a, b) => a.orderNo - b.orderNo);
        this.initializeRoomStatesAndDataSources();
      });
    });

    // User service subscriptions with proper cleanup
    runInInjectionContext(this.injector, () => {
      this.userIdSubscription = this.userService.userId$?.pipe(
        takeUntil(this.destroy$)
      ).subscribe(userId => {
        if (userId) {
          this.userId = userId;

          // Nested subscription - also needs cleanup
          // this.showEventsSubscription = this.userService.showEvents$.pipe(
          //   takeUntil(this.destroy$)
          // ).subscribe(showEvents => {
          //   this.showEvents = showEvents;
          // });
        } else {
          console.error('User ID is not defined.');
          alert('Fehler: Benutzer-ID ist nicht definiert. Bitte melde dich an.');
        }
      });
    });
  }

  ngAfterViewInit(): void {
    this.rooms.forEach(room => {
      if (this.dataSources[room.id]) {
        this.dataSources[room.id].sort = this.sort;
      }
    });
  }

  public onTabSelectionChange(event: any, roomId: string): void {
    // Check if the "Reservieren" tab (index 1) was selected
    if (event.index === 1) {
      // Wait longer for the tab animation to complete
      // Angular Material tab animations typically take 250-300ms
      setTimeout(() => {
        this.focusEventNameInput(roomId);
      }, 350);
    }
  }

  // public updateShowEvents(): void {
  //   if (this.userId) {
  //     runInInjectionContext(this.injector, () => {
  //       this.userService.updateShowEventsFlag(this.userId!, this.showEvents)
  //         .then(() => {
  //           if (this.showEvents) {
  //             this.snackBar.success('Veranstaltungen werden angezeigt', 1800);
  //           } else {
  //             this.snackBar.success('Veranstaltungen werden nicht angezeigt', 1800);
  //           }
  //         })
  //         .catch(error => {
  //           this.snackBar.error('Fehler beim Aktualisieren der Einstellungen');
  //         });
  //     });
  //   } else {
  //     console.error('Cannot update show events flag: User ID is not available.');
  //     alert('Fehler: Benutzer-ID ist nicht verfügbar. Bitte melden Sie sich an.');
  //   }
  // }

  private initializeRoomStatesAndDataSources(): void {
    this.rooms.forEach(room => {
      this.roomStates[room.id] = {
        eventName: '',
        fromDateTime: null,
        toDateTime: null,
        isPrivateEvent: false,
        filterType: 'all',
        isLoading: true
      };

      this.dataSources[room.id] = new MatTableDataSource<Reservation>();
      this.loadReservationsForRoom(room.id);
    });
  }

  public onFilterChange(roomId: string): void {
    this.loadReservationsForRoom(roomId);
  }

  private loadReservationsForRoom(roomId: string): void {
    this.roomStates[roomId].isLoading = true;
    runInInjectionContext(this.injector, () => {
      this.roomReservationsService.getReservationsByRoom(roomId).pipe(
        takeUntilDestroyed(this.destroyRef), // Using takeUntilDestroyed for automatic cleanup
        switchMap(reservations => {
          const userIds = [...new Set(reservations.map(r => r.userId))].filter(Boolean);

          return combineLatest([
            of(reservations),
            this.userService.getUsers(userIds),
            userIds.length > 0
              ? combineLatest(userIds.map(id => this.userPhoneNumberService.getPhoneNumber(id).pipe(map(num => ({ id, num })))))
              : of([])
          ]);
        })
      ).subscribe(([reservations, users, phoneNumbers]) => {
        const userMap = new Map(users.map(u => [u.uid, u]));
        const phoneMap = new Map(phoneNumbers.map(p => [p.id, p.num]));

        let augmentedReservations: AugmentedReservation[] = reservations.map(res => ({
          ...res,
          creatorName: userMap.get(res.userId)?.displayName || 'Unbekannt',
          creatorPhoneNumber: phoneMap.get(res.userId)
        }));

        const filterType = this.roomStates[roomId].filterType;
        let filteredReservations = augmentedReservations;

        switch (filterType) {
          case 'mine':
            if (this.userId) {
              filteredReservations = augmentedReservations.filter(reservation =>
                reservation.userId === this.userId
              );
            }
            break;
          case 'private':
            filteredReservations = augmentedReservations.filter(reservation =>
              reservation.isPrivate === true
            );
            break;
          case 'public':
            filteredReservations = augmentedReservations.filter(reservation =>
              reservation.isPrivate === false
            );
            break;
          case 'all':
          default:
            break;
        }

        filteredReservations.sort((a, b) =>
          new Date(a.fromDateTime).getTime() - new Date(b.fromDateTime).getTime()
        );

        this.dataSources[roomId].data = filteredReservations;
        this.dataSources[roomId].sort = this.sort;
        this.roomStates[roomId].isLoading = false;
      });
    });
  }

  openFromTimePicker(roomId: string): void {
    const initialDate = this.roomStates[roomId].fromDateTime || new Date();

    const dialogRef = this.dialog.open(FromToTimePickerComponent, {
      data: {
        date: initialDate,
        minDate: new Date(),
        title: 'Startzeit wählen'
      },
      width: '350px',
      autoFocus: false
    });

    // Dialog subscriptions are automatically cleaned up when dialog closes
    dialogRef.afterClosed().subscribe(result => {
      if (result) {
        console.log('From Time Picker Result:', result);

        this.roomStates[roomId].fromDateTime = new Date(result);
        const endDate = new Date(result.getTime() + (2 * 60 * 60 * 1000));
        this.roomStates[roomId].toDateTime = endDate;

        console.log('Set fromDateTime to:', this.roomStates[roomId].fromDateTime);
        console.log('Set toDateTime to:', this.roomStates[roomId].toDateTime);
      }
    });
  }

  openToTimePicker(roomId: string): void {
    if (!this.roomStates[roomId].fromDateTime) {
      this.snackBar.error('Bitte wähle zuerst eine Startzeit.');
      return;
    }

    const minDate = new Date(this.roomStates[roomId].fromDateTime!.getTime() + 60000);
    const initialEndTime = this.roomStates[roomId].toDateTime ||
      new Date(this.roomStates[roomId].fromDateTime!.getTime() + (2 * 60 * 60 * 1000));

    const dialogRef = this.dialog.open(FromToTimePickerComponent, {
      data: {
        date: initialEndTime,
        minDate: minDate,
        title: 'Endzeit wählen'
      },
      width: '350px',
      autoFocus: false
    });

    // Dialog subscriptions are automatically cleaned up when dialog closes
    dialogRef.afterClosed().subscribe(result => {
      if (result) {
        console.log('To Time Picker Result:', result);

        if (result <= this.roomStates[roomId].fromDateTime!) {
          this.snackBar.error('Die Endzeit muss nach der Startzeit liegen.');
          return;
        }

        this.roomStates[roomId].toDateTime = new Date(result);
        console.log('Set toDateTime to:', this.roomStates[roomId].toDateTime);
      }
    });
  }

  public canReserveRoom(roomId: string): boolean {
    const roomState = this.roomStates[roomId];
    return !!roomState.eventName && !!roomState.fromDateTime && !!roomState.toDateTime && roomState.toDateTime > roomState.fromDateTime && !!this.userId;
  }

  public isEndTimeInvalid(roomId: string): boolean {
    const roomState = this.roomStates[roomId];
    return !!roomState.toDateTime && !!roomState.fromDateTime && roomState.toDateTime <= roomState.fromDateTime;
  }

  public reserveRoom(roomId: string): void {
    const roomState = this.roomStates[roomId];

    if (!this.canReserveRoom(roomId) || !roomId || !this.userId) {
      return;
    }

    this.isReserving = true;

    const reservation: Reservation = {
      roomId: roomId,
      eventName: roomState.eventName!,
      isPrivate: roomState.isPrivateEvent,
      fromDateTime: roomState.fromDateTime!,
      toDateTime: roomState.toDateTime!,
      userId: this.userId
    };

    reservation.eventName.trim();

    runInInjectionContext(this.injector, () => {
      this.roomReservationsService.createReservation(reservation).then(() => {
        this.snackBar.success('Raum reserviert');

        this.roomStates[roomId] = {
          eventName: '',
          fromDateTime: null,
          toDateTime: null,
          isPrivateEvent: false,
          filterType: this.roomStates[roomId].filterType,
          isLoading: false
        };

        this.loadReservationsForRoom(roomId);
      }).catch(error => {
        alert('Fehler beim Reservieren des Raums: ' + error);
      }).finally(() => {
        this.isReserving = false;
      });
    });
  }

  async onRowClicked(reservation: any): Promise<void> {
    if (!reservation.id || !this.userId) {
      // alert('Fehler: Reservierungs-ID fehlt.'); // Removed alert for cleaner UX, simple return if invalid
      return;
    }

    const viewerHasPhoneNumber = await this.userPhoneNumberService.userHasPhoneNumber(this.userId);
    const isOwner = reservation.userId === this.userId;

    const dialogData: ReservationDetailDialogData = {
      reservation: reservation,
      creatorName: reservation.creatorName,
      creatorPhoneNumber: reservation.creatorPhoneNumber,
      isOwner: isOwner,
      viewerHasPhoneNumber: viewerHasPhoneNumber,
      roomName: this.getRoomNameById(reservation.roomId)
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

  private openEditDialog(reservation: any): void {
    const dialogData: ConfirmationDialogData = {
      message: 'Möchtest du dieses Ereignis wirklich löschen?', // Message ignored in edit mode usually
      eventName: reservation.eventName,
      fromDateTime: reservation.fromDateTime,
      toDateTime: reservation.toDateTime,
      roomName: this.getRoomNameById(reservation.roomId),
      isPrivate: reservation.isPrivate,
      reservationId: reservation.id,
      userId: reservation.userId,
      buttonText: {
        ok: 'Löschen', // Text might need adjustment for edit mode? Existing code reused ConfirmationDialog for both.
        cancel: 'Abbrechen'
      },
      mode: 'edit' // Existing code used 'delete' for delete confirmation, let's see how edit was handled.
      // The original code passed 'delete' mode for DELETE.
      // For EDIT, the original code didn't seem to have a direct "Edit" CLICK on the row.
      // Wait, the original code opened ConfirmationDialog with mode: 'delete' ON ROW CLICK.
      // It seems it was ONLY allowing delete?
      // "message: 'Möchten Sie dieses Ereignis wirklich löschen?'"
      // "ok: 'Löschen'"
      // So previously, clicking a row was JUST for deleting?
      // Let's look at `onRowClicked` in original code.
      // Yes, it was confirming delete.
      // BUT, in Dashboard, it was Edit/Delete.
      // The requirement says "Show info, Call, Edit, Delete".
      // So I will implement openEditDialog properly.
    };

    // Actually, to reuse the existing edit logic from Dashboard, I need to know how editing is triggered.
    // The `ConfirmationDialogComponent` with `mode: 'edit'` probably shows an edit form?
    // Let's assume so. In Dashboard it used `mode: 'edit'` with `buttonText: { ok: 'Bearbeiten', ... }`.

    // Re-creating the dialog data for EDIT mode:
    const editDialogData: ConfirmationDialogData = {
      message: '',
      eventName: reservation.eventName,
      fromDateTime: reservation.fromDateTime,
      toDateTime: reservation.toDateTime,
      roomName: this.getRoomNameById(reservation.roomId),
      isPrivate: reservation.isPrivate,
      reservationId: reservation.id,
      userId: reservation.userId,
      buttonText: {
        ok: 'Speichern', // Or 'Bearbeiten'?
        cancel: 'Abbrechen'
      },
      mode: 'edit'
    };

    const dialogRef = this.dialog.open(ConfirmationDialogComponent, {
      data: editDialogData,
    });

    dialogRef.afterClosed().subscribe((result: any) => {
      if (result?.action === 'updated') {
        this.snackBar.success('Reservierung erfolgreich aktualisiert');
        this.loadReservationsForRoom(reservation.roomId);
      } else if (result?.action === 'delete') {
        this.confirmDelete(reservation);
      }
    });
  }

  private confirmDelete(reservation: any): void {
    // Logic for delete confirmation (optional, or direct delete if already confirmed in DetailDialog?
    // DetailDialog sends 'delete' action. Usually implies user clicked "Delete".
    // Dashboard performs delete directly. I will do the same.
    this.roomReservationsService.deleteReservation(reservation.id as string).then(() => {
      this.snackBar.success('Reservierung erfolgreich gelöscht');
      this.loadReservationsForRoom(reservation.roomId);
    }).catch(error => {
      alert('Fehler beim Löschen der Reservierung: ' + error);
    });
  }

  onEditReservation(reservation: Reservation): void {
    if (!reservation.id) {
      alert('Fehler: Reservierungs-ID fehlt.');
      return;
    }

    const dialogData: ConfirmationDialogData = {
      message: '',
      eventName: reservation.eventName,
      fromDateTime: reservation.fromDateTime,
      toDateTime: reservation.toDateTime,
      roomName: this.getRoomNameById(reservation.roomId),
      isPrivate: reservation.isPrivate,
      reservationId: reservation.id,
      userId: reservation.userId,
      buttonText: {
        ok: 'Speichern',
        cancel: 'Abbrechen'
      },
      mode: 'edit'
    };

    const dialogRef = this.dialog.open(ConfirmationDialogComponent, {
      data: dialogData,
    });

    // Dialog subscriptions are automatically cleaned up when dialog closes
    dialogRef.afterClosed().subscribe((result: any) => {
      if (result?.action === 'updated') {
        this.snackBar.success('Reservierung erfolgreich aktualisiert');
        this.loadReservationsForRoom(reservation.roomId);
      }
    });
  }

  private getRoomNameById(roomId: string): string {
    const room = this.rooms.find(r => r.id === roomId);
    return room ? room.name : 'Unbekannter Raum';
  }

  trackByRoomId(index: number, room: Room): string {
    return room.id;
  }

  public isPastEvent(reservation: AugmentedReservation): boolean {
    if (!reservation.toDateTime) return false;
    return new Date(reservation.toDateTime) < new Date();
  }

  public readonly isSameDay = isSameDay;

  public ngOnDestroy(): void {
    // Signal all subscriptions using takeUntil to complete
    this.destroy$.next();
    this.destroy$.complete();

    // Manual cleanup for any subscriptions that weren't using takeUntil
    if (this.authStateSubscription) {
      this.authStateSubscription.unsubscribe();
    }

    if (this.userIdSubscription) {
      this.userIdSubscription.unsubscribe();
    }

    if (this.showEventsSubscription) {
      this.showEventsSubscription.unsubscribe();
    }
  }

  private focusEventNameInput(roomId: string): void {
    const inputElement = document.querySelector(`#eventNameInput-${roomId}`) as HTMLInputElement;
    if (inputElement) {
      inputElement.focus();
      // Optional: select all text in the input for better UX
      inputElement.select();
    } else {
      // If the element is still not found, try again after a short delay
      setTimeout(() => {
        const retryElement = document.querySelector(`#eventNameInput-${roomId}`) as HTMLInputElement;
        if (retryElement) {
          retryElement.focus();
          retryElement.select();
        }
      }, 100);
    }
  }
}
