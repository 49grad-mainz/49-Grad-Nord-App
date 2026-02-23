import { Injectable } from '@angular/core';
import { AngularFirestore, AngularFirestoreCollection } from "@angular/fire/compat/firestore";
import { Observable } from "rxjs";
export interface WashingMachine {
  id: string;
  name: string;
  description: string;
  capacity: number;
  isAvailable: boolean;
  status: string;
  orderNo: number;
  // Add more properties as needed
}

@Injectable({
  providedIn: 'root'
})
export class WashingMachineService {
  private washingMachineCollection: AngularFirestoreCollection<WashingMachine>;

  constructor(private firestore: AngularFirestore) {
    this.washingMachineCollection = this.firestore.collection<WashingMachine>('washingMachines');
  }

  public getWashingMachines(): Observable<WashingMachine[]> {
    return this.washingMachineCollection.valueChanges({idField: 'id'});
  }

  public createWashingMachine(washingMachine: WashingMachine): Promise<any> {
    return this.washingMachineCollection.add(washingMachine);
  }

  public updateWashingMachine(id: string, washingMachine: WashingMachine): Promise<void> {
    return this.washingMachineCollection.doc(id).update(washingMachine);
  }

  public deleteWashingMachine(id: string): Promise<void> {
    return this.washingMachineCollection.doc(id).delete();
  }

  public getWashingMachineById(machineId: string) {
    return this.washingMachineCollection.doc(machineId).valueChanges();
  }
}

