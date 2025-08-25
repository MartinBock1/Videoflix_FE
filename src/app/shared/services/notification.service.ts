import { Injectable } from '@angular/core';
import { BehaviorSubject, Observable, timer } from 'rxjs';

/**
 * Defines the structure for a notification object.
 * This interface is used to ensure type safety for all notifications
 * managed by the `NotificationService`.
 */
export interface Notification {
  message: string;
  type: 'success' | 'error' | 'info';
}

/**
 * @Injectable
 * Provided in the root of the application, making it a singleton service.
 *
 * @description
 * Manages the state for app-wide, temporary notifications (often called "toasts").
 * It provides a simple way for any part of the application to trigger a notification
 * that will be displayed to the user and then automatically disappear after a
 * specified duration.
 */
@Injectable({
  providedIn: 'root'
})
export class NotificationService {
  /**
   * @private
   * The private BehaviorSubject that holds the current notification state.
   * It can hold a `Notification` object or `null` if no notification is active.
   */
  private notificationSubject = new BehaviorSubject<Notification | null>(null);
  /**
   * @public
   * The public observable stream that components can subscribe to.
   * It emits the current `Notification` object or `null`, allowing UI components
   * to reactively show or hide the notification toast.
   */
  public notification$: Observable<Notification | null> = this.notificationSubject.asObservable();

  /**
   * Constructs the NotificationService.
   */
  constructor() {}

  /**
   * Displays a notification message to the user.
   *
   * This method pushes a new notification object to the `notificationSubject`,
   * making it visible to any subscribed components. It also sets up an RxJS `timer`
   * to automatically clear the notification (by pushing `null`) after the specified
   * duration has elapsed.
   *
   * @param {string} message The text to be displayed in the notification.
   * @param {'success' | 'error' | 'info'} [type='info'] The type of notification, which determines its visual style. Defaults to 'info'.
   * @param {number} [duration=3000] The duration in milliseconds for which the notification will be visible. Defaults to 3000ms.
   * @returns {void} This method does not return a value.
   */
  show(message: string, type: 'success' | 'error' | 'info' = 'info', duration: number = 3000): void {
    const notification: Notification = { message, type };
    this.notificationSubject.next(notification);

    // After the specified duration, emit null to hide the notification
    timer(duration).subscribe(() => {
      this.notificationSubject.next(null);
    });
  }
}
