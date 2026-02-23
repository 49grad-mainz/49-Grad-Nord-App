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
import {
  WashingMachineReservation
} from "../waschen-index/waschen-overview/washing-calendar-tab-content/washing-calendar-tab-content.component";
import { map, lastValueFrom } from "rxjs";
import { Observable } from 'rxjs';

interface WashingMachineReservationTimestamp {
  machineId: string;
  startTime: Timestamp;
  endTime: Timestamp;
  user: string;
  paid: boolean;
}

@Injectable({
  providedIn: 'root'
})
export class WashingMachineReservationService {
  private firestore = inject(Firestore);

  getReservations(): Observable<WashingMachineReservation[]> {
    const reservationsRef = collection(this.firestore, 'washingMachineReservations');
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
        } as WashingMachineReservation;
      }))
    );
  }

  getReservationsByUser(userId: string): Observable<WashingMachineReservation[]> {
    const reservationsRef = collection(this.firestore, 'washingMachineReservations');
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
        } as WashingMachineReservation;
      }))
    );
  }

  async createReservation(reservation: WashingMachineReservation) {
    // check first if there is an overlapping reservation
    const reservationsRef = collection(this.firestore, 'washingMachineReservations');
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

    return await addDoc(reservationsRef, {
      ...reservation,
      // Convert Date to Firestore timestamp
      startTime: Timestamp.fromDate(reservation.startTime),
      endTime: Timestamp.fromDate(reservation.endTime),
      paid: false
    });
  }

  deleteReservation(id: string) {
    const docRef = doc(this.firestore, 'washingMachineReservations', id);
    return deleteDoc(docRef);
  }

  public findMyUnpaidReservationsAndMarkThemAsPaid(userId: string) {
    const reservationsRef = collection(this.firestore, 'washingMachineReservations');
    const q = query(
      reservationsRef,
      where('user', '==', userId),
      where('paid', '==', false)
    );

    return collectionData(q, { idField: 'id' }).pipe(
      map(reservations => reservations.map(reservation => {
        const docRef = doc(this.firestore, 'washingMachineReservations', reservation.id as string);
        updateDoc(docRef, { paid: true });
      }))
    );
  }

  getWashingMachineReservationsForCurrentDay(selectedDate: Date): Observable<WashingMachineReservation[]> {
    // Set selected date to start of day
    const currentDayStart = new Date(selectedDate);
    currentDayStart.setHours(0, 0, 0, 0);

    // End of current day
    const currentDayEnd = new Date(currentDayStart.getTime() + 24 * 60 * 60 * 1000);

    // Yesterday at 21:00
    const yesterdayEvening = new Date(currentDayStart);
    yesterdayEvening.setDate(yesterdayEvening.getDate() - 1);
    yesterdayEvening.setHours(21, 0, 0, 0);

    const reservationsRef = collection(this.firestore, 'washingMachineReservations');

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
        } as WashingMachineReservation;
      }))
    );
  }

  async updateReservation(reservationId: string, updatedReservation: WashingMachineReservation) {
    // Check for overlapping reservations (excluding the current reservation being updated)
    const reservationsRef = collection(this.firestore, 'washingMachineReservations');
    const q = query(
      reservationsRef,
      where('machineId', '==', updatedReservation.machineId),
      where('startTime', '<', updatedReservation.endTime),
      where('endTime', '>', updatedReservation.startTime)
    );

    const querySnapshot = await getDocs(q);

    // Filter out the current reservation being updated
    const overlappingReservations = querySnapshot.docs.filter(doc => doc.id !== reservationId);

    if (overlappingReservations.length > 0) {
      alert('Im gleichen Zeitraum gibt es bereits eine Reservierung.');
      throw new Error('There is an overlapping reservation');
    }

    // Set minutes and seconds to 0
    updatedReservation.startTime.setMinutes(0);
    updatedReservation.startTime.setSeconds(0);
    updatedReservation.endTime.setMinutes(0);
    updatedReservation.endTime.setSeconds(0);

    const docRef = doc(this.firestore, 'washingMachineReservations', reservationId);
    return await updateDoc(docRef, {
      ...updatedReservation,
      // Convert Date to Firestore timestamp
      startTime: Timestamp.fromDate(updatedReservation.startTime),
      endTime: Timestamp.fromDate(updatedReservation.endTime)
    });
  }

}
