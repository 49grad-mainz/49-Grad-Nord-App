import { Injectable, inject } from '@angular/core';
import {
  Firestore, collection, addDoc, query, where, Timestamp,
  collectionData, deleteDoc, doc, getDocs
} from '@angular/fire/firestore';
import { Observable, from } from 'rxjs';
import { map } from 'rxjs/operators';

export interface MobilityReservation {
  id?: string;
  resourceId: string;
  userId: string;
  startTime: Date;
  endTime: Date;
  comment?: string;
  createdAt?: Date;
}

@Injectable({
  providedIn: 'root'
})
export class MobilityReservationService {
  private firestore = inject(Firestore);
  private collectionName = 'mobilityReservations';

  constructor() { }

  /**
   * Get reservations for a specific resource for a given day (or range).
   * Here we fetch slightly more to be safe, e.g. "active from now".
   */
  public getReservations(resourceId: string): Observable<MobilityReservation[]> {
    // Simple query: all reservations for this resource
    // In production, you would limit by date range (e.g. "start > today - 1 day")
    const reservationsRef = collection(this.firestore, this.collectionName);
    const q = query(reservationsRef, where('resourceId', '==', resourceId));

    return collectionData(q, { idField: 'id' }).pipe(
      map(data => data.map(item => this.mapToReservation(item)))
    );
  }

  public getReservationsForDay(resourceId: string, date: Date): Observable<MobilityReservation[]> {
    const startOfDay = new Date(date);
    startOfDay.setHours(0, 0, 0, 0);
    const endOfDay = new Date(date);
    endOfDay.setHours(23, 59, 59, 999);

    const reservationsRef = collection(this.firestore, this.collectionName);
    const q = query(
      reservationsRef,
      where('resourceId', '==', resourceId),
      where('startTime', '<=', Timestamp.fromDate(endOfDay)),
      where('endTime', '>=', Timestamp.fromDate(startOfDay))
    );

    return collectionData(q, { idField: 'id' }).pipe(
      map(data => data.map(item => this.mapToReservation(item)))
    );
  }

  public async createReservation(reservation: MobilityReservation): Promise<void> {
    // Check for conflicts
    const conflict = await this.checkConflict(reservation);
    if (conflict) {
      throw new Error('Zeitraum ist bereits belegt.');
    }

    const reservationsRef = collection(this.firestore, this.collectionName);
    await addDoc(reservationsRef, {
      resourceId: reservation.resourceId,
      userId: reservation.userId,
      startTime: Timestamp.fromDate(reservation.startTime),
      endTime: Timestamp.fromDate(reservation.endTime),
      comment: reservation.comment || '',
      createdAt: serverTimestamp()
    });
  }

  public async deleteReservation(id: string): Promise<void> {
    const docRef = doc(this.firestore, this.collectionName, id);
    await deleteDoc(docRef);
  }

  public async updateReservation(reservation: MobilityReservation): Promise<void> {
    if (!reservation.id) throw new Error('Update requires reservation ID');

    // Check for conflicts (excluding itself)
    const conflict = await this.checkConflict(reservation, reservation.id);
    if (conflict) {
      throw new Error('Zeitraum ist bereits belegt.');
    }

    const docRef = doc(this.firestore, this.collectionName, reservation.id);
    await updateDoc(docRef, {
      startTime: Timestamp.fromDate(reservation.startTime),
      endTime: Timestamp.fromDate(reservation.endTime),
      comment: reservation.comment || ''
    });
  }

  private async checkConflict(reservation: MobilityReservation, excludeId?: string): Promise<boolean> {
    const reservationsRef = collection(this.firestore, this.collectionName);
    // Overlap logic: StartA < EndB && EndA > StartB
    const q = query(
      reservationsRef,
      where('resourceId', '==', reservation.resourceId),
      where('startTime', '<', Timestamp.fromDate(reservation.endTime)),
      where('endTime', '>', Timestamp.fromDate(reservation.startTime))
    );

    const snapshot = await getDocs(q);

    // Filter out the excluded ID if provided (client-side filtering as simple query exclusion is hard)
    if (excludeId) {
      return snapshot.docs.some(d => d.id !== excludeId);
    }

    return !snapshot.empty;
  }

  private mapToReservation(data: any): MobilityReservation {
    return {
      id: data.id,
      resourceId: data.resourceId,
      userId: data.userId,
      startTime: (data.startTime as Timestamp).toDate(),
      endTime: (data.endTime as Timestamp).toDate(),
      comment: data.comment,
      createdAt: data.createdAt ? (data.createdAt as Timestamp).toDate() : undefined
    };
  }
  public async returnBikeNow(id: string): Promise<void> {
    const docRef = doc(this.firestore, this.collectionName, id);
    await updateDoc(docRef, {
      endTime: serverTimestamp() // Set end time to now
    });
  }
}

import { serverTimestamp, updateDoc } from '@angular/fire/firestore';
