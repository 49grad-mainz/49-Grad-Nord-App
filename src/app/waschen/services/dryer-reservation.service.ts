import { Injectable, inject } from '@angular/core';
import {
  Firestore,
  collection,
  collectionData,
  doc,
  getDocs,
  addDoc,
  updateDoc,
  deleteDoc,
  query,
  where,
  Timestamp
} from '@angular/fire/firestore';
import { map, lastValueFrom } from "rxjs";
import { Observable } from 'rxjs';
import {
  DryerReservation
} from "../waschen-index/waschen-overview/washing-calendar-tab-content/washing-calendar-tab-content.component";

// Updated interface for timestamp conversion
interface DryerReservationTimestamp {
  machineId: string;
  startTime: Timestamp;
  endTime: Timestamp;
  user: string;
}

@Injectable({
  providedIn: 'root'
})
export class DryerReservationService {
  private firestore = inject(Firestore);

  public getReservations(): Observable<DryerReservation[]> {
    const reservationsRef = collection(this.firestore, 'dryerReservations');
    return collectionData(reservationsRef, { idField: 'id' }).pipe(
      map(reservations => reservations.map(data => {
        const reservation = data as any;
        // Convert timestamp to Date
        const startTime = reservation.startTime.toDate();
        const endTime = reservation.endTime.toDate();
        return {
          id: reservation.id,
          ...reservation,
          startTime,
          endTime
        } as DryerReservation;
      }))
    );
  }

  getReservationsByUser(userId: string): Observable<DryerReservation[]> {
    const reservationsRef = collection(this.firestore, 'dryerReservations');
    const q = query(reservationsRef, where('user', '==', userId));

    return collectionData(q, { idField: 'id' }).pipe(
      map(reservations => reservations.map(data => {
        const reservation = data as any;
        // Convert timestamp to Date
        const startTime = reservation.startTime.toDate();
        const endTime = reservation.endTime.toDate();
        return {
          id: reservation.id,
          ...reservation,
          startTime,
          endTime
        } as DryerReservation;
      }))
    );
  }

  async createReservation(reservation: DryerReservation) {
    // check first if there is an overlapping reservation
    const reservationsRef = collection(this.firestore, 'dryerReservations');
    const q = query(
      reservationsRef,
      where('machineId', '==', reservation.machineId),
      where('startTime', '<', reservation.endTime),
      where('endTime', '>', reservation.startTime)
    );

    const querySnapshot = await getDocs(q);

    if (!querySnapshot.empty) {
      alert('Im gleichen Zeitraum gibt es bereits eine Reservierung.');
      throw new Error('There is an overlapping reservation');
    }

    // minutes and seconds are set to 0
    reservation.startTime.setMinutes(0);
    reservation.startTime.setSeconds(0);
    reservation.endTime.setMinutes(0);
    reservation.endTime.setSeconds(0);

    // Convert Date objects to Timestamp before adding to Firestore
    const reservationToAdd = {
      ...reservation,
      startTime: Timestamp.fromDate(reservation.startTime),
      endTime: Timestamp.fromDate(reservation.endTime)
    };

    return addDoc(reservationsRef, reservationToAdd);
  }

  async updateReservation(id: string, reservation: DryerReservation) {
    // Check for overlapping reservations (excluding the current one)
    const reservationsRef = collection(this.firestore, 'dryerReservations');
    const q = query(
      reservationsRef,
      where('machineId', '==', reservation.machineId),
      where('startTime', '<', reservation.endTime),
      where('endTime', '>', reservation.startTime)
    );

    const querySnapshot = await getDocs(q);

    // Filter out the current reservation being updated
    const overlappingReservations = querySnapshot.docs.filter(doc => doc.id !== id);

    if (overlappingReservations.length > 0) {
      alert('Im gleichen Zeitraum gibt es bereits eine Reservierung.');
      throw new Error('There is an overlapping reservation');
    }

    // Minutes and seconds are set to 0
    reservation.startTime.setMinutes(0);
    reservation.startTime.setSeconds(0);
    reservation.endTime.setMinutes(0);
    reservation.endTime.setSeconds(0);

    // Convert Date objects to Timestamp before updating in Firestore
    const reservationToUpdate = {
      ...reservation,
      startTime: Timestamp.fromDate(reservation.startTime),
      endTime: Timestamp.fromDate(reservation.endTime)
    };

    const docRef = doc(this.firestore, 'dryerReservations', id);
    return updateDoc(docRef, reservationToUpdate);
  }

  deleteReservation(id: string) {
    const docRef = doc(this.firestore, 'dryerReservations', id);
    return deleteDoc(docRef);
  }

  public findMyUnpaidReservationsAndMarkThemAsPaid(userId: string) {
    const reservationsRef = collection(this.firestore, 'dryerReservations');
    const q = query(
      reservationsRef,
      where('user', '==', userId),
      where('paid', '==', false)
    );

    return collectionData(q, { idField: 'id' }).pipe(
      map(reservations => reservations.map(reservation => {
        const docRef = doc(this.firestore, 'dryerReservations', reservation.id as string);
        updateDoc(docRef, { paid: true });
      }))
    );
  }

  public getReservationsForCurrentDay(selectedDate: Date): Observable<DryerReservation[]> {
    // Set selected date to start of day
    const currentDayStart = new Date(selectedDate);
    currentDayStart.setHours(0, 0, 0, 0);

    // End of current day
    const currentDayEnd = new Date(currentDayStart.getTime() + 24 * 60 * 60 * 1000);

    // Yesterday at 21:00
    const yesterdayEvening = new Date(currentDayStart);
    yesterdayEvening.setDate(yesterdayEvening.getDate() - 1);
    yesterdayEvening.setHours(21, 0, 0, 0);

    const reservationsRef = collection(this.firestore, 'dryerReservations');

    // Query for reservations that either:
    // 1. Start today (original logic)
    // 2. Start yesterday from 21:00 onwards and might extend into today
    const q = query(
      reservationsRef,
      where('startTime', '>=', Timestamp.fromDate(yesterdayEvening)),
      where('startTime', '<', Timestamp.fromDate(currentDayEnd))
    );

    return collectionData(q, { idField: 'id' }).pipe(
      map(reservations => reservations.map(data => {
        const reservation = data as any;
        // Convert timestamp to Date
        const startTime = reservation.startTime.toDate();
        const endTime = reservation.endTime.toDate();
        const userId = reservation.user;
        return {
          id: reservation.id,
          ...reservation,
          startTime,
          endTime,
          userId
        } as DryerReservation;
      }))
    );
  }
}
