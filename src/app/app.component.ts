import { Component, OnDestroy, OnInit } from '@angular/core';
import { fromEvent, Observable, startWith, Subject, Subscription, take, takeUntil } from "rxjs";
import { Router } from "@angular/router";
import { AuthService } from "./core/auth.service";
import { map } from "rxjs/operators";
import { SnackbarService } from "./services/snackbar.service";

@Component({
  selector: 'app-root',
  templateUrl: './app.component.html',
  styleUrls: ['./app.component.scss'],
  standalone: false
})
export class AppComponent implements OnInit, OnDestroy {

  isMobileView = true;

  resizeObservable$: Observable<Event> | undefined
  title = 'ng-wohnfeld11';
  public isLoggedOut$: Observable<boolean> | undefined;
  public isLoggedIn$: Observable<boolean> | undefined;

  private destroy$ = new Subject<void>()

  private isLoggingOut = false;
  private wasLoggedIn = false;

  constructor(
    private router: Router,
    private authService: AuthService,
    private snackbar: SnackbarService,
  ) {
  }

  ngOnInit() {
    this.resizeObservable$ = fromEvent(window, 'resize')
    this.resizeObservable$
      .pipe(
        takeUntil(this.destroy$),
        startWith(window.innerWidth)
      ).subscribe(evt => {
        this.isMobileView = window.innerWidth < 600;
      })
    this.isLoggedOut$ = this.authService.isLoggedIn$.pipe(
      startWith(false),
      takeUntil(this.destroy$),
      map(user => !user)
    )
    this.isLoggedIn$ = this.authService.isLoggedIn$.pipe(
      startWith(false),
      takeUntil(this.destroy$),
      map(user => !!user)
    )

    this.authService.isLoggedIn$
      .pipe(takeUntil(this.destroy$))
      .subscribe(user => {
        if (user) {
          this.wasLoggedIn = true;
          this.isLoggingOut = false;
        } else {
          if (this.wasLoggedIn && !this.isLoggingOut) {
            this.snackbar.error('Ihre Sitzung ist abgelaufen. Bitte melden Sie sich erneut an.');
            this.navigateToLoginPage();
          }
          this.wasLoggedIn = false;
          this.isLoggingOut = false; // Reset for next time
        }
      });

  }

  ngOnDestroy() {
    this.destroy$.next()
    this.destroy$.complete()
  }

  logout() {
    this.isLoggingOut = true;
    this.authService.logout().then(() => {
      this.navigateToLoginPage()
      this.snackbar.success('Erfolgreich ausgeloggt',)
    }).catch(() => {
      this.isLoggingOut = false; // Reset if logout failed
    })
  }

  navigateToLoginPage() {
    this.router.navigateByUrl('/login')
  }

  navigateToUserProfile() {
    this.router.navigateByUrl('/profile')
  }

  public navigateToImpressum() {
    this.router.navigateByUrl('/impressum')
  }

  public navigateToDatenschutz() {
    this.router.navigateByUrl('/datenschutz')
  }
}
