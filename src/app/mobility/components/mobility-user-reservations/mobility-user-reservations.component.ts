import { Component, Input, Output, EventEmitter, inject } from '@angular/core';
import { take } from 'rxjs';
import { CommonModule, DatePipe } from '@angular/common';
import { MatButtonModule } from '@angular/material/button';
import { MatIconModule } from '@angular/material/icon';
import { MatDialog } from '@angular/material/dialog';
import { MobilityReservation } from '../../services/mobility-reservation.service';
import { MobilityResourceService, MobilityResource } from '../../services/mobility-resource.service';
import { MobilityBookingDialogComponent } from '../mobility-booking-dialog/mobility-booking-dialog.component';

@Component({
    selector: 'app-mobility-user-reservations',
    standalone: true,
    imports: [CommonModule, MatButtonModule, MatIconModule, DatePipe],
    templateUrl: './mobility-user-reservations.component.html',
    styleUrls: ['./mobility-user-reservations.component.scss']
})
export class MobilityUserReservationsComponent {
    private _reservations: MobilityReservation[] = [];

    @Input()
    set reservations(value: MobilityReservation[]) {
        this._reservations = value || [];
        this.processReservations();
    }

    @Output() reservationDeleted = new EventEmitter<MobilityReservation>();
    @Output() reservationUpdated = new EventEmitter<void>();

    upcomingReservations: MobilityReservation[] = [];
    pastReservations: MobilityReservation[] = [];
    showPast = false;

    private dialog = inject(MatDialog);
    private resourceService = inject(MobilityResourceService);

    processReservations() {
        const now = new Date();
        this.upcomingReservations = this._reservations
            .filter(r => r.endTime >= now)
            .sort((a, b) => a.startTime.getTime() - b.startTime.getTime());

        this.pastReservations = this._reservations
            .filter(r => r.endTime < now)
            .sort((a, b) => b.startTime.getTime() - a.startTime.getTime());
    }

    onDelete(reservation: MobilityReservation) {
        if (confirm('Möchtest du diese Reservierung wirklich löschen?')) {
            this.reservationDeleted.emit(reservation);
        }
    }

    onEdit(reservation: MobilityReservation) {
        this.resourceService.getResource(reservation.resourceId).pipe(take(1)).subscribe((resource: MobilityResource | undefined) => {
            if (resource) {
                const dialogRef = this.dialog.open(MobilityBookingDialogComponent, {
                    data: {
                        resource: resource,
                        userId: reservation.userId,
                        reservation: reservation
                    },
                    width: '500px',
                    maxWidth: '95vw'
                });

                dialogRef.afterClosed().subscribe(result => {
                    if (result) {
                        this.reservationUpdated.emit();
                    }
                });
            }
        });
    }

    togglePast() {
        this.showPast = !this.showPast;
    }
}
