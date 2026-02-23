import { Component } from '@angular/core';
import { AuthService } from "../../auth.service";

@Component({
    selector: 'app-login-with-google',
    templateUrl: './login-with-google.component.html',
    styleUrls: ['./login-with-google.component.scss'],
    standalone: false
})
export class LoginWithGoogleComponent {
  constructor(private authService: AuthService) {
  }
  loginWithGoogle() {
    this.authService.loginWithGoogle()
  }
}
