import { Component, OnDestroy } from '@angular/core';
import { FormControl, FormGroup, Validators } from "@angular/forms";
import { Router } from "@angular/router";
import { AuthService } from "../../auth.service";
import { SnackbarService } from "../../../services/snackbar.service";
import { Subject, takeUntil } from "rxjs";

@Component({
    selector: 'app-login-with-email-and-password',
    templateUrl: './login-with-email-and-password.component.html',
    styleUrls: ['./login-with-email-and-password.component.scss'],
    standalone: false
})
export class LoginWithEmailAndPasswordComponent implements OnDestroy {

  loginForm: FormGroup;
  public enableForgotPasswordButton = false;

  destroy$ = new Subject<void>()

  constructor(public authService: AuthService, private router: Router, private snackBar: SnackbarService) {
    this.loginForm = new FormGroup({
      email: new FormControl('', [Validators.required]),
      password: new FormControl('', [Validators.required])
    });

    this.loginForm.get('email')?.valueChanges
      .pipe(
        takeUntil(this.destroy$)
      )
      .subscribe((value) => {
        this.enableForgotPasswordButton = value.length > 0;
      })

  }


  loginWithEmail() {
    const trimmedEmail = this.loginForm.get('email')?.value.trim();
    const password = this.loginForm.get('password')?.value;
    this.authService.loginWithEmail(trimmedEmail, password).then((cred) => {
      if (cred?.additionalUserInfo?.isNewUser) {
        this.router.navigateByUrl('waiting-room');
        this.snackBar.info('Willkommen! Bitte warte auf die Freigabe Deines Accounts. Du wirst benachrichtigt, sobald Du dich einloggen kannst.')
      } else {
        this.router.navigateByUrl('dashboard');
        this.snackBar.success('Erfolgreich eingeloggt');
      }
    }).catch(
      (error) => {
        alert(error);
      }
    );
  }

  forgotPassword() {
    const trimmedEmail = this.loginForm.get('email')?.value.trim();
    this.authService.forgotPassword(trimmedEmail).then(() => {
      this.snackBar.info('Eine E-Mail mit einem Link zum Zurücksetzen Deines Passworts wurde an Dich gesendet.')
    }).catch((error) => {
      alert(error);
    })
  }

  ngOnDestroy(): void {
    this.destroy$.next();
    this.destroy$.complete();
  }
}
