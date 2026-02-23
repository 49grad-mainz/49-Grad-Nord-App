import { Injectable } from '@angular/core';
import { AngularFireAuth } from "@angular/fire/compat/auth";
import firebase from 'firebase/compat/app';
import { SnackbarService } from "../services/snackbar.service";
import { Observable } from "rxjs";
import { Router } from "@angular/router";

@Injectable({
  providedIn: 'root',
})
export class AuthService {

  constructor(private afAuth: AngularFireAuth, private router: Router, private snackbarService: SnackbarService) {
  }

  loginWithGoogle() {
    this.afAuth.signInWithPopup(new firebase.auth.GoogleAuthProvider()).then(
      (cred) => {
        if (cred?.additionalUserInfo?.isNewUser) {
          this.router.navigateByUrl('waiting-room');
        } else {
          this.router.navigateByUrl('dashboard');
          this.snackbarService.success('Erfolgreich eingeloggt');
        }
      }).catch(
        (error) => {
          alert(error);
        }
      )
  }

  logout(): Promise<void> {
    return this.afAuth.signOut()
  }

  get isLoggedIn$(): Observable<firebase.User | null> {
    return this.afAuth.authState;
  }

  registerWithEmail(email: string, password: string): Promise<firebase.auth.UserCredential> {
    return this.afAuth.createUserWithEmailAndPassword(email, password);
  }

  loginWithEmail(email: string, password: string): Promise<firebase.auth.UserCredential> {
    return this.afAuth.signInWithEmailAndPassword(email, password);
  }

  forgotPassword(email: string): Promise<void> {
    return this.afAuth.sendPasswordResetEmail(email);
  }

  async verifySession(): Promise<boolean> {
    const user = await this.afAuth.currentUser;
    if (!user) return false;
    try {
      await user.getIdToken(true);
      return true; // Session is valid, token refreshed
    } catch (e) {
      console.error('Session verification failed:', e);
      return false; // Session invalid
    }
  }
}
