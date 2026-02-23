import {Injectable, OnDestroy} from "@angular/core";
import {SwUpdate, VersionReadyEvent} from "@angular/service-worker";
import {filter, Subject, takeUntil, BehaviorSubject} from "rxjs";
import { SnackbarService } from "../../services/snackbar.service";

@Injectable({providedIn: 'root'})
export class PromptUpdateService implements OnDestroy {
  private destroy$ = new Subject<void>();
  private _hasUpdate$ = new BehaviorSubject<boolean>(false);

  // Public observable to track if update is available
  public readonly hasUpdate$ = this._hasUpdate$.asObservable();

  constructor(
    private swUpdate: SwUpdate,
    private snackBarService: SnackbarService
    ) {
    swUpdate.versionUpdates
      .pipe(
        filter((evt): evt is VersionReadyEvent => evt.type === 'VERSION_READY'),
        takeUntil(this.destroy$)
      )
      .subscribe(evt => {
        // Set the update flag to true when new version is ready
        this._hasUpdate$.next(true);
      });
  }

  // Method to manually trigger the update
  public updateApp(): void {
    if (this._hasUpdate$.value) {
      document.location.reload();
    }
  }

  // Method to dismiss the update notification (optional)
  public dismissUpdate(): void {
    this._hasUpdate$.next(false);
    this.snackBarService.success('Die neue Version wird automatisch beim nächsten Laden der App installiert.', 10000);
  }

  ngOnDestroy(): void {
    this.destroy$.next();
    this.destroy$.complete();
    this._hasUpdate$.complete();
  }
}
