import { Component } from '@angular/core';
import { RouterModule } from '@angular/router';

/**
 * @Component
 * A reusable footer component for the application.
 *
 * @description
 * Displays a standard footer with navigation links to static pages like
 * the Privacy Policy and Imprint. It is designed to be placed at the bottom
 of the main layout.
 */
@Component({
  selector: 'app-footer',
  imports: [RouterModule],
  templateUrl: './footer.html',
  styleUrl: './footer.scss'
})
export class Footer {

}
