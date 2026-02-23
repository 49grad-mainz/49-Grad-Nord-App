import { Component, OnDestroy, OnInit } from '@angular/core';
import { UserService } from "../../services/user.service";
import { Subject, Subscription, takeUntil } from "rxjs";
import { SnackbarService } from "../../services/snackbar.service";
import { AngularFireAuth } from "@angular/fire/compat/auth";
import { Router, ActivatedRoute } from "@angular/router";
import { MatInputModule } from "@angular/material/input";
import { AsyncPipe } from "@angular/common";
import { FormsModule } from "@angular/forms";
import { MatTabsModule } from "@angular/material/tabs";
import { MatSlideToggleModule } from "@angular/material/slide-toggle";
import { MatFormFieldModule } from "@angular/material/form-field";
import { MatButton } from "@angular/material/button";
import { PushNotificationService } from "../services/push-notification.service";
import { MatIcon } from "@angular/material/icon";
import { CommonSharedModule } from "../../shared/common-shared.module";
import { MatDialog } from '@angular/material/dialog';
import {
  NotificationHelpDialogComponent
} from "../components/notification-dialog/app-notification-help-dialog.component";
import { UserPhoneNumberService } from "../../services/user-phone-number.service"; // ← NEU


@Component({
  selector: 'app-user-profile',
  templateUrl: './user-profile.component.html',
  styleUrls: ['./user-profile.component.scss'],
  standalone: true,
  imports: [
    AsyncPipe,
    FormsModule,
    MatTabsModule,
    MatSlideToggleModule,
    MatFormFieldModule,
    MatInputModule,
    MatButton,
    MatIcon,
    CommonSharedModule
  ]
})
export class UserProfileComponent implements OnInit, OnDestroy {
  private destroy$ = new Subject<void>();
  public readonly userDisplayName$ = this.userService.userDisplayNameFromFirestore$?.pipe(takeUntil(this.destroy$));
  public userEmailAddress$ = this.userService.userEmail$.pipe(takeUntil(this.destroy$));

  private userId: string | null = null;
  public isLoading = false;
  public isDeletingMyAccount = false;
  public newName: string = '';
  public newEmail: string = '';
  public phoneNumber: string = ''; // ← NEU
  private userIdSubscription: Subscription | undefined = undefined;

  public showNotificationPrompt = false;
  public notificationPermissionStatus: NotificationPermission = 'default';

  public selectedTabIndex = 0; // Default to first tab

  constructor(
    private userService: UserService,
    private snackBarService: SnackbarService,
    private afAuth: AngularFireAuth,
    private router: Router,
    private route: ActivatedRoute, // Inject ActivatedRoute
    private pushNotificationService: PushNotificationService,
    private dialog: MatDialog,
    private userPhoneNumberService: UserPhoneNumberService
  ) { }

  ngOnInit(): void {
    // Check for tab query parameter
    this.route.queryParams.pipe(takeUntil(this.destroy$)).subscribe(params => {
      if (params['tab']) {
        this.selectedTabIndex = +params['tab']; // Convert string to number
      }
    });

    this.checkNotificationPermission();
    this.userIdSubscription = this.userService.userId$?.pipe(takeUntil(this.destroy$)).subscribe(userId => {
      if (userId) {
        this.userId = userId;
        this.loadPhoneNumber();
      } else {
        console.error('User ID is not defined.');
      }
    });
  }

  public changeName(): void {
    if (!this.userId) {
      alert('User ID is not available for name change.');
      return;
    }

    this.isLoading = true;
    if (this.newName.trim()) {
      this.userService.updateDisplayName(this.newName, this.userId)
        .then(() => {
          this.snackBarService.success('Name erfolgreich geändert');
          this.newName = '';
        })
        .catch(() => {
          this.snackBarService.error('Fehler beim Ändern des Namens');
        })
        .finally(() => {
          this.isLoading = false;
        });
    } else {
      this.isLoading = false;
    }
  }

  public updateUserEmail(): void {
    if (!this.userId) {
      alert('User ID is not available for email update.');
      return;
    }

    this.isLoading = true;
    if (this.newEmail.trim() && this.newEmail.includes('@')) {
      this.afAuth.currentUser?.then(user => {
        user?.updateEmail(this.newEmail)
          .then(() => {
            this.snackBarService.success('E-Mail-Adresse erfolgreich geändert');
            this.newEmail = '';
          })
          .catch(() => {
            this.snackBarService.error('Fehler beim Ändern der E-Mail-Adresse');
          })
          .finally(() => {
            this.isLoading = false;
          });
      });
    } else {
      this.snackBarService.error('Bitte gib\' eine gültige E-Mail-Adresse ein');
      this.isLoading = false;
    }
  }

  public confirmAccountDeletion(): void {
    if (confirm('Möchten Sie Ihren Account wirklich löschen?')) {
      this.deleteMyAccountConfirmed();
    }
  }

  private deleteMyAccountConfirmed(): void {
    this.isDeletingMyAccount = true;
    this.afAuth.currentUser?.then(user => {
      user?.delete().then(() => {
        this.snackBarService.success('Account erfolgreich gelöscht');
        this.router.navigate(['/till-next-time']);
      }).catch((error) => {
        this.snackBarService.error('Fehler beim Löschen des Accounts');
        alert(error)
      }).finally(() => {
        this.isDeletingMyAccount = false;
      });
    });
  }

  // ← NEUE METHODEN für Telefonnummer
  private loadPhoneNumber(): void {
    if (!this.userId) return;
    this.userPhoneNumberService.getPhoneNumber(this.userId)
      .pipe(takeUntil(this.destroy$))
      .subscribe(number => {
        this.phoneNumber = number || '';
      });
  }

  public savePhoneNumber(): void {
    if (!this.userId) return;
    this.isLoading = true;
    this.userPhoneNumberService.savePhoneNumber(this.userId, this.phoneNumber)
      .then(() => {
        this.snackBarService.success('Telefonnummer gespeichert');
      })
      .catch(() => {
        this.snackBarService.error('Fehler beim Speichern der Telefonnummer');
      })
      .finally(() => {
        this.isLoading = false;
      });
  }

  public deletePhoneNumber(): void {
    if (!this.userId) return;
    if (!confirm('Möchtest du deine Telefonnummer wirklich löschen?')) return;

    this.isLoading = true;
    this.userPhoneNumberService.deletePhoneNumber(this.userId)
      .then(() => {
        this.phoneNumber = '';
        this.snackBarService.success('Telefonnummer gelöscht');
      })
      .catch(() => {
        this.snackBarService.error('Fehler beim Löschen der Telefonnummer');
      })
      .finally(() => {
        this.isLoading = false;
      });
  }

  ngOnDestroy(): void {
    this.destroy$.next();
    this.destroy$.complete();
  }

  private async checkNotificationPermission() {
    this.notificationPermissionStatus = Notification.permission;
    this.showNotificationPrompt = Notification.permission === 'default';
  }

  public async requestNotificationPermission() {
    try {
      await this.pushNotificationService.requestPermission();
      this.notificationPermissionStatus = Notification.permission;
      this.showNotificationPrompt = false;

      if (this.notificationPermissionStatus === 'granted') {
        this.snackBarService.success('Benachrichtigungen aktiviert!');
      } else if (this.notificationPermissionStatus === 'denied') {
        this.snackBarService.error('Benachrichtigungen wurden abgelehnt');
      }
    } catch (error) {
      console.error('Error requesting notification permission:', error);
      this.notificationPermissionStatus = Notification.permission;
      this.showNotificationPrompt = false;
    }
  }

  public get isNotificationDenied(): boolean {
    return this.notificationPermissionStatus === 'denied';
  }

  public get isNotificationGranted(): boolean {
    return this.notificationPermissionStatus === 'granted';
  }

  // ← NEUE METHODE mit Dialog
  public openNotificationSettings(): void {
    const { instructions, platform, settingsUrl } = this.getNotificationInstructions();

    this.dialog.open(NotificationHelpDialogComponent, {
      data: {
        instructions,
        platform,
        settingsUrl
      },
      width: '600px',
      maxWidth: '90vw'
    });
  }

  // ← NEUE HELPER METHODE
  private getNotificationInstructions(): { instructions: string; platform: string; settingsUrl?: string } {
    const userAgent = navigator.userAgent.toLowerCase();
    const isIOS = /iphone|ipad|ipod/.test(userAgent);
    const isAndroid = /android/.test(userAgent);
    const isChrome = /chrome/.test(userAgent) && !/edg/.test(userAgent);
    const isFirefox = /firefox/.test(userAgent);
    const isSafari = /safari/.test(userAgent) && !/chrome/.test(userAgent);
    const isEdge = /edg/.test(userAgent);

    if (isIOS) {
      return {
        platform: '📱 iOS (iPhone/iPad)',
        instructions:
          '1. Öffne die "Einstellungen" App auf deinem iPhone\n' +
          '2. Scrolle runter und tippe auf "Safari"\n' +
          '3. Tippe auf "Websites"\n' +
          '4. Tippe auf "Mitteilungen"\n' +
          '5. Suche diese Website in der Liste\n' +
          '6. Wähle "Erlauben"\n\n' +
          '💡 Alternative: Lösche die App vom Homescreen und installiere sie neu, dann wirst du erneut gefragt.'
      };
    }

    if (isAndroid && isChrome) {
      return {
        platform: '📱 Android (Chrome)',
        instructions:
          '1. Tippe auf die drei Punkte (⋮) oben rechts im Browser\n' +
          '2. Tippe auf "Einstellungen"\n' +
          '3. Tippe auf "Website-Einstellungen"\n' +
          '4. Tippe auf "Benachrichtigungen"\n' +
          '5. Suche diese Website in der Liste unter "Blockiert"\n' +
          '6. Tippe darauf und wähle "Zulassen"\n\n' +
          '💡 Schneller: Tippe lange auf die App und wähle "App-Info" → "Benachrichtigungen"'
      };
    }

    if (isAndroid) {
      return {
        platform: '📱 Android',
        instructions:
          '1. Öffne die Einstellungen deines Smartphones\n' +
          '2. Gehe zu "Apps" oder "Anwendungen"\n' +
          '3. Suche nach deinem Browser oder "49°N"\n' +
          '4. Tippe auf "Benachrichtigungen"\n' +
          '5. Aktiviere Benachrichtigungen\n\n' +
          '💡 Alternative: Lösche die App und installiere sie neu vom Homescreen.'
      };
    }

    if (isChrome) {
      return {
        platform: '💻 Chrome (Desktop)',
        settingsUrl: 'chrome://settings/content/notifications',
        instructions:
          '1. Klicke auf das Schloss-Symbol 🔒 links in der Adressleiste\n' +
          '2. Klicke auf "Website-Einstellungen"\n' +
          '3. Suche "Benachrichtigungen" in der Liste\n' +
          '4. Ändere die Einstellung von "Blockieren" zu "Zulassen"\n' +
          '5. Lade die Seite neu (F5)\n\n' +
          '💡 Oder klicke auf "Einstellungen öffnen" unten und suche diese Website in der Liste.'
      };
    }

    if (isFirefox) {
      return {
        platform: '💻 Firefox',
        settingsUrl: 'about:preferences#privacy',
        instructions:
          '1. Klicke auf das Schloss-Symbol 🔒 links in der Adressleiste\n' +
          '2. Klicke auf "Verbindung sicher"\n' +
          '3. Klicke auf "Weitere Informationen"\n' +
          '4. Gehe zum Tab "Berechtigungen"\n' +
          '5. Finde "Benachrichtigungen senden"\n' +
          '6. Entferne das Häkchen bei "Standardeinstellung verwenden"\n' +
          '7. Wähle "Erlauben"\n\n' +
          '💡 Oder klicke auf "Einstellungen öffnen" und gehe zu Datenschutz & Sicherheit → Benachrichtigungen.'
      };
    }

    if (isSafari) {
      return {
        platform: '💻 Safari (Mac)',
        instructions:
          '1. Öffne Safari → Einstellungen (oder cmd + ,)\n' +
          '2. Gehe zum Tab "Websites"\n' +
          '3. Klicke links auf "Mitteilungen"\n' +
          '4. Suche diese Website in der Liste\n' +
          '5. Ändere die Einstellung auf "Erlauben"\n\n' +
          '💡 Oder: Klicke in der Menüleiste auf "Safari" → "Einstellungen für diese Website"'
      };
    }

    if (isEdge) {
      return {
        platform: '💻 Microsoft Edge',
        settingsUrl: 'edge://settings/content/notifications',
        instructions:
          '1. Klicke auf das Schloss-Symbol 🔒 links in der Adressleiste\n' +
          '2. Klicke auf "Berechtigungen für diese Website"\n' +
          '3. Finde "Benachrichtigungen"\n' +
          '4. Ändere von "Blockieren" zu "Zulassen"\n\n' +
          '💡 Oder klicke auf "Einstellungen öffnen" unten und suche diese Website.'
      };
    }

    return {
      platform: '💻 Browser',
      instructions:
        '1. Suche nach dem Schloss-Symbol 🔒 oder Info-Symbol (ⓘ) in der Adressleiste\n' +
        '2. Klicke darauf und suche nach "Benachrichtigungen"\n' +
        '3. Ändere die Einstellung auf "Erlauben"\n' +
        '4. Lade die Seite neu\n\n' +
        '💡 Oder öffne die Browser-Einstellungen und suche nach "Website-Einstellungen"'
    };
  }
}
