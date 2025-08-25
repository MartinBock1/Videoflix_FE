import { Component, Input } from '@angular/core';
import { RouterModule } from '@angular/router';

/**
 * @Component
 * A reusable header component for the application.
 *
 * @description
 * Displays the application logo and a configurable action button. The button's text,
 * link, and icon can be customized via input properties, making the header adaptable
 * for different contexts (e.g., "Log in", "Sign up", or a "Back" arrow).
 */
@Component({
  selector: 'app-header',
  imports: [RouterModule],
  templateUrl: './header.html',
  styleUrl: './header.scss'
})
export class Header {
  /**
   * The router link for the main action button.
   * @default '/auth/login'
   */
  @Input() actionLink: string = '/auth/login';
  /**
   * The text displayed on the action button.
   * This is also used as the alt text if an icon is provided.
   * @default 'Log in'
   */
  @Input() actionText: string = 'Log in';
  /**
   * The optional path to an icon to display on the action button.
   * If a path is provided, the button enters an "icon-mode" and displays
   * the icon instead of text.
   * @default ''
   */
  @Input() actionIcon: string = '';
}
