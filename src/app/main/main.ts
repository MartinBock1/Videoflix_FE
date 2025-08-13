import { Component } from '@angular/core';
import { Header } from '../shared/header/header';
import { Footer } from '../shared/footer/footer';

@Component({
  selector: 'app-main',
  imports: [Header, Footer],
  templateUrl: './main.html',
  styleUrl: './main.scss'
})
export class Main {

}
