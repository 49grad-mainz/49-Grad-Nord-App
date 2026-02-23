import { Injectable, inject } from '@angular/core';
import { Observable, from } from 'rxjs';
import { map } from "rxjs/operators";
import {
  Firestore, collection, doc, getDocs, addDoc, updateDoc, deleteDoc,
  query, where, Timestamp, DocumentReference, collectionData,
  serverTimestamp
} from '@angular/fire/firestore';

export interface Reservation {
  id?: string;
  roomId: string;
  eventName: string;
  isPrivate: boolean;
  fromDateTime: Date;
  toDateTime: Date;
  userId: string;
  formattedDate?: string;
}

@Injectable({
  providedIn: 'root'
})
export class RoomReservationsService {
  private roomReservationCollectionName = 'roomReservations';
  private firestore = inject(Firestore);

  public getReservationsForComingWeek(): Observable<Reservation[]> {
    const today = new Date();
    today.setHours(0, 0, 0, 0);

    const nextWeek = new Date(today.getTime() + 7 * 24 * 60 * 60 * 1000);

    const reservationsRef = collection(this.firestore, this.roomReservationCollectionName);
    const q = query(
      reservationsRef,
      where('toDateTime', '>=', Timestamp.fromDate(today)), // Still ongoing
      where('fromDateTime', '<', Timestamp.fromDate(nextWeek)) // Started before next week
    );

    return collectionData(q, { idField: 'id' }).pipe(
      map(reservations => reservations.map(data => {
        const reservation = data as any;
        return {
          id: reservation.id,
          roomId: reservation.roomId,
          eventName: reservation.eventName,
          isPrivate: reservation.isPrivate,
          fromDateTime: reservation.fromDateTime.toDate(), // Convert Firestore Timestamp to Date
          toDateTime: reservation.toDateTime.toDate(),     // Convert Firestore Timestamp to Date
          userId: reservation.userId
        } as Reservation;
      }))
    );
  }

  getReservationsByRoom(roomId: string): Observable<Reservation[]> {
    const reservationsRef = collection(this.firestore, this.roomReservationCollectionName);
    const q = query(
      reservationsRef,
      where('roomId', '==', roomId)
    );

    return collectionData(q, { idField: 'id' }).pipe(
      map(reservations => reservations.map(data => {
        const reservation = data as any;
        return {
          id: reservation.id,
          roomId: reservation.roomId,
          eventName: reservation.eventName,
          isPrivate: reservation.isPrivate,
          fromDateTime: reservation.fromDateTime.toDate(),
          toDateTime: reservation.toDateTime.toDate(),
          userId: reservation.userId
        } as Reservation;
      }))
    );
  }

  async createReservation(reservation: Reservation): Promise<DocumentReference> {
    if (reservation.isPrivate) {
      const now = new Date();
      const threeWeeksFromNow = new Date();
      threeWeeksFromNow.setHours(0, 0, 0, 0);
      threeWeeksFromNow.setDate(now.getDate() + 21);

      if (reservation.fromDateTime < threeWeeksFromNow) {
        if (!confirm('Diese private Reservierung ist weniger als 3 Wochen im Voraus. Trotzdem reservieren?')) {
          throw new Error('Reservierung abgebrochen');
        }
      }
    }

    const conflictingReservations = await this.checkForConflicts(reservation);
    if (conflictingReservations.length > 0) {
      throw new Error('In diesem Zeitraum gibt es bereits eine Reservierung.');
    }

    const { roomId, eventName, isPrivate, fromDateTime, toDateTime, userId } = reservation;
    const reservationsRef = collection(this.firestore, this.roomReservationCollectionName);

    return addDoc(reservationsRef, {
      roomId,
      eventName,
      isPrivate,
      fromDateTime: Timestamp.fromDate(fromDateTime),
      toDateTime: Timestamp.fromDate(toDateTime),
      userId
    });
  }

  private async checkForConflicts(reservation: Reservation): Promise<Reservation[]> {
    const reservationsRef = collection(this.firestore, this.roomReservationCollectionName);
    const q = query(
      reservationsRef,
      where('roomId', '==', reservation.roomId),
      where('fromDateTime', '<', Timestamp.fromDate(reservation.toDateTime)),
      where('toDateTime', '>', Timestamp.fromDate(reservation.fromDateTime))
    );

    const snapshot = await getDocs(q);

    if (snapshot.empty) {
      return [];
    }

    return snapshot.docs.map(doc => {
      const data = doc.data();
      return {
        id: doc.id,
        roomId: data['roomId'],
        eventName: data['eventName'],
        isPrivate: data['isPrivate'],
        fromDateTime: data['fromDateTime'].toDate(),
        toDateTime: data['toDateTime'].toDate(),
        userId: data['userId']
      } as Reservation;
    });
  }

  updateReservationPrivacy(reservationId: string, isPrivate: boolean): Promise<void> {
    const docRef = doc(this.firestore, this.roomReservationCollectionName, reservationId);
    return updateDoc(docRef, { isPrivate });
  }

// If you want a more comprehensive update method:
  updateReservation(reservationId: string, updates: Partial<Reservation>): Promise<void> {
    const docRef = doc(this.firestore, this.roomReservationCollectionName, reservationId);

    // Convert Date objects to Timestamps if they exist in updates
    const processedUpdates: any = { ...updates };
    if (updates.fromDateTime instanceof Date) {
      processedUpdates.fromDateTime = Timestamp.fromDate(updates.fromDateTime);
    }
    if (updates.toDateTime instanceof Date) {
      processedUpdates.toDateTime = Timestamp.fromDate(updates.toDateTime);
    }

    return updateDoc(docRef, processedUpdates);
  }


  deleteReservation(id: string): Promise<void> {
    const docRef = doc(this.firestore, this.roomReservationCollectionName, id);
    return deleteDoc(docRef);
  }
}
