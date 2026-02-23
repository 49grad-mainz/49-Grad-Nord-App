import { Component, OnInit, OnDestroy } from '@angular/core';
import { UserService } from '../../../services/user.service';
import { Subject, takeUntil } from 'rxjs';

@Component({
    selector: 'app-waschen-overview',
    templateUrl: './waschen-overview.component.html',
    styleUrls: ['./waschen-overview.component.scss'],
    standalone: false
})
export class WaschenOverviewComponent implements OnInit, OnDestroy {
  public enableReservationScroll: boolean = false;
  public currentUserId: string | null = null;
  private destroy$ = new Subject<void>();

  constructor(private userService: UserService) {}

  ngOnInit() {
    // Get current user ID
    this.userService.userId$.pipe(takeUntil(this.destroy$)).subscribe(userId => {
      this.currentUserId = userId || null;
    });

    // Subscribe to reservation scroll setting
    this.userService.enableReservationScroll$.pipe(takeUntil(this.destroy$)).subscribe(enabled => {
      this.enableReservationScroll = enabled;
    });
  }

  public updateReservationScrollSetting(): void {
    if (this.currentUserId) {
      this.userService.updateReservationScrollFlag(this.currentUserId, this.enableReservationScroll);
    }
  }

  ngOnDestroy() {
    this.destroy$.next();
    this.destroy$.complete();
  }
}
