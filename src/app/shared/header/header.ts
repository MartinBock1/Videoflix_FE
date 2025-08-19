import { Component, Input } from '@angular/core';
import { RouterModule } from '@angular/router';

@Component({
  selector: 'app-header',
  imports: [RouterModule],
  templateUrl: './header.html',
  styleUrl: './header.scss'
})
export class Header {
  @Input() actionLink: string = '/auth/login';
  @Input() actionText: string = 'Log in';
  @Input() actionIcon: string = ''; // Neuer Input für Icon-Pfad
}
