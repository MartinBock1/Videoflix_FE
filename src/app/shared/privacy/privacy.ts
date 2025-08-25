import { Component } from '@angular/core';
import { Header } from '../../shared/header/header';
import { Footer } from '../../shared/footer/footer';

/**
 * @Component
 * A component to display the application's privacy policy page.
 *
 * @description
 * This is a simple static content page that provides information about data
 * privacy and usage. It utilizes the shared Header and Footer components for
 * a consistent application-wide layout.
 */
@Component({
  selector: 'app-privacy',
  imports: [Header, Footer],
  templateUrl: './privacy.html',
  styleUrl: './privacy.scss'
})
export class Privacy {

}
