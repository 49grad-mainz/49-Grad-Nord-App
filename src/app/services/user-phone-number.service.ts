import { Injectable, inject } from '@angular/core';
import {
    Firestore, collection, doc, docData, setDoc, deleteDoc, getDoc
} from '@angular/fire/firestore';
import { Observable, map, from } from 'rxjs';

@Injectable({
    providedIn: 'root'
})
export class UserPhoneNumberService {
    private firestore = inject(Firestore);
    private readonly collectionName = 'user-phone-numbers';

    getPhoneNumber(userId: string): Observable<string | null> {
        const docRef = doc(this.firestore, this.collectionName, userId);
        return docData(docRef).pipe(
            map((data: any) => data?.phoneNumber || null)
        );
    }

    async savePhoneNumber(userId: string, phoneNumber: string): Promise<void> {
        const docRef = doc(this.firestore, this.collectionName, userId);
        return setDoc(docRef, { phoneNumber }, { merge: true });
    }

    async deletePhoneNumber(userId: string): Promise<void> {
        const docRef = doc(this.firestore, this.collectionName, userId);
        return deleteDoc(docRef);
    }

    async userHasPhoneNumber(userId: string): Promise<boolean> {
        const docRef = doc(this.firestore, this.collectionName, userId);
        const snapshot = await getDoc(docRef);
        return snapshot.exists() && !!snapshot.data()['phoneNumber'];
    }
}
