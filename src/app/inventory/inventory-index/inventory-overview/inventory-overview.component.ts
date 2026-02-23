import { Component, OnInit, OnDestroy, signal, computed } from '@angular/core';
import { CommonModule } from '@angular/common';
import {
  MatCard,
  MatCardContent,
  MatCardHeader,
  MatCardSubtitle,
  MatCardTitle,
  MatCardTitleGroup
} from "@angular/material/card";
import { MatDivider } from "@angular/material/divider";
import { MatButton } from "@angular/material/button";
import { MatDialog } from '@angular/material/dialog';
import { MatSnackBar } from '@angular/material/snack-bar';
import { MatChipsModule } from '@angular/material/chips';
import { MatIconModule } from '@angular/material/icon';
import { MatProgressSpinnerModule } from '@angular/material/progress-spinner';
import { InventoryService, InventoryItem, BorrowRecord } from "../../services/inventory.service";
import { UserService } from "../../../services/user.service";
import { BorrowDialogComponent, BorrowDialogResult } from '../../components/borrow-dialog/borrow-dialog.component';
import { toSignal } from '@angular/core/rxjs-interop';
import { Subject, takeUntil, combineLatest, timer, of, Observable } from 'rxjs';
import { switchMap, retry, catchError, map } from 'rxjs/operators';

interface ItemWithBorrower {
  item: InventoryItem;
  borrower: BorrowRecord | null;
  loading: boolean;
}

@Component({
  selector: 'app-inventory-overview',
  standalone: true,
  imports: [
    CommonModule,
    MatCard,
    MatCardHeader,
    MatCardTitleGroup,
    MatCardSubtitle,
    MatCardTitle,
    MatCardContent,
    MatDivider,
    MatButton,
    MatChipsModule,
    MatIconModule,
    MatProgressSpinnerModule
  ],
  templateUrl: './inventory-overview.component.html',
  styleUrl: './inventory-overview.component.scss'
})
export class InventoryOverviewComponent implements OnInit, OnDestroy {
  // User Signals
  currentUserId = toSignal(this.userService.userId$, { initialValue: undefined });
  currentUserEmail = toSignal(this.userService.userEmail$, { initialValue: undefined });
  currentUserName = toSignal(this.userService.userName$, { initialValue: undefined });
  isLoggedIn = toSignal(this.userService.isLoggedIn$, { initialValue: false });
  isAdmin = toSignal(this.userService.isAdmin$, { initialValue: false });

  // Items und Borrower-Daten kombiniert
  items = signal<InventoryItem[]>([]);
  borrowerData = signal<Map<string, BorrowRecord | null>>(new Map());
  isLoading = signal(false);

  private destroy$ = new Subject<void>();

  constructor(
    private inventoryService: InventoryService,
    private userService: UserService,
    private dialog: MatDialog,
    private snackBar: MatSnackBar
  ) {}

  ngOnInit(): void {
    console.log('=== COMPONENT INIT ===');
    this.loadAllData();
  }

  ngOnDestroy(): void {
    console.log('=== COMPONENT DESTROY ===');
    this.destroy$.next();
    this.destroy$.complete();
  }

  private loadAllData(): void {
    // Lade Items
    this.inventoryService.getAllInventoryItems()
      .pipe(
        takeUntil(this.destroy$),
        switchMap(items => {
          console.log('Items loaded:', items.length);
          this.items.set(items);

          // Für jedes Item, lade Borrower-Info
          return this.loadBorrowersForItems(items);
        })
      )
      .subscribe({
        error: (err) => console.error('Error loading data:', err)
      });
  }

  private loadBorrowersForItems(items: InventoryItem[]): Observable<any> {
    const borrowerMap = new Map<string, BorrowRecord | null>();

    // Erstelle Observables für alle nicht-verfügbaren Items
    const borrowerObservables = items
      .filter(item => !item.available && item.id)
      .map(item =>
        this.inventoryService.getCurrentBorrower(item.id!)
          .pipe(
            retry(2), // Retry bei Fehler
            catchError(err => {
              console.error('Error loading borrower for', item.id, err);
              return of(null);
            }),
            takeUntil(this.destroy$)
          )
      );

    // Wenn keine Borrower zu laden sind
    if (borrowerObservables.length === 0) {
      this.borrowerData.set(borrowerMap);
      return of(null); // Return Observable statt timer
    }

    // Kombiniere alle Borrower-Observables und return das Observable
    return combineLatest(borrowerObservables).pipe(
      takeUntil(this.destroy$),
      map(borrowers => {
        const nonAvailableItems = items.filter(item => !item.available && item.id);

        borrowers.forEach((borrower, index) => {
          const item = nonAvailableItems[index];
          if (item && item.id) {
            borrowerMap.set(item.id, borrower);
            console.log('Borrower loaded for', item.id, ':', borrower ? 'found' : 'not found');
          }
        });

        this.borrowerData.set(new Map(borrowerMap));
        return borrowers;
      })
    );
  }

  async onBorrowItem(item: InventoryItem): Promise<void> {
    if (!item.id || !item.available) {
      this.showSnackBar('Item kann nicht ausgeliehen werden');
      return;
    }

    if (!this.isLoggedIn()) {
      this.showSnackBar('Sie müssen angemeldet sein, um Items auszuleihen');
      return;
    }

    const userId = this.currentUserId();
    const userName = this.currentUserName();

    if (!userId || !userName) {
      this.showSnackBar('Benutzerinformationen konnten nicht geladen werden');
      return;
    }

    const dialogRef = this.dialog.open(BorrowDialogComponent, {
      width: '500px',
      data: { item }
    });

    const result: BorrowDialogResult | null = await dialogRef.afterClosed().toPromise();

    if (!result) {
      return;
    }

    this.isLoading.set(true);

    try {
      const dueDate = new Date();
      dueDate.setDate(dueDate.getDate() + result.durationDays);

      console.log('=== BORROW OPERATION START ===');
      await this.inventoryService.borrowItem(
        item.id,
        userId,
        userName,
        dueDate,
        result.notes
      );

      const durationText = result.durationDays === 1 ? '1 Tag' : `${result.durationDays} Tage`;
      this.showSnackBar(`${item.name} erfolgreich für ${durationText} ausgeliehen`);

      // Reload komplett - garantiert konsistente Daten
      console.log('Reloading all data after borrow...');
      this.reloadAfterChange();
    } catch (error: any) {
      this.showSnackBar(`Fehler beim Ausleihen: ${error.message}`);
      console.error('Borrow error:', error);
    } finally {
      this.isLoading.set(false);
    }
  }

  async onReturnItem(item: InventoryItem): Promise<void> {
    if (!item.id || item.available) {
      this.showSnackBar('Item ist bereits verfügbar');
      return;
    }

    const userId = this.currentUserId();
    const isAdmin = this.isAdmin();

    if (!userId) {
      this.showSnackBar('Sie müssen angemeldet sein');
      return;
    }

    const borrower = this.getBorrowerInfo(item);

    if (!borrower) {
      this.showSnackBar('Keine aktive Ausleihe gefunden');
      return;
    }

    const isOwner = borrower.userId === userId;

    if (!isOwner && !isAdmin) {
      this.showSnackBar(
        `Nur ${borrower.userName} oder ein Administrator kann dieses Item zurückgeben`
      );
      return;
    }

    const userTypeLabel = isAdmin && !isOwner ? ' (als Administrator)' : '';
    const confirmed = confirm(`${item.name} zurückgeben${userTypeLabel}?`);

    if (!confirmed) {
      return;
    }

    this.isLoading.set(true);

    try {
      console.log('=== RETURN OPERATION START ===');
      await this.inventoryService.returnItem(item.id);

      const message = isOwner
        ? `${item.name} erfolgreich zurückgegeben`
        : `${item.name} als Administrator zurückgegeben`;

      this.showSnackBar(message);

      // Reload komplett - garantiert konsistente Daten
      console.log('Reloading all data after return...');
      this.reloadAfterChange();
    } catch (error: any) {
      this.showSnackBar(`Fehler beim Zurückgeben: ${error.message}`);
      console.error('Return error:', error);
    } finally {
      this.isLoading.set(false);
    }
  }

  // Kompletter Reload nach Änderungen
  private reloadAfterChange(): void {
    // Warte auf Firebase Propagation (erhöht auf 1 Sekunde)
    timer(1000).pipe(
      takeUntil(this.destroy$),
      switchMap(() => this.inventoryService.getAllInventoryItems())
    ).subscribe(items => {
      console.log('Items reloaded:', items.length);
      this.items.set(items);

      // Lade Borrower-Daten neu
      this.loadBorrowersForItems(items);
    });
  }

  getBorrowerInfo(item: InventoryItem): BorrowRecord | null {
    if (!item.id || item.available) {
      return null;
    }
    return this.borrowerData().get(item.id) || null;
  }

  canBorrowItem(item: InventoryItem): boolean {
    return item.available &&
      item.condition !== 'needs-repair' &&
      this.isLoggedIn();
  }

  getBorrowButtonText(item: InventoryItem): string {
    if (!this.isLoggedIn()) {
      return 'Anmeldung erforderlich';
    }
    if (item.condition === 'needs-repair') {
      return 'Reparatur erforderlich';
    }
    return 'Ausleihen';
  }

  isOverdue(borrower: BorrowRecord | null): boolean {
    if (!borrower) return false;
    return new Date() > borrower.dueDate;
  }

  getDaysRemaining(borrower: BorrowRecord | null): number {
    if (!borrower) return 0;
    const now = new Date();
    const due = borrower.dueDate;
    const diffTime = due.getTime() - now.getTime();
    const diffDays = Math.ceil(diffTime / (1000 * 60 * 60 * 24));
    return diffDays;
  }

  getStatusText(item: InventoryItem): string {
    if (item.available) {
      return 'Verfügbar';
    }

    const borrower = this.getBorrowerInfo(item);
    if (!borrower) {
      return 'Ausgeliehen';
    }

    const daysRemaining = this.getDaysRemaining(borrower);

    if (daysRemaining < 0) {
      return `Überfällig (${Math.abs(daysRemaining)} Tag${Math.abs(daysRemaining) === 1 ? '' : 'e'})`;
    } else if (daysRemaining === 0) {
      return 'Heute zurück';
    } else if (daysRemaining === 1) {
      return 'Morgen zurück';
    } else {
      return `Noch ${daysRemaining} Tag${daysRemaining === 1 ? '' : 'e'}`;
    }
  }

  getStatusClass(item: InventoryItem): string {
    if (item.available) {
      return 'status-available';
    }

    const borrower = this.getBorrowerInfo(item);
    const daysRemaining = this.getDaysRemaining(borrower);

    if (daysRemaining < 0) {
      return 'status-overdue';
    } else if (daysRemaining <= 1) {
      return 'status-due-soon';
    } else {
      return 'status-borrowed';
    }
  }

  isCurrentUserBorrower(item: InventoryItem): boolean {
    const borrower = this.getBorrowerInfo(item);
    const userId = this.currentUserId();
    return borrower?.userId === userId;
  }

  private showSnackBar(message: string): void {
    this.snackBar.open(message, 'OK', {
      duration: 4000,
      horizontalPosition: 'center',
      verticalPosition: 'bottom'
    });
  }
}
