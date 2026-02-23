import { Injectable, inject } from "@angular/core";
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
  Timestamp,
  DocumentData,
  QuerySnapshot
} from '@angular/fire/firestore';
import { map, lastValueFrom } from "rxjs";
import { Observable } from "rxjs";

export interface CoworkingTableReservation {
  type: 'coworkingTable';
  id?: string;
  tableId: string;
  startTime: Date;
  endTime: Date;
  user: string;
  comment?: string;
}

interface CoworkingTableReservationTimestamp {
  tableId: string;
  startTime: Timestamp;
  endTime: Timestamp;
  user: string;
}

@Injectable({
  providedIn: 'root'
})
export class CoworkingTableReservationService {
  private firestore = inject(Firestore);

  public getReservations(): Observable<any[]> {
    const reservationsRef = collection(this.firestore, 'coworkingTableReservations');
    return collectionData(reservationsRef, { idField: 'id' });
  }

  public getReservationForCurrentDay(currentDay: Date): Observable<CoworkingTableReservation[]> {
    currentDay.setHours(0, 0, 0, 0);
    const nextDay = new Date(currentDay.getTime() + 24 * 60 * 60 * 1000);

    const reservationsRef = collection(this.firestore, 'coworkingTableReservations');
    const q = query(
      reservationsRef,
      where('startTime', '>=', Timestamp.fromDate(currentDay)),
      where('startTime', '<', Timestamp.fromDate(nextDay))
    );

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
        } as CoworkingTableReservation;
      }))
    );
  }

  public getReservationsByUser(userId: string): Observable<CoworkingTableReservation[]> {
    const reservationsRef = collection(this.firestore, 'coworkingTableReservations');
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
        } as CoworkingTableReservation;
      }))
    );
  }

  async createReservation(reservation: CoworkingTableReservation) {
    // Check first if there is an overlapping reservation
    const reservationsRef = collection(this.firestore, 'coworkingTableReservations');
    const q = query(
      reservationsRef,
      where('tableId', '==', reservation.tableId),
      where('startTime', '<', reservation.endTime),
      where('endTime', '>', reservation.startTime)
    );

    const querySnapshot = await getDocs(q);

    if (!querySnapshot.empty) {
      alert('Im gleichen Zeitraum gibt es bereits eine Reservierung.');
      throw new Error('There is an overlapping reservation');
    }

    // Minutes and seconds are set to 0
    reservation.startTime.setMinutes(0);
    reservation.startTime.setSeconds(0);
    reservation.endTime.setMinutes(0);
    reservation.endTime.setSeconds(0);

    return addDoc(reservationsRef, {
      ...reservation,
      // Convert Date to Firestore timestamp
      startTime: Timestamp.fromDate(reservation.startTime),
      endTime: Timestamp.fromDate(reservation.endTime)
    });
  }

  public deleteReservation(id: string) {
    const docRef = doc(this.firestore, 'coworkingTableReservations', id);
    return deleteDoc(docRef);
  }
}
