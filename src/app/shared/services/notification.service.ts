import { Injectable } from '@angular/core';
import { BehaviorSubject, Observable, timer } from 'rxjs';
import { switchMap, tap } from 'rxjs/operators';

export interface Notification {
  message: string;
  type: 'success' | 'error' | 'info';
}

@Injectable({
  providedIn: 'root'
})
export class NotificationService {
  private notificationSubject = new BehaviorSubject<Notification | null>(null);
  public notification$: Observable<Notification | null> = this.notificationSubject.asObservable();

  constructor() {}


  show(message: string, type: 'success' | 'error' | 'info' = 'info', duration: number = 3000): void {
    const notification: Notification = { message, type };
    this.notificationSubject.next(notification);

    timer(duration).subscribe(() => {
      this.notificationSubject.next(null);
    });
  }
}
