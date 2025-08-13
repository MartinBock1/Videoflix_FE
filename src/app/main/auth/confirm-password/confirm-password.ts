import { Component } from '@angular/core';
import { Header } from '../../../shared/header/header';
import { Footer } from '../../../shared/footer/footer';

@Component({
  selector: 'app-confirm-password',
  imports: [Header, Footer],
  templateUrl: './confirm-password.html',
  styleUrl: './confirm-password.scss'
})
export class ConfirmPassword {

}
