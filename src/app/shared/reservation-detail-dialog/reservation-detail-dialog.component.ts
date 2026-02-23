import { Component, Inject } from '@angular/core';
import { MAT_DIALOG_DATA, MatDialogRef } from '@angular/material/dialog';
import { Reservation } from '../../raumbelegung/services/room-reservations.service';
import { isSameDay } from '../date.utils';

export interface ReservationDetailDialogData {
    reservation: Reservation;
    creatorName: string;
    creatorPhoneNumber?: string | null;
    isOwner: boolean;
    viewerHasPhoneNumber: boolean;
    roomName: string;
}

export type ReservationDetailAction = 'edit' | 'delete' | 'addPhoneNumber' | 'close';

@Component({
    selector: 'app-reservation-detail-dialog',
    templateUrl: './reservation-detail-dialog.component.html',
    styleUrls: ['./reservation-detail-dialog.component.scss'],
    standalone: false
})
export class ReservationDetailDialogComponent {

    constructor(
        public dialogRef: MatDialogRef<ReservationDetailDialogComponent>,
        @Inject(MAT_DIALOG_DATA) public data: ReservationDetailDialogData
    ) { }

    onClose(): void {
        this.dialogRef.close({ action: 'close' });
    }

    onEdit(): void {
        this.dialogRef.close({ action: 'edit' });
    }

    onDelete(): void {
        this.dialogRef.close({ action: 'delete' });
    }

    onAddPhoneNumber(): void {
        this.dialogRef.close({ action: 'addPhoneNumber' });
    }

    readonly isSameDay = isSameDay;

    get isContactsApiSupported(): boolean {
        return 'contacts' in navigator && 'select' in (navigator as any).contacts;
    }

    async openContactPicker(): Promise<void> {
        try {
            const props = ['tel'];
            const opts = { multiple: false };

            const contacts = await (navigator as any).contacts.select(props, opts);

            if (contacts && contacts.length > 0) {
                const contact = contacts[0];
                if (contact.tel && contact.tel.length > 0) {
                    const phoneNumber = contact.tel[0];
                    window.location.href = `tel:${phoneNumber}`;
                } else {
                    alert('Der ausgewählte Kontakt hat keine Telefonnummer.');
                }
            }
        } catch (ex) {
            console.error('Error accessing contacts:', ex);
            // Handle error silently or show specific message if needed
            // Most common error is user cancellation, which needs no action
        }
    }
}
