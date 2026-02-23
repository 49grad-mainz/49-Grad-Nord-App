import { Injectable } from '@angular/core';
import { MatSnackBar } from "@angular/material/snack-bar";

@Injectable({
  providedIn: 'root'
})
export class SnackbarService {

  constructor(private _snackBar: MatSnackBar) {

  }

  success(message: string, duration: number = 5000) {
    this._snackBar.open(message, 'OK', {
      duration: duration,
      horizontalPosition: 'center',
      verticalPosition: 'bottom',
      panelClass: ['lift-snackbar-over-navbar']
      // panelClass: ['success-snackbar']
    });
  }

  error(message: string) {
    this._snackBar.open(message, 'OK', {
      duration: 5000,
      horizontalPosition: 'center',
      verticalPosition: 'bottom',
      panelClass: ['lift-snackbar-over-navbar']
      // panelClass: ['error-snackbar']
    });
  }

  info(message: string) {
    this._snackBar.open(message, 'OK', {
      duration: 5000,
      horizontalPosition: 'center',
      verticalPosition: 'bottom',
      panelClass: ['lift-snackbar-over-navbar']
      // panelClass: ['info-snackbar']
    });
  }

}
