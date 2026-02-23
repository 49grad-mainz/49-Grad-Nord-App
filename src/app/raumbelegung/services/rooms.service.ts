import { Injectable, inject } from '@angular/core';
import {
  Firestore,
  collection,
  collectionData
} from '@angular/fire/firestore';
import { Observable } from 'rxjs';

export interface Room {
  id: string;
  name: string;
  capacity: number;
  location: string;
  description: string;
  features: string[];
  image: string;
  orderNo: number;
}

@Injectable({
  providedIn: 'root'
})
export class RoomsService {
  private firestore = inject(Firestore);

  public getRooms$(): Observable<Room[]> {
    const roomsCollection = collection(this.firestore, 'rooms');
    return collectionData(roomsCollection, { idField: 'id' }) as Observable<Room[]>;
  }
}
