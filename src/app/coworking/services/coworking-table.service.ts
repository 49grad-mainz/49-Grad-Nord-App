import { Injectable, inject } from "@angular/core";
import {
  Firestore,
  collection,
  collectionData,
  doc,
  docData
} from '@angular/fire/firestore';
import { Observable } from "rxjs";

export interface CoworkingTable {
  id: string;
  name: string;
  description: string;
  capacity: number;
  isAvailable: boolean;
  status: string;
  location: 'coworking1' | 'atelier';
  orderNo: number;
}

@Injectable({
  providedIn: 'root'
})
export class CoworkingTableService {
  private firestore = inject(Firestore);
  private readonly collectionName = 'coworkingTables';

  public getCoworkingTables(): Observable<CoworkingTable[]> {
    const tablesCollection = collection(this.firestore, this.collectionName);
    return collectionData(tablesCollection, { idField: 'id' }) as Observable<CoworkingTable[]>;
  }

  public getCoworkingTableById(tableId: string): Observable<CoworkingTable | undefined> {
    const tableDocRef = doc(this.firestore, this.collectionName, tableId);
    return docData(tableDocRef, { idField: 'id' }) as Observable<CoworkingTable | undefined>;
  }
}
