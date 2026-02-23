import { Injectable, signal, computed, OnDestroy } from '@angular/core';
import {
  Firestore,
  collection,
  doc,
  getDoc,
  addDoc,
  updateDoc,
  deleteDoc,
  Timestamp,
  onSnapshot
} from '@angular/fire/firestore';

export interface Item {
  id: string;
  name: string;
  category: string;
  description?: string;
  tags?: string[];
  photoUrl?: string;
  isBorrowed: boolean;
  borrowedByUserId?: string;
  borrowedAt?: Date;
  createdBy: string;
  createdAt: Date;
}

@Injectable({
  providedIn: 'root'
})
export class ItemService implements OnDestroy {
  public readonly predefinedCategories = [
    'Werkzeug',
    'Elektronik',
    'Garten',
    'Küche',
    'Haushalt',
    'Sport',
    'Kinder',
    'Sonstiges'
  ];

  private readonly collectionName = 'household-common';
  public items = signal<Item[]>([]);

  // All available categories
  public categories = computed(() => {
    const allCategories = this.items().map(i => i.category);
    return [...new Set(allCategories)].sort();
  });

  // User names cache
  private userNamesCache = new Map<string, string>();
  private loadingUserIds = new Set<string>();
  private loadingPromises = new Map<string, Promise<string>>();

  // Unsubscribe function
  private unsubscribe?: () => void;

  constructor(private firestore: Firestore) {
    this.loadItems();
  }

  /**
   * Load items from Firebase with real-time updates
   */
  private loadItems(): void {
    const itemsRef = collection(this.firestore, this.collectionName);

    this.unsubscribe = onSnapshot(itemsRef, (snapshot) => {
      const items: Item[] = [];

      snapshot.docs.forEach(docSnap => {
        const data = docSnap.data();
        items.push({
          id: docSnap.id,
          name: data['name'] || '',
          category: data['category'] || '',
          description: data['description'],
          tags: data['tags'],
          photoUrl: data['photoUrl'],
          isBorrowed: data['isBorrowed'] || false,
          borrowedByUserId: data['borrowedByUserId'],
          borrowedAt: data['borrowedAt']?.toDate(),
          createdBy: data['createdBy'] || '',
          createdAt: data['createdAt']?.toDate() || new Date()
        });
      });

      this.items.set(items);
      console.log('Items loaded:', items.length);
    }, (error) => {
      console.error('Error loading items:', error);
    });
  }

  /**
   * Load user name lazily from Firebase with race condition protection
   */
  public async getUserName(userId: string): Promise<string> {
    // Check cache
    if (this.userNamesCache.has(userId)) {
      return this.userNamesCache.get(userId)!;
    }

    // Check if already loading
    if (this.loadingPromises.has(userId)) {
      return this.loadingPromises.get(userId)!;
    }

    // Start loading
    const loadPromise = this.loadUserNameFromFirestore(userId);
    this.loadingPromises.set(userId, loadPromise);

    try {
      const name = await loadPromise;
      return name;
    } finally {
      this.loadingPromises.delete(userId);
    }
  }

  private async loadUserNameFromFirestore(userId: string): Promise<string> {
    try {
      const userDocRef = doc(this.firestore, 'users', userId);
      const userDoc = await getDoc(userDocRef);

      if (userDoc.exists()) {
        const name = userDoc.data()['displayName'] || 'Unknown';
        this.userNamesCache.set(userId, name);
        return name;
      }
    } catch (error) {
      console.error('Error loading user name:', error);
    }

    const fallback = 'Unknown';
    this.userNamesCache.set(userId, fallback);
    return fallback;
  }

  /**
   * Add new item
   */
  public async addItem(item: Omit<Item, 'id'>): Promise<void> {
    const itemsRef = collection(this.firestore, this.collectionName);

    const data: any = {
      name: item.name,
      category: item.category,
      isBorrowed: item.isBorrowed,
      createdBy: item.createdBy,
      createdAt: Timestamp.now()
    };

    // Optional fields
    if (item.description) data.description = item.description;
    if (item.tags) data.tags = item.tags;
    if (item.photoUrl) data.photoUrl = item.photoUrl;
    if (item.borrowedByUserId) data.borrowedByUserId = item.borrowedByUserId;
    if (item.borrowedAt) data.borrowedAt = Timestamp.fromDate(item.borrowedAt);

    await addDoc(itemsRef, data);
  }

  /**
   * Update item with proper Timestamp conversion
   */
  public async updateItem(id: string, data: Partial<Item>): Promise<void> {
    const itemRef = doc(this.firestore, this.collectionName, id);

    const firestoreData: any = { ...data };

    // Convert Date to Timestamp
    if (data.borrowedAt instanceof Date) {
      firestoreData.borrowedAt = Timestamp.fromDate(data.borrowedAt);
    }

    // Remove old user from cache if borrower changed
    if (data.borrowedByUserId !== undefined) {
      const oldItem = this.items().find(i => i.id === id);
      if (oldItem?.borrowedByUserId && oldItem.borrowedByUserId !== data.borrowedByUserId) {
        this.userNamesCache.delete(oldItem.borrowedByUserId);
      }
    }

    await updateDoc(itemRef, firestoreData);
  }

  /**
   * Return item (clear borrow status)
   */
  public async returnItem(id: string): Promise<void> {
    const itemRef = doc(this.firestore, this.collectionName, id);

    // Remove borrower from cache
    const item = this.items().find(i => i.id === id);
    if (item?.borrowedByUserId) {
      this.userNamesCache.delete(item.borrowedByUserId);
    }

    await updateDoc(itemRef, {
      isBorrowed: false,
      borrowedByUserId: null,
      borrowedAt: null
    });
  }

  /**
   * Delete item
   */
  public async deleteItem(id: string): Promise<void> {
    const itemRef = doc(this.firestore, this.collectionName, id);
    await deleteDoc(itemRef);
  }

  ngOnDestroy(): void {
    if (this.unsubscribe) {
      this.unsubscribe();
    }
  }
}
