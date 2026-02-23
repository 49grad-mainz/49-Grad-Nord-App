import { Injectable } from '@angular/core';
import { Messaging, getToken } from '@angular/fire/messaging';
import { Auth } from '@angular/fire/auth';
import { doc, Firestore, setDoc } from "@angular/fire/firestore";
import {environment} from "../../../environments/environment";

@Injectable({
  providedIn: 'root'
})
export class PushNotificationService {
  private fcmToken: string | null = null;

  constructor(
    private messaging: Messaging,
    private auth: Auth,
    private firestore: Firestore
  ) {}

  async requestPermission() {
    if (!this.auth.currentUser) {
      throw new Error('User must be authenticated');
    }

    try {
      const permission = await Notification.requestPermission();
      if (permission !== 'granted') {
        return null;
      }

      const registration = await navigator.serviceWorker.getRegistration();
      if (!registration) {
        throw new Error('Service worker registration not found');
      }

      this.fcmToken = await getToken(this.messaging, {
        vapidKey: environment.vapidKey,
        serviceWorkerRegistration: registration
      });

      if (this.fcmToken) {
        await this.saveToken(this.fcmToken);
      }

      return this.fcmToken;
    } catch (error) {
      console.error('Error in requestPermission():', error);
      throw error;
    }
  }

  private async saveToken(token: string) {
    const userId = this.auth.currentUser?.uid;
    if (!userId) return;

    await setDoc(doc(this.firestore, 'fcmTokens', token), {
      userId,
      token,
      deviceId: this.getDeviceId(),
      lastUpdated: new Date(),
      platform: 'web',
      userAgent: navigator.userAgent
    });
  }

  private getDeviceId(): string {
    let deviceId = localStorage.getItem('fcm_device_id');
    if (!deviceId) {
      deviceId = 'web_' + Math.random().toString(36).substring(2);
      localStorage.setItem('fcm_device_id', deviceId);
    }
    return deviceId;
  }
}
