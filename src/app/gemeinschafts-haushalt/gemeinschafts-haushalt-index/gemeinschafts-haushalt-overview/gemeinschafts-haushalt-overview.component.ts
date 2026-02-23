import {Component, computed, signal, inject, OnDestroy} from '@angular/core';
import { CommonModule } from '@angular/common';
import {FormControl, FormGroup, ReactiveFormsModule, Validators} from '@angular/forms';
import { MatTabsModule } from '@angular/material/tabs';
import { MatListModule } from '@angular/material/list';
import { MatIconModule } from '@angular/material/icon';
import { MatFormFieldModule } from '@angular/material/form-field';
import { MatInputModule } from '@angular/material/input';
import { MatChipsModule } from '@angular/material/chips';
import { MatButtonModule } from '@angular/material/button';
import { MatCardModule } from '@angular/material/card';
import { MatSelectModule } from '@angular/material/select';
import { MatProgressSpinnerModule } from '@angular/material/progress-spinner';
import { MatTooltipModule } from '@angular/material/tooltip';
import { MatSnackBar } from '@angular/material/snack-bar';
import { Item, ItemService } from "../../services/werkzeug.service";
import {UserService} from "../../../services/user.service";
import {Subject, takeUntil} from "rxjs";
import {COMMA, ENTER} from "@angular/cdk/keycodes";


@Component({
  selector: 'app-gemeinschafts-haushalt-overview',
  templateUrl: './gemeinschafts-haushalt-overview.component.html',
  styleUrls: ['./gemeinschafts-haushalt-overview.component.scss'],
  standalone: true,
  imports: [
    CommonModule,
    ReactiveFormsModule,
    MatTabsModule,
    MatListModule,
    MatIconModule,
    MatFormFieldModule,
    MatInputModule,
    MatChipsModule,
    MatButtonModule,
    MatCardModule,
    MatSelectModule,
    MatProgressSpinnerModule,
    MatTooltipModule
  ]
})
export class GemeinschaftsHaushaltOverviewComponent implements OnDestroy {

  // Für Tag-Chips
  public readonly separatorKeysCodes = [ENTER, COMMA] as const;
  public tags = signal<string[]>([]);

  // Formular ohne Tags (die werden separat verwaltet)
  public itemForm = new FormGroup({
    name: new FormControl('', [Validators.required, Validators.minLength(3)]),
    category: new FormControl('', Validators.required),
    description: new FormControl('')
  });

  public isSubmitting = signal(false);

  private destroy$ = new Subject<void>();
  private currentUserId = signal<string | undefined>(undefined);

  // Services
  public itemService = inject(ItemService);
  private userService = inject(UserService);
  private snackBar = inject(MatSnackBar);

  // Public Form Controls
  public searchControl = new FormControl('');
  public statusFilter = new FormControl<'all' | 'available' | 'borrowed'>('all');
  public categoryFilter = new FormControl<string>('all');
  public selectedCategory = new FormControl('');
  public customCategory = new FormControl('');

  // Private Signals für Filter-Werte
  private searchValue = signal('');
  private statusValue = signal<'all' | 'available' | 'borrowed'>('all');
  private categoryValue = signal('all');

  // Public Computed
  public showCustomCategory = computed(() =>
    this.selectedCategory.value === 'Sonstiges'
  );

  // Private State Signals
  private expandedItemIds = signal<Set<string>>(new Set());
  private userNamesCache = signal<Map<string, string>>(new Map());
  private loadingUserNames = signal<Set<string>>(new Set());

  // Public Computed - Gefilterte Items
  public gefilterteItems = computed(() => {
    const search = this.searchValue().toLowerCase();
    const status = this.statusValue();
    const category = this.categoryValue();
    let result = this.itemService.items();

    if (search) {
      result = result.filter(item =>
        item.name.toLowerCase().includes(search) ||
        item.category.toLowerCase().includes(search) ||
        (item.description && item.description.toLowerCase().includes(search))
      );
    }

    if (status === 'available') {
      result = result.filter(item => !item.isBorrowed);
    } else if (status === 'borrowed') {
      result = result.filter(item => item.isBorrowed);
    }

    if (category !== 'all') {
      result = result.filter(item => item.category === category);
    }

    return result;
  });

  constructor() {
    // User-ID speichern
    this.userService.userId$
      .pipe(takeUntil(this.destroy$))
      .subscribe(id => {
        this.currentUserId.set(id);
      });

    // Aktuellen User-Namen sofort cachen
    this.userService.userDisplayNameFromFirestore$
      .pipe(takeUntil(this.destroy$))
      .subscribe(displayName => {
        const userId = this.currentUserId();
        if (userId && displayName) {
          const cache = this.userNamesCache();
          cache.set(userId, displayName);
          this.userNamesCache.set(new Map(cache));
        }
      });

    // FormControl Subscriptions
    this.searchControl.valueChanges
      .pipe(takeUntil(this.destroy$))
      .subscribe(value => {
        this.searchValue.set(value || '');
      });

    this.statusFilter.valueChanges
      .pipe(takeUntil(this.destroy$))
      .subscribe(value => {
        this.statusValue.set(value || 'all');
      });

    this.categoryFilter.valueChanges
      .pipe(takeUntil(this.destroy$))
      .subscribe(value => {
        this.categoryValue.set(value || 'all');
      });

    // Automatisch alle sichtbaren ausgeliehenen Items laden
    this.preloadBorrowedUserNames();
  }

  /**
   * Lädt User-Namen für alle ausgeliehenen Items im Hintergrund
   */
  private preloadBorrowedUserNames(): void {
    // Warte kurz bis Items geladen sind
    setTimeout(() => {
      const borrowedItems = this.itemService.items().filter(item =>
        item.isBorrowed && item.borrowedByUserId
      );

      // Lade alle User-Namen parallel
      borrowedItems.forEach(item => {
        if (item.borrowedByUserId) {
          this.loadUserName(item.borrowedByUserId);
        }
      });
    }, 500);
  }

  /**
   * User-Name laden und cachen
   */
  private async loadUserName(userId: string): Promise<void> {
    // Schon im Cache oder gerade am Laden?
    if (this.userNamesCache().has(userId) || this.loadingUserNames().has(userId)) {
      return;
    }

    const loading = this.loadingUserNames();
    loading.add(userId);
    this.loadingUserNames.set(new Set(loading));

    try {
      const userName = await this.itemService.getUserName(userId);

      const cache = this.userNamesCache();
      cache.set(userId, userName);
      this.userNamesCache.set(new Map(cache));
    } catch (error) {
      console.error('Fehler beim Laden des User-Namens:', error);
      this.snackBar.open('Fehler beim Laden des Benutzernamens', 'OK', { duration: 3000 });
    } finally {
      const loading = this.loadingUserNames();
      loading.delete(userId);
      this.loadingUserNames.set(new Set(loading));
    }
  }

  /**
   * Wird aufgerufen wenn User auf ein Item klickt
   */
  public async onItemClick(item: Item): Promise<void> {
    const itemId = item.id;

    // Toggle expand
    const expanded = this.expandedItemIds();
    if (expanded.has(itemId)) {
      expanded.delete(itemId);
      this.expandedItemIds.set(new Set(expanded));
      return;
    }

    // Expand
    expanded.add(itemId);
    this.expandedItemIds.set(new Set(expanded));

    // User-Name laden falls ausgeliehen
    if (item.isBorrowed && item.borrowedByUserId) {
      await this.loadUserName(item.borrowedByUserId);
    }
  }

  /**
   * Item ausleihen
   */
  public async borrowItem(item: Item, event: Event): Promise<void> {
    event.stopPropagation();

    const userId = this.currentUserId();

    if (!userId) {
      this.snackBar.open('Bitte zuerst einloggen', 'OK', { duration: 3000 });
      return;
    }

    if (confirm(`"${item.name}" ausleihen?`)) {
      try {
        await this.itemService.updateItem(item.id, {
          isBorrowed: true,
          borrowedByUserId: userId,
          borrowedAt: new Date()
        });

        this.snackBar.open(`"${item.name}" erfolgreich ausgeliehen`, 'OK', { duration: 2000 });

      } catch (error) {
        console.error('Fehler beim Ausleihen:', error);
        this.snackBar.open('Fehler beim Ausleihen des Gegenstands', 'OK', { duration: 3000 });
      }
    }
  }

  /**
   * Item zurückgeben
   */
  public async returnItem(item: Item, event: Event): Promise<void> {
    event.stopPropagation();

    if (confirm(`"${item.name}" zurückgeben?`)) {
      try {
        await this.itemService.returnItem(item.id);
        this.snackBar.open(`"${item.name}" erfolgreich zurückgegeben`, 'OK', { duration: 2000 });
      } catch (error) {
        console.error('Fehler beim Zurückgeben:', error);
        this.snackBar.open('Fehler beim Zurückgeben des Gegenstands', 'OK', { duration: 3000 });
      }
    }
  }

  public isExpanded(itemId: string): boolean {
    return this.expandedItemIds().has(itemId);
  }

  public getUserNameFromCache(userId: string): string {
    return this.userNamesCache().get(userId) || '';
  }

  public isLoadingUserName(userId: string): boolean {
    return this.loadingUserNames().has(userId);
  }

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

  /**
   * Tag hinzufügen via Chip-Input
   */
  public addTag(event: any): void {
    const value = (event.value || '').trim();

    if (value) {
      const currentTags = this.tags();
      if (!currentTags.includes(value)) {
        this.tags.set([...currentTags, value]);
      }
    }

    // Input leeren
    event.chipInput?.clear();
  }

  /**
   * Tag entfernen
   */
  public removeTag(tag: string): void {
    const currentTags = this.tags();
    this.tags.set(currentTags.filter(t => t !== tag));
  }

  /**
   * Neues Item hinzufügen
   */
  public async addNewItem(): Promise<void> {
    if (this.itemForm.invalid) {
      this.itemForm.markAllAsTouched();
      return;
    }

    const userId = this.currentUserId();
    if (!userId) {
      this.snackBar.open('Bitte zuerst einloggen', 'OK', { duration: 3000 });
      return;
    }

    this.isSubmitting.set(true);

    try {
      const formValue = this.itemForm.value;
      const tagsArray = this.tags();

      const newItem = this.buildItemData(formValue, tagsArray, userId);

      await this.itemService.addItem(newItem);

      // Formular UND Tags zurücksetzen
      this.itemForm.reset();
      this.tags.set([]);

      this.snackBar.open(`"${newItem.name}" erfolgreich hinzugefügt!`, 'OK', { duration: 2000 });

    } catch (error) {
      console.error('Fehler beim Hinzufügen:', error);
      this.snackBar.open('Fehler beim Hinzufügen des Gegenstands', 'OK', { duration: 3000 });
    } finally {
      this.isSubmitting.set(false);
    }
  }

  /**
   * Baut Item-Daten ohne undefined-Felder
   */
  private buildItemData(formValue: any, tags: string[], userId: string): Omit<Item, 'id'> {
    const item: any = {
      name: formValue.name!,
      category: formValue.category!,
      isBorrowed: false,
      createdBy: userId,
      createdAt: new Date()
    };

    // Optionale Felder nur wenn vorhanden
    if (formValue.description?.trim()) {
      item.description = formValue.description.trim();
    }

    if (tags.length > 0) {
      item.tags = tags;
    }

    return item;
  }

  /**
   * Formular abbrechen
   */
  public cancelAdd(): void {
    this.itemForm.reset();
    this.tags.set([]);
  }

  /**
   * Prüft ob User das Item löschen darf (nur eigene Items)
   */
  public canDelete(item: Item): boolean {
    const userId = this.currentUserId();
    return userId !== undefined && item.createdBy === userId;
  }

  /**
   * Item löschen
   */
  public async deleteItem(item: Item, event: Event): Promise<void> {
    event.stopPropagation();

    // Sicherheitscheck
    if (!this.canDelete(item)) {
      this.snackBar.open('Du kannst nur deine eigenen Gegenstände löschen', 'OK', { duration: 3000 });
      return;
    }

    // Doppelte Bestätigung bei ausgeliehenen Items
    if (item.isBorrowed) {
      this.snackBar.open('Dieser Gegenstand ist noch ausgeliehen!', 'OK', { duration: 3000 });
      return;
    }

    if (confirm(`"${item.name}" wirklich löschen? Diese Aktion kann nicht rückgängig gemacht werden.`)) {
      try {
        await this.itemService.deleteItem(item.id);
        this.snackBar.open(`"${item.name}" erfolgreich gelöscht`, 'OK', { duration: 2000 });

        // Collapsed state entfernen
        const expanded = this.expandedItemIds();
        expanded.delete(item.id);
        this.expandedItemIds.set(new Set(expanded));

      } catch (error) {
        console.error('Fehler beim Löschen:', error);
        this.snackBar.open('Fehler beim Löschen des Gegenstands', 'OK', { duration: 3000 });
      }
    }
  }

  /**
   * Prüft ob User das Item zurückgeben darf (nur wenn selbst ausgeliehen)
   */
  public canReturn(item: Item): boolean {
    const userId = this.currentUserId();
    return userId !== undefined && item.borrowedByUserId === userId;
  }

  ngOnDestroy(): void {
    this.destroy$.next();
    this.destroy$.complete();
  }
}
