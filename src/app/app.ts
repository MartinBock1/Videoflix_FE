import { Component, signal } from '@angular/core';
import { RouterOutlet } from '@angular/router';
import { NotificationComponent } from './shared/notification/notification';

/**
 * @Component
 * The root component of the application.
 *
 * @description
 * This component serves as the main entry point and container for the entire application.
 * It includes the `<router-outlet>` to display routed components and the global
 * `<app-notification>` component for displaying toast messages.
 */
@Component({
  selector: 'app-root',
  imports: [RouterOutlet, NotificationComponent],
  templateUrl: './app.html',
  styleUrl: './app.scss'
})
export class App {
  /**
   * The title of the application.
   * Defined as a signal for potential future reactive use.
   * @protected
   */
  protected readonly title = signal('Videoflix_FE');
}
