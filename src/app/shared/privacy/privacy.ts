import { Component } from '@angular/core';
import { Header } from '../../shared/header/header';
import { Footer } from '../../shared/footer/footer';

@Component({
  selector: 'app-privacy',
  imports: [Header, Footer],
  templateUrl: './privacy.html',
  styleUrl: './privacy.scss'
})
export class Privacy {

}
