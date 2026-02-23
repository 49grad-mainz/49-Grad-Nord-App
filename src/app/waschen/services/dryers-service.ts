import { Injectable } from '@angular/core';
import { AngularFirestore, AngularFirestoreCollection } from "@angular/fire/compat/firestore";
import { Observable } from "rxjs";

export interface Dryer {
  id: string;
  name: string;
  description: string;
  capacity: number;
  isAvailable: boolean;
  status: string;
  orderNo: number;
  // Add more properties specific to dryers as needed
}

@Injectable({
  providedIn: 'root'
})
export class DryerService {
  private dryerCollection: AngularFirestoreCollection<Dryer>;

  constructor(private firestore: AngularFirestore) {
    this.dryerCollection = this.firestore.collection<Dryer>('dryers'); // Assuming 'dryers' is the name of your collection
  }

  getDryers(): Observable<Dryer[]> {
    return this.dryerCollection.valueChanges({idField: 'id'});
  }

  createDryer(dryer: Dryer): Promise<any> {
    return this.dryerCollection.add(dryer);
  }

  updateDryer(id: string, dryer: Dryer): Promise<void> {
    return this.dryerCollection.doc(id).update(dryer);
  }

  deleteDryer(id: string): Promise<void> {
    return this.dryerCollection.doc(id).delete();
  }

  getDryerById(dryerId: string) {
    return this.dryerCollection.doc(dryerId).valueChanges();
  }
}
