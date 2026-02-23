import { Injectable } from '@angular/core';
import { Observable } from 'rxjs';
import { Functions, httpsCallable } from '@angular/fire/functions';

export interface GoogleCalendarEvent {
  id: string;
  title: string;
  description?: string;
  start: string;
  end: string;
  location?: string;
  allDay: boolean;
}

export interface GoogleCalendarResponse {
  success: boolean;
  events: GoogleCalendarEvent[];
  error?: string;
}

@Injectable({
  providedIn: 'root'
})
export class GoogleCalendarService {

  constructor(private functions: Functions) { }

  public getUpcomingEvents(): Observable<GoogleCalendarEvent[]> {
    const getEvents = httpsCallable<{}, GoogleCalendarResponse>(this.functions, 'getCalendarEvents');

    return new Observable<GoogleCalendarEvent[]>(observer => {
      getEvents({}).then(result => {
        if (result.data.success) {
          observer.next(result.data.events);
          observer.complete();
        } else {
          // Function returned error
          const errorMessage = result.data.error || 'Unbekannter Fehler beim Laden der Kalender-Events';
          observer.error(new Error(errorMessage));
        }
      }).catch(error => {
        console.error('Error fetching calendar events:', error);
        // Firebase Function call failed
        observer.error(new Error(`Kalenderdienst nicht verfügbar: ${error.message || error}`));
      });
    });
  }
}
