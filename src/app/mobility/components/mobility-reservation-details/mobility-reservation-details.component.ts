import { Component, Inject, inject } from '@angular/core';
import { take } from 'rxjs';
import { MAT_DIALOG_DATA, MatDialogRef, MatDialog } from '@angular/material/dialog';
import { MobilityBookingDialogComponent } from '../mobility-booking-dialog/mobility-booking-dialog.component';
import { MobilityResourceService } from '../../services/mobility-resource.service';
import { MobilityReservation } from '../../services/mobility-reservation.service';
import { AuthService } from 'src/app/core/auth.service';
import { CommonModule, DatePipe } from '@angular/common';
import { MatButtonModule } from '@angular/material/button';
import { MatIconModule } from '@angular/material/icon';
import { MatDialogModule } from '@angular/material/dialog';

export interface ReservationDetailsData {
    reservation: MobilityReservation;
    userName?: string;
}

@Component({
    selector: 'app-mobility-reservation-details',
    standalone: false,
    templateUrl: './mobility-reservation-details.component.html',
    styleUrls: ['./mobility-reservation-details.component.scss']
})
export class MobilityReservationDetailsComponent {
    private authService = inject(AuthService);
    private dialog = inject(MatDialog);
    private resourceService = inject(MobilityResourceService);
    currentUserId$ = this.authService.isLoggedIn$;

    constructor(
        public dialogRef: MatDialogRef<MobilityReservationDetailsComponent>,
        @Inject(MAT_DIALOG_DATA) public data: ReservationDetailsData
    ) { }

    get isSameDay(): boolean {
        const start = this.data.reservation.startTime;
        const end = this.data.reservation.endTime;
        return start.getFullYear() === end.getFullYear() &&
            start.getMonth() === end.getMonth() &&
            start.getDate() === end.getDate();
    }

    onDelete(): void {
        if (confirm('Möchtest du diese Reservierung wirklich löschen?')) {
            this.dialogRef.close({ action: 'delete', reservation: this.data.reservation });
        }
    }

    onEdit(): void {
        const resourceId = this.data.reservation.resourceId;
        this.resourceService.getResource(resourceId).pipe(take(1)).subscribe(resource => {
            if (resource) {
                const dialogRef = this.dialog.open(MobilityBookingDialogComponent, {
                    data: {
                        resource: resource,
                        userId: this.data.reservation.userId,
                        reservation: this.data.reservation
                    },
                    width: '500px',
                    maxWidth: '95vw'
                });

                dialogRef.afterClosed().subscribe(result => {
                    if (result) {
                        this.dialogRef.close({ action: 'update' });
                    }
                });
            }
        });
    }

    onClose(): void {
        this.dialogRef.close();
    }
}
