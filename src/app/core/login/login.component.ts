import { Component } from '@angular/core';
import { startWith, take } from "rxjs";
import { AuthService } from "../auth.service";
import { map } from "rxjs/operators";
import { Router } from "@angular/router";

@Component({
  selector: 'app-login',
  templateUrl: './login.component.html',
  styleUrls: ['./login.component.scss'],
  standalone: false
})
export class LoginComponent {
  public isLoggingOut = false;
  public isLoggedIn$ = this.authService.isLoggedIn$.pipe(
    startWith(null),
    map(isLoggedIn => !!isLoggedIn),
  );

  public constructor(
    private authService: AuthService,
    private router: Router) {
  }

  public logout() {
    this.isLoggingOut = true;
    this.authService.logout().then(() => {
      window.location.reload();
      this.isLoggingOut = false;
    });
  }

  public redirectToMainPage() {
    this.router.navigate(['/dashboard']);
  }
}
