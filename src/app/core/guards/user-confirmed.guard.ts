import { Injectable } from '@angular/core';
import { ActivatedRouteSnapshot, Router, RouterStateSnapshot, UrlTree } from '@angular/router';
import { combineLatest, Observable, tap } from 'rxjs';
import { UserService } from "../../services/user.service";
import { map } from "rxjs/operators";
import { SnackbarService } from "../../services/snackbar.service";

@Injectable({
  providedIn: 'root'
})
export class UserConfirmedGuard  {
  constructor(
    private userService: UserService,
    private router: Router,
    private snackbarService: SnackbarService) {
  }

  canActivate(
    route: ActivatedRouteSnapshot,
    state: RouterStateSnapshot): Observable<boolean | UrlTree> | Promise<boolean | UrlTree> | boolean | UrlTree {
    const userConfirmed = this.userService.isConfirmed$;
    const userLoggedIn = this.userService.isLoggedIn$;
    return combineLatest([userConfirmed, userLoggedIn]).pipe(
      map(([confirmed, loggedIn]) => {
        if (!loggedIn) {
          this.snackbarService.error('Bitte logge dich ein, um diese Seite zu sehen.');
          this.router.navigateByUrl('/login')
        } else if (!confirmed) {
          this.router.navigateByUrl('/waiting-room')
        }
        return loggedIn && confirmed;
      })
    )
    // return this.userService
    //   .isConfirmed$
    //   .pipe(
    //     map((e) => {
    //       return e;
    //     }),
    //     tap((e) => {
    //       if (!e) {
    //         this.router.navigateByUrl('/waiting-room')
    //       }
    //     })
    //   )
  }

}
