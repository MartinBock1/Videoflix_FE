import { Component } from '@angular/core';
import { Header } from '../../../shared/header/header';
import { Footer } from '../../../shared/footer/footer';

@Component({
  selector: 'app-login',
  imports: [Header, Footer],
  templateUrl: './login.html',
  styleUrl: './login.scss'
})
export class Login {

}
