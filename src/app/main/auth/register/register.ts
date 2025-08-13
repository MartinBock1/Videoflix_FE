import { Component } from '@angular/core';
import { Header } from '../../../shared/header/header';
import { Footer } from '../../../shared/footer/footer';

@Component({
  selector: 'app-register',
  imports: [Header, Footer],
  templateUrl: './register.html',
  styleUrl: './register.scss'
})
export class Register {

}
