import { Component } from '@angular/core';
import { CommonModule } from '@angular/common';
import { Observable } from 'rxjs';
import { animate, style, transition, trigger } from '@angular/animations';
import { Notification, NotificationService } from '../services/notification.service';

/**
 * @Component
 * A UI component responsible for displaying global notification toasts.
 *
 * @description
 * This component subscribes to the `NotificationService` to receive notification
 * data. When a new notification is emitted, it displays a toast message at a
 * fixed position on the screen. The component includes animations for fading
 * in and out, and its appearance is styled based on the notification type
 * (`success`, `error`, or `info`).
 */
@Component({
  selector: 'app-notification',
  standalone: true,
  imports: [CommonModule],
  templateUrl: './notification.html',
  styleUrls: ['./notification.scss'],
  animations: [
    trigger('fadeInOut', [
      transition(':enter', [
        style({ opacity: 0, transform: 'translateY(20px)' }),
        animate('300ms ease-out', style({ opacity: 1, transform: 'translateY(0)' })),
      ]),
      transition(':leave', [
        animate('300ms ease-in', style({ opacity: 0, transform: 'translateY(20px)' }))
      ])
    ])
  ]
})
export class NotificationComponent {
  /**
   * An observable stream of notification objects (or null).
   * The template uses the `async` pipe to subscribe to this stream and render
   * the notification when a value is emitted.
   */
  notification$: Observable<Notification | null>;

  /**
   * The constructor for the NotificationComponent.
   * @param {NotificationService} notificationService The injected service that provides notification state.
   */
  constructor(private notificationService: NotificationService) {
    this.notification$ = this.notificationService.notification$;
  }
}
