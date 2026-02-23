import {Component, OnDestroy} from '@angular/core';
import {FormControl, FormGroup, ReactiveFormsModule, Validators} from "@angular/forms";
import {Router} from "@angular/router";
import {AuthService} from "../../auth.service";
import {SnackbarService} from "../../../services/snackbar.service";
import {Subject, takeUntil} from "rxjs";
import {MatCard, MatCardContent} from "@angular/material/card";
import {MatFormField} from "@angular/material/form-field";
import {MatInput} from "@angular/material/input";
import {MatButton} from "@angular/material/button";
import { NgClass } from "@angular/common";

export const StrongPasswordRegx: RegExp =
  /^(?=[^A-Z]*[A-Z])(?=[^a-z]*[a-z])(?=\D*\d).{8,}$/;

@Component({
  selector: 'app-register-with-email-and-password',
  templateUrl: './register-with-email-and-password.component.html',
  imports: [
    MatCardContent,
    MatCard,
    ReactiveFormsModule,
    MatFormField,
    MatInput,
    MatButton,
    NgClass
],
  standalone: true,
  styleUrls: ['./register-with-email-and-password.component.scss']
})
export class RegisterWithEmailAndPasswordComponent implements OnDestroy {

  registerForm: FormGroup;
  public enableForgotPasswordButton = false;
  public isRegistering = false;

  destroy$ = new Subject<void>()

  public constructor(
    public authService: AuthService,
    private router: Router,
    private snackBar: SnackbarService) {
    this.registerForm = new FormGroup({
      email: new FormControl('', [Validators.required, Validators.email]),
      password: new FormControl('', [Validators.required, Validators.minLength(6), Validators.pattern(StrongPasswordRegx)])
    });

    this.registerForm.get('email')?.valueChanges
      .pipe(
        takeUntil(this.destroy$)
      )
      .subscribe((value) => {
        this.enableForgotPasswordButton = value.length > 0;
      })


  }

  get passwordFormField() {
    return this.registerForm.get('password');
  }

  public registerWithEmail() {
    this.isRegistering = true;
    const trimmedEmail = this.registerForm.get('email')?.value.trim();
    const password = this.registerForm.get('password')?.value;
    this.authService.registerWithEmail(trimmedEmail, password).then((cred) => {
      this.isRegistering = false;
      if (cred?.additionalUserInfo?.isNewUser) {
        this.router.navigateByUrl('waiting-room');
        this.snackBar.info('Willkommen! Bitte warte auf die Freigabe Deines Accounts. Du wirst benachrichtigt, sobald Du dich einloggen kannst.')
      } else {
        this.router.navigateByUrl('dashboard');
        this.snackBar.success('Erfolgreich eingeloggt');
      }
    }).catch(
      (error) => {
        this.isRegistering = false;
        alert(error);
      }
    );
  }

  ngOnDestroy(): void {
    this.destroy$.next();
    this.destroy$.complete();
  }
}
