import { Component } from '@angular/core';
import { Header } from '../../shared/header/header';
import { Footer } from '../../shared/footer/footer';

/**
 * @Component
 * A component to display the application's imprint page.
 *
 * @description
 * This is a simple static content page that provides legal information
 * about the site owner. It uses the shared Header and Footer components
 * to maintain a consistent layout.
 */
@Component({
  selector: 'app-imprint',
  imports: [Header, Footer],
  templateUrl: './imprint.html',
  styleUrl: './imprint.scss',
})
export class Imprint {}
