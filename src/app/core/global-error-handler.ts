import { ErrorHandler, Injectable, Injector, NgZone } from '@angular/core';
import { AuthService } from './auth.service';
import { SnackbarService } from '../services/snackbar.service';
import { Router } from '@angular/router';

@Injectable()
export class GlobalErrorHandler implements ErrorHandler {

    constructor(private injector: Injector, private zone: NgZone) { }

    handleError(error: any): void {
        const chunkFailedMessage = /Loading chunk [\d]+ failed/;

        if (chunkFailedMessage.test(error.message)) {
            window.location.reload();
            return;
        }

        // Check for Firebase permission errors or unauthenticated errors
        const errorMessage = error?.message || error?.toString() || '';
        const isPermissionError =
            errorMessage.includes('Missing or insufficient permissions') ||
            errorMessage.includes('permission-denied') ||
            (error?.code === 'permission-denied');

        if (isPermissionError) {
            console.error('Caught global permission error. Verifying session...', error);

            this.zone.run(() => {
                const authService = this.injector.get(AuthService);
                const router = this.injector.get(Router);
                const snackbar = this.injector.get(SnackbarService);

                authService.verifySession().then(isValid => {
                    if (isValid) {
                        // Session is valid, but user lacks permission for this specific resource
                        snackbar.error('Zugriff verweigert - Keine Berechtigung für diese Aktion.');
                    } else {
                        // Session is dead (token refresh failed)
                        authService.logout().then(() => {
                            router.navigate(['/login']);
                            snackbar.error('Sitzung abgelaufen. Bitte neu einloggen.');
                        });
                    }
                });
            });
        } else {
            // Log other errors to console as usual
            console.error(error);
        }
    }
}
