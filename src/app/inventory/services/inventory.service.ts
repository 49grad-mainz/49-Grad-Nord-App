import { Injectable, inject } from '@angular/core';
import { Observable, of } from 'rxjs';
import { map, shareReplay } from 'rxjs/operators';
import {
  Firestore,
  collection,
  doc,
  getDocs,
  addDoc,
  updateDoc,
  deleteDoc,
  query,
  where,
  Timestamp,
  DocumentReference,
  collectionData,
  getDoc,
  docData,
  orderBy,
  limit
} from '@angular/fire/firestore';

export interface Beamer {
  id?: string;
  name: string;
  model: string;
  description: string;
  image: string;
  category: string;
  serialNumber?: string;
  purchaseDate?: Date;
  condition: 'excellent' | 'good' | 'fair' | 'needs-repair';
  location: string;
  available: boolean;
  orderNo: number;
  inUseNowInCommonRoom: false;
  showing: '';
}

export interface InventoryItem {
  id?: string;
  name: string;
  model: string;
  description: string;
  image: string;
  category: string;
  serialNumber?: string;
  purchaseDate?: Date;
  condition: 'excellent' | 'good' | 'fair' | 'needs-repair';
  location: string;
  available: boolean;
  orderNo: number;
}

export interface BorrowRecord {
  id?: string;
  itemId: string;
  itemName: string;
  userId: string;
  userEmail?: string;
  userName?: string;
  borrowedAt: Date;
  dueDate: Date;
  returnedAt?: Date | null;
  notes?: string;
  isOverdue?: boolean;
  isActive: boolean;
}

@Injectable({
  providedIn: 'root'
})
export class InventoryService {
  private inventoryCollectionName = 'inventory';
  private borrowRecordsCollectionName = 'borrowRecords';
  private firestore = inject(Firestore);

  // Get all inventory items
  getAllInventoryItems(): Observable<InventoryItem[]> {
    const inventoryCollection = collection(this.firestore, this.inventoryCollectionName);
    return collectionData(inventoryCollection, { idField: 'id' }).pipe(
      map(items => items.map(data => {
        const item = data as any;
        return {
          ...item,
          purchaseDate: item.purchaseDate ? item.purchaseDate.toDate() : undefined
        } as InventoryItem;
      }))
    );
  }

  public getBeamer(): Observable<Beamer> {
    const beamerDocRef = doc(this.firestore, this.inventoryCollectionName, 'beamer')
    return docData(beamerDocRef, {idField: 'id'}).pipe(
      map(data => {
        if (!data) {
          throw new Error('Beamer nicht gefunden')
        }
        const beamer = data as any;
        return beamer as Beamer
      })
    )
  }

  // Get single item by ID
  async getItemById(itemId: string): Promise<InventoryItem | null> {
    const docRef = doc(this.firestore, this.inventoryCollectionName, itemId);
    const docSnap = await getDoc(docRef);

    if (docSnap.exists()) {
      const data = docSnap.data();
      return {
        id: docSnap.id,
        ...data,
        purchaseDate: data['purchaseDate'] ? data['purchaseDate'].toDate() : undefined
      } as InventoryItem;
    }

    return null;
  }

  // Add new inventory item
  async addInventoryItem(item: Partial<InventoryItem>): Promise<DocumentReference> {
    const inventoryCollection = collection(this.firestore, this.inventoryCollectionName);

    const processedItem: any = { ...item };

    // Convert Date to Timestamp
    if (item.purchaseDate instanceof Date) {
      processedItem.purchaseDate = Timestamp.fromDate(item.purchaseDate);
    }

    // Set default values
    processedItem.available = true;
    processedItem.orderNo = processedItem.orderNo || 0;

    console.log('Adding new inventory item:', processedItem);

    return addDoc(inventoryCollection, processedItem);
  }

  // Update inventory item
  async updateInventoryItem(itemId: string, updates: Partial<InventoryItem>): Promise<void> {
    const docRef = doc(this.firestore, this.inventoryCollectionName, itemId);

    const processedUpdates: any = { ...updates };
    if (updates.purchaseDate instanceof Date) {
      processedUpdates.purchaseDate = Timestamp.fromDate(updates.purchaseDate);
    }

    return updateDoc(docRef, processedUpdates);
  }

  // Delete inventory item
  async deleteInventoryItem(itemId: string): Promise<void> {
    // First check if item is borrowed
    const item = await this.getItemById(itemId);
    if (!item) {
      throw new Error('Item nicht gefunden');
    }

    if (!item.available) {
      throw new Error('Item ist ausgeliehen und kann nicht gelöscht werden');
    }

    // Delete the item
    const docRef = doc(this.firestore, this.inventoryCollectionName, itemId);
    await deleteDoc(docRef);

    console.log('Item deleted successfully:', itemId);
  }

  // Borrow an item
  async borrowItem(itemId: string, userId: string, userName: string, dueDate: Date, notes?: string): Promise<DocumentReference> {
    console.log('=== BORROWING ITEM START ===');
    console.log('ItemId:', itemId);

    // Check if item is available
    const item = await this.getItemById(itemId);
    if (!item) {
      throw new Error('Item nicht gefunden');
    }
    if (!item.available) {
      throw new Error('Item ist bereits ausgeliehen');
    }

    // Double-check: Look for existing active borrow records
    const existingBorrow = await this.findActiveBorrowRecord(itemId);
    if (existingBorrow) {
      throw new Error('Item ist bereits ausgeliehen');
    }

    // Create borrow record FIRST
    const borrowRecordsRef = collection(this.firestore, this.borrowRecordsCollectionName);
    const borrowRecord = {
      itemId,
      itemName: item.name,
      userId,
      userName,
      borrowedAt: Timestamp.fromDate(new Date()),
      dueDate: Timestamp.fromDate(dueDate),
      returnedAt: null,
      notes: notes || '',
      isOverdue: false,
      isActive: true
    };

    console.log('Creating borrow record:', borrowRecord);
    const borrowDocRef = await addDoc(borrowRecordsRef, borrowRecord);
    console.log('Borrow record created with ID:', borrowDocRef.id);

    // Then mark item as unavailable
    await this.updateInventoryItem(itemId, { available: false });
    console.log('Item marked as unavailable');
    console.log('=== BORROWING ITEM END ===');

    return borrowDocRef;
  }

  // Helper method to find active borrow record
  private async findActiveBorrowRecord(itemId: string): Promise<any | null> {
    const borrowRecordsRef = collection(this.firestore, this.borrowRecordsCollectionName);

    // Einfache Query nur mit itemId
    const q = query(
      borrowRecordsRef,
      where('itemId', '==', itemId)
    );

    const snapshot = await getDocs(q);

    // Filtere client-side nach isActive
    for (const doc of snapshot.docs) {
      const data = doc.data();
      if (data['isActive'] === true && data['returnedAt'] === null) {
        console.log('Found active borrow via client filter:', doc.id);
        return doc;
      }
    }

    console.log('No active borrow record found for item:', itemId);
    return null;
  }

  // Return an item
  async returnItem(itemId: string): Promise<void> {
    console.log('=== RETURNING ITEM START ===');
    console.log('ItemId:', itemId);

    // Find the active borrow record
    const activeBorrowDoc = await this.findActiveBorrowRecord(itemId);

    if (!activeBorrowDoc) {
      // Debug: check what borrow records exist for this item
      const borrowRecordsRef = collection(this.firestore, this.borrowRecordsCollectionName);
      const debugQuery = query(borrowRecordsRef, where('itemId', '==', itemId));
      const debugSnapshot = await getDocs(debugQuery);

      console.log('All borrow records for item:', itemId);
      debugSnapshot.docs.forEach(doc => {
        console.log('Record:', doc.id, doc.data());
      });

      throw new Error(`Keine aktive Ausleihe für dieses Item gefunden. ItemId: ${itemId}`);
    }

    console.log('Found active borrow record:', activeBorrowDoc.id, activeBorrowDoc.data());

    // Update borrow record with return date
    const borrowDocRef = doc(this.firestore, this.borrowRecordsCollectionName, activeBorrowDoc.id);
    await updateDoc(borrowDocRef, {
      returnedAt: Timestamp.fromDate(new Date()),
      isActive: false
    });
    console.log('Borrow record updated with return date');

    // Mark item as available
    await this.updateInventoryItem(itemId, { available: true });
    console.log('Item marked as available');
    console.log('=== RETURNING ITEM END ===');
  }

  // Get current borrower for an item - SIMPLIFIED VERSION
  public getCurrentBorrower(itemId: string): Observable<BorrowRecord | null> {
    const borrowRecordsRef = collection(this.firestore, this.borrowRecordsCollectionName);

    // Einfache Query nur mit itemId - keine composite query!
    const q = query(
      borrowRecordsRef,
      where('itemId', '==', itemId),
      orderBy('borrowedAt', 'desc'),
      limit(5) // Hole die letzten 5 Records
    );

    return collectionData(q, { idField: 'id' }).pipe(
      map(records => {
        console.log(`Checking ${records.length} borrow records for item:`, itemId);

        // Client-side filtering für aktive Records
        const activeRecord = records.find((record: any) =>
          record.isActive === true && record.returnedAt === null
        );

        if (!activeRecord) {
          console.log('No active borrow record found for item:', itemId);
          return null;
        }

        const record = activeRecord as any;
        console.log('Found active borrow record for item:', itemId, record.id);

        return {
          id: record.id,
          itemId: record.itemId,
          itemName: record.itemName,
          userId: record.userId,
          userName: record.userName,
          borrowedAt: record.borrowedAt.toDate(),
          dueDate: record.dueDate.toDate(),
          returnedAt: record.returnedAt ? record.returnedAt.toDate() : null,
          notes: record.notes,
          isOverdue: record.dueDate.toDate() < new Date(),
          isActive: record.isActive
        } as BorrowRecord;
      }),
      shareReplay(1)
    );
  }

  // Public method to force refresh (optional, for manual refresh)
  public forceRefresh(itemId: string): void {
    console.log('Force refresh called for item:', itemId);
    // Mit der vereinfachten Version wird automatisch aktualisiert
  }
}
