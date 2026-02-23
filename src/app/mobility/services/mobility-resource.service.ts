import { Injectable, inject } from '@angular/core';
import { Firestore, collection, collectionData, doc, getDoc } from '@angular/fire/firestore';
import { Observable, of } from 'rxjs';
import { map } from 'rxjs/operators';

export interface MobilityResource {
  id: string;
  name: string;
  type: 'cargo-bike' | 'car' | 'other';
  icon: string;
  isAvailable: boolean;
}

@Injectable({
  providedIn: 'root'
})
export class MobilityResourceService {
  private firestore = inject(Firestore);
  private collectionName = 'mobilityResources';

  constructor() { }

  /**
   * Get all mobility resources.
   * For the MVP, if no resources exist in Firestore, we returns a default "Lastenrad".
   */
  public getResources(): Observable<MobilityResource[]> {
    const resourcesRef = collection(this.firestore, this.collectionName);
    return collectionData(resourcesRef, { idField: 'id' }).pipe(
      map(resources => {
        if (resources.length === 0) {
          // Fallback / Initial State for MVP
          return [
            {
              id: 'cargo-bike-01',
              name: 'Lastenrad',
              type: 'cargo-bike',
              icon: 'pedal_bike',
              isAvailable: true
            } as MobilityResource
          ];
        }
        return resources as MobilityResource[];
      })
    );
  }

  public getResource(id: string): Observable<MobilityResource | undefined> {
    // For MVP fallback logic
    if (id === 'cargo-bike-01') {
      return this.getResources().pipe(map(list => {
        // Try exact match
        const exact = list.find(r => r.id === id);
        if (exact) return exact;

        // Try fallback: find ANY cargo bike roughly matching "Lastenrad" or just the first one
        // This handles cases where user created "cargo-bike-1" manually
        const looseMatch = list.find(r => r.type === 'cargo-bike');
        return looseMatch;
      }));
    }

    const docRef = doc(this.firestore, this.collectionName, id);
    return from(getDoc(docRef)).pipe(
      map(snapshot => snapshot.data() as MobilityResource)
    );
  }
}
import { from } from 'rxjs';
