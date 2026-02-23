import { Injectable, inject } from '@angular/core';
import {
  Auth, authState, user, getIdTokenResult
} from '@angular/fire/auth';
import {
  Firestore, collection, doc, getDoc, updateDoc, getDocs,
  query, where, documentId, collectionData, docData
} from '@angular/fire/firestore';
import { Router } from '@angular/router';
import { BehaviorSubject, Observable, of, switchMap, map, filter } from 'rxjs';
import { SnackbarService } from './snackbar.service';

export interface UserInterface {
  email: string | null;
  uid: string;
  displayName: string;
  showEvents?: boolean;
}

export interface UserRoles {
  isAdmin: boolean;
  isConfirmed: boolean;
}

@Injectable({
  providedIn: 'root'
})
export class UserService {
  private auth = inject(Auth);
  private firestore = inject(Firestore);
  private snackbarService = inject(SnackbarService);
  private router = inject(Router);

  isLoggedIn$: Observable<boolean>;
  isLoggedOut$: Observable<boolean>;
  pictureUrl$: Observable<string | null>;
  userName$: Observable<string | null | undefined>;
  userId$: Observable<string | undefined>;
  userEmail$: Observable<string | null | undefined>;
  userRoles$: Observable<UserRoles>;
  isAdmin$: Observable<boolean>;
  isConfirmed$: Observable<boolean>;
  allUsersAsBehaviorSubject$: Observable<UserInterface[]>;

  // BehaviorSubject to hold the display name
  private userDisplayNameSubject = new BehaviorSubject<string | null>(null);
  userDisplayNameFromFirestore$ = this.userDisplayNameSubject.asObservable();

  // private showEventsSubject = new BehaviorSubject<boolean>(false);
  // showEvents$ = this.showEventsSubject.asObservable();

  private enableReservationScrollSubject = new BehaviorSubject<boolean>(false);
  enableReservationScroll$ = this.enableReservationScrollSubject.asObservable();

  constructor() {
    // Auth state observables
    const authState$ = authState(this.auth);

    this.isLoggedIn$ = authState$.pipe(map(user => !!user));
    this.isLoggedOut$ = this.isLoggedIn$.pipe(map(loggedIn => !loggedIn));
    this.pictureUrl$ = authState$.pipe(map(user => user ? user.photoURL : null));
    this.userName$ = authState$.pipe(map(user => user?.displayName));
    this.userId$ = authState$.pipe(map(user => user?.uid));
    this.userEmail$ = authState$.pipe(map(user => user?.email));

    // Get user roles from token
    this.userRoles$ = user(this.auth).pipe(
      switchMap(user => {
        if (!user) return of({ isAdmin: false, isConfirmed: false });
        return user.getIdTokenResult().then(token => {
          return <UserRoles><unknown>token.claims ?? {
            isAdmin: false,
            isConfirmed: false
          };
        });
      })
    );

    this.isAdmin$ = this.userRoles$.pipe(map(roles => roles.isAdmin));
    this.isConfirmed$ = this.userRoles$.pipe(map(roles => roles.isConfirmed));

    // Subscribe to userId$ to update the display name in BehaviorSubject
    this.userId$.pipe(
      switchMap(id => {
        if (!id) return of(null);
        const userDocRef = doc(this.firestore, 'users', id);
        return docData(userDocRef);
      })
    ).subscribe((user: any) => {
      this.userDisplayNameSubject.next(user?.displayName || null);
      // this.showEventsSubject.next(user?.showEvents !== false);
      this.enableReservationScrollSubject.next(user?.enableReservationScroll === true);
    });

    // Get all users
    const usersRef = collection(this.firestore, 'users');
    this.allUsersAsBehaviorSubject$ = collectionData(usersRef, { idField: 'uid' }).pipe(
      map((users: any) => users.map((user: any) => ({
        uid: user.uid,
        displayName: user.displayName
      })))
    );
  }

  // Method to update the showEvents flag in Firestore
  // updateShowEventsFlag(userId: string, showEvents: boolean): Promise<void> {
  //   const userDocRef = doc(this.firestore, 'users', userId);
  //   return updateDoc(userDocRef, { showEvents })
  //     .then(() => {
  //       this.showEventsSubject.next(showEvents);
  //     });
  // }

  updateReservationScrollFlag(userId: string, enableReservationScroll: boolean): Promise<void> {
    const userDocRef = doc(this.firestore, 'users', userId);
    return updateDoc(userDocRef, { enableReservationScroll })
      .then(() => {
        this.enableReservationScrollSubject.next(enableReservationScroll);
      });
  }

  getUser(userId: string): Observable<UserInterface | undefined> {
    const userDocRef = doc(this.firestore, 'users', userId);
    return docData(userDocRef).pipe(
      filter(user => !!user)
    ) as Observable<UserInterface | undefined>;
  }

  updateDisplayName(newName: string, userId: string): Promise<void> {
    const userDocRef = doc(this.firestore, 'users', userId);
    return updateDoc(userDocRef, { displayName: newName })
      .then(() => {
        this.userDisplayNameSubject.next(newName);
      });
  }

  public getUsers(userIds: string[]): Observable<UserInterface[]> {
    if (userIds.length === 0) {
      return of([]);
    }

    return new Observable<UserInterface[]>(observer => {
      const usersRef = collection(this.firestore, 'users');
      const q = query(usersRef, where(documentId(), 'in', userIds));

      getDocs(q).then(snapshot => {
        const users: UserInterface[] = [];
        snapshot.forEach(doc => {
          users.push({ ...doc.data() as UserInterface, uid: doc.id });
        });
        observer.next(users);
        observer.complete();
      }).catch(error => {
        observer.error(error);
      });
    });
  }
}
